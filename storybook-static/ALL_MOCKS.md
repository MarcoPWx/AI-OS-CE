# All Mocks Unified Toggle

Status: Active
Last Updated: 2025-08-28

Overview
Set EXPO_PUBLIC_USE_ALL_MOCKS=1 to enable all runtime mocks conveniently across web and React Native:

- MSW worker on web (HTTP)
- Mock socket at runtime (web/RN)
- You can still use USE_MOCKS=true to initialize the React Native MockEngine for fetch interception (RN). All-mocks does not auto-start MockEngine to avoid platform surprises; combine both if desired.

Usage

- Web: EXPO_PUBLIC_USE_ALL_MOCKS=1 npx expo start --web
- RN: EXPO_PUBLIC_USE_ALL_MOCKS=1 USE_MOCKS=true npx expo start

Details

- App.tsx starts MSW worker when EXPO_PUBLIC_USE_MSW=1 or EXPO_PUBLIC_USE_ALL_MOCKS=1
- src/lib/socket.ts uses mock socket when EXPO_PUBLIC_USE_WS_MOCKS=1 or EXPO_PUBLIC_USE_ALL_MOCKS=1 or USE_MOCKS=true
- AppProfessionalRefined.tsx initializes MockEngine automatically if USE_MOCKS=true or EXPO_PUBLIC_USE_ALL_MOCKS=1
- WebSocket scenario is selectable via WS_MOCK_SCENARIO=lobbyBasic|matchHappyPath|disconnectRecovery

Notes

- For MSW on web, ensure msw is installed and the service worker is initialized (see MSW_SETUP.md)
- In tests, MSW Node server starts via jest.setup.js and socket.io-client is mocked regardless of these flags.
