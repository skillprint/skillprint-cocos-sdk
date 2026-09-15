export declare enum ApiEnvironment {
    Production = "Production",
    Staging = "Staging"
}
export declare enum ParameterType {
    Float = "Float",
    Integer = "Integer",
    Boolean = "Boolean"
}
export declare enum Mood {
    relax = "relax",
    focus = "focus",
    creativity = "creativity",
    collaborate = "collaborate",
    grit = "grit",
    joy = "joy",
    curiosity = "curiosity",
    empathy = "empathy",
    awe = "awe"
}
/**
 * Fixed discrete-telemetry event vocabulary, matching skillprint-js-sdk's
 * GameEvent enum (src/constants.ts) so events logged with it are read the
 * same way by the backend's adaptation scoring regardless of platform.
 * logEvent also accepts a plain string for a game-specific custom event
 * name outside this fixed set -- see SkillprintManager.logEvent.
 *
 * SOURCE OF TRUTH (breadcrumb for whoever changes this next): this list is
 * the union of GameSchema.POSITIVE_EVENTS and NEGATIVE_EVENTS in
 * marketplace's api_backend/games/models.py -- that's what actually
 * decides how each event reads as a scoring signal. If you add or remove
 * a value here, update those two lists (and skillprint-js-sdk's and
 * adaptive-unity-sdk's copies of this same enum) in the same change;
 * nothing enforces the three staying in sync automatically.
 *
 * marketplace also has a *different*, broader constant,
 * GameSchema.UNIVERSAL_TELEMETRY_EVENTS (added independently, later) --
 * it additionally includes GAME_START/GAME_END/GAME_PAUSE/GAME_RESUME/
 * MATCH/UNMATCH, none of which are here, and is used for session/
 * analytics classification (Layer 1 vs. Layer 2 telemetry), not scoring.
 * The two vocabularies are related but intentionally not identical --
 * don't assume one subsumes the other.
 */
export declare enum GameEvent {
    LEVEL_START = "LEVEL_START",
    LEVEL_COMPLETE = "LEVEL_COMPLETE",
    LEVEL_QUIT = "LEVEL_QUIT",
    LEVEL_FAILED = "LEVEL_FAILED",
    LEVEL_RESTART = "LEVEL_RESTART",
    HINT = "HINT",
    GENERIC_POSITIVE = "GENERIC_POSITIVE",
    GENERIC_NEGATIVE = "GENERIC_NEGATIVE"
}
export interface ParameterDefinition {
    parameterName: string;
    description?: string;
    howSDKChangesIt?: string;
    type: ParameterType;
    minValue?: number;
    maxValue?: number;
    defaultValue?: string;
    UpdateAction?: (value: any) => void;
}
export interface SkillprintConfig {
    gameName: string;
    targetEnvironment: ApiEnvironment;
    productionPartnerApiKey: string;
    productionApiBaseUrl?: string;
    stagingPartnerApiKey?: string;
    stagingApiBaseUrl?: string;
    screenshotMaxWidth?: number;
    screenshotJpegQuality?: number;
    screenshotIntervalSeconds?: number;
    screenshotPostIntervalSeconds?: number;
    pollResultsIntervalSeconds?: number;
    enableDebugLogging?: boolean;
    gameParameters?: ParameterDefinition[];
}
export interface ParameterInfo {
    name: string;
    type: string;
    description: string;
    adjustmentGuide: string | null;
    minValue: string | null;
    maxValue: string | null;
}
export interface StartSessionRequest {
    sessionId: string;
    game: string;
    targetMood: string;
    gameParameters: ParameterInfo[];
}
export interface ParameterUpdateResult {
    parameterName: string;
    newValue: any;
    [key: string]: any;
}
export interface PollResultsResponse {
    gameplayTips?: string;
    state?: string;
    parameterUpdates?: ParameterUpdateResult[];
}
