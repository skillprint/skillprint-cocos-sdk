export enum ApiEnvironment {
    Production = 'Production',
    Staging = 'Staging',
}

export enum ParameterType {
    Float = 'Float',
    Integer = 'Integer',
    Boolean = 'Boolean',
}

export enum Mood {
    relax = 'relax',
    focus = 'focus',
    creativity = 'creativity',
    collaborate = 'collaborate',
    grit = 'grit',
    joy = 'joy',
    curiosity = 'curiosity',
    empathy = 'empathy',
    awe = 'awe',
}

/**
 * Fixed discrete-telemetry event vocabulary, matching skillprint-js-sdk's
 * GameEvent enum (src/constants.ts) so events logged with it are read the
 * same way by the backend's adaptation scoring regardless of platform.
 * logEvent also accepts a plain string for a game-specific custom event
 * name outside this fixed set -- see SkillprintManager.logEvent.
 */
export enum GameEvent {
    LEVEL_START = 'LEVEL_START',
    LEVEL_COMPLETE = 'LEVEL_COMPLETE',
    LEVEL_QUIT = 'LEVEL_QUIT',
    LEVEL_FAILED = 'LEVEL_FAILED',
    LEVEL_RESTART = 'LEVEL_RESTART',
    HINT = 'HINT',
    GENERIC_POSITIVE = 'GENERIC_POSITIVE',
    GENERIC_NEGATIVE = 'GENERIC_NEGATIVE',
}

export interface ParameterDefinition {
    parameterName: string;
    description?: string;
    howSDKChangesIt?: string; // Maps to adjustmentGuide in API
    type: ParameterType;
    minValue?: number;
    maxValue?: number;
    defaultValue?: string;
    UpdateAction?: (value: any) => void;
}

export interface SkillprintConfig {
    gameName: string; // Slug, e.g. 'fruit-boom'
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
    // Handled dynamically if custom fields are returned in place of newValue
    [key: string]: any;
}

export interface PollResultsResponse {
    gameplayTips?: string;
    state?: string;
    parameterUpdates?: ParameterUpdateResult[];
}
