// scripts/ensure-playwright-summary.js
// Ensures there is a JSON summary for Playwright E2E results.
// Strategy:
// 1) If playwright-summary.json exists, exit.
// 2) Else if HTML report exists, try to derive a light summary from report.json.
// 3) Else, no-op (no report yet).

const fs = require('fs');
const path = require('path');

const SUMMARY_PATH = path.resolve(process.cwd(), 'playwright-summary.json');
const REPORT_DIR = path.resolve(process.cwd(), 'playwright-report');
const REPORT_HTML = path.join(REPORT_DIR, 'index.html');
const REPORT_JSON = path.join(REPORT_DIR, 'data', 'report.json');

function writeSummary(obj) {
  try {
    fs.writeFileSync(SUMMARY_PATH, JSON.stringify(obj, null, 2));
    console.log(`✅ Wrote Playwright JSON summary at: ${SUMMARY_PATH}`);
  } catch (e) {
    console.warn('⚠️ Failed to write summary:', e?.message);
  }
}

function main() {
  if (fs.existsSync(SUMMARY_PATH)) {
    console.log('ℹ️ playwright-summary.json already exists. Skipping.');
    return;
  }

  if (!fs.existsSync(REPORT_HTML)) {
    console.log('ℹ️ No Playwright HTML report found. Nothing to summarize yet.');
    return;
  }

  // Try to derive minimal stats from the HTML report data if present
  if (fs.existsSync(REPORT_JSON)) {
    try {
      const raw = fs.readFileSync(REPORT_JSON, 'utf-8');
      const data = JSON.parse(raw);

      // Attempt to compute simple totals
      let total = 0,
        passed = 0,
        failed = 0,
        flaky = 0,
        skipped = 0;

      function walkSuite(suite) {
        if (!suite) return;
        for (const s of suite.suites || []) walkSuite(s);
        for (const spec of suite.specs || []) {
          for (const r of spec.tests || []) {
            total += 1;
            const outcome = (r?.results || []).some((x) => x.status === 'failed')
              ? 'failed'
              : (r?.results || []).some((x) => x.status === 'skipped')
                ? 'skipped'
                : (r?.results || []).some((x) => x.status === 'flaky')
                  ? 'flaky'
                  : 'passed';
            if (outcome === 'passed') passed += 1;
            else if (outcome === 'failed') failed += 1;
            else if (outcome === 'flaky') flaky += 1;
            else if (outcome === 'skipped') skipped += 1;
          }
        }
      }

      // Newer HTML report keeps top-level data.suites
      if (Array.isArray(data?.suites)) {
        for (const s of data.suites) walkSuite(s);
      } else if (Array.isArray(data?.projects)) {
        for (const p of data.projects) for (const s of p.suites || []) walkSuite(s);
      }

      const summary = {
        source: 'playwright-html-report',
        reportPath: path.relative(process.cwd(), REPORT_DIR),
        totals: { total, passed, failed, flaky, skipped },
        generatedAt: new Date().toISOString(),
      };
      return writeSummary(summary);
    } catch (e) {
      console.warn('⚠️ Failed to parse report.json; writing minimal pointer summary.', e?.message);
    }
  }

  // Fallback minimal pointer summary
  writeSummary({
    source: 'html-only',
    reportPath: path.relative(process.cwd(), REPORT_DIR),
    note: 'HTML report present. Run `npm run test:e2e:json` to generate full JSON summary.',
    generatedAt: new Date().toISOString(),
  });
}

main();
