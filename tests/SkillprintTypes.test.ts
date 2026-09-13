import { describe, expect, it } from 'vitest';
import { GameEvent } from '../src/SkillprintTypes';

describe('GameEvent', () => {
    it('matches skillprint-js-sdk\'s fixed vocabulary exactly', () => {
        expect(Object.values(GameEvent)).toEqual([
            'LEVEL_START',
            'LEVEL_COMPLETE',
            'LEVEL_QUIT',
            'LEVEL_FAILED',
            'LEVEL_RESTART',
            'HINT',
            'GENERIC_POSITIVE',
            'GENERIC_NEGATIVE',
        ]);
    });
});
