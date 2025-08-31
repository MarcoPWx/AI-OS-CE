import React, { useEffect, useState } from 'react';
import type { Preview } from '@storybook/react';

const env = (import.meta as any)?.env || {};
const requiredPassword = env?.VITE_STORYBOOK_PASSWORD as string | undefined;
const requiredUsername = env?.VITE_STORYBOOK_USERNAME as string | undefined;
const tourDefault = env?.EXPO_PUBLIC_TOUR_DEFAULT === '1';
const tourEnforce = env?.EXPO_PUBLIC_TOUR_ENFORCE === '1' || env?.NEXT_PUBLIC_TOUR_ENFORCE === '1';

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
    // If no password provided via env, allow but encourage setting it
    if (!requiredPassword) {
      try { sessionStorage.setItem('sb_authed', '1'); } catch {}
      setAuthed(true);
      return;
    }

    const usernameOk = requiredUsername ? username.trim() === requiredUsername : true;
    const passwordOk = password === requiredPassword;

    if (usernameOk && passwordOk) {
      try { sessionStorage.setItem('sb_authed', '1'); } catch {}
      setAuthed(true);
    } else {
      alert('Invalid credentials');
    }
  };

  if (authed) return (
    <>
      {/* Beta banner */}
      <div style={{ position: 'fixed', top: 8, right: 8, zIndex: 999999, display: 'flex', gap: 8, alignItems: 'center' }}>
        <div style={{ padding: '6px 10px', borderRadius: 8, background: 'rgba(2,6,23,0.85)', border: '1px solid rgba(59,130,246,0.4)', color: '#e5e7eb', fontSize: 12, fontWeight: 800 }}>
          BETA
        </div>
        <div style={{ padding: '6px 10px', borderRadius: 8, background: 'rgba(2,6,23,0.85)', border: '1px solid rgba(147,197,253,0.4)', color: '#bfdbfe', fontSize: 12, fontWeight: 800 }}>
          MOCK
        </div>
        {tourDefault && (
          <div style={{ padding: '6px 10px', borderRadius: 8, background: 'rgba(15,23,42,0.85)', border: '1px solid rgba(34,197,94,0.5)', color: '#e5e7eb', fontSize: 12, fontWeight: 800 }}>
            Tour: Auto-start
          </div>
        )}
        {tourEnforce && (
          <div style={{ padding: '6px 10px', borderRadius: 8, background: 'rgba(15,23,42,0.85)', border: '1px solid rgba(234,179,8,0.6)', color: '#e5e7eb', fontSize: 12, fontWeight: 800 }}>
            Tour: Enforced
          </div>
        )}
        {/* Quick links */}
        <a
          href={'../?path=/story/00-mock-mocked-app--mocked-app-with-tour'}
          target="_top"
          style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid rgba(59,130,246,0.5)', background: 'rgba(2,6,23,0.65)', color: '#93c5fd', fontWeight: 800, textDecoration: 'none' }}
        >
          Open Mock (UI)
        </a>
        <a
          href={'./iframe.html?path=/story/00-mock-mocked-app--mocked-app-with-tour'}
          target="_top"
          style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid rgba(59,130,246,0.5)', background: 'rgba(2,6,23,0.65)', color: '#93c5fd', fontWeight: 800, textDecoration: 'none' }}
        >
          Preview Only
        </a>
      </div>
      {children}
    </>
  );

  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#0f172a,#020617)' }}>
      <form onSubmit={onSubmit} style={{ width: 360, padding: 20, borderRadius: 12, border: '1px solid rgba(59,130,246,0.4)', background: 'rgba(2,6,23,0.7)', boxShadow: '0 10px 40px rgba(0,0,0,0.4)', color: '#e5e7eb' }}>
        <h3 style={{ marginTop: 0, marginBottom: 12 }}>QuizMentor Beta</h3>
        <p style={{ marginTop: 0, marginBottom: 16, color: '#9ca3af' }}>Enter your beta credentials to continue.</p>

        <label style={{ display: 'block', fontSize: 12, color: '#9ca3af' }}>Username</label>
        <input
          value={username}
          onChange={(e) => setUsername(e.currentTarget.value)}
          placeholder={requiredUsername || 'beta'}
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

export const parameters = {
  options: {
    storySort: {
      order: ['00-Mock', 'Guided Tour', 'Components', 'Stories'],
    },
  },
};

const preview: Preview = {};
export default preview;

