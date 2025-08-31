# QuizMentor.ai

Developer-learning app with a guided tour overlay, Device Duo preview, and Storybook docs — ready to demo on the web and ship to mobile.

At a glance

- Tour: /tour (or /?tour=1) — explainers + overlay
- Duo: /?duo=1 — iOS and Android side-by-side
- Storybook: /storybook — component/system docs
- Vercel: single build hosting both app and Storybook

Quick start

- Install: npm ci
- Web (recommended): npm run web
- Native: npm start, then iOS/Android from Expo

Tour & demo mode

- Start: /tour or /?tour=1
- Enforce (no close): EXPO_PUBLIC_TOUR_ENFORCE=1 (or NEXT_PUBLIC_TOUR_ENFORCE=1)
- Auto-start every load: EXPO_PUBLIC_TOUR_DEFAULT=1 (or NEXT_PUBLIC_TOUR_AUTO=1)
- Beta banner (web): appears when tour is active; links to Start Tour, Device Duo, Storybook

Device Duo (web)

- Two frames (iOS + Android styling): /?duo=1
- Show Storybook stories in frames: /?duo=1&duoMode=sb&duoStory=<story-id>

Storybook

- Dev: npm run storybook (http://localhost:7007)
- Static build: npm run build-storybook:dist (dist/storybook)
- Served on Vercel at /storybook

Vercel deployment

- vercel.json rewrites:
  - Keep /storybook/* as-is
  - Rewrite all other routes to /index.html (SPA routing)
- Build Command: npm run vercel-build
- Output Directory: dist
- Env (Production):
  - EXPO_PUBLIC_TOUR_DEFAULT=1
  - Optional: EXPO_PUBLIC_TOUR_ENFORCE=1
  - Optional: EXPO_PUBLIC_USE_MSW=1
- Env (Preview):
  - leave EXPO_PUBLIC_TOUR_DEFAULT unset; still start via /?tour=1

Testing

- Unit: npm run test:unit
- E2E (Playwright): npm run test:e2e
- Storybook E2E: npm run e2e:storybook

Docs (full content)

- Project overview: docs/PROJECT_OVERVIEW.md
- Architecture: docs/SYSTEM_ARCHITECTURE.md
- Deployment guide: docs/DEPLOYMENT_GUIDE.md
- Storybook + MSW testing: docs/STORYBOOK_TESTING.md
- Mocking overview: docs/MOCKS_OVERVIEW.md
- MSW setup: docs/MSW_SETUP.md
- Supabase setup: docs/SUPABASE_SETUP_GUIDE.md
- Tech stack cheat sheet: docs/status/TECH_STACK_CHEAT_SHEET.md
- Local dev & testing: docs/status/LOCAL_DEV_AND_TESTING_GUIDE.md
- Testing strategy: docs/TESTING_STRATEGY.md
- WebSocket API/mocks: docs/WEBSOCKET_API.md and docs/mocks/WEBSOCKET_MOCKS.md
- Admin dashboard: docs/ADMIN_DASHBOARD.md
- All docs index: docs/ (browse for many more)

Repository structure (target)

- App.tsx — entry (web routes: /tour, /?duo=1)
- AppWithAuth.tsx — auth provider + banners
- AppProfessionalRefined.tsx — minimal shell (kept simple)
- src/components/* — BetaBanner, TourLanding, DeviceDuoOverlay
- src/screens/* — app screens
- docs/* — documentation (deep dives live here)
- supabase/* — migrations and seeds

Notes

- Storybook build artifacts are not committed; CI/Vercel build into dist/storybook.
- Legacy or heavy artifacts (storybook-static, harvest_output, large media) have been removed and are now ignored.

