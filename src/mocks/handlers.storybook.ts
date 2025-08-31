// src/mocks/handlers.storybook.ts
import { http, HttpResponse, delay } from 'msw';
import { securityHandlers } from './handlers/security';

function getDefaults() {
  try {
    const raw = localStorage.getItem('__mswDefaults__');
    if (!raw) return { latencyMs: 0, errorRate: 0 };
    const val = JSON.parse(raw);
    return { latencyMs: Number(val.latencyMs) || 0, errorRate: Number(val.errorRate) || 0 };
  } catch {
    return { latencyMs: 0, errorRate: 0 };
  }
}

// In-memory Epics store for Storybook-only CRUD
const __epics: any[] = [
  {
    id: 'docs-dx-mdx3',
    title: 'Docs & DX stabilization (MDX3)',
    status: 'In Progress',
    priority: 'P1',
    owner: 'Docs Team',
    eta: 'This sprint',
    risk: 'Low',
  },
  {
    id: 'qa-guardrails',
    title: 'QA & Guardrails',
    status: 'Planned',
    priority: 'P1',
    owner: 'QE',
    eta: 'Next sprint',
    risk: 'Medium',
  },
  {
    id: 'perf-bundle',
    title: 'Performance & Bundling',
    status: 'Planned',
    priority: 'P2',
    owner: 'Core',
    eta: 'Next sprint',
    risk: 'Medium',
  },
];

export const storybookHandlers = [
  // Security handlers for testing
  ...securityHandlers,

  // Epics CRUD (Storybook-only)
  http.get('/api/epics', async ({ request }) => {
    const noDefaults = request.headers.get('x-msw-no-defaults') === '1';
    const { latencyMs, errorRate } = getDefaults();
    // Apply global defaults unless explicitly disabled
    if (!noDefaults) {
      if (latencyMs > 0) await delay(Math.min(10000, latencyMs));
      if (errorRate > 0 && Math.random() < errorRate) {
        return new HttpResponse(
          JSON.stringify({
            error: 'Injected error',
            trace: [{ step: 'defaults', service: 'msw', status: 503 }],
          }),
          { status: 503, headers: { 'Content-Type': 'application/json' } },
        );
      }
    }

    // Trace Mode overrides (optional): x-trace-delay (ms), x-trace-fail (recommendations|session|validate)
    const traceDelay = Number(request.headers.get('x-trace-delay') || '0');
    const traceFail = (request.headers.get('x-trace-fail') || '').toLowerCase();
    const traceJitter = Number(request.headers.get('x-trace-jitter') || '0');
    if (traceDelay > 0) await delay(Math.min(10000, traceDelay));
    if (traceJitter > 0) {
      const extra = Math.floor(Math.random() * Math.max(0, traceJitter + 1));
      if (extra > 0) await delay(Math.min(10000, extra));
    }
    return HttpResponse.json({ epics: __epics });
  }),
  http.post('/api/epics', async ({ request }) => {
    const noDefaults = request.headers.get('x-msw-no-defaults') === '1';
    const { latencyMs, errorRate } = getDefaults();
    if (!noDefaults) {
      if (latencyMs > 0) await delay(Math.min(10000, latencyMs));
      if (errorRate > 0 && Math.random() < errorRate) {
        return new HttpResponse('Injected error', { status: 503 });
      }
    }
    const body = await request.json().catch(() => ({}) as any);
    const newEpic = {
      id: body?.id || `ep_${Date.now().toString(36)}`,
      title: body?.title || 'Untitled Epic',
      status: body?.status || 'Planned',
      priority: body?.priority || 'P2',
      owner: body?.owner || null,
      eta: body?.eta || null,
      risk: body?.risk || null,
    };
    __epics.push(newEpic);
    return HttpResponse.json(newEpic, { status: 201 });
  }),
  http.put(/\/api\/epics\/[^/]+$/, async ({ request }) => {
    const noDefaults = request.headers.get('x-msw-no-defaults') === '1';
    const { latencyMs, errorRate } = getDefaults();
    if (!noDefaults) {
      if (latencyMs > 0) await delay(Math.min(10000, latencyMs));
      if (errorRate > 0 && Math.random() < errorRate) {
        return new HttpResponse('Injected error', { status: 503 });
      }
    }
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop() as string;
    const idx = __epics.findIndex((e) => e.id === id);
    if (idx === -1) return HttpResponse.json({ error: 'not_found' }, { status: 404 });
    const patch = await request.json().catch(() => ({}) as any);
    __epics[idx] = { ...__epics[idx], ...patch };
    return HttpResponse.json(__epics[idx]);
  }),
  http.delete(/\/api\/epics\/[^/]+$/, async ({ request }) => {
    const noDefaults = request.headers.get('x-msw-no-defaults') === '1';
    const { latencyMs, errorRate } = getDefaults();
    if (!noDefaults) {
      if (latencyMs > 0) await delay(Math.min(10000, latencyMs));
      if (errorRate > 0 && Math.random() < errorRate) {
        return new HttpResponse('Injected error', { status: 503 });
      }
    }
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop() as string;
    const idx = __epics.findIndex((e) => e.id === id);
    if (idx === -1) return HttpResponse.json({ error: 'not_found' }, { status: 404 });
    const removed = __epics.splice(idx, 1)[0];
    return HttpResponse.json(removed);
  }),

  // Composite S2S: Start Quiz (simulated orchestration)
  http.post('/api/quiz/start', async ({ request }) => {
    const noDefaults = request.headers.get('x-msw-no-defaults') === '1';
    const { latencyMs, errorRate } = getDefaults();
    if (!noDefaults) {
      if (latencyMs > 0) await delay(Math.min(10000, latencyMs));
      if (errorRate > 0 && Math.random() < errorRate) {
        return new HttpResponse('Injected error', { status: 503 });
      }
    }
    const body = await request.json().catch(() => ({}) as any);
    const topic = body?.topic || 'general';
    const difficulty = body?.difficulty || 'medium';

    // Simulated downstreams and trace collection
    const trace: Array<{ step: string; service: string; status: number }> = [];

    // recommendations
    if (traceFail === 'recommendations') {
      trace.push({ step: 'recommendations', service: 'adaptive-engine', status: 500 });
      return new HttpResponse(
        JSON.stringify({ error: 'Trace failure at recommendations', trace }),
        { status: 500, headers: { 'Content-Type': 'application/json' } },
      );
    }
    trace.push({ step: 'recommendations', service: 'adaptive-engine', status: 200 });
    const profile = {
      userId: 'demo-user',
      recommendedDifficulty: difficulty,
      learningStyle: 'visual',
    };

    // session:start
    if (traceFail === 'session') {
      trace.push({ step: 'session:start', service: 'learning-orchestrator', status: 500 });
      return new HttpResponse(
        JSON.stringify({ error: 'Trace failure at session:start', profile, trace }),
        { status: 500, headers: { 'Content-Type': 'application/json' } },
      );
    }
    const session = {
      id: `sess_${Date.now().toString(36)}`,
      topic,
      difficulty,
      createdAt: new Date().toISOString(),
    };
    trace.push({ step: 'session:start', service: 'learning-orchestrator', status: 201 });

    // prepare questions
    const questions = [
      { id: 'q1', text: `(${topic}) What is 2+2?`, options: ['3', '4', '5', '6'], correct: 1 },
      {
        id: 'q2',
        text: `(${topic}) Select the even number`,
        options: ['1', '2', '3', '5'],
        correct: 1,
      },
    ];
    // validate:batch
    if (traceFail === 'validate') {
      trace.push({ step: 'validate:batch', service: 'bloom-validator', status: 500 });
      return new HttpResponse(
        JSON.stringify({
          error: 'Trace failure at validate:batch',
          sessionId: session.id,
          profile,
          questions,
          trace,
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } },
      );
    }
    const validation = { results: questions.map((q) => ({ id: q.id, ok: true })) };
    trace.push({ step: 'validate:batch', service: 'bloom-validator', status: 200 });

    return HttpResponse.json({
      sessionId: session.id,
      profile,
      questions,
      validation: validation.results,
      trace,
    });
  }),

  // POST /api/tooltips/generate accepts JSON: { input: string }
  // Special triggers in `input` for Storybook demos:
  // - TRIGGER_RATE_LIMIT -> 429 with Retry-After
  // - TRIGGER_ERROR -> 500
  // - TRIGGER_CACHED -> 200 with ETag, subsequent calls w/ If-None-Match -> 304
  http.post('/api/tooltips/generate', async ({ request }) => {
    const { latencyMs, errorRate } = getDefaults();
    const noDefaults = request.headers.get('x-msw-no-defaults') === '1';
    if (!noDefaults) {
      if (latencyMs > 0) await delay(Math.min(10000, latencyMs));
      if (errorRate > 0 && Math.random() < errorRate) {
        return new HttpResponse('Injected error', {
          status: 503,
          headers: { 'Content-Type': 'text/plain' },
        });
      }
    }

    const body = (await request.json().catch(() => ({}))) as any;
    const input: string = body?.input || '';

    if (input.includes('TRIGGER_RATE_LIMIT')) {
      return new HttpResponse(JSON.stringify({ error: 'rate_limited' }), {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': '3',
        },
      });
    }

    if (input.includes('TRIGGER_ERROR')) {
      return new HttpResponse('Internal error (simulated)', {
        status: 500,
        headers: { 'Content-Type': 'text/plain' },
      });
    }

    const etag = '\"tooltips-etag-v1\"';
    const ifNoneMatch = request.headers.get('if-none-match');
    if (input.includes('TRIGGER_CACHED')) {
      if (ifNoneMatch === etag) {
        return new HttpResponse(null, {
          status: 304,
          headers: {
            ETag: etag,
            'Cache-Control': 'public, max-age=120',
          },
        });
      }
      return new HttpResponse(
        JSON.stringify({
          input,
          html: `<p><strong>Cached Tooltip</strong>: ${input.replace('TRIGGER_CACHED', '').trim() || 'Hello!'}</p>`,
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            ETag: etag,
            'Cache-Control': 'public, max-age=120',
          },
        },
      );
    }

    // Default success response with JSON body carrying raw HTML content
    return HttpResponse.json({
      input,
      html: `<p>Tooltip for: <em>${input || 'N/A'}</em></p>`,
    });
  }),
];

export default storybookHandlers;
