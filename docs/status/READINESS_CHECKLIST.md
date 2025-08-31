# Readiness Checklist (Go / No-Go)

Status: Current
Last Updated: 2025-08-29

Use this checklist to confirm we’re ready to build and release features with confidence.

Docs & Flows

- [x] Start Here orientation
- [x] Flow docs complete or stubbed (ALL_USER_FLOWS + detailed pages)
- [x] Flow coverage matrix created and linked

API & Mocks

- [x] Swagger story renders the spec from /docs/api-specs/openapi/quizmentor-api-v1.yaml
- [x] API Playground covers happy paths and error/timeout/caching/ratelimit
- [x] MSW coverage doc aligned with handlers.ts
- [x] WS scenarios documented and demo stories present

Testing & CI

- [x] Storybook Test Runner passes; basic axe checks on key stories
- [x] Coverage gate: src/components/ >= 60% (global 50% baseline)
- [x] Docs link check in CI
- [x] Chromatic configured (optional; token required)

Perf & DX

- [x] Bundling & Performance guide; Storybook Code Split Demo
- [x] Analyze-storybook available; CI uploads bundle analysis
- [x] MDX authoring guide; mdx-eslint integrated

System & Epics

- [x] SYSTEM_STATUS_CURRENT.md updated with validation record
- [x] EPIC_MANAGEMENT_CURRENT.md includes at-a-glance table and current sprint DoD

Notes

- Remaining substantive work (not blocking):
  - Auth wiring to Supabase (GitHub OAuth + email/password)
  - Backend persistence for analytics; quiz endpoints backing via Supabase
  - Expanded E2E for auth and multiplayer
