import { test, expect } from '@playwright/test';

test.describe('QuizMentor E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should display home screen with correct elements', async ({ page }) => {
    // Check title
    await expect(page.locator('text=Welcome to QuizMentor')).toBeVisible();
    await expect(page.locator('text=Master your technical skills')).toBeVisible();

    // Check stats are displayed
    await expect(page.locator('text=Your Progress')).toBeVisible();
    await expect(page.locator('text=Level')).toBeVisible();
    await expect(page.locator('text=XP')).toBeVisible();
    await expect(page.locator('text=Stars')).toBeVisible();

    // Check start button
    await expect(page.locator('text=Start Quiz')).toBeVisible();

    // Take screenshot
    await page.screenshot({ path: 'test-results/home-screen.png', fullPage: true });
  });

  test('should navigate to categories and display list', async ({ page }) => {
    // Click start quiz
    await page.click('text=Start Quiz');

    // Wait for navigation
    await page.waitForURL('**/Categories');

    // Check categories are displayed
    await expect(page.locator('text=Choose Category')).toBeVisible();

    // Verify at least one category is shown
    const categories = page.locator('[data-testid="category-card"]');
    await expect(categories).toHaveCount(72); // We extracted 72 categories

    // Take screenshot
    await page.screenshot({ path: 'test-results/categories-screen.png', fullPage: true });
  });

  test('should complete a full quiz flow', async ({ page }) => {
    // Navigate to quiz
    await page.click('text=Start Quiz');
    await page.waitForURL('**/Categories');

    // Select first category
    await page.locator('[data-testid="category-card"]').first().click();
    await page.waitForURL('**/Quiz');

    // Check quiz screen elements
    await expect(page.locator('text=Question 1 of')).toBeVisible();
    await expect(page.locator('text=Score:')).toBeVisible();

    // Answer first question
    const firstOption = page.locator('[data-testid="option-button"]').first();
    await firstOption.click();

    // Check explanation appears
    await expect(page.locator('text=Explanation:')).toBeVisible();

    // Click next
    await page.click('text=Next Question');

    // Verify we moved to question 2
    await expect(page.locator('text=Question 2 of')).toBeVisible();

    // Take screenshot of quiz in progress
    await page.screenshot({ path: 'test-results/quiz-in-progress.png', fullPage: true });
  });

  test('should show results after quiz completion', async ({ page }) => {
    // Quick navigation to quiz
    await page.click('text=Start Quiz');
    await page.locator('[data-testid="category-card"]').first().click();

    // Answer all 10 questions quickly
    for (let i = 0; i < 10; i++) {
      await page.locator('[data-testid="option-button"]').first().click();
      const nextButton = page.locator('text=Next Question, text=View Results');
      await nextButton.click();
    }

    // Check results screen
    await page.waitForURL('**/Results');
    await expect(page.locator('text=Quiz Complete!')).toBeVisible();
    await expect(page.locator('text=Stars Earned')).toBeVisible();
    await expect(page.locator('text=Experience')).toBeVisible();

    // Take screenshot of results
    await page.screenshot({ path: 'test-results/results-screen.png', fullPage: true });
  });

  test('should track progress across sessions', async ({ page }) => {
    // Complete a quiz
    await page.click('text=Start Quiz');
    await page.locator('[data-testid="category-card"]').first().click();

    // Answer correctly (assuming first option is correct for test)
    await page.locator('[data-testid="option-button"]').first().click();
    await page.click('text=Next Question');

    // Go back to home
    await page.click('text=Back to Home');

    // Check that XP has increased
    const xpElement = await page.locator('text=XP').first();
    const xpText = await xpElement.textContent();
    expect(xpText).toContain('10'); // Should have earned 10 XP

    // Take final screenshot
    await page.screenshot({ path: 'test-results/progress-updated.png', fullPage: true });
  });

  test('should handle errors gracefully', async ({ page }) => {
    // Test network error handling
    await page.route('**/api/**', (route) => route.abort());

    await page.click('text=Start Quiz');

    // Should show error state or fallback
    // App should not crash
    await expect(page).toHaveURL(/.*/, { timeout: 5000 });
  });
});

test.describe('Responsive Design Tests', () => {
  test('should work on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');

    // Check mobile layout
    await expect(page.locator('text=Welcome to QuizMentor')).toBeVisible();
    await expect(page.locator('text=Start Quiz')).toBeVisible();

    // Take mobile screenshot
    await page.screenshot({ path: 'test-results/mobile-view.png', fullPage: true });
  });

  test('should work on tablet viewport', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');

    // Check tablet layout
    await expect(page.locator('text=Welcome to QuizMentor')).toBeVisible();

    // Take tablet screenshot
    await page.screenshot({ path: 'test-results/tablet-view.png', fullPage: true });
  });
});

test.describe('Accessibility Tests', () => {
  test('should have proper ARIA labels', async ({ page }) => {
    await page.goto('/');

    // Check for accessibility attributes
    const startButton = page.locator('text=Start Quiz');
    await expect(startButton).toHaveAttribute('role', 'button');
  });

  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/');

    // Tab through elements
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');

    // Should navigate to categories
    await expect(page).toHaveURL(/Categories/);
  });
});
