> Status: Current
> Last Updated: 2025-08-28
> Author: Docs Team
> Version: 1.1

# Storybook Testing and API Mocking

This project uses a combination of Storybook, Chromatic, MSW, and Playwright to enable visual reviews, interaction tests, and API mocking.

What’s included

- Visual regression: Chromatic runs on PRs (requires CHROMATIC_PROJECT_TOKEN secret).
- Interaction tests: Storybook Test Runner (Playwright-based) runs play functions in CI.
- API mocking: MSW integrated into web Storybook via msw-storybook-addon.
- API Playground: Story that lets you call mocked endpoints (includes POST /api/tooltips/generate with triggers TRIGGER_RATE_LIMIT, TRIGGER_ERROR, TRIGGER_CACHED).
- Swagger UI: Story that renders OpenAPI spec from public/swagger.json.
- Live Task Board: Story showing WS task:update feed (taskBoardLive).
- E2E: Playwright spec that navigates to Storybook stories and verifies behavior.

Local commands

- Web Storybook:
  - npm run storybook
  - Open http://localhost:7007
  - Use the toolbar “WS Scenario” to switch WebSocket mocks per-story
- Storybook interaction tests (headless):
  - Fast (with Storybook running): npm run test:stories
  - CI-like (static build): npm run build-storybook && npm run test:stories:ci
- E2E targeting Storybook:
  - npm run e2e:storybook
  - Opens Storybook on port 7007 and runs e2e/storybook-msw.spec.ts
- Chromatic (visual regression):
  - export CHROMATIC_PROJECT_TOKEN=... && npm run chromatic

MSW

- Handlers live at src/mocks/handlers.ts and are wired to Storybook via .storybook/preview.ts.
- Examples:
  - GET /api/lessons, GET /api/quizzes: sample data
  - GET /api/cache: ETag + Cache-Control mock, returns 304 when If-None-Match matches
  - GET /api/ratelimit: returns 429 once threshold is hit, with Retry-After header
  - POST /api/login: mock token

Swagger

- Story: API/Swagger
- Spec: docs/api-specs/openapi/quizmentor-api-v1.yaml
- Served via .storybook/main.ts staticDirs

WebSocket Mock Scenarios

- Toolbar “WS Scenario” controls window.**WS_MOCK_SCENARIO** which MockWebSocket reads first.
- Valid values: lobbyBasic, matchHappyPath, disconnectRecovery, taskBoardLive.

CI

- Visual Regression: .github/workflows/visual-regression.yml (Chromatic)
- Storybook Tests: .github/workflows/storybook-tests.yml (build + run Storybook Test Runner)

Toolbars (web Storybook)

- WS Scenario: lobbyBasic | matchHappyPath | disconnectRecovery | taskBoardLive
- Theme: light | dark
- Platform (cosmetic): web | ios | android
- MSW Profile: default | slower | flaky | chaos — controls global latency/error defaults that MSW handlers read; use the small Defaults chip (top-right in many stories) to see current values
- Per-request “no defaults”: set header `x-msw-no-defaults: 1` to opt out of global latency/error injection for a call; toggle available in API/Playground and NetworkPlayground
- Help link pill: some stories show an “Open related docs” pill that links directly to the relevant repo doc when a `helpDoc` parameter is set

Example stories/pages

- Design/PlatformThemePreview: visibly reflects Theme/Platform tokens (radius/font).
- API/Playground: base and overrides (ErrorLessons, TimeoutLessons, EmptyLessons, ErrorQuizzes, EmptyQuizzes, Cache304, RateLimit429).
- Dev/NetworkPlayground: set global MSW latency/error defaults and visualize a request timeline.
- Flows/QuizFlowDemo: tiny flow with a play() function to validate interactions.
- Docs/Mocking & Scenarios: MDX docs page embedded in Storybook (includes a link to the Live WS → SSE fallback, MSW Profile toolbar, Defaults chip, and no-defaults options).
- Docs/Stories How-To: MDX docs page with conventions/checklist/DoD.
- Docs/Repo Docs Browser: renders Markdown from /docs (e.g., MASTER_DOCUMENTATION_INDEX.md).
- Docs/Quick Index: curated links to most-used repo docs and key stories inside Storybook.

Tips

- To debug interaction tests locally, run storybook and use the Playwright UI:
  - npm run storybook
  - In another terminal: npm run test:e2e:ui (or use `PWDEBUG=1 storybook test --watch`)
- To control WS scenarios per URL in Storybook, use globals query param:
  - http://localhost:7007/?path=/story/testing-counter--default&globals=wsScenario:matchHappyPath
- To preview theme/platform by URL, use:
  - http://localhost:7007/?globals=theme:dark,platform:ios
