import { test, expect } from '@playwright/test';

test.describe('App Loading and White Screen Detection', () => {
  test.beforeEach(async ({ page }) => {
    // Listen for console errors
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        console.error(`Console error: ${msg.text()}`);
      }
    });

    // Listen for page errors
    page.on('pageerror', (error) => {
      console.error(`Page error: ${error.message}`);
    });
  });

  test('app should load without white screen', async ({ page }) => {
    // Navigate to the app
    await page.goto('/');

    // Wait for either the app to load or timeout
    await page.waitForLoadState('networkidle');

    // Check that the page has content (not white screen)
    const bodyContent = await page.textContent('body');
    expect(bodyContent).not.toBe('');
    expect(bodyContent).not.toBeNull();

    // Check for app title or any main content
    const hasContent = await page.locator('text=/QuizMentor|Loading/i').count();
    expect(hasContent).toBeGreaterThan(0);

    // Take a screenshot for visual verification
    await page.screenshot({ path: 'test-results/app-loaded.png' });
  });

  test('home screen should render correctly', async ({ page }) => {
    await page.goto('/');

    // Wait for the home screen to be visible
    await expect(page.locator('text=/QuizMentor/i')).toBeVisible({ timeout: 10000 });

    // Check for main UI elements
    await expect(page.locator('text=/Start Quiz|Premium|Leaderboard/i')).toBeVisible();

    // Verify no white screen by checking background color
    const backgroundColor = await page.evaluate(() => {
      return window.getComputedStyle(document.body).backgroundColor;
    });
    expect(backgroundColor).not.toBe('rgb(255, 255, 255)'); // Not pure white
  });

  test('navigation should work without breaking', async ({ page }) => {
    await page.goto('/');

    // Wait for initial load
    await page.waitForLoadState('networkidle');

    // Try to click on a navigation button if it exists
    const startButton = page.locator('text=/Start Quiz/i');
    if (await startButton.isVisible()) {
      await startButton.click();

      // Check that navigation happened
      await expect(page.locator('text=/Categories|Choose/i')).toBeVisible({ timeout: 5000 });
    }
  });

  test('should detect JavaScript errors', async ({ page }) => {
    const errors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    page.on('pageerror', (error) => {
      errors.push(error.message);
    });

    await page.goto('/');
    await page.waitForTimeout(3000); // Wait for any async errors

    // Report any errors found
    if (errors.length > 0) {
      console.error('JavaScript errors detected:', errors);
    }

    // The test passes even with errors, but logs them for debugging
    expect(errors.length).toBeLessThanOrEqual(10); // Allow some warnings but not many errors
  });

  test('should work in different browsers', async ({ page, browserName }) => {
    await page.goto('/');

    // Browser-specific checks
    if (browserName === 'firefox') {
      console.log('Testing in Firefox - checking for specific issues');
    }

    // Common check for all browsers
    await expect(page.locator('body')).not.toBeEmpty();

    // Take browser-specific screenshot
    await page.screenshot({
      path: `test-results/app-loaded-${browserName}.png`,
    });
  });

  test('should handle slow network gracefully', async ({ page }) => {
    // Simulate slow network
    await page.route('**/*', (route) => {
      setTimeout(() => route.continue(), 100);
    });

    await page.goto('/');

    // Should still load within reasonable time
    await expect(page.locator('text=/QuizMentor|Loading/i')).toBeVisible({
      timeout: 30000,
    });
  });

  test('PaywallScreen should load without crashing', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Try to navigate to paywall if button exists
    const premiumButton = page.locator('text=/Premium|Upgrade/i').first();

    if (await premiumButton.isVisible()) {
      await premiumButton.click();

      // Check that paywall loads
      await expect(page.locator('text=/Unlock|Subscribe|Premium/i')).toBeVisible({
        timeout: 10000,
      });

      // Verify no white screen
      const content = await page.textContent('body');
      expect(content).toContain('Premium');
    }
  });
});

test.describe('Performance Monitoring', () => {
  test('should load within performance budget', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const loadTime = Date.now() - startTime;

    console.log(`Page load time: ${loadTime}ms`);

    // Should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });

  test('should not have memory leaks on navigation', async ({ page }) => {
    await page.goto('/');

    // Get initial memory usage if available
    const initialMemory = await page.evaluate(() => {
      if ('memory' in performance) {
        return (performance as any).memory.usedJSHeapSize;
      }
      return null;
    });

    // Navigate around the app
    for (let i = 0; i < 5; i++) {
      const buttons = await page.locator('button, [role="button"]').all();
      if (buttons.length > 0) {
        await buttons[0].click();
        await page.waitForTimeout(500);
        await page.goBack();
        await page.waitForTimeout(500);
      }
    }

    // Check memory again
    const finalMemory = await page.evaluate(() => {
      if ('memory' in performance) {
        return (performance as any).memory.usedJSHeapSize;
      }
      return null;
    });

    if (initialMemory && finalMemory) {
      const memoryIncrease = finalMemory - initialMemory;
      console.log(`Memory increase: ${memoryIncrease / 1024 / 1024}MB`);

      // Memory shouldn't increase by more than 50MB
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
    }
  });
});
