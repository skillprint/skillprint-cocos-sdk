import { ParameterInfo, ParameterUpdateResult } from './SkillprintTypes.js';
export declare class SkillprintAPIClient {
    private baseUrl;
    private partnerApiKey;
    private userToken;
    private logger;
    private static readonly START_SESSION_ENDPOINT;
    private static readonly UPLOAD_SCREENSHOTS_ENDPOINT;
    private static readonly POLL_RESULTS_ENDPOINT;
    private static readonly ADD_TELEMETRY_ENDPOINT;
    private static readonly CREATE_USER_ENDPOINT;
    private static readonly GET_USER_TOKEN_ENDPOINT;
    private static readonly MAX_UPLOAD_RETRIES;
    private static readonly RETRY_BASE_DELAY_MS;
    constructor(baseUrl: string, partnerApiKey: string, logger?: (msg: string, level: 'Info' | 'Warning' | 'Error') => void);
    private log;
    startSession(sessionId: string, targetMood: string, customPlayerId: string | null, gameName: string, gameParameters: ParameterInfo[]): Promise<boolean>;
    postScreenshots(sessionId: string, screenshots: (Blob | ArrayBuffer)[], isLastChunk: boolean): Promise<boolean>;
    pollParameterResults(sessionId: string): Promise<ParameterUpdateResult[]>;
    /**
     * Appends a discrete telemetry event to an active session. Mirrors
     * skillprint-js-sdk's logTelemetryEvent exactly: sessionId/gameSlug go
     * in the query string (not the body), and `event` is wrapped in an
     * outer {"event": ...} envelope -- confirmed against marketplace's
     * games/tests/test_sessions.py, which posts
     * {"event": {"a": 1, "timestamp": ...}} and asserts session.telemetry
     * becomes [{"a": 1, "timestamp": ...}]. Sending `event` unwrapped would
     * store the bare event name string as the whole telemetry entry.
     */
    logTelemetryEvent(sessionId: string, gameSlug: string, event: Record<string, any>): Promise<boolean>;
    getParsedValue(update: ParameterUpdateResult): any;
    createOrGetUserToken(customPlayerId: string): Promise<string | null>;
    private createUser;
    private getUserToken;
}
