#!/usr/bin/env node
/*
agent-validate: checks agent boot health
- canonical docs exist
- Storybook pages exist for Agent Boot, Dev Log, Epics, System Status
- basic command liveness: scripts available in package.json
Writes docs/status/AGENT_VALIDATE_REPORT.md
*/
const fs = require('node:fs/promises');
const path = require('node:path');

const ROOT = process.cwd();
const PATHS = {
  DEVLOG: 'docs/status/DEVLOG.md',
  EPICS: 'docs/roadmap/EPICS.md',
  SYS: 'docs/SYSTEM_STATUS.md',
  SB_AGENT: '.storybook/stories/AgentBoot.mdx',
  SB_DEVLOG: 'src/stories/DevLog.stories.tsx',
  SB_EPICS: 'src/stories/EpicsDoc.stories.tsx',
  SB_SYS: 'src/stories/SystemStatus.stories.tsx',
  PKG: 'package.json',
  REPORT: 'docs/status/AGENT_VALIDATE_REPORT.md',
};

async function exists(p){ try { await fs.access(path.join(ROOT,p)); return true;} catch { return false; } }
async function readJSON(p){ return JSON.parse(await fs.readFile(path.join(ROOT,p),'utf8')); }
async function ensureDirOf(p){ await fs.mkdir(path.dirname(path.join(ROOT,p)), { recursive: true }); }

async function main(){
  const checks = [];
  const add = (name, pass, info='') => checks.push({ name, pass, info });

  // Canonical docs
  add('docs/status/DEVLOG.md exists', await exists(PATHS.DEVLOG));
  add('docs/roadmap/EPICS.md exists', await exists(PATHS.EPICS));
  add('docs/SYSTEM_STATUS.md exists', await exists(PATHS.SYS));

  // Storybook pages
  add('.storybook/stories/AgentBoot.mdx exists', await exists(PATHS.SB_AGENT));
  add('src/stories/DevLog.stories.tsx exists', await exists(PATHS.SB_DEVLOG));
  add('src/stories/EpicsDoc.stories.tsx exists', await exists(PATHS.SB_EPICS));
  add('src/stories/SystemStatus.stories.tsx exists', await exists(PATHS.SB_SYS));

  // Commands in package.json
  const pkg = await readJSON(PATHS.PKG);
  const reqScripts = ['dev','dev:mock','storybook','build','test','test:e2e','test:smoke:e2e','lint','format','docs:updates','agent:validate','agent:sync'];
  for (const s of reqScripts){ add(`script:${s} present`, !!pkg.scripts?.[s], pkg.scripts?.[s]||''); }

  // Write report
  const lines = [
    `# Agent Validate Report`,
    `Date: ${new Date().toISOString()}`,
    '',
    ...checks.map(c => `- ${c.pass ? 'PASS' : 'FAIL'}: ${c.name}${c.info ? `\n    ${c.info}` : ''}`)
  ];
  await ensureDirOf(PATHS.REPORT);
  await fs.writeFile(path.join(ROOT, PATHS.REPORT), lines.join('\n')+'\n', 'utf8');
  const failed = checks.filter(c => !c.pass).length;
  console.log(`[agent-validate] ${failed ? 'Completed with failures' : 'All checks passed'} → ${PATHS.REPORT}`);
  process.exit(failed ? 1 : 0);
}

main().catch(e=>{ console.error('[agent-validate] Error:', e); process.exit(1); });

