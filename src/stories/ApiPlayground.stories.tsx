// src/stories/ApiPlayground.stories.tsx
import React, { useMemo, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { http, HttpResponse, delay } from 'msw';
import { userEvent, within, expect } from '@storybook/test';
import { DefaultsChip } from './components/DefaultsChip';

const endpoints = [
  { path: '/api/lessons', method: 'GET' },
  { path: '/api/quizzes', method: 'GET' },
  { path: '/api/cache', method: 'GET' },
  { path: '/api/ratelimit', method: 'GET' },
  { path: '/api/login', method: 'POST' },
  { path: '/api/tooltips/generate', method: 'POST' },
];

function ApiPlayground() {
  const [endpoint, setEndpoint] = useState(endpoints[0]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<number | null>(null);
  const [data, setData] = useState<any>(null);
  const [raw, setRaw] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [noDefaults, setNoDefaults] = useState(false);

  const isPost = endpoint.method === 'POST';

  const init = useMemo<RequestInit>(() => {
    if (isPost) {
      // For POST endpoints, provide sensible defaults
      const body =
        endpoint.path === '/api/login'
          ? { email: 'demo@quizmentor.app' }
          : endpoint.path === '/api/tooltips/generate'
            ? { input }
            : {};
      return {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(noDefaults ? { 'x-msw-no-defaults': '1' } : {}),
        },
        body: JSON.stringify(body),
      };
    }
    return {
      method: 'GET',
      headers: { 'x-client-id': 'storybook', ...(noDefaults ? { 'x-msw-no-defaults': '1' } : {}) },
    };
  }, [endpoint, isPost, input, noDefaults]);

  const callApi = async () => {
    setLoading(true);
    setStatus(null);
    setData(null);
    setRaw(null);
    setError(null);
    try {
      const res = await fetch(endpoint.path, init);
      setStatus(res.status);
      const ctype = res.headers.get('content-type') || '';
      if (res.status === 304) {
        setData({ note: 'Not Modified (ETag match)' });
      } else if (!res.ok) {
        const txt = await res.text();
        setError(txt || `HTTP ${res.status}`);
      } else if (ctype.includes('application/json')) {
        const json = await res.json();
        setData(json);
      } else {
        const txt = await res.text();
        setRaw(txt);
      }
    } catch (e: any) {
      setError(e?.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  // Quick apply presets
  const applyPreset = async (profile: 'default' | 'slower' | 'flaky' | 'chaos') => {
    const cfg =
      profile === 'slower'
        ? { latencyMs: 300, errorRate: 0 }
        : profile === 'flaky'
          ? { latencyMs: 100, errorRate: 0.2 }
          : profile === 'chaos'
            ? { latencyMs: 500, errorRate: 0.5 }
            : { latencyMs: 0, errorRate: 0 };
    await fetch('/__msw__/defaults', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cfg),
    });
  };

  return (
    <div style={{ padding: 16, maxWidth: 820 }}>
      <h3>API Playground (MSW)</h3>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
        <DefaultsChip />
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => applyPreset('default')}>Default</button>
          <button onClick={() => applyPreset('slower')}>Slower</button>
          <button onClick={() => applyPreset('flaky')}>Flaky</button>
          <button onClick={() => applyPreset('chaos')}>Chaos</button>
        </div>
        <label style={{ marginLeft: 'auto' }}>
          <input
            type="checkbox"
            checked={noDefaults}
            onChange={(e) => setNoDefaults(e.target.checked)}
          />{' '}
          No defaults (x-msw-no-defaults)
        </label>
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
        <label>
          Endpoint:
          <select
            aria-label="endpoint"
            value={`${endpoint.method} ${endpoint.path}`}
            onChange={(e) => {
              const [m, p] = e.target.value.split(' ');
              const next = endpoints.find((x) => x.method === m && x.path === p)!;
              setEndpoint(next);
            }}
          >
            {endpoints.map((e) => (
              <option key={`${e.method} ${e.path}`}>{`${e.method} ${e.path}`}</option>
            ))}
          </select>
        </label>
        {isPost && (
          <input
            aria-label="input"
            placeholder={
              endpoint.path === '/api/tooltips/generate'
                ? 'Enter text (use TRIGGER_*)'
                : 'POST body preset'
            }
            value={input}
            onChange={(e) => setInput(e.target.value)}
            style={{ width: 300 }}
          />
        )}
        <button onClick={callApi} disabled={loading}>
          {loading ? 'Loading…' : 'Call API'}
        </button>
      </div>

      <div
        style={{
          fontFamily: 'monospace',
          whiteSpace: 'pre-wrap',
          background: '#0b1020',
          color: '#d7e0ff',
          padding: 12,
          borderRadius: 8,
        }}
      >
        <div>Status: {status ?? '-'}</div>
        {error && <div style={{ color: '#ff6b6b' }}>Error: {error}</div>}
        {data && (
          <>
            <div>Data:</div>
            <pre aria-label="response">{JSON.stringify(data, null, 2)}</pre>
          </>
        )}
        {raw && (
          <>
            <div>Raw:</div>
            <pre aria-label="raw">{raw}</pre>
          </>
        )}
      </div>
    </div>
  );
}

const meta = {
  title: 'API/Playground',
  component: ApiPlayground,
  parameters: {
    helpDoc: '?path=/story/specs-service-catalog--page#msw',
    helpTitle: 'Service Catalog — MSW',
    docs: {
      description: {
        component:
          'Interactive API Playground powered by MSW. Select an endpoint and call it. Responses are mocked with caching (ETag), rate-limiting (429), and sample data. See also: /docs/mocks/SERVICE_MOCKING_COVERAGE.md',
      },
    },
    chromatic: {
      viewports: [375, 768, 1280],
    },
  },
} satisfies Meta<typeof ApiPlayground>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    // Default endpoint is GET /api/lessons
    await userEvent.click(c.getByRole('button', { name: /call api/i }));
    await expect(c.getByText(/status:/i)).toBeInTheDocument();
    await expect(c.getByLabelText('response')).toHaveTextContent('lessons');
  },
};

// Per-story MSW override: force a 500 on GET /api/lessons
export const ErrorLessons: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Overrides GET /api/lessons to return 500 for this story only.',
      },
    },
    msw: {
      handlers: [
        http.get('/api/lessons', async () => {
          return new HttpResponse('Server error (simulated)', {
            status: 500,
            headers: { 'Content-Type': 'text/plain' },
          });
        }),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole('button', { name: /call api/i }));
    await expect(c.getByText(/status: 500/i)).toBeInTheDocument();
    await expect(c.getByText(/server error/i)).toBeInTheDocument();
  },
};

// Per-story MSW override: add a noticeable delay to GET /api/lessons
export const TimeoutLessons: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Overrides GET /api/lessons to delay 2 seconds to simulate a slow network.',
      },
    },
    msw: {
      handlers: [
        http.get('/api/lessons', async () => {
          await delay(2000);
          return HttpResponse.json({ lessons: [] });
        }),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole('button', { name: /call api/i }));
    // After delay we should get 200 with empty array
    await expect(c.getByText(/status: 200/i)).toBeInTheDocument();
    await expect(c.getByLabelText('response')).toHaveTextContent('lessons');
  },
};

// Per-story MSW override: empty list for GET /api/lessons
export const EmptyLessons: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Overrides GET /api/lessons to return an empty set, demonstrating empty states.',
      },
    },
    msw: {
      handlers: [http.get('/api/lessons', async () => HttpResponse.json({ lessons: [] }))],
    },
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole('button', { name: /call api/i }));
    await expect(c.getByText(/status: 200/i)).toBeInTheDocument();
    await expect(c.getByLabelText('response')).toHaveTextContent('lessons');
  },
};

// Per-story MSW override: force a 500 on GET /api/quizzes
export const ErrorQuizzes: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Overrides GET /api/quizzes to return 500 for this story only.',
      },
    },
    msw: {
      handlers: [
        http.get(
          '/api/quizzes',
          async () => new HttpResponse('Server error (simulated)', { status: 500 }),
        ),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    // Select the quizzes endpoint
    await userEvent.selectOptions(c.getByLabelText('endpoint'), 'GET /api/quizzes');
    await userEvent.click(c.getByRole('button', { name: /call api/i }));
    await expect(c.getByText(/status: 500/i)).toBeInTheDocument();
  },
};

// EmptyQuizzes variant
export const EmptyQuizzes: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Overrides GET /api/quizzes to return an empty set, for empty-state demos.',
      },
    },
    msw: {
      handlers: [http.get('/api/quizzes', async () => HttpResponse.json({ quizzes: [] }))],
    },
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.selectOptions(c.getByLabelText('endpoint'), 'GET /api/quizzes');
    await userEvent.click(c.getByRole('button', { name: /call api/i }));
    await expect(c.getByText(/status: 200/i)).toBeInTheDocument();
    await expect(c.getByLabelText('response')).toHaveTextContent('quizzes');
  },
};

// ErrorLogin variant
export const ErrorLogin: Story = {
  parameters: {
    docs: {
      description: { story: 'Overrides POST /api/login to return 401 unauthorized.' },
    },
    msw: {
      handlers: [
        http.post('/api/login', async () => new HttpResponse('Unauthorized', { status: 401 })),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.selectOptions(c.getByLabelText('endpoint'), 'POST /api/login');
    await userEvent.click(c.getByRole('button', { name: /call api/i }));
    await expect(c.getByText(/status: 401/i)).toBeInTheDocument();
    await expect(c.getByText(/unauthorized/i)).toBeInTheDocument();
  },
};

// TimeoutLogin variant
export const TimeoutLogin: Story = {
  parameters: {
    docs: {
      description: { story: 'Overrides POST /api/login to delay 2 seconds then succeed.' },
    },
    msw: {
      handlers: [
        http.post('/api/login', async ({ request }) => {
          await delay(2000);
          const body = await request.json().catch(() => ({}) as any);
          const email = (body as any)?.email || 'demo@quizmentor.app';
          return HttpResponse.json({ token: 'delayed-token', user: { id: 'demo', email } });
        }),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.selectOptions(c.getByLabelText('endpoint'), 'POST /api/login');
    await userEvent.click(c.getByRole('button', { name: /call api/i }));
    await expect(c.getByText(/status: 200/i)).toBeInTheDocument();
    await expect(c.getByLabelText('response')).toHaveTextContent('token');
  },
};

// Cache304 variant
export const Cache304: Story = {
  parameters: {
    docs: {
      description: { story: 'Forces GET /api/cache to always return 304 Not Modified.' },
    },
    msw: {
      handlers: [
        http.get(
          '/api/cache',
          async () =>
            new HttpResponse(null, {
              status: 304,
              headers: { ETag: '"demo-etag-abc123"', 'Cache-Control': 'public, max-age=60' },
            }),
        ),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.selectOptions(c.getByLabelText('endpoint'), 'GET /api/cache');
    await userEvent.click(c.getByRole('button', { name: /call api/i }));
    await expect(c.getByText(/status: 304/i)).toBeInTheDocument();
    await expect(c.getByText(/not modified/i)).toBeInTheDocument();
  },
};

// RateLimit429 variant (perform 4 calls to exceed limit)
export const RateLimit429: Story = {
  parameters: {
    docs: {
      description: { story: 'Demonstrates 429 Too Many Requests after exceeding rate limit.' },
    },
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.selectOptions(c.getByLabelText('endpoint'), 'GET /api/ratelimit');
    // Perform 4 sequential calls; the 4th should be 429
    for (let i = 0; i < 4; i++) {
      await userEvent.click(c.getByRole('button', { name: /call api/i }));
    }
    await expect(c.getByText(/status: 429/i)).toBeInTheDocument();
    await expect(c.getByText(/rate_limited/i)).toBeInTheDocument();
  },
};

// Dark theme variant for visual coverage
export const DarkTheme: Story = {
  parameters: {
    globals: { theme: 'dark' },
    docs: { description: { story: 'Dark theme preview for API Playground.' } },
  },
};
