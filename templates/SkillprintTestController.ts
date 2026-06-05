import { _decorator, Component } from 'cc';
import { SkillprintConfig, ApiEnvironment, ParameterType } from '@skillprint/cocos-sdk';
import { SkillprintManager } from './SkillprintSDK/SkillprintManager';

const { ccclass } = _decorator;

@ccclass('SkillprintTestController')
export class SkillprintTestController extends Component {
    
    start() {
        console.log('[SkillprintTestController] Initializing Skillprint SDK...');

        // 1. Define a mock configuration
        const mockConfig: SkillprintConfig = {
            gameName: 'cocos-demo-game',
            targetEnvironment: ApiEnvironment.Staging,
            productionPartnerApiKey: 'mock-production-api-key-12345',
            stagingPartnerApiKey: 'mock-staging-api-key-54321',
            stagingApiBaseUrl: 'https://api.staging.skillprint.co',
            screenshotMaxWidth: 960,
            screenshotJpegQuality: 60,
            screenshotIntervalSeconds: 3.0,
            screenshotPostIntervalSeconds: 6.0,
            pollResultsIntervalSeconds: 5.0,
            enableDebugLogging: true,
            gameParameters: [
                {
                    parameterName: 'playerSpeed',
                    description: 'Controls the player movement velocity',
                    howSDKChangesIt: 'Increase for challenge, decrease to relax',
                    type: ParameterType.Float,
                    minValue: 2.0,
                    maxValue: 12.0,
                    defaultValue: '5.0'
                },
                {
                    parameterName: 'spawnInterval',
                    description: 'Frequency of obstacle spawns in seconds',
                    howSDKChangesIt: 'Reduce for faster-paced focus mood, increase to relax',
                    type: ParameterType.Float,
                    minValue: 0.5,
                    maxValue: 4.0,
                    defaultValue: '2.0'
                },
                {
                    parameterName: 'showTutorialHints',
                    description: 'Whether to show interactive tutorials',
                    howSDKChangesIt: 'Turn on for curious players, off for experts',
                    type: ParameterType.Boolean,
                    defaultValue: 'true'
                }
            ]
        };

        // 2. Initialize the Manager Singleton (if not already initialized)
        let manager = this.getComponent(SkillprintManager);
        if (!manager) {
            manager = this.node.addComponent(SkillprintManager);
        }
        
        if (!manager.getConfig()) {
            console.log('[SkillprintTestController] SDK config not found, initializing with mock configuration.');
            manager.init(mockConfig);
        } else {
            console.log('[SkillprintTestController] SDK config already exists (initialized externally). Skipping mock initialization.');
        }

        // 3. Register Parameter Modifiers (must match parameterNames in config)
        SkillprintManager.instance.registerParameterModifier<number>('playerSpeed', (newSpeed) => {
            console.log(`[GameLogic] playerSpeed adjusted by Skillprint -> ${newSpeed}`);
        });

        SkillprintManager.instance.registerParameterModifier<number>('spawnInterval', (newInterval) => {
            console.log(`[GameLogic] spawnInterval adjusted by Skillprint -> ${newInterval}`);
        });

        SkillprintManager.instance.registerParameterModifier<boolean>('showTutorialHints', (show) => {
            console.log(`[GameLogic] showTutorialHints adjusted by Skillprint -> ${show}`);
        });

        // 4. Start the session (can auto-detect parameters from WebGL URL query, e.g. ?mood=focus&playerId=user1)
        console.log('[SkillprintTestController] Starting game session...');
        SkillprintManager.instance.startGameSessionFromUrl('focus', 'test-player-id-cocos');
    }

    onDestroy() {
        console.log('[SkillprintTestController] Component destroyed. Stopping session...');
        if (SkillprintManager.instance) {
            SkillprintManager.instance.stopGameSession();
        }
    }
}
