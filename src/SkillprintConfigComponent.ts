import { _decorator, Component, Enum } from 'cc';
import { ApiEnvironment, SkillprintConfig } from './SkillprintTypes.js';

const { ccclass, property } = _decorator;

Enum(ApiEnvironment);

@ccclass('SkillprintConfigComponent')
export class SkillprintConfigComponent extends Component {
    @property({
        displayName: 'Game Name (Slug)',
        tooltip: 'The unique slug registered for your game, e.g. fruit-boom'
    })
    public gameName = 'cocos-demo-game';

    @property({
        type: Enum(ApiEnvironment),
        displayName: 'Target Environment'
    })
    public targetEnvironment = ApiEnvironment.Staging;

    @property({
        displayName: 'Staging API Key',
    })
    public stagingPartnerApiKey = '';

    @property({
        displayName: 'Staging API Base URL'
    })
    public stagingApiBaseUrl = 'https://api.staging.skillprint.co';

    @property({
        displayName: 'Production API Key',
    })
    public productionPartnerApiKey = '';

    @property({
        displayName: 'Production API Base URL'
    })
    public productionApiBaseUrl = 'https://api.skillprint.co';

    @property({
        displayName: 'Screenshot Max Width',
        tooltip: 'Maximum width for screenshots. Images wider than this are downscaled. 0 = no limit.'
    })
    public screenshotMaxWidth = 960;

    @property({
        displayName: 'Screenshot JPEG Quality',
        tooltip: 'Compression quality (1-100). Lower values are smaller files.'
    })
    public screenshotJpegQuality = 60;

    @property({
        displayName: 'Screenshot Interval (s)'
    })
    public screenshotIntervalSeconds = 2.0;

    @property({
        displayName: 'Screenshot Post Interval (s)'
    })
    public screenshotPostIntervalSeconds = 5.0;

    @property({
        displayName: 'Poll Results Interval (s)'
    })
    public pollResultsIntervalSeconds = 5.0;

    @property({
        displayName: 'Enable Debug Logging'
    })
    public enableDebugLogging = false;

    public getConfig(): SkillprintConfig {
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
}
