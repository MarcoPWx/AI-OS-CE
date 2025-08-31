# Agent Boot Contract

Purpose
- This document makes the project “agent-ready.” It defines the minimum I need to operate instantly, the guardrails I must follow, and how we collaborate via TDD and clean code practices.

Constraints & Allowed Tools
- Terminal only; no external web browsing.
- Non-interactive commands; avoid pagers; prefer --no-pager or non-paged output.
- No secrets printed. Use env var names only (e.g., OPENAI_API_KEY) and never echo values.
- Destructive actions (delete/migrate/overwrite) require explicit consent.

Canonical Docs (single source of truth)
- DevLog: docs/status/DEVLOG.md
- Epics: docs/roadmap/EPICS.md
- System Status: docs/SYSTEM_STATUS.md

Core Commands
- Dev server: npm run dev or npm run dev:mock
- Storybook: npm run storybook
- Build: npm run build
- Unit tests: npm test
- E2E tests: npm run test:e2e (smokes: npm run test:smoke:e2e)
- Lint: npm run lint (fix: npm run lint:fix)
- Format: npm run format

Agent Operations (how to ask)
- Analyze: “Agent, read the Agent Boot page and canonical docs; propose top 5 priorities with TDD steps.”
- Update docs: “Agent, update DevLog/System Status/Epics from this session.”
- TDD feature: “Agent, implement <feature> via TDD: write failing tests, make it pass, refactor, update docs.”
- Refactor: “Agent, refactor <area> without changing external behavior; update tests/docs.”

TDD Policy
- Red-Green-Refactor:
  1) Write or adjust a failing test (Given/When/Then); commit.
  2) Implement the minimal change to pass; commit.
  3) Refactor for clarity/performance; keep green; commit.
- Coverage criteria: 80% min for lines, branches, functions, statements. Fails under thresholds.
- Flaky tests: mark @flaky, file a TODO with issue/ref, fix or quarantine with justification.

Clean Code Guidelines
- Keep functions short and single-purpose. Extract helpers for clarity.
- Favor pure functions; isolate side-effects (I/O, network, time, randomness) behind interfaces.
- Explicit errors: differentiate user vs system errors; never swallow exceptions silently.
- Naming: intent-revealing names; consistent casing; no abbreviations that hide meaning.
- Comments: explain why, not what; keep code self-explanatory.
- Logging: structured key-value logs; no secrets; include correlation IDs if available.
- Config: env-driven; sane defaults; validate at startup.

Testing Guidelines
- Unit: deterministic, stable selectors/IDs; no real network; mock time/random.
- Integration: limited scope; MSW for HTTP; assert contracts (shape/status).
- E2E: smokes for critical flows; avoid brittle selectors; control timing with explicit waits.
- Accessibility: run axe checks on key pages/components where feasible.

Storybook Authoring Rules
- MDX v3 constraints: imports/exports only at top; put state inside React.use*.
- Canonicalization: DevLog/Epics/System Status stories load only the canonical doc paths.
- Include a “Last Updated” badge (manifest-based if available) on key doc pages.
- Link each story to related epics/tests (where useful).

Security & Compliance
- BYOK: keys reside in memory only; never persisted.
- Content-Security-Policy: keep connect-src restricted to allowed domains.
- Data handling: no PII in logs; redact sensitive content in errors.

Risk Gates (ask before proceeding)
- Deleting files, DB migrations, rewriting large swaths of tests, or changing public API shapes.
- Running commands that could disrupt local state (docker prune, rm -rf, etc.).

Change Request Mini-DSL (optional)
- Scope: feature | fix | refactor | docs
- Context: <short business/tech context>
- Acceptance: <Given/When/Then>
- Constraints: <perf, a11y, API, deps>
- Touch: <paths/areas>
- Risk: low | medium | high

Code Review Checklist (self-check)
- Does a failing test precede the change? Are tests minimal but meaningful?
- Are names clear? Any dead code or duplicate logic left?
- Are errors surfaced with actionable messages? No secret leakage?
- Is the change small and scoped? Could it be split further?
- Are docs updated (DevLog/System Status/Epics)?

Boot Prompts (copy/paste)
- Analyze: “Agent: Read Agent Boot and canonical docs; propose a 5-item TDD plan.”
- Update docs: “Agent: Update DevLog/System Status/Epics from this session.”
- Implement: “Agent: Implement <feature> via TDD. Start with tests; minimal code; then docs.”

Directory Orientation (example)
- App pages/API: src/app/**/*
- Components: src/components/**/*
- Docs: docs/**/* (canonical docs above)
- Stories: src/stories/**/*
- Tests: src/components/**/__tests__ and tests/e2e/**/*

Acceptance Criteria for This Contract
- One canonical doc each for DevLog, Epics, System Status.
- Storybook boot page present and linked from top-level nav.
- Agent operates via TDD, updates docs on request, and respects guardrails.
