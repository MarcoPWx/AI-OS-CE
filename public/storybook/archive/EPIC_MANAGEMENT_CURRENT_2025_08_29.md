# Epic Management (Current Truth)

Last Updated: 2025-08-29

## At-a-glance Epic Summary

| Epic                                 | State        | Owner     | ETA         | Risks  | Definition of Done                                                                                               |
| ------------------------------------ | ------------ | --------- | ----------- | ------ | ---------------------------------------------------------------------------------------------------------------- |
| Docs & DX stabilization (MDX3)       | In Progress  | Docs Team | This sprint | Low    | Start Here page, Recent Docs panel, System Status pill, MDX authoring guide, MDX v3 readiness                    |
| Auth wiring (Supabase OAuth + Email) | Complete     | Core      | Done        | Low    | ✅ Mock-first auth with MSW, AuthContext, GitHub OAuth + email/password, session management, AUTH_WIRING_PLAN.md |
| Security Foundation                  | 80% Complete | Security  | This sprint | Low    | ✅ Security Playground, JWT/CSRF/Rate limiting, Input validation, CI/CD pipeline. Next: Headers, Audit logs      |
| QA & Guardrails                      | Planned      | QE        | Next sprint | Medium | A11y checks in CI, unit coverage gate, selected visual snapshots                                                 |
| Performance & Bundling               | Planned      | Core      | Next sprint | Medium | analyze-storybook run, documented bundle deltas, optional vendor grouping                                        |

EPIC 1: Authentication & OAuth (Supabase)
Status: ✅ COMPLETE — Mock-first implementation ready
Progress:

- ✅ Centralized auth service with MSW mock implementation (src/services/auth)
- ✅ AuthContext for React integration (src/contexts/AuthContext.tsx)
- ✅ GitHub OAuth and email/password flows implemented
- ✅ Session persistence in localStorage with auto-refresh
- ✅ Protected endpoints with JWT validation
- ✅ Complete documentation in AUTH_WIRING_PLAN.md
  Delivered:
- Mock-first auth ready for production migration
- All auth flows testable in Storybook

EPIC 2: Gamification + Question Delivery
Status: 75% — MOSTLY WIRED
Progress:

- QuizScreenEpic uses scoring, combos, and celebration effects
- questionDelivery now uses centralized supabase with offline fallback
- White screen bug fixed with safe fallbacks and guard UI
  Next:
- Persist analytics around XP/levels; wire achievements UI where applicable

EPIC 3: Backend/API Foundation
Status: 40%
Progress:

- Route stubs present for quiz, users, analytics
- Supabase schema docs exist
  Next:
- Implement endpoints backed by Supabase
- Add contract tests + OpenAPI

EPIC 4: Documentation & Runbooks
Status: 75%
Progress:

- Created SETUP_ENV.md, SPRINT_PLAN_CURRENT.md
- Established docs/status/\*\_CURRENT.md as source of truth
- Updated master index plan (pending edit)
  Next:
- Align legacy docs to point to current SOT; prune conflicting claims

EPIC 5: Testing & QA
Status: 70% — Mock-first E2E tests complete; Storybook/MSW fully integrated
Progress:

- ✅ Journey A (Start & Play) E2E tests with comprehensive mock validation
- ✅ S2S Orchestration tests (10 scenarios: happy path, chaos, circuit breaker, saga, etc.)
- ✅ Mock-to-real migration tests that work with both MSW and real APIs
- Storybook (web) wired with MSW, Swagger, API Playground, WS scenario toolbar
- Storybook Test Runner added; Playwright Storybook E2E added; Chromatic workflow configured
- Unit tests still blocked by RN/Expo module mocking issues
  Next:
- Wire auth with mock fallback (next priority)
- Implement analytics pipeline with mock validation
- Fix Jest environment for unit tests (lower priority)

EPIC 6: Security Foundation ⭐ NEW
Status: 80% Complete — Foundation Implemented
Progress:

- ✅ Security Playground in Storybook with interactive testing
- ✅ JWT validation, CSRF protection, Rate limiting implemented
- ✅ Input validation with Zod, XSS prevention with DOMPurify
- ✅ CI/CD security pipeline (GitHub Actions)
- ✅ Local security testing script
- ✅ Comprehensive documentation (SECURITY_AUDIT.md, SECURITY_EPIC.md)
  Next (Phase 2 - Sprint 2):
- Implement security headers in all responses
- Add audit logging for security events
- Set up Dependabot for automated updates
  Future (Phase 3 - Sprint 3-4):
- Biometric authentication for mobile
- Encryption at rest for sensitive data
- Certificate pinning for mobile apps
  Risks:
- Missing security headers could allow clickjacking
- No audit trail makes incident response difficult

Decisions

- Source of Truth: docs/status/SYSTEM_STATUS_CURRENT.md and docs/status/EPIC_MANAGEMENT_CURRENT.md
- Security Epic: docs/status/SECURITY_EPIC.md for detailed security roadmap
- Expo env vars for Supabase; offline-first fallbacks remain
