// src/stories/SystemStatus.stories.tsx
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { fetchManifestWithFallback, findManifestItem, fetchDocTextWithFallback } from './utils/docs';
import { LastUpdated } from './components/LastUpdated';

function useDocWithManifest(primaryPaths: string[], apiKey?: string) {
  const [text, setText] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [manifest, docText] = await Promise.all([
        fetchManifestWithFallback(),
        fetchDocTextWithFallback(primaryPaths, apiKey),
      ]);
      setText(docText);
      const item = findManifestItem(manifest, primaryPaths);
      const iso = (item?.mtimeIso as string) || (manifest as any)?.generatedAtIso || (manifest as any)?.generatedAt;
      if (iso) setLastUpdated(iso);
      if (!docText) setError('Failed to load document');
    } catch (e: any) {
      setError(e?.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [primaryPaths, apiKey]);

  React.useEffect(() => {
    void load();
  }, [load]);

  return { text, error, loading, lastUpdated, reload: load };
}

function SystemStatusViewer() {
  const paths = React.useMemo(() => [
    '/docs/SYSTEM_STATUS.md',
  ], []);
  const { text, error, loading, lastUpdated, reload } = useDocWithManifest(paths);

  return (
    <div style={{ padding: 16, display: 'grid', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <h3 style={{ margin: 0 }}>System Status</h3>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
<LastUpdated iso={lastUpdated} />
          <button onClick={reload} disabled={loading}>{loading ? 'Reloading…' : 'Refresh'}</button>
        </div>
      </div>
      {error && <div role="alert" style={{ color: '#ff6b6b' }}>{error}</div>}
      {!error && !text && <div>Loading…</div>}
      {text && (
        <div style={{
          maxHeight: '80vh',
          overflow: 'auto',
          padding: 12,
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 8,
          background: 'rgba(255,255,255,0.02)'
        }}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
        </div>
      )}
    </div>
  );
}

const meta = {
  title: 'Docs/System Status',
  component: SystemStatusViewer,
  parameters: {
    helpDocs: [
      { href: '/docs/status/SYSTEM_STATUS_CURRENT.md', title: 'Open System Status' },
      { href: '?path=/story/docs-repo-docs-browser--default', title: 'Repo Docs Browser' },
    ],
    docs: {
      description: {
        component: 'Renders System Status live from /docs with fallback to /api/docs/read?key=system-status. Shows Last updated from the docs manifest if present.'
      }
    }
  }
} satisfies Meta<typeof SystemStatusViewer>;

export default meta;
export const Default: StoryObj<typeof meta> = {};

