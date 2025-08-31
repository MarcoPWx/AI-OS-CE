// src/stories/LiveTaskBoard.stories.tsx
import React, { useEffect, useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { createMockWebSocket } from '@/services/mockWebSocket';
import { DefaultsChip } from './components/DefaultsChip';

function LiveTaskBoard() {
  const wsRef = useRef<ReturnType<typeof createMockWebSocket> | null>(null);
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    // Instance-local MockWebSocket (respects Storybook wsScenario global)
    const ws = createMockWebSocket('ws://mock');
    wsRef.current = ws;

    const onMessage = (ev: MessageEvent) => {
      try {
        const msg = JSON.parse(ev.data);
        if (msg?.type === 'task:update') {
          setEvents((prev) => [msg.payload, ...prev].slice(0, 20));
        }
      } catch {}
    };

    ws.addEventListener('message', onMessage);
    return () => {
      ws.removeEventListener('message', onMessage);
      ws.close();
    };
  }, []);

  return (
    <div style={{ padding: 16 }}>
      <h3>Live Task Board (WS mock)</h3>
      <div style={{ marginBottom: 8 }}>
        <DefaultsChip />
      </div>
      <p>
        Shows incoming task:update events from the WebSocket mock. Use the WS Scenario toolbar to
        switch scenarios; this story defaults to taskBoardLive.
      </p>
      <ul>
        {events.map((e, idx) => (
          <li key={idx}>
            <code>{e.id}</code> • <strong>{e.title}</strong> • <em>{e.status}</em> •{' '}
            {new Date(e.updatedAt).toLocaleTimeString()}
          </li>
        ))}
      </ul>
      {events.length === 0 && <div>No updates yet…</div>}
    </div>
  );
}

const meta = {
  title: 'Live/TaskBoard',
  component: LiveTaskBoard,
  parameters: {
    helpDoc: '/docs/mocks/WEBSOCKET_MOCKS.md',
    helpTitle: 'WebSocket Mocks',
    helpDocs: [
      {
        href: '?path=/story/specs-service-catalog--page#websocket',
        title: 'Service Catalog — WebSocket',
      },
    ],
    docs: {
      description: {
        component:
          'A simple real-time task board feed driven by the WebSocket mock. Switch scenarios via the WS Scenario toolbar.\nTo simulate in the app, run with WS_MOCK_SCENARIO=taskBoardLive and EXPO_PUBLIC_USE_WS_MOCKS=1.',
      },
    },
    globals: { wsScenario: 'taskBoardLive' },
  },
} satisfies Meta<typeof LiveTaskBoard>;

export default meta;

export const Default: StoryObj<typeof meta> = {};
