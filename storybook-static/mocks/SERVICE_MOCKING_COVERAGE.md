# Service Mocking Coverage (MSW)

Status: Current
Last Updated: 2025-08-29

This document summarizes which endpoints are mocked in web Storybook via MSW. For React Native, the MockEngine intercepts global fetch when USE_MOCKS=true.

HTTP endpoints (web, MSW)

- GET /health — returns { ok, ts }
- GET /api/lessons — sample lessons (progress data)
- GET /api/quizzes — sample quizzes (category, difficulty)
- POST /api/login — returns mock token and user
- GET /api/cache — ETag + Cache-Control; returns 304 when If-None-Match matches
- GET /api/ratelimit — per-client (x-client-id) rate limiting with Retry-After

Global defaults

- Latency and error injection can be set via the “MSW Profile” toolbar or by POSTing to /**msw**/defaults
- Defaults can be bypassed per-request by sending header `x-msw-no-defaults: 1`

Per-story overrides

- Stories can override handlers via `parameters.msw.handlers` (see API/Playground variants: ErrorLessons, TimeoutLessons, EmptyLessons, etc.)

WebSocket mocks

- Controlled via the “WS Scenario” toolbar (lobbyBasic, matchHappyPath, disconnectRecovery, taskBoardLive)

Notes

- The API spec in Storybook (API/Swagger) is rendered from docs/api-specs/openapi/quizmentor-api-v1.yaml for exploration and contracts.
- Keep this list in sync with src/mocks/handlers.ts when adding/removing endpoints.
