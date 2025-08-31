# Premium & Monetization Flow

Status: Current
Last Updated: 2025-08-29

This document outlines upgrade paths, paywall interactions, and ad monetization behaviors.

Overview

- Upgrade flow: show paywall, choose plan, process payment, unlock features
- Ads: banner, interstitial, rewarded (optional)

Docs & Stories

- ALL_USER_FLOWS → Premium & Monetization sections
- Storybook: Design/PlatformThemePreview (cosmetic)
- Story (planned): simplified Paywall demo for Storybook

Testing

- Unit: purchases mock (planned)
- Storybook: play() for Paywall demo (planned)
- E2E: upgrade happy path and error cases (planned)

Mocks & Flags

- USE_MOCKS + purchases mock for story/state simulation
- Consider feature flags to gate premium features in development
