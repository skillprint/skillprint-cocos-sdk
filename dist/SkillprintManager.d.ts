import { Component } from 'cc';
import { SkillprintConfig, GameEvent } from './SkillprintTypes.js';
export declare class SkillprintManager extends Component {
    private static _instance;
    static get instance(): SkillprintManager;
    private config;
    private currentSessionId;
    private isSessionActive;
    private apiClient;
    private screenshotUtility;
    private screenshotQueue;
    private registeredParameters;
    private captureCallback;
    private postCallback;
    private pollCallback;
    onLoad(): void;
    init(config: SkillprintConfig): void;
    registerParameterModifier<T>(parameterName: string, updateAction: (value: T) => void, description?: string, howItWorks?: string): void;
    startGameSession(targetMood: string, customPlayerId?: string | null): Promise<void>;
    stopGameSession(): Promise<void>;
    /**
     * Logs a discrete telemetry event alongside the screenshot loop --
     * optional and additive, doesn't replace or interact with it. Mirrors
     * skillprint-js-sdk's manager.logEvent: fire-and-forget (a failed
     * request is logged and never throws, so it can't interrupt gameplay),
     * and a no-op with a warning if called with no active session.
     *
     * @param event Either one of the fixed GameEvent values (recommended --
     *   this exact set is what the backend's adaptation scoring already
     *   reads as a positive/negative signal) or a custom, game-specific
     *   event name string -- there's no enum to register a custom name
     *   against, matching the JS SDK.
     * @param data Optional extra fields alongside the event name.
     */
    logEvent(event: GameEvent | string, data?: Record<string, any>): Promise<void>;
    private startLoops;
    private stopLoops;
    private applyParameterUpdates;
    private convertValue;
    private isValidValue;
    private findActiveCamera;
    startGameSessionFromUrl(fallbackMood?: string, fallbackPlayerId?: string | null): void;
    startGameSessionWithOverrides(fallbackMood?: string, fallbackPlayerId?: string | null, overrideMood?: string | null, overridePlayerId?: string | null): void;
    getUrlParametersInfo(): string;
    private getSkillprintUrlParameters;
    private generateUUID;
    log(msg: string, level?: 'Info' | 'Warning' | 'Error'): void;
    getConfig(): SkillprintConfig | null;
    onDestroy(): void;
}
