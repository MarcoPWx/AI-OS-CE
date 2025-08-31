import '@testing-library/jest-native/extend-expect';
import 'react-native-gesture-handler/jestSetup';

// Mock React Native modules (use virtual to support RN 0.79 structure changes)
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper', () => ({}), { virtual: true });
jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter', () => ({}), { virtual: true });

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// Mock react-native-vector-icons
jest.mock('react-native-vector-icons/MaterialIcons', () => 'Icon');
jest.mock('react-native-vector-icons/FontAwesome', () => 'Icon');
jest.mock('react-native-vector-icons/Ionicons', () => 'Icon');

// Mock react-navigation
jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: jest.fn(),
      goBack: jest.fn(),
      dispatch: jest.fn(),
      reset: jest.fn(),
      setOptions: jest.fn(),
    }),
    useRoute: () => ({
      params: {},
      name: 'TestScreen',
    }),
    useFocusEffect: jest.fn(),
    useIsFocused: () => true,
  };
});


// Mock API utilities
jest.mock('../lib/api', () => ({
  CacheManager: {
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
    clear: jest.fn(),
  },
  PerformanceMonitor: {
    measure: jest.fn((name, fn) => fn()),
    start: jest.fn(),
    end: jest.fn(),
  },
  ErrorReporter: {
    report: jest.fn(),
    captureException: jest.fn(),
    setUser: jest.fn(),
    clearUser: jest.fn(),
  },
  APIClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    patch: jest.fn(),
  },
}));


// Global test utilities
global.requestAnimationFrame = (callback: FrameRequestCallback) => {
  setTimeout(callback, 0);
  return 0;
};

global.cancelAnimationFrame = (id: number) => {
  clearTimeout(id);
};

// Mock console methods to reduce noise in tests
const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning: ReactTestRenderer') ||
        args[0].includes('Warning: An update to') ||
        args[0].includes('Warning: You called act'))
    ) {
      return;
    }
    originalError.call(console, ...args);
  };

  console.warn = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning: ReactTestRenderer') ||
        args[0].includes('Animated:') ||
        args[0].includes('Setting a timer'))
    ) {
      return;
    }
    originalWarn.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
  console.warn = originalWarn;
});

// Reset mocks after each test
afterEach(() => {
  jest.clearAllMocks();
});
