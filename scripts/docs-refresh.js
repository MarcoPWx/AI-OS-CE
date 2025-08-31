#!/usr/bin/env node
/*
Refresh important docs (DevLog, System Status, Epics) using optional context from
- CLI: --context "text" or --context-file ./path.txt
- Env: DOCS_CONTEXT, WARP_CONTEXT, CURSOR_CONTEXT
- Clipboard (macOS pbpaste) if available
Also annotates with recent commits and changed files for traceability.

This script is safe and non-destructive: it prepends/updates small sections and timestamps.
It does not commit or push changes.
*/
const { readFile, writeFile, access, mkdir } = require('node:fs/promises');
const path = require('node:path');
const { exec: _exec } = require('node:child_process');
const { promisify } = require('node:util');

const exec = promisify(_exec);
const ROOT = process.cwd();

const FILES = {
  DEVLOG_CANON: path.join(ROOT, 'docs', 'status', 'DEVLOG.md'), // canonical DevLog
  DEVLOG_STATUS_STUB: path.join(ROOT, 'docs', 'DEVLOG.md'), // legacy path (stub pointing to canonical)
  SYSTEM_STATUS: path.join(ROOT, 'docs', 'SYSTEM_STATUS.md'),
  EPICS: path.join(ROOT, 'docs', 'roadmap', 'EPICS.md'),
  LAST_UPDATED_JSON: path.join(ROOT, 'docs', 'status', 'last-updated.json'),
};

function log(...args) { console.log('[docs:refresh]', ...args); }
function warn(...args) { console.warn('[docs:refresh]', ...args); }

async function fileExists(p) {
  try { await access(p); return true; } catch { return false; }
}

function parseArgs(argv) {
  const out = { context: '', contextFile: '', maxCommits: 5 };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--context' && argv[i+1]) { out.context = argv[++i]; continue; }
    if (a.startsWith('--context=')) { out.context = a.slice('--context='.length); continue; }
    if (a === '--context-file' && argv[i+1]) { out.contextFile = argv[++i]; continue; }
    if (a.startsWith('--context-file=')) { out.contextFile = a.slice('--context-file='.length); continue; }
    if (a === '--max-commits' && argv[i+1]) { out.maxCommits = Math.max(1, parseInt(argv[++i], 10) || 5); continue; }
    if (a.startsWith('--max-commits=')) { out.maxCommits = Math.max(1, parseInt(a.slice('--max-commits='.length), 10) || 5); continue; }
  }
  return out;
}

async function readContextFromArgsEnvClipboard(args) {
  // CLI
  if (args.context && args.context.trim()) return args.context.trim();
  // File
  if (args.contextFile) {
    try { const t = await readFile(path.resolve(args.contextFile), 'utf8'); if (t.trim()) return t.trim(); } catch {}
  }
  // Env
  const envOrder = ['DOCS_CONTEXT', 'WARP_CONTEXT', 'CURSOR_CONTEXT'];
  for (const k of envOrder) {
    const v = process.env[k];
    if (v && v.trim()) return v.trim();
  }
  // Clipboard (macOS)
  if (process.platform === 'darwin') {
    try {
      const { stdout } = await exec('pbpaste');
      const t = stdout.trim();
      if (t) return t;
    } catch {}
  }
  return '';
}

async function getRecentCommits(n = 5) {
  try {
    const { stdout } = await exec(`git --no-pager log -n ${n} --pretty=format:%h %s`);
    return stdout.trim().split('\n').filter(Boolean);
  } catch { return []; }
}

async function getChangedFiles() {
  try {
    const { stdout } = await exec('git status --porcelain');
    const lines = stdout.trim().split('\n').filter(Boolean);
    return lines.map(l => l.trim());
  } catch { return []; }
}

async function readLastUpdatedMap() {
  try {
    const buf = await readFile(FILES.LAST_UPDATED_JSON, 'utf8');
    const j = JSON.parse(buf);
    return j?.files || {};
  } catch { return {}; }
}

function bullets(text) {
  return text.split(/\r?\n/).map(s => s.trim()).filter(Boolean).map(s => `- ${s}`).join('\n');
}

function prependAfterH1(md, insertBlock) {
  const lines = md.split('\n');
  let h1Index = lines.findIndex(l => /^#\s+/.test(l));
  if (h1Index === -1) return `${insertBlock}\n\n${md}`;
  // find first blank line after H1
  let insertIdx = h1Index + 1;
  if (lines[insertIdx] === '') insertIdx += 1;
  const before = lines.slice(0, insertIdx).join('\n');
  const after = lines.slice(insertIdx).join('\n');
  return `${before}\n\n${insertBlock}\n\n${after}`.replace(/\n{3,}/g, '\n\n');
}

async function ensureDirOf(filePath) {
  await mkdir(path.dirname(filePath), { recursive: true });
}

async function updateDevlog(nowISO, ctx, commits, changes) {
  const dateOnly = nowISO.slice(0,10);
  await ensureDirOf(FILES.DEVLOG_CANON);
  let current = (await fileExists(FILES.DEVLOG_CANON))
    ? await readFile(FILES.DEVLOG_CANON, 'utf8')
    : '# Development Log\\n\\n';
  const parts = [];
  parts.push(`## ${dateOnly}`);
  if (ctx) {
    parts.push('### Context');
    parts.push(bullets(ctx));
  }
  if (commits.length) {
    parts.push('### Recent Commits');
    parts.push(commits.slice(0,10).map(c => `- ${c}`).join('\n'));
  }
  if (changes.length) {
    parts.push('### Changed Files (git status)');
    parts.push(changes.slice(0,50).map(c => `- ${c}`).join('\n'));
  }
  const block = parts.join('\n');
  const next = prependAfterH1(current, block);
  if (next !== current) {
    await writeFile(FILES.DEVLOG_CANON, next, 'utf8');
    log('Updated', path.relative(ROOT, FILES.DEVLOG_CANON));
  } else {
    log('No change for', path.relative(ROOT, FILES.DEVLOG_CANON));
  }

  // Maintain a lightweight stub at legacy status path pointing to canonical
  await ensureDirOf(FILES.DEVLOG_STATUS_STUB);
  const stub = `# DEVLOG (legacy pointer)\\n\\n> Canonical location: /docs/status/DEVLOG.md\\n\\nThis file is retained for compatibility. Please update bookmarks to /docs/status/DEVLOG.md.`;
  await writeFile(FILES.DEVLOG_STATUS_STUB, stub, 'utf8');
}

async function updateSystemStatus(nowISO) {
  const dateOnly = nowISO.slice(0,10);
  if (!(await fileExists(FILES.SYSTEM_STATUS))) {
    warn('Missing', path.relative(ROOT, FILES.SYSTEM_STATUS), '— skipping');
    return;
  }
  let txt = await readFile(FILES.SYSTEM_STATUS, 'utf8');
  const re = /^Last Updated:\s*.*$/m;
  if (re.test(txt)) {
    txt = txt.replace(re, `Last Updated: ${dateOnly}`);
  } else {
    txt = prependAfterH1(txt, `Last Updated: ${dateOnly}`);
  }
  await writeFile(FILES.SYSTEM_STATUS, txt, 'utf8');
  log('Updated', path.relative(ROOT, FILES.SYSTEM_STATUS));
}

async function updateEpics(nowISO) {
  const dateOnly = nowISO.slice(0,10);
  await ensureDirOf(FILES.EPICS);
  const exists = await fileExists(FILES.EPICS);
  let txt = exists ? await readFile(FILES.EPICS, 'utf8') : '# EPICS — Canonical Roadmap\n\n';
  // Ensure a canonical notice exists
  if (!/^>\s*This is the canonical EPICS document/m.test(txt)) {
    txt = prependAfterH1(txt, '> This is the canonical EPICS document. For current status view, see /docs/status/EPIC_MANAGEMENT_CURRENT.md');
  }
  // Update date line
  const re = /^>\s*Updated:\s*.*$/m;
  if (re.test(txt)) {
    txt = txt.replace(re, `> Updated: ${dateOnly}`);
  } else {
    txt = prependAfterH1(txt, `> Updated: ${dateOnly}`);
  }
  await writeFile(FILES.EPICS, txt, 'utf8');
  log('Updated', path.relative(ROOT, FILES.EPICS));
}

async function main() {
  const args = parseArgs(process.argv);
  const nowISO = new Date().toISOString();
  const ctx = await readContextFromArgsEnvClipboard(args);
  const commits = await getRecentCommits(args.maxCommits);
  const changes = await getChangedFiles();

  await updateDevlog(nowISO, ctx, commits, changes);
  await updateSystemStatus(nowISO);
  await updateEpics(nowISO);

  // Optionally show last-updated map summary
  const lastMap = await readLastUpdatedMap();
  const keys = [
    path.relative(ROOT, FILES.DEVLOG_CANON).replace(/\\/g,'/'),
    path.relative(ROOT, FILES.SYSTEM_STATUS).replace(/\\/g,'/'),
    path.relative(ROOT, FILES.EPICS).replace(/\\/g,'/'),
  ];
  const summarized = keys.filter(k => lastMap[k]).map(k => `${k}: ${lastMap[k]}`);
  if (summarized.length) log('Last-updated manifest entries:', summarized.join(' | '));

  log('Done.');
}

main().catch(e => { console.error('[docs:refresh] Error:', e); process.exit(1); });

