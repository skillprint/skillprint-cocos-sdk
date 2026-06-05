import { _decorator, Component, director, Camera, sys, Enum } from 'cc';
import { SkillprintConfig, ParameterDefinition, ParameterType, ParameterInfo, ParameterUpdateResult, Mood, ApiEnvironment } from './SkillprintTypes';
import { SkillprintAPIClient } from './SkillprintAPIClient';
import { ScreenshotUtility } from './ScreenshotUtility';

const { ccclass, property } = _decorator;

Enum(ApiEnvironment);

@ccclass('SkillprintManager')
export class SkillprintManager extends Component {
    private static _instance: SkillprintManager | null = null;

    public static get instance(): SkillprintManager {
        if (!this._instance) {
            // Log warning, developers should ensure a node has the manager component,
            // or we will instantiate it programmatically
            console.warn('[SkillprintSDK] SkillprintManager instance is requested but not initialized yet.');
        }
        return this._instance!;
    }

    private config: SkillprintConfig | null = null;
    private currentSessionId: string | null = null;
    private isSessionActive = false;
    private apiClient: SkillprintAPIClient | null = null;
    private screenshotUtility: ScreenshotUtility | null = null;

    private screenshotQueue: (Blob | ArrayBuffer)[] = [];
    private registeredParameters = new Map<string, ParameterDefinition>();

    // References to the scheduler callbacks
    private captureCallback: Function | null = null;
    private postCallback: Function | null = null;
    private pollCallback: Function | null = null;

    onLoad() {
        if (SkillprintManager._instance === null) {
            SkillprintManager._instance = this;
            director.addPersistRootNode(this.node); // Keep SDK persistent across scenes
        } else if (SkillprintManager._instance !== this) {
            this.log('Another instance of SkillprintManager already exists. Destroying this one.', 'Warning');
            this.node.destroy();
        }
    }

    public init(config: SkillprintConfig) {
        this.config = config;

        const activeApiKey = this.config.targetEnvironment === 'Production'
            ? this.config.productionPartnerApiKey
            : (this.config.stagingPartnerApiKey || this.config.productionPartnerApiKey);

        const activeBaseUrl = this.config.targetEnvironment === 'Production'
            ? (this.config.productionApiBaseUrl || 'https://api.skillprint.co')
            : (this.config.stagingApiBaseUrl || 'https://api.staging.skillprint.co');

        if (!activeApiKey) {
            this.log(`Partner API Key for ${this.config.targetEnvironment} environment is not set in config. SDK will not function.`, 'Error');
            this.enabled = false;
            return;
        }

        this.apiClient = new SkillprintAPIClient(
            activeBaseUrl,
            activeApiKey,
            (msg, lvl) => this.log(msg, lvl)
        );

        this.screenshotUtility = new ScreenshotUtility(
            (msg, lvl) => this.log(msg, lvl)
        );

        // Pre-register parameters defined in config
        if (this.config.gameParameters) {
            this.config.gameParameters.forEach((param) => {
                if (!this.registeredParameters.has(param.parameterName)) {
                    this.registeredParameters.set(param.parameterName, param);
                } else {
                    this.log(`Duplicate parameter name found in config: ${param.parameterName}. Using first occurrence.`, 'Warning');
                }
            });
        }

        this.log(`Skillprint SDK Initialized for ${this.config.targetEnvironment} environment (URL: ${activeBaseUrl}).`);
    }

    public registerParameterModifier<T>(
        parameterName: string,
        updateAction: (value: T) => void,
        description?: string,
        howItWorks?: string
    ) {
        let paramDef = this.registeredParameters.get(parameterName);

        if (!paramDef) {
            // Auto-create definition if it doesn't exist yet
            let inferredType = ParameterType.Float;
            let defaultMin = 0;
            let defaultMax = 1;

            paramDef = {
                parameterName: parameterName,
                description: description || `Game parameter '${parameterName}' (auto-detected)`,
                howSDKChangesIt: howItWorks || '',
                type: inferredType,
                minValue: defaultMin,
                maxValue: defaultMax
            };

            this.registeredParameters.set(parameterName, paramDef);
            this.log(`Parameter '${parameterName}' was not in config. Auto-created definition. Consider defining it in the config file.`, 'Warning');
        }

        paramDef.UpdateAction = (value: any) => {
            updateAction(value as T);
        };

        this.log(`Parameter '${parameterName}' modifier registered successfully.`);
    }

    public async startGameSession(targetMood: string, customPlayerId: string | null = null) {
        if (this.isSessionActive) {
            this.log('Session already active. Call stopGameSession first.', 'Warning');
            return;
        }

        if (!this.config || !this.apiClient) {
            this.log('SDK not configured properly. Cannot start session.', 'Error');
            return;
        }

        // Validate mood parameter
        const validMoods = ['relax', 'focus', 'creativity', 'collaborate', 'grit', 'joy', 'curiosity', 'empathy', 'awe'];
        if (validMoods.indexOf(targetMood) === -1) {
            this.log(`Invalid targetMood: '${targetMood}'. Valid moods are: ${validMoods.join(', ')}`, 'Error');
            return;
        }

        this.currentSessionId = this.generateUUID();
        this.isSessionActive = true;
        this.log(`Starting game session for ${this.config.targetEnvironment} environment.`);

        // Map registered parameters to API format
        const parameterInfos: ParameterInfo[] = Array.from(this.registeredParameters.values()).map((p) => {
            return {
                name: p.parameterName,
                type: p.type.toString(),
                description: p.description || '',
                adjustmentGuide: p.howSDKChangesIt || null,
                minValue: (p.type === ParameterType.Float || p.type === ParameterType.Integer) && p.minValue !== undefined ? p.minValue.toString() : null,
                maxValue: (p.type === ParameterType.Float || p.type === ParameterType.Integer) && p.maxValue !== undefined ? p.maxValue.toString() : null
            };
        });

        this.log(`Sending ${parameterInfos.length} game parameter(s) to API: ` + parameterInfos.map(p => p.name).join(', '), 'Warning');

        const success = await this.apiClient.startSession(
            this.currentSessionId,
            targetMood,
            customPlayerId,
            this.config.gameName,
            parameterInfos
        );

        if (success) {
            this.log(`Skillprint session started: ${this.currentSessionId}`);
            this.startLoops();
        } else {
            this.log('Failed to start Skillprint session', 'Error');
            this.isSessionActive = false;
            this.currentSessionId = null;
        }
    }

    public async stopGameSession() {
        if (!this.isSessionActive || !this.currentSessionId || !this.apiClient) {
            this.log('No active session to stop.', 'Warning');
            return;
        }

        const closingSessionId = this.currentSessionId;
        this.log(`Stopping Skillprint session: ${closingSessionId}`);
        this.isSessionActive = false;

        this.stopLoops();

        // Copy remaining screenshots and upload with isLastChunk = true
        const finalBatch = [...this.screenshotQueue];
        this.screenshotQueue = [];

        try {
            await this.apiClient.postScreenshots(closingSessionId, finalBatch, true);
            this.log('Session close signal sent successfully.');
        } catch (err: any) {
            this.log(`Failed to send session close signal: ${err.message || err}`, 'Error');
        }

        this.currentSessionId = null;
        this.log('Skillprint session stopped.');
    }

    private startLoops() {
        const intervalCapture = this.config?.screenshotIntervalSeconds || 2.0;
        const intervalPost = this.config?.screenshotPostIntervalSeconds || 5.0;
        const intervalPoll = this.config?.pollResultsIntervalSeconds || 5.0;

        // Capture loop
        this.captureCallback = async () => {
            if (!this.isSessionActive || !this.screenshotUtility) return;
            const camera = this.findActiveCamera();
            if (!camera) {
                this.log('Active camera not found in scene for screenshot capture', 'Warning');
                return;
            }

            const imgData = await this.screenshotUtility.captureScreenshot(
                camera,
                this.config?.screenshotMaxWidth || 960,
                this.config?.screenshotJpegQuality || 60
            );

            if (imgData) {
                if (this.screenshotQueue.length < 50) {
                    this.screenshotQueue.push(imgData);
                    this.log(`Screenshot captured. Queue size: ${this.screenshotQueue.length}`);
                } else {
                    this.log('Screenshot queue full. Discarding new screenshot.', 'Warning');
                }
            }
        };
        this.schedule(this.captureCallback, intervalCapture);

        // Post loop
        this.postCallback = async () => {
            if (!this.isSessionActive || !this.apiClient || this.screenshotQueue.length === 0) return;
            
            // Determine batch size (based on cadence ratio)
            const batchSize = Math.max(1, Math.ceil(intervalPost / intervalCapture));
            const batchToPost = this.screenshotQueue.splice(0, batchSize * 2);

            this.log(`Posting ${batchToPost.length} screenshots...`);
            const ok = await this.apiClient.postScreenshots(this.currentSessionId!, batchToPost, false);
            if (ok) {
                this.log(`Successfully posted ${batchToPost.length} screenshots.`);
            } else {
                this.log('Failed to post screenshots batch.', 'Error');
            }
        };
        this.schedule(this.postCallback, intervalPost);

        // Poll loop
        this.pollCallback = async () => {
            if (!this.isSessionActive || !this.apiClient) return;

            const updates = await this.apiClient.pollParameterResults(this.currentSessionId!);
            if (updates && updates.length > 0) {
                this.log(`Received ${updates.length} parameter updates from API.`);
                this.applyParameterUpdates(updates);
            }
        };
        this.schedule(this.pollCallback, intervalPoll);
    }

    private stopLoops() {
        if (this.captureCallback) {
            this.unschedule(this.captureCallback);
            this.captureCallback = null;
        }
        if (this.postCallback) {
            this.unschedule(this.postCallback);
            this.postCallback = null;
        }
        if (this.pollCallback) {
            this.unschedule(this.pollCallback);
            this.pollCallback = null;
        }
    }

    private applyParameterUpdates(updates: ParameterUpdateResult[]) {
        if (!this.apiClient) return;

        updates.forEach((update) => {
            const rawValue = this.apiClient!.getParsedValue(update);
            this.log(`[DEBUG] Received update - Name: ${update.parameterName}, RawValue: '${rawValue}'`);

            if (rawValue === null || rawValue === undefined) {
                this.log(`Parameter '${update.parameterName}' received null/undefined value from API. Skipping.`, 'Warning');
                return;
            }

            const paramDef = this.registeredParameters.get(update.parameterName);
            if (!paramDef) {
                this.log(`Received update for unknown parameter: ${update.parameterName}. Skipping.`, 'Warning');
                return;
            }

            if (!paramDef.UpdateAction) {
                this.log(`Parameter '${update.parameterName}' received from API but has no registered modifier callback. Skipping.`, 'Warning');
                return;
            }

            const convertedValue = this.convertValue(rawValue, paramDef);
            if (convertedValue !== null && this.isValidValue(convertedValue, paramDef)) {
                try {
                    this.log(`Applying update: ${paramDef.parameterName} = ${convertedValue} (Type: ${paramDef.type})`);
                    paramDef.UpdateAction(convertedValue);
                } catch (e: any) {
                    this.log(`Error applying update for ${paramDef.parameterName}: ${e.message || e}`, 'Error');
                }
            } else {
                this.log(`Invalid value or type conversion failed for parameter ${paramDef.parameterName}: '${rawValue}'`, 'Warning');
            }
        });
    }

    private convertValue(rawValue: any, paramDef: ParameterDefinition): any {
        try {
            switch (paramDef.type) {
                case ParameterType.Float:
                    const fVal = parseFloat(rawValue);
                    return isNaN(fVal) ? null : fVal;
                case ParameterType.Integer:
                    const iVal = parseInt(rawValue, 10);
                    return isNaN(iVal) ? null : iVal;
                case ParameterType.Boolean:
                    if (typeof rawValue === 'boolean') return rawValue;
                    if (typeof rawValue === 'string') {
                        return rawValue.toLowerCase() === 'true' || rawValue === '1';
                    }
                    if (typeof rawValue === 'number') {
                        return rawValue !== 0;
                    }
                    return null;
                default:
                    return rawValue;
            }
        } catch (err: any) {
            this.log(`Conversion failed: ${err.message || err}`, 'Error');
            return null;
        }
    }

    private isValidValue(value: any, paramDef: ParameterDefinition): boolean {
        switch (paramDef.type) {
            case ParameterType.Float:
            case ParameterType.Integer:
                const num = value as number;
                if (paramDef.minValue !== undefined && num < paramDef.minValue) return false;
                if (paramDef.maxValue !== undefined && num > paramDef.maxValue) return false;
                return true;
            case ParameterType.Boolean:
                return typeof value === 'boolean';
        }
        return false;
    }

    private findActiveCamera(): Camera | null {
        // Query scene for active camera components
        const rootNodes = director.getScene()?.children;
        if (!rootNodes) return null;

        for (let i = 0; i < rootNodes.length; i++) {
            const camera = rootNodes[i].getComponentInChildren(Camera);
            if (camera && camera.node.active && camera.enabled) {
                return camera;
            }
        }
        return null;
    }

    // Web URL parameters methods

    public startGameSessionFromUrl(fallbackMood = 'relax', fallbackPlayerId: string | null = null) {
        this.startGameSessionWithOverrides(fallbackMood, fallbackPlayerId);
    }

    public startGameSessionWithOverrides(
        fallbackMood = 'relax',
        fallbackPlayerId: string | null = null,
        overrideMood: string | null = null,
        overridePlayerId: string | null = null
    ) {
        let targetMood = overrideMood;
        let playerId = overridePlayerId;

        // If not forced, try browser query string
        if (!targetMood || !playerId) {
            const urlParams = this.getSkillprintUrlParameters();

            if (!targetMood) {
                targetMood = urlParams.targetMood || fallbackMood;
            }
            if (!playerId) {
                playerId = urlParams.playerId || fallbackPlayerId;
            }
        }

        // Validate target mood
        if (!targetMood) {
            this.log("No target mood specified and no fallback provided. Using 'focus' as default.", 'Warning');
            targetMood = 'focus';
        }

        const validMoods = ['relax', 'focus', 'creativity', 'collaborate', 'grit', 'joy', 'curiosity', 'empathy', 'awe'];
        if (validMoods.indexOf(targetMood) === -1) {
            this.log(`Invalid mood '${targetMood}'. Valid moods: ${validMoods.join(', ')}. Using 'focus' as fallback.`, 'Warning');
            targetMood = 'focus';
        }

        this.log(`Starting Skillprint session with Mood: '${targetMood}', Player ID: '${playerId || 'none'}'`);
        this.startGameSession(targetMood, playerId);
    }

    public getUrlParametersInfo(): string {
        if (!sys.isBrowser) {
            return 'URL parameters not supported on this platform (not Browser)';
        }

        const urlParams = this.getSkillprintUrlParameters();
        return `Current URL: ${window.location.href}\nMood Parameter: '${urlParams.targetMood || 'not found'}'\nPlayer ID Parameter: '${urlParams.playerId || 'not found'}'`;
    }

    private getSkillprintUrlParameters(): { targetMood: string | null, playerId: string | null } {
        if (!sys.isBrowser) {
            return { targetMood: null, playerId: null };
        }

        const searchParams = new URLSearchParams(window.location.search);
        const mood = searchParams.get('mood') || searchParams.get('targetMood');
        const playerId = searchParams.get('playerId') || searchParams.get('player_id') || searchParams.get('userId');

        // Store persistent storage updates
        if (mood) sys.localStorage.setItem('SkillprintMood', mood);
        if (playerId) sys.localStorage.setItem('SkillprintPlayerId', playerId);

        return {
            targetMood: mood || sys.localStorage.getItem('SkillprintMood'),
            playerId: playerId || sys.localStorage.getItem('SkillprintPlayerId')
        };
    }

    // UUID Generator helper
    private generateUUID(): string {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    // Centralized Logging
    public log(msg: string, level: 'Info' | 'Warning' | 'Error' = 'Info') {
        if (this.config && !this.config.enableDebugLogging && level === 'Info') {
            return;
        }

        const formatted = `[SkillprintSDK] ${msg}`;
        switch (level) {
            case 'Info':
                console.log(formatted);
                break;
            case 'Warning':
                console.warn(formatted);
                break;
            case 'Error':
                console.error(formatted);
                break;
        }
    }

    public getConfig(): SkillprintConfig | null {
        return this.config;
    }

    onDestroy() {
        if (this.isSessionActive) {
            this.stopGameSession();
        }
        if (SkillprintManager._instance === this) {
            SkillprintManager._instance = null;
        }
    }
}
