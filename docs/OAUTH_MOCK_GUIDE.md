# Mocking GitHub OAuth (Web) and Email Auth

Status: Active
Last Updated: 2025-08-28

Overview
This guide explains how GitHub OAuth (web) and Email/Password auth are mocked for development and tests.

Approach

- Web (OAuth): We mock the Supabase Auth endpoints via MSW (see src/mocks/msw/handlers.ts). For mock mode, the app uses AuthService.signInWithGitHub(), which in mock mode short-circuits and sets a session internally (USE_MOCKS=true or EXPO_PUBLIC_USE_ALL_MOCKS=1).
- Email/Password: The MSW handler for POST /auth/v1/token with grant_type=password returns a mocked session and user.

Runtime wiring

- AppProfessionalRefined subscribes to AuthService state and maps Auth user/profile to the app’s User type, navigating to Home on success.
- AuthChoiceEpic’s onGitHubLogin triggers AuthService.signInWithGitHub(). In mock mode, this resolves immediately and AuthService updates state.
- Email/password UI is implemented for the 'auth-login' state and calls AuthService.signInWithEmail/signUpWithEmail accordingly.

Enabling

- Web: EXPO_PUBLIC_USE_MSW=1 (or EXPO_PUBLIC_USE_ALL_MOCKS=1) + MSW worker initialized (see MSW_SETUP.md)
- RN: USE_MOCKS=true (or EXPO_PUBLIC_USE_ALL_MOCKS=1) to short-circuit Auth in AuthService and initialize MockEngine

Notes

- detectSessionInUrl is disabled in src/lib/supabase.ts for RN compatibility; mock mode uses internal short-circuit instead of parsing redirect fragments.
- For fully simulating OAuth redirects, add a lightweight /auth/callback route and call supabase.auth.setSession in a web-only code path (not required for current mock approach).
