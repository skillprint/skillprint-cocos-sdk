import { _decorator } from 'cc';
import { SkillprintManager as SDKManager } from '@skillprint/cocos-sdk';
const { ccclass } = _decorator;

@ccclass('SkillprintManager')
export class SkillprintManager extends SDKManager {}
