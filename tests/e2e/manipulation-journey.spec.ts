import { test, expect, Page } from '@playwright/test';

// Helper to mock time progression
async function mockTimeProgression(page: Page, hours: number) {
  await page.evaluate((h) => {
    const now = new Date();
    now.setHours(now.getHours() + h);
    Date.now = () => now.getTime();
  }, hours);
}

test.describe('Manipulation User Journey', () => {
  test.beforeEach(async ({ page }) => {
    // Start with clean state
    await page.evaluate(() => localStorage.clear());
    await page.goto('http://localhost:8081');
  });

  test.describe('Streak Manipulation Flow', () => {
    test('should show streak danger notification at critical time', async ({ page }) => {
      // Complete a quiz to start streak
      await page.getByText('Start Quiz').click();
      await page.getByText('Technology').click();

      // Answer questions
      for (let i = 0; i < 5; i++) {
        await page
          .getByRole('button', { name: /option/i })
          .first()
          .click();
      }

      // Verify streak started
      await expect(page.getByText('1 day streak')).toBeVisible();

      // Mock 20 hours later (danger zone)
      await mockTimeProgression(page, 20);
      await page.reload();

      // Should show streak danger warning
      await expect(page.getByText(/streak.*danger/i)).toBeVisible();
      await expect(page.getByText(/4 hours left/i)).toBeVisible();

      // Should have red/urgent styling
      const streakElement = page.locator('[data-testid="streak-display"]');
      await expect(streakElement).toHaveCSS('border-color', 'rgb(239, 68, 68)');
    });

    test('should reset streak after 24 hours and show loss modal', async ({ page }) => {
      // Build up a streak
      for (let day = 0; day < 7; day++) {
        await page.goto('http://localhost:8081');
        await page.getByText('Start Quiz').click();
        await page.getByText('Technology').click();

        for (let i = 0; i < 5; i++) {
          await page
            .getByRole('button', { name: /option/i })
            .first()
            .click();
        }

        await mockTimeProgression(page, 24);
      }

      // Verify 7-day streak
      await expect(page.getByText('7 day streak')).toBeVisible();

      // Mock 25 hours later (streak broken)
      await mockTimeProgression(page, 25);
      await page.reload();

      // Should show streak loss modal
      await expect(page.getByText(/lost.*streak/i)).toBeVisible();
      await expect(page.getByText('Start New Streak')).toBeVisible();

      // Should offer streak freeze purchase
      await expect(page.getByText(/buy.*freeze/i)).toBeVisible();
    });

    test('should celebrate milestone achievements', async ({ page }) => {
      // Set up 6-day streak
      await page.evaluate(() => {
        localStorage.setItem(
          'streak-storage',
          JSON.stringify({
            state: { currentStreak: 6, lastActiveDate: new Date().toISOString() },
          }),
        );
      });

      await page.goto('http://localhost:8081');

      // Complete quiz to reach 7-day milestone
      await page.getByText('Start Quiz').click();
      await page.getByText('Technology').click();

      for (let i = 0; i < 5; i++) {
        await page
          .getByRole('button', { name: /option/i })
          .first()
          .click();
      }

      // Should show milestone celebration
      await expect(page.getByText('🎉 7 Day Streak!')).toBeVisible();
      await expect(page.getByText(/bonus.*xp/i)).toBeVisible();

      // Should trigger confetti animation
      await expect(page.locator('.confetti-animation')).toBeVisible();
    });
  });

  test.describe('Hearts Depletion and Frustration', () => {
    test('should deplete hearts on wrong answers', async ({ page }) => {
      await page.goto('http://localhost:8081');

      // Verify starting hearts
      await expect(page.getByText('5/5 ❤️')).toBeVisible();

      // Start quiz
      await page.getByText('Start Quiz').click();
      await page.getByText('Technology').click();

      // Intentionally answer wrong (assuming last option is often wrong)
      await page
        .getByRole('button', { name: /option/i })
        .last()
        .click();

      // Should lose a heart
      await expect(page.getByText('4/5 ❤️')).toBeVisible();

      // Answer 4 more wrong
      for (let i = 0; i < 4; i++) {
        await page
          .getByRole('button', { name: /option/i })
          .last()
          .click();
      }

      // Should be out of hearts
      await expect(page.getByText('0/5 ❤️')).toBeVisible();

      // Should block quiz access
      await expect(page.getByText(/out of hearts/i)).toBeVisible();
      await expect(page.getByRole('button', { name: 'Watch Ad' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Get Premium' })).toBeVisible();
    });

    test('should show regeneration timer when hearts depleted', async ({ page }) => {
      // Set hearts to 0
      await page.evaluate(() => {
        localStorage.setItem(
          'hearts-storage',
          JSON.stringify({
            state: { hearts: 0, lastDepletedAt: new Date().toISOString() },
          }),
        );
      });

      await page.goto('http://localhost:8081');

      // Should show regeneration timer
      await expect(page.getByText(/regenerating/i)).toBeVisible();
      await expect(page.getByText(/29:5\d/)).toBeVisible(); // ~30 minutes

      // Mock 30 minutes later
      await mockTimeProgression(page, 0.5);
      await page.reload();

      // Should have 1 heart regenerated
      await expect(page.getByText('1/5 ❤️')).toBeVisible();
    });

    test('should trigger premium upsell after watching multiple ads', async ({ page }) => {
      // Deplete hearts
      await page.evaluate(() => {
        localStorage.setItem(
          'hearts-storage',
          JSON.stringify({
            state: { hearts: 0 },
          }),
        );
      });

      await page.goto('http://localhost:8081');

      // Watch ads 5 times
      for (let i = 0; i < 5; i++) {
        await page.getByRole('button', { name: 'Watch Ad' }).click();

        // Mock ad completion
        await page.waitForTimeout(3000);
        await page.getByRole('button', { name: 'Close' }).click();
      }

      // Should show ad fatigue upsell
      await expect(page.getByText(/tired of ads/i)).toBeVisible();
      await expect(page.getByRole('button', { name: /premium/i })).toBeVisible();
    });
  });

  test.describe('Daily Challenge Time Pressure', () => {
    test('should show countdown timer and urgency animations', async ({ page }) => {
      await page.goto('http://localhost:8081');

      // Start daily challenge
      await page.getByText('Daily Challenge').click();
      await page.getByRole('button', { name: 'Start Challenge' }).click();

      // Should show countdown timer
      await expect(page.getByText(/\d+:\d{2}/)).toBeVisible();

      // Mock time progression to last minute
      await page.evaluate(() => {
        const element = document.querySelector('[data-testid="challenge-timer"]');
        if (element) {
          element.textContent = '0:59';
        }
      });

      // Should show urgency styling
      const timerElement = page.locator('[data-testid="challenge-timer"]');
      await expect(timerElement).toHaveCSS('color', 'rgb(239, 68, 68)'); // Red

      // Should show urgency message
      await expect(page.getByText(/hurry.*time.*running out/i)).toBeVisible();

      // Should have shake animation
      await expect(timerElement).toHaveCSS('animation-name', /shake/);
    });

    test('should lock premium challenges for free users', async ({ page }) => {
      await page.goto('http://localhost:8081');

      // Look for premium challenge
      const premiumChallenge = page.locator('[data-premium="true"]').first();

      // Should show lock icon
      await expect(premiumChallenge.getByText('🔒')).toBeVisible();

      // Click on it
      await premiumChallenge.click();

      // Should show paywall
      await expect(page.getByText(/unlock.*premium/i)).toBeVisible();
      await expect(page.getByRole('button', { name: /subscribe/i })).toBeVisible();
    });
  });

  test.describe('Fake Leaderboard Manipulation', () => {
    test('should show fake users progressing in real-time', async ({ page }) => {
      await page.goto('http://localhost:8081/leaderboard');

      // Should see fake users
      await expect(page.getByText('Sarah Chen')).toBeVisible();
      await expect(page.getByText('Mike Johnson')).toBeVisible();

      // Wait for fake activity update (every 5 seconds)
      await page.waitForTimeout(5500);

      // Should see live update notification
      await expect(page.getByText(/just completed/i)).toBeVisible();

      // Should see rank changes
      const rankChangeIndicator = page.locator('[data-testid="rank-change"]').first();
      await expect(rankChangeIndicator).toContainText(/↑|↓/);
    });

    test('should position user strategically in middle ranks', async ({ page }) => {
      await page.goto('http://localhost:8081/leaderboard');

      // Find user's position
      const userRow = page.locator('[data-user="true"]');
      const userRank = await userRow.locator('[data-testid="rank"]').textContent();

      // Should be in frustrating middle (100-150)
      const rank = parseInt(userRank || '0');
      expect(rank).toBeGreaterThan(99);
      expect(rank).toBeLessThan(151);

      // Should show nearby competitors
      await expect(page.getByText('Your Competition')).toBeVisible();

      // Should show someone just ahead (achievable goal)
      const nextUser = page.locator('[data-testid="competitor-ahead"]');
      await expect(nextUser).toBeVisible();
    });
  });

  test.describe('Notification Manipulation', () => {
    test('should send streak reminder at optimal time', async ({ page, context }) => {
      // Grant notification permission
      await context.grantPermissions(['notifications']);

      // Set up streak
      await page.evaluate(() => {
        localStorage.setItem(
          'streak-storage',
          JSON.stringify({
            state: {
              currentStreak: 15,
              lastActiveDate: new Date(Date.now() - 19 * 60 * 60 * 1000),
            },
          }),
        );
      });

      // Mock 8 PM
      await page.evaluate(() => {
        const now = new Date();
        now.setHours(20, 0, 0, 0);
        Date.now = () => now.getTime();
      });

      await page.goto('http://localhost:8081');

      // Should trigger notification
      const notifications = await page.evaluate(() => (window as any).notificationHistory || []);

      expect(notifications).toContainEqual(
        expect.objectContaining({
          title: expect.stringMatching(/streak.*danger/i),
          body: expect.stringMatching(/15.*day/i),
        }),
      );
    });

    test('should send fake social pressure notifications', async ({ page, context }) => {
      await context.grantPermissions(['notifications']);

      await page.goto('http://localhost:8081');

      // Wait for social pressure notification (random timing)
      await page.waitForTimeout(10000);

      const notifications = await page.evaluate(() => (window as any).notificationHistory || []);

      // Should have received at least one social notification
      const socialNotifications = notifications.filter((n: any) =>
        n.body.match(/friends|passed you|playing now/i),
      );

      expect(socialNotifications.length).toBeGreaterThan(0);
    });
  });

  test.describe('Dynamic Pricing Manipulation', () => {
    test('should show frustration-triggered discount', async ({ page }) => {
      // Simulate high frustration
      await page.evaluate(() => {
        localStorage.setItem(
          'analytics-storage',
          JSON.stringify({
            frustrationScore: 85,
            heartsDepletedCount: 10,
            adsWatchedCount: 15,
          }),
        );
      });

      await page.goto('http://localhost:8081/paywall');

      // Should show discounted price
      await expect(page.getByText(/special.*offer/i)).toBeVisible();
      await expect(page.getByText(/50%.*off/i)).toBeVisible();

      // Should show urgency
      await expect(page.getByText(/limited.*time/i)).toBeVisible();
      await expect(page.getByText(/expires/i)).toBeVisible();
    });

    test('should adjust price based on location', async ({ page }) => {
      // Mock location as India (lower PPP)
      await page.evaluate(() => {
        Object.defineProperty(navigator, 'language', {
          value: 'hi-IN',
          configurable: true,
        });
      });

      await page.goto('http://localhost:8081/paywall');

      // Should show adjusted price
      const priceElement = page.locator('[data-testid="subscription-price"]');
      const price = await priceElement.textContent();

      // Should be lower than US price ($9.99)
      expect(price).toMatch(/[₹$]\s*[3-5]\d{2}/); // Expecting ₹300-599 range
    });
  });

  test.describe('Complete Manipulation Flow', () => {
    test('should execute full user manipulation journey', async ({ page }) => {
      // Day 1: Onboarding with easy success
      await page.goto('http://localhost:8081');
      await page.getByRole('button', { name: 'Start Journey' }).click();

      // Easy first quiz for dopamine hit
      await page.getByText('Beginner').click();
      for (let i = 0; i < 5; i++) {
        await page
          .getByRole('button', { name: /option/i })
          .first()
          .click();
      }

      // Should celebrate
      await expect(page.getByText(/perfect.*score/i)).toBeVisible();
      await expect(page.getByText('🎉')).toBeVisible();

      // Day 2-6: Build streak habit
      for (let day = 2; day <= 6; day++) {
        await mockTimeProgression(page, 24);
        await page.reload();

        // Should show streak reminder
        await expect(page.getByText(`${day - 1} day streak`)).toBeVisible();

        // Complete quiz
        await page.getByText('Start Quiz').click();
        await page.getByText('Technology').click();
        for (let i = 0; i < 5; i++) {
          await page
            .getByRole('button', { name: /option/i })
            .first()
            .click();
        }
      }

      // Day 7: Milestone celebration
      await mockTimeProgression(page, 24);
      await page.reload();
      await page.getByText('Start Quiz').click();
      await page.getByText('Technology').click();
      for (let i = 0; i < 5; i++) {
        await page
          .getByRole('button', { name: /option/i })
          .first()
          .click();
      }

      // Should celebrate 7-day milestone
      await expect(page.getByText('7 Day Streak!')).toBeVisible();

      // Day 8: Introduce frustration
      await mockTimeProgression(page, 24);
      await page.reload();

      // Make quiz harder, deplete hearts
      await page.getByText('Start Quiz').click();
      await page.getByText('Expert').click();

      // Answer wrong to deplete hearts
      for (let i = 0; i < 5; i++) {
        await page
          .getByRole('button', { name: /option/i })
          .last()
          .click();
      }

      // Out of hearts
      await expect(page.getByText('0/5 ❤️')).toBeVisible();

      // Push to watch ad
      await page.getByRole('button', { name: 'Watch Ad' }).click();
      await page.waitForTimeout(3000);

      // Day 9: Social pressure
      await mockTimeProgression(page, 24);
      await page.reload();

      // Should show fake friend activity
      await expect(page.getByText(/friend.*passed you/i)).toBeVisible();

      // Go to leaderboard
      await page.getByText('View Leaderboard').click();

      // Should show user dropping in rank
      await expect(page.getByText('↓')).toBeVisible();

      // Day 10: Convert to premium
      // High frustration + streak investment + social pressure
      await page.getByRole('button', { name: /premium/i }).click();

      // Should show personalized offer
      await expect(page.getByText(/special.*you/i)).toBeVisible();
      await expect(page.getByText(/don't.*lose.*streak/i)).toBeVisible();

      // Complete purchase
      await page.getByRole('button', { name: 'Subscribe Now' }).click();

      // Should remove all friction
      await expect(page.getByText('∞ ❤️')).toBeVisible(); // Unlimited hearts
      await expect(page.getByText('Premium')).toBeVisible();
    });
  });
});

test.describe('Remote Configuration Tests', () => {
  test('should apply feature flags dynamically', async ({ page }) => {
    // Mock remote config
    await page.route('**/api/remote-config', async (route) => {
      await route.fulfill({
        json: {
          features: {
            dailyChallengesEnabled: false,
            heartsEnabled: true,
            streaksEnabled: true,
          },
        },
      });
    });

    await page.goto('http://localhost:8081');

    // Daily challenges should be hidden
    await expect(page.getByText('Daily Challenge')).not.toBeVisible();

    // Hearts should be visible
    await expect(page.getByText(/❤️/)).toBeVisible();

    // Streaks should be visible
    await expect(page.getByText(/streak/i)).toBeVisible();
  });

  test('should assign A/B test variants consistently', async ({ page }) => {
    // Mock user ID for consistent hashing
    await page.evaluate(() => {
      localStorage.setItem('userId', 'test-user-123');
    });

    await page.goto('http://localhost:8081');

    // Check variant assignment
    const variant = await page.evaluate(() => {
      return (window as any).experimentVariant;
    });

    // Reload multiple times - should get same variant
    for (let i = 0; i < 5; i++) {
      await page.reload();
      const newVariant = await page.evaluate(() => {
        return (window as any).experimentVariant;
      });
      expect(newVariant).toBe(variant);
    }
  });

  test('should load dynamic quiz content', async ({ page }) => {
    // Mock dynamic quiz endpoint
    await page.route('**/api/quiz/dynamic', async (route) => {
      await route.fulfill({
        json: {
          questions: [
            {
              id: 'dynamic-1',
              question: 'Dynamic Question 1',
              options: ['A', 'B', 'C', 'D'],
              correctAnswer: 0,
            },
          ],
        },
      });
    });

    await page.goto('http://localhost:8081');
    await page.getByText('Start Quiz').click();

    // Should load dynamic question
    await expect(page.getByText('Dynamic Question 1')).toBeVisible();
  });
});
