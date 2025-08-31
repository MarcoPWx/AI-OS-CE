# Auth Wiring Plan (Mock-first)

This document explains how authentication is wired in QuizMentor, how to run in mock mode with MSW, and how to integrate with real providers later.

## Summary

- Auth service interface lives in `src/services/auth/index.ts` with a mock-first implementation backed by MSW HTTP endpoints under `/api/auth/*`.
- React app state integrates via `src/contexts/AuthContext.tsx`.
- MSW handlers are registered both at app level and Storybook for consistent mocks.

## Files

- Service and types: `src/services/auth/index.ts`
- React context: `src/contexts/AuthContext.tsx`
- App MSW handlers: `src/mocks/msw/handlers.ts` (imports and spreads `authHandlers`)
- Storybook handlers: `src/mocks/handlers.ts` (now includes `authHandlers`) and `.storybook/preview.ts` (msw addon)
- Mock endpoints: `src/mocks/handlers/auth.ts`
- Screens using auth:
  - `src/screens/LoginScreen.tsx` (uses AuthContext)
  - `src/screens/HomeScreenEpic.tsx` (consumes AuthContext when `user` prop not supplied)
  - `src/screens/ProfileScreenNew.tsx` and `src/screens/ProfileScreenGameified.tsx` (use AuthContext)

## Enabling Mock Auth

Set one of these env vars to enable mock auth service:

- `NX_USE_MOCK_AUTH=true`
- or `REACT_APP_USE_MOCK_AUTH=true`
- Expo web dev can also set `EXPO_PUBLIC_USE_ALL_MOCKS=1` to initialize mocks.

MSW in browser (web):

- The app loads the browser worker when `EXPO_PUBLIC_USE_MSW=1` or `EXPO_PUBLIC_USE_ALL_MOCKS=1`.
- See `App.tsx` dynamic import: `src/mocks/msw/browser`.

Storybook:

- Storybook automatically initializes MSW via `msw-storybook-addon` in `.storybook/preview.ts`.
- Global defaults (latency/error) and per-story overrides are supported.

## Auth Flows (Mock)

Endpoints provided by MSW:

- `GET /api/auth/github` and `POST /api/auth/github/callback`
- `POST /api/auth/login`, `POST /api/auth/signup`
- `GET /api/auth/session`, `POST /api/auth/refresh`, `POST /api/auth/logout`
- `PATCH /api/auth/user`
- `POST /api/auth/reset-password`, `POST /api/auth/reset-password/confirm`

AuthContext methods:

- `loginWithGitHub(redirectUrl?)`
- `loginWithEmail(email, password)`
- `signUp(email, password, name?)`
- `logout()`
- `updateUser(updates)`
- `requestPasswordReset(email)` / `confirmPasswordReset(token, password)`
- `refreshSession()`

Session persistence:

- Stored in `localStorage` under `quizmentor_auth_session`.
- Auto-refresh 1 minute before expiry.

## Usage Examples

Wrap your app at the top level:

```tsx path=null start=null
import { AuthProvider } from './src/contexts/AuthContext';

export default function AppRoot() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
```

Login with email:

```tsx path=null start=null
const { signIn, loading, error } = useAuth();
await signIn(email, password);
```

Login with GitHub (mock):

```tsx path=null start=null
const { signInWithGitHub } = useAuth();
await signInWithGitHub();
```

Access current user:

```tsx path=null start=null
const { user, session } = useAuth();
```

## Moving to Real Provider (Supabase)

- `createAuthService` returns either the mock or real implementation. The `realImpl` in `src/services/auth/index.ts` is a placeholder.
- Implement each method against Supabase auth:
  - `loginWithGitHub`: start OAuth and handle callback exchange
  - `loginWithEmail`/`signUp`: Supabase email/password endpoints
  - `refresh`, `logout`, `updateUser`, password reset
- Reuse the same AuthContext; the UI won’t need to change.

## Testing

- Storybook Test Runner: can exercise UI states with MSW auth handlers.
- Playwright E2E (optional): test login/signup/session within Storybook or web build.
- Unit tests for `createAuthService` mock implementation are straightforward (pure fetch calls to MSW endpoints).

## Troubleshooting

- If requests aren’t mocked in Storybook, ensure `handlers` include `authHandlers` in `src/mocks/handlers.ts` and `.storybook/preview.ts` uses msw addon.
- If session doesn’t persist, check localStorage is available (web) and that `expires_at` is in the future.
- To disable default MSW latency/error in Storybook, set `parameters.mswNoDefaults` on a story or toggle toolbar profile to `reset`.
