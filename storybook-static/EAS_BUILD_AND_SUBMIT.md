# EAS Build and Submit Guide

This guide walks you through building and submitting QuizMentor to Android and iOS using Expo Application Services (EAS).

Prerequisites

- Expo account and EAS CLI installed: npm i -g eas-cli
- Logged in to EAS: eas login
- Apple Developer account (for iOS)
- Google Play Console access (for Android)
- App identifiers selected: com.quizmentor.app
- Canonical deep link domain: quizmentor.app

Project setup

1. Confirm config (already done)

- app.config.js uses quizmentor.app for associated domains and Android intent filters
- app.json aligned for parity (Expo prioritizes app.config.js)
- Splash/icon/adaptive-icon assets exist

2. Link EAS project

- eas init
- Copy the Project ID and set it in your env:
  export EXPO_PUBLIC_EAS_PROJECT_ID=<PROJECT_ID>
- Optionally, set it in your shell profile for persistence.

3. Set secrets (never commit secrets)

- Supabase (if used at runtime)
  eas secret:create --scope=project --name=EXPO_PUBLIC_SUPABASE_URL --value={{SUPABASE_URL}}
  eas secret:create --scope=project --name=EXPO_PUBLIC_SUPABASE_ANON_KEY --value={{SUPABASE_ANON_KEY}}
- iOS and Android store credentials will be configured via interactive prompts or EAS dashboard.

Build preview artifacts

- Android (APK preview):
  npm run eas:build:android:preview
- iOS (simulator build):
  npm run eas:build:ios:preview

Distribute preview builds

- EAS will provide a download link on completion
- Share with internal testers for quick smoke testing

Production builds

- Increment versions:
  - iOS: bump ios.buildNumber
  - Android: bump android.versionCode
- Build:
  npm run eas:build:android:prod
  npm run eas:build:ios:prod

Submit to stores

- Android (internal track by default):
  npm run eas:submit:android
- iOS (TestFlight):
  npm run eas:submit:ios

Store checklist snippets

- Privacy policy URL and support URL ready
- App screenshots for required devices
- Data safety form (Android) and ATT (iOS) answers prepared
- Category and age rating
- Release notes

Troubleshooting

- google-services not found: Remove googleServicesFile references (done) or add the files
- Deep links not working: Ensure domain matches quizmentor.app in both iOS and Android
- Build fails on Expo SDK mismatch: npx expo-doctor and update SDK
- iOS code signing issues: Use EAS credentials manager or manual upload in EAS dashboard

Next steps

- After preview sign-off, proceed with TestFlight / Internal App Sharing
- Monitor crashes and performance metrics before expanding rollout
