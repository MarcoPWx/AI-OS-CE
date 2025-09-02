# Community Edition (CE) Overview

Scope
- Local-first Storybook toolkit with MSW for mocks and knobs for latency/error.
- Manual, CLI-driven updates to docs and epics when you choose to run them.
- No background daemons, no cloud services, no automation without your command.

Quick start
- Install: npm install
- Dev UI: npm run dev (http://localhost:7007)
- Unit tests: npm run test:unit
- Accessibility (stories): npm run test:stories (expects dev server at 7007)
- Build static: npm run build

Docs as ground truth
- docs/status/DEVLOG.md — running log
- docs/roadmap/EPICS.md — lightweight backlog
- docs/SYSTEM_STATUS.md — quick status summary

Agent Boot (optional, manual)
- List epics: python3 tools/agent/agent_boot.py list-epics
- Create epic (optionally create GitHub issue): python3 tools/agent/agent_boot.py create-epic --title "…" [--create-issue]
- Update epic: python3 tools/agent/agent_boot.py update-epic --title "…" --status IN_PROGRESS --completion 50
- Sync GitHub (opt-in): python3 tools/agent/agent_boot.py sync-github

Developer controls
- Press "g" twice → Presenter overlay
- Storybook toolbar → MSW on/off/info, latency, error rate
- src/mocks/handlers.ts lists available mock routes

CE do/don't
- Do: keep everything local, minimal, predictable.
- Do: write tests alongside stories and components.
- Don't: rely on background processes or hidden automation.
- Don't: add features that require external services to function.

Troubleshooting
- Port in use → npm run dev -- -p 7008
- MSW disabled → toolbar → toggle MSW on
- Playwright errors → npx playwright install

