var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { _decorator, Component, Enum } from 'cc';
import { ApiEnvironment } from './SkillprintTypes';
const { ccclass, property } = _decorator;
Enum(ApiEnvironment);
let SkillprintConfigComponent = class SkillprintConfigComponent extends Component {
    constructor() {
        super(...arguments);
        this.gameName = 'cocos-demo-game';
        this.targetEnvironment = ApiEnvironment.Staging;
        this.stagingPartnerApiKey = '';
        this.stagingApiBaseUrl = 'https://api.staging.skillprint.co';
        this.productionPartnerApiKey = '';
        this.productionApiBaseUrl = 'https://api.skillprint.co';
        this.screenshotMaxWidth = 960;
        this.screenshotJpegQuality = 60;
        this.screenshotIntervalSeconds = 2.0;
        this.screenshotPostIntervalSeconds = 5.0;
        this.pollResultsIntervalSeconds = 5.0;
        this.enableDebugLogging = false;
    }
    getConfig() {
        return {
            gameName: this.gameName,
            targetEnvironment: this.targetEnvironment,
            productionPartnerApiKey: this.productionPartnerApiKey,
            productionApiBaseUrl: this.productionApiBaseUrl,
            stagingPartnerApiKey: this.stagingPartnerApiKey,
            stagingApiBaseUrl: this.stagingApiBaseUrl,
            screenshotMaxWidth: this.screenshotMaxWidth,
            screenshotJpegQuality: this.screenshotJpegQuality,
            screenshotIntervalSeconds: this.screenshotIntervalSeconds,
            screenshotPostIntervalSeconds: this.screenshotPostIntervalSeconds,
            pollResultsIntervalSeconds: this.pollResultsIntervalSeconds,
            enableDebugLogging: this.enableDebugLogging,
            gameParameters: []
        };
    }
};
__decorate([
    property({
        displayName: 'Game Name (Slug)',
        tooltip: 'The unique slug registered for your game, e.g. fruit-boom'
    })
], SkillprintConfigComponent.prototype, "gameName", void 0);
__decorate([
    property({
        type: Enum(ApiEnvironment),
        displayName: 'Target Environment'
    })
], SkillprintConfigComponent.prototype, "targetEnvironment", void 0);
__decorate([
    property({
        displayName: 'Staging API Key',
    })
], SkillprintConfigComponent.prototype, "stagingPartnerApiKey", void 0);
__decorate([
    property({
        displayName: 'Staging API Base URL'
    })
], SkillprintConfigComponent.prototype, "stagingApiBaseUrl", void 0);
__decorate([
    property({
        displayName: 'Production API Key',
    })
], SkillprintConfigComponent.prototype, "productionPartnerApiKey", void 0);
__decorate([
    property({
        displayName: 'Production API Base URL'
    })
], SkillprintConfigComponent.prototype, "productionApiBaseUrl", void 0);
__decorate([
    property({
        displayName: 'Screenshot Max Width',
        tooltip: 'Maximum width for screenshots. Images wider than this are downscaled. 0 = no limit.'
    })
], SkillprintConfigComponent.prototype, "screenshotMaxWidth", void 0);
__decorate([
    property({
        displayName: 'Screenshot JPEG Quality',
        tooltip: 'Compression quality (1-100). Lower values are smaller files.'
    })
], SkillprintConfigComponent.prototype, "screenshotJpegQuality", void 0);
__decorate([
    property({
        displayName: 'Screenshot Interval (s)'
    })
], SkillprintConfigComponent.prototype, "screenshotIntervalSeconds", void 0);
__decorate([
    property({
        displayName: 'Screenshot Post Interval (s)'
    })
], SkillprintConfigComponent.prototype, "screenshotPostIntervalSeconds", void 0);
__decorate([
    property({
        displayName: 'Poll Results Interval (s)'
    })
], SkillprintConfigComponent.prototype, "pollResultsIntervalSeconds", void 0);
__decorate([
    property({
        displayName: 'Enable Debug Logging'
    })
], SkillprintConfigComponent.prototype, "enableDebugLogging", void 0);
SkillprintConfigComponent = __decorate([
    ccclass('SkillprintConfigComponent')
], SkillprintConfigComponent);
export { SkillprintConfigComponent };
