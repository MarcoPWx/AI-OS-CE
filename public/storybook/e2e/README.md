# E2E and Storybook Test Runner

Status: Current
Last Updated: 2025-08-28
Owner: QuizMentor Engineering

This document explains our end-to-end testing strategy across Storybook’s Playwright-based Test Runner and application-level Playwright tests. It clarifies when to use each, how to run them locally and in CI, and how to validate mocked network behaviors consistently.

## Approaches

- Storybook Test Runner (recommended for UI components and flows isolated in stories)
  - Runs play() functions defined in stories, using a bundled Playwright runner
  - Fast feedback, no backend required, deterministic with MSW and WS mocks
  - Ideal for interaction sequences, empty/error states, and accessibility checks

- Application E2E (Playwright)
  - Drives the full web app (or mobile web) against mocked or real services
  - Useful for verifying integration between screens, routing, and providers
  - Can target Storybook as a host for stable mocked behaviors when needed

## Commands

Storybook (web):

- npm run storybook
- Open http://localhost:7007

Storybook Test Runner (with Storybook running):

- npm run test:stories

Storybook Test Runner (CI-like, static build):

- npm run build-storybook && npm run test:stories:ci

E2E targeting Storybook (starts SB automatically):

- npm run e2e:storybook

Visual regression (Chromatic):

- export CHROMATIC_PROJECT_TOKEN={{CHROMATIC_PROJECT_TOKEN}}
- npm run chromatic

## What to validate

HTTP behaviors via MSW (use stories under API/Playground and Dev/NetworkPlayground):

- Caching: GET /api/cache returns 200 with ETag on first call, then 304 Not Modified when If-None-Match matches
- Rate limiting: GET /api/ratelimit returns 429 after threshold; verify Retry-After header
- Error paths: 500 variants for lessons/quizzes and 401 for login
- Presets: MSW Profile toolbar (default/slower/flaky/chaos) to simulate latency/error; Defaults chip shows current values
- Opt-out: send header x-msw-no-defaults: 1 for per-request bypass (toggles available in stories)

WebSocket scenarios (use Live/TaskBoard story):

- Switch via WS Scenario toolbar: lobbyBasic, matchHappyPath, disconnectRecovery, taskBoardLive
- Validate predictable message sequences and UI updates

SSE fallback (optional):

- Start local SSE demo: npm run sse:demo (serves http://localhost:3002/api/sse-demo)
- Open the Live WS → SSE Fallback demo from Docs/Tech Stack + API in Storybook

## Local tips

- Headed Storybook tests: set PWDEBUG=1 and re-run tests; you can also use Playwright’s UI for app E2E runs
- Determinism: prefer stories with static data and minimal animation for Chromatic snapshots
- Quick navigation: use Docs/Quick Index and Docs/Repo Docs Browser inside Storybook

## CI

- Storybook tests: build Storybook once, then run the Test Runner in a dedicated job
- Visual regression: Chromatic runs on pull requests; ensure CHROMATIC_PROJECT_TOKEN is configured in repo secrets
- App E2E: execute Playwright tests after the app is built and served (mocked or real), using separate CI jobs

## Troubleshooting

- MSW not intercepting: ensure EXPO_PUBLIC_USE_MSW=1 (web) and that handlers are registered in .storybook/preview.ts
- Unexpected latency/errors: check the MSW Profile toolbar; use the Defaults chip to verify current values
- Inconsistent results: disable animations on the tested story or stabilize with deterministic props
- WebSocket messages missing: verify WS Scenario toolbar state; for app E2E, ensure EXPO_PUBLIC_USE_WS_MOCKS=1
