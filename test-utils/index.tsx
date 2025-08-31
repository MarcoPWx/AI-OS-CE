/**
 * Comprehensive Test Utilities for QuizMentor
 * Provides reusable testing utilities, custom renders, and helpers
 */

import React, { ReactElement } from 'react';
import { render as rtlRender, RenderOptions } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Test IDs for consistent element selection
export const TestIds = {
  // Navigation
  TAB_HOME: 'tab-home',
  TAB_QUIZ: 'tab-quiz',
  TAB_PROFILE: 'tab-profile',
  TAB_LEADERBOARD: 'tab-leaderboard',

  // Quiz Flow
  QUIZ_START_BUTTON: 'quiz-start-button',
  CATEGORY_CARD: 'category-card',
  QUESTION_TEXT: 'question-text',
  OPTION_BUTTON: 'option-button',
  NEXT_BUTTON: 'next-button',
  SKIP_BUTTON: 'skip-button',
  TIMER_DISPLAY: 'timer-display',
  SCORE_DISPLAY: 'score-display',

  // Results
  RESULTS_SCORE: 'results-score',
  RESULTS_STARS: 'results-stars',
  RESULTS_XP: 'results-xp',
  RESULTS_SHARE: 'results-share',
  RESULTS_RETRY: 'results-retry',

  // Premium
  PAYWALL_MODAL: 'paywall-modal',
  PURCHASE_BUTTON: 'purchase-button',
  RESTORE_BUTTON: 'restore-button',

  // Profile
  STREAK_DISPLAY: 'streak-display',
  HEARTS_DISPLAY: 'hearts-display',
  LEVEL_DISPLAY: 'level-display',
  ACHIEVEMENTS_LIST: 'achievements-list',

  // Common
  LOADING_SPINNER: 'loading-spinner',
  ERROR_MESSAGE: 'error-message',
  RETRY_BUTTON: 'retry-button',
} as const;

// Custom render with all providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialRoute?: string;
  navigationState?: any;
  queryClient?: QueryClient;
}

export function renderWithProviders(ui: ReactElement, options?: CustomRenderOptions) {
  const {
    initialRoute = '/',
    navigationState,
    queryClient = createTestQueryClient(),
    ...renderOptions
  } = options || {};

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider
          initialMetrics={{
            frame: { x: 0, y: 0, width: 390, height: 844 },
            insets: { top: 47, left: 0, right: 0, bottom: 34 },
          }}
        >
          <NavigationContainer>{children}</NavigationContainer>
        </SafeAreaProvider>
      </QueryClientProvider>
    );
  }

  return rtlRender(ui, { wrapper: Wrapper, ...renderOptions });
}

// Create test query client with no retries
export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: Infinity,
        staleTime: Infinity,
      },
      mutations: {
        retry: false,
      },
    },
    logger: {
      log: () => {},
      warn: () => {},
      error: () => {},
    },
  });
}

// Wait utilities
export const waitForAsync = (ms: number = 0) => new Promise((resolve) => setTimeout(resolve, ms));

export const waitForNextUpdate = () => waitForAsync(0);

// Mock navigation
export const createMockNavigation = () => ({
  navigate: jest.fn(),
  goBack: jest.fn(),
  dispatch: jest.fn(),
  reset: jest.fn(),
  setParams: jest.fn(),
  addListener: jest.fn(() => jest.fn()),
  removeListener: jest.fn(),
  canGoBack: jest.fn(() => false),
  isFocused: jest.fn(() => true),
  getParent: jest.fn(),
  getState: jest.fn(),
});

// Mock route
export const createMockRoute = (params = {}) => ({
  key: 'test-route',
  name: 'TestScreen',
  params,
});

// Test data factories
export const factories = {
  user: (overrides = {}) => ({
    id: 'test-user-123',
    username: 'testuser',
    email: 'test@example.com',
    level: 5,
    xp: 1250,
    stars: 45,
    isPremium: false,
    createdAt: new Date().toISOString(),
    ...overrides,
  }),

  question: (overrides = {}) => ({
    id: 'question-123',
    category: 'React',
    question: 'What is a React Hook?',
    options: [
      'A function that lets you use state',
      'A class component',
      'A styling method',
      'A testing tool',
    ],
    correctAnswer: 0,
    explanation: 'Hooks are functions that let you use state and other React features.',
    difficulty: 3,
    ...overrides,
  }),

  category: (overrides = {}) => ({
    id: 'category-123',
    name: 'React',
    slug: 'react',
    description: 'Test your React knowledge',
    icon: '⚛️',
    color: '#61DAFB',
    questionCount: 100,
    ...overrides,
  }),

  quizSession: (overrides = {}) => ({
    id: 'session-123',
    categoryId: 'category-123',
    userId: 'user-123',
    score: 8,
    totalQuestions: 10,
    timeSpent: 120,
    xpEarned: 80,
    starsEarned: 3,
    completedAt: new Date().toISOString(),
    ...overrides,
  }),

  achievement: (overrides = {}) => ({
    id: 'achievement-123',
    name: 'Quiz Master',
    description: 'Complete 100 quizzes',
    icon: '🏆',
    xpReward: 500,
    unlockedAt: new Date().toISOString(),
    ...overrides,
  }),
};

// Assertion helpers
export const expectToBeVisible = (element: any) => {
  expect(element).toBeTruthy();
  expect(element.props.style?.display).not.toBe('none');
};

export const expectToBeHidden = (element: any) => {
  expect(!element || element.props.style?.display === 'none').toBeTruthy();
};

// Mock timers helper
export class MockTimers {
  private realSetTimeout: typeof setTimeout;
  private realSetInterval: typeof setInterval;
  private realClearTimeout: typeof clearTimeout;
  private realClearInterval: typeof clearInterval;
  private timers: Map<number, any> = new Map();
  private currentTime: number = 0;
  private nextId: number = 1;

  constructor() {
    this.realSetTimeout = global.setTimeout;
    this.realSetInterval = global.setInterval;
    this.realClearTimeout = global.clearTimeout;
    this.realClearInterval = global.clearInterval;
  }

  use() {
    global.setTimeout = ((fn: Function, ms: number) => {
      const id = this.nextId++;
      this.timers.set(id, { fn, ms, type: 'timeout' });
      return id;
    }) as any;

    global.setInterval = ((fn: Function, ms: number) => {
      const id = this.nextId++;
      this.timers.set(id, { fn, ms, type: 'interval' });
      return id;
    }) as any;

    global.clearTimeout = ((id: number) => {
      this.timers.delete(id);
    }) as any;

    global.clearInterval = ((id: number) => {
      this.timers.delete(id);
    }) as any;
  }

  restore() {
    global.setTimeout = this.realSetTimeout;
    global.setInterval = this.realSetInterval;
    global.clearTimeout = this.realClearTimeout;
    global.clearInterval = this.realClearInterval;
    this.timers.clear();
  }

  tick(ms: number) {
    this.currentTime += ms;
    const toExecute: Function[] = [];

    this.timers.forEach((timer, id) => {
      if (timer.type === 'timeout' && timer.ms <= this.currentTime) {
        toExecute.push(timer.fn);
        this.timers.delete(id);
      } else if (timer.type === 'interval') {
        const times = Math.floor(this.currentTime / timer.ms);
        for (let i = 0; i < times; i++) {
          toExecute.push(timer.fn);
        }
      }
    });

    toExecute.forEach((fn) => fn());
  }

  clear() {
    this.timers.clear();
    this.currentTime = 0;
  }
}

// Performance testing utilities
export class PerformanceMonitor {
  private marks: Map<string, number> = new Map();
  private measures: Map<string, number[]> = new Map();

  mark(name: string) {
    this.marks.set(name, performance.now());
  }

  measure(name: string, startMark: string, endMark?: string) {
    const start = this.marks.get(startMark);
    const end = endMark ? this.marks.get(endMark) : performance.now();

    if (start && end) {
      const duration = end - start;
      if (!this.measures.has(name)) {
        this.measures.set(name, []);
      }
      this.measures.get(name)!.push(duration);
      return duration;
    }
    return 0;
  }

  getAverageTime(measureName: string): number {
    const times = this.measures.get(measureName) || [];
    if (times.length === 0) return 0;
    return times.reduce((a, b) => a + b, 0) / times.length;
  }

  getAllMeasures() {
    const results: Record<string, any> = {};
    this.measures.forEach((times, name) => {
      results[name] = {
        average: this.getAverageTime(name),
        min: Math.min(...times),
        max: Math.max(...times),
        count: times.length,
      };
    });
    return results;
  }

  clear() {
    this.marks.clear();
    this.measures.clear();
  }
}

// Accessibility testing helpers
export const a11y = {
  expectAccessible: (element: any) => {
    expect(element.props.accessible).not.toBe(false);
    if (element.type === 'TouchableOpacity' || element.type === 'Pressable') {
      expect(element.props.accessibilityRole).toBeTruthy();
    }
  },

  expectLabel: (element: any, label: string) => {
    expect(element.props.accessibilityLabel).toBe(label);
  },

  expectHint: (element: any, hint: string) => {
    expect(element.props.accessibilityHint).toBe(hint);
  },

  expectRole: (element: any, role: string) => {
    expect(element.props.accessibilityRole).toBe(role);
  },
};

// Network mocking utilities
export class NetworkMock {
  private responses: Map<string, any> = new Map();
  private delays: Map<string, number> = new Map();

  mockResponse(url: string, response: any, delay: number = 0) {
    this.responses.set(url, response);
    this.delays.set(url, delay);
  }

  async fetch(url: string, options?: any) {
    const delay = this.delays.get(url) || 0;
    const response = this.responses.get(url);

    if (delay > 0) {
      await waitForAsync(delay);
    }

    if (!response) {
      throw new Error(`No mock response for ${url}`);
    }

    return {
      ok: true,
      json: async () => response,
      text: async () => JSON.stringify(response),
    };
  }

  clear() {
    this.responses.clear();
    this.delays.clear();
  }
}

// Storage mock utilities
export class StorageMock {
  private store: Map<string, string> = new Map();

  async getItem(key: string) {
    return this.store.get(key) || null;
  }

  async setItem(key: string, value: string) {
    this.store.set(key, value);
  }

  async removeItem(key: string) {
    this.store.delete(key);
  }

  async clear() {
    this.store.clear();
  }

  async getAllKeys() {
    return Array.from(this.store.keys());
  }

  async multiGet(keys: string[]) {
    return keys.map((key) => [key, this.store.get(key) || null]);
  }

  async multiSet(pairs: [string, string][]) {
    pairs.forEach(([key, value]) => this.store.set(key, value));
  }
}

// Re-export commonly used functions
export * from '@testing-library/react-native';
export { renderWithProviders as render };
