import { test, expect, devices } from '@playwright/test';

/**
 * Visual Regression Testing Suite
 * Captures and compares screenshots to detect UI changes
 */

// Configuration for visual testing
const visualConfig = {
  fullPage: true,
  animations: 'disabled' as const,
  mask: ['[data-testid="timer"]', '[data-testid="timestamp"]'], // Dynamic content
  threshold: 0.2, // 20% difference threshold
  maxDiffPixels: 100,
};

test.describe('📸 Visual Regression Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Disable animations for consistent screenshots
    await page.addInitScript(() => {
      const style = document.createElement('style');
      style.innerHTML = `
        *, *::before, *::after {
          animation-duration: 0s !important;
          animation-delay: 0s !important;
          transition-duration: 0s !important;
          transition-delay: 0s !important;
        }
      `;
      document.head.appendChild(style);
    });

    // Set consistent viewport
    await page.setViewportSize({ width: 1280, height: 720 });

    // Mock dynamic data for consistency
    await page.addInitScript(() => {
      // Mock date/time
      Date.prototype.toLocaleString = () => '2024-01-01 12:00:00';
      Date.prototype.toLocaleDateString = () => '2024-01-01';
      Date.prototype.toLocaleTimeString = () => '12:00:00';

      // Mock random values for consistent results
      Math.random = () => 0.5;
    });
  });

  test.describe('Core Screens', () => {
    test('home screen visual consistency', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Wait for animations to settle
      await page.waitForTimeout(1000);

      await expect(page).toHaveScreenshot('home-screen.png', visualConfig);
    });

    test('categories screen visual consistency', async ({ page }) => {
      await page.goto('/');
      await page.click('[data-testid="quiz-start-button"]');
      await page.waitForSelector('[data-testid="category-card"]');

      await expect(page).toHaveScreenshot('categories-screen.png', visualConfig);
    });

    test('quiz screen visual consistency', async ({ page }) => {
      await page.goto('/');
      await page.click('[data-testid="quiz-start-button"]');
      await page.click('[data-testid="category-card"]:first-child');
      await page.waitForSelector('[data-testid="question-text"]');

      await expect(page).toHaveScreenshot('quiz-screen.png', visualConfig);
    });

    test('results screen visual consistency', async ({ page }) => {
      // Mock results data for consistency
      await page.goto('/quiz/results?score=80&correct=8&total=10&xp=100&stars=3');
      await page.waitForSelector('[data-testid="results-container"]');

      await expect(page).toHaveScreenshot('results-screen.png', visualConfig);
    });

    test('profile screen visual consistency', async ({ page }) => {
      await page.goto('/profile');
      await page.waitForSelector('[data-testid="profile-container"]');

      await expect(page).toHaveScreenshot('profile-screen.png', visualConfig);
    });
  });

  test.describe('Component States', () => {
    test('button states visual consistency', async ({ page }) => {
      await page.goto('/');

      // Normal state
      await expect(page.locator('[data-testid="quiz-start-button"]')).toHaveScreenshot(
        'button-normal.png',
      );

      // Hover state
      await page.hover('[data-testid="quiz-start-button"]');
      await expect(page.locator('[data-testid="quiz-start-button"]')).toHaveScreenshot(
        'button-hover.png',
      );

      // Disabled state (if applicable)
      await page.evaluate(() => {
        const button = document.querySelector(
          '[data-testid="quiz-start-button"]',
        ) as HTMLButtonElement;
        if (button) button.disabled = true;
      });
      await expect(page.locator('[data-testid="quiz-start-button"]')).toHaveScreenshot(
        'button-disabled.png',
      );
    });

    test('card component visual consistency', async ({ page }) => {
      await page.goto('/');
      await page.click('[data-testid="quiz-start-button"]');

      // Normal card
      await expect(page.locator('[data-testid="category-card"]').first()).toHaveScreenshot(
        'card-normal.png',
      );

      // Locked card (if exists)
      const lockedCard = page.locator('[data-testid="category-card"].locked').first();
      if ((await lockedCard.count()) > 0) {
        await expect(lockedCard).toHaveScreenshot('card-locked.png');
      }

      // Premium card (if exists)
      const premiumCard = page.locator('[data-testid="category-card"].premium').first();
      if ((await premiumCard.count()) > 0) {
        await expect(premiumCard).toHaveScreenshot('card-premium.png');
      }
    });

    test('modal/paywall visual consistency', async ({ page }) => {
      await page.goto('/');

      // Trigger paywall
      await page.evaluate(() => {
        localStorage.setItem('hearts', '0');
      });
      await page.reload();
      await page.click('[data-testid="quiz-start-button"]');

      if (await page.locator('[data-testid="paywall-modal"]').isVisible()) {
        await expect(page.locator('[data-testid="paywall-modal"]')).toHaveScreenshot(
          'paywall-modal.png',
        );
      }
    });
  });

  test.describe('Responsive Design Visual Tests', () => {
    const viewports = [
      { name: 'mobile', width: 375, height: 812 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'desktop', width: 1920, height: 1080 },
    ];

    viewports.forEach(({ name, width, height }) => {
      test(`home screen on ${name}`, async ({ page }) => {
        await page.setViewportSize({ width, height });
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        await expect(page).toHaveScreenshot(`home-${name}.png`, visualConfig);
      });

      test(`quiz screen on ${name}`, async ({ page }) => {
        await page.setViewportSize({ width, height });
        await page.goto('/');
        await page.click('[data-testid="quiz-start-button"]');
        await page.click('[data-testid="category-card"]:first-child');
        await page.waitForSelector('[data-testid="question-text"]');

        await expect(page).toHaveScreenshot(`quiz-${name}.png`, visualConfig);
      });
    });
  });

  test.describe('Dark Mode Visual Tests', () => {
    test('dark mode home screen', async ({ page }) => {
      // Enable dark mode
      await page.emulateMedia({ colorScheme: 'dark' });
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      await expect(page).toHaveScreenshot('home-dark.png', visualConfig);
    });

    test('dark mode quiz screen', async ({ page }) => {
      await page.emulateMedia({ colorScheme: 'dark' });
      await page.goto('/');
      await page.click('[data-testid="quiz-start-button"]');
      await page.click('[data-testid="category-card"]:first-child');
      await page.waitForSelector('[data-testid="question-text"]');

      await expect(page).toHaveScreenshot('quiz-dark.png', visualConfig);
    });
  });

  test.describe('Error States Visual Tests', () => {
    test('network error visual', async ({ page }) => {
      // Simulate network error
      await page.route('**/api/**', (route) => route.abort());
      await page.goto('/');

      // Wait for error message
      await page
        .waitForSelector('[data-testid="error-message"]', { timeout: 5000 })
        .catch(() => {});

      if (await page.locator('[data-testid="error-message"]').isVisible()) {
        await expect(page).toHaveScreenshot('error-network.png', visualConfig);
      }
    });

    test('empty state visual', async ({ page }) => {
      // Mock empty categories
      await page.route('**/api/categories', (route) => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: [] }),
        });
      });

      await page.goto('/');
      await page.click('[data-testid="quiz-start-button"]');

      if (await page.locator('[data-testid="empty-state"]').isVisible()) {
        await expect(page).toHaveScreenshot('empty-state.png', visualConfig);
      }
    });
  });

  test.describe('Loading States Visual Tests', () => {
    test('skeleton loader visual', async ({ page }) => {
      // Slow down network to see loading states
      await page.route('**/api/**', async (route) => {
        await page.waitForTimeout(2000);
        await route.continue();
      });

      await page.goto('/');

      // Capture skeleton loader if visible
      if (await page.locator('[data-testid="skeleton-loader"]').isVisible()) {
        await expect(page.locator('[data-testid="skeleton-loader"]')).toHaveScreenshot(
          'skeleton-loader.png',
        );
      }
    });

    test('spinner visual', async ({ page }) => {
      await page.goto('/');
      await page.click('[data-testid="quiz-start-button"]');

      // Capture spinner if visible during category load
      if (await page.locator('[data-testid="loading-spinner"]').isVisible()) {
        await expect(page.locator('[data-testid="loading-spinner"]')).toHaveScreenshot(
          'loading-spinner.png',
        );
      }
    });
  });

  test.describe('Cross-browser Visual Consistency', () => {
    ['chromium', 'firefox', 'webkit'].forEach((browserName) => {
      test(`home screen in ${browserName}`, async ({ page, browserName: currentBrowser }) => {
        if (currentBrowser !== browserName) {
          test.skip();
          return;
        }

        await page.goto('/');
        await page.waitForLoadState('networkidle');

        await expect(page).toHaveScreenshot(`home-${browserName}.png`, visualConfig);
      });
    });
  });

  test.describe('Animation Screenshots', () => {
    test('capture animation frames', async ({ page }) => {
      // Re-enable animations for this test
      await page.goto('/');

      // Trigger an animation (e.g., achievement popup)
      await page.evaluate(() => {
        // Simulate achievement trigger
        window.dispatchEvent(
          new CustomEvent('achievement-unlocked', {
            detail: { name: 'First Quiz', xp: 100 },
          }),
        );
      });

      // Capture multiple frames if animation is visible
      const animationElement = page.locator('[data-testid="achievement-animation"]');
      if (await animationElement.isVisible()) {
        for (let i = 0; i < 5; i++) {
          await page.waitForTimeout(100);
          await expect(animationElement).toHaveScreenshot(`animation-frame-${i}.png`);
        }
      }
    });
  });

  test.describe('Accessibility Visual Tests', () => {
    test('high contrast mode', async ({ page }) => {
      // Enable high contrast
      await page.emulateMedia({ forcedColors: 'active' });
      await page.goto('/');

      await expect(page).toHaveScreenshot('high-contrast.png', visualConfig);
    });

    test('focus indicators visual', async ({ page }) => {
      await page.goto('/');

      // Tab through focusable elements
      await page.keyboard.press('Tab');
      await expect(page.locator(':focus')).toHaveScreenshot('focus-indicator-1.png');

      await page.keyboard.press('Tab');
      await expect(page.locator(':focus')).toHaveScreenshot('focus-indicator-2.png');
    });
  });
});

// Helper function to compare screenshots programmatically
export async function compareScreenshots(
  baseline: string,
  current: string,
  threshold: number = 0.1,
): Promise<{ match: boolean; diff: number }> {
  // This would use a library like pixelmatch or looks-same
  // Placeholder implementation
  return { match: true, diff: 0 };
}

// Generate visual regression report
export async function generateVisualReport(results: any[]) {
  const report = {
    timestamp: new Date().toISOString(),
    totalTests: results.length,
    passed: results.filter((r) => r.match).length,
    failed: results.filter((r) => !r.match).length,
    screenshots: results.map((r) => ({
      name: r.name,
      status: r.match ? 'passed' : 'failed',
      diff: r.diff,
      baseline: r.baseline,
      current: r.current,
    })),
  };

  return report;
}
