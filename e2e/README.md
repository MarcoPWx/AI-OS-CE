> Status: Current
> Last Updated: 2025-08-28
> Author: QA Team
> Version: 1.1

# E2E Testing Documentation

## Overview

This directory contains comprehensive end-to-end tests for the QuizMentor application, covering the premium user journey, API integration, and all critical user flows.

## Test Structure

```
e2e/
├── premium-journey.spec.ts    # Playwright web tests
├── detox/
│   └── premium-journey.e2e.ts # Detox React Native tests
├── helpers/
│   └── test-helpers.ts        # Shared test utilities
├── run-tests.sh               # Test runner script
└── README.md                  # This file
```

## Test Coverage

### 1. Onboarding Flow

- Splash screen animation
- Welcome screens
- Goal selection
- Interest selection
- Time commitment
- Personalization

### 2. Premium Components

- Glass morphism cards
- Gradient buttons
- Liquid progress bars
- Floating action buttons
- Animation performance

### 3. Quiz Experience

- Swipeable quiz cards
- Answer selection
- Timer functionality
- Hearts system
- Score tracking

### 4. Results Screen

- Celebration animations
- Score display
- Statistics
- Share functionality
- Leaderboard

### 5. Paywall & Subscription

- Hearts depletion
- Urgency timers
- Pricing display
- Purchase flow
- Success animations

### 6. Performance

- 60 FPS animations
- Load times
- Memory usage
- Network optimization
- Lighthouse scores

### 7. Accessibility

- Screen reader support
- Keyboard navigation
- Color contrast
- Focus indicators
- ARIA labels

### 8. Error Handling

- Network failures
- Offline mode
- API errors
- Retry mechanisms
- Error messages

## Running Tests

### Quick Start

```bash
# Run all E2E tests
npm run test:e2e

# Run specific test suites
npm run test:e2e:mobile      # Mobile browser tests
npm run test:e2e:detox:ios   # iOS native tests
npm run test:e2e:detox:android # Android native tests

# Run with UI (Playwright)
npm run test:e2e:ui

# Debug mode
npm run test:e2e:debug
```

### Storybook Test Runner (play functions)

```bash
# Start Storybook locally (port 7007)
npm run storybook

# In another terminal, run the test runner against the running instance
npm run test:stories

# Or build Storybook and run headless tests in CI mode
npm run build-storybook && npm run test:stories:ci
```

- The runner executes play() interactions like API/Playground default/overrides and Flows/QuizFlowDemo.
- For API Playground, you can assert rate limiting (GET /api/ratelimit), caching (GET /api/cache → 304), and error/empty variants.
- For WebSocket scenarios, prefer manual or visual validation; keep play() minimal to avoid flakiness.

### Advanced Usage

```bash
# Run specific test file
npx playwright test e2e/premium-journey.spec.ts

# Run specific test
npx playwright test -g "Complete onboarding flow"

# Run on specific browser
npx playwright test --project=chromium

# Generate new tests
npx playwright codegen http://localhost:3000
```

### Using the Test Runner Script

```bash
# Run all tests
./e2e/run-tests.sh all

# Run only web tests
./e2e/run-tests.sh web

# Run only mobile tests
./e2e/run-tests.sh mobile

# Run API tests
./e2e/run-tests.sh api

# Run performance tests
./e2e/run-tests.sh performance

# Platform-specific
./e2e/run-tests.sh mobile ios
./e2e/run-tests.sh mobile android
```

## Test Helpers

The `TestHelpers` class provides utilities for:

- **Animation Testing**: Wait for animations, check animation states
- **Gesture Simulation**: Swipe, tap, long press
- **Performance Measurement**: FPS tracking, load time metrics
- **API Mocking**: Mock responses, simulate errors
- **User State**: Login, set hearts, premium status
- **Accessibility**: Check ARIA labels, focus states
- **Network**: Simulate slow/offline conditions
- **Storage**: Clear/set localStorage data

### Example Usage

```typescript
import { test } from '@playwright/test';
import { TestHelpers } from './helpers/test-helpers';

test('premium journey', async ({ page }) => {
  const helpers = new TestHelpers(page);

  // Login
  await helpers.login();

  // Skip onboarding
  await helpers.skipOnboarding();

  // Set hearts to 0 to trigger paywall
  await helpers.setHearts(0);

  // Measure animation FPS
  const fps = await helpers.measureFPS();
  expect(fps).toBeGreaterThan(55);

  // Simulate swipe
  await helpers.swipe(element, 'right');

  // Check accessibility
  const violations = await helpers.checkAccessibility();
  expect(violations).toHaveLength(0);
});
```

## CI/CD Integration

Tests run automatically on:

- Push to main/develop branches
- Pull requests
- Daily schedule (2 AM UTC)

### GitHub Actions Workflow

The workflow includes:

1. API integration tests
2. Playwright browser tests (Chrome, Firefox, Safari)
3. Mobile browser tests
4. iOS Detox tests
5. Android Detox tests
6. Performance tests (Lighthouse)
7. Test report generation

## Performance Benchmarks

Target metrics:

- **FPS**: > 55 fps during animations
- **First Contentful Paint**: < 1.8s
- **Largest Contentful Paint**: < 2.5s
- **Total Blocking Time**: < 200ms
- **Cumulative Layout Shift**: < 0.1
- **Lighthouse Performance Score**: > 90

## Debugging Failed Tests

### Playwright

```bash
# Run with debug mode
npx playwright test --debug

# View trace
npx playwright show-trace test-results/trace.zip

# Screenshots on failure
# Automatically saved to test-results/screenshots/
```

### Detox

```bash
# Run with verbose logging
detox test --loglevel trace

# Record video
detox test --record-videos all

# Artifacts saved to artifacts/
```

## Writing New Tests

### Test Structure Template

```typescript
import { test, expect } from '@playwright/test';
import { TestHelpers } from './helpers/test-helpers';

test.describe('Feature Name', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
    await helpers.clearStorage();
    await helpers.mockAPIResponse('endpoint', mockData);
  });

  test('should do something', async ({ page }) => {
    // Arrange
    await page.goto('/');

    // Act
    await page.click('[data-testid="button"]');

    // Assert
    await expect(page.locator('[data-testid="result"]')).toBeVisible();
  });

  test.afterEach(async () => {
    await helpers.clearMocks();
  });
});
```

## Best Practices

1. **Use data-testid attributes** for reliable element selection
2. **Mock API responses** for consistent test results
3. **Clear state between tests** to avoid dependencies
4. **Use helpers** for common operations
5. **Check animations and performance** in critical flows
6. **Test accessibility** in all major screens
7. **Simulate real user behavior** with appropriate delays
8. **Take screenshots** at key points for debugging
9. **Use descriptive test names** that explain the scenario
10. **Group related tests** in describe blocks

## Troubleshooting

### Common Issues

**Tests timeout**

- Increase timeout in playwright.config.ts
- Check if dev server is running
- Verify network conditions

**Animations cause flakiness**

- Use `helpers.waitForAnimations()`
- Disable animations in CI with `prefers-reduced-motion`

**Different results locally vs CI**

- Check viewport sizes
- Verify timezone settings
- Ensure same browser versions

**Detox build fails**

- Run `cd ios && pod install`
- Clean build: `cd android && ./gradlew clean`
- Check simulator/emulator is available

## Test Data

Test data is managed in:

- `helpers/test-helpers.ts`: getTestData() method
- Mock API responses in individual tests
- Fixtures for reusable test scenarios

## Reporting

Test results are available in:

- **Console output**: Immediate feedback
- **HTML Report**: `npx playwright show-report`
- **JSON Results**: `test-results/results.json`
- **JUnit XML**: `test-results/junit.xml`
- **Screenshots**: `test-results/screenshots/`
- **Videos**: `test-results/videos/` (on failure)
- **Traces**: `test-results/traces/` (for debugging)

## Contributing

When adding new E2E tests:

1. Follow the existing test structure
2. Use helpers for common operations
3. Add appropriate data-testid attributes
4. Update this README with new coverage
5. Ensure tests pass locally before committing
6. Add to appropriate test suite in CI workflow

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Detox Documentation](https://wix.github.io/Detox/)
- [Testing Best Practices](https://testingjavascript.com)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)
