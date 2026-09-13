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
