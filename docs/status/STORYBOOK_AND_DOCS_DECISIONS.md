# Storybook and Docs Decisions (CSF vs MDX, Web vs RN)

Status: Current
Last Updated: 2025-08-28
Owner: QuizMentor Engineering
Version: 1.0

Purpose
Record the decisions and conventions for how we document components and flows using Storybook (web and RN), CSF stories, MDX docs, MSW, and testing.

Summary of decisions

- Use both CSF and MDX
  - CSF (.stories.tsx) is the source of truth for executable examples, interactions (play functions), Chromatic visual tests, and RN on-device stories.
  - MDX (.mdx) is for narrative documentation that stitches multiple CSF stories together (guides, overviews, how-to). MDX is web-only.
- Web Storybook is the docs portal
  - Web Storybook renders MDX (Docs tab/Autodocs), supports MSW, Swagger UI, toolbars, interactions, and Chromatic.
  - RN on-device Storybook is a developer playground (no MDX). Include short CSF descriptions so the same stories are informative in web Docs.
- Where files live
  - CSF: co-locate with components (src/components/_/_.stories.tsx); flows under src/stories/.
  - MDX: stories/\*.mdx for narrative pages. Reference CSF stories via <Canvas>.
- Platform strategy
  - Prefer shared stories rendered via react-native-web alias in web Storybook.
  - For native-only components (camera/sensors), either disable the story in web Chromatic/Docs or render a placeholder with a link to RN on-device instructions.
- Toolbar globals
  - WS Scenario toolbar: implemented (lobbyBasic, matchHappyPath, disconnectRecovery, taskBoardLive).
  - Theme toolbar: implemented (light/dark) with a decorator applying tokens.
  - Platform toolbar (cosmetic): implemented; controls tokens/styles to preview iOS/Android flavors without platform APIs.
- Testing strategy
  - Interaction tests: write at least one play() per key component/flow.
  - Visual regression: Chromatic on web stories; mark native-only or animated/flaky stories with chromatic.disable when needed.
  - E2E (Storybook): keep a small suite to validate flows, API Playground triggers, and Swagger.
- MSW usage
  - Base handlers in src/mocks/handlers.ts.
  - Storybook-only handlers in src/mocks/handlers.storybook.ts for demo endpoints (e.g., /api/tooltips/generate with TRIGGER\_\* behaviors).
  - Per-story MSW overrides via parameters.msw for targeted success/500/timeout states.
- Definition of Done (DoD) for a story
  - States covered: default, loading, empty/disabled, error, success.
  - Args wired to Controls with sensible defaults.
  - One play() for primary user action.
  - Optional per-story MSW overrides for error/timeout.
  - parameters.docs.description filled with usage/context.
  - Deterministic output (animations settled) for Chromatic.
  - Renders in RN on-device (or explicitly documented as web-only and disabled in Chromatic).

What we have now

- Web Storybook (Vite) with:
  - MSW (base + Storybook-only handlers), API Playground, Swagger UI.
  - WS Scenario toolbar; mockWebSocket reads window.**WS_MOCK_SCENARIO**.
  - Storybook Test Runner (Playwright) + workflow.
  - Chromatic workflow (add CHROMATIC_PROJECT_TOKEN secret).
  - Live/TaskBoard demo (taskBoardLive scenario).
- RN on-device Storybook:
  - Core sample stories and co-located component stories.
  - Flow stories for Auth/Home/Quiz/Results (CSF).

What’s next (approved)

- Add theme toolbar + decorator (light/dark) in web Storybook.
- Add platform toolbar (cosmetic tokens) if helpful to product/design.
- Create MDX docs pages:
  - Mocking & Scenarios (links to API Playground, Live/TaskBoard, repo docs).
  - How to add/maintain stories (checklist + DoD).
- Expand LessonCard coverage (loading, locked, premium, error) and add a play().
- Add per-story MSW overrides to demo error states for critical UI (e.g., 500/timeout).
- Tag native-only stories as chromatic.disable when snapshots are noisy.

Conventions and naming

- Titles: Components/Button, Components/LessonCard, Layout/Header, Screens/Auth, Flows/Quiz.
- Story names: Default, Loading, Error, Empty, Disabled, Success (add domain names when needed).
- File paths:
  - Component stories: src/components/<Name>/<Name>.stories.tsx
  - Flow stories: src/stories/Flows/<Flow>.stories.tsx
  - MDX docs: stories/<Topic>.mdx

Cross-linking guidance

- Repo docs (docs/\*.md) contain conceptual guides and status.
- Web Storybook (MDX + Docs) contains living, interactive documentation; link to it from repo docs when appropriate.
- Avoid duplicating long-form content between repo docs and MDX; put conceptual material in repo docs and reference CSF stories from MDX pages for live examples.

References

- docs/STORYBOOK_TESTING.md
- docs/status/LOCAL_DEV_AND_TESTING_GUIDE.md
- docs/mocks/SERVICE_MOCKING_ARCHITECTURE.md
- docs/mocks/WEBSOCKET_MOCKS.md
- runbooks/DEVELOPER_MOCK_RUNBOOK.md
