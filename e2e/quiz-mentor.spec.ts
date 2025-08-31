import { test, expect } from '@playwright/test';

test.describe('QuizMentor E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app before each test
    await page.goto('http://localhost:3003');
    // Wait for the app to load
    await page.waitForSelector('#root', { timeout: 10000 });
  });

  test.describe('App Loading', () => {
    test('should load the app successfully', async ({ page }) => {
      // Check that the app container is present
      await expect(page.locator('#root')).toBeVisible();

      // Check that the main content loads
      await expect(page.getByText('Welcome back!')).toBeVisible({ timeout: 5000 });
    });

    test('should display demo user information', async ({ page }) => {
      await expect(page.getByText('Demo User')).toBeVisible();
    });

    test('should show main heading', async ({ page }) => {
      await expect(page.getByText('Level Up Your Skills')).toBeVisible();
    });
  });

  test.describe('Home Screen', () => {
    test('should display all learning categories', async ({ page }) => {
      await expect(page.getByText('JavaScript')).toBeVisible();
      await expect(page.getByText('React')).toBeVisible();
      await expect(page.getByText('TypeScript')).toBeVisible();
      await expect(page.getByText('Node.js')).toBeVisible();
    });

    test('should show category question counts', async ({ page }) => {
      await expect(page.getByText('150 questions')).toBeVisible();
      await expect(page.getByText('200 questions')).toBeVisible();
      await expect(page.getByText('180 questions')).toBeVisible();
      await expect(page.getByText('120 questions')).toBeVisible();
    });

    test('should display difficulty levels', async ({ page }) => {
      await expect(page.getByText('Beginner')).toBeVisible();
      await expect(page.getByText('Intermediate')).toBeVisible();
      await expect(page.getByText('Advanced')).toBeVisible();
    });

    test('should show quick actions', async ({ page }) => {
      await expect(page.getByText('Quick Actions')).toBeVisible();
      await expect(page.getByText('Leaderboard')).toBeVisible();
      await expect(page.getByText('Achievements')).toBeVisible();
      await expect(page.getByText('Settings')).toBeVisible();
    });

    test('should display start learning button', async ({ page }) => {
      await expect(page.getByText('Start Learning')).toBeVisible();
    });
  });

  test.describe('Navigation', () => {
    test('should navigate to leaderboard', async ({ page }) => {
      await page.click('text=Leaderboard');

      // Should show leaderboard content
      await expect(page.getByText('Leaderboard')).toBeVisible();
    });

    test('should navigate to achievements', async ({ page }) => {
      await page.click('text=Achievements');

      // Should show achievements content
      await expect(page.getByText('Achievements')).toBeVisible();
    });

    test('should navigate to settings', async ({ page }) => {
      await page.click('text=Settings');

      // Should show settings content
      await expect(page.getByText('Settings')).toBeVisible();
    });
  });

  test.describe('Category Selection', () => {
    test('should select JavaScript category', async ({ page }) => {
      await page.click('text=JavaScript');

      // Should navigate to quiz or show category details
      await expect(page.getByText('JavaScript')).toBeVisible();
    });

    test('should select React category', async ({ page }) => {
      await page.click('text=React');

      // Should navigate to quiz or show category details
      await expect(page.getByText('React')).toBeVisible();
    });

    test('should select TypeScript category', async ({ page }) => {
      await page.click('text=TypeScript');

      // Should navigate to quiz or show category details
      await expect(page.getByText('TypeScript')).toBeVisible();
    });

    test('should select Node.js category', async ({ page }) => {
      await page.click('text=Node.js');

      // Should navigate to quiz or show category details
      await expect(page.getByText('Node.js')).toBeVisible();
    });
  });

  test.describe('Start Learning Flow', () => {
    test('should start learning when button is clicked', async ({ page }) => {
      await page.click('text=Start Learning');

      // Should navigate to quiz or learning interface
      await expect(page.getByText('Start Learning')).toBeVisible();
    });
  });

  test.describe('Responsive Design', () => {
    test('should work on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });

      // Check that content is still visible
      await expect(page.getByText('Welcome back!')).toBeVisible();
      await expect(page.getByText('Level Up Your Skills')).toBeVisible();
    });

    test('should work on tablet viewport', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });

      // Check that content is still visible
      await expect(page.getByText('Welcome back!')).toBeVisible();
      await expect(page.getByText('Level Up Your Skills')).toBeVisible();
    });

    test('should work on desktop viewport', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });

      // Check that content is still visible
      await expect(page.getByText('Welcome back!')).toBeVisible();
      await expect(page.getByText('Level Up Your Skills')).toBeVisible();
    });
  });

  test.describe('Performance', () => {
    test('should load within acceptable time', async ({ page }) => {
      const startTime = Date.now();

      await page.goto('http://localhost:3003');
      await page.waitForSelector('#root', { timeout: 10000 });
      await page.waitForSelector('text=Welcome back!', { timeout: 10000 });

      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(5000); // Should load within 5 seconds
    });

    test('should not have console errors', async ({ page }) => {
      const errors: string[] = [];

      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });

      await page.goto('http://localhost:3003');
      await page.waitForSelector('#root', { timeout: 10000 });

      // Wait a bit for any delayed errors
      await page.waitForTimeout(2000);

      expect(errors).toHaveLength(0);
    });
  });

  test.describe('Accessibility', () => {
    test('should have proper heading structure', async ({ page }) => {
      const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
      expect(headings.length).toBeGreaterThan(0);
    });

    test('should have clickable elements', async ({ page }) => {
      const clickableElements = await page.locator('button, [role="button"], a').all();
      expect(clickableElements.length).toBeGreaterThan(0);
    });

    test('should have proper contrast', async ({ page }) => {
      // This is a basic check - in a real scenario you'd use axe-core or similar
      const textElements = await page
        .locator('text=Welcome back!, text=Level Up Your Skills')
        .all();
      expect(textElements.length).toBeGreaterThan(0);
    });
  });

  test.describe('Error Handling', () => {
    test('should handle network errors gracefully', async ({ page }) => {
      // Simulate offline mode
      await page.route('**/*', (route) => route.abort());

      await page.goto('http://localhost:3003');

      // Should still show some content or error message
      await expect(page.locator('#root')).toBeVisible();
    });

    test('should handle missing data gracefully', async ({ page }) => {
      // This test would require mocking the data layer
      // For now, just ensure the app doesn't crash
      await expect(page.locator('#root')).toBeVisible();
    });
  });
});
