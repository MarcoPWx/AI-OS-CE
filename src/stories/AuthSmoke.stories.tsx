// src/stories/AuthSmoke.stories.tsx
import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';

function AuthSmoke() {
  const [state, setState] = useState<'logged-out' | 'authenticating' | 'authenticated'>(
    'logged-out',
  );
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);

  const login = async () => {
    setState('authenticating');
    await new Promise((r) => setTimeout(r, 600));
    setUser({ id: 'demo', email: 'demo@quizmentor.app' });
    setState('authenticated');
  };
  const logout = () => {
    setUser(null);
    setState('logged-out');
  };

  return (
    <div style={{ padding: 16 }}>
      <h3>Auth Smoke (state machine)</h3>
      <div>
        State: <strong data-testid="state">{state}</strong>
      </div>
      {state === 'logged-out' && <button onClick={login}>Login</button>}
      {state === 'authenticating' && <div>Authenticating…</div>}
      {state === 'authenticated' && (
        <div>
          <div>
            User: <code>{user?.email}</code>
          </div>
          <button onClick={logout}>Logout</button>
        </div>
      )}
    </div>
  );
}

const meta = {
  title: 'Auth/Smoke',
  component: AuthSmoke,
  parameters: {
    helpDoc: '?path=/story/specs-security-security-privacy-extended-model--page',
    helpTitle: 'Security & Privacy — Extended Model',
    docs: {
      description: {
        component:
          'Simple state-machine to smoke test auth UX transitions without real backend calls.',
      },
    },
  },
} satisfies Meta<typeof AuthSmoke>;

export default meta;
export const Default: StoryObj<typeof meta> = {};
