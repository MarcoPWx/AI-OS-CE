import { test, expect } from '@playwright/test';

test.describe('US-003: Quiz Selection', () => {
  test.beforeEach(async ({ page }) => {
    // Start with mocks enabled
    await page.goto('http://localhost:7007/?useMocks=true&skipIntro=1');

    // Login with demo user for consistent experience
    await page.getByTestId('auth-choice-button').click();
    await page.getByTestId('demo-login-button').click();

    // Wait for navigation to home
    await expect(page).toHaveURL(/\/home/);
  });

  test('should display available quiz categories', async ({ page }) => {
    // Check that categories are visible
    await expect(page.getByTestId('category-grid')).toBeVisible();

    // Verify at least some key categories are present
    await expect(page.getByText('JavaScript')).toBeVisible();
    await expect(page.getByText('React')).toBeVisible();
    await expect(page.getByText('TypeScript')).toBeVisible();
    await expect(page.getByText('Node.js')).toBeVisible();
  });

  test('should allow selecting difficulty level', async ({ page }) => {
    // Click on JavaScript category
    await page.getByTestId('category-javascript').click();

    // Check difficulty selector is shown
    await expect(page.getByTestId('difficulty-selector')).toBeVisible();

    // Verify difficulty options
    await expect(page.getByTestId('difficulty-beginner')).toBeVisible();
    await expect(page.getByTestId('difficulty-intermediate')).toBeVisible();
    await expect(page.getByTestId('difficulty-expert')).toBeVisible();

    // Select intermediate difficulty
    await page.getByTestId('difficulty-intermediate').click();

    // Verify selection is highlighted
    await expect(page.getByTestId('difficulty-intermediate')).toHaveClass(/selected/);
  });

  test('should show quiz details before starting', async ({ page }) => {
    // Select JavaScript category
    await page.getByTestId('category-javascript').click();

    // Select difficulty
    await page.getByTestId('difficulty-intermediate').click();

    // Check quiz details panel
    await expect(page.getByTestId('quiz-details')).toBeVisible();

    // Verify quiz information is displayed
    await expect(page.getByText(/10 Questions/)).toBeVisible();
    await expect(page.getByText(/Time Limit/)).toBeVisible();
    await expect(page.getByText(/Points Available/)).toBeVisible();
  });

  test('should start quiz after category and difficulty selection', async ({ page }) => {
    // Select category
    await page.getByTestId('category-javascript').click();

    // Select difficulty
    await page.getByTestId('difficulty-intermediate').click();

    // Click start quiz button
    await page.getByTestId('start-quiz-button').click();

    // Verify navigation to quiz screen
    await expect(page).toHaveURL(/\/quiz/);
    await expect(page.getByTestId('quiz-screen')).toBeVisible();
  });

  test('should filter categories by search', async ({ page }) => {
    // Find search input
    await expect(page.getByTestId('category-search')).toBeVisible();

    // Search for "React"
    await page.getByTestId('category-search').fill('React');

    // Verify React categories are visible
    await expect(page.getByText('React')).toBeVisible();
    await expect(page.getByText('React Native')).toBeVisible();

    // Verify other categories are hidden
    await expect(page.getByText('JavaScript')).not.toBeVisible();
    await expect(page.getByText('Node.js')).not.toBeVisible();
  });

  test('should show recent quizzes section', async ({ page }) => {
    // Check recent quizzes section exists
    await expect(page.getByTestId('recent-quizzes')).toBeVisible();

    // If user has taken quizzes before, they should be listed
    const recentItems = page.locator('[data-testid^="recent-quiz-"]');
    const count = await recentItems.count();

    if (count > 0) {
      // Verify recent quiz items have expected elements
      const firstRecent = recentItems.first();
      await expect(firstRecent.locator('[data-testid="recent-category"]')).toBeVisible();
      await expect(firstRecent.locator('[data-testid="recent-score"]')).toBeVisible();
      await expect(firstRecent.locator('[data-testid="recent-date"]')).toBeVisible();
    }
  });

  test('should show recommended quizzes based on user level', async ({ page }) => {
    // Check recommended section exists
    await expect(page.getByTestId('recommended-quizzes')).toBeVisible();

    // Verify at least one recommendation
    const recommendations = page.locator('[data-testid^="recommended-quiz-"]');
    await expect(recommendations).toHaveCount({ minimum: 1 });

    // Check recommendation has difficulty indicator
    const firstRec = recommendations.first();
    await expect(firstRec.locator('[data-testid="rec-difficulty"]')).toBeVisible();
  });

  test('should navigate back from difficulty selection', async ({ page }) => {
    // Select a category
    await page.getByTestId('category-javascript').click();

    // Difficulty selector should be visible
    await expect(page.getByTestId('difficulty-selector')).toBeVisible();

    // Click back button
    await page.getByTestId('back-button').click();

    // Should be back at category selection
    await expect(page.getByTestId('category-grid')).toBeVisible();
    await expect(page.getByTestId('difficulty-selector')).not.toBeVisible();
  });

  test('should show quiz statistics for each category', async ({ page }) => {
    // Find a category card
    const categoryCard = page.getByTestId('category-javascript');

    // Check statistics are displayed
    await expect(categoryCard.locator('[data-testid="category-stats"]')).toBeVisible();
    await expect(categoryCard.locator('[data-testid="questions-count"]')).toBeVisible();
    await expect(categoryCard.locator('[data-testid="completion-rate"]')).toBeVisible();
  });

  test('should handle quick start option', async ({ page }) => {
    // Look for quick start button
    await expect(page.getByTestId('quick-start-button')).toBeVisible();

    // Click quick start
    await page.getByTestId('quick-start-button').click();

    // Should start a quiz with default settings
    await expect(page).toHaveURL(/\/quiz/);
    await expect(page.getByTestId('quiz-screen')).toBeVisible();
  });
});
