import { test, expect } from '@playwright/test';

// This test assumes the app is running in web mode with all mocks enabled:
//   EXPO_PUBLIC_USE_ALL_MOCKS=1 npx expo start --web
// and that PLAYWRIGHT navigates to the served URL (set via baseURL or use page.goto)

test.describe('All-mocks login and quiz', () => {
  test('Demo login → start quiz → see first question', async ({ page }) => {
    // If baseURL is provided in Playwright config, use relative path
    await page.goto('/');

    // On first run, onboarding may show "Get Started" or account path.
    // We accept either: try to click "I have an account" or proceed.
    const haveAccount = page.locator('text=I have an account');
    if (await haveAccount.count()) {
      await haveAccount.click();
    }

    // AuthChoice: click Demo Login (button labeled as such in AuthChoiceEpic)
    const demoBtn = page.getByText('Demo');
    if (await demoBtn.count()) {
      await demoBtn.click();
    } else {
      // Fallback: if "Demo" text isn't present, try a generic login button
      const altDemo = page.locator('text=Demo Login, text=Try Demo').first();
      if (await altDemo.count()) {
        await altDemo.click();
      }
    }

    // Expect home-hero content
    await expect(page.getByText('Level Up Your Skills')).toBeVisible();

    // Start learning
    const startBtn = page.getByText('Start Learning').first();
    await startBtn.click();

    // Verify first question appears
    await expect(page.getByText('Explanation').first()).not.toBeVisible();
    // We just check for a question card existence
    const questionText = page.locator('text=Question').first();
    await expect(questionText).toBeVisible();
  });
});
