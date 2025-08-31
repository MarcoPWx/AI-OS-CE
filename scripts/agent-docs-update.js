#!/usr/bin/env node

/**
 * Agent-only docs updater (no npm script required)
 * - Updates EPICS and System Status timestamps
 * - Appends a status snapshot to the DevLog using EPICS “Now Working On”
 * - Writes docs/status/last-updated.json
 */

const fs = require('fs');
const fsp = require('fs').promises;
const path = require('path');

const ROOT = process.cwd();
const DEVLOG = path.join(ROOT, 'docs/status/DEVLOG.md');
const EPICS = path.join(ROOT, 'docs/roadmap/EPICS.md');
const SYS = path.join(ROOT, 'docs/SYSTEM_STATUS.md');
const LAST_UPDATED_JSON = path.join(ROOT, 'docs/status/last-updated.json');

function fmtDate(d = new Date()) {
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
}

function ts() {
  return new Date().toISOString();
}

async function read(p) {
  return await fsp.readFile(p, 'utf8');
}

async function write(p, content) {
  await fsp.mkdir(path.dirname(p), { recursive: true });
  await fsp.writeFile(p, content, 'utf8');
}

function replaceLine(content, startsWith, newLine) {
  const lines = content.split('\n');
  let replaced = false;
  const out = lines.map((l) => {
    if (!replaced && l.startsWith(startsWith)) {
      replaced = true;
      return newLine;
    }
    return l;
  });
  return [out.join('\n'), replaced];
}

function extractNowWorkingOn(epicsMd) {
  const startIdx = epicsMd.indexOf('## Now Working On');
  if (startIdx === -1) return [];
  const rest = epicsMd.slice(startIdx);
  const nextIdx = rest.indexOf('\n## ');
  const section = nextIdx === -1 ? rest : rest.slice(0, nextIdx);
  const bullets = section
    .split('\n')
    .filter((l) => l.trim().startsWith('- '))
    .map((l) => l.trim());
  return bullets;
}

async function main() {
  const today = fmtDate();

  // Update EPICS updated date
  let epics = await read(EPICS);
  epics = epics.replace(/(^> Updated:\s*).*/m, `$1${today}`);

  // Extract Now Working On list
  const nowWorking = extractNowWorkingOn(epics);

  // Update System Status last updated
  let sys = await read(SYS);
  sys = sys.replace(/(^Last Updated:\s*).*/m, `$1${today}`);

  // Append DevLog snapshot (attach to current date if present; otherwise add a new date block)
  let devlog = await read(DEVLOG);
  const hasToday = devlog.includes(`## ${today}`);
  const snapshot = [
    '',
    hasToday ? `### Status sync snapshot (${ts()})` : `## ${today}\n\n### Status sync snapshot (${ts()})`,
    '- System Status updated: ' + today,
    '- Now Working On:',
    ...nowWorking.map((b) => '  ' + b),
    ''
  ].join('\n');
  devlog += snapshot;

  await write(EPICS, epics);
  await write(SYS, sys);
  await write(DEVLOG, devlog);

  const lastUpdated = {
    generatedAt: ts(),
    files: {
      'docs/status/DEVLOG.md': today,
      'docs/roadmap/EPICS.md': today,
      'docs/SYSTEM_STATUS.md': today
    }
  };
  await write(LAST_UPDATED_JSON, JSON.stringify(lastUpdated, null, 2));

  // eslint-disable-next-line no-console
  console.log('Agent docs update complete.');
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});

