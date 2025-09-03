# AI-OS CE Toolkit

[![CI](https://github.com/MarcoPWx/AI-OS-CE/actions/workflows/ci.yml/badge.svg)](https://github.com/MarcoPWx/AI-OS-CE/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Local-first toolkit for AI-assisted development. No cloud dependencies required. No UI runtime.

Highlights
- Agent Boot CLI (Python): manage DEVLOG, SYSTEM_STATUS, EPICS; optional GitHub issue sync; quick security/perf checks
- Minimal Node toolbelt: lint, format, integrity scripts
- Small TS utilities: e.g., HTTP correlation helper for tracing

Requirements
- Node.js >= 18.17
- Python >= 3.9
- Optional: GitHub CLI (gh) if you want to create/sync issues from the CLI

Install
```bash
# Clone and install
git clone https://github.com/MarcoPWx/AI-OS-CE.git
cd AI-OS-CE
npm install
```

Quick start
```bash
# Initialize (creates/updates docs and config)
python3 tools/agent/agent_boot.py init

# Write a devlog entry and refresh system status
action="Implemented initial auth flow"
python3 tools/agent/agent_boot.py update-docs --content "$action"

# Create and manage epics
python3 tools/agent/agent_boot.py create-epic --title "Add login" --description "OAuth2 w/ PKCE" 
python3 tools/agent/agent_boot.py update-epic --title "Add login" --status IN_PROGRESS --completion 50
python3 tools/agent/agent_boot.py list-epics

# Optional GitHub sync (requires gh auth)
python3 tools/agent/agent_boot.py sync-github
```

Command reference (most used)
```bash
# Health and signals
python3 tools/agent/agent_boot.py workflow-status
python3 tools/agent/agent_boot.py performance-report
python3 tools/agent/agent_boot.py test-security --input "<script>alert('xss')</script>"

# JS-side hygiene
npm run lint
npm run prettier:check
npm run prettier:write
npm run integrity:check

# One-shot smoke test
npm run smoke:test

# Optional: Watch for changes (non-interactive)
python3 tools/agent/agent_boot.py watch --seconds 30 --interval 5 --emit-events

# Optional: Tail events (if emit-events enabled)
npm run events:tail
```

Configuration
Create or edit .agent_boot.config.json at repo root:
```json
{
  "default_branch": "main",
  "project_name": "AI-OS-CE",
  "github_integration": false,
  "test_coverage_threshold": 80.0,
  "dev_port": 7007,
  "auto_pull": false
}
```

Project structure
```
.
├── bin/
├── docs/
│   ├── status/DEVLOG.md
│   ├── roadmap/EPICS.md
│   └── SYSTEM_STATUS.md
├── scripts/
├── src/
│   └── utils/http/correlation.ts
├── tools/
│   └── agent/
│       ├── AGENT_BOOT_README.md
│       └── agent_boot.py
├── .agent_boot.config.json
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── pr-checks.yml
└── package.json
```

What’s not included (by design)
- No UI runtime or visual component workbench
- No bundled test harness (unit/e2e) or mock server
- No required external services (GitHub sync is optional)

CI
- Lint, format, and integrity checks run in CI via GitHub Actions
- See .github/workflows/ci.yml and pr-checks.yml

Contributing
- Keep changes focused and documented
- Update DEVLOG, SYSTEM_STATUS, and EPICS when behavior changes

License
MIT

