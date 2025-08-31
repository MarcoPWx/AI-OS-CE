# TDD Implementation Runbook - Making QuizMentor Actually Work

## 🎯 Philosophy: Test First, Then Build

**Current Reality**: We have a frontend shell with 97% test failure rate.
**Goal**: Build features test-first to ensure they ACTUALLY work.

## Phase 1: Stabilize What Exists (Week 1)

### Day 1-2: Fix Test Infrastructure

```bash
# 1. Install missing test dependencies
npm install --save-dev \
  supertest \
  @testing-library/react-native \
  @testing-library/jest-native \
  jest-expo \
  msw

# 2. Fix Jest configuration
```

```javascript
// jest.config.js
module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect', '<rootDir>/tests/setup.ts'],
  testEnvironment: 'node',
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  coverageThreshold: {
    global: {
      branches: 30,
      functions: 30,
      lines: 30,
      statements: 30,
    },
  },
};
```

### Day 3: Create Mock Infrastructure

```typescript
// __mocks__/supabase.ts
export const supabase = {
  auth: {
    signInWithPassword: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
    getUser: jest.fn(),
  },
  from: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
  })),
};
```

### Day 4-5: Write Integration Tests for Critical Paths

```typescript
// __tests__/critical-paths/app-launch.test.tsx
describe('App Launch Critical Path', () => {
  it('should show intro animation on first launch', async () => {
    const { getByTestId } = render(<App />);
    expect(getByTestId('intro-animation')).toBeTruthy();

    await waitFor(() => {
      expect(getByTestId('welcome-screen')).toBeTruthy();
    }, { timeout: 6000 });
  });

  it('should navigate to auth when Get Started pressed', async () => {
    const { getByText } = render(<App />);
    const getStartedButton = getByText('Get Started');

    fireEvent.press(getStartedButton);

    await waitFor(() => {
      expect(getByTestId('auth-choice-screen')).toBeTruthy();
    });
  });

  it('should handle demo mode without crashing', async () => {
    const { getByText } = render(<App />);
    const demoButton = getByText('Quick Start Demo');

    fireEvent.press(demoButton);

    await waitFor(() => {
      expect(getByTestId('home-dashboard')).toBeTruthy();
    });
  });
});
```

## Phase 2: Build Core Features Test-First (Week 2-3)

### Feature 1: Local Demo Mode

```typescript
// __tests__/features/demo-mode.test.ts
describe('Demo Mode', () => {
  beforeEach(() => {
    AsyncStorage.clear();
  });

  it('should create local demo user', async () => {
    const demoService = new DemoModeService();
    const user = await demoService.createDemoUser();

    expect(user).toMatchObject({
      id: expect.any(String),
      name: 'Demo User',
      level: 1,
      xp: 0,
      isDemo: true,
    });
  });

  it('should persist demo progress locally', async () => {
    const demoService = new DemoModeService();
    await demoService.saveProgress({ score: 100, questionsAnswered: 10 });

    const progress = await demoService.getProgress();
    expect(progress.score).toBe(100);
  });
});
```

```typescript
// services/demoModeService.ts - IMPLEMENT AFTER TEST
export class DemoModeService {
  async createDemoUser(): Promise<DemoUser> {
    const user = {
      id: `demo_${Date.now()}`,
      name: 'Demo User',
      level: 1,
      xp: 0,
      streak: 0,
      isDemo: true,
    };

    await AsyncStorage.setItem('demo_user', JSON.stringify(user));
    return user;
  }

  async saveProgress(progress: Progress): Promise<void> {
    await AsyncStorage.setItem('demo_progress', JSON.stringify(progress));
  }

  async getProgress(): Promise<Progress> {
    const data = await AsyncStorage.getItem('demo_progress');
    return data ? JSON.parse(data) : { score: 0, questionsAnswered: 0 };
  }
}
```

### Feature 2: Offline Quiz System

```typescript
// __tests__/features/offline-quiz.test.ts
describe('Offline Quiz System', () => {
  it('should load bundled questions', async () => {
    const quizService = new OfflineQuizService();
    const questions = await quizService.getQuestions('javascript', 10);

    expect(questions).toHaveLength(10);
    expect(questions[0]).toHaveProperty('question');
    expect(questions[0]).toHaveProperty('options');
    expect(questions[0]).toHaveProperty('correctAnswer');
  });

  it('should track quiz progress offline', async () => {
    const quizService = new OfflineQuizService();
    const session = await quizService.startQuiz('javascript');

    await quizService.submitAnswer(session.id, 0, 2);

    const progress = await quizService.getProgress(session.id);
    expect(progress.answered).toBe(1);
    expect(progress.correct).toBe(0); // Assuming answer 2 was wrong
  });

  it('should calculate score correctly', async () => {
    const quizService = new OfflineQuizService();
    const score = quizService.calculateScore({
      correct: 7,
      total: 10,
      timeBonus: 50,
    });

    expect(score).toBe(750); // 70 * 10 + 50
  });
});
```

### Feature 3: Error Recovery

```typescript
// __tests__/features/error-recovery.test.ts
describe('Error Recovery', () => {
  it('should show offline banner when no connection', async () => {
    // Mock no internet
    NetInfo.fetch.mockResolvedValue({ isConnected: false });

    const { getByTestId } = render(<App />);

    await waitFor(() => {
      expect(getByTestId('offline-banner')).toBeTruthy();
    });
  });

  it('should retry failed requests with exponential backoff', async () => {
    const apiClient = new ApiClient();
    const mockFetch = jest.fn()
      .mockRejectedValueOnce(new Error('Network error'))
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({ data: 'success' });

    apiClient.fetch = mockFetch;

    const result = await apiClient.fetchWithRetry('/api/test');

    expect(mockFetch).toHaveBeenCalledTimes(3);
    expect(result.data).toBe('success');
  });

  it('should save state before crash', async () => {
    const stateManager = new StateManager();
    const mockState = { currentQuestion: 5, score: 50 };

    // Simulate app about to crash
    await stateManager.emergencySave(mockState);

    // Simulate app restart
    const recovered = await stateManager.recoverState();
    expect(recovered).toEqual(mockState);
  });
});
```

## Phase 3: Backend Integration Tests (Week 4)

### Supabase Setup Tests

```typescript
// __tests__/backend/supabase-setup.test.ts
describe('Supabase Integration', () => {
  beforeAll(async () => {
    // Use test database
    process.env.SUPABASE_URL = 'https://test.supabase.co';
    process.env.SUPABASE_ANON_KEY = 'test-key';
  });

  it('should connect to Supabase', async () => {
    const { data, error } = await supabase.from('health').select('*');
    expect(error).toBeNull();
  });

  it('should create user profile on signup', async () => {
    const { user, error } = await supabase.auth.signUp({
      email: 'test@example.com',
      password: 'Test123!',
    });

    expect(error).toBeNull();
    expect(user).toHaveProperty('id');

    // Check profile was created
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    expect(profile).toBeTruthy();
  });
});
```

## Phase 4: E2E Tests for Complete Flows (Week 5)

### Complete User Journey Test

```typescript
// e2e/complete-journey.test.ts
describe('Complete User Journey', () => {
  it('should complete full quiz flow', async () => {
    // 1. Launch app
    await device.launchApp();

    // 2. Skip intro
    await element(by.id('skip-intro')).tap();

    // 3. Choose demo mode
    await element(by.text('Quick Start Demo')).tap();

    // 4. Select category
    await element(by.text('JavaScript')).tap();

    // 5. Answer questions
    for (let i = 0; i < 5; i++) {
      await element(by.id(`option-${i % 4}`)).tap();
      await waitFor(element(by.id('next-question'))).toBeVisible();
    }

    // 6. View results
    await expect(element(by.id('results-screen'))).toBeVisible();
    await expect(element(by.id('score-display'))).toBeVisible();

    // 7. Return home
    await element(by.text('Back to Home')).tap();
    await expect(element(by.id('home-dashboard'))).toBeVisible();
  });
});
```

## 🔧 Continuous Testing Strategy

### Pre-Commit Hook

```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm run test:staged && npm run lint"
    }
  },
  "scripts": {
    "test:staged": "jest --bail --findRelatedTests",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:e2e": "detox test"
  }
}
```

### CI Pipeline

```yaml
# .github/workflows/test.yml
name: Test Suite
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm ci
      - run: npm run test:coverage
      - run: npm run lint

  e2e:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v2
      - run: npm ci
      - run: npm run e2e:ios
```

## 📊 Success Metrics

### Week 1 Goals

- [ ] Test infrastructure fixed
- [ ] 10 critical path tests passing
- [ ] Mock backend operational
- [ ] Demo mode working

### Week 2 Goals

- [ ] 50% test coverage
- [ ] All navigation tests passing
- [ ] Offline mode functional
- [ ] Error boundaries tested

### Week 3 Goals

- [ ] 70% test coverage
- [ ] Integration tests passing
- [ ] State persistence tested
- [ ] Performance benchmarks met

### Week 4 Goals

- [ ] Backend connected
- [ ] Auth flow tested
- [ ] Data persistence verified
- [ ] API tests passing

### Week 5 Goals

- [ ] 80% test coverage
- [ ] E2E tests passing
- [ ] Load testing complete
- [ ] Production ready

## ⚠️ Common Pitfalls to Avoid

1. **Writing tests after code** - Always test first
2. **Testing implementation** - Test behavior
3. **Brittle selectors** - Use testIDs
4. **Ignoring flaky tests** - Fix immediately
5. **Not testing errors** - Test failure paths
6. **Skipping edge cases** - Test boundaries
7. **Manual testing only** - Automate everything

## 🚀 Quick Start Commands

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test
npm test -- app-launch.test.tsx

# Run in watch mode
npm run test:watch

# Run E2E tests
npm run e2e:ios
npm run e2e:android

# Generate coverage report
npm run test:coverage -- --coverageReporters=html
open coverage/index.html
```

---

## Summary

**Stop building features without tests. Start with tests, then make them pass.**

This is not about perfection, it's about KNOWING what works and what doesn't.

_"If it's not tested, it's broken."_
