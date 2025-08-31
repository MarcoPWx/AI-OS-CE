// src/stories/NetworkPlayground.stories.tsx
import React, { useEffect, useMemo, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { DefaultsChip } from './components/DefaultsChip';

const endpoints = [
  { method: 'GET', path: '/api/lessons' },
  { method: 'GET', path: '/api/quizzes' },
  { method: 'GET', path: '/api/cache' },
  { method: 'GET', path: '/api/ratelimit' },
  { method: 'POST', path: '/api/login' },
];

function TimelineRow({ row }: { row: any }) {
  const color = row.status >= 500 ? '#ff6b6b' : row.status >= 400 ? '#ffcc00' : '#00d084';
  return (
    <tr>
      <td>{new Date(row.ts).toLocaleTimeString()}</td>
      <td>{row.method}</td>
      <td>{row.path}</td>
      <td>{row.status}</td>
      <td>{row.ms} ms</td>
      <td style={{ color }}>{row.error || ''}</td>
    </tr>
  );
}

function NetworkPlayground() {
  const [latency, setLatency] = useState(0);
  const [errorRate, setErrorRate] = useState(0);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [noDefaults, setNoDefaults] = useState(false);
  const [currentCfg, setCurrentCfg] = useState<{ latencyMs: number; errorRate: number } | null>(
    null,
  );
  const [running, setRunning] = useState(false);

  const addRow = (row: any) => setTimeline((prev) => [row, ...prev].slice(0, 200));

  const applyProfile = async () => {
    await fetch('/__msw__/defaults', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ latencyMs: latency, errorRate }),
    });
    // refresh current config
    const cfg = await fetch('/__msw__/defaults')
      .then((r) => r.json())
      .catch(() => null);
    if (cfg) {
      setLatency(cfg.latencyMs ?? latency);
      setErrorRate(cfg.errorRate ?? errorRate);
      setCurrentCfg({ latencyMs: cfg.latencyMs ?? 0, errorRate: cfg.errorRate ?? 0 });
    }
  };

  const resetProfile = async () => {
    setLatency(0);
    setErrorRate(0);
    await fetch('/__msw__/defaults', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ latencyMs: 0, errorRate: 0 }),
    });
    setCurrentCfg({ latencyMs: 0, errorRate: 0 });
  };

  const call = async (method: string, path: string) => {
    const ts = Date.now();
    try {
      const init: RequestInit =
        method === 'POST'
          ? {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                ...(noDefaults ? { 'x-msw-no-defaults': '1' } : {}),
              },
              body: JSON.stringify({ email: 'demo@quizmentor.app' }),
            }
          : { method: 'GET', headers: noDefaults ? { 'x-msw-no-defaults': '1' } : undefined };
      const res = await fetch(path, init);
      const ms = Date.now() - ts;
      addRow({ ts, method, path, status: res.status, ms });
    } catch (e: any) {
      const ms = Date.now() - ts;
      addRow({ ts, method, path, status: -1, ms, error: e?.message || 'network error' });
    }
  };

  const runScenario = async () => {
    setRunning(true);
    setTimeline([]);
    // Sequential demo: lessons → quizzes → cache (twice) → ratelimit (4x) → login
    await call('GET', '/api/lessons');
    await call('GET', '/api/quizzes');
    await call('GET', '/api/cache');
    await call('GET', '/api/cache'); // expect 304
    for (let i = 0; i < 4; i++) await call('GET', '/api/ratelimit'); // expect 429 by the 4th
    await call('POST', '/api/login');
    setRunning(false);
  };

  const runConcurrent = async () => {
    setRunning(true);
    setTimeline([]);
    const calls = [
      call('GET', '/api/lessons'),
      call('GET', '/api/quizzes'),
      call('GET', '/api/cache'),
      call('GET', '/api/ratelimit'),
      call('POST', '/api/login'),
    ];
    await Promise.all(calls);
    // second wave to show cache 304 and ratelimit
    await Promise.all([call('GET', '/api/cache'), call('GET', '/api/ratelimit')]);
    setRunning(false);
  };

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
    setLatency(cfg.latencyMs);
    setErrorRate(cfg.errorRate);
    setCurrentCfg(cfg);
  };

  useEffect(() => {
    (async () => {
      const cfg = await fetch('/__msw__/defaults')
        .then((r) => r.json())
        .catch(() => null);
      if (cfg) {
        setLatency(cfg.latencyMs ?? 0);
        setErrorRate(cfg.errorRate ?? 0);
        setCurrentCfg({ latencyMs: cfg.latencyMs ?? 0, errorRate: cfg.errorRate ?? 0 });
      }
    })();
  }, []);

  return (
    <div style={{ padding: 16 }}>
      <h3>Network Playground (MSW Defaults + Timeline)</h3>
      <div style={{ marginBottom: 8 }}>
        <DefaultsChip />
      </div>
      <p>
        Set global latency/error defaults that MSW handlers read, then run a scenario across
        multiple endpoints and inspect the request timeline.
      </p>

      <div
        style={{
          display: 'flex',
          gap: 16,
          alignItems: 'center',
          flexWrap: 'wrap',
          marginBottom: 12,
        }}
      >
        <div>
          <div style={{ fontWeight: 600 }}>Current Defaults</div>
          <div style={{ fontSize: 12, opacity: 0.8 }}>
            latencyMs={currentCfg?.latencyMs ?? 0}, errorRate={currentCfg?.errorRate ?? 0}
          </div>
        </div>
        <div>
          <div style={{ fontWeight: 600 }}>Presets</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => applyPreset('default')}>Default</button>
            <button onClick={() => applyPreset('slower')}>Slower</button>
            <button onClick={() => applyPreset('flaky')}>Flaky</button>
            <button onClick={() => applyPreset('chaos')}>Chaos</button>
          </div>
        </div>
        <label>
          Latency (ms):
          <input
            type="number"
            min={0}
            max={10000}
            value={latency}
            onChange={(e) => setLatency(Number(e.target.value) || 0)}
            style={{ width: 100, marginLeft: 8 }}
          />
        </label>
        <label>
          Error Rate (0.0–1.0):
          <input
            type="number"
            step="0.05"
            min={0}
            max={1}
            value={errorRate}
            onChange={(e) => setErrorRate(Number(e.target.value) || 0)}
            style={{ width: 100, marginLeft: 8 }}
          />
        </label>
        <button onClick={applyProfile}>Apply</button>
        <button onClick={resetProfile}>Reset</button>
        <label>
          <input
            type="checkbox"
            checked={noDefaults}
            onChange={(e) => setNoDefaults(e.target.checked)}
          />{' '}
          Send x-msw-no-defaults on requests
        </label>
        <button onClick={runScenario} disabled={running}>
          {running ? 'Running…' : 'Run Scenario'}
        </button>
        <button onClick={runConcurrent} disabled={running}>
          {running ? 'Running…' : 'Run Concurrent'}
        </button>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
        {endpoints.map((e) => (
          <button key={e.method + e.path} onClick={() => call(e.method, e.path)}>
            {e.method} {e.path}
          </button>
        ))}
      </div>

      <div style={{ marginTop: 12 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left' }}>Time</th>
              <th style={{ textAlign: 'left' }}>Method</th>
              <th style={{ textAlign: 'left' }}>Path</th>
              <th style={{ textAlign: 'left' }}>Status</th>
              <th style={{ textAlign: 'left' }}>Duration</th>
              <th style={{ textAlign: 'left' }}>Notes</th>
            </tr>
          </thead>
          <tbody>
            {timeline.map((row, idx) => (
              <TimelineRow key={idx} row={row} />
            ))}
            {timeline.length === 0 && (
              <tr>
                <td colSpan={6}>No requests yet…</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const meta = {
  title: 'Dev/NetworkPlayground',
  component: NetworkPlayground,
  parameters: {
    helpDoc: '?path=/story/specs-service-catalog--page#flows',
    helpTitle: 'Service Catalog — Flows',
    docs: {
      description: {
        component:
          'Set MSW latency/error defaults for all handlers, then exercise endpoints and review a live timeline with status and duration.',
      },
    },
  },
} satisfies Meta<typeof NetworkPlayground>;

export default meta;

export const Default: StoryObj<typeof meta> = {};
