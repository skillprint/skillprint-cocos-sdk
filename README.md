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

Create a directory in your project under `assets/scripts/SkillprintSDK/` and add the following wrapper scripts. They inherit from the npm package components, allowing them to register in the Cocos Creator Asset database and inspector.

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
