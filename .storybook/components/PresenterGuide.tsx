import React from 'react';
import { useGlobals } from '@storybook/preview-api';

export default function PresenterGuide() {
  const [{ presenterStep }, updateGlobals] = useGlobals();
  const items: Array<{ title: string; href: string }>
    = [
      { title: 'Start Here', href: '?path=/story/docs-00-start-here--page' },
      { title: 'Quick Index', href: '?path=/story/docs-quick-index--page' },
      { title: 'Presentation Walkthrough', href: '?path=/story/docs-presentation-narrated-walkthrough--page' },
      { title: 'Agent Boot', href: '?path=/story/docs-agent-boot--page' },
      { title: 'DevLog', href: '?path=/story/docs-dev-log--default' },
      { title: 'Epics', href: '?path=/story/docs-epics--default' },
      { title: 'System Status', href: '?path=/story/docs-system-status--default' },
      { title: 'Labs Index', href: '?path=/story/labs-index--page' },
      { title: 'Mobile Mock Beta', href: '?path=/story/labs-mobile-mock-beta--page' },
      { title: 'Device Matrix', href: '?path=/story/labs-device-matrix--page' },
      { title: 'User Journeys', href: '?path=/story/labs-user-journeys--page' },
      { title: 'Journey‑Driven TDD', href: '?path=/story/labs-journey-driven-tdd--page' },
      { title: 'Auth & Session', href: '?path=/story/labs-auth-session--page' },
      { title: 'Quiz & Content', href: '?path=/story/labs-quiz-content--page' },
      { title: 'Gamification & Achievements', href: '?path=/story/labs-gamification-achievements--page' },
      { title: 'Leaderboard & Social', href: '?path=/story/labs-leaderboard-social--page' },
      { title: 'Onboarding & Profile', href: '?path=/story/labs-onboarding-profile--page' },
      { title: 'S2S Orchestration', href: '?path=/story/labs-s2s-orchestration--page' },
      { title: 'API Playground', href: '?path=/story/api-playground--default' },
      { title: 'Swagger', href: '?path=/story/api-swagger--default' },
      { title: 'Error & Offline', href: '?path=/story/labs-error-offline--page' },
      { title: 'Performance & Device Metrics', href: '?path=/story/labs-performance-device-metrics--page' },
      { title: 'Security & Privacy', href: '?path=/story/labs-security-privacy--page' },
      { title: 'Accessibility', href: '?path=/story/labs-accessibility--page' },
      { title: 'Sentry (Crash & Release Health)', href: '?path=/story/labs-sentry-crash-release-health--page' },
    ];

  React.useEffect(() => {
    // Sync current story to presenterStep if possible
    try {
      const href = window.location.href;
      const idx = items.findIndex((it) => href.includes(it.href));
      if (idx >= 0 && presenterStep !== idx) {
        updateGlobals({ presenterStep: idx });
      }
    } catch {}
    // only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={container}>
      <div style={panel}>
        <div style={header}>
          <div style={title}>Presenter Guide</div>
          <div style={subtitle}>Click a step to navigate. Use the toolbar to toggle this overlay.</div>
        </div>
        <div style={grid}>
          {items.map((it, index) => (
            <a
              key={it.href}
              href={it.href}
              onClick={() => updateGlobals({ presenterStep: index })}
              style={index === presenterStep ? { ...link, ...linkActive } : link}
            >
              {it.title}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

const container: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 99999,
  background: 'rgba(2,6,23,0.5)',
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'flex-end',
  padding: 12,
  pointerEvents: 'none',
};

const panel: React.CSSProperties = {
  pointerEvents: 'auto',
  width: 380,
  maxHeight: '95vh',
  overflow: 'auto',
  background: 'rgba(2,6,23,0.95)',
  color: '#e5e7eb',
  border: '1px solid rgba(59,130,246,0.35)',
  borderRadius: 12,
  boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
};

const header: React.CSSProperties = {
  padding: '12px 14px 6px 14px',
  borderBottom: '1px solid rgba(148,163,184,0.25)',
};

const title: React.CSSProperties = {
  fontSize: 16,
  fontWeight: 800,
  color: '#f8fafc',
};

const subtitle: React.CSSProperties = {
  fontSize: 12,
  marginTop: 4,
  color: 'rgba(226,232,240,0.8)',
};

const grid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr',
  gap: 8,
  padding: 12,
};

const link: React.CSSProperties = {
  display: 'block',
  padding: '8px 10px',
  borderRadius: 8,
  textDecoration: 'none',
  background: 'rgba(30,41,59,0.85)',
  color: '#e5e7eb',
  border: '1px solid rgba(59,130,246,0.25)',
};

const linkActive: React.CSSProperties = {
  background: 'rgba(59,130,246,0.25)',
  border: '1px solid rgba(59,130,246,0.6)',
};

