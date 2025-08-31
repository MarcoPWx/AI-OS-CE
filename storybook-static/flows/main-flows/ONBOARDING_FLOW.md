# Onboarding Flow

Status: Current
Last Updated: 2025-08-29

This document captures the first-time user onboarding path (post-install or post-logout), including environment toggles, mocks, and test coverage.

Overview

- Entry points: First app open, post-registration, post-logout
- Goals: collect minimal preferences, introduce core value, land on Home ready to start a quiz

Docs & Stories

- ALL_USER_FLOWS → Onboarding sections
- Storybook: Flows/Docs → Home (first-time flavor), Design/PlatformThemePreview

Testing

- Unit: onboarding reducer (planned)
- Storybook: play() interactions to confirm “Start learning” CTA (planned)
- E2E: onboarding smoke path (planned)

Mocks & Flags

- USE_MOCKS / EXPO_PUBLIC_USE_ALL_MOCKS enable deterministic data
- WS toolbar may be ignored for onboarding; Theme/Platform toolbar can be used for visual QA
