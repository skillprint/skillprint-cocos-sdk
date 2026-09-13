# Skillprint Cocos Creator SDK

TypeScript SDK for integrating Skillprint into Cocos Creator 3.8.x games. This SDK enables real-time session tracking, automated screenshot canvas captures for mood/skill analysis, and dynamic parameter adjustments (adaptive difficulty, relaxation pacing, grit challenges) based on player analytics.

For details on the published npm package, visit [npm package @skillprint/cocos-sdk](https://www.npmjs.com/package/@skillprint/cocos-sdk).

---

## 🚀 Installation

Install the package in your Cocos Creator project root:

```bash
npm install @skillprint/cocos-sdk
```

---

## 🛠️ Cocos Creator Setup

Cocos Creator's editor registers serializable component classes and inspector fields from files located inside the `assets/` directory. To use the SDK's editor-facing configuration and manager components:

### 1. Create Local Wrappers

You can create these wrapper files manually, or **download them directly from the GitHub repository** to drag them into your project (including their `.meta` files, which preserves their UUIDs for automated scene mapping):

*   📂 **[`templates/` directory on GitHub](https://github.com/skillprint/skillprint-cocos-sdk/tree/main/templates)**
    *   📄 **[SkillprintConfigComponent.ts](https://raw.githubusercontent.com/skillprint/skillprint-cocos-sdk/main/templates/SkillprintConfigComponent.ts)** | [`.meta` file](https://raw.githubusercontent.com/skillprint/skillprint-cocos-sdk/main/templates/SkillprintConfigComponent.ts.meta)
    *   📄 **[SkillprintManager.ts](https://raw.githubusercontent.com/skillprint/skillprint-cocos-sdk/main/templates/SkillprintManager.ts)** | [`.meta` file](https://raw.githubusercontent.com/skillprint/skillprint-cocos-sdk/main/templates/SkillprintManager.ts.meta)
    *   📄 **[SkillprintTestController.ts](https://raw.githubusercontent.com/skillprint/skillprint-cocos-sdk/main/templates/SkillprintTestController.ts)** | [`.meta` file](https://raw.githubusercontent.com/skillprint/skillprint-cocos-sdk/main/templates/SkillprintTestController.ts.meta)

If creating files manually, save them under `assets/scripts/SkillprintSDK/` with the following contents:

#### 📄 `assets/scripts/SkillprintSDK/SkillprintConfigComponent.ts`
```typescript
import { _decorator } from 'cc';
import { SkillprintConfigComponent as SDKConfig } from '@skillprint/cocos-sdk';
const { ccclass } = _decorator;

@ccclass('SkillprintConfigComponent')
export class SkillprintConfigComponent extends SDKConfig {}
```

#### 📄 `assets/scripts/SkillprintSDK/SkillprintManager.ts`
```typescript
import { _decorator } from 'cc';
import { SkillprintManager as SDKManager } from '@skillprint/cocos-sdk';
const { ccclass } = _decorator;

@ccclass('SkillprintManager')
export class SkillprintManager extends SDKManager {}
```

### 2. Configure in Scene Editor
1. Create a Node in your Cocos Creator hierarchy (e.g. named `SkillprintManager`).
2. Attach both the local `SkillprintManager` and `SkillprintConfigComponent` to it.
3. In the **Inspector** panel for `SkillprintConfigComponent`:
   - Set your **Game Name (Slug)** (e.g., `fruit-boom`).
   - Select your target environment (`Staging` or `Production`).
   - Input your **Staging/Production Partner API Keys** and **Base URLs**.
   - Configure screenshot frequencies (default: `2s` capture, `5s` post intervals) and downscaling width (default: `960px`).
   
---

## 💻 Integration & Usage

Use a controller script (e.g. attached to your main scene node) to initialize the SDK and react to parameter updates.

### Code Example: `SkillprintTestController.ts`
```typescript
import { _decorator, Component } from 'cc';
import { SkillprintConfig, ApiEnvironment, ParameterType } from '@skillprint/cocos-sdk';
import { SkillprintManager } from './SkillprintSDK/SkillprintManager';

const { ccclass } = _decorator;

@ccclass('SkillprintTestController')
export class SkillprintTestController extends Component {
    
    start() {
        // 1. Get the local Manager component instance
        let manager = this.getComponent(SkillprintManager);
        if (!manager) {
            manager = this.node.addComponent(SkillprintManager);
        }

        // 2. Register modifiers for parameters your game should adapt
        SkillprintManager.instance.registerParameterModifier<number>('playerSpeed', (newSpeed) => {
            console.log(`[Game Logic] Adjusting speed -> ${newSpeed}`);
            // Apply speed to your player object here
        });

        SkillprintManager.instance.registerParameterModifier<boolean>('showTutorialHints', (show) => {
            console.log(`[Game Logic] Toggle hints -> ${show}`);
            // Apply hint display settings
        });

        // 3. Start the game session
        // (It will read URL overrides if launched in browser preview: ?mood=focus&playerId=test-user)
        SkillprintManager.instance.startGameSessionFromUrl('focus', 'player-id-123');
    }

    onDestroy() {
        // Ensure session terminates correctly when scene changes or controller destroys
        if (SkillprintManager.instance) {
            SkillprintManager.instance.stopGameSession();
        }
    }
}
```

### Log Discrete Telemetry Events

Screenshot capture is the SDK's primary telemetry mechanism and covers every game automatically. `logEvent` is an **optional, additive** layer on top of it for games that want precise, low-latency event signals alongside the vision-based scoring — it doesn't replace or interact with the screenshot loop.

```typescript
import { GameEvent } from '@skillprint/cocos-sdk';

SkillprintManager.instance.logEvent(GameEvent.LEVEL_START);
SkillprintManager.instance.logEvent(GameEvent.LEVEL_COMPLETE, { level: 3, score: 1200 });
```

`logEvent` is fire-and-forget: a failed request is logged and never throws, so it can never interrupt gameplay. Calling it with no active session is a no-op (also just a logged warning).

**Two ways to use it**, matching skillprint-js-sdk exactly so events are read the same way regardless of platform:

1. **The fixed `GameEvent` vocabulary** (`LEVEL_START`, `LEVEL_COMPLETE`, `LEVEL_QUIT`, `LEVEL_FAILED`, `LEVEL_RESTART`, `HINT`, `GENERIC_POSITIVE`, `GENERIC_NEGATIVE`) — recommended for most integrations. This exact set is what Skillprint's backend adaptation scoring already reads as a positive/negative signal, so events logged with it are automatically meaningful without any other configuration.

2. **A custom event name** (any string) — for games with their own scoring configuration that want a richer, game-specific vocabulary:

```typescript
SkillprintManager.instance.logEvent('CLOCKWISE_TAP', { comboCount: 4 });
```

There's no enum to register a custom name against — the backend's per-game telemetry schema is intentionally left unrestricted for this path, specifically so it can't drift out of sync with what your game actually ships. Custom events are picked up by Skillprint's LLM-based scoring as additional context alongside screenshots, but aren't guaranteed to map to any specific pre-built scoring logic — check with your Skillprint contact if you're building a game with a custom scoring configuration and want to make the most of a bespoke event vocabulary.

### Reference in UI scripts (like `HomeUI.ts`)
To reference your configuration from other scripts:
```typescript
import { _decorator, Component } from 'cc';
import { SkillprintConfigComponent } from './SkillprintSDK/SkillprintConfigComponent';
import { SkillprintManager } from './SkillprintSDK/SkillprintManager';

const { ccclass, property } = _decorator;

@ccclass('HomeUI')
export class HomeUI extends Component {
    @property(SkillprintConfigComponent)
    public skillprintConfig: SkillprintConfigComponent = null!;

    start() {
        const manager = this.node.addComponent(SkillprintManager);
        if (this.skillprintConfig) {
            manager.init(this.skillprintConfig.getConfig());
        }
    }
}
```
