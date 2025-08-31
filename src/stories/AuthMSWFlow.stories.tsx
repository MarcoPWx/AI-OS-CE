// src/stories/AuthMSWFlow.stories.tsx
import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { userEvent, within, expect } from '@storybook/test';

function AuthMSWFlow() {
  const [email, setEmail] = useState('testuser@example.com');
  const [password, setPassword] = useState('password123');
  const [status, setStatus] = useState<number | null>(null);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const login = async () => {
    setLoading(true);
    setError(null);
    setStatus(null);
    setResult(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      setStatus(res.status);
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        setError(json?.error || `HTTP ${res.status}`);
      } else {
        setResult(json);
        setToken(json?.access_token || null);
      }
    } catch (e: any) {
      setError(e?.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  const session = async () => {
    setLoading(true);
    setError(null);
    setStatus(null);
    setResult(null);
    try {
      const res = await fetch('/api/auth/session', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setStatus(res.status);
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        setError(json?.error || `HTTP ${res.status}`);
      } else {
        setResult(json);
      }
    } catch (e: any) {
      setError(e?.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    setError(null);
    setStatus(null);
    setResult(null);
    try {
      const res = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setStatus(res.status);
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        setError(json?.error || `HTTP ${res.status}`);
      } else {
        setResult(json);
        setToken(null);
      }
    } catch (e: any) {
      setError(e?.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 16, maxWidth: 680 }}>
      <h3>Auth (MSW) — Login, Session, Logout</h3>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
        <label>
          Email{' '}
          <input aria-label="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label>
          Password{' '}
          <input
            aria-label="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <button onClick={login} disabled={loading}>
          {loading ? 'Working…' : 'Login'}
        </button>
        <button onClick={session} disabled={loading || !token}>
          Check Session
        </button>
        <button onClick={logout} disabled={loading || !token}>
          Logout
        </button>
      </div>
      <div>Status: {status ?? '-'}</div>
      {error && (
        <div style={{ color: '#ff6b6b' }} aria-label="error">
          {error}
        </div>
      )}
      {result && (
        <pre
          aria-label="result"
          style={{ background: '#0b1020', color: '#d7e0ff', padding: 8, borderRadius: 6 }}
        >
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
      {token && (
        <div aria-label="token" style={{ fontSize: 12, opacity: 0.7 }}>
          token: {token.slice(0, 8)}…
        </div>
      )}
    </div>
  );
}

const meta = {
  title: 'Auth/MSW Flow',
  component: AuthMSWFlow,
  parameters: {
    docs: {
      description: {
        component:
          'Exercises MSW auth endpoints: POST /api/auth/login, GET /api/auth/session, POST /api/auth/logout.',
      },
    },
  },
} satisfies Meta<typeof AuthMSWFlow>;

export default meta;

export const LoginSuccess: StoryObj<typeof meta> = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    // Use defaults (testuser@example.com / password123)
    await userEvent.click(c.getByRole('button', { name: /login/i }));
    await expect(c.getByText(/status: 200/i)).toBeInTheDocument();
    await expect(c.getByLabelText('result')).toHaveTextContent('testuser@example.com');
  },
};

export const LoginFailShortPassword: StoryObj<typeof meta> = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.clear(c.getByLabelText('password'));
    await userEvent.type(c.getByLabelText('password'), 'short');
    await userEvent.click(c.getByRole('button', { name: /login/i }));
    await expect(c.getByText(/status: 401/i)).toBeInTheDocument();
    await expect(c.getByLabelText('error')).toHaveTextContent(/invalid/i);
  },
};
