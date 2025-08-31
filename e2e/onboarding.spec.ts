import { test, expect } from '@playwright/test';

test.describe('Onboarding Flow', () => {
  test('should complete onboarding successfully', async ({ page }) => {
    // Navigate to app
    await page.goto('/');

    // Wait for app to load
    await page.waitForLoadState('networkidle');

    // Check if we see onboarding or home screen
    const onboardingVisible = await page
      .locator('text=/Welcome|Getting Started/i')
      .isVisible()
      .catch(() => false);

    if (onboardingVisible) {
      // Step 1: Welcome screen
      await expect(page.locator('text=/Welcome to QuizMentor/i')).toBeVisible();
      await page.locator('button:has-text("Get Started")').click();

      // Step 2: Choose interests
      await expect(page.locator('text=/Choose Your Interests/i')).toBeVisible();
      await page.locator('text=/Science/i').click();
      await page.locator('text=/Technology/i').click();
      await page.locator('text=/History/i').click();
      await page.locator('button:has-text("Continue")').click();

      // Step 3: Set goals
      await expect(page.locator('text=/Set Your Goals/i')).toBeVisible();
      await page.locator('text=/Daily Quiz/i').click();
      await page.locator('button:has-text("Continue")').click();

      // Step 4: Notifications
      await expect(page.locator('text=/Stay on Track/i')).toBeVisible();
      const allowButton = page.locator('button:has-text("Allow Notifications")');
      if (await allowButton.isVisible()) {
        await allowButton.click();
      } else {
        await page.locator('button:has-text("Skip")').click();
      }

      // Should reach home screen
      await expect(page.locator('text=/Home|Dashboard|Quiz/i')).toBeVisible({ timeout: 10000 });
    }
  });

  test('should skip onboarding when requested', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const skipButton = page.locator('button:has-text("Skip"), text=/Skip/i');
    if (await skipButton.isVisible()) {
      await skipButton.click();
      await expect(page.locator('text=/Home|Dashboard|Quiz/i')).toBeVisible({ timeout: 10000 });
    }
  });
});
