# Testing Guide (Snapshot)

Status: Current
Last Updated: 2025-08-28
Owner: QuizMentor Engineering

Quick commands and links to validate the full local setup with mocks.

App (web) with all mocks

- One-time: npx msw init public/ --save
- Run: WS_MOCK_SCENARIO=matchHappyPath npm run start:all-mocks:web
- Open the Expo web URL (typically http://localhost:19006)

Storybook (web) with MSW and WS toolbar

- Start: npm run storybook
- Open: http://localhost:7007
- API Playground: http://localhost:7007/?path=/story/api-playground--default
- Swagger UI: http://localhost:7007/?path=/story/api-swagger--default
- Live TaskBoard: http://localhost:7007/?path=/story/live-taskboard--default

Storybook interaction tests

- Fast (with Storybook running): npm run test:stories
- CI-like: npm run build-storybook && npm run test:stories:ci

Playwright E2E targeting Storybook

- Run: npm run e2e:storybook
- Headed: npx playwright test e2e/storybook-msw.spec.ts --headed
- Report: npx playwright show-report

Visual regression

- Local: export CHROMATIC_PROJECT_TOKEN={{CHROMATIC_PROJECT_TOKEN}} && npm run chromatic
- CI: .github/workflows/visual-regression.yml

Unit tests (MSW Node)

- Cache ETag: npm test -- src/**tests**/api/cache.spec.ts
- Rate limit: npm test -- src/**tests**/api/rate-limit.spec.ts

WebSocket scenarios

- Toolbar in Storybook (top): lobbyBasic | matchHappyPath | disconnectRecovery | taskBoardLive
- URL param: &globals=wsScenario:matchHappyPath
- App web: WS_MOCK_SCENARIO=taskBoardLive npm run start:all-mocks:web

Troubleshooting

- MSW: enable MSW_LOGGING=true and check browser devtools console
- WS: ensure EXPO_PUBLIC_USE_WS_MOCKS=1 or use Storybook toolbar/URL
- Ports: Storybook runs on 7007; Expo web runs on a dynamic port printed by the dev server
