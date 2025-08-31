# Service Mocking Architecture

> Status: Complete
> Last Updated: 2025-08-28
> Author: Docs Team
> Version: 1.0

## Overview

Our unified mocking architecture supports web, React Native, and test environments while keeping contracts consistent. It enables fast local development, deterministic tests, and reliable demos.

## Components

- MSW (Mock Service Worker)
  - Web: service worker intercepts fetch (Storybook uses msw-storybook-addon)
  - Tests: Node server intercepts fetch
- MockEngine (React Native)
  - Intercepts global fetch in RN and simulates responses per fixtures/generators
  - Can install a global WebSocket override
- WebSocket mocks
  - Global WebSocket override (RN)
  - socket.io MockSocket (src/lib/socket.ts) for acks
- Fixtures & scenarios
  - docs/mocks/manifests/MOCK_MANIFEST.yaml (source of truth)
  - src/mocks/fixtures/\* (users, questions, leaderboard, etc.)

## Environment flags

- USE_MOCKS=true — enable RN MockEngine (and default WS mocks)
- EXPO_PUBLIC_USE_MSW=1 — enable MSW worker on web
- EXPO_PUBLIC_USE_WS_MOCKS=1 — enable WS mocks on web/RN
- EXPO_PUBLIC_USE_ALL_MOCKS=1 — convenience flag (web MSW + WS mocks)
- MOCK_MODE=demo|development|test|storybook — mock profiles
- WS_MOCK_SCENARIO=lobbyBasic|matchHappyPath|disconnectRecovery|taskBoardLive — deterministic WS flows
- MSW_LOGGING=true — verbose MSW logging (web/tests)

## Directory layout (relevant)

- src/mocks/msw/
  - handlers.ts, browser.ts, server.ts
- src/services/
  - mockEngine.ts, mockIntegration.ts, mockWebSocket.ts
  - auth.ts (mock-aware behaviors), other services
- src/lib/socket.ts (socket.io abstraction with MockSocket)
- docs/mocks/\* (this document, WEBSOCKET_MOCKS, manifest)

## Choosing real vs mock

- Services should depend on a transport abstraction (http client, socket factory) and select mock vs real by env flags
- For RN, MockIntegration initializes MockEngine when enabled
- For web/tests, MSW should be initialized where appropriate

## Patterns

- Keep contracts in one place (e.g., types, payload shapes)
- Reuse fixtures across MSW and MockEngine
- Add scenario switches for real-time flows to make demos/tests consistent

## Related docs

- docs/MOCKS_OVERVIEW.md
- docs/MSW_SETUP.md
- docs/mocks/WEBSOCKET_MOCKS.md
- docs/WEBSOCKET_API.md
