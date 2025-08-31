import React from 'react';

export const StorybookCIDashboard: React.FC = () => {
  const [sbE2E, setSbE2E] = React.useState<any | null>(null);
  const [journeyE2E, setJourneyE2E] = React.useState<any | null>(null);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch('/data/tests/storybook-e2e.json', { cache: 'no-store' });
        if (mounted && res.ok) setSbE2E(await res.json());
      } catch {}
      try {
        const res = await fetch('/data/tests/storybook-journeys-e2e.json', { cache: 'no-store' });
        if (mounted && res.ok) setJourneyE2E(await res.json());
      } catch {}
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const card: React.CSSProperties = {
    border: '1px solid rgba(148,163,184,0.25)',
    borderRadius: 12,
    padding: 16,
    background: 'rgba(2,6,23,0.9)',
    color: '#e5e7eb',
  };
  const grid: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: 12,
  };
  const title: React.CSSProperties = { fontWeight: 800, marginBottom: 8 };
  const small: React.CSSProperties = { fontSize: 12, color: '#94a3b8' };

  const renderSuite = (data: any, label: string) => {
    if (!data) return (
      <div style={card}>
        <div style={title}>{label}</div>
        <div>No JSON found. Run the script below to generate it.</div>
      </div>
    );
    // Try totals from JSON reporter format
    const totals = data?.stats || data?.totals || null;
    const summary = totals
      ? (
        <ul>
          {totals.total != null && <li>Total: {totals.total}</li>}
          {totals.passed != null && <li>Passed: {totals.passed}</li>}
          {totals.failed != null && <li>Failed: {totals.failed}</li>}
          {totals.skipped != null && <li>Skipped: {totals.skipped}</li>}
        </ul>
      ) : (
        <div style={small}>No totals present (format may vary).</div>
      );
    return (
      <div style={card}>
        <div style={title}>{label}</div>
        {summary}
      </div>
    );
  };

  return (
    <div>
      <div style={grid}>
        {renderSuite(sbE2E, 'Storybook E2E (Presenter/MSW)')}
        {renderSuite(journeyE2E, 'Storybook Journeys E2E')}
      </div>
      <div style={{ marginTop: 12 }}>
        <div style={small}>How to generate results:</div>
        <pre style={{ whiteSpace: 'pre-wrap', background: 'rgba(2,6,23,0.7)', padding: 12, borderRadius: 8 }}>
{`# Run Storybook E2E against presenter/MSW overlays
npm run e2e:storybook:json

# (Optional) Run Storybook Journeys E2E
npm run e2e:storybook:journeys:json`}
        </pre>
      </div>
    </div>
  );
};

