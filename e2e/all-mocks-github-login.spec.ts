import { test, expect } from '@playwright/test';

// Assumes web app running with EXPO_PUBLIC_USE_ALL_MOCKS=1

test.describe('All-mocks GitHub login flow', () => {
  test('GitHub button → Home → Start Learning', async ({ page }) => {
    await page.goto('/');

    const haveAccount = page.locator('text=I have an account');
    if (await haveAccount.count()) await haveAccount.click();

    // Click Continue with GitHub
    await page.getByText('Continue with GitHub').first().click();

    // Expect to land on Home after mock auth
    await expect(page.getByText('Level Up Your Skills')).toBeVisible();

    // Start learning
    await page.getByText('Start Learning').first().click();
    await expect(page.locator('text=Question').first()).toBeVisible();
  });
});
