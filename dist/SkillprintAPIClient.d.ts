import { ParameterInfo, ParameterUpdateResult } from './SkillprintTypes.js';
export declare class SkillprintAPIClient {
    private baseUrl;
    private partnerApiKey;
    private userToken;
    private logger;
    private static readonly START_SESSION_ENDPOINT;
    private static readonly UPLOAD_SCREENSHOTS_ENDPOINT;
    private static readonly POLL_RESULTS_ENDPOINT;
    private static readonly CREATE_USER_ENDPOINT;
    private static readonly GET_USER_TOKEN_ENDPOINT;
    private static readonly MAX_UPLOAD_RETRIES;
    private static readonly RETRY_BASE_DELAY_MS;
    constructor(baseUrl: string, partnerApiKey: string, logger?: (msg: string, level: 'Info' | 'Warning' | 'Error') => void);
    private log;
    startSession(sessionId: string, targetMood: string, customPlayerId: string | null, gameName: string, gameParameters: ParameterInfo[]): Promise<boolean>;
    postScreenshots(sessionId: string, screenshots: (Blob | ArrayBuffer)[], isLastChunk: boolean): Promise<boolean>;
    pollParameterResults(sessionId: string): Promise<ParameterUpdateResult[]>;
    getParsedValue(update: ParameterUpdateResult): any;
    createOrGetUserToken(customPlayerId: string): Promise<string | null>;
    private createUser;
    private getUserToken;
}
