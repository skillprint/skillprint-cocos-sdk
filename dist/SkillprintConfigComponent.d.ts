import { Component } from 'cc';
import { ApiEnvironment, SkillprintConfig } from './SkillprintTypes';
export declare class SkillprintConfigComponent extends Component {
    gameName: string;
    targetEnvironment: ApiEnvironment;
    stagingPartnerApiKey: string;
    stagingApiBaseUrl: string;
    productionPartnerApiKey: string;
    productionApiBaseUrl: string;
    screenshotMaxWidth: number;
    screenshotJpegQuality: number;
    screenshotIntervalSeconds: number;
    screenshotPostIntervalSeconds: number;
    pollResultsIntervalSeconds: number;
    enableDebugLogging: boolean;
    getConfig(): SkillprintConfig;
}
