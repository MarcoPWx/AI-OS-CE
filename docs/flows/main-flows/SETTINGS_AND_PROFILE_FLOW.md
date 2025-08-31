# Settings & Profile Flow

Status: Current
Last Updated: 2025-08-29

This document details the profile management and settings configuration flows.

Overview

- Manage profile (avatar, username, bio, visibility)
- Configure settings (language, theme, notifications, difficulty, categories)

Docs & Stories

- ALL_USER_FLOWS → Settings & Profile sections
- Storybook: planned stories for specific components; Flows/Docs page covers end-to-end context

Testing

- Unit: reducers/services for settings persistence (planned)
- Storybook: play() per component (planned)
- E2E: profile edit & save; settings toggles (planned)

Mocks & Flags

- MSW for profile GET/PUT (planned)
- USE_MOCKS / EXPO_PUBLIC_USE_MSW for deterministic flows
