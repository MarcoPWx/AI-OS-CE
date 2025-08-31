# WebSocket Mocks

> Status: Complete
> Last Updated: 2025-08-28
> Author: Docs Team
> Version: 1.0

## Overview

We provide deterministic WebSocket mock behavior for local development and tests. The mock is selectable at runtime via environment flags and mirrors the real event shapes.

## Enabling WS mocks

- Global convenience (web/RN): EXPO_PUBLIC_USE_ALL_MOCKS=1
- Explicit WS-only: EXPO_PUBLIC_USE_WS_MOCKS=1
- RN MockEngine also enables a WebSocket override when running in demo/test/storybook modes.

RN initialization (already wired):

- AppProfessionalRefined: initializes MockIntegration when USE_MOCKS=true or EXPO_PUBLIC_USE_ALL_MOCKS=1
- MockIntegration -> MockEngine.enableWebSocketMocking() installs a global WebSocket mock

Alternative socket abstraction (socket.io):

- src/lib/socket.ts chooses a MockSocket when EXPO_PUBLIC_USE_WS_MOCKS=1 or USE_MOCKS=true

## Scenarios

- WS_MOCK_SCENARIO=lobbyBasic (default)
  - Baseline behavior with 3s countdown, 30s questions, and occasional random joins
- WS_MOCK_SCENARIO=matchHappyPath
  - Auto-ready players, quick countdown (1s), short questions (5s), rapid flow for demos
- WS_MOCK_SCENARIO=disconnectRecovery
  - Simulates a brief disconnect/reconnect once per session
- WS_MOCK_SCENARIO=taskBoardLive
  - Emits periodic task:update events for a live task feed demo

## Timings

- Default: countdown=3s, question=30s, between=3s
- matchHappyPath: countdown=1s, question=5s, between=0.5s

## How it works

- src/services/mockWebSocket.ts provides a MockWebSocket class (EventEmitter-based) and enables a global WebSocket override when mocks are active.
- src/lib/socket.ts provides a MockSocket for socket.io-style usage with simple ack responses.
- MockEngine (src/services/mockEngine.ts) turns on the global WebSocket mock in specific mock modes.

## Usage

- Web:
  - EXPO_PUBLIC_USE_MSW=1 EXPO_PUBLIC_USE_WS_MOCKS=1 WS_MOCK_SCENARIO=matchHappyPath npx expo start --web
- React Native:
  - USE_MOCKS=true EXPO_PUBLIC_USE_WS_MOCKS=1 WS_MOCK_SCENARIO=disconnectRecovery npx expo start
- Storybook (web):
  - Use the WS Scenario toolbar (lobbyBasic, matchHappyPath, disconnectRecovery, taskBoardLive)
  - Or add &globals=wsScenario:matchHappyPath to the story URL
- Tests (Jest):
  - Mocks are automatically enabled; scenario can be set via WS_MOCK_SCENARIO

## Extending

- Add new scenario logic in src/services/mockWebSocket.ts (e.g., timings, event sequences)
- For socket.io-style mocks, extend MockSocket in src/lib/socket.ts to acknowledge additional events

## Troubleshooting

- Not receiving events: confirm USE_MOCKS=true or EXPO_PUBLIC_USE_WS_MOCKS=1
- Incorrect scenario: verify WS_MOCK_SCENARIO is set (e.g., matchHappyPath)
- Conflicts with real server: ensure EXPO_PUBLIC_USE_ALL_MOCKS=1 is not set in production builds

## Related

- docs/WEBSOCKET_API.md
- docs/MOCKS_OVERVIEW.md
- docs/ALL_MOCKS.md
