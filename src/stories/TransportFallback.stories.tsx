// src/stories/TransportFallback.stories.tsx
import React, { useEffect, useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';

function TransportFallbackDemo() {
  const [wsUrl, setWsUrl] = useState('ws://localhost:4000');
  const [sseUrl, setSseUrl] = useState('http://localhost:3002/api/sse-demo');
  const [transport, setTransport] = useState<'none' | 'ws' | 'sse'>('none');
  const [useFetchSSE, setUseFetchSSE] = useState(false);
  const [authHeader, setAuthHeader] = useState('');
  const [customHeader, setCustomHeader] = useState('');
  const abortRef = useRef<AbortController | null>(null);
  const [running, setRunning] = useState(false);
  const [logs, setLogs] = useState<Array<{ ts: number; source: 'ws' | 'sse'; data: any }>>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const esRef = useRef<EventSource | null>(null);
  const wsTimeoutRef = useRef<any>(null);

  const append = (source: 'ws' | 'sse', data: any) => {
    setLogs((prev) => [{ ts: Date.now(), source, data }, ...prev].slice(0, 100));
  };

  const stop = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    setRunning(false);
    setTransport('none');
    try {
      wsRef.current?.close();
    } catch {}
    try {
      esRef.current?.close();
    } catch {}
    wsRef.current = null;
    esRef.current = null;
    if (wsTimeoutRef.current) {
      clearTimeout(wsTimeoutRef.current);
      wsTimeoutRef.current = null;
    }
  };

  const start = () => {
    stop();
    setLogs([]);
    setRunning(true);

    // Try WebSocket first with a short timeout; if unreachable, fall back to SSE
    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setTransport('ws');
        append('ws', { type: 'open' });
      };
      ws.onmessage = (ev) => {
        try {
          append('ws', JSON.parse(ev.data));
        } catch {
          append('ws', ev.data);
        }
      };
      ws.onerror = () => {
        // Try fallback ASAP on error
        if (transport !== 'ws') fallbackToSSE();
      };
      ws.onclose = () => {
        append('ws', { type: 'close' });
      };

      // If WS doesn't connect within 1.5s, fallback
      wsTimeoutRef.current = setTimeout(() => {
        if (transport !== 'ws') fallbackToSSE();
      }, 1500);
    } catch {
      fallbackToSSE();
    }
  };

  const fallbackToSSE = () => {
    if (useFetchSSE) return startFetchSSE();
    // Close any WS in progress
    try {
      wsRef.current?.close();
    } catch {}
    wsRef.current = null;

    try {
      const es = new EventSource(sseUrl);
      esRef.current = es;
      es.onopen = () => {
        setTransport('sse');
        append('sse', { type: 'open' });
      };
      es.onmessage = (ev) => {
        try {
          append('sse', JSON.parse(ev.data));
        } catch {
          append('sse', ev.data);
        }
      };
      es.addEventListener('sse-demo', (ev: any) => {
        try {
          append('sse', JSON.parse(ev.data));
        } catch {
          append('sse', ev.data);
        }
      });
      es.onerror = () => {
        append('sse', { type: 'error' });
      };
    } catch (e: any) {
      append('sse', { type: 'error', message: e?.message });
    }
  };

  useEffect(() => () => stop(), []);

  const startFetchSSE = async () => {
    try {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setTransport('sse');
      append('sse', { type: 'open', note: 'fetch-based SSE' });

      const headers: Record<string, string> = { Accept: 'text/event-stream' };
      if (authHeader.trim()) headers['Authorization'] = authHeader.trim();
      if (customHeader.trim()) headers['X-Custom'] = customHeader.trim();

      const res = await fetch(sseUrl, { method: 'GET', headers, signal: controller.signal });
      if (!res.ok || !res.body) {
        append('sse', { type: 'error', status: res.status });
        return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let idx;
        while ((idx = buffer.indexOf('\n\n')) >= 0) {
          const chunk = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 2);
          if (!chunk) continue;
          // Basic SSE parsing: support "event:" and "data:" lines
          const lines = chunk.split('\n');
          let eventName = 'message';
          const dataLines: string[] = [];
          for (const line of lines) {
            if (line.startsWith('event:')) eventName = line.slice(6).trim();
            if (line.startsWith('data:')) dataLines.push(line.slice(5).trim());
          }
          const dataStr = dataLines.join('\n');
          try {
            append('sse', JSON.parse(dataStr));
          } catch {
            append('sse', { event: eventName, data: dataStr });
          }
        }
      }
    } catch (e: any) {
      if (e?.name !== 'AbortError') append('sse', { type: 'error', message: e?.message });
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <h3>Live WS → SSE Fallback (Real SSE)</h3>
      <p>
        Attempts WebSocket first; falls back to SSE if WS is unavailable or times out. Start the SSE
        demo server with: <code>npm run sse:demo</code>
      </p>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
        <label>
          WS URL:
          <input
            style={{ width: 360, marginLeft: 8 }}
            value={wsUrl}
            onChange={(e) => setWsUrl(e.target.value)}
          />
        </label>
        <label>
          SSE URL:
          <input
            style={{ width: 360, marginLeft: 8 }}
            value={sseUrl}
            onChange={(e) => setSseUrl(e.target.value)}
          />
        </label>
        <label>
          <input
            type="checkbox"
            checked={useFetchSSE}
            onChange={(e) => setUseFetchSSE(e.target.checked)}
          />{' '}
          Use fetch-based SSE (supports headers)
        </label>
        {useFetchSSE && (
          <>
            <label>
              Authorization:
              <input
                style={{ width: 260, marginLeft: 8 }}
                placeholder="Bearer ..."
                value={authHeader}
                onChange={(e) => setAuthHeader(e.target.value)}
              />
            </label>
            <label>
              X-Custom:
              <input
                style={{ width: 200, marginLeft: 8 }}
                placeholder="custom"
                value={customHeader}
                onChange={(e) => setCustomHeader(e.target.value)}
              />
            </label>
          </>
        )}
        {!running ? <button onClick={start}>Start</button> : <button onClick={stop}>Stop</button>}
      </div>

      <div style={{ marginBottom: 8 }}>
        Active transport: <strong>{transport.toUpperCase()}</strong>
        {useFetchSSE ? ' (fetch mode)' : ''}
      </div>

      <div
        style={{
          fontFamily: 'monospace',
          whiteSpace: 'pre-wrap',
          background: '#101322',
          color: '#d7e0ff',
          padding: 12,
          borderRadius: 8,
          maxHeight: 320,
          overflow: 'auto',
        }}
      >
        {logs.length === 0 ? (
          <div>No events yet…</div>
        ) : (
          <ul>
            {logs.map((l, i) => (
              <li key={i}>
                [{new Date(l.ts).toLocaleTimeString()}] {l.source.toUpperCase()} →{' '}
                {typeof l.data === 'string' ? l.data : JSON.stringify(l.data)}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

const meta = {
  title: 'Live/WS SSE Fallback',
  component: TransportFallbackDemo,
  parameters: {
    helpDoc: '?path=/story/specs-ai-ai-gateway-full-specification--page',
    helpTitle: 'AI Gateway Spec (concept)',
    helpDocs: [
      {
        href: '?path=/story/overview-architecture--page#layered-view',
        title: 'Architecture — Layered View',
      },
    ],
    docs: {
      description: {
        component:
          'Live transport demo that attempts WebSocket first and falls back to SSE. Start the local SSE server: npm run sse:demo (http://localhost:3002/api/sse-demo).',
      },
    },
    layout: 'padded',
  },
} satisfies Meta<typeof TransportFallbackDemo>;

export default meta;

export const Default: StoryObj<typeof meta> = {};
