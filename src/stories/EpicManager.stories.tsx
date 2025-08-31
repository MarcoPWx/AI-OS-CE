// src/stories/EpicManager.stories.tsx
import React, { useMemo, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { within, expect } from '@storybook/test';

// Types
export type EpicStatus = 'Planned' | 'In Progress' | 'Blocked' | 'Done';
export type EpicPriority = 'P0' | 'P1' | 'P2';

export interface EpicItem {
  id: string;
  title: string;
  status: EpicStatus;
  priority: EpicPriority;
  owner?: string;
  eta?: string;
  risk?: string;
}

export interface EpicManagerProps {
  epics: EpicItem[];
  loading?: boolean;
  error?: string | null;
  statusFilter?: EpicStatus[];
  priorityFilter?: EpicPriority[];
  search?: string;
  /** Optional simulated loading delay in ms; when > 0, shows loading then clears after timeout */
  loadingDelayMs?: number;
}

const sampleEpics: EpicItem[] = [
  {
    id: 'docs-dx-mdx3',
    title: 'Docs & DX stabilization (MDX3)',
    status: 'In Progress',
    priority: 'P1',
    owner: 'Docs Team',
    eta: 'This sprint',
    risk: 'Low',
  },
  {
    id: 'qa-guardrails',
    title: 'QA & Guardrails',
    status: 'Planned',
    priority: 'P1',
    owner: 'QE',
    eta: 'Next sprint',
    risk: 'Medium',
  },
  {
    id: 'perf-bundle',
    title: 'Performance & Bundling',
    status: 'Planned',
    priority: 'P2',
    owner: 'Core',
    eta: 'Next sprint',
    risk: 'Medium',
  },
];

const allStatuses: EpicStatus[] = ['Planned', 'In Progress', 'Blocked', 'Done'];
const allPriorities: EpicPriority[] = ['P0', 'P1', 'P2'];

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        display: 'inline-block',
        fontSize: 12,
        padding: '2px 8px',
        border: '1px solid rgba(255,255,255,0.16)',
        borderRadius: 999,
        marginRight: 6,
        opacity: 0.85,
      }}
    >
      {children}
    </span>
  );
}

export function EpicManager(props: EpicManagerProps) {
  const [localStatus, setLocalStatus] = useState<EpicStatus[]>(props.statusFilter ?? allStatuses);
  const [localPriorities, setLocalPriorities] = useState<EpicPriority[]>(
    props.priorityFilter ?? allPriorities,
  );
  const [localSearch, setLocalSearch] = useState<string>(props.search ?? '');
  const [delayedLoading, setDelayedLoading] = useState<boolean>(false);

  React.useEffect(() => {
    if (props.loadingDelayMs && props.loadingDelayMs > 0) {
      setDelayedLoading(true);
      const t = setTimeout(() => setDelayedLoading(false), Math.min(10000, props.loadingDelayMs));
      return () => clearTimeout(t);
    } else {
      setDelayedLoading(false);
    }
  }, [props.loadingDelayMs]);

  const isLoading = Boolean(props.loading) || delayedLoading;

  const filtered = useMemo(() => {
    if (!props.epics) return [];
    return props.epics.filter(
      (e) =>
        localStatus.includes(e.status) &&
        localPriorities.includes(e.priority) &&
        (!localSearch || e.title.toLowerCase().includes(localSearch.toLowerCase())),
    );
  }, [props.epics, localStatus, localPriorities, localSearch]);

  return (
    <div style={{ padding: 16 }}>
      <h3>Epic Manager</h3>

      {/* Inline control panel */}
      <div
        style={{
          display: 'flex',
          gap: 16,
          flexWrap: 'wrap',
          alignItems: 'center',
          marginBottom: 12,
        }}
      >
        <div>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>Status</div>
          {allStatuses.map((s) => (
            <label key={s} style={{ marginRight: 8 }}>
              <input
                type="checkbox"
                checked={localStatus.includes(s)}
                onChange={(e) => {
                  setLocalStatus((prev) =>
                    e.target.checked ? [...prev, s] : prev.filter((x) => x !== s),
                  );
                }}
              />{' '}
              {s}
            </label>
          ))}
        </div>
        <div>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>Priority</div>
          {allPriorities.map((p) => (
            <label key={p} style={{ marginRight: 8 }}>
              <input
                type="checkbox"
                checked={localPriorities.includes(p)}
                onChange={(e) => {
                  setLocalPriorities((prev) =>
                    e.target.checked ? [...prev, p] : prev.filter((x) => x !== p),
                  );
                }}
              />{' '}
              {p}
            </label>
          ))}
        </div>
        <div>
          <input
            aria-label="search"
            placeholder="Search epics..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
          />
        </div>
      </div>

      {/* States */}
      {isLoading && <div aria-label="loading">Loading epics…</div>}
      {props.error && !isLoading && (
        <div role="alert" style={{ color: '#ff6b6b' }}>
          {props.error}
          <div style={{ marginTop: 8, fontSize: 13 }}>
            API unavailable? View the roadmap docs:
            {' '}
            <a href="/docs/status/EPIC_MANAGEMENT_CURRENT.md" target="_blank" rel="noreferrer" style={{ color: '#60a5fa' }}>EPIC_MANAGEMENT_CURRENT.md</a>
            {' '}or{' '}
            <a href="/docs/status/DEVLOG.md" target="_blank" rel="noreferrer" style={{ color: '#60a5fa' }}>DEVLOG.md</a>
          </div>
        </div>
      )}

      {!isLoading && !props.error && (
        <div>
          {filtered.length === 0 ? (
            <div aria-label="empty">No epics match your filters.</div>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {filtered.map((e) => (
                <li
                  key={e.id}
                  style={{
                    padding: 12,
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: 8,
                    marginBottom: 8,
                  }}
                >
                  <div style={{ fontWeight: 600 }}>{e.title}</div>
                  <div style={{ marginTop: 4 }}>
                    <Chip>{e.status}</Chip>
                    <Chip>{e.priority}</Chip>
                    {e.owner && <Chip>Owner: {e.owner}</Chip>}
                    {e.eta && <Chip>ETA: {e.eta}</Chip>}
                    {e.risk && <Chip>Risk: {e.risk}</Chip>}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

const meta = {
  title: 'Docs/Epics/Epic Manager',
  component: EpicManager,
  parameters: {
    layout: 'fullscreen',
    helpDocs: [
      { href: '?path=/story/specs-epic-management-full-spec--page', title: 'Epics Full Spec' },
      { href: '?path=/story/overview-architecture--page', title: 'Architecture' },
    ],
    docs: {
      description: {
        component:
          'Interactive Epic Manager view to explore the current roadmap. Use the inline filters to adjust Status and Priority, or try the scenario variants (Empty/Loading/Error).',
      },
    },
  },
  args: {
    epics: sampleEpics,
    loading: false,
    error: null,
    statusFilter: allStatuses,
    priorityFilter: allPriorities,
    search: '',
    loadingDelayMs: 0,
  },
  argTypes: {
    epics: { control: 'object' },
    loading: { control: 'boolean' },
    error: { control: 'text' },
    statusFilter: { control: { type: 'check' }, options: allStatuses },
    priorityFilter: { control: { type: 'check' }, options: allPriorities },
    search: { control: 'text' },
    loadingDelayMs: { control: { type: 'number', min: 0, max: 10000, step: 100 } },
  },
} satisfies Meta<typeof EpicManager>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    // Narrow filter to only Done to force empty state with sample data
    const planned = c.getByLabelText('Planned') as HTMLInputElement;
    const inProgress = c.getByLabelText('In Progress') as HTMLInputElement;
    const blocked = c.getByLabelText('Blocked') as HTMLInputElement;
    // Uncheck these if checked
    if (planned.checked) await c.findByLabelText('Planned').then(() => {});
    await (planned as any).click?.();
    if (inProgress.checked) await (inProgress as any).click?.();
    if (blocked.checked) await (blocked as any).click?.();
    await expect(c.getByLabelText('empty')).toBeInTheDocument();
  },
};

function EpicManagerLive() {
  const [epics, setEpics] = React.useState<EpicItem[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/epics', { method: 'GET' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (mounted) setEpics(json?.epics || []);
      } catch (e: any) {
        if (mounted) setError(e?.message || 'Failed to load epics');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return <EpicManager epics={epics} loading={loading} error={error || undefined} />;
}

export const Live: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Live data from /api/epics (MSW in-memory store). No dependency on _CURRENT docs.',
      },
    },
  },
  render: () => <EpicManagerLive />,
};

export const Empty: Story = {
  parameters: {
    docs: { description: { story: 'Shows the empty state when no epics are provided.' } },
  },
  args: {
    epics: [],
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByLabelText('empty')).toBeInTheDocument();
  },
};

export const Loading: Story = {
  parameters: {
    docs: {
      description: { story: 'Shows a loading indicator while epics are fetched (static flag).' },
    },
  },
  args: { loading: true },
};

export const LoadingWithDelay: Story = {
  parameters: {
    docs: {
      description: { story: 'Simulates loading via a timer. Adjust loadingDelayMs in controls.' },
    },
  },
  args: { loadingDelayMs: 1500 },
};

export const Error: Story = {
  parameters: {
    docs: { description: { story: 'Simulates a server error when loading epics.' } },
  },
  args: { error: 'Failed to load epics. Please retry.' },
};
