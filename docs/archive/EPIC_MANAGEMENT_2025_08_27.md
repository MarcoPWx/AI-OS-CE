# Epic Management

Last Updated: August 27, 2025

## EPIC 1: Authentication & OAuth (Supabase)

**Status**: 20% (blocking)
**Progress**:

- State/hooks scaffolded
- Profile screen pending
  **Next**:
- Implement Supabase GitHub OAuth (web)
- Minimal Profile screen; protect write endpoints with JWT

## EPIC 2: Gamification + Delivery Wiring

**Status**: 90% ✅ MOSTLY COMPLETE
**Progress**:

- Wired `QuizScreenFrictionless` to `questionDelivery` (online/offline)
- Gamification hooks on answer (combo, XP) + on results (daily quest)
- Achievement popup and combo multiplier UI components integrated
- Real-time achievement detection and display
  **Next**:
- Persist analytics events to backend

## EPIC 3: Backend/API Foundation

**Status**: 40%
**Progress**:

- Route stubs added: `/api/quiz/*`, `/api/users/*`, `/api/analytics/event`
- Mounted in `api/src/index.ts`
  **Next**:
- Back endpoints with Supabase/Redis
- Contract tests + OpenAPI doc

## EPIC 4: Documentation & Runbooks

**Status**: 80%
**Progress**:

- Updated animation doc to match implementation
- Added API_ROUTES, INTEGRATION_WIRING
- Runbooks index created
  **Next**:
- Keep /docs/status as the source of truth

## Risks

- Auth not wired yet → blocks personalization and persistence
- Supabase config not set → delivery falls back to local data

## Decisions

- Web-first wiring; Reanimated planned later
- Keep stubs minimal; add tests before expanding
