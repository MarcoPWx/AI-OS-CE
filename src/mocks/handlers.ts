// src/mocks/handlers.ts
import { http, HttpResponse, delay } from 'msw';
import { authHandlers } from './handlers/auth';
import { securityHandlers } from './handlers/security';
import { batchHandlers } from './handlers/batch';

// Global defaults for latency and error injection (configurable via /__msw__/defaults)
const __mswDefaults = { latencyMs: 0, errorRate: 0 };

async function applyDefaultLatency() {
  if (__mswDefaults.latencyMs > 0) {
    await delay(__mswDefaults.latencyMs);
  }
}

function shouldInjectError() {
  return __mswDefaults.errorRate > 0 && Math.random() < __mswDefaults.errorRate;
}

function skipDefaults(request: Request) {
  try {
    return request.headers.get('x-msw-no-defaults') === '1';
  } catch {
    return false;
  }
}

// In-memory stores for demos
const rateMap = new Map<string, { count: number; resetAt: number }>();

const RATE_WINDOW_MS = 10_000;
const RATE_LIMIT = 3;

export const handlers = [
  // Auth handlers (GitHub OAuth, email/password, sessions)
  ...authHandlers,

  // Security handlers (JWT validation, CSRF, rate limiting, input validation)
  ...securityHandlers,

  // Batch processing handlers (questions, analytics, user sync)
  ...batchHandlers,

  // Health
  http.get('/health', async ({ request }) => {
    if (!skipDefaults(request)) {
      await applyDefaultLatency();
      if (shouldInjectError()) {
        return new HttpResponse('Injected error', {
          status: 503,
          headers: { 'Content-Type': 'text/plain' },
        });
      }
    }
    return HttpResponse.json({ ok: true, ts: Date.now() });
  }),

  // Lessons list
  http.get('/api/lessons', async ({ request }) => {
    if (!skipDefaults(request)) {
      await applyDefaultLatency();
      if (shouldInjectError()) {
        return new HttpResponse('Injected error', {
          status: 503,
          headers: { 'Content-Type': 'text/plain' },
        });
      }
    }
    await delay(200);
    return HttpResponse.json({
      lessons: [
        { id: 'js-basics', title: 'JavaScript Basics', progress: 0.2 },
        { id: 'react-components', title: 'React Components', progress: 0.6 },
        { id: 'ts-advanced', title: 'TypeScript Advanced', progress: 1.0 },
      ],
    });
  }),

  // Quiz list
  http.get('/api/quizzes', async ({ request }) => {
    if (!skipDefaults(request)) {
      await applyDefaultLatency();
      if (shouldInjectError()) {
        return new HttpResponse('Injected error', {
          status: 503,
          headers: { 'Content-Type': 'text/plain' },
        });
      }
    }
    await delay(250);
    return HttpResponse.json({
      quizzes: [
        { id: 'q1', category: 'javascript', difficulty: 'easy' },
        { id: 'q2', category: 'react', difficulty: 'medium' },
      ],
    });
  }),

  // Mock login
  http.post('/api/login', async ({ request }) => {
    if (!skipDefaults(request)) {
      await applyDefaultLatency();
      if (shouldInjectError()) {
        return new HttpResponse('Injected error', {
          status: 503,
          headers: { 'Content-Type': 'text/plain' },
        });
      }
    }
    await delay(150);
    const body = await request.json().catch(() => ({}) as any);
    const { email = 'demo@quizmentor.app' } = (body as any) || {};
    return HttpResponse.json(
      { token: 'mock-token-123', user: { id: 'demo', email } },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  }),

  // Caching example with ETag and Cache-Control
  http.get('/api/cache', async ({ request }) => {
    if (!skipDefaults(request)) {
      await applyDefaultLatency();
      if (shouldInjectError()) {
        return new HttpResponse('Injected error', {
          status: 503,
          headers: { 'Content-Type': 'text/plain' },
        });
      }
    }
    const etag = '"demo-etag-abc123"';
    const ifNoneMatch = request.headers.get('if-none-match');
    const payload = { ts: new Date('2024-01-01T00:00:00Z').toISOString(), value: 42 };

    if (ifNoneMatch === etag) {
      return HttpResponse.json(null as any, {
        status: 304,
        headers: {
          ETag: etag,
          'Cache-Control': 'public, max-age=60',
        },
      });
    }

    return HttpResponse.json(payload, {
      headers: {
        ETag: etag,
        'Cache-Control': 'public, max-age=60',
      },
    });
  }),

  // Rate limit example: allow RATE_LIMIT requests per RATE_WINDOW_MS per client id
  http.get('/api/ratelimit', async ({ request }) => {
    if (!skipDefaults(request)) {
      await applyDefaultLatency();
      if (shouldInjectError()) {
        return new HttpResponse('Injected error', {
          status: 503,
          headers: { 'Content-Type': 'text/plain' },
        });
      }
    }
    const now = Date.now();
    const clientKey = request.headers.get('x-client-id') || 'anon';
    const entry = rateMap.get(clientKey);

    if (!entry || now > entry.resetAt) {
      rateMap.set(clientKey, { count: 1, resetAt: now + RATE_WINDOW_MS });
      return HttpResponse.json({ ok: true, remaining: RATE_LIMIT - 1 });
    }

    if (entry.count >= RATE_LIMIT) {
      const retryAfter = Math.max(1, Math.ceil((entry.resetAt - now) / 1000));
      return HttpResponse.json(
        { error: 'rate_limited' },
        {
          status: 429,
          headers: {
            'Retry-After': String(retryAfter),
            'X-RateLimit-Limit': String(RATE_LIMIT),
            'X-RateLimit-Remaining': '0',
          },
        },
      );
    }

    entry.count += 1;
    return HttpResponse.json(
      { ok: true, remaining: Math.max(0, RATE_LIMIT - entry.count) },
      {
        headers: {
          'X-RateLimit-Limit': String(RATE_LIMIT),
          'X-RateLimit-Remaining': String(Math.max(0, RATE_LIMIT - entry.count)),
        },
      },
    );
  }),
  ,
  // MSW Defaults control endpoints
  http.get('/__msw__/defaults', async () => {
    return HttpResponse.json(__mswDefaults);
  }),
  http.post('/__msw__/defaults', async ({ request }) => {
    try {
      const body = (await request.json().catch(() => ({}))) as any;
      if (typeof body.latencyMs === 'number' && body.latencyMs >= 0) {
        __mswDefaults.latencyMs = Math.min(10000, body.latencyMs);
      }
      if (typeof body.errorRate === 'number' && body.errorRate >= 0) {
        __mswDefaults.errorRate = Math.max(0, Math.min(1, body.errorRate));
      }
      return HttpResponse.json(__mswDefaults);
    } catch {
      return new HttpResponse('Invalid body', {
        status: 400,
        headers: { 'Content-Type': 'text/plain' },
      });
    }
  }),
];

export default handlers;
