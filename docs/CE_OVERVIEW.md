# Community Edition (CE) Overview

Scope
- Local-first toolkit with MSW examples for mocks.
- Manual, CLI-driven updates to docs and epics when you choose to run them.
- No background daemons, no cloud services, no automation without your command.

Quick start
- Install: npm install
- Unit tests: npm run test:unit

Docs as ground truth
- docs/status/DEVLOG.md — running log
- docs/roadmap/EPICS.md — lightweight backlog
- docs/SYSTEM_STATUS.md — quick status summary

Agent Boot (optional, manual)
- List epics: python3 tools/agent/agent_boot.py list-epics
- Create epic (optionally create GitHub issue): python3 tools/agent/agent_boot.py create-epic --title "…" [--create-issue]
- Update epic: python3 tools/agent/agent_boot.py update-epic --title "…" --status IN_PROGRESS --completion 50
- Sync GitHub (opt-in): python3 tools/agent/agent_boot.py sync-github

CE do/don't
- Do: keep everything local, minimal, predictable.
- Do: keep docs and tests alongside code.
- Don't: rely on background processes or hidden automation.
- Don't: add features that require external services to function.

Troubleshooting
- Playwright errors → npx playwright install

