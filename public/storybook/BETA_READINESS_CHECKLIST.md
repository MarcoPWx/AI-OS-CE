# Beta Readiness Checklist

> Status: Draft → Complete once items are checked  
> Last Updated: 2025-08-30

This checklist ensures the ingestion → quality → curation → DB delivery path is ready for beta.

See Storybook: Docs/Beta Checklist for an interactive version.

## Data ingestion & quality

- [ ] Import CLI packs: `node scripts/cli-import.js`
- [ ] Heuristic quality pass: `node scripts/quality-evaluate.js`
- [ ] Optional AI review (OpenAI-compatible): set AI*REVIEW*\* env and re-run
- [ ] Curate for editors: `node scripts/curate-quality.js` (produces curated.json/.csv)
- [ ] Editorial sign-off threshold (e.g., aggregate ≥ 0.6 or AI-reviewed OK)

## Database & API

- [ ] Generate seed: `node scripts/generate-sql-from-import.js`
- [ ] Apply seed in Supabase (003_question_delivery schema)
- [ ] Set API env to DB mode (server):
  ```
  SUPABASE_URL=...
  SUPABASE_SERVICE_ROLE_KEY=...
  API_USE_SUPABASE=true
  ```
- [ ] Smoke test DB API route (local/staging):
  - `/api/quiz/questions?limit=5&random=true`
  - Filter by slug and UUID categoryId; filter by difficulty

## App & Storybook

- [ ] App fetches from `/api/quiz/questions` in dev mode; renders imported data
- [ ] Storybook docs:
  - Docs/Question Ingestion & AI Reasoning
  - Docs/AI Quality Pipeline (examples + AI env)
  - Docs/DB-Backed Questions (Supabase)
  - Quality Curation Dashboard (interactive)

## CI/CD

- [ ] Lint + TypeScript check (ci.yml)
- [ ] Unit tests + coverage (ci.yml)
- [ ] Integration tests (local DB container)
- [ ] E2E Playwright (web + mobile browser) green
- [ ] Storybook build + interaction tests green
- [ ] Visual regression (Chromatic) baselines updated
- [ ] Security workflows passing (audit, OWASP checks)
- [ ] Load test workflow (optional on demand) within thresholds

## Mobile smoke

- [ ] Expo dev build (iOS/Android) runs the quiz flow
- [ ] Network/offline spot checks

## Go/No-Go

- [ ] Staging seeded with curated dataset
- [ ] API_USE_SUPABASE=true on staging
- [ ] Docs/Runbooks current
- [ ] Known issues triaged/accepted for beta

---

Notes:

- You can use the Storybook “Journey Launcher” to quickly walk key flows.
- If DB is not seeded yet, JSON fallback still works for local development.
