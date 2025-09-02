# User Journeys (V1 Core + Pro Roadmap)

This document captures the primary user journeys for AI-OS-Storybook. V1 focuses on a local-first, Storybook-first developer experience. Pro (private) introduces the Guardrail Engine, multi-engine blackboard, watch/daemon, and advanced resilience.

---

Journey 1 — Start Your Day (Local Dev)
- Goal: Regain context in <2 minutes and get productive.
- Steps:
  1) npm install; npm run dev → open http://localhost:7007
  2) View Docs/Dev Log and Status Dashboard
  3) python3 tools/agent/agent_boot.py workflow-status
  4) If needed, python3 tools/agent/agent_boot.py update-docs --content "Daily plan"
- Success Criteria:
  - Storybook renders
  - Status shows session info
  - DevLog captured

Journey 2 — Plan a New Feature (Epic + GitHub)
- Goal: Create an epic, optionally open an issue, begin implementation.
- Steps:
  1) python3 tools/agent/agent_boot.py create-epic \
     --title "Add Authentication" \
     --description "Implement OAuth2 login" \
     --create-issue
  2) Confirm output shows GitHub issue number
  3) Implement in Storybook; add stories/tests
  4) python3 tools/agent/agent_boot.py update-docs --content "Started auth"
- Success Criteria:
  - Epic created, issue (optional) created
  - Stories and tests scaffolded

Journey 3 — Track Progress (Visual + GitHub)
- Goal: Update status and post progress to GH.
- Steps:
  1) python3 tools/agent/agent_boot.py update-epic --title "Add Authentication" --status IN_PROGRESS --completion 50
  2) python3 tools/agent/agent_boot.py list-epics
  3) python3 tools/agent/agent_boot.py sync-github (optional)
- Success Criteria:
  - Local EPICS updated, GH issue comment posted (when available)

Journey 4 — Investigate Failures (Resilience)
- Goal: Simulate network issues and identify needed patterns.
- Steps:
  1) In Storybook toolbar → MSW → set Error Rate and Latency
  2) Use API Playground and Network Playground
  3) Observe behavior; add retries/backoff/breakers (Pro utilities)
- Success Criteria:
  - Clear visibility into failures
  - Identified pattern improvements

Journey 5 — Prepare for Release (Readiness)
- Goal: Assess health and gaps before ship.
- Steps:
  1) Run unit/e2e tests locally
  2) Review docs/RELEASE_READINESS.md
  3) Update DEVLOG with outcomes
- Success Criteria:
  - Clear go/no-go call

Journey 6 — Continuous Improvement (Pro)
- Goal: Enable Debug Mode, watch/daemon, guardrails-evaluate.
- Steps (Pro):
  1) python3 tools/agent/agent_boot.py debug --on
  2) python3 tools/agent/agent_boot.py daemon --interval 300 --watch
  3) python3 tools/agent/agent_boot.py guardrails-evaluate
- Success Criteria:
  - Guardrail proposals → epics
  - Pattern history recorded for learning

---

Roles & Responsibilities
- Developer: Runs Storybook, writes code/stories/tests, uses the Agent CLI to keep docs updated.
- Agent (V1): Updates DevLog/System Status, manages epics, optional GH integration.
- Agent (Pro): Adds guardrails, proposals, daemon/watch, and evaluation loops.

KPIs (initial)
- Time-to-context: <2 minutes
- Docs freshness: DevLog updated daily
- Visual progress: 100% of epics show % complete
- (Pro) Guardrail precision/recall on real failures

