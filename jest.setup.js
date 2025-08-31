// jest.setup.js

// Increase default test timeout for heavier suites
jest.setTimeout(20000);

// Mock Dimensions before any imports
jest.mock('react-native/Libraries/Utilities/Dimensions', () => ({
  get: jest.fn().mockReturnValue({
    width: 375,
    height: 812,
    scale: 2,
    fontScale: 1,
  }),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  set: jest.fn(),
}));

// Mock PixelRatio
jest.mock('react-native/Libraries/Utilities/PixelRatio', () => ({
  get: jest.fn(() => 2),
  getFontScale: jest.fn(() => 1),
  getPixelSizeForLayoutSize: jest.fn((size) => size * 2),
  roundToNearestPixel: jest.fn((size) => Math.round(size)),
}));
// RN 0.79+ alternative internal path
jest.mock('react-native/Libraries/Utilities/PixelRatio/PixelRatio', () => ({
  get: jest.fn(() => 2),
  getFontScale: jest.fn(() => 1),
  getPixelSizeForLayoutSize: jest.fn((size) => size * 2),
  roundToNearestPixel: jest.fn((size) => Math.round(size)),
}), { virtual: true });
// Alternative Dimensions internal path
jest.mock('react-native/Libraries/Utilities/Dimensions/Dimensions', () => ({
  get: jest.fn().mockReturnValue({ width: 375, height: 812, scale: 2, fontScale: 1 }),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  set: jest.fn(),
}), { virtual: true });

// Patch the exports on the main react-native module as well
try {
  const RN = require('react-native');
  // Platform safety
  if (!RN.Platform) {
    RN.Platform = { OS: 'ios', select: (spec) => spec?.ios ?? spec?.default };
  } else if (!RN.Platform.select) {
    RN.Platform.select = (spec) => spec?.ios ?? spec?.default;
  }
  if (!RN.Dimensions) {
    RN.Dimensions = { get: jest.fn(() => ({ width: 375, height: 812, scale: 2, fontScale: 1 })) };
  } else if (RN?.Dimensions?.get) {
    jest.spyOn(RN.Dimensions, 'get').mockReturnValue({
      width: 375,
      height: 812,
      scale: 2,
      fontScale: 1,
    });
  }
  if (RN?.PixelRatio) {
    RN.PixelRatio.get = jest.fn(() => 2);
    RN.PixelRatio.getFontScale = jest.fn(() => 1);
    RN.PixelRatio.getPixelSizeForLayoutSize = jest.fn((size) => size * 2);
    RN.PixelRatio.roundToNearestPixel = jest.fn((size) => Math.round(size));
  }
  if (!RN.Easing) {
    RN.Easing = {};
  }
  const identity = (t) => t;
  RN.Easing.linear = RN.Easing.linear || identity;
  RN.Easing.cubic = RN.Easing.cubic || identity;
  RN.Easing.in = RN.Easing.in || ((easing) => easing || identity);
  RN.Easing.out = RN.Easing.out || ((easing) => easing || identity);
  RN.Easing.inOut = RN.Easing.inOut || ((easing) => easing || identity);
  RN.Easing.back = RN.Easing.back || ((_s = 1.70158) => identity);
} catch {}

import 'react-native-gesture-handler/jestSetup';

// Provide Platform mock to avoid ReferenceError in non-RN env
jest.mock('react-native/Libraries/Utilities/Platform', () => ({
  OS: 'ios',
  select: (spec) => spec?.ios ?? spec?.default,
}));

// NetInfo mock to stabilize network-dependent code
jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: (cb) => {
    setTimeout(() => cb({ isConnected: true, isInternetReachable: true }), 0);
    return { remove: jest.fn() };
  },
  fetch: () => Promise.resolve({ isConnected: true, isInternetReachable: true }),
}));

// Expo Notifications mock to avoid importing Expo runtime in tests
jest.mock('expo-notifications', () => ({
  scheduleNotificationAsync: jest.fn(() => Promise.resolve({ identifier: 'mock' })),
  cancelScheduledNotificationAsync: jest.fn(() => Promise.resolve()),
  cancelAllScheduledNotificationsAsync: jest.fn(() => Promise.resolve()),
  dismissAllNotificationsAsync: jest.fn(() => Promise.resolve()),
  getPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  requestPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  setNotificationHandler: jest.fn(),
  addNotificationReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  addNotificationResponseReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  setBadgeCountAsync: jest.fn(() => Promise.resolve()),
  AndroidNotificationPriority: { HIGH: 'high' },
}), { virtual: true });

// Normalize relative fetch/Request BEFORE starting MSW so it can intercept correctly
if (typeof global.fetch === 'function') {
  const originalFetch = global.fetch;
  // @ts-expect-error: override global fetch to support relative URLs in tests
  global.fetch = (input, init) => {
    if (typeof input === 'string' && input.startsWith('/')) {
      return originalFetch(`http://localhost${input}`, init);
    }
    return originalFetch(input, init);
  };
}

try {
  const OriginalRequest = global.Request;
  if (typeof OriginalRequest === 'function') {
    class RequestWrapper extends OriginalRequest {
      constructor(input, init) {
        if (typeof input === 'string' && input.startsWith('/')) {
          input = `http://localhost${input}`;
        }
        super(input, init);
      }
    }
    // @ts-expect-error: override global Request class in tests to rewrite relative URLs
    global.Request = RequestWrapper;
  }
} catch {}

// Additional targeted mocks
jest.mock('react-native/Libraries/Animated/Easing', () => ({
  linear: (t: number) => t,
  cubic: (t: number) => t,
  in: (easing?: (t: number) => number) => easing || ((t: number) => t),
  out: (easing?: (t: number) => number) => easing || ((t: number) => t),
  inOut: (easing?: (t: number) => number) => easing || ((t: number) => t),
  back: (_s: number = 1.70158) => (t: number) => t,
}));

jest.mock('@react-native-firebase/analytics', () => ({
  logEvent: jest.fn(),
  setUserId: jest.fn(),
  setUserProperties: jest.fn(),
  setCurrentScreen: jest.fn(),
}), { virtual: true });

jest.mock('@react-native-firebase/perf', () => ({
  startTrace: jest.fn(() => ({ start: jest.fn(), stop: jest.fn(), putAttribute: jest.fn(), incrementMetric: jest.fn() })),
}), { virtual: true });

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});
// Reanimated worklet init stub
// @ts-expect-error test env
global.__reanimatedWorkletInit = global.__reanimatedWorkletInit || jest.fn();

// Mock TurboModuleRegistry
jest.mock('react-native/Libraries/TurboModule/TurboModuleRegistry', () => ({
  getEnforcing: jest.fn((name) => {
    const mockModule = {
      initialize: jest.fn(),
      startAnimating: jest.fn(),
      stopAnimating: jest.fn(),
      addAnimatedEventToView: jest.fn(),
      removeAnimatedEventFromView: jest.fn(),
      createAnimatedNode: jest.fn(),
      updateAnimatedNodeConfig: jest.fn(),
      getValue: jest.fn((tag, callback) => callback(0)),
      connectAnimatedNodes: jest.fn(),
      disconnectAnimatedNodes: jest.fn(),
      startListeningToAnimatedNodeValue: jest.fn(),
      stopListeningToAnimatedNodeValue: jest.fn(),
      setAnimatedNodeValue: jest.fn(),
      setAnimatedNodeOffset: jest.fn(),
      flattenAnimatedNodeOffset: jest.fn(),
      extractAnimatedNodeOffset: jest.fn(),
      connectAnimatedNodeToView: jest.fn(),
      disconnectAnimatedNodeFromView: jest.fn(),
      restoreDefaultValues: jest.fn(),
      dropAnimatedNode: jest.fn(),
      setAnimatingNode: jest.fn(),
      startAnimatingNode: jest.fn(),
      stopAnimation: jest.fn(),
      queueAndExecuteBatchedOperations: jest.fn(),
      getConstants: jest.fn(() => ({})),
      show: jest.fn(),
      reload: jest.fn(),
    };
    return mockModule;
  }),
  get: jest.fn((name) => {
    const mockModule = {
      initialize: jest.fn(),
      startAnimating: jest.fn(),
      stopAnimating: jest.fn(),
      addAnimatedEventToView: jest.fn(),
      removeAnimatedEventFromView: jest.fn(),
      createAnimatedNode: jest.fn(),
      updateAnimatedNodeConfig: jest.fn(),
      getValue: jest.fn((tag, callback) => callback(0)),
      connectAnimatedNodes: jest.fn(),
      disconnectAnimatedNodes: jest.fn(),
      startListeningToAnimatedNodeValue: jest.fn(),
      stopListeningToAnimatedNodeValue: jest.fn(),
      setAnimatedNodeValue: jest.fn(),
      setAnimatedNodeOffset: jest.fn(),
      flattenAnimatedNodeOffset: jest.fn(),
      extractAnimatedNodeOffset: jest.fn(),
      connectAnimatedNodeToView: jest.fn(),
      disconnectAnimatedNodeFromView: jest.fn(),
      restoreDefaultValues: jest.fn(),
      dropAnimatedNode: jest.fn(),
      setAnimatingNode: jest.fn(),
      startAnimatingNode: jest.fn(),
      stopAnimation: jest.fn(),
      queueAndExecuteBatchedOperations: jest.fn(),
      getConstants: jest.fn(() => ({})),
    };
    return mockModule;
  }),
}))

// Mock expo-linear-gradient
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: 'LinearGradient',
}));

// Mock expo-constants
jest.mock('expo-constants', () => ({
  default: {
    expoConfig: {
      extra: {
        supabaseUrl: 'https://test.supabase.co',
        supabaseAnonKey: 'test-key',
      },
    },
  },
  expoConfig: {
    extra: {
      supabaseUrl: 'https://test.supabase.co',
      supabaseAnonKey: 'test-key',
    },
  },
}));

// Mock mixpanel-react-native (virtual module so we don't need it installed)
jest.mock('mixpanel-react-native', () => ({
  Mixpanel: class {
    init() { return Promise.resolve(); }
    identify() {}
    track() {}
    flush() {}
  }
}), { virtual: true });

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Reset dailyChallengeStore when AsyncStorage.clear() is called (test isolation)
try {
  const AS = require('@react-native-async-storage/async-storage');
  const originalClear = AS.clear;
  AS.clear = jest.fn(async () => {
    await originalClear();
    try {
      const storeMod = require('./store/dailyChallengeStore');
      if (typeof storeMod.__resetDailyChallengeStoreForTests === 'function') {
        storeMod.__resetDailyChallengeStoreForTests();
      }
    } catch {}
  });
} catch {}

// Mock expo-av (Audio)
jest.mock('expo-av', () => ({
  Audio: {
    Sound: {
      createAsync: jest.fn(() => 
        Promise.resolve({
          sound: {
            playAsync: jest.fn(() => Promise.resolve()),
            unloadAsync: jest.fn(() => Promise.resolve()),
            setPositionAsync: jest.fn(() => Promise.resolve()),
            setVolumeAsync: jest.fn(() => Promise.resolve()),
            stopAsync: jest.fn(() => Promise.resolve()),
            getStatusAsync: jest.fn(() => Promise.resolve({ isLoaded: true })),
          },
          status: {
            isLoaded: true,
            isPlaying: false,
          },
        })
      ),
    },
    setAudioModeAsync: jest.fn(() => Promise.resolve()),
  },
  Video: jest.fn(),
  AVPlaybackStatus: {},
}));

// Mock expo-haptics
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(() => Promise.resolve()),
  notificationAsync: jest.fn(() => Promise.resolve()),
  selectionAsync: jest.fn(() => Promise.resolve()),
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
    Soft: 'soft',
    Rigid: 'rigid',
  },
  NotificationFeedbackType: {
    Success: 'success',
    Warning: 'warning',
    Error: 'error',
  },
}));

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }) => children,
  SafeAreaView: ({ children }) => children,
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
  SafeAreaConsumer: ({ children }) => children({ insets: { top: 0, right: 0, bottom: 0, left: 0 } }),
}));

// Mock @expo/vector-icons
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
  MaterialIcons: 'MaterialIcons',
  FontAwesome: 'FontAwesome',
  MaterialCommunityIcons: 'MaterialCommunityIcons',
  Feather: 'Feather',
}));

// MSW server (optional) for API mocking in tests
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { server } = require('./src/mocks/msw/server');
  beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());
} catch (e) {
  // MSW not available; proceed without it
}

// Reset analytics events between tests to avoid cross-test pollution
try {
  const { AnalyticsService } = require('./src/services/analytics');
  afterEach(() => {
    try { AnalyticsService.clearEvents(); } catch {}
  });
} catch {}

// Mock socket.io-client with in-memory event emitter
jest.mock('socket.io-client', () => {
  const { EventEmitter } = require('events');
  class MockSocket extends EventEmitter {
    constructor(url, options) {
      super();
      this.url = url; this.options = options;
      setTimeout(() => this.emit('connect'), 0);
    }
    connect() { setTimeout(() => this.emit('connect'), 0); }
    disconnect() { setTimeout(() => this.emit('disconnect', 'io client disconnect'), 0); }
    emit(event, ...args) {
      const maybeAck = args[args.length - 1];
      const ack = typeof maybeAck === 'function' ? maybeAck : null;
      if (ack) {
        switch (event) {
          case 'create_room':
            return setTimeout(() => ack({ success: true, room: { id: 'room_mock', name: 'Mock Room' } }), 0);
          case 'join_room':
          case 'leave_room':
          case 'player_ready':
          case 'submit_answer':
          case 'chat_message':
            return setTimeout(() => ack({ success: true }), 0);
          case 'get_rooms':
            return setTimeout(() => ack({ success: true, rooms: [] }), 0);
          default:
            return setTimeout(() => ack({ success: true }), 0);
        }
      }
      return super.emit(event, ...args);
    }
    on(event, cb) { return super.on(event, cb); }
    off(event, cb) { return super.off(event, cb); }
  }
  return { io: (url, options) => new MockSocket(url, options) };
});

