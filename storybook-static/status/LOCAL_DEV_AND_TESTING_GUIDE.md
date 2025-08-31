# Local Development and Testing Guide

Status: Current
Last Updated: 2025-08-28
Owner: QuizMentor Engineering

This guide explains how to run QuizMentor locally with mocks (HTTP via MSW and WebSocket via MockWebSocket), how to use Storybook, interaction tests, E2E tests, and visual regression.

Prerequisites

- Node.js 20+
- npm 9+
- Expo CLI (optional, installed via npx)
- iOS/Android simulators if running native

One-time setup (MSW service worker for web)

- Install deps: npm install
- Initialize the MSW worker:
  - npx msw init public/ --save

Environment flags (quick reference)

- USE_MOCKS=true — enable RN MockEngine and default to mock WebSocket
- EXPO_PUBLIC_USE_MSW=1 — enable MSW in web
- EXPO_PUBLIC_USE_WS_MOCKS=1 — enable WebSocket mocking (web/RN)
- EXPO_PUBLIC_USE_ALL_MOCKS=1 — enable MSW (web) + WS mocks (combine with USE_MOCKS=true for RN fetch interception)
- WS_MOCK_SCENARIO=lobbyBasic|matchHappyPath|disconnectRecovery|taskBoardLive — select WebSocket scenario
- MSW_LOGGING=true — verbose MSW logs in web/tests

Defaults

- Storybook defaults: theme=light, platform=web, wsScenario=lobbyBasic
- App defaults: mocks off unless USE_MOCKS=true or EXPO_PUBLIC_USE_ALL_MOCKS=1
- Prefer EXPO_PUBLIC_USE_ALL_MOCKS=1 for web demos; USE_MOCKS=true for RN demos

Run the app with mocks (web)

- All mocks (HTTP + WS):
  - WS_MOCK_SCENARIO=matchHappyPath npm run start:all-mocks:web
  - Open the Expo web URL (e.g., http://localhost:19006) from the terminal/DevTools
- Only HTTP mocks (MSW):
  - npm run start:web:mock

Run the app with mocks (React Native)

- All mocks on device (HTTP + WS):
  - WS_MOCK_SCENARIO=disconnectRecovery npm run start:all-mocks:rn
  - Launch the iOS/Android app from the Expo DevTools

Storybook (web) with MSW and WS toolbar

- Start Storybook: npm run storybook (or npm run storybook:with-sse to launch SSE + Storybook together)
- Open: http://localhost:7007
- Useful stories:
  - Design/PlatformThemePreview: visibly reflects Theme/Platform toolbars (font/radius tokens).
  - Dev/NetworkPlayground: global latency/error defaults with request timeline and scenario runner.
  - Docs/Latency & Error Profiles: documentation + embedded playground.
  - Docs/Repo Docs Browser: read Markdown from /docs inside Storybook.
  - API/Playground: interactive MSW calls (GET/POST)
    - Try GET /api/lessons, GET /api/cache (click twice → 200 then 304), GET /api/ratelimit (4 clicks → 429)
    - Try POST /api/tooltips/generate with trigger words in the input:
      - TRIGGER_RATE_LIMIT → 429 with Retry-After
      - TRIGGER_ERROR → 500 error
      - TRIGGER_CACHED → 200 then 304 on repeat
    - Use per-story overrides: ErrorLessons (500), TimeoutLessons (2s delay), EmptyLessons (empty), ErrorQuizzes (500)
    - Shows status, JSON, and HTML responses
  - API/Swagger: renders public/swagger.json via Swagger UI
  - Flows/QuizFlowDemo: tiny quiz demo with a play() flow test
  - Testing/Counter: simple play() example
  - Live/TaskBoard: demonstrates WS mock scenario ‘taskBoardLive’ emitting real-time task updates (defaults to wsScenario: taskBoardLive for the story)
- Toolbars:
  - WS Scenario: lobbyBasic, matchHappyPath, disconnectRecovery, taskBoardLive
  - Theme: light/dark
  - Platform: web/ios/android
  - Via URL: &globals=wsScenario:matchHappyPath,theme:dark,platform:ios

Storybook interaction tests (Playwright-based)

- Fast (requires Storybook running):
  - npm run storybook
  - npm run test:stories
- CI-like (static build + test):
  - npm run build-storybook && npm run test:stories:ci

SSE demo server (optional for live fallback)

- Start the local SSE server in another terminal:
  - npm run sse:demo # serves http://localhost:3002/api/sse-demo
- In Storybook, open Docs/Tech Stack + API and the "Live WS → SSE Fallback (Real SSE)" demo

Playwright E2E (headed) targeting Storybook

- One command that starts Storybook and runs tests:
  - npm run e2e:storybook
- View a specific suite in headed mode:
  - npx playwright test e2e/storybook-msw.spec.ts --headed
- Show the Playwright report UI:
  - npx playwright show-report

Visual regression (Chromatic)

- Locally:
  - export CHROMATIC_PROJECT_TOKEN={{CHROMATIC_PROJECT_TOKEN}}
  - npm run chromatic
- In CI: .github/workflows/visual-regression.yml (ensure repo secret CHROMATIC_PROJECT_TOKEN is set)

Unit tests (including new API route tests)

- All unit tests: npm run test:unit
- Just the new MSW API tests:
  - npm test -- src/**tests**/api/cache.spec.ts
  - npm test -- src/**tests**/api/rate-limit.spec.ts

WebSocket ‘Task Board Live’ scenario

- To simulate real-time task updates in the browser without a backend, use WS_MOCK_SCENARIO=taskBoardLive
- Web: WS_MOCK_SCENARIO=taskBoardLive npm run start:all-mocks:web
- RN: WS_MOCK_SCENARIO=taskBoardLive npm run start:all-mocks:rn
- In Storybook, see Live/TaskBoard
- App integration: subscribe to task:update messages on your WebSocket layer. Payload example:
  - { id, title, status: 'todo' | 'in_progress' | 'done' | 'blocked', updatedAt }

Tips

- If an MSW endpoint is unhandled, check the browser console. Set MSW_LOGGING=true to diagnose.
- For WebSocket demos, use the Storybook WS toolbar to switch scenarios without rebuilding.
- For consistent snapshotting in Chromatic, prefer stories with deterministic data and minimal animation.

End-to-end validation checklist

1. Install dependencies and start Storybook
   - npm install
   - npm run storybook (http://localhost:7007)
2. Validate interactive stories
   - Docs/Quick Index (open a few top docs)
   - API/Playground (GET /api/lessons, GET /api/cache twice → 304, GET /api/ratelimit 4x → 429)
   - API/Swagger (browse endpoints; toggle doc expansion, model depth, and TryOut via Controls)
   - Dev/NetworkPlayground (set MSW presets; run scenario; toggle x-msw-no-defaults)
   - Live/TaskBoard (switch WS Scenario toolbar; see events)
3. Run Storybook Test Runner (with Storybook running)
   - npm run test:stories
4. CI-style validation
   - npm run build-storybook && npm run test:stories:ci
5. Optional visuals (Chromatic)
   - export CHROMATIC_PROJECT_TOKEN={{CHROMATIC_PROJECT_TOKEN}}
   - npm run chromatic

Related docs

- docs/STORYBOOK_TESTING.md (Storybook, MSW, Test Runner, Playwright, Chromatic)
- docs/mocks/SERVICE_MOCKING_ARCHITECTURE.md (Unified mocks)
- docs/mocks/WEBSOCKET_MOCKS.md (WS scenarios)
- docs/WEBSOCKET_API.md (WS protocol)
- runbooks/DEVELOPER_MOCK_RUNBOOK.md (Dev mock runbook)
