# Error Recovery Flow

Status: Current
Last Updated: 2025-08-29

This document collects network and crash recovery paths.

Overview

- Network error: offline/timeout/retry patterns; fallbacks to cached data
- Crash recovery: save state, restart, restore session or fresh start

Docs & Stories

- ALL_USER_FLOWS → Error Recovery sections
- Storybook: Dev/NetworkPlayground; API/Playground variants (Error/Timeout/429/304)

Testing

- Storybook: play() on error variants
- E2E: offline mode/timeout + retry (planned)

Mocks & Flags

- MSW defaults and no-defaults header (x-msw-no-defaults)
- WS Scenario toolbar can simulate disconnects (disconnectRecovery)
