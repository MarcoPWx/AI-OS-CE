// .storybook/preview.ts (web Storybook)
import React from 'react';
import type { Decorator, Preview } from '@storybook/react';
import { initialize, mswDecorator } from 'msw-storybook-addon';
import { handlers } from '../src/mocks/handlers';
import storybookHandlers from '../src/mocks/handlers.storybook';
import PresenterGuide from './components/PresenterGuide';
import { useGlobals, addons } from '@storybook/preview-api';

// Initialize MSW addon
initialize({ onUnhandledRequest: 'bypass' });
if (typeof window !== 'undefined') {
  // Flag for status chips or external consumers
  // @ts-ignore
  window.__MSW_ACTIVE__ = true;
}

// Wrap fetch once to support per-story no-defaults toggle
let __fetchWrapped = false as any;
function ensureFetchWrapper() {
  if (typeof window === 'undefined' || __fetchWrapped) return;
  const orig = window.fetch.bind(window);
  // @ts-ignore
  window.__ORIG_FETCH__ = orig;
  window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
    try {
      // @ts-ignore
      const noDefaults = !!window.__MSW_NO_DEFAULTS__;
      if (noDefaults) {
        const headers = new Headers(init?.headers || {});
        headers.set('x-msw-no-defaults', '1');
        return orig(input, { ...(init || {}), headers });
      }
    } catch {}
    return orig(input, init as any);
  };
  __fetchWrapped = true;
}

declare global {
  interface Window {
    __WS_MOCK_SCENARIO__?: string;
  }
}

// Soft password gate — demo-only, enabled if VITE_STORYBOOK_PASSWORD is set
const DEMO_PASSWORD = (import.meta as any)?.env?.VITE_STORYBOOK_PASSWORD as string | undefined;
const PW_KEY = '__sb_demo_pw_ok__';

const softPasswordDecorator: Decorator = (Story) => {
  if (!DEMO_PASSWORD) return Story();
  const [ok, setOk] = React.useState<boolean>(() => {
    try {
      return localStorage.getItem(PW_KEY) === '1';
    } catch {
      return false;
    }
  });
  const [value, setValue] = React.useState('');
  const [err, setErr] = React.useState<string | null>(null);
  const onSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (value === DEMO_PASSWORD) {
      try { localStorage.setItem(PW_KEY, '1'); } catch {}
      setOk(true);
    } else {
      setErr('Incorrect password');
    }
  };
  if (ok) return Story();
  const wrap: React.CSSProperties = {
    position: 'fixed', inset: 0, background: 'rgba(2,6,23,0.9)', display: 'grid', placeItems: 'center', zIndex: 999999,
  };
  const card: React.CSSProperties = {
    width: 360, padding: 18, borderRadius: 12, background: 'rgba(15,23,42,0.95)', color: '#e5e7eb', border: '1px solid rgba(148,163,184,0.25)'
  };
  const input: React.CSSProperties = { width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(59,130,246,0.35)', background: 'rgba(2,6,23,0.8)', color: '#e5e7eb' };
  const btn: React.CSSProperties = { marginTop: 10, width: '100%', padding: '8px 10px', borderRadius: 8, background: '#2563eb', color: 'white', fontWeight: 700, cursor: 'pointer', border: 'none' };
  return (
    <>
      <div style={wrap}>
        <form style={card} onSubmit={onSubmit}>
          <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 8 }}>Enter password</div>
          <input
            aria-label="Password"
            type="password"
            value={value}
            onChange={(e) => { setValue((e.target as HTMLInputElement).value); setErr(null); }}
            style={input}
            autoFocus
          />
          {err && <div style={{ color: '#f87171', fontSize: 12, marginTop: 6 }}>{err}</div>}
          <button type="submit" style={btn}>Unlock</button>
          <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 8 }}>Demo-only gate. For real protection use host-level Basic Auth.</div>
        </form>
      </div>
      <Story />
    </>
  );
};

// Inject minimal theming/platform CSS once
let __styleInjected = false;
function injectThemePlatformCSS() {
  if (typeof document === 'undefined' || __styleInjected) return;
  const style = document.createElement('style');
  style.innerHTML = `
    :root[data-theme='light'] body { background-color: #ffffff; color: #0b1020; }
    :root[data-theme='dark'] body { background-color: #0b1020; color: #d7e0ff; }
    :root[data-platform='ios'] { --platform-font: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif; --platform-radius: 12px; }
    :root[data-platform='android'] { --platform-font: Roboto, 'Noto Sans', Arial, sans-serif; --platform-radius: 8px; }
    :root[data-platform='web'] { --platform-font: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; --platform-radius: 6px; }
    .storybook-theme-surface { font-family: var(--platform-font, system-ui); }
  `;
  document.head.appendChild(style);
  __styleInjected = true;
}

export const globalTypes = {
  wsScenario: {
    name: 'WS Scenario',
    description: 'Mock WebSocket scenario for stories',
    defaultValue: 'lobbyBasic',
    toolbar: {
      icon: 'globe',
      items: [
        { value: 'lobbyBasic', title: 'Lobby: Basic' },
        { value: 'matchHappyPath', title: 'Match: Happy Path' },
        { value: 'disconnectRecovery', title: 'Disconnect: Recovery' },
        { value: 'taskBoardLive', title: 'Task Board: Live' },
      ],
      showName: true,
    },
  },
  theme: {
    name: 'Theme',
    description: 'Light/Dark theme preview',
    defaultValue: 'light',
    toolbar: {
      icon: 'paintbrush',
      items: [
        { value: 'light', title: 'Light' },
        { value: 'dark', title: 'Dark' },
      ],
      showName: true,
    },
  },
  platform: {
    name: 'Platform',
    description: 'Cosmetic platform tokens (web demo)',
    defaultValue: 'web',
    toolbar: {
      icon: 'mobile',
      items: [
        { value: 'web', title: 'Web' },
        { value: 'ios', title: 'iOS' },
        { value: 'android', title: 'Android' },
      ],
      showName: true,
    },
  },
  presenterGuide: {
    name: 'Presenter',
    description: 'Presenter Guide and quick navigation',
    defaultValue: 'off',
    toolbar: {
      icon: 'book',
      items: [
        { value: 'off', title: 'Presenter: Off' },
        { value: 'labs', title: 'Open Labs Index' },
        { value: 'walkthrough', title: 'Open Presentation' },
      ],
      showName: true,
    },
  },
  // URL-persistent step for presenter flow; hidden from toolbar
  presenterStep: {
    name: 'Presenter Step',
    description: 'Current step in the Presenter Guide flow',
    defaultValue: 0,
  },
  mswProfile: {
    name: 'MSW Profile',
    description: 'Global latency/error profiles for MSW handlers',
    defaultValue: 'default',
    toolbar: {
      icon: 'plug',
      items: [
        { value: 'default', title: 'Default (0ms, 0%)' },
        { value: 'slower', title: 'Slower (300ms, 0%)' },
        { value: 'flaky', title: 'Flaky (100ms, 20%)' },
        { value: 'chaos', title: 'Chaos (500ms, 50%)' },
        { value: 'reset', title: 'Reset Defaults' },
      ],
      showName: true,
    },
  },
  // Dev tools visibility toggle
  devTools: {
    name: 'Dev Tools',
    description: 'Enable dev-only panels and dashboards',
    defaultValue: 'on',
    toolbar: {
      icon: 'gear',
      items: [
        { value: 'on', title: 'Dev Tools: On' },
        { value: 'off', title: 'Dev Tools: Off' },
      ],
      showName: true,
    },
  },
  // MSW Info overlay toggle
  mswInfo: {
    name: 'MSW Info',
    description: 'Show MSW handler info overlay',
    defaultValue: 'closed',
    toolbar: {
      icon: 'info',
      items: [
        { value: 'closed', title: 'MSW Info: Closed' },
        { value: 'open', title: 'MSW Info: Open' },
      ],
      showName: true,
    },
  },
  // Hidden global controlled by toolbar chip and tests
  mswNoDefaults: {
    name: 'MSW No Defaults',
    description: 'When true, disable global MSW defaults for the current story',
    defaultValue: false,
  },
};

const mswDefaultsApplied: { value?: string } = {};

const mswNoDefaultsDecorator: Decorator = (Story, context) => {
  if (typeof window !== 'undefined') {
    ensureFetchWrapper();
    const p = !!(context.parameters as any)?.mswNoDefaults;
    const g = !!(context.globals as any)?.mswNoDefaults;
    // @ts-ignore
    window.__MSW_NO_DEFAULTS__ = p || g;
  }
  return Story();
};

const wsScenarioDecorator: Decorator = (Story, context) => {
  if (typeof window !== 'undefined') {
    window.__WS_MOCK_SCENARIO__ = context.globals.wsScenario as string;
  }
  return Story();
};

const applyMswDefaults = async (profile: string) => {
  if (typeof window === 'undefined') return;
  const cfg: any =
    profile === 'slower'
      ? { latencyMs: 300, errorRate: 0 }
      : profile === 'flaky'
        ? { latencyMs: 100, errorRate: 0.2 }
        : profile === 'chaos'
          ? { latencyMs: 500, errorRate: 0.5 }
          : { latencyMs: 0, errorRate: 0 };
  try {
    await fetch('/__msw__/defaults', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cfg),
    });
  } catch {}
  try {
    localStorage.setItem('__mswDefaults__', JSON.stringify(cfg));
  } catch {}
};

const themePlatformDecorator: Decorator = (Story, context) => {
  if (typeof document !== 'undefined') {
    injectThemePlatformCSS();
    const { theme, platform } = context.globals as any;
    document.documentElement.setAttribute('data-theme', theme || 'light');
    document.documentElement.setAttribute('data-platform', platform || 'web');
  }
  return (
    <div className="storybook-theme-surface">
      <Story />
    </div>
  );
};

const mswDefaultsDecorator: Decorator = (Story, context) => {
  const profile = (context.globals as any).mswProfile as string;
  if (typeof window !== 'undefined') {
    if (mswDefaultsApplied.value !== profile) {
      mswDefaultsApplied.value = profile;
      void applyMswDefaults(profile);
    }
  }
  return Story();
};

// Presenter guide decorator: toolbar-controlled overlay + optional navigation
const presenterGuideDecorator: Decorator = (Story, context) => {
  if (typeof window !== 'undefined') {
    const mode = (context.globals as any)?.presenterGuide as string;
    // Optional auto-navigation when toggled
    try {
      const href = window.location.href;
      if (mode === 'labs' && !href.includes('/story/labs-index--page')) {
        window.location.href = '?path=/story/labs-index--page';
      }
      if (mode === 'walkthrough' && !href.includes('/story/docs-presentation-narrated-walkthrough--page')) {
        window.location.href = '?path=/story/docs-presentation-narrated-walkthrough--page';
      }
    } catch {}
    // Render overlay when active
    if (mode !== 'off') {
      return (
        <>
          <PresenterGuide />
          <Story />
        </>
      );
    }
  }
  return Story();
};

// Presenter hotkey decorator: toggle overlay with double "g" (gg)
const presenterHotkeyDecorator: Decorator = (Story, context) => {
  // Safely use hooks to update globals
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [{ presenterGuide }, updateGlobals] = useGlobals();
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const lastGRef = React.useRef<number>(0);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      // Close overlay on Escape
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        updateGlobals({ presenterGuide: 'off' });
        return;
      }
      // Ignore if typing in inputs/textareas or contentEditable
      const target = e.target as HTMLElement | null;
      const tag = (target?.tagName || '').toLowerCase();
      const isEditable =
        tag === 'input' ||
        tag === 'textarea' ||
        (target && (target as any).isContentEditable);
      if (isEditable) return;

      if (e.key.toLowerCase() !== 'g') {
        // Reset if other keys pressed
        lastGRef.current = 0;
        return;
      }
      const now = Date.now();
      if (lastGRef.current && now - lastGRef.current < 450) {
        // Detected double 'g'
        e.preventDefault();
        e.stopPropagation();
        const next = presenterGuide === 'off' ? 'labs' : 'off';
        updateGlobals({ presenterGuide: next });
        lastGRef.current = 0;
      } else {
        lastGRef.current = now;
      }
    };
    window.addEventListener('keydown', onKeyDown, { capture: true });
    return () => window.removeEventListener('keydown', onKeyDown, { capture: true } as any);
    // We only need to rebind if presenterGuide changes (not strictly necessary)
  }, [presenterGuide, updateGlobals]);

  return Story();
};

// MSW status event key
const EVENT_MSW_STATUS = 'quizmentor/msw-status';

// Emit MSW status to manager for toolbar chip
const mswStatusDecorator: Decorator = (Story, context) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  React.useEffect(() => {
    try {
      const channel = addons.getChannel();
      const status = {
        active: true,
        profile: (context.globals as any)?.mswProfile || 'default',
        noDefaults:
          !!(context.parameters as any)?.mswNoDefaults ||
          !!(context.globals as any)?.mswNoDefaults,
      };
      channel.emit(EVENT_MSW_STATUS, status);
    } catch {}
    // Re-emit when these change
  }, [
    (context.globals as any)?.mswProfile,
    (context.parameters as any)?.mswNoDefaults,
    (context.globals as any)?.mswNoDefaults,
  ]);
  return Story();
};

// MSW Info overlay decorator: shows consolidated handler list
const mswInfoOverlayDecorator: Decorator = (Story, context) => {
  const mode = (context.globals as any)?.mswInfo as string;
  if (mode !== 'open') return Story();
  // Compose handler metadata
  const items: Array<{ method: string; path: string; source: 'base' | 'storybook' }>= [];
  try {
    const list = [...(handlers as any[]), ...(storybookHandlers as any[])];
    for (const h of list) {
      const info = (h as any)?.info || {};
      const method = String(info?.method || info?.type || 'GET').toUpperCase();
      const pathVal = info?.path ?? info?.mask ?? info?.pathName;
      const path = typeof pathVal === 'string' ? pathVal : pathVal ? String(pathVal) : '(unknown)';
      const source: 'base' | 'storybook' = (storybookHandlers as any[]).includes(h) ? 'storybook' : 'base';
      items.push({ method, path, source });
    }
  } catch {}
  const panel: React.CSSProperties = {
    position: 'fixed',
    top: 60,
    right: 12,
    zIndex: 10000,
    width: 460,
    maxHeight: '70vh',
    overflow: 'auto',
    background: 'rgba(2,6,23,0.95)',
    border: '1px solid rgba(148,163,184,0.25)',
    borderRadius: 10,
    color: '#e5e7eb',
    boxShadow: '0 8px 24px rgba(0,0,0,0.35)'
  };
  const headerStyle: React.CSSProperties = { padding: '10px 12px', borderBottom: '1px solid rgba(148,163,184,0.25)', display: 'flex', alignItems: 'center', gap: 8 };
  const listStyle: React.CSSProperties = { padding: 12, display: 'grid', gridTemplateColumns: '1fr', gap: 6 };
  const itemStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, border: '1px solid rgba(59,130,246,0.15)', borderRadius: 6, padding: '6px 8px', background: 'rgba(30,41,59,0.65)' };
  const badge: React.CSSProperties = { fontSize: 10, padding: '2px 6px', borderRadius: 999, background: '#334155', color: '#e5e7eb' };
  const methodChip = (m: string) => {
    const color = m === 'GET' ? '#16a34a' : m === 'POST' ? '#3b82f6' : m === 'PUT' ? '#f59e0b' : m === 'DELETE' ? '#ef4444' : '#64748b';
    return <span style={{ ...badge, background: color }}>{m}</span>;
  };
  const linkStyle: React.CSSProperties = { color: '#93c5fd', textDecoration: 'none', fontWeight: 600 };
  return (
    <>
      <div style={panel}>
        <div style={headerStyle}>
          <strong>MSW Info</strong>
          <a href="?path=/story/docs-mocking-scenarios--page" style={{ marginLeft: 'auto', ...linkStyle }}>Docs: Mocking & Scenarios</a>
        </div>
        <div style={listStyle}>
          {items.length === 0 && <div style={{ fontSize: 12, color: '#94a3b8' }}>No handlers introspected.</div>}
          {items.map((it, idx) => (
            <div key={idx} style={itemStyle}>
              {methodChip(it.method)}
              <code style={{ fontSize: 12 }}>{it.path}</code>
              <span style={badge}>{it.source}</span>
            </div>
          ))}
        </div>
      </div>
      <Story />
    </>
  );
};

// Dev-only decorator: hides content for dev-only stories when devTools is off
const devOnlyDecorator: Decorator = (Story, context) => {
  const devOnly = !!(context.parameters as any)?.devOnly;
  const devToolsOn = ((context.globals as any)?.devTools || 'on') !== 'off';
  if (devOnly && !devToolsOn) {
    const container: React.CSSProperties = {
      padding: 16,
      border: '1px dashed rgba(148,163,184,0.4)',
      color: '#94a3b8',
      background: 'rgba(2,6,23,0.5)'
    };
    return (
      <div style={container}>
        This panel is hidden (Dev Tools: Off). Use the toolbar toggle "Dev Tools" to view.
      </div>
    );
  }
  return Story();
};

// Small help panel decorator: supports parameters.helpDoc or parameters.helpDocs (array)
const helpDocDecorator: Decorator = (Story, context) => {
  const helpDoc = (context.parameters as any)?.helpDoc as string | undefined;
  const helpTitle = (context.parameters as any)?.helpTitle as string | undefined;
  const helpDocs = (context.parameters as any)?.helpDocs as
    | Array<{ href: string; title?: string }>
    | undefined;
  const items: Array<{ href: string; title: string }> = [];
  if (helpDoc) items.push({ href: helpDoc, title: helpTitle || 'Open related docs' });
  if (Array.isArray(helpDocs)) {
    for (const it of helpDocs) {
      if (it?.href) items.push({ href: it.href, title: it.title || 'Open related docs' });
    }
  }
  if (items.length === 0) return Story();
  const containerStyle: React.CSSProperties = {
    position: 'fixed',
    top: 8,
    right: 8,
    zIndex: 9999,
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    alignItems: 'flex-end',
  };
  const pillStyle: React.CSSProperties = {
    padding: '6px 10px',
    borderRadius: 999,
    fontSize: 12,
    background: 'rgba(0,0,0,0.6)',
    color: 'white',
    backdropFilter: 'saturate(180%) blur(6px)',
  };
  const linkStyle: React.CSSProperties = {
    color: 'white',
    textDecoration: 'none',
    fontWeight: 600,
  };
  return (
    <>
      <div style={containerStyle}>
        {items.map((it, idx) => (
          <a
            key={idx}
            href={it.href}
            target="_blank"
            rel="noreferrer"
            style={{ ...pillStyle, ...linkStyle }}
          >
            {it.title}
          </a>
        ))}
      </div>
      <Story />
    </>
  );
};

// System Status pill decorator: reads /docs/status/SYSTEM_STATUS_STATE.json and shows a pill linking to SYSTEM_STATUS_CURRENT.md
const statusDecorator: Decorator = (Story) => {
  const [info, setInfo] = React.useState<{
    status: 'green' | 'degraded' | 'outage';
    lastValidated?: string;
  } | null>(null);
  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch('/docs/status/SYSTEM_STATUS_STATE.json', { cache: 'no-store' });
        if (res.ok) {
          const json = await res.json();
          if (mounted) setInfo(json);
        }
      } catch {}
    })();
    return () => {
      mounted = false;
    };
  }, []);
  const color =
    info?.status === 'green' ? '#16a34a' : info?.status === 'degraded' ? '#f59e0b' : '#ef4444';
  const pillStyle: React.CSSProperties = {
    position: 'fixed',
    top: 8,
    left: 8,
    zIndex: 9999,
    padding: '6px 10px',
    borderRadius: 999,
    fontSize: 12,
    background: color,
    color: 'white',
  };
  const linkStyle: React.CSSProperties = {
    color: 'white',
    textDecoration: 'none',
    fontWeight: 600,
  };
  return (
    <>
      {info && (
        <div
          style={pillStyle}
          title={
            info.lastValidated
              ? `Last validated: ${new Date(info.lastValidated).toLocaleString()}`
              : undefined
          }
        >
          <a
            href="/docs/status/SYSTEM_STATUS_CURRENT.md"
            target="_blank"
            rel="noreferrer"
            style={linkStyle}
          >
            {info.status.toUpperCase()}
          </a>
        </div>
      )}
      <Story />
    </>
  );
};

// Global quickstart pill decorator: fixed link to Technology Overview Lab
const quickstartDecorator: Decorator = (Story) => {
  const containerStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: 8,
    left: 8,
    zIndex: 9999,
  };
  const pillStyle: React.CSSProperties = {
    padding: '6px 10px',
    borderRadius: 999,
    fontSize: 12,
    background: '#2563eb',
    color: 'white',
    textDecoration: 'none',
    fontWeight: 600,
    boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
  };
  return (
    <>
      <div style={containerStyle}>
        <a href="?path=/story/labs-technology-overview-lab--page" style={pillStyle}>
          Open Quickstart
        </a>
      </div>
      <Story />
    </>
  );
};

// Agent badge decorator: always-visible badge linking to Agent Boot and showing docs freshness

const preview: Preview = {
  decorators: [
    softPasswordDecorator,
    mswDecorator,
    mswNoDefaultsDecorator,
    wsScenarioDecorator,
    themePlatformDecorator,
    mswDefaultsDecorator,
    mswStatusDecorator,
    presenterHotkeyDecorator,
    presenterGuideDecorator,
    mswInfoOverlayDecorator,
    devOnlyDecorator,
    helpDocDecorator,
    statusDecorator,
    quickstartDecorator,
  ],
  parameters: {
    msw: { handlers: [...handlers, ...storybookHandlers] },
    controls: { expanded: true },
    options: {
      storySort: (a, b) => {
        // Compatible with V6 (tuple) and V7 (object) entries
        const at = (Array.isArray(a) ? (a[1] && a[1].title) : (a && a.title)) || '';
        const bt = (Array.isArray(b) ? (b[1] && b[1].title) : (b && b.title)) || '';
        const aTop = at.split('/')[0];
        const bTop = bt.split('/')[0];
        const topOrder = [
          'Docs',
          'Labs',
          'API',
          'Dev',
          'Live',
          'Design',
          'Specs',
          'Overview',
          'Observability',
          'Infrastructure',
          'Security',
          'Performance',
          'Project',
        ];
        const topScore = (t) => {
          const i = topOrder.indexOf(t);
          return i === -1 ? 999 : i;
        };
        const topCmp = topScore(aTop) - topScore(bTop);
        if (topCmp !== 0) return topCmp;
        // Docs ordering
        if (aTop === 'Docs' && bTop === 'Docs') {
          const docsOrder = [
            'Docs/00 Start Here',
            'Docs/Quick Index',
            'Docs/Presentation — Narrated Walkthrough',
            'Docs/Agent Boot',
            'Docs/Dev Log',
            'Docs/Epics',
            'Docs/System Status',
          ];
          const ad = docsOrder.indexOf(at);
          const bd = docsOrder.indexOf(bt);
          if (ad !== -1 || bd !== -1) return (ad === -1 ? 999 : ad) - (bd === -1 ? 999 : bd);
        }
        // Labs ordering
        if (aTop === 'Labs' && bTop === 'Labs') {
          const labsOrder = [
            'Labs/Index',
            'Labs/Mobile Mock Beta',
            'Labs/Device Matrix',
            'Labs/User Journeys',
            'Labs/Journey‑Driven TDD',
            'Labs/Auth & Session',
            'Labs/Quiz & Content',
            'Labs/Gamification & Achievements',
            'Labs/Leaderboard & Social',
            'Labs/Onboarding & Profile',
            'Labs/S2S Orchestration',
            'Labs/Error & Offline',
            'Labs/Performance & Device Metrics',
            'Labs/Security & Privacy',
            'Labs/Accessibility',
            'Labs/Sentry — Crash & Release Health',
          ];
          const al = labsOrder.indexOf(at);
          const bl = labsOrder.indexOf(bt);
          if (al !== -1 || bl !== -1) return (al === -1 ? 999 : al) - (bl === -1 ? 999 : bl);
        }
        // Fallback alphabetical
        return at.localeCompare(bt);
      },
    },
  },
};

export default preview;
