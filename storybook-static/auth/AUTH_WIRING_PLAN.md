# Auth Wiring Plan (Supabase OAuth + Email/Password)

Status: Current
Last Updated: 2025-08-29

Scope

- Implement GitHub OAuth (web) and email/password auth using Supabase.
- Provide deterministic mocks for local dev and Storybook.
- Ensure security basics (redirect URIs, PKCE/CSRF, token storage, rotation).

Environment

- Required env vars (web & native build-time)
  - EXPO_PUBLIC_SUPABASE_URL
  - EXPO_PUBLIC_SUPABASE_ANON_KEY
  - EXPO_PUBLIC_GITHUB_CLIENT_ID (web)
- Redirect URIs (web)
  - https://localhost:19006/auth/callback or Storybook-only callback in development
- Secrets
  - Never commit keys; use GitHub Actions secrets for CI (if needed)

Implementation steps

1. Client setup

- lib/supabase.ts already exists; verify it reads EXPO*PUBLIC*\* vars.
- Ensure auth helpers for: signInWithGitHub(), signInWithPassword(email, password), signUpWithPassword(), signOut().

2. Web GitHub OAuth

- Use supabase.auth.signInWithOAuth({ provider: 'github', options: { redirectTo } })
- Handle callback route (/auth/callback) → exchange code → set session
- Store tokens securely (web: memory + refresh via Supabase client; native: SecureStore in RN context if applicable)

3. Email/password

- Sign up → send verification email; sign in → set session
- Handle error codes (invalid_credentials, user_not_found, email_exists)

4. Guards & state

- useAuth hook: user, session, loading, error; subscribe to onAuthStateChange
- Protected screens require user present; else redirect to login

5. Mocks (Storybook + RN)

- Storybook: API/Playground already mocks POST /api/login; add optional story for Auth Smoke (state machine only)
- RN: USE_MOCKS=true short-circuits auth in development

6. Testing

- Unit: authService methods (success, failure)
- Storybook play(): Auth Smoke story toggles → verify rendering of logged-out/authenticating/authenticated
- E2E (web): GitHub OAuth happy path (with test GitHub app or mocked redirect)

7. Security & privacy

- Ensure redirect URI exact match in GitHub app settings
- Avoid exposing secrets in Storybook or client code; use env
- Token storage: prefer short-lived access tokens with refresh; SecureStore for native

Rollout

- Start with web GitHub OAuth; add email/password
- Document callback, env setup in docs/SETUP_ENV.md
- Update SYSTEM_STATUS_CURRENT validation record after smoke test passes
