import React, { useEffect, useState } from 'react';
import type { Preview } from '@storybook/react';

const requiredPassword = (import.meta as any)?.env?.VITE_STORYBOOK_PASSWORD as string | undefined;

function Gate({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    try {
      const ok = sessionStorage.getItem('sb_authed') === '1';
      if (ok) setAuthed(true);
    } catch {}
  }, []);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requiredPassword) {
      // No password set -> allow, but encourage setting env in Vercel
      try { sessionStorage.setItem('sb_authed', '1'); } catch {}
      setAuthed(true);
      return;
    }
    if (password === requiredPassword) {
      try { sessionStorage.setItem('sb_authed', '1'); } catch {}
      setAuthed(true);
    } else {
      alert('Invalid password');
    }
  };

  if (authed) return <>{children}</>;

  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#0f172a,#020617)' }}>
      <form onSubmit={onSubmit} style={{ width: 360, padding: 20, borderRadius: 12, border: '1px solid rgba(59,130,246,0.4)', background: 'rgba(2,6,23,0.7)', boxShadow: '0 10px 40px rgba(0,0,0,0.4)', color: '#e5e7eb' }}>
        <h3 style={{ marginTop: 0, marginBottom: 12 }}>QuizMentor Beta</h3>
        <p style={{ marginTop: 0, marginBottom: 16, color: '#9ca3af' }}>Enter your beta credentials to continue.</p>

        <label style={{ display: 'block', fontSize: 12, color: '#9ca3af' }}>Username</label>
        <input
          value={username}
          onChange={(e) => setUsername(e.currentTarget.value)}
          placeholder="beta"
          style={{ width: '100%', padding: '10px 12px', marginTop: 4, marginBottom: 12, borderRadius: 8, border: '1px solid rgba(148,163,184,0.2)', background: 'rgba(148,163,184,0.08)', color: '#e5e7eb' }}
        />

        <label style={{ display: 'block', fontSize: 12, color: '#9ca3af' }}>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.currentTarget.value)}
          placeholder="Enter password"
          style={{ width: '100%', padding: '10px 12px', marginTop: 4, marginBottom: 16, borderRadius: 8, border: '1px solid rgba(148,163,184,0.2)', background: 'rgba(148,163,184,0.08)', color: '#e5e7eb' }}
        />

        <button type="submit" style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(59,130,246,0.5)', background: 'linear-gradient(90deg,#3b82f6,#2563eb)', color: 'white', fontWeight: 700 }}>Enter</button>

        {!requiredPassword && (
          <p style={{ marginTop: 12, fontSize: 12, color: '#fbbf24' }}>
            No password set. Configure VITE_STORYBOOK_PASSWORD in your Vercel Environment Variables.
          </p>
        )}
      </form>
    </div>
  );
}

const withGate = (Story: any) => (
  <Gate>
    <Story />
  </Gate>
);

export const decorators = [withGate];

const preview: Preview = {};
export default preview;

