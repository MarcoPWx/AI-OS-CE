# System-to-System (S2S) Architecture

This document describes the core components and data flows for AI-OS-Storybook.

## Components
- Storybook UI (React)
  - Epic Manager, API Playground, Network Playground, Status/DevLog
  - MSW toolbar (latency/error knobs)
- MSW (Mock Service Worker)
  - src/mocks/handlers.ts — latency, error, passthrough toggles via headers
- Resilience Utilities (Pro)
  - circuitBreaker, backoff, timeout, retry, rateLimiter, bulkhead, dedupe, sse
- Agent Boot (Python)
  - CLI commands for docs/epics/GitHub/status/perf/security
  - Optional daemon/watch and guardrails-evaluate (Pro)
- State Store (local files)
  - docs/status/DEVLOG.md, docs/SYSTEM_STATUS.md, docs/roadmap/EPICS.md (rendered)
  - tools/agent/state/epics.json (source of truth; Pro)
  - tools/agent/state/outbox.json (GH queue; Pro)
  - tools/agent/state/metrics.json, suggestions.json (Pro)
- GitHub
  - Issues/PRs/Comments via gh CLI
- CI/CD
  - Build, test (Vitest/Playwright), a11y, artifacts
- Optional Arbiter (Ollama; Pro)
  - Local LLM PASS/FAIL for proposals under policy

## Core Flows

1) Developer Loop (Local V1)
- npm run dev → Storybook UI
- UI reads markdown docs and renders
- Agent CLI updates docs and epics; optional GitHub issue creation

Sequence:
UI → (view docs) → Developer → Agent CLI (update-docs/create-epic) → Filesystem

2) Epic + GitHub Sync
- create-epic --create-issue: agent writes local epic and calls gh issue create
- update-epic: agent writes status/progress; optionally posts GH comment
- sync-github: agent updates local epic status based on issue state

Sequence:
Agent → epics (file) → EPICS.md (render) → gh (issue/comment) → sync-github

3) Resilience Experimentation (V1/Pro)
- Developer increases MSW error/latency; explores API/Network playgrounds
- (Pro) Utilities wrap requests with breaker/backoff/timeout/sse
- (Pro) Metrics exported to metrics.json for guardrails-evaluate

Sequence:
UI + MSW → (optional) metrics → Agent guardrails-evaluate → epics/suggestions

4) Guardrail Engine (Pro)
- Input guardrails read metrics/policy; propose patterns (breaker/backoff/SSE)
- Output guardrails require tests/docs/limits
- Optional arbiter (Ollama) provides PASS/FAIL + rationale

Sequence:
metrics.json + policy → Guardrails → suggestions.json → epics.json → EPICS.md

5) Queueing & Offline (Pro)
- If gh unavailable or writes disabled, enqueue to outbox.json
- queue-flush posts comments when allowed

6) Daemon/Watch (Pro)
- daemon --interval N runs docs heartbeat, guardrails-evaluate, queue-flush
- watch polls file mtimes, triggers safe updates

## Security & Privacy
- Local-first; no secrets logged; gh CLI auth used for GH operations
- Ollama optional; runs locally; off by default

## Deployment Options
- Local dev: everything runs locally; minimal cost
- Cloud (optional): light container for daemon and GH sync; LLMs remain local (Ollama) or gated; costs low-to-moderate depending on workloads

