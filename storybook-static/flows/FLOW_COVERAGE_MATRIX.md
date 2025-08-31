# Flow Coverage & Testing Matrix

Status: Current
Last Updated: 2025-08-29

This matrix tracks documentation and tests for each main user flow. Use it as a single place to see “what’s covered” and to identify gaps.

Legend

- Docs: ✅ complete, ⚠️ partial, ⭕ missing
- Stories: Storybook CSF/MDX coverage
- Tests: Unit/Integration/Playwright or Storybook play()

Flows

1. Registration & Login

- Docs: ✅ /docs/flows/main-flows/USER_REGISTRATION_FLOW.md
- Stories:
  - Flows/Docs → AuthChoice
  - API/Playground → POST /api/login (error/timeout variants)
  - API/Swagger → view auth endpoints
- Tests:
  - Storybook play(): API/Playground variants
  - Unit/Integration: authService tests (planned)
  - E2E: e2e/auth.spec.ts (planned)

2. Onboarding

- Docs: ✅ /docs/flows/main-flows/ONBOARDING_FLOW.md
- Stories: Flows/Docs → Home (first-time path), Design/PlatformThemePreview
- Tests: Unit for onboarding reducer (planned), Storybook play() (planned)

3. Quiz Taking

- Docs: ✅ /docs/flows/main-flows/QUIZ_TAKING_FLOW.md
- Stories: Flows/Docs → Quiz; API/Playground → lessons/quizzes/cache/ratelimit
- Tests: Storybook play() (ApiPlayground default + variants), Unit (quiz engine tests exist), E2E (e2e/quiz-flow.spec.ts)

4. Results & Analytics

- Docs: ✅ /docs/flows/main-flows/RESULTS_AND_ANALYTICS_FLOW.md
- Stories: Flows/Docs → Results; Dev/NetworkPlayground (mock latency/error)
- Tests: Unit (score calc), Storybook play() (planned), E2E (results flow included in quiz E2E)

5. Multiplayer

- Docs: ✅ /docs/flows/main-flows/MULTIPLAYER_FLOW.md
- Stories: Live/TaskBoard (WS demo); Docs/Mocking & Scenarios (WS→SSE fallback)
- Tests: E2E (planned), WS client unit tests (planned)

6. Settings & Profile

- Docs: ✅ /docs/flows/main-flows/SETTINGS_AND_PROFILE_FLOW.md
- Stories: TBD (profile/settings specific components)
- Tests: Unit (planned), Storybook play() (planned)

7. Premium & Monetization

- Docs: ✅ /docs/flows/main-flows/PREMIUM_AND_MONETIZATION_FLOW.md
- Stories: TBD (Paywall simplified demo), Design/PlatformThemePreview (cosmetic)
- Tests: Unit for purchases mock (planned), E2E (planned)

8. Error Recovery

- Docs: ✅ /docs/flows/main-flows/ERROR_RECOVERY_FLOW.md
- Stories: Dev/NetworkPlayground; API/Playground variants (Error/Timeout/429/304)
- Tests: Storybook play() on error variants; E2E (offline/timeout scenarios planned)

Cross-cutting

- API Doc: ✅ API/Swagger; Spec: /docs/api-specs/openapi/quizmentor-api-v1.yaml
- Mock Coverage: ✅ /docs/mocks/SERVICE_MOCKING_COVERAGE.md (HTTP), WS scenarios in Docs/Mocking & Scenarios
- A11y: ✅ Basic axe checks in Storybook Test Runner for key docs/pages
- Perf: ✅ analyze-storybook, Code Split Demo

Next

- Add Storybook stories for Settings/Profile and Paywall simplified demo
- Add Storybook play() coverage for Results screen interactions
- Wire E2E tests for auth and multiplayer happy paths
