# Sprint Plan (Current)

Last Updated: 2025-08-28
Sprint Theme: Stabilize core loop, wire auth, and restore CI signal
Duration: 1 week

Goals

1. Implement Supabase Auth (web + email) with session persistence
2. Stabilize unit tests in RN/Expo environment
3. Persist analytics events to backend
4. Propagate refined theme across Epic screens

Backlog (ordered)
P0 — Supabase Auth Wiring

- Implement GitHub OAuth (web) with redirect, and email/password sign-in
- Add minimal Profile screen (username, level, XP, streak)
- Gate protected actions by session; handle sign-out
- Acceptance: Successful login persists across app restart; profile loads; protected requests require auth

P0 — Fix white screen (Completed)

- Ensure guard UI and fallbacks prevent blank screens on quiz start
- Acceptance: No blank screen; quiz always renders or shows a clear message

P1 — Jest/Expo Test Stability

- Refactor components accessing Dimensions at module scope
- Simplify jest.setup and mocks; ensure expo-av mocked safely
- Add smoke unit tests for QuizScreenEpic and AppProfessionalRefined
- Acceptance: Unit tests pass locally and on CI without manual steps

P1 — Analytics Persistence

- Implement backend ingestion endpoint and client batching/flush
- Add contract tests; wire to events in quiz/gamification
- Acceptance: Events stored in Supabase; retries verified

P1 — Theme Propagation

- Replace hardcoded gradients/colors in Epic screens with theme tokens
- Validate in Storybook with basic component and screen stories
- Acceptance: Screens align to refined theme; stories approved

Stretch — API Backing

- Back existing API stubs with Supabase; add OpenAPI/contract tests
- Acceptance: At least quiz fetch path uses backed endpoint

Risks/Dependencies

- Supabase env configuration required (see SETUP_ENV.md)
- Jest RN/Expo environment brittle; changes may cascade

Tracking & Reporting

- Source of Truth: docs/status/SYSTEM_STATUS_CURRENT.md
- Epics: docs/status/EPIC_MANAGEMENT_CURRENT.md
- Daily devlog updates in docs/status/DEVLOG.md
