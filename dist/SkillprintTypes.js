export var ApiEnvironment;
(function (ApiEnvironment) {
    ApiEnvironment["Production"] = "Production";
    ApiEnvironment["Staging"] = "Staging";
})(ApiEnvironment || (ApiEnvironment = {}));
export var ParameterType;
(function (ParameterType) {
    ParameterType["Float"] = "Float";
    ParameterType["Integer"] = "Integer";
    ParameterType["Boolean"] = "Boolean";
})(ParameterType || (ParameterType = {}));
export var Mood;
(function (Mood) {
    Mood["relax"] = "relax";
    Mood["focus"] = "focus";
    Mood["creativity"] = "creativity";
    Mood["collaborate"] = "collaborate";
    Mood["grit"] = "grit";
    Mood["joy"] = "joy";
    Mood["curiosity"] = "curiosity";
    Mood["empathy"] = "empathy";
    Mood["awe"] = "awe";
})(Mood || (Mood = {}));
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
export var GameEvent;
(function (GameEvent) {
    GameEvent["LEVEL_START"] = "LEVEL_START";
    GameEvent["LEVEL_COMPLETE"] = "LEVEL_COMPLETE";
    GameEvent["LEVEL_QUIT"] = "LEVEL_QUIT";
    GameEvent["LEVEL_FAILED"] = "LEVEL_FAILED";
    GameEvent["LEVEL_RESTART"] = "LEVEL_RESTART";
    GameEvent["HINT"] = "HINT";
    GameEvent["GENERIC_POSITIVE"] = "GENERIC_POSITIVE";
    GameEvent["GENERIC_NEGATIVE"] = "GENERIC_NEGATIVE";
})(GameEvent || (GameEvent = {}));
