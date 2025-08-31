// src/stories/RepoDocsBrowser.stories.tsx
import React, { useEffect, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { DefaultsChip } from './components/DefaultsChip';

interface ManifestItem {
  path: string;
  title: string;
  mtime: number;
}
interface Manifest {
  generatedAt: string;
  total: number;
  items: ManifestItem[];
  byDir: Record<string, ManifestItem[]>;
}

const curated = [
  { label: 'MASTER_DOCUMENTATION_INDEX.md', path: '/docs/MASTER_DOCUMENTATION_INDEX.md' },
  { label: 'docs/README.md', path: '/docs/README.md' },
  { label: 'Local Dev & Testing Guide', path: '/docs/status/LOCAL_DEV_AND_TESTING_GUIDE.md' },
  { label: 'Storybook Testing', path: '/docs/STORYBOOK_TESTING.md' },
  { label: 'Service Mocking Architecture', path: '/docs/mocks/SERVICE_MOCKING_ARCHITECTURE.md' },
  { label: 'WebSocket Mocks', path: '/docs/mocks/WEBSOCKET_MOCKS.md' },
  { label: 'Tech Stack Cheat Sheet', path: '/docs/status/TECH_STACK_CHEAT_SHEET.md' },
  { label: 'Enhanced Features Runbook', path: '/docs/runbooks/ENHANCED_FEATURES_RUNBOOK.md' },
  { label: 'System Status (Current)', path: '/docs/status/SYSTEM_STATUS_CURRENT.md' },
  { label: 'System Status (Overview)', path: '/docs/status/SYSTEM_STATUS.md' },
  { label: 'Epics Management (Current)', path: '/docs/status/EPIC_MANAGEMENT_CURRENT.md' },
  { label: 'Epics Management (Overview)', path: '/docs/status/EPIC_MANAGEMENT.md' },
  { label: 'Dev Log', path: '/docs/status/DEVLOG.md' },
];

function RepoDocsBrowser() {
  const [path, setPath] = useState(curated[0].path);
  const [text, setText] = useState<string>('');
  const [err, setErr] = useState<string>('');
  const [manifest, setManifest] = useState<Manifest | null>(null);
  const [filter, setFilter] = useState('');

  const load = async (p: string) => {
    setErr('');
    setText('');
    try {
      const res = await fetch(p);
      if (!res.ok) {
        setErr(`HTTP ${res.status}: ${p}`);
        return;
      }
      const t = await res.text();
      setText(t);
    } catch (e: any) {
      setErr(e?.message || 'Failed to fetch');
    }
  };

  useEffect(() => {
    void load(path);
  }, [path]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/docs/docs-manifest.json');
        if (res.ok) {
          const m = await res.json();
          setManifest(m);
        }
      } catch {}
    })();
  }, []);

  return (
    <div style={{ padding: 16, display: 'grid', gridTemplateColumns: '320px 1fr', gap: 16 }}>
      <div style={{ gridColumn: '1 / -1', marginBottom: 8 }}>
        <DefaultsChip />
      </div>
      <div>
        <div style={{ marginBottom: 8, fontWeight: 600 }}>Repo Docs</div>
        <input
          placeholder="Filter by title or path"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{ width: '100%', marginBottom: 8 }}
        />
        {manifest ? (
          <>
            {Object.entries(manifest.byDir).map(([dir, items]) => {
              const visible = items.filter(
                (it) =>
                  it.title.toLowerCase().includes(filter.toLowerCase()) ||
                  it.path.toLowerCase().includes(filter.toLowerCase()),
              );
              if (visible.length === 0) return null;
              return (
                <div key={dir} style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: 12, opacity: 0.7 }}>{dir}</div>
                  <ul style={{ listStyle: 'none', padding: 0 }}>
                    {visible.map((it) => (
                      <li key={it.path} style={{ marginBottom: 6 }}>
                        <button
                          onClick={() => setPath(it.path)}
                          style={{ width: '100%', textAlign: 'left' }}
                        >
                          {it.title}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {curated.map((c) => (
              <li key={c.path} style={{ marginBottom: 6 }}>
                <button
                  onClick={() => setPath(c.path)}
                  style={{ width: '100%', textAlign: 'left' }}
                >
                  {c.label}
                </button>
              </li>
            ))}
          </ul>
        )}
        <div style={{ marginTop: 8 }}>
          <label>
            Custom path:
            <input
              style={{ width: '100%', marginTop: 4 }}
              placeholder="/docs/ANY_FILE.md"
              value={path}
              onChange={(e) => setPath(e.target.value)}
            />
          </label>
          <div style={{ fontSize: 12, opacity: 0.8, marginTop: 8 }}>
            Tip: Files are served from /docs via Storybook staticDirs; relative links may not be
            rewritten.
          </div>
        </div>
      </div>
      <div
        style={{
          maxHeight: '80vh',
          overflow: 'auto',
          padding: 12,
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 8,
        }}
      >
        {err && <div style={{ color: '#ff6b6b' }}>{err}</div>}
        {!err && text && <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>}
        {!err && !text && <div>Loading…</div>}
      </div>
    </div>
  );
}

const meta = {
  title: 'Docs/Repo Docs Browser',
  component: RepoDocsBrowser,
  parameters: {
    helpDoc: '?path=/story/overview-overview-insanely-detailed--page',
    helpTitle: 'Deep Dive Overview',
    docs: {
      description: {
        component:
          'Browse and read Markdown docs from the repo (/docs) inside Storybook. Powered by react-markdown and remark-gfm.',
      },
    },
    layout: 'fullscreen',
  },
} satisfies Meta<typeof RepoDocsBrowser>;

export default meta;

export const Default: StoryObj<typeof meta> = {};
