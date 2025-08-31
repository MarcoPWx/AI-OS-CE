// src/stories/S2SOrchestration.stories.tsx
import React, { useMemo, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { DefaultsChip } from './components/DefaultsChip';
import { userEvent, within, expect } from '@storybook/test';

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <div style={{ width: 120, fontSize: 12, opacity: 0.8 }}>{label}</div>
      <div>{children}</div>
    </label>
  );
}

function S2SOrchestration() {
  const [topic, setTopic] = useState('math');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [noDefaults, setNoDefaults] = useState(false);
  const [traceFail, setTraceFail] = useState<'none' | 'recommendations' | 'session' | 'validate'>(
    'none',
  );
  const [traceDelay, setTraceDelay] = useState<number>(0);
  const [traceJitter, setTraceJitter] = useState<number>(0);
  const [chaos, setChaos] = useState(false);
  const [chaosPercent, setChaosPercent] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<number | null>(null);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Read defaults from URL (e.g., ?traceFail=validate&traceDelay=500&noDefaults=1)
  React.useEffect(() => {
    try {
      const sp = new URLSearchParams(window.location.search);
      const tf = sp.get('traceFail') as any;
      if (tf && ['none', 'recommendations', 'session', 'validate'].includes(tf)) setTraceFail(tf);
      const td = Number(sp.get('traceDelay') || '0');
      if (!Number.isNaN(td)) setTraceDelay(Math.max(0, Math.min(10000, td)));
      const nd = sp.get('noDefaults');
      if (nd === '1' || nd === 'true') setNoDefaults(true);
      const ch = sp.get('chaos');
      if (ch === '1' || ch === 'true') setChaos(true);
      const cp = Number(sp.get('chaosPercent') || '0');
      if (!Number.isNaN(cp)) setChaosPercent(Math.max(0, Math.min(100, cp)));
      const jitter = Number(sp.get('traceJitter') || '0');
      if (!Number.isNaN(jitter)) setTraceJitter(Math.max(0, Math.min(10000, jitter)));
      const top = sp.get('topic');
      if (top) setTopic(top);
      const diff = sp.get('difficulty') as any;
      if (['easy', 'medium', 'hard'].includes(diff)) setDifficulty(diff);
    } catch {}
  }, []);

  const headers = useMemo(() => {
    const h: Record<string, string> = { 'Content-Type': 'application/json' };
    if (noDefaults) h['x-msw-no-defaults'] = '1';
    if (traceFail && traceFail !== 'none') h['x-trace-fail'] = traceFail;
    if (traceDelay && traceDelay > 0) h['x-trace-delay'] = String(traceDelay);
    if (traceJitter && traceJitter > 0) h['x-trace-jitter'] = String(traceJitter);
    return h;
  }, [noDefaults, traceFail, traceDelay, traceJitter]);

  const start = async () => {
    setLoading(true);
    setStatus(null);
    setError(null);
    setData(null);
    try {
      // Apply chaos locally by overriding header on this call
      const h: Record<string, string> = { ...headers };
      if (chaos && (!traceFail || traceFail === 'none')) {
        const roll = Math.random() * 100;
        if (roll < chaosPercent) {
          const opts: Array<'recommendations' | 'session' | 'validate'> = [
            'recommendations',
            'session',
            'validate',
          ];
          const pick = opts[Math.floor(Math.random() * opts.length)];
          h['x-trace-fail'] = pick;
        }
      }
      const res = await fetch('/api/quiz/start', {
        method: 'POST',
        headers: h,
        body: JSON.stringify({ topic, difficulty }),
      });
      setStatus(res.status);
      if (!res.ok) {
        // Try to parse JSON for trace details even on failure
        const ctype = res.headers.get('content-type') || '';
        if (ctype.includes('application/json')) {
          const json = await res.json();
          setData(json);
          setError(json?.error || `HTTP ${res.status}`);
        } else {
          const txt = await res.text();
          setError(txt || `HTTP ${res.status}`);
        }
      } else {
        const json = await res.json();
        setData(json);
      }
    } catch (e: any) {
      setError(e?.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 16, maxWidth: 860 }}>
      <h3>Service-to-Service Orchestration Playground</h3>
      <p>
        Simulates a composite endpoint that orchestrates multiple services (profile → session →
        validation). Uses POST /api/quiz/start (MSW).
      </p>

      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
        <DefaultsChip />
        <label style={{ marginLeft: 'auto' }}>
          <input
            type="checkbox"
            checked={noDefaults}
            onChange={(e) => setNoDefaults(e.target.checked)}
          />{' '}
          No defaults (x-msw-no-defaults)
        </label>
        <label>
          <input type="checkbox" checked={chaos} onChange={(e) => setChaos(e.target.checked)} />{' '}
          Chaos (random fail)
        </label>
        {chaos && (
          <label style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            %
            <input
              type="number"
              min={0}
              max={100}
              value={chaosPercent}
              onChange={(e) =>
                setChaosPercent(Math.max(0, Math.min(100, Number(e.target.value) || 0)))
              }
              style={{ width: 80 }}
            />
          </label>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
        <div style={{ padding: 12, border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8 }}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>Request</div>
          <Row label="Topic">
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., math"
            />
          </Row>
          <Row label="Difficulty">
            <select value={difficulty} onChange={(e) => setDifficulty(e.target.value as any)}>
              <option>easy</option>
              <option>medium</option>
              <option>hard</option>
            </select>
          </Row>
          <Row label="Trace Fail At">
            <select
              aria-label="trace-fail"
              value={traceFail}
              onChange={(e) => setTraceFail(e.target.value as any)}
            >
              <option value="none">none</option>
              <option value="recommendations">recommendations</option>
              <option value="session">session</option>
              <option value="validate">validate</option>
            </select>
          </Row>
          <Row label="Trace Delay (ms)">
            <input
              aria-label="trace-delay"
              type="number"
              min={0}
              max={10000}
              value={traceDelay}
              onChange={(e) => setTraceDelay(Number(e.target.value) || 0)}
            />
          </Row>
          <Row label="Delay Jitter (ms)">
            <input
              aria-label="trace-jitter"
              type="number"
              min={0}
              max={10000}
              value={traceJitter}
              onChange={(e) => setTraceJitter(Number(e.target.value) || 0)}
            />
          </Row>
          <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
            <button onClick={start} disabled={loading}>
              {loading ? 'Starting…' : 'Start Orchestration'}
            </button>
            <button
              type="button"
              onClick={async () => {
                // Build a curl for current request
                const url = new URL('/api/quiz/start', window.location.origin);
                const parts: string[] = [
                  'curl',
                  '-X',
                  'POST',
                  `'${url.toString()}'`,
                  '-H',
                  `'Content-Type: application/json'`,
                ];
                if (noDefaults) parts.push('-H', `'x-msw-no-defaults: 1'`);
                if (traceFail && traceFail !== 'none')
                  parts.push('-H', `'x-trace-fail: ${traceFail}'`);
                if (traceDelay && traceDelay > 0)
                  parts.push('-H', `'x-trace-delay: ${traceDelay}'`);
                if (traceJitter && traceJitter > 0)
                  parts.push('-H', `'x-trace-jitter: ${traceJitter}'`);
                const body = JSON.stringify({ topic, difficulty });
                parts.push('-d', `'${body.replace(/'/g, "'\\''")}'`);
                try {
                  await navigator.clipboard.writeText(parts.join(' '));
                } catch {}
              }}
            >
              Copy cURL (request)
            </button>
            <button
              type="button"
              onClick={() => {
                const params = new URLSearchParams();
                params.set('traceFail', 'none');
                params.set('topic', topic);
                params.set('difficulty', difficulty);
                window.location.search = params.toString();
              }}
            >
              Happy
            </button>
            <button
              type="button"
              onClick={() => {
                const params = new URLSearchParams();
                params.set('traceFail', 'validate');
                params.set('traceDelay', '300');
                params.set('noDefaults', '1');
                params.set('topic', topic);
                params.set('difficulty', difficulty);
                window.location.search = params.toString();
              }}
            >
              Validate Failure
            </button>
            <button
              type="button"
              onClick={() => {
                const params = new URLSearchParams();
                params.set('chaos', '1');
                params.set('chaosPercent', String(50));
                params.set('traceJitter', '500');
                params.set('topic', topic);
                params.set('difficulty', difficulty);
                window.location.search = params.toString();
              }}
            >
              Chaos Demo
            </button>
          </div>
        </div>

        <div style={{ padding: 12, border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8 }}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>Response</div>
          <div>Status: {status ?? '-'}</div>
          {error && <div style={{ color: '#ff6b6b' }}>{error}</div>}
          {data && (
            <>
              <div style={{ marginBottom: 6, fontWeight: 600 }}>Trace</div>
              <ul style={{ marginTop: 0 }}>
                {(data.trace || []).map((t: any, i: number) => {
                  const color = t.status >= 500 ? '#ff6b6b' : '#d7e0ff';
                  return (
                    <li key={i} style={{ color }}>
                      <code>{t.step}</code> • {t.service} • {t.status}
                    </li>
                  );
                })}
              </ul>
              <div style={{ marginTop: 8, fontWeight: 600 }}>Payload</div>
              <pre style={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
                {JSON.stringify(data, null, 2)}
              </pre>
            </>
          )}
          {!error && !data && !loading && <div>Click \"Start Orchestration\" to run.</div>}
        </div>

        <div style={{ padding: 12, border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8 }}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>DB Writes Preview (simulated)</div>
          {(() => {
            const sessionId = data?.sessionId || '(pending)';
            const userId = data?.profile?.userId || 'demo-user';
            const createdAt = new Date().toISOString();
            const preview = {
              sessions: { insert: { userId, topic, difficulty, createdAt } },
              session_events: { insert: { type: 'start', sessionId } },
              ...(Array.isArray(data?.validation) ? { validation: { log: data.validation } } : {}),
              ...(error
                ? {
                    error_log: {
                      message: error,
                      trace: Array.isArray(data?.trace) ? data.trace : undefined,
                    },
                  }
                : {}),
            };
            const copy = async () => {
              try {
                await navigator.clipboard.writeText(JSON.stringify(preview, null, 2));
              } catch {}
            };
            return (
              <>
                <pre
                  style={{
                    fontFamily: 'monospace',
                    whiteSpace: 'pre-wrap',
                    maxHeight: 240,
                    overflow: 'auto',
                  }}
                >
                  {JSON.stringify(preview, null, 2)}
                </pre>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={copy}>Copy JSON</button>
                  <button
                    onClick={() => {
                      try {
                        const blob = new Blob([JSON.stringify(preview, null, 2)], {
                          type: 'application/json',
                        });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'db-preview.json';
                        a.click();
                        URL.revokeObjectURL(url);
                      } catch {}
                    }}
                  >
                    Export JSON
                  </button>
                </div>
              </>
            );
          })()}
          <div style={{ fontSize: 12, opacity: 0.8, marginTop: 8 }}>
            Note: This preview illustrates intended writes for the orchestrated flow.
          </div>
        </div>
      </div>
    </div>
  );
}

const meta = {
  title: 'Dev/S2S Orchestration',
  component: S2SOrchestration,
  parameters: {
    docs: {
      description: {
        component:
          'Composite S2S orchestration over POST /api/quiz/start with trace controls and failure injection.',
      },
    },
  },
} satisfies Meta<typeof S2SOrchestration>;

export default meta;

export const HappyPath: StoryObj<typeof meta> = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const select = c.getByLabelText('trace-fail') as HTMLSelectElement;
    await userEvent.selectOptions(select, 'none');
    await userEvent.click(c.getByRole('button', { name: /start orchestration/i }));
    await expect(c.getByText(/status: 200/i)).toBeInTheDocument();
    await expect(c.getByText(/recommendations/i)).toBeInTheDocument();
    await expect(c.getByText(/validate:batch/i)).toBeInTheDocument();
  },
};

export const ValidateFailure: StoryObj<typeof meta> = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const select = c.getByLabelText('trace-fail') as HTMLSelectElement;
    await userEvent.selectOptions(select, 'validate');
    await userEvent.click(c.getByRole('button', { name: /start orchestration/i }));
    await expect(c.getByText(/status: 500/i)).toBeInTheDocument();
    await expect(c.getByText(/validate:batch/i)).toBeInTheDocument();
    await expect(c.getByText(/trace failure/i)).toBeInTheDocument();
  },
};

export const Default: StoryObj<typeof meta> = {};
