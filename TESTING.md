# QuizMentor Testing Guide

## 🎯 Overview

QuizMentor implements a comprehensive testing strategy using:

- **Unit Testing**: Jest + React Native Testing Library
- **E2E Testing**: Playwright with video/screenshot capture
- **TDD Approach**: Test-Driven Development for new features

## 🚀 Quick Start

### Run All Tests

```bash
npm run test:all      # Run unit + E2E tests
```

### Unit Tests

```bash
npm test              # Run all unit tests
npm run test:watch    # Watch mode for TDD
npm run test:coverage # Generate coverage report
npm run tdd          # TDD mode with coverage
```

### E2E Tests

```bash
npm run test:e2e         # Run Playwright tests
npm run test:e2e:headed  # Run with browser visible
npm run test:e2e:debug   # Debug mode
npm run test:e2e:ui      # Interactive UI mode
```

## 📊 Coverage Targets

- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%
- **Statements**: 70%

## 🏗️ Test Structure

### Unit Tests

```
store/__tests__/
├── heartsStore.test.ts      # Heart system tests
├── streakStore.test.ts      # Streak tracking tests
└── dailyChallengeStore.test.ts # TDD example
```

### E2E Tests

```
e2e/
└── quiz-flow.spec.ts        # Complete user flows
```

## 🧪 Testing Patterns

### Unit Test Example

```typescript
describe('Hearts Store', () => {
  beforeEach(() => {
    // Reset store state
    useHeartsStore.setState({
      hearts: 5,
      maxHearts: 5,
      lastRegenerationTime: Date.now(),
      isUnlimited: false,
    });
  });

  it('should decrease hearts when losing', () => {
    const { result } = renderHook(() => useHeartsStore());

    act(() => {
      const success = result.current.loseHeart();
      expect(success).toBe(true);
    });

    expect(result.current.hearts).toBe(4);
  });
});
```

### E2E Test Example

```typescript
test('should complete a full quiz flow', async ({ page }) => {
  await page.goto('/');
  await page.click('text=Start Quiz');
  await page.waitForURL('**/Categories');

  // Select category
  await page.locator('[data-testid="category-card"]').first().click();

  // Answer questions
  for (let i = 0; i < 10; i++) {
    await page.locator('[data-testid="option-button"]').first().click();
    await page.click('text=Next Question');
  }

  // Verify results
  await expect(page.locator('text=Quiz Complete!')).toBeVisible();
});
```

## 🔨 TDD Workflow

### 1. Write Failing Test (Red)

```typescript
it('should generate daily challenge', () => {
  const { result } = renderHook(() => useDailyChallengeStore());

  act(() => {
    result.current.generateDailyChallenge();
  });

  expect(result.current.currentChallenge).toBeDefined();
  expect(result.current.currentChallenge?.points).toBeGreaterThan(0);
});
```

### 2. Implement Feature (Green)

```typescript
generateDailyChallenge: () => {
  const challenge = {
    id: `challenge-${Date.now()}`,
    title: 'Daily Challenge',
    points: 100,
    // ... implementation
  };

  set({ currentChallenge: challenge });
};
```

### 3. Refactor (Refactor)

Improve code quality while keeping tests green.

## 🎬 E2E Features

### Video Recording

All E2E tests automatically record videos:

```typescript
use: {
  video: {
    mode: 'on',
    size: { width: 1280, height: 720 }
  }
}
```

### Screenshots

Automatic screenshots on test failure:

```typescript
use: {
  screenshot: {
    mode: 'on',
    fullPage: true
  }
}
```

### Multiple Browsers

Tests run on:

- Chromium
- Firefox
- WebKit (Safari)
- Mobile Chrome (Pixel 5)
- Mobile Safari (iPhone 12)

## 📝 Test Data Management

### Mock Data

```typescript
const mockQuizData = {
  category: 'React',
  questions: [
    {
      id: '1',
      question: 'What is a Hook?',
      options: ['Function', 'Class', 'Variable', 'Module'],
      correct: 0,
    },
  ],
};
```

### AsyncStorage Mocking

```typescript
beforeEach(() => {
  AsyncStorage.clear();
});

it('should persist state', async () => {
  // Test persistence
  await AsyncStorage.setItem('key', JSON.stringify(data));
  const stored = await AsyncStorage.getItem('key');
  expect(JSON.parse(stored)).toEqual(data);
});
```

## 🐛 Debugging

### Unit Tests

```bash
# Debug specific test
npm test -- --testNamePattern="should lose heart"

# Debug specific file
npm test -- heartsStore.test.ts
```

### E2E Tests

```bash
# Debug mode with inspector
npm run test:e2e:debug

# Headed mode to see browser
npm run test:e2e:headed

# UI mode for interactive debugging
npm run test:e2e:ui
```

## 🔧 Configuration

### Jest Config (jest.config.js)

- Preset: `jest-expo`
- Coverage threshold: 70%
- Transform patterns for React Native

### Playwright Config (playwright.config.ts)

- Base URL: `http://localhost:19006`
- Video recording: Enabled
- Screenshot: On failure
- Retry: 2 times in CI

## 📈 Best Practices

### 1. Test Naming

- Use descriptive test names
- Follow "should..." pattern
- Group related tests in describe blocks

### 2. Test Organization

- One test file per module
- Group by functionality
- Keep tests close to source

### 3. Mocking

- Mock external dependencies
- Use realistic test data
- Reset mocks between tests

### 4. Assertions

- Test behavior, not implementation
- Use specific assertions
- Test edge cases

### 5. Performance

- Keep tests fast (<100ms for unit)
- Use parallel execution
- Mock heavy operations

## 🚨 Common Issues

### Issue: Tests failing with module not found

**Solution**: Check jest.setup.js mocks

### Issue: E2E tests timeout

**Solution**: Increase timeout in playwright.config.ts

### Issue: Coverage not meeting threshold

**Solution**: Add more test cases for uncovered branches

## 📚 Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [TDD Best Practices](https://martinfowler.com/bliki/TestDrivenDevelopment.html)

## 🎉 Next Steps

1. **Add Component Tests**: Test UI components
2. **Integration Tests**: Test screen flows
3. **CI/CD Integration**: Add GitHub Actions
4. **Visual Testing**: Add visual regression tests
5. **Performance Testing**: Add load tests

---

## 📞 Support

For questions or issues with testing:

1. Check this guide
2. Review existing tests for examples
3. Consult team documentation
4. Ask in development chat

Happy Testing! 🧪✨
