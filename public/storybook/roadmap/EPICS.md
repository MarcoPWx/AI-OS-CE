# EPICS — Canonical Roadmap

> This is the canonical EPICS document. For current status view, see /docs/status/EPIC_MANAGEMENT_CURRENT.md
> Updated: 2025-08-31

Purpose
- Provide a stable, canonical location for the roadmap of major epics.
- Link to the live status page that is updated during development cycles.

Index
- Authentication & OAuth
- Gamification & Question Delivery
- Backend/API Foundation
- Documentation & Runbooks
- Testing & QA
- Security Foundation
- Performance & Bundling

Notes
- The System Status page (Docs/System Status) reflects current health.
- The Epic Manager story provides an interactive view; this file is the canonical written source.

## Now Working On (as of 2025-08-30)
- EPIC-12 Simplify Agent Boot & Docs — In Progress
  - Minimal ops: docs:updates active; remove Agent badge, agent:validate, and pre-Storybook agent:sync.
- Authentication & OAuth — P0
  - Wire Supabase auth (GitHub + email) end-to-end.
- Testing & QA — P1
  - Stabilize RN/Expo unit test environment; fix brittle TurboModules.
- Analytics & Tracking — P1
  - Persist client events to backend; add contract tests.
- Backend/API Foundation — P1
  - Back API stubs with Supabase; implement contract tests and OpenAPI.
- Theme/UI Consistency — P1
  - Propagate theme across Epic screens; remove hardcoded styles.

## 12) Simplify Agent Boot & Docs (Ultra-minimal)

Goal
- Keep Agent operations minimal and explicit.
- Only two actions:
  - update docs: updates DevLog, Epics, System Status (no extra side-effects)
  - load agent boot: regenerate AGENT_BOOT.md only when asked

Planned removals
- Storybook Agent badge (always-visible)
- agent:validate script
- prestorybook auto agent:sync

Planned keeps
- docs:updates (safe, non-destructive)
- manual agent:sync (only when requested)
- canonical pointers (no content loss)

Acceptance Criteria
- A dated decision is recorded in DevLog describing this epic and the simplification plan.
- System Status and Epics timestamps reflect the update.
- A last-updated JSON is present (docs/status/last-updated.json) capturing the three canonical doc timestamps.

## Historical archive
- Epic Management (2025-08-27): ../archive/EPIC_MANAGEMENT_2025_08_27.md
- Epic Management — Current Truth (2025-08-29): ../archive/EPIC_MANAGEMENT_CURRENT_2025_08_29.md
- Epic Management — Current Truth (2024-12-26): ../archive/EPIC_MANAGEMENT_CURRENT_2024_12_26.md
- All Epics Status (2025-08-29): ../archive/ALL_EPICS_STATUS_2025_08_29.md
- QuizMentor Epic Management (2024-12-26): ../archive/QuizMentor_EPIC_MANAGEMENT_2024_12_26.md
- QuizMentor Epic Management v2 (2024-12-25): ../archive/QuizMentor_EPIC_MANAGEMENT_V2_2024_12_25.md

