# API Routes Overview

Last Updated: August 27, 2025

## Current Servers in Repo

- Note: The mobile app uses Supabase directly for most features under RLS. In development, MSW/MockEngine provide mocks. The Node servers below are optional and can be introduced as needed.

- api/ (Node Express skeleton): `api/src/index.ts`
- services/api-gateway (Express proxy): `services/api-gateway/index.js`

## Implemented Endpoints

### services/api-gateway (proxy)

- GET `/health` → gateway health
- GET `/health/services` → downstream health summaries
- Proxy routes:
  - `/api/sessions/*` → learning-orchestrator
  - `/api/learning-paths/*` → learning-orchestrator
  - `/api/adapt/*` → adaptive-engine
  - `/api/recommendations/*` → adaptive-engine
  - `/api/analytics/*` → adaptive-engine
  - `/api/validate/*` → bloom-validator
  - `/api/classify/*` → bloom-validator

- Composite:
  - POST `/api/quiz/start` → orchestrates recommendations + sessions + validation

### api/src (Node API skeleton)

- GET `/health` (in file) → checks Redis and DB; responds with status
- POST `/api/generate-question` → A/B model selection with PostHog; calls OpenAIService
- Intended mounts (not present):
  - `app.use('/api/quiz', quizRoutes)`
  - `app.use('/api/users', userRoutes)`
  - `app.use('/api/analytics', analyticsRoutes)`

Note: The files for `routes/quiz.routes.ts`, `routes/user.routes.ts`, `routes/analytics.routes.ts` are missing.

## Missing Routes To Implement (MVP)

1. Quiz

- POST `/api/quiz/session` → create quiz session (category, difficulty)
- GET `/api/quiz/questions` → paginated fetch (categoryId, difficulty)
- POST `/api/quiz/answer` → record answer, return correctness, updated streak/xp
- GET `/api/quiz/leaderboard` → top users (global/weekly)

2. Users/Auth (Supabase)

- GET `/api/users/me` → profile summary
- POST `/api/users/export` → GDPR data export task
- DELETE `/api/users/me` → account deletion

3. Analytics

- POST `/api/analytics/event` → client event ingestion (minimal schema)

## Contract Notes

- Auth: initial pass can use Supabase JWT from client; verify via Supabase Admin API or RLS policies
- Rate limiting: already applied at `/api/*` in `api/src/index.ts`
- Caching: `CacheService` (Redis) is referenced; implement per-endpoint as needed

## Next Steps

- Create `api/src/routes/{quiz,user,analytics}.routes.ts`
- Stub handlers returning 200 with static data; wire to services incrementally
- Add OpenAPI description (YAML) and publish to docs site
