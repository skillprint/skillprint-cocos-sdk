export class SkillprintAPIClient {
    constructor(baseUrl, partnerApiKey, logger) {
        this.userToken = null;
        this.logger = null;
        this.baseUrl = baseUrl.replace(/\/+$/, '');
        this.partnerApiKey = partnerApiKey;
        if (logger) {
            this.logger = logger;
        }
    }
    log(msg, level = 'Info') {
        if (this.logger) {
            this.logger(msg, level);
        }
        else {
            const prefix = `[SkillprintAPIClient] [${level}]`;
            if (level === 'Error') {
                console.error(`${prefix} ${msg}`);
            }
            else if (level === 'Warning') {
                console.warn(`${prefix} ${msg}`);
            }
            else {
                console.log(`${prefix} ${msg}`);
            }
        }
    }
    async startSession(sessionId, targetMood, customPlayerId, gameName, gameParameters) {
        const url = `${this.baseUrl}${SkillprintAPIClient.START_SESSION_ENDPOINT}`;
        this.log(`Starting session: POST ${url}`, 'Info');
        this.log(`Starting session: MOOD ${targetMood}`, 'Warning');
        // Provision/retrieve user token if customPlayerId is provided
        if (customPlayerId) {
            try {
                this.userToken = await this.createOrGetUserToken(customPlayerId);
                if (this.userToken) {
                    this.log(`User token obtained successfully for player: ${customPlayerId}`, 'Info');
                }
                else {
                    this.log(`Could not retrieve user token for player: ${customPlayerId}. Continuing without token.`, 'Warning');
                }
            }
            catch (err) {
                this.log(`Error obtaining user token: ${err.message || err}. Continuing without token.`, 'Warning');
            }
        }
        const requestData = {
            sessionId: sessionId,
            game: gameName,
            targetMood: targetMood,
            gameParameters: gameParameters
        };
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Api-Key ${this.partnerApiKey}`
        };
        if (this.userToken) {
            headers['X-Auth-Token'] = `Token ${this.userToken}`;
        }
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(requestData)
            });
            const text = await response.text();
            if (response.ok) {
                this.log(`StartSession successful. Response: ${text}`, 'Info');
                return true;
            }
            else {
                this.log(`StartSession Error: ${response.statusText}. Response: ${text}`, 'Error');
                return false;
            }
        }
        catch (err) {
            this.log(`StartSession Network Error: ${err.message || err}`, 'Error');
            return false;
        }
    }
    async postScreenshots(sessionId, screenshots, isLastChunk) {
        const endpoint = SkillprintAPIClient.UPLOAD_SCREENSHOTS_ENDPOINT.replace('{sessionId}', sessionId);
        const url = `${this.baseUrl}${endpoint}`;
        this.log(`Posting ${screenshots.length} screenshots (isLastChunk: ${isLastChunk}): POST ${url}`, 'Info');
        if (screenshots.length === 0 && !isLastChunk) {
            this.log(`No screenshots provided, and isLastChunk is false. Skipping.`, 'Warning');
            return false;
        }
        let attempt = 0;
        let succeeded = false;
        let lastError = '';
        while (attempt <= SkillprintAPIClient.MAX_UPLOAD_RETRIES && !succeeded) {
            if (attempt > 0) {
                const delay = SkillprintAPIClient.RETRY_BASE_DELAY_MS * Math.pow(2, attempt - 1);
                this.log(`Retrying screenshot upload (attempt ${attempt + 1}/${SkillprintAPIClient.MAX_UPLOAD_RETRIES + 1}) after ${delay}ms...`, 'Warning');
                await new Promise((resolve) => setTimeout(resolve, delay));
            }
            try {
                const formData = new FormData();
                formData.append('is_last_chunk', isLastChunk.toString().toLowerCase());
                screenshots.forEach((screenshot, i) => {
                    const blob = screenshot instanceof ArrayBuffer ? new Blob([screenshot], { type: 'image/jpeg' }) : screenshot;
                    formData.append(`screenshot${i}`, blob, `screenshot_${i}.jpg`);
                });
                const headers = {
                    'Authorization': `Api-Key ${this.partnerApiKey}`
                };
                if (this.userToken) {
                    headers['X-Auth-Token'] = `Token ${this.userToken}`;
                }
                // Note: Do not set Content-Type header when sending FormData.
                // The browser will automatically set the correct multipart/form-data boundary.
                const response = await fetch(url, {
                    method: 'POST',
                    headers: headers,
                    body: formData
                });
                const text = await response.text();
                if (response.ok) {
                    this.log(`PostScreenshots successful. Response: ${text}`, 'Info');
                    succeeded = true;
                }
                else {
                    lastError = `Status: ${response.statusText} | Response: ${text}`;
                    this.log(`PostScreenshots Error (attempt ${attempt + 1}): ${lastError}`, 'Error');
                }
            }
            catch (err) {
                lastError = err.message || String(err);
                this.log(`PostScreenshots Network Error (attempt ${attempt + 1}): ${lastError}`, 'Error');
            }
            attempt++;
        }
        if (!succeeded) {
            this.log(`PostScreenshots failed after ${SkillprintAPIClient.MAX_UPLOAD_RETRIES + 1} attempts. Last error: ${lastError}`, 'Error');
        }
        return succeeded;
    }
    async pollParameterResults(sessionId) {
        const endpoint = SkillprintAPIClient.POLL_RESULTS_ENDPOINT.replace('{sessionId}', sessionId);
        const url = `${this.baseUrl}${endpoint}`;
        this.log(`Polling results: GET ${url}`, 'Info');
        const headers = {
            'Authorization': `Api-Key ${this.partnerApiKey}`,
            'Accept': 'application/json'
        };
        if (this.userToken) {
            headers['X-Auth-Token'] = `Token ${this.userToken}`;
        }
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: headers
            });
            const text = await response.text();
            if (response.ok) {
                this.log(`PollResults successful. Response: ${text}`, 'Info');
                let data;
                try {
                    data = JSON.parse(text);
                }
                catch (jsonErr) {
                    // Try parsing as array directly if it was wrapped or malformed
                    if (text.trim().startsWith('[')) {
                        data = { parameterUpdates: JSON.parse(text) };
                    }
                    else {
                        throw jsonErr;
                    }
                }
                let updates = [];
                if (data && Array.isArray(data.parameterUpdates)) {
                    updates = data.parameterUpdates;
                }
                else if (Array.isArray(data)) {
                    updates = data;
                }
                // Map updates to extract the parsed values
                updates.forEach((update) => {
                    this.log(`Parameter Update: ${update.parameterName} = ${this.getParsedValue(update)}`, 'Info');
                });
                return updates;
            }
            else {
                this.log(`PollResults Error: ${response.statusText}. Response: ${text}`, 'Error');
                return [];
            }
        }
        catch (err) {
            this.log(`PollResults Error: ${err.message || err}`, 'Error');
            return [];
        }
    }
    getParsedValue(update) {
        // Retrieve the newValue or find the key with the parameterName (for legacy or alternative responses)
        if (update.newValue !== undefined && update.newValue !== null) {
            return update.newValue;
        }
        if (update.parameterName && update[update.parameterName] !== undefined) {
            return update[update.parameterName];
        }
        return null;
    }
    async createOrGetUserToken(customPlayerId) {
        if (!customPlayerId)
            return null;
        // Try getting token first
        let token = await this.getUserToken(customPlayerId);
        if (token)
            return token;
        // User doesn't exist, create user
        const created = await this.createUser(customPlayerId);
        if (created) {
            // Retrieve token again after creation
            token = await this.getUserToken(customPlayerId);
            return token;
        }
        return null;
    }
    async createUser(internalId) {
        const url = `${this.baseUrl}${SkillprintAPIClient.CREATE_USER_ENDPOINT}`;
        this.log(`Creating user: POST ${url} with internalId: ${internalId}`, 'Info');
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Api-Key ${this.partnerApiKey}`
                },
                body: JSON.stringify({ internalId: internalId })
            });
            const text = await response.text();
            if (response.ok) {
                this.log(`CreateUser successful. Response: ${text}`, 'Info');
                return true;
            }
            else {
                this.log(`CreateUser Error: ${response.statusText}. Response: ${text}`, 'Error');
                return false;
            }
        }
        catch (err) {
            this.log(`CreateUser Network Error: ${err.message || err}`, 'Error');
            return false;
        }
    }
    async getUserToken(internalId) {
        const url = `${this.baseUrl}${SkillprintAPIClient.GET_USER_TOKEN_ENDPOINT}`;
        this.log(`Getting user token: POST ${url} with internalId: ${internalId}`, 'Info');
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Api-Key ${this.partnerApiKey}`
                },
                body: JSON.stringify({ internalId: internalId })
            });
            const text = await response.text();
            if (response.ok) {
                this.log(`GetUserToken successful. Response: ${text}`, 'Info');
                const data = JSON.parse(text);
                return data.token || null;
            }
            else {
                this.log(`GetUserToken Error: ${response.statusText}. Response: ${text}`, 'Error');
                return null;
            }
        }
        catch (err) {
            this.log(`GetUserToken Network Error: ${err.message || err}`, 'Error');
            return null;
        }
    }
}
// Endpoints
SkillprintAPIClient.START_SESSION_ENDPOINT = '/games/api/sessions/';
SkillprintAPIClient.UPLOAD_SCREENSHOTS_ENDPOINT = '/games/api/record-session/{sessionId}/';
SkillprintAPIClient.POLL_RESULTS_ENDPOINT = '/games/api/sessions/{sessionId}/';
SkillprintAPIClient.CREATE_USER_ENDPOINT = '/partners/api/users/add/';
SkillprintAPIClient.GET_USER_TOKEN_ENDPOINT = '/partners/api/users/auth/token/';
// Retry settings
SkillprintAPIClient.MAX_UPLOAD_RETRIES = 2;
SkillprintAPIClient.RETRY_BASE_DELAY_MS = 1000;
