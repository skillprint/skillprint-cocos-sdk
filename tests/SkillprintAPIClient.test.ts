import { describe, expect, it, vi, afterEach } from 'vitest';
import { SkillprintAPIClient } from '../src/SkillprintAPIClient';

describe('SkillprintAPIClient', () => {
    const baseUrl = 'https://api.skillprint.co';
    const apiKey = 'test-partner-key';

    afterEach(() => {
        vi.restoreAllMocks();
    });

    // ───────────────────────── startSession ─────────────────────────

    it('starts a session with the right method, url, and headers', async () => {
        const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
            ok: true,
            text: async () => '{"status":"ok"}',
        } as Response);

        const client = new SkillprintAPIClient(baseUrl, apiKey);
        const success = await client.startSession('session-1', 'focus', null, 'my-game', []);

        expect(success).toBe(true);
        expect(fetchSpy).toHaveBeenCalledWith(
            `${baseUrl}/games/api/sessions/`,
            expect.objectContaining({
                method: 'POST',
                headers: expect.objectContaining({
                    'Content-Type': 'application/json',
                    Authorization: `Api-Key ${apiKey}`,
                }),
            })
        );
    });

    it('sends game name and parameters in the request body', async () => {
        const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
            ok: true,
            text: async () => '{"status":"ok"}',
        } as Response);

        const client = new SkillprintAPIClient(baseUrl, apiKey);
        const params = [
            { name: 'speed', type: 'Float', description: '', adjustmentGuide: null, minValue: '0', maxValue: '1' },
        ];
        await client.startSession('session-1', 'focus', null, 'my-game', params);

        const [, options] = fetchSpy.mock.calls[0];
        const body = JSON.parse((options as RequestInit).body as string);
        expect(body.game).toBe('my-game');
        expect(body.gameParameters).toEqual(params);
    });

    it('returns false and does not throw on a network error', async () => {
        vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('network down'));

        const client = new SkillprintAPIClient(baseUrl, apiKey);
        const success = await client.startSession('session-1', 'focus', null, 'my-game', []);

        expect(success).toBe(false);
    });

    it('returns false when the server responds with an error status', async () => {
        vi.spyOn(globalThis, 'fetch').mockResolvedValue({
            ok: false,
            statusText: 'Bad Request',
            text: async () => '{"error":"bad mood"}',
        } as Response);

        const client = new SkillprintAPIClient(baseUrl, apiKey);
        const success = await client.startSession('session-1', 'focus', null, 'my-game', []);

        expect(success).toBe(false);
    });

    // ───────────────────────── logTelemetryEvent ─────────────────────────
    // The capability added alongside these tests -- mirrors skillprint-js-sdk's
    // logTelemetryEvent exactly (see that repo's api-client.ts and its
    // envelope-shape regression test).

    it('logs a telemetry event with session_id/game_slug as query params', async () => {
        const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
            ok: true,
            text: async () => '{"status":"accepted"}',
        } as Response);

        const client = new SkillprintAPIClient(baseUrl, apiKey);
        const success = await client.logTelemetryEvent('session-1', 'my-game', {
            event: 'LEVEL_START',
            level: 3,
        });

        expect(success).toBe(true);
        expect(fetchSpy).toHaveBeenCalledWith(
            `${baseUrl}/games/api/sessions/telemetry?session_id=session-1&game_slug=my-game`,
            expect.objectContaining({ method: 'POST' })
        );
    });

    it('wraps the event in an outer {"event": ...} envelope', async () => {
        // The backend's SessionAddTelemetryAPIView expects the event object
        // wrapped in an outer envelope (confirmed against marketplace's
        // games/tests/test_sessions.py) -- sending it unwrapped would store
        // just the event name string as the whole telemetry entry. This is
        // the exact bug skillprint-js-sdk's own PR caught before merging.
        const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
            ok: true,
            text: async () => '{"status":"accepted"}',
        } as Response);

        const client = new SkillprintAPIClient(baseUrl, apiKey);
        await client.logTelemetryEvent('session-1', 'my-game', { event: 'LEVEL_START', level: 3 });

        const [, options] = fetchSpy.mock.calls[0];
        const body = JSON.parse((options as RequestInit).body as string);
        expect(body).toEqual({ event: { event: 'LEVEL_START', level: 3 } });
    });

    it('URL-encodes session_id and game_slug', async () => {
        const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
            ok: true,
            text: async () => '{}',
        } as Response);

        const client = new SkillprintAPIClient(baseUrl, apiKey);
        await client.logTelemetryEvent('session with spaces', 'game&slug', { event: 'TAP' });

        const [url] = fetchSpy.mock.calls[0];
        expect(url).toBe(
            `${baseUrl}/games/api/sessions/telemetry?session_id=session%20with%20spaces&game_slug=game%26slug`
        );
    });

    it('returns false and does not throw when logging fails', async () => {
        vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('network down'));

        const client = new SkillprintAPIClient(baseUrl, apiKey);
        const success = await client.logTelemetryEvent('session-1', 'my-game', { event: 'TAP' });

        expect(success).toBe(false);
    });

    it('returns false when the server rejects the telemetry event', async () => {
        vi.spyOn(globalThis, 'fetch').mockResolvedValue({
            ok: false,
            statusText: 'Not Found',
            text: async () => '{"error":"session not found"}',
        } as Response);

        const client = new SkillprintAPIClient(baseUrl, apiKey);
        const success = await client.logTelemetryEvent('session-1', 'my-game', { event: 'TAP' });

        expect(success).toBe(false);
    });

    // ───────────────────────── pollParameterResults ─────────────────────────

    it('parses parameter updates from a direct array response', async () => {
        vi.spyOn(globalThis, 'fetch').mockResolvedValue({
            ok: true,
            text: async () => JSON.stringify([{ parameterName: 'speed', newValue: 1.5 }]),
        } as Response);

        const client = new SkillprintAPIClient(baseUrl, apiKey);
        const updates = await client.pollParameterResults('session-1');

        expect(updates).toEqual([{ parameterName: 'speed', newValue: 1.5 }]);
    });

    it('returns an empty array (not null/throw) on a poll error', async () => {
        vi.spyOn(globalThis, 'fetch').mockResolvedValue({
            ok: false,
            statusText: 'Server Error',
            text: async () => '',
        } as Response);

        const client = new SkillprintAPIClient(baseUrl, apiKey);
        const updates = await client.pollParameterResults('session-1');

        expect(updates).toEqual([]);
    });

    // ───────────────────────── postScreenshots ─────────────────────────

    it('skips the request and reports failure when no screenshots and not the last chunk', async () => {
        const fetchSpy = vi.spyOn(globalThis, 'fetch');

        const client = new SkillprintAPIClient(baseUrl, apiKey);
        const success = await client.postScreenshots('session-1', [], false);

        expect(success).toBe(false);
        expect(fetchSpy).not.toHaveBeenCalled();
    });

    it('allows an empty batch when isLastChunk is true (session-close signal)', async () => {
        vi.spyOn(globalThis, 'fetch').mockResolvedValue({
            ok: true,
            text: async () => '{"status":"closed"}',
        } as Response);

        const client = new SkillprintAPIClient(baseUrl, apiKey);
        const success = await client.postScreenshots('session-1', [], true);

        expect(success).toBe(true);
    });

    // ───────────────────────── createOrGetUserToken ─────────────────────────

    it('creates a user and retries the token fetch if none exists yet', async () => {
        const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(async (url) => {
            const urlStr = url.toString();
            if (urlStr.includes('/partners/api/users/auth/token/')) {
                // First call: no token yet. Second call (after creation): token exists.
                const hasBeenCalledBefore = fetchSpy.mock.calls.some((c) =>
                    c[0].toString().includes('/partners/api/users/auth/token/')
                );
                return {
                    ok: hasBeenCalledBefore,
                    statusText: 'Not Found',
                    text: async () => (hasBeenCalledBefore ? JSON.stringify({ token: 'new-token' }) : ''),
                } as Response;
            }
            if (urlStr.includes('/partners/api/users/add/')) {
                return { ok: true, text: async () => '{"status":"created"}' } as Response;
            }
            return { ok: false, text: async () => '' } as Response;
        });

        const client = new SkillprintAPIClient(baseUrl, apiKey);
        const token = await client.createOrGetUserToken('player-1');

        expect(token).toBe('new-token');
    });

    it('returns null without making any request for an empty player id', async () => {
        const fetchSpy = vi.spyOn(globalThis, 'fetch');

        const client = new SkillprintAPIClient(baseUrl, apiKey);
        const token = await client.createOrGetUserToken('');

        expect(token).toBeNull();
        expect(fetchSpy).not.toHaveBeenCalled();
    });
});
