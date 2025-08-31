#!/usr/bin/env node
/*
Non-destructive docs merge helper.
- Dry-run (default): scans likely duplicates and writes docs/status/MERGE_REPORT.md with a plan. No file changes.
- Apply (--apply): performs minimal, reasoned merge; archives originals under docs/archive/YYYY-MM-DD/<path>; writes MERGE_REPORT.md.

Pairs handled:
- DevLog: canonical docs/status/DEVLOG.md vs legacy docs/DEVLOG.md
- System Status: canonical docs/SYSTEM_STATUS.md vs legacy docs/status/SYSTEM_STATUS_CURRENT.md
- Epics: canonical docs/roadmap/EPICS.md vs status docs/status/EPIC_MANAGEMENT_CURRENT.md

Rules:
- Never delete content.
- Prefer canonical paths; add pointers to legacy where appropriate.
- For DevLog: append missing dated sections from legacy into canonical with provenance.
- For System Status: ensure pointer at legacy to canonical; optionally copy Last Updated if canonical lacks it.
- For Epics: ensure canonical notice in EPICS.md; do not move status content.
*/
const { readFile, writeFile, mkdir, access, cp } = require('node:fs/promises');
const path = require('node:path');

const ROOT = process.cwd();
const FILES = {
  DEVLOG_CANON: path.join(ROOT, 'docs', 'status', 'DEVLOG.md'),
  DEVLOG_LEGACY: path.join(ROOT, 'docs', 'DEVLOG.md'),
  SYS_CANON: path.join(ROOT, 'docs', 'SYSTEM_STATUS.md'),
  SYS_LEGACY: path.join(ROOT, 'docs', 'status', 'SYSTEM_STATUS_CURRENT.md'),
  EPICS_CANON: path.join(ROOT, 'docs', 'roadmap', 'EPICS.md'),
  EPICS_STATUS: path.join(ROOT, 'docs', 'status', 'EPIC_MANAGEMENT_CURRENT.md'),
  REPORT: path.join(ROOT, 'docs', 'status', 'MERGE_REPORT.md'),
};

async function exists(p) { try { await access(p); return true; } catch { return false; } }
async function read(p) { return (await readFile(p, 'utf8')); }
async function ensureDirOf(p) { await mkdir(path.dirname(p), { recursive: true }); }
function today() { return new Date().toISOString().slice(0,10); }
function ymd() { return today(); }

function splitDevlogEntries(md) {
  // Split by level-2 date headings: ## YYYY-MM-DD
  const lines = md.split(/\r?\n/);
  const entries = [];
  let i = 0;
  // find first H1 to skip top metadata
  while (i < lines.length && !/^#\s+/.test(lines[i])) i++;
  if (i < lines.length) i++;
  let start = -1, header = '';
  for (; i < lines.length; i++) {
    const line = lines[i];
    const m = /^##\s+(\d{4}-\d{2}-\d{2})/.exec(line);
    if (m) {
      if (start !== -1) {
        entries.push({ header, text: lines.slice(start, i).join('\n') });
      }
      header = line;
      start = i;
    }
  }
  if (start !== -1) entries.push({ header, text: lines.slice(start).join('\n') });
  return entries;
}

function hasPointer(md, toPath) {
  return md.includes('Canonical location:') && md.includes(toPath);
}

function prependAfterH1(md, insertBlock) {
  const lines = md.split('\n');
  let h1 = lines.findIndex(l => /^#\s+/.test(l));
  if (h1 === -1) return `${insertBlock}\n\n${md}`;
  let insertIdx = h1 + 1;
  if (lines[insertIdx] === '') insertIdx += 1;
  const before = lines.slice(0, insertIdx).join('\n');
  const after = lines.slice(insertIdx).join('\n');
  return `${before}\n\n${insertBlock}\n\n${after}`.replace(/\n{3,}/g, '\n\n');
}

async function archiveFile(p) {
  const rel = path.relative(ROOT, p);
  const dest = path.join(ROOT, 'docs', 'archive', ymd(), rel);
  await ensureDirOf(dest);
  await cp(p, dest, { force: true });
  return dest;
}

async function planMerge() {
  const plan = { date: new Date().toISOString(), actions: [] };

  // DevLog
  if (await exists(FILES.DEVLOG_CANON) && await exists(FILES.DEVLOG_LEGACY)) {
    const canon = await read(FILES.DEVLOG_CANON);
    const legacy = await read(FILES.DEVLOG_LEGACY);
    const cEntries = splitDevlogEntries(canon).map(e => e.header.trim());
    const lEntries = splitDevlogEntries(legacy);
    const missing = lEntries.filter(e => !cEntries.includes(e.header.trim()));
    if (missing.length > 0) {
      plan.actions.push({
        type: 'devlog.append_missing',
        target: 'docs/status/DEVLOG.md',
        count: missing.length,
        details: missing.map(m => m.header),
      });
    }
    if (!hasPointer(legacy, '/docs/status/DEVLOG.md')) {
      plan.actions.push({
        type: 'devlog.add_pointer',
        target: 'docs/DEVLOG.md',
        to: '/docs/status/DEVLOG.md',
      });
    }
  }

  // System Status
  if (await exists(FILES.SYS_LEGACY)) {
    const legacy = await read(FILES.SYS_LEGACY);
    if (!hasPointer(legacy, '/docs/SYSTEM_STATUS.md')) {
      plan.actions.push({ type: 'system.add_pointer', target: 'docs/status/SYSTEM_STATUS_CURRENT.md', to: '/docs/SYSTEM_STATUS.md' });
    }
    if (await exists(FILES.SYS_CANON)) {
      const canon = await read(FILES.SYS_CANON);
      const hasCanonLast = /^Last Updated:\s*.*$/m.test(canon);
      const legacyLast = legacy.match(/^Last Updated:\s*(.*)$/m)?.[1]?.trim();
      if (!hasCanonLast && legacyLast) {
        plan.actions.push({ type: 'system.copy_last_updated', from: 'docs/status/SYSTEM_STATUS_CURRENT.md', to: 'docs/SYSTEM_STATUS.md', value: legacyLast });
      }
    }
  }

  // Epics
  if (await exists(FILES.EPICS_CANON)) {
    const canon = await read(FILES.EPICS_CANON);
    if (!/>\s*This is the canonical EPICS document/i.test(canon)) {
      plan.actions.push({ type: 'epics.ensure_canonical_notice', target: 'docs/roadmap/EPICS.md' });
    }
  }

  return plan;
}

async function applyMerge(plan) {
  for (const action of plan.actions) {
    switch (action.type) {
      case 'devlog.append_missing': {
        const canonP = FILES.DEVLOG_CANON;
        const legacyP = FILES.DEVLOG_LEGACY;
        const canon = await read(canonP);
        const legacy = await read(legacyP);
        const cHeaders = splitDevlogEntries(canon).map(e => e.header.trim());
        const lEntries = splitDevlogEntries(legacy);
        const missing = lEntries.filter(e => !cHeaders.includes(e.header.trim()));
        if (missing.length) {
          await archiveFile(canonP);
          const inserted = missing.map(m => `\n\n<!-- Imported from /docs/DEVLOG.md on ${today()} -->\n${m.text}`).join('\n');
          const next = prependAfterH1(canon, inserted.trim());
          await writeFile(canonP, next, 'utf8');
        }
        break;
      }
      case 'devlog.add_pointer': {
        const legacyP = FILES.DEVLOG_LEGACY;
        const existsLegacy = await exists(legacyP);
        const pointer = `# DEVLOG (legacy pointer)\n\n> Canonical location: ${action.to}\n\nThis file is retained for compatibility. Please update bookmarks to ${action.to}.`;
        await ensureDirOf(legacyP);
        if (existsLegacy) await archiveFile(legacyP);
        await writeFile(legacyP, pointer, 'utf8');
        break;
      }
      case 'system.add_pointer': {
        const p = FILES.SYS_LEGACY;
        const content = await read(p).catch(() => '');
        if (!hasPointer(content, action.to)) {
          await archiveFile(p);
          const withPtr = prependAfterH1(content || '# System Status (legacy)\n', `> Canonical location: ${action.to}`);
          await writeFile(p, withPtr, 'utf8');
        }
        break;
      }
      case 'system.copy_last_updated': {
        const p = FILES.SYS_CANON;
        const content = await read(p).catch(() => '# System Status\n');
        if (!/^Last Updated:\s*.*$/m.test(content)) {
          await archiveFile(p);
          const next = prependAfterH1(content, `Last Updated: ${action.value}`);
          await writeFile(p, next, 'utf8');
        }
        break;
      }
      case 'epics.ensure_canonical_notice': {
        const p = FILES.EPICS_CANON;
        const content = await read(p).catch(() => '# EPICS — Canonical Roadmap\n');
        if (!/>\s*This is the canonical EPICS document/i.test(content)) {
          await archiveFile(p);
          const next = prependAfterH1(content, '> This is the canonical EPICS document. For current status view, see /docs/status/EPIC_MANAGEMENT_CURRENT.md');
          await writeFile(p, next, 'utf8');
        }
        break;
      }
      default:
        break;
    }
  }
}

async function main() {
  const args = process.argv.slice(2);
  const APPLY = args.includes('--apply');
  const plan = await planMerge();
  await ensureDirOf(FILES.REPORT);
  const report = [
    `# Docs Merge Report`,
    `Date: ${new Date().toISOString()}`,
    `Mode: ${APPLY ? 'apply' : 'dry-run'}`,
    ``,
    plan.actions.length === 0 ? `No actions needed.` : `Planned actions:\n` + plan.actions.map(a => `- ${a.type} ${a.target ? '→ ' + a.target : ''}`).join('\n')
  ].join('\n');
  await writeFile(FILES.REPORT, report + '\n', 'utf8');
  if (APPLY && plan.actions.length) {
    await applyMerge(plan);
  }
  console.log(`[docs-merge] Wrote ${path.relative(ROOT, FILES.REPORT)}${APPLY ? ' and applied changes.' : '.'}`);
}

main().catch(err => { console.error('[docs-merge] Error:', err); process.exit(1); });

