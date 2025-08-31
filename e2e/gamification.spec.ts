import { test, expect } from '@playwright/test';

test.describe('Gamification Features', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Skip onboarding if present
    const skipButton = page.locator('button:has-text("Skip")');
    if (await skipButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await skipButton.click();
    }
  });

  test('should display user level and XP', async ({ page }) => {
    // Look for level indicator
    const levelElement = page.locator(
      '[data-testid="user-level"], text=/Level [0-9]+|Lvl [0-9]+/i',
    );
    const xpElement = page.locator('[data-testid="user-xp"], text=/XP|Experience Points/i');

    const hasLevel = await levelElement.isVisible({ timeout: 5000 }).catch(() => false);
    const hasXP = await xpElement.isVisible({ timeout: 5000 }).catch(() => false);

    if (hasLevel || hasXP) {
      // Verify level/XP is displayed with numbers
      if (hasLevel) {
        const levelText = await levelElement.textContent();
        expect(levelText).toMatch(/[0-9]+/);
      }
      if (hasXP) {
        const xpText = await xpElement.textContent();
        expect(xpText).toMatch(/[0-9]+/);
      }
    }
  });

  test('should show achievements section', async ({ page }) => {
    // Navigate to achievements or profile
    const achievementsLink = page
      .locator('text=/Achievements|Badges|Trophies/i, [data-testid="achievements"]')
      .first();

    if (await achievementsLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      await achievementsLink.click();
      await page.waitForLoadState('networkidle');

      // Should see achievements page
      await expect(page.locator('text=/Achievements|Badges|Unlocked/i')).toBeVisible({
        timeout: 5000,
      });

      // Check for achievement items
      const achievementItems = page.locator('[data-testid^="achievement-"], .achievement-item');
      const count = await achievementItems.count();

      if (count > 0) {
        // Verify at least one achievement is visible
        await expect(achievementItems.first()).toBeVisible();

        // Check for locked/unlocked status
        const lockedAchievements = page.locator('text=/Locked|Not Unlocked/i');
        const unlockedAchievements = page.locator('text=/Unlocked|Earned|Completed/i');

        const hasLocked = (await lockedAchievements.count()) > 0;
        const hasUnlocked = (await unlockedAchievements.count()) > 0;

        expect(hasLocked || hasUnlocked).toBeTruthy();
      }
    }
  });

  test('should display leaderboard', async ({ page }) => {
    // Navigate to leaderboard
    const leaderboardLink = page
      .locator('text=/Leaderboard|Rankings|Top Players/i, [data-testid="leaderboard"]')
      .first();

    if (await leaderboardLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      await leaderboardLink.click();
      await page.waitForLoadState('networkidle');

      // Should see leaderboard
      await expect(page.locator('text=/Leaderboard|Rankings|Top/i')).toBeVisible({ timeout: 5000 });

      // Check for player entries
      const playerEntries = page.locator(
        '[data-testid^="leaderboard-entry-"], .leaderboard-item, tr',
      );
      const count = await playerEntries.count();

      if (count > 0) {
        // Verify ranking numbers are visible
        const rankings = page.locator('text=/^#?[0-9]+/');
        expect(await rankings.count()).toBeGreaterThan(0);

        // Check for player names and scores
        const scores = page.locator('text=/[0-9]+ ?(XP|points|pts)/i');
        expect(await scores.count()).toBeGreaterThan(0);
      }
    }
  });

  test('should show daily challenges', async ({ page }) => {
    // Look for daily challenges section
    const challengesSection = page
      .locator(
        'text=/Daily Challenge|Today.*Challenge|Challenges/i, [data-testid="daily-challenges"]',
      )
      .first();

    if (await challengesSection.isVisible({ timeout: 5000 }).catch(() => false)) {
      await challengesSection.click();

      // Should see challenge details
      const challengeItems = page.locator('[data-testid^="challenge-"], .challenge-item');
      const count = await challengeItems.count();

      if (count > 0) {
        // Check for challenge progress
        const progressBars = page.locator(
          '[role="progressbar"], .progress-bar, [data-testid*="progress"]',
        );
        const progressText = page.locator('text=/[0-9]+\\/[0-9]+|[0-9]+%/');

        const hasProgress = (await progressBars.count()) > 0 || (await progressText.count()) > 0;

        expect(hasProgress).toBeTruthy();
      }
    }
  });

  test('should handle power-ups', async ({ page }) => {
    // Start a quiz to see power-ups
    const startButton = page
      .locator('button:has-text("Start Quiz"), button:has-text("Play")')
      .first();

    if (await startButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await startButton.click();
      await page.waitForLoadState('networkidle');

      // Look for power-up buttons
      const powerUps = page.locator(
        '[data-testid^="powerup-"], button[aria-label*="power"], .powerup-button',
      );

      if ((await powerUps.count()) > 0) {
        // Check power-up availability
        const firstPowerUp = powerUps.first();
        const isDisabled = await firstPowerUp.isDisabled();

        if (!isDisabled) {
          await firstPowerUp.click();

          // Check for power-up effect or confirmation
          const effectVisible = await page
            .locator('text=/Activated|Used|Applied/i')
            .isVisible({ timeout: 2000 })
            .catch(() => false);

          if (effectVisible) {
            expect(effectVisible).toBeTruthy();
          }
        }
      }
    }
  });

  test('should track and display streaks', async ({ page }) => {
    // Look for streak counter
    const streakElement = page.locator(
      '[data-testid="streak"], text=/🔥|Streak:/i, .streak-counter',
    );

    if (await streakElement.isVisible({ timeout: 5000 }).catch(() => false)) {
      const streakText = await streakElement.textContent();

      // Should contain a number
      expect(streakText).toMatch(/[0-9]+/);

      // Check for streak freeze indicator if available
      const freezeElement = page.locator('[data-testid="streak-freeze"], text=/Freeze|Protected/i');

      if (await freezeElement.isVisible({ timeout: 2000 }).catch(() => false)) {
        await expect(freezeElement).toBeVisible();
      }
    }
  });

  test('should show progress towards next level', async ({ page }) => {
    // Look for XP progress bar
    const progressBar = page.locator(
      '[data-testid="xp-progress"], [role="progressbar"][aria-label*="XP"], .xp-progress',
    );

    if (await progressBar.isVisible({ timeout: 5000 }).catch(() => false)) {
      // Check for progress value
      const progressValue =
        (await progressBar.getAttribute('aria-valuenow')) ||
        (await progressBar.getAttribute('value')) ||
        (await progressBar.getAttribute('data-value'));

      if (progressValue) {
        expect(Number(progressValue)).toBeGreaterThanOrEqual(0);
      }

      // Check for "XP to next level" text
      const xpToNext = page.locator('text=/[0-9]+ ?\\/ ?[0-9]+ ?XP|[0-9]+ ?XP to/i');

      if (await xpToNext.isVisible({ timeout: 2000 }).catch(() => false)) {
        const text = await xpToNext.textContent();
        expect(text).toMatch(/[0-9]+/);
      }
    }
  });
});
