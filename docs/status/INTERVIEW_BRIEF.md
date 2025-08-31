# Interview Brief: QuizMentor

Status: Current
Last Updated: 2025-08-28
Owner: QuizMentor Engineering
Version: 1.0

Elevator pitch
QuizMentor is a gamified learning app for developers. It delivers adaptive quizzes, tracks progress and streaks, and motivates with achievements and leaderboards. It’s built with React Native + Expo for cross‑platform velocity, Supabase for Auth/DB/Realtime, and a robust mock-first setup so features can be built, tested, and demoed without backend dependency.

Problem → solution

- Problem: Developer learning is often one-size-fits-all and difficult to sustain.
- Solution: A mobile-first experience that adapts quiz difficulty, rewards good habits (streaks, XP, achievements), and provides quick dopamine hits with polished UI and micro-interactions.

Value proposition

- For learners: Clear skill progression, fun gamification, and bite-sized sessions that fit a busy schedule.
- For teams/educators (future): Shared leaderboards, cohorts, and analytics to understand learning outcomes.

Primary user journeys

- New user (first session): Auth choice → home → start first quiz → results → set goals/streak.
- Returning user: Home with streaks/quests → curated quiz → results → progression.
- Multiplayer (demo-ready): Lobby → countdown → synchronized questions → results (mocked deterministically for demos).

Architecture choices and technologies

- UI: React Native 0.79 + Expo 53 for fast cross‑platform dev (iOS/Android/Web via react-native-web for docs).
- Backend: Supabase (Postgres, RLS, Auth, Realtime). Keeps the stack simple with batteries included.
- State/data: TanStack Query where applicable; lightweight local state with hooks/Zustand.
- Testing & docs portal: Web Storybook (Vite) for MDX Docs, interactions, MSW API mocks, Swagger UI. RN on-device Storybook for native UI dev.
- Mocks: MSW (web/tests), custom MockEngine (RN), MockWebSocket (deterministic scenarios). Toggles via env.
- Realtime: WebSocket mock with scenarios (lobbyBasic, matchHappyPath, disconnectRecovery, taskBoardLive). Real server contract defined, mocks mirror payloads.
- CI/testing: Storybook Test Runner (Playwright) for play() interactions; Playwright E2E against Storybook; Chromatic for visual regression.

Key tradeoffs and rationale

- RN + Expo vs native: Optimize for speed and reach; accept some platform-specific tuning later.
- Supabase vs bespoke backend: Faster delivery, managed Auth/DB/RLS; trade flexibility for velocity. RLS secures data at DB layer.
- Mock-first dev: Productivity and reliability in demos/tests; extra investment in mocks/MSW, but it pays off (local dev and CI never blocked by backend).
- Storybook as docs portal: Web-only MDX for rich docs + interactive examples; on-device RN Storybook remains a dev playground (no MDX), but CSF stories are shared.
- Deterministic realtime scenarios: Prefer predictable demos/tests over perfect realism; a real server can be swapped later via the same protocol.

Implementation highlights

- Gamification: XP, streaks, achievements; quiz loops with scoring/combos and polished micro-interactions.
- Adaptive question delivery: Structured to support difficulty tuning and category mastery.
- Mocking architecture: MSW (web) + MockEngine (RN) + WS mock scenarios. Unified via env toggles; Storybook toolbar can switch WS scenarios at runtime.
- Storybook integrations: API Playground (MSW), Swagger UI, WS Scenario toolbar, Live Task Board demo, Test Runner, and Chromatic.

Security and data

- Supabase RLS controls row access. Tokens stored securely on device (platform storage). No 3rd-party analytics by default (privacy-first posture).

Performance and UX

- RN animations tuned for 60fps; reduced layout thrash; careful with list rendering.
- Visual polish: Theming, haptics, micro-interactions to increase engagement and reduce perceived latency.

Testing strategy

- Unit/integration: Jest + Testing Library (where applicable) and MSW (Node) for HTTP.
- Story-level interactions: Storybook Test Runner Playwright play() functions.
- E2E (Storybook): Playwright against stories for flows and MSW triggers.
- Visual: Chromatic on web Storybook (deterministic snapshots).

Developer experience

- Local dev with all mocks: no external dependencies needed for most flows.
- Storybook web portal: single place for UI review, docs, and API mocks.
- CI workflows for Storybook tests and Chromatic.

What’s next

- Wire real Supabase Auth (GitHub OAuth + email) end-to-end.
- Persist analytics events; deepen data viz on results.
- Expand component states and stories; theme/brand polish.
- Native E2E (Detox) for critical flows.

Lessons learned

- Mock-first removed backend blockers; demos/tests are reliable.
- Storybook (web) became a living product doc, not just a component gallery.
- Deterministic realtime scenarios are essential for trustable tests and smooth product demos.

Appendix: environment flags (selected)

- USE_MOCKS=true – RN MockEngine + default WS mocks
- EXPO_PUBLIC_USE_MSW=1 – enable MSW on web
- EXPO_PUBLIC_USE_WS_MOCKS=1 – enable WS mocks
- EXPO_PUBLIC_USE_ALL_MOCKS=1 – convenience (web MSW + WS); combine with USE_MOCKS for RN
- WS_MOCK_SCENARIO=lobbyBasic|matchHappyPath|disconnectRecovery|taskBoardLive
- MSW_LOGGING=true – verbose logging

Technology stack and libraries (comprehensive)

- Languages & platform
  - TypeScript (~5.8), React 19, React Native 0.79, Expo 53, Vite 5 (web Storybook build)
- Core UI/runtime
  - react-native, react-native-web (aliased in web Storybook), react-dom (for web stories)
  - Navigation: @react-navigation/native, @react-navigation/stack, @react-navigation/bottom-tabs, expo-router
  - Safe area/screens/gestures: react-native-safe-area-context, react-native-screens, react-native-gesture-handler
  - Storage: @react-native-async-storage/async-storage, react-native-mmkv (fast key‑value)
  - Networking & state: fetch/axios, @tanstack/react-query (+ devtools)
  - Styling: nativewind + tailwindcss, expo-linear-gradient, expo-blur
  - Animations & haptics: react-native-reanimated, lottie-react-native, expo-haptics, react-native-haptic-feedback
  - Notifications & media: expo-notifications, expo-av, expo-camera, expo-media-library, expo-location
  - Device/system: expo-constants, expo-device, expo-linking, expo-apple-authentication, expo-tracking-transparency
  - UI utilities: react-native-toast-message, react-native-svg, @gorhom/bottom-sheet
- Backend & realtime
  - Supabase: @supabase/supabase-js (Auth/DB/RLS/Realtime)
  - socket.io-client (optional client for future realtime variants)
  - Firebase (available for future integrations)
- Mocking & test infra
  - MSW v2 (web Node/browser), msw-storybook-addon
  - Custom MockEngine (RN fetch interceptor), MockWebSocket (scenario‑driven)
  - Storybook 8 (web): @storybook/react-vite, addon-essentials, addon-interactions, @storybook/blocks
  - Storybook on‑device (RN): @storybook/addon-ondevice-controls, @storybook/addon-ondevice-actions
  - Storybook Test Runner: @storybook/test, @storybook/test-runner (Playwright‑based)
  - Playwright: @playwright/test (+ browsers in CI) for Storybook E2E
  - Jest: jest, jest-expo, @testing-library/react-native, @testing-library/react, @testing-library/jest-native, ts-jest
  - Detox (installed) for native E2E (future)
  - Swagger UI: swagger-ui-react (renders public/swagger.json)
  - Visual regression: Chromatic (GitHub Action), @lhci/cli (available), Chromatic npm CLI
- Monitoring & analytics
  - @sentry/react-native (available)
- Build & tooling
  - babel-preset-expo, @babel/core, babel-loader
  - vite, storybook, http-server, start-server-and-test
  - typescript, @types/\*
- CI/CD & scripts
  - GitHub Actions: visual-regression.yml (Chromatic), storybook-tests.yml (Test Runner), ci.yml (lint/tests), e2e-tests.yml
  - supabase db push (migrations, in scripts)

Design patterns and architecture connections

- Mock‑first development
  - Unified toggles switch between real/mocked services across web/RN/tests: USE_MOCKS, EXPO_PUBLIC_USE_MSW, EXPO_PUBLIC_USE_WS_MOCKS, EXPO_PUBLIC_USE_ALL_MOCKS, WS_MOCK_SCENARIO.
  - MSW for web/tests; MockEngine for RN; shared fixtures/contracts; scenario‑driven WS for deterministic demos/tests.
- Transport abstractions
  - HTTP via fetch/axios wrapped by query hooks; WebSocket via a mock class reading a scenario.
  - In Storybook, globalTypes toolbar sets window.**WS_MOCK_SCENARIO**, consumed by the mockWebSocket.
- Reuse RN components in web Storybook
  - .storybook/main.ts aliases 'react-native$' → 'react-native-web'. MDX Docs + Autodocs render RN components on the web for docs/tests.
- Per‑story isolation & overrides
  - parameters.msw.handlers allow success/error/timeout per story; toolbar globals (theme/platform/wsScenario) provide runtime switches without rebuilds.
- Test layering (pyramid)
  - Unit/integration (Jest + Testing Library + MSW Node), story interactions (play()), Storybook E2E (Playwright), visual (Chromatic).
- Docs as code
  - MDX pages (web Storybook) for narrative guides; repo docs for conceptual/arch; both link to each other (source‑of‑truth sections in docs/status).
- Performance & UX patterns
  - 60fps animations (native driver), skeletons/loaders, haptics, micro‑interactions; tokenized theme preview via Storybook toolbars.
