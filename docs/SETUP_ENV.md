# Environment Setup Guide

Status: Active
Last Updated: 2025-08-28

Overview
This guide helps you configure environment variables and verify your local setup for QuizMentor.

Prerequisites

- Node.js 18+ and npm or yarn
- Expo CLI (npx expo is fine)
- A Supabase project (URL + anon key) if you want live auth/backend

Environment variables
We use Expo public env variables so values are available in the app at runtime. Create a file named .env (or provide via your shell) with:

EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY

Mocking environment toggles (optional)

- USE_MOCKS=true — enable React Native MockEngine and default WS mocks
- EXPO_PUBLIC_USE_MSW=1 — enable MSW on web
- EXPO_PUBLIC_USE_WS_MOCKS=1 — enable WS mocks on web/RN
- EXPO_PUBLIC_USE_ALL_MOCKS=1 — convenience flag (MSW + WS mocks); combine with USE_MOCKS=true for RN fetch interception
- WS_MOCK_SCENARIO=lobbyBasic|matchHappyPath|disconnectRecovery — choose WS scenario
- MOCK_MODE=demo|development|test|storybook — select mock profile behavior
- MSW_LOGGING=true — verbose logs for MSW (web/tests)

Optional

- EXPO_PUBLIC_STORYBOOK=1 to run on-device Storybook instead of the app

Verification steps

1. Check environment
   npm run dev:check
   - Verifies Node, npm/yarn, and required EXPO*PUBLIC*\* values.

2. Install dependencies
   npm install

3. Start the app
   npx expo start

4. Login and try a quiz
   - Use Demo login to enter the app.
   - Start a quiz; you should not see a white screen.

Notes

- If you don’t have Supabase configured, the app will fall back to offline mock data for questions and continue working.
- When you add your Supabase URL and anon key, authentication and API calls will be enabled automatically via the centralized client at src/lib/supabase.ts.
