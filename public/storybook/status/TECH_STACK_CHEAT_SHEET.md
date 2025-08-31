# Tech Stack Cheat Sheet

> Status: Active
> Last Updated: 2025-08-28
> Audience: Interviews, onboarding, quick reference

## Core Platforms

- TypeScript 5.x
- React 19 (web), React Native 0.79 (Expo 53)
- Bundler: Vite 5 (web Storybook), Metro (RN)

## UI & Navigation

- React Native + react-native-web (single codebase to web)
- React DOM (web), RN components (mobile)
- Navigation: React Navigation (stack/tabs) for RN

## State, Data & Networking

- TanStack Query for server-state and caching
- Fetch/axios (swappable http transport)
- Storage: AsyncStorage (RN), localStorage (web)

## Styling & Theming

- nativewind + tailwindcss (utility-first)
- Expo Linear Gradient, platform tokens (radius, fonts)

## Animations & Haptics

- Reanimated / Animated API
- react-native-haptic-feedback (platform haptics)

## Backend & Realtime

- Supabase (Auth, Postgres, Realtime)
- socket.io-client (optional abstraction), WebSocket

## Mocking & Testing

- MSW v2 (web/tests) + MockEngine (RN) unified architecture
- MockWebSocket (deterministic WS scenarios)
- Storybook 8 (web) + on-device RN Storybook
- Storybook Test Runner (Playwright) for play() interactions
- Jest + React Testing Library (unit/integration)
- Chromatic (visual regression)
- Swagger UI (API docs) + API Playground stories

## Monitoring & Analytics

- Sentry (error tracking)
- Basic analytics hooks (ready for GA/Amplitude)

## Build & CI/CD

- GitHub Actions (lint/test/build/Chromatic)
- EAS (Expo Application Services) optional

## Key Patterns & Architecture

- Mock-first development: env toggles select real vs mock transports (HTTP/WS)
- Transport abstractions: HTTP client + Socket factory
- Per-story MSW overrides + global toolbar parameters (no rebuilds)
- Component reuse via react-native-web alias (@ -> project root)
- Test pyramid: unit/integration → story interactions → e2e → visual
- Docs as code: Storybook MDX pages link to repo docs

## Flags (commonly used)

- USE_MOCKS=true — enable RN MockEngine
- EXPO_PUBLIC_USE_MSW=1 — MSW in web
- EXPO_PUBLIC_USE_WS_MOCKS=1 — WS mocks
- EXPO_PUBLIC_USE_ALL_MOCKS=1 — all mocks on web
- MOCK_MODE=demo|development|test|storybook
- WS_MOCK_SCENARIO=lobbyBasic|matchHappyPath|disconnectRecovery|taskBoardLive

## Quick Links

- Storybook Docs pages: Docs/Mocking & Scenarios, Docs/Stories How-To, Docs/Tech Stack + API
- Repo docs: docs/mocks/SERVICE_MOCKING_ARCHITECTURE.md, docs/mocks/WEBSOCKET_MOCKS.md, docs/STORYBOOK_TESTING.md, docs/status/LOCAL_DEV_AND_TESTING_GUIDE.md
