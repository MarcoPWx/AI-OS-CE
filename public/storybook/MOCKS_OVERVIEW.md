# Mocking Overview

Status: Active
Last Updated: 2025-08-28

Summary
This document explains the unified mocking strategy for QuizMentor across web, React Native, and tests. We use:

- MSW (Mock Service Worker) for HTTP API mocking on web and in tests
- A custom MockEngine + WebSocket simulation for React Native runtime
- A Jest mock for socket.io-client for test environments

Modes

- Web (dev): MSW worker starts when EXPO_PUBLIC_USE_MSW=1
- React Native (dev): MockEngine can be auto-initialized via USE_MOCKS=true or by calling getMockIntegration().initialize()
- Tests (Jest): MSW Node server starts in jest.setup.js; socket.io-client is mocked

Environment flags

- EXPO_PUBLIC_USE_MSW=1 — enable MSW worker on web
- USE_MOCKS=true — enable MockEngine auto-start (RN + tests)
- MOCK_MODE=demo|development|test|storybook — choose mock mode for MockEngine
- EXPO_PUBLIC_USE_WS_MOCKS=1 — use mock socket at runtime (web/RN)
- USE_MOCK_WEBSOCKET=true — force global WebSocket mocking (optional)
- WS_MOCK_SCENARIO=lobbyBasic|matchHappyPath|disconnectRecovery — deterministic WS flows
- MSW_LOGGING=true — verbose MSW logging (web/tests)

File map

- src/mocks/msw/handlers.ts — MSW handlers (Supabase REST endpoints: question_categories, questions, profiles, remote_config)
- src/mocks/msw/browser.ts — MSW worker starter for web
- src/mocks/msw/server.ts — MSW Node server for Jest
- src/services/mockEngine.ts — Custom fetch interceptor and WebSocket simulator for RN
- src/services/mockIntegration.ts — Orchestrates MockEngine initialize/enable/disable
- src/services/mockWebSocket.ts — WebSocket simulation via EventEmitter
- jest.setup.js — Starts MSW server, mocks socket.io-client

Usage (Web)

1. Set EXPO_PUBLIC_USE_MSW=1 in your environment
2. Start app: npx expo start --web
3. MSW will intercept Supabase REST requests and serve fixtures

Usage (React Native)

1. Set USE_MOCKS=true (or call getMockIntegration().initialize())
2. Start app: npx expo start
3. MockEngine intercepts fetch and provides fixture data; WebSocket is simulated if mode allows

Usage (Tests)

- jest.setup.js boots the MSW server and mocks socket.io-client

Extending handlers

- Add new REST endpoints to src/mocks/msw/handlers.ts using http.get/post
- Use fixtures under services/\* or create new fixtures under mocks/fixtures

Caveats

- Supabase Auth endpoints are not fully mocked; RN AuthService may short-circuit in mock mode
- socket.io protocol is mocked only in tests; runtime uses MockWebSocket if MockEngine mode enables it
