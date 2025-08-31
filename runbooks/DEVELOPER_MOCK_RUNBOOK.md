# Developer Mock Runbook

> Status: Complete
> Last Updated: 2025-08-28
> Author: Docs Team
> Version: 1.0

## Purpose

Step-by-step guide for running the app locally with mocks, switching scenarios, and debugging.

## Quick start

- Web (Expo Web):
  - EXPO_PUBLIC_USE_MSW=1 EXPO_PUBLIC_USE_WS_MOCKS=1 EXPO_PUBLIC_USE_ALL_MOCKS=1 WS_MOCK_SCENARIO=matchHappyPath npm start
- React Native (iOS/Android):
  - USE_MOCKS=true EXPO_PUBLIC_USE_WS_MOCKS=1 WS_MOCK_SCENARIO=lobbyBasic npm start

## Auth flows

- GitHub OAuth mock: AuthService short-circuits when USE_MOCKS=true (RN) and sets a mock session
- Email/password mock: UI is available in the 'auth-login' state; for web/tests, MSW intercepts Supabase auth endpoints; for RN, MockEngine fixtures are used

## Toggling mocks

- USE_MOCKS=true — enable RN MockEngine and default WS mock
- EXPO_PUBLIC_USE_MSW=1 — enable MSW on web
- EXPO_PUBLIC_USE_WS_MOCKS=1 — enable WS mocks (web/RN)
- EXPO_PUBLIC_USE_ALL_MOCKS=1 — convenience aggregate flag
- MOCK_MODE=demo|development|test|storybook — profile behavior
- WS_MOCK_SCENARIO=lobbyBasic|matchHappyPath|disconnectRecovery|taskBoardLive — deterministic WS flow
- MSW_LOGGING=true — verbose logging (web/tests)

## Inspecting requests

- RN: getMockIntegration().getRequestLog() or read AsyncStorage @QuizMentor:request_log when persistence is enabled
- Web: open DevTools console to view MSW logs (enable MSW_LOGGING)
- Tests: MSW Node server logs to console when enabled

## Changing scenarios at runtime (RN)

```ts path=null start=null
import { getMockIntegration } from '../src/services/mockIntegration';
const mocks = getMockIntegration();
await mocks.switchMode('test');
// For WS scenario, restart the app with WS_MOCK_SCENARIO=matchHappyPath
```

## Troubleshooting

- Service worker not active (web): ensure EXPO_PUBLIC_USE_MSW=1 and mockServiceWorker.js is served; see docs/MSW_SETUP.md
- WS not mocked: ensure EXPO_PUBLIC_USE_WS_MOCKS=1 or USE_MOCKS=true
- Mixed real/mocked data: disable EXPO_PUBLIC_USE_ALL_MOCKS in production builds

## Storybook toolbars (web)

- WS Scenario toolbar: lobbyBasic | matchHappyPath | disconnectRecovery | taskBoardLive
- Theme toolbar: light | dark
- Platform toolbar: web | ios | android (cosmetic tokens)
- Preview story: Design/PlatformThemePreview

## Related

- docs/status/LOCAL_DEV_AND_TESTING_GUIDE.md
- docs/STORYBOOK_TESTING.md
- docs/MOCKS_OVERVIEW.md
- docs/mocks/WEBSOCKET_MOCKS.md
- docs/MSW_SETUP.md
- docs/WEBSOCKET_API.md
