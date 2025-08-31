import React from 'react';

export const TestsDashboard: React.FC = () => {
  const [jestSummary, setJestSummary] = React.useState<any | null>(null);
  const [pwSummary, setPwSummary] = React.useState<any | null>(null);
  const [pwFailures, setPwFailures] = React.useState<Array<{ title: string; file?: string; error?: string }>>([]);
  const [coverage, setCoverage] = React.useState<any | null>(null);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch('/data/tests/jest-summary.json', { cache: 'no-store' });
        if (mounted && res.ok) setJestSummary(await res.json());
      } catch {}
      try {
        const res = await fetch('/data/tests/playwright-summary.json', { cache: 'no-store' });
        if (mounted && res.ok) {
          const json = await res.json();
          if (mounted) {
            setPwSummary(json);
            // Attempt to extract failed specs from reporter JSON
            const fails: Array<{ title: string; file?: string; error?: string }> = [];
            const walk = (suite: any) => {
              if (!suite) return;
              if (Array.isArray(suite.suites)) suite.suites.forEach(walk);
              if (Array.isArray(suite.specs)) {
                for (const spec of suite.specs) {
                  const title = spec?.title || spec?.name || 'Unknown spec';
                  const file = spec?.file || spec?.location?.file;
                  const tests = spec?.tests || [];
                  let failed = false;
                  let msg: string | undefined;
                  for (const t of tests) {
                    for (const r of t?.results || []) {
                      if (r?.status === 'failed') {
                        failed = true;
                        const e0 = (r?.errors && r.errors[0]) || (r?.error) || undefined;
                        msg = typeof e0 === 'string' ? e0 : e0?.message || e0?.stack || msg;
                      }
                    }
                  }
                  if (failed) fails.push({ title, file, error: msg });
                }
              }
            };
            if (Array.isArray(json?.suites)) json.suites.forEach(walk);
            if (Array.isArray(json?.projects)) json.projects.forEach((p: any) => (p?.suites || []).forEach(walk));
            setPwFailures(fails);
          }
        }
      } catch {}
      try {
        const res = await fetch('/coverage/coverage-summary.json', { cache: 'no-store' });
        if (mounted && res.ok) setCoverage(await res.json());
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

  return (
    <div>
      <div style={grid}>
        <div style={card}>
          <div style={title}>Unit Tests (Jest)</div>
          {jestSummary ? (
            <div>
              <div style={small}>generated: {jestSummary.startTime ? new Date(jestSummary.startTime).toLocaleString() : 'n/a'}</div>
              {jestSummary.numTotalTests != null ? (
                <ul>
                  <li>Total: {jestSummary.numTotalTests}</li>
                  <li>Passed: {jestSummary.numPassedTests}</li>
                  <li>Failed: {jestSummary.numFailedTests}</li>
                  <li>Pending: {jestSummary.numPendingTests}</li>
                  <li>Runtime: {jestSummary?.testResults?.[0]?.perfStats?.runtime ?? '—'} ms</li>
                </ul>
              ) : (
                <div>No structured summary fields found.</div>
              )}
              <div style={{ marginTop: 8 }}>
                Tip: npm run test:unit:json
              </div>
            </div>
          ) : (
            <div>
              No jest-summary.json found at /data/tests/jest-summary.json
              <div style={{ marginTop: 8 }}>Run: npm run test:unit:json</div>
            </div>
          )}
        </div>

        <div style={card}>
          <div style={title}>E2E Tests (Playwright)</div>
          {pwSummary ? (
            <div>
              <div style={small}>generated: {pwSummary.generatedAt ? new Date(pwSummary.generatedAt).toLocaleString() : 'n/a'}</div>
              {pwSummary.totals ? (
                <ul>
                  <li>Total: {pwSummary.totals.total}</li>
                  <li>Passed: {pwSummary.totals.passed}</li>
                  <li>Failed: {pwSummary.totals.failed}</li>
                  <li>Flaky: {pwSummary.totals.flaky}</li>
                  <li>Skipped: {pwSummary.totals.skipped}</li>
                </ul>
              ) : (
                <div>No totals present. {pwSummary.note || ''}</div>
              )}
              {pwFailures.length > 0 && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ ...small, marginBottom: 4 }}>Failed specs</div>
                  <ul>
                    {pwFailures.slice(0, 10).map((f, i) => (
                      <li key={i}>
                        <strong>{f.title}</strong>
                        {f.file ? <span style={small}> — {f.file}</span> : null}
                        {f.error ? <div style={{ whiteSpace: 'pre-wrap', marginTop: 4 }}>{f.error}</div> : null}
                      </li>
                    ))}
                  </ul>
                  {pwFailures.length > 10 && (
                    <div style={small}>…and {pwFailures.length - 10} more</div>
                  )}
                </div>
              )}
              <div style={{ marginTop: 8 }}>
                <a href="/reports/playwright/index.html" target="_blank" rel="noreferrer">Open Playwright HTML Report</a>
              </div>
              <div style={{ marginTop: 8 }}>Tip: npm run test:e2e:json or npm run e2e:ensure-summary</div>
            </div>
          ) : (
            <div>
              No playwright-summary.json found at /data/tests/playwright-summary.json
              <div style={{ marginTop: 8 }}>Run: npm run test:e2e:json or npm run e2e:ensure-summary</div>
            </div>
          )}
        </div>

        <div style={card}>
          <div style={title}>Coverage</div>
          {coverage ? (
            <div>
              {coverage.total ? (
                <ul>
                  <li>Statements: {coverage.total.statements.pct}% ({coverage.total.statements.covered}/{coverage.total.statements.total})</li>
                  <li>Branches: {coverage.total.branches.pct}% ({coverage.total.branches.covered}/{coverage.total.branches.total})</li>
                  <li>Functions: {coverage.total.functions.pct}% ({coverage.total.functions.covered}/{coverage.total.functions.total})</li>
                  <li>Lines: {coverage.total.lines.pct}% ({coverage.total.lines.covered}/{coverage.total.lines.total})</li>
                </ul>
              ) : (
                <div>No coverage-summary.json found at /coverage/coverage-summary.json</div>
              )}
              <div style={{ marginTop: 8 }}>Tip: npm run test:coverage</div>
            </div>
          ) : (
            <div>
              No coverage-summary.json found at /coverage/coverage-summary.json
              <div style={{ marginTop: 8 }}>Run: npm run test:coverage</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

