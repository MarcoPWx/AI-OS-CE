import { test, expect } from '@playwright/test';

// App-level MSW journey tests (runs against Expo web dev server)
// Requires: EXPO_PUBLIC_USE_MSW=1 (use npm run test:e2e:web:msw)

test.describe('App (web) — MSW-backed flows', () => {
  test('lessons endpoint returns data', async ({ page }) => {
    await page.goto('/');
    const lessons = await page.evaluate(async () => {
      const res = await fetch('/api/lessons');
      const json = await res.json();
      return json?.lessons?.length || 0;
    });
    expect(lessons).toBeGreaterThan(0);
  });

  test('cache endpoint returns 304 with ETag on repeat', async ({ page }) => {
    await page.goto('/');
    const result = await page.evaluate(async () => {
      const res1 = await fetch('/api/cache');
      const etag = res1.headers.get('etag');
      const payload1 = await res1.json();
      let status2 = 0;
      if (etag) {
        const res2 = await fetch('/api/cache', { headers: { 'If-None-Match': etag } });
        status2 = res2.status;
      }
      return { etag: !!etag, payload1, status2 };
    });
    expect(result.etag).toBeTruthy();
    expect(result.status2).toBe(304);
  });

test('rate-limit endpoint returns 429 after threshold @smoke', async ({ page }) => {
    await page.goto('/');
    const statuses = await page.evaluate(async () => {
      const s: number[] = [];
      for (let i = 0; i < 4; i++) {
        const res = await fetch('/api/ratelimit', { headers: { 'x-client-id': 'playwright-app' } });
        s.push(res.status);
      }
      return s;
    });
    expect(statuses.slice(0, 3).every((s) => s === 200)).toBeTruthy();
    expect(statuses[3]).toBe(429);
  });

test('S2S composite /api/quiz/start returns session + questions + trace @smoke', async ({ page }) => {
    await page.goto('/');
    const out = await page.evaluate(async () => {
      const res = await fetch('/api/quiz/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-msw-no-defaults': '1' },
        body: JSON.stringify({ topic: 'algebra', difficulty: 'easy' }),
      });
      const data = await res.json();
      return {
        status: res.status,
        sessionId: data.sessionId,
        hasQuestions: Array.isArray(data.questions),
        hasTrace: Array.isArray(data.trace),
      };
    });
    expect(out.status).toBe(200);
    expect(typeof out.sessionId).toBe('string');
    expect(out.hasQuestions).toBeTruthy();
    expect(out.hasTrace).toBeTruthy();
  });
});
