# MSW Setup Guide

Status: Active
Last Updated: 2025-08-28

Overview
MSW (Mock Service Worker) is used to mock HTTP(S) requests on web (service worker) and in tests (Node server). This guide shows how to enable it and extend handlers.

Web (Expo Web)

1. Install MSW (one-time): npm i -D msw
2. Generate service worker (one-time): npx msw init public/ --save
   - Ensure the generated mockServiceWorker.js is served at /mockServiceWorker.js
3. Set env: EXPO_PUBLIC_USE_MSW=1
4. Start: npx expo start --web
5. Confirm MSW: open DevTools → Application → Service Workers → mockServiceWorker.js is active; console shows [MSW] worker ready

Tests (Jest)

- jest.setup.js attempts to start the MSW Node server from src/mocks/msw/server. If msw is not installed, tests continue without it.

Handlers

- Location: src/mocks/msw/handlers.ts
- Included: Supabase REST endpoints for question_categories, questions, remote_config, profiles
- Example:

```ts
import { http, HttpResponse } from 'msw';
export const handlers = [
  http.get(/.*\/rest\/v1\/remote_config.*/, () =>
    HttpResponse.json({ questions_version: '1.0.0' }),
  ),
];
```

Extending

- Add new handlers in handlers.ts; use fixtures from services/_ or mocks/fixtures/_
- For complex logic, extract helpers

Notes

- The worker is started in App.tsx conditionally for web
- For React Native, use the existing MockEngine instead of MSW
- Set MSW_LOGGING=true for verbose request/handler logs in web/tests
- Supabase Auth endpoints can be mocked via handlers; see MOCKS_OVERVIEW.md and OAUTH_MOCK_GUIDE.md
