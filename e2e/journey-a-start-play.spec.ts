import { test, expect, Page } from '@playwright/test';

/**
 * Journey A: Start & Play - Mock-First E2E Tests
 *
 * Tests US-003 through US-008 and US-032 with comprehensive mock validation
 * These tests validate our mock infrastructure before real backend implementation
 */

// Helper to setup MSW mocks
async function setupMocks(page: Page) {
  // Ensure MSW is active
  await page.addInitScript(() => {
    window.localStorage.setItem('USE_MOCKS', 'true');
    window.localStorage.setItem('EXPO_PUBLIC_USE_MSW', 'true');
  });
}

// Helper to validate mock responses
async function validateMockResponse(page: Page, endpoint: string) {
  const response = await page.waitForResponse((resp) => resp.url().includes(endpoint), {
    timeout: 5000,
  });
  expect(response.status()).toBe(200);
  return response.json();
}

test.describe('Journey A: Start & Play (Mock-First)', () => {
  test.beforeEach(async ({ page }) => {
    await setupMocks(page);
  });

  test('US-003: Select Category and Difficulty with Mock Data', async ({ page }) => {
    await page.goto('/');

    // Wait for categories to load from mock
    await expect(page.getByTestId('category-grid')).toBeVisible();

    // Validate mock categories endpoint
    const categoriesPromise = page.waitForResponse('**/api/categories');
    await page.getByTestId('refresh-categories').click();
    const response = await categoriesPromise;
    const categories = await response.json();

    // Verify mock data structure
    expect(categories).toHaveProperty('data');
    expect(Array.isArray(categories.data)).toBe(true);
    expect(categories.data[0]).toHaveProperty('id');
    expect(categories.data[0]).toHaveProperty('name');
    expect(categories.data[0]).toHaveProperty('difficulty_levels');

    // Select JavaScript category
    await page.getByTestId('category-javascript').click();
    await expect(page.getByTestId('difficulty-selector')).toBeVisible();

    // Select medium difficulty
    await page.getByTestId('difficulty-medium').click();

    // Verify selection state in URL
    await expect(page).toHaveURL(/category=javascript/);
    await expect(page).toHaveURL(/difficulty=medium/);
  });

  test('US-004: Start Timed Quiz with Mock Timer Service', async ({ page }) => {
    await page.goto('/quiz?category=javascript&difficulty=medium');

    // Select timed mode
    await page.getByTestId('quiz-mode-timed').click();

    // Set timer duration
    await page.getByTestId('timer-duration-input').fill('60');

    // Start quiz
    const quizStartPromise = page.waitForResponse('**/api/quiz/start');
    await page.getByTestId('start-quiz-button').click();

    // Validate mock quiz start response
    const startResponse = await quizStartPromise;
    const quizSession = await startResponse.json();
    expect(quizSession).toHaveProperty('session_id');
    expect(quizSession).toHaveProperty('timer_seconds', 60);
    expect(quizSession).toHaveProperty('questions');

    // Verify timer is visible and counting
    const timer = page.getByTestId('timer-remaining');
    await expect(timer).toBeVisible();
    const initialTime = await timer.textContent();
    expect(initialTime).toMatch(/^[0-5]?[0-9]:[0-5][0-9]$/);

    // Wait and verify timer decrements
    await page.waitForTimeout(2000);
    const updatedTime = await timer.textContent();
    expect(updatedTime).not.toBe(initialTime);
  });

  test('US-005: Answer Question with Mock Validation', async ({ page }) => {
    await page.goto('/quiz?skipIntro=1&category=javascript');

    // Wait for question to load
    await expect(page.getByTestId('question-card')).toBeVisible();
    const questionText = await page.getByTestId('question-text').textContent();

    // Get answer options
    const options = await page.getByTestId(/^answer-option-/).all();
    expect(options.length).toBeGreaterThan(0);

    // Click first answer
    const answerPromise = page.waitForResponse('**/api/quiz/answer');
    await options[0].click();

    // Validate mock answer submission
    const answerResponse = await answerPromise;
    const result = await answerResponse.json();
    expect(result).toHaveProperty('correct');
    expect(result).toHaveProperty('explanation');
    expect(result).toHaveProperty('xp_earned');

    // Verify UI updates based on mock response
    if (result.correct) {
      await expect(page.getByTestId('correct-indicator')).toBeVisible();
    } else {
      await expect(page.getByTestId('incorrect-indicator')).toBeVisible();
    }
  });

  test('US-006: Show Explanation with Mock Content', async ({ page }) => {
    await page.goto('/quiz?skipIntro=1&category=javascript');

    // Answer a question
    const answerPromise = page.waitForResponse('**/api/quiz/answer');
    await page.getByTestId('answer-option-0').click();
    const response = await answerPromise;
    const result = await response.json();

    // Verify explanation appears
    await expect(page.getByTestId('explanation-card')).toBeVisible();
    const explanationText = await page.getByTestId('explanation-text').textContent();

    // Validate explanation matches mock response
    expect(explanationText).toContain(result.explanation);

    // Check for additional learning resources if provided
    if (result.resources) {
      await expect(page.getByTestId('learning-resources')).toBeVisible();
    }
  });

  test('US-008: Progress Tracking with Mock State', async ({ page }) => {
    await page.goto('/quiz?skipIntro=1&category=javascript');

    // Check initial progress
    const progressBar = page.getByTestId('progress-bar');
    const counter = page.getByTestId('question-counter');

    await expect(progressBar).toBeVisible();
    await expect(counter).toHaveText('1 / 10'); // Assuming mock returns 10 questions

    // Answer questions and track progress
    for (let i = 1; i <= 3; i++) {
      // Submit answer
      const answerPromise = page.waitForResponse('**/api/quiz/answer');
      await page.getByTestId('answer-option-0').click();
      await answerPromise;

      // Wait for next question or results
      if (i < 3) {
        await expect(counter).toHaveText(`${i + 1} / 10`, { timeout: 5000 });

        // Verify progress bar updates
        const progressValue = await progressBar.getAttribute('aria-valuenow');
        expect(Number(progressValue)).toBe((i + 1) * 10);
      }
    }
  });

  test('US-032: Keyboard Navigation with Mock Interactions', async ({ page }) => {
    await page.goto('/quiz?skipIntro=1&category=javascript');

    // Test Tab navigation through options
    await page.keyboard.press('Tab');
    await expect(page.getByTestId('answer-option-0')).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(page.getByTestId('answer-option-1')).toBeFocused();

    // Test arrow key navigation
    await page.keyboard.press('ArrowDown');
    await expect(page.getByTestId('answer-option-2')).toBeFocused();

    await page.keyboard.press('ArrowUp');
    await expect(page.getByTestId('answer-option-1')).toBeFocused();

    // Select with Enter key
    const answerPromise = page.waitForResponse('**/api/quiz/answer');
    await page.keyboard.press('Enter');
    await answerPromise;

    // Verify selection was processed
    await expect(page.getByTestId('explanation-card')).toBeVisible();

    // Test Escape key to close explanation
    await page.keyboard.press('Escape');
    await expect(page.getByTestId('explanation-card')).not.toBeVisible();
  });

  test('Mock Service Failover: Category Loading Error', async ({ page }) => {
    // Setup mock to fail
    await page.route('**/api/categories', (route) => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Internal Server Error' }),
      });
    });

    await page.goto('/');

    // Should show error state
    await expect(page.getByTestId('categories-error')).toBeVisible();

    // Should show retry button
    await expect(page.getByTestId('retry-categories')).toBeVisible();

    // Fix the mock and retry
    await page.unroute('**/api/categories');
    await page.getByTestId('retry-categories').click();

    // Categories should now load
    await expect(page.getByTestId('category-grid')).toBeVisible();
  });

  test('Mock Service Performance: Validate Response Times', async ({ page }) => {
    const timings: number[] = [];

    // Monitor API response times
    page.on('response', (response) => {
      if (response.url().includes('/api/')) {
        timings.push(response.timing().responseEnd - response.timing().requestStart);
      }
    });

    await page.goto('/quiz?skipIntro=1&category=javascript');

    // Perform several interactions
    for (let i = 0; i < 3; i++) {
      await page.getByTestId('answer-option-0').click();
      await page.waitForTimeout(500);
    }

    // All mock responses should be fast
    expect(timings.length).toBeGreaterThan(0);
    timings.forEach((timing) => {
      expect(timing).toBeLessThan(100); // Mock responses should be < 100ms
    });
  });

  test('Mock Data Consistency: Session State Validation', async ({ page }) => {
    await page.goto('/quiz?skipIntro=1&category=javascript');

    // Get initial session
    const sessionResponse = await page.evaluate(() =>
      fetch('/api/quiz/session').then((r) => r.json()),
    );

    const sessionId = sessionResponse.session_id;
    expect(sessionId).toBeTruthy();

    // Answer a question
    await page.getByTestId('answer-option-0').click();

    // Verify session persists
    const updatedSession = await page.evaluate(() =>
      fetch('/api/quiz/session').then((r) => r.json()),
    );

    expect(updatedSession.session_id).toBe(sessionId);
    expect(updatedSession.answers_submitted).toBe(1);
  });
});

test.describe('Journey A: Mock-to-Real Migration Tests', () => {
  const USE_REAL_API = process.env.USE_REAL_API === 'true';

  test.beforeEach(async ({ page }) => {
    if (!USE_REAL_API) {
      await setupMocks(page);
    } else {
      // Setup real API auth if needed
      await page.addInitScript(() => {
        window.localStorage.setItem('SUPABASE_TOKEN', process.env.TEST_TOKEN || '');
      });
    }
  });

  test('Migration Test: Categories API', async ({ page }) => {
    await page.goto('/');

    const response = await page.waitForResponse('**/api/categories');
    const categories = await response.json();

    // Same assertions work for both mock and real
    expect(categories).toHaveProperty('data');
    expect(Array.isArray(categories.data)).toBe(true);
    expect(categories.data.length).toBeGreaterThan(0);

    // Log which service was used
    console.log(`Categories loaded from: ${USE_REAL_API ? 'Real API' : 'Mock Service'}`);
  });

  test('Migration Test: Quiz Flow', async ({ page }) => {
    await page.goto('/quiz?skipIntro=1&category=javascript');

    // Start quiz
    const startResponse = await page.waitForResponse('**/api/quiz/start');
    expect(startResponse.status()).toBe(200);

    // Answer question
    await page.getByTestId('answer-option-0').click();
    const answerResponse = await page.waitForResponse('**/api/quiz/answer');
    expect(answerResponse.status()).toBe(200);

    // Complete quiz
    for (let i = 0; i < 2; i++) {
      await page.getByTestId('answer-option-0').click();
      await page.waitForTimeout(500);
    }

    // Check results
    await expect(page.getByTestId('results-screen')).toBeVisible({ timeout: 10000 });

    console.log(`Quiz completed using: ${USE_REAL_API ? 'Real API' : 'Mock Service'}`);
  });
});
