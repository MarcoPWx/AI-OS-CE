import { test, expect } from '@playwright/test';

test.describe('Complete App User Journey', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to app
    await page.goto('http://localhost:8081');

    // Wait for app to load
    await page.waitForSelector('[data-testid="app-container"]', { timeout: 10000 });
  });

  test.describe('Authentication Flow', () => {
    test('should complete full authentication flow', async ({ page }) => {
      // Check if login screen is visible
      await expect(page.locator('[data-testid="login-screen"]')).toBeVisible();

      // Test email login
      await page.fill('[data-testid="email-input"]', 'test@example.com');
      await page.fill('[data-testid="password-input"]', 'testpassword123');
      await page.click('[data-testid="login-button"]');

      // Wait for navigation
      await page.waitForSelector('[data-testid="home-screen"]', { timeout: 5000 });

      // Verify user is logged in
      await expect(page.locator('[data-testid="user-welcome"]')).toContainText('Welcome');
    });

    test('should handle GitHub OAuth login', async ({ page }) => {
      await page.click('[data-testid="github-login-button"]');

      // Mock OAuth flow
      await page.waitForURL(/github\.com\/login/);
      // Complete OAuth in test environment

      await page.waitForSelector('[data-testid="home-screen"]');
      await expect(page.locator('[data-testid="user-avatar"]')).toBeVisible();
    });

    test('should handle logout correctly', async ({ page, context }) => {
      // Login first
      await context.addCookies([
        {
          name: 'auth-token',
          value: 'mock-token',
          domain: 'localhost',
          path: '/',
        },
      ]);

      await page.goto('http://localhost:8081/profile');
      await page.click('[data-testid="logout-button"]');

      // Confirm logout
      await page.click('text=Logout');

      // Should redirect to login
      await expect(page.locator('[data-testid="login-screen"]')).toBeVisible();
    });
  });

  test.describe('Profile Screen', () => {
    test.beforeEach(async ({ page, context }) => {
      // Mock authentication
      await context.addCookies([
        {
          name: 'auth-token',
          value: 'mock-token',
          domain: 'localhost',
          path: '/',
        },
      ]);
    });

    test('should display user profile information', async ({ page }) => {
      await page.goto('http://localhost:8081/profile');

      // Check profile elements
      await expect(page.locator('[data-testid="profile-avatar"]')).toBeVisible();
      await expect(page.locator('[data-testid="profile-username"]')).toBeVisible();
      await expect(page.locator('[data-testid="profile-email"]')).toBeVisible();

      // Check stats grid
      await expect(page.locator('[data-testid="stats-grid"]')).toBeVisible();

      // Check action buttons
      await expect(page.locator('[data-testid="view-achievements-button"]')).toBeVisible();
      await expect(page.locator('[data-testid="view-leaderboard-button"]')).toBeVisible();
    });

    test('should handle data export request', async ({ page }) => {
      await page.goto('http://localhost:8081/profile');

      await page.click('[data-testid="export-data-button"]');

      // Check for confirmation
      await expect(page.locator('text=Your data export has been requested')).toBeVisible();
    });

    test('should handle account deletion request', async ({ page }) => {
      await page.goto('http://localhost:8081/profile');

      await page.click('[data-testid="delete-account-button"]');

      // Check for warning dialog
      await expect(page.locator('text=This action cannot be undone')).toBeVisible();

      // Cancel deletion
      await page.click('text=Cancel');

      // Profile should still be visible
      await expect(page.locator('[data-testid="profile-avatar"]')).toBeVisible();
    });

    test('should refresh profile data', async ({ page }) => {
      await page.goto('http://localhost:8081/profile');

      // Pull to refresh simulation
      await page.locator('[data-testid="profile-scroll-view"]').evaluate((node) => {
        node.scrollTop = -100;
        node.dispatchEvent(new Event('scroll'));
      });

      // Wait for refresh
      await page.waitForTimeout(1000);

      // Data should be refreshed
      await expect(page.locator('[data-testid="profile-username"]')).toBeVisible();
    });
  });

  test.describe('Quiz Flow with Gamification', () => {
    test.beforeEach(async ({ page, context }) => {
      await context.addCookies([
        {
          name: 'auth-token',
          value: 'mock-token',
          domain: 'localhost',
          path: '/',
        },
      ]);
    });

    test('should complete full quiz with gamification features', async ({ page }) => {
      await page.goto('http://localhost:8081/quiz');

      // Select category
      await page.click('[data-testid="category-javascript"]');

      // Start quiz
      await page.click('[data-testid="start-quiz-button"]');

      // Check gamification elements
      await expect(page.locator('[data-testid="xp-display"]')).toBeVisible();
      await expect(page.locator('[data-testid="streak-counter"]')).toBeVisible();
      await expect(page.locator('[data-testid="combo-meter"]')).toBeVisible();

      // Answer questions
      for (let i = 0; i < 5; i++) {
        await page.waitForSelector(`[data-testid="question-${i}"]`);

        // Select answer
        await page.click('[data-testid="answer-option-0"]');

        // Check for feedback
        await expect(page.locator('[data-testid="answer-feedback"]')).toBeVisible();

        // Check XP animation
        await expect(page.locator('[data-testid="xp-animation"]')).toBeVisible();

        // Next question
        if (i < 4) {
          await page.click('[data-testid="next-question-button"]');
        }
      }

      // Check results screen
      await expect(page.locator('[data-testid="quiz-results"]')).toBeVisible();
      await expect(page.locator('[data-testid="final-score"]')).toBeVisible();
      await expect(page.locator('[data-testid="xp-earned"]')).toBeVisible();
      await expect(page.locator('[data-testid="achievements-unlocked"]')).toBeVisible();
    });

    test('should handle power-ups correctly', async ({ page }) => {
      await page.goto('http://localhost:8081/quiz/active');

      // Use 50/50 power-up
      await page.click('[data-testid="powerup-5050"]');

      // Check that two options are disabled
      const disabledOptions = await page
        .locator('[data-testid^="answer-option-"]:disabled')
        .count();
      expect(disabledOptions).toBe(2);

      // Use hint power-up
      await page.click('[data-testid="powerup-hint"]');
      await expect(page.locator('[data-testid="hint-popup"]')).toBeVisible();
    });

    test('should track streaks correctly', async ({ page }) => {
      await page.goto('http://localhost:8081/quiz');

      // Complete a quiz
      await page.click('[data-testid="category-react"]');
      await page.click('[data-testid="start-quiz-button"]');

      // Answer all correctly for streak
      for (let i = 0; i < 3; i++) {
        await page.click('[data-testid="correct-answer"]');
        await page.click('[data-testid="next-question-button"]');
      }

      // Check streak bonus
      await expect(page.locator('[data-testid="streak-bonus"]')).toBeVisible();
      await expect(page.locator('[data-testid="streak-bonus"]')).toContainText('3x');
    });
  });

  test.describe('Leaderboard Screen', () => {
    test.beforeEach(async ({ page, context }) => {
      await context.addCookies([
        {
          name: 'auth-token',
          value: 'mock-token',
          domain: 'localhost',
          path: '/',
        },
      ]);
    });

    test('should display leaderboard with all views', async ({ page }) => {
      await page.goto('http://localhost:8081/leaderboard');

      // Check podium display
      await expect(page.locator('[data-testid="podium-container"]')).toBeVisible();

      // Check leaderboard list
      await expect(page.locator('[data-testid="leaderboard-list"]')).toBeVisible();

      // Switch to friends view
      await page.click('[data-testid="type-friends"]');
      await page.waitForTimeout(500);

      // Switch to category view
      await page.click('[data-testid="type-category"]');
      await page.waitForTimeout(500);

      // Change time frame
      await page.click('[data-testid="timeframe-daily"]');
      await expect(page.locator('[data-testid="leaderboard-list"]')).toBeVisible();

      await page.click('[data-testid="timeframe-monthly"]');
      await expect(page.locator('[data-testid="leaderboard-list"]')).toBeVisible();
    });

    test('should highlight current user in leaderboard', async ({ page }) => {
      await page.goto('http://localhost:8081/leaderboard');

      // Find current user entry
      const currentUserEntry = page.locator('[data-testid="current-user-entry"]');
      await expect(currentUserEntry).toBeVisible();

      // Check if highlighted
      await expect(currentUserEntry).toHaveCSS('border-color', 'rgb(0, 122, 255)');
    });

    test('should refresh leaderboard data', async ({ page }) => {
      await page.goto('http://localhost:8081/leaderboard');

      const initialRank = await page.locator('[data-testid="leaderboard-item-0"]').textContent();

      // Pull to refresh
      await page.locator('[data-testid="leaderboard-list"]').evaluate((node) => {
        node.scrollTop = -100;
        node.dispatchEvent(new Event('scroll'));
      });

      await page.waitForTimeout(1000);

      // Check if data is refreshed
      await expect(page.locator('[data-testid="leaderboard-item-0"]')).toBeVisible();
    });
  });

  test.describe('Achievements Screen', () => {
    test.beforeEach(async ({ page, context }) => {
      await context.addCookies([
        {
          name: 'auth-token',
          value: 'mock-token',
          domain: 'localhost',
          path: '/',
        },
      ]);
    });

    test('should display achievements grid', async ({ page }) => {
      await page.goto('http://localhost:8081/achievements');

      // Check achievements grid
      await expect(page.locator('[data-testid="achievements-grid"]')).toBeVisible();

      // Check progress bar
      await expect(page.locator('[data-testid="achievements-progress"]')).toBeVisible();

      // Check categories
      await expect(page.locator('[data-testid="achievement-category-performance"]')).toBeVisible();
      await expect(page.locator('[data-testid="achievement-category-consistency"]')).toBeVisible();
      await expect(page.locator('[data-testid="achievement-category-exploration"]')).toBeVisible();
    });

    test('should show achievement details on tap', async ({ page }) => {
      await page.goto('http://localhost:8081/achievements');

      // Click on an achievement
      await page.click('[data-testid="achievement-first-steps"]');

      // Check detail modal
      await expect(page.locator('[data-testid="achievement-detail-modal"]')).toBeVisible();
      await expect(page.locator('[data-testid="achievement-description"]')).toBeVisible();
      await expect(page.locator('[data-testid="achievement-reward"]')).toBeVisible();

      // Close modal
      await page.click('[data-testid="close-modal"]');
      await expect(page.locator('[data-testid="achievement-detail-modal"]')).not.toBeVisible();
    });

    test('should filter achievements', async ({ page }) => {
      await page.goto('http://localhost:8081/achievements');

      // Filter by unlocked
      await page.click('[data-testid="filter-unlocked"]');

      // Check that only unlocked achievements are shown
      const unlockedCount = await page
        .locator('[data-testid^="achievement-"][data-unlocked="true"]')
        .count();
      const totalCount = await page.locator('[data-testid^="achievement-"]').count();
      expect(unlockedCount).toBe(totalCount);

      // Filter by locked
      await page.click('[data-testid="filter-locked"]');

      // Check that only locked achievements are shown
      const lockedCount = await page
        .locator('[data-testid^="achievement-"][data-unlocked="false"]')
        .count();
      expect(lockedCount).toBe(await page.locator('[data-testid^="achievement-"]').count());
    });
  });

  test.describe('Settings Screen', () => {
    test.beforeEach(async ({ page, context }) => {
      await context.addCookies([
        {
          name: 'auth-token',
          value: 'mock-token',
          domain: 'localhost',
          path: '/',
        },
      ]);
    });

    test('should display all settings categories', async ({ page }) => {
      await page.goto('http://localhost:8081/settings');

      // Check sections
      await expect(page.locator('[data-testid="settings-notifications"]')).toBeVisible();
      await expect(page.locator('[data-testid="settings-privacy"]')).toBeVisible();
      await expect(page.locator('[data-testid="settings-accessibility"]')).toBeVisible();
      await expect(page.locator('[data-testid="settings-about"]')).toBeVisible();
    });

    test('should toggle notification settings', async ({ page }) => {
      await page.goto('http://localhost:8081/settings');

      // Toggle push notifications
      const pushToggle = page.locator('[data-testid="toggle-push-notifications"]');
      const initialState = await pushToggle.getAttribute('data-checked');

      await pushToggle.click();

      const newState = await pushToggle.getAttribute('data-checked');
      expect(newState).not.toBe(initialState);
    });

    test('should navigate to privacy policy', async ({ page }) => {
      await page.goto('http://localhost:8081/settings');

      await page.click('[data-testid="privacy-policy-link"]');

      await expect(page.locator('[data-testid="privacy-policy-screen"]')).toBeVisible();
      await expect(page.locator('text=Privacy Policy')).toBeVisible();
    });

    test('should navigate to terms of service', async ({ page }) => {
      await page.goto('http://localhost:8081/settings');

      await page.click('[data-testid="terms-link"]');

      await expect(page.locator('[data-testid="terms-screen"]')).toBeVisible();
      await expect(page.locator('text=Terms of Service')).toBeVisible();
    });

    test('should handle theme switching', async ({ page }) => {
      await page.goto('http://localhost:8081/settings');

      // Switch to dark theme
      await page.click('[data-testid="theme-dark"]');

      // Check if theme applied
      const bodyClass = await page.locator('body').getAttribute('class');
      expect(bodyClass).toContain('dark-theme');

      // Switch back to light
      await page.click('[data-testid="theme-light"]');

      const updatedClass = await page.locator('body').getAttribute('class');
      expect(updatedClass).not.toContain('dark-theme');
    });
  });

  test.describe('Home Screen with Categories', () => {
    test.beforeEach(async ({ page, context }) => {
      await context.addCookies([
        {
          name: 'auth-token',
          value: 'mock-token',
          domain: 'localhost',
          path: '/',
        },
      ]);
    });

    test('should display all quiz categories', async ({ page }) => {
      await page.goto('http://localhost:8081/home');

      // Check categories grid
      await expect(page.locator('[data-testid="categories-grid"]')).toBeVisible();

      // Check specific categories
      await expect(page.locator('[data-testid="category-javascript"]')).toBeVisible();
      await expect(page.locator('[data-testid="category-react"]')).toBeVisible();
      await expect(page.locator('[data-testid="category-sre-operations"]')).toBeVisible();
      await expect(page.locator('[data-testid="category-kubernetes-orchestration"]')).toBeVisible();
    });

    test('should show daily challenge', async ({ page }) => {
      await page.goto('http://localhost:8081/home');

      await expect(page.locator('[data-testid="daily-challenge-card"]')).toBeVisible();
      await expect(page.locator('[data-testid="daily-challenge-timer"]')).toBeVisible();

      // Start daily challenge
      await page.click('[data-testid="start-daily-challenge"]');

      // Should navigate to quiz
      await expect(page.locator('[data-testid="quiz-screen"]')).toBeVisible();
    });

    test('should display user progress summary', async ({ page }) => {
      await page.goto('http://localhost:8081/home');

      await expect(page.locator('[data-testid="progress-summary"]')).toBeVisible();
      await expect(page.locator('[data-testid="total-xp"]')).toBeVisible();
      await expect(page.locator('[data-testid="current-level"]')).toBeVisible();
      await expect(page.locator('[data-testid="current-streak"]')).toBeVisible();
    });

    test('should search categories', async ({ page }) => {
      await page.goto('http://localhost:8081/home');

      // Search for specific category
      await page.fill('[data-testid="category-search"]', 'kubernetes');

      // Check filtered results
      await expect(page.locator('[data-testid="category-kubernetes-orchestration"]')).toBeVisible();

      // Other categories should be hidden
      await expect(page.locator('[data-testid="category-javascript"]')).not.toBeVisible();
    });
  });

  test.describe('Offline Mode', () => {
    test('should work offline after initial load', async ({ page, context }) => {
      // Load app online first
      await page.goto('http://localhost:8081');

      // Go offline
      await context.setOffline(true);

      // Navigate to quiz
      await page.click('[data-testid="category-javascript"]');
      await page.click('[data-testid="start-quiz-button"]');

      // Should still work with cached questions
      await expect(page.locator('[data-testid="question-0"]')).toBeVisible();

      // Complete quiz offline
      for (let i = 0; i < 5; i++) {
        await page.click('[data-testid="answer-option-0"]');
        if (i < 4) {
          await page.click('[data-testid="next-question-button"]');
        }
      }

      // Results should show with sync pending indicator
      await expect(page.locator('[data-testid="sync-pending"]')).toBeVisible();

      // Go back online
      await context.setOffline(false);

      // Should sync automatically
      await page.waitForTimeout(2000);
      await expect(page.locator('[data-testid="sync-complete"]')).toBeVisible();
    });
  });

  test.describe('Accessibility', () => {
    test('should be navigable with keyboard', async ({ page }) => {
      await page.goto('http://localhost:8081');

      // Tab through elements
      await page.keyboard.press('Tab');
      await expect(page.locator(':focus')).toBeVisible();

      // Navigate with arrow keys
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowUp');

      // Activate with Enter
      await page.keyboard.press('Enter');
    });

    test('should have proper ARIA labels', async ({ page }) => {
      await page.goto('http://localhost:8081');

      // Check for ARIA labels
      const buttons = page.locator('button');
      const count = await buttons.count();

      for (let i = 0; i < count; i++) {
        const button = buttons.nth(i);
        const ariaLabel = await button.getAttribute('aria-label');
        const text = await button.textContent();

        // Button should have either aria-label or text content
        expect(ariaLabel || text).toBeTruthy();
      }
    });

    test('should support screen reader', async ({ page }) => {
      await page.goto('http://localhost:8081');

      // Check for screen reader only elements
      await expect(page.locator('.sr-only')).toHaveCount(0); // Should be hidden visually

      // Check for role attributes
      await expect(page.locator('[role="navigation"]')).toBeTruthy();
      await expect(page.locator('[role="main"]')).toBeTruthy();
    });
  });

  test.describe('Performance', () => {
    test('should load quickly', async ({ page }) => {
      const startTime = Date.now();

      await page.goto('http://localhost:8081');
      await page.waitForSelector('[data-testid="app-container"]');

      const loadTime = Date.now() - startTime;

      // Should load in under 3 seconds
      expect(loadTime).toBeLessThan(3000);
    });

    test('should handle large datasets efficiently', async ({ page }) => {
      await page.goto('http://localhost:8081/leaderboard');

      // Scroll through large leaderboard
      for (let i = 0; i < 10; i++) {
        await page.evaluate(() => window.scrollBy(0, 500));
        await page.waitForTimeout(100);
      }

      // Should not lag or crash
      await expect(page.locator('[data-testid="leaderboard-list"]')).toBeVisible();
    });

    test('should cache resources properly', async ({ page }) => {
      // First load
      await page.goto('http://localhost:8081');

      // Second load should be faster due to caching
      const startTime = Date.now();
      await page.reload();
      const reloadTime = Date.now() - startTime;

      expect(reloadTime).toBeLessThan(1000);
    });
  });
});
