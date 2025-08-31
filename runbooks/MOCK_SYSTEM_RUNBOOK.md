# Mock System Runbook

Status: Active
Last Updated: 2025-08-28

Purpose
Operate, extend, and debug the unified mocking stack (MSW + MockEngine + WS mocks) for QuizMentor.

Quick Start

- Web: EXPO_PUBLIC_USE_MSW=1, then npx expo start --web
- RN: USE_MOCKS=true, then npx expo start
- Tests: run npm test (MSW server and socket.io mocks auto-loaded via jest.setup.js)

Operational controls

- Toggle mocks
  - USE_MOCKS=true|false — enable/disable MockEngine (RN)
  - MOCK_MODE=demo|development|test|storybook — select mock profile
  - EXPO_PUBLIC_USE_MSW=1 — enable MSW worker in web
  - EXPO_PUBLIC_USE_WS_MOCKS=1 — use mock socket at runtime (web/RN)
  - USE_MOCK_WEBSOCKET=true — enable global WS mock (optional)

- Inspect request log
  - mockIntegration.getRequestLog() (RN runtime) or read persisted log from AsyncStorage key @QuizMentor:request_log if persistence enabled

- Switch modes at runtime (RN)
  ```ts
  import { getMockIntegration } from '../src/services/mockIntegration';
  const mocks = getMockIntegration();
  await mocks.switchMode('test');
  ```

Extending MSW

- Add handlers in src/mocks/msw/handlers.ts
- Use http.get/post/put/delete and HttpResponse.json
- Import fixtures from services/_ or mocks/fixtures/_

WebSocket mocking

- Tests: socket.io-client is mocked in jest.setup.js (ack patterns for create_room, join_room, etc.)
- RN runtime: MockEngine can enable WebSocket simulation; use getMockIntegration().createWebSocket(url)

Troubleshooting

- MSW not intercepting (web): ensure EXPO_PUBLIC_USE_MSW=1 and browser devtools shows MSW registration; service worker path must be accessible (mockServiceWorker.js)
- Jest failures around fetch: ensure we removed global.fetch mocks; MSW server starts in jest.setup.js. If MSW not installed, tests still run with live fetch; add handlers or install msw.
- Socket errors in tests: confirm jest.mock('socket.io-client') present and not hoisted incorrectly; clear Jest cache if necessary

Change management

- Update docs/MOCKS_OVERVIEW.md when adding new handlers or modes
- Add tests for handlers in **tests**/api/\*.test.ts to keep contract coverage
