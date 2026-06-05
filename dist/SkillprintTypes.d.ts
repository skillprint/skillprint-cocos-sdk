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
