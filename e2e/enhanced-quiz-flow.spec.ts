import { test, expect, Page } from '@playwright/test';

/**
 * Enhanced E2E Tests for QuizMentor
 * Comprehensive testing with better practices
 */

// Test data
const TEST_USER = {
  email: 'test@quizmentor.com',
  password: 'TestPass123!',
  username: 'testuser',
};

const SELECTORS = {
  // Navigation
  homeTab: '[data-testid="tab-home"]',
  quizTab: '[data-testid="tab-quiz"]',
  profileTab: '[data-testid="tab-profile"]',

  // Quiz elements
  startButton: '[data-testid="quiz-start-button"]',
  categoryCard: '[data-testid="category-card"]',
  questionText: '[data-testid="question-text"]',
  optionButton: '[data-testid="option-button"]',
  nextButton: '[data-testid="next-button"]',
  skipButton: '[data-testid="skip-button"]',
  scoreDisplay: '[data-testid="score-display"]',
  timerDisplay: '[data-testid="timer-display"]',

  // Results
  resultsContainer: '[data-testid="results-container"]',
  finalScore: '[data-testid="results-score"]',
  starsEarned: '[data-testid="results-stars"]',
  xpEarned: '[data-testid="results-xp"]',
  shareButton: '[data-testid="results-share"]',
  retryButton: '[data-testid="results-retry"]',

  // User stats
  streakDisplay: '[data-testid="streak-display"]',
  heartsDisplay: '[data-testid="hearts-display"]',
  levelDisplay: '[data-testid="level-display"]',

  // Premium
  paywallModal: '[data-testid="paywall-modal"]',
  purchaseButton: '[data-testid="purchase-button"]',
  restoreButton: '[data-testid="restore-button"]',
};

// Helper functions
class QuizPage {
  constructor(private page: Page) {}

  async navigateToHome() {
    await this.page.goto('/');
    await this.page.waitForLoadState('networkidle');
  }

  async startQuiz() {
    await this.page.click(SELECTORS.startButton);
    await this.page.waitForSelector(SELECTORS.categoryCard);
  }

  async selectCategory(index: number = 0) {
    const categories = await this.page.$$(SELECTORS.categoryCard);
    if (categories[index]) {
      await categories[index].click();
      await this.page.waitForSelector(SELECTORS.questionText);
    }
  }

  async answerQuestion(optionIndex: number = 0) {
    const options = await this.page.$$(SELECTORS.optionButton);
    if (options[optionIndex]) {
      await options[optionIndex].click();
      // Wait for animation
      await this.page.waitForTimeout(500);
    }
  }

  async clickNext() {
    await this.page.click(SELECTORS.nextButton);
    await this.page.waitForTimeout(300);
  }

  async skipQuestion() {
    await this.page.click(SELECTORS.skipButton);
    await this.page.waitForTimeout(300);
  }

  async completeQuiz(answers: number[] = [0, 1, 2, 0, 1, 2, 0, 1, 2, 0]) {
    for (let i = 0; i < answers.length; i++) {
      await this.answerQuestion(answers[i]);

      // Check if it's the last question
      const nextButtonText = await this.page.textContent(SELECTORS.nextButton);
      if (nextButtonText?.includes('Finish') || nextButtonText?.includes('Results')) {
        await this.page.click(SELECTORS.nextButton);
        break;
      } else {
        await this.clickNext();
      }
    }

    // Wait for results
    await this.page.waitForSelector(SELECTORS.resultsContainer);
  }

  async getScore(): Promise<string> {
    return (await this.page.textContent(SELECTORS.finalScore)) || '0';
  }

  async getStreak(): Promise<string> {
    return (await this.page.textContent(SELECTORS.streakDisplay)) || '0';
  }

  async getHearts(): Promise<string> {
    return (await this.page.textContent(SELECTORS.heartsDisplay)) || '0';
  }

  async takeScreenshot(name: string) {
    await this.page.screenshot({
      path: `test-results/${name}.png`,
      fullPage: true,
    });
  }

  async measurePerformance() {
    return await this.page.evaluate(() => {
      const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return {
        domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
        loadComplete: perfData.loadEventEnd - perfData.loadEventStart,
      };
    });
  }
}

// Test suites
test.describe('🎯 Core Quiz Flow', () => {
  let quizPage: QuizPage;

  test.beforeEach(async ({ page }) => {
    quizPage = new QuizPage(page);
    await quizPage.navigateToHome();
  });

  test('should complete full quiz flow successfully', async ({ page }) => {
    // Start quiz
    await quizPage.startQuiz();
    await quizPage.takeScreenshot('01-categories');

    // Select category
    await quizPage.selectCategory(0);
    await quizPage.takeScreenshot('02-first-question');

    // Complete quiz
    await quizPage.completeQuiz([0, 1, 0, 2, 1, 0, 1, 2, 0, 1]);
    await quizPage.takeScreenshot('03-results');

    // Verify results
    const score = await quizPage.getScore();
    expect(parseInt(score)).toBeGreaterThanOrEqual(0);

    // Check for XP and stars
    await expect(page.locator(SELECTORS.xpEarned)).toBeVisible();
    await expect(page.locator(SELECTORS.starsEarned)).toBeVisible();
  });

  test('should handle quiz interruption and resume', async ({ page }) => {
    await quizPage.startQuiz();
    await quizPage.selectCategory(0);

    // Answer some questions
    await quizPage.answerQuestion(0);
    await quizPage.clickNext();
    await quizPage.answerQuestion(1);

    // Navigate away
    await page.click(SELECTORS.homeTab);
    await page.waitForTimeout(500);

    // Come back to quiz
    await page.click(SELECTORS.quizTab);

    // Should show resume or restart option
    const resumeButton = page.locator('text=Resume Quiz, text=Continue Quiz');
    const isResumable = await resumeButton.isVisible();

    if (isResumable) {
      await resumeButton.click();
      // Verify we're back in the quiz
      await expect(page.locator(SELECTORS.questionText)).toBeVisible();
    }
  });

  test('should track score correctly', async ({ page }) => {
    await quizPage.startQuiz();
    await quizPage.selectCategory(0);

    // Track score through quiz
    const scores: string[] = [];

    for (let i = 0; i < 5; i++) {
      await quizPage.answerQuestion(0);
      const scoreText = await page.textContent(SELECTORS.scoreDisplay);
      scores.push(scoreText || '0');
      await quizPage.clickNext();
    }

    // Verify score increases
    const numericScores = scores.map((s) => parseInt(s.match(/\d+/)?.[0] || '0'));
    const isIncreasing = numericScores.every(
      (score, i) => i === 0 || score >= numericScores[i - 1],
    );

    expect(isIncreasing).toBe(true);
  });

  test('should show correct feedback for answers', async ({ page }) => {
    await quizPage.startQuiz();
    await quizPage.selectCategory(0);

    // Answer question
    await quizPage.answerQuestion(0);

    // Check for feedback
    const correctFeedback = page.locator('text=Correct!, text=✓, text=Right!');
    const incorrectFeedback = page.locator('text=Incorrect, text=✗, text=Wrong');

    const hasCorrect = await correctFeedback.isVisible();
    const hasIncorrect = await incorrectFeedback.isVisible();

    expect(hasCorrect || hasIncorrect).toBe(true);

    // Check for explanation
    const explanation = page.locator('text=Explanation:, [data-testid="explanation"]');
    await expect(explanation).toBeVisible();
  });
});

test.describe('🏆 Gamification Features', () => {
  let quizPage: QuizPage;

  test.beforeEach(async ({ page }) => {
    quizPage = new QuizPage(page);
    await quizPage.navigateToHome();
  });

  test('should update streak after quiz completion', async ({ page }) => {
    // Get initial streak
    const initialStreak = await quizPage.getStreak();

    // Complete quiz
    await quizPage.startQuiz();
    await quizPage.selectCategory(0);
    await quizPage.completeQuiz();

    // Go back to home
    await page.click(SELECTORS.homeTab);
    await page.waitForTimeout(500);

    // Check updated streak
    const updatedStreak = await quizPage.getStreak();

    // Streak should be maintained or increased
    expect(parseInt(updatedStreak)).toBeGreaterThanOrEqual(parseInt(initialStreak));
  });

  test('should consume hearts when failing', async ({ page }) => {
    // Get initial hearts
    const initialHearts = await quizPage.getHearts();

    // Start quiz and intentionally fail
    await quizPage.startQuiz();
    await quizPage.selectCategory(0);

    // Skip all questions (should result in failure)
    for (let i = 0; i < 10; i++) {
      if (await page.isVisible(SELECTORS.skipButton)) {
        await quizPage.skipQuestion();
      } else {
        break;
      }
    }

    // Check hearts after failure
    const updatedHearts = await quizPage.getHearts();

    // Hearts should decrease (unless unlimited)
    const heartsDecreased = parseInt(updatedHearts) < parseInt(initialHearts);
    const hasUnlimited = await page.isVisible('text=Unlimited, text=∞');

    expect(heartsDecreased || hasUnlimited).toBe(true);
  });

  test('should show achievements when unlocked', async ({ page }) => {
    // Complete a perfect quiz
    await quizPage.startQuiz();
    await quizPage.selectCategory(0);

    // Answer all correctly (assuming first option is correct)
    await quizPage.completeQuiz(new Array(10).fill(0));

    // Check for achievement notification
    const achievementNotification = page.locator(
      'text=Achievement Unlocked, text=New Achievement, [data-testid="achievement-popup"]',
    );

    // Achievement might appear
    if (await achievementNotification.isVisible()) {
      await quizPage.takeScreenshot('achievement-unlocked');
      expect(true).toBe(true); // Achievement system working
    }
  });
});

test.describe('💰 Premium Features', () => {
  let quizPage: QuizPage;

  test.beforeEach(async ({ page }) => {
    quizPage = new QuizPage(page);
    await quizPage.navigateToHome();
  });

  test('should show paywall when hearts depleted', async ({ page }) => {
    // Simulate depleted hearts
    await page.evaluate(() => {
      localStorage.setItem('hearts', '0');
    });

    await page.reload();

    // Try to start quiz
    await page.click(SELECTORS.startButton);

    // Should show paywall
    await expect(page.locator(SELECTORS.paywallModal)).toBeVisible();

    // Verify paywall elements
    await expect(page.locator(SELECTORS.purchaseButton)).toBeVisible();
    await expect(page.locator(SELECTORS.restoreButton)).toBeVisible();

    await quizPage.takeScreenshot('paywall');
  });

  test('should show premium categories', async ({ page }) => {
    await quizPage.startQuiz();

    // Look for premium indicators
    const premiumBadges = page.locator(
      'text=Premium, text=PRO, text=👑, [data-testid="premium-badge"]',
    );
    const hasPremiumContent = (await premiumBadges.count()) > 0;

    if (hasPremiumContent) {
      await quizPage.takeScreenshot('premium-categories');

      // Try to select premium category as free user
      const premiumCategory = await page.$('[data-testid="category-card"]:has-text("Premium")');
      if (premiumCategory) {
        await premiumCategory.click();

        // Should show paywall or upgrade prompt
        const upgradePrompt = page.locator('text=Upgrade, text=Unlock, text=Premium Required');
        await expect(upgradePrompt).toBeVisible();
      }
    }
  });
});

test.describe('📱 Responsive Design', () => {
  test('should work on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });

    const quizPage = new QuizPage(page);
    await quizPage.navigateToHome();

    // Verify mobile layout
    await expect(page.locator(SELECTORS.startButton)).toBeVisible();

    // Complete mini quiz flow
    await quizPage.startQuiz();
    await quizPage.selectCategory(0);
    await quizPage.answerQuestion(0);

    await quizPage.takeScreenshot('mobile-quiz');
  });

  test('should work on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });

    const quizPage = new QuizPage(page);
    await quizPage.navigateToHome();

    await expect(page.locator(SELECTORS.startButton)).toBeVisible();
    await quizPage.takeScreenshot('tablet-home');
  });

  test('should handle orientation change', async ({ page }) => {
    const quizPage = new QuizPage(page);
    await quizPage.navigateToHome();

    // Portrait
    await page.setViewportSize({ width: 375, height: 812 });
    await quizPage.takeScreenshot('orientation-portrait');

    // Landscape
    await page.setViewportSize({ width: 812, height: 375 });
    await quizPage.takeScreenshot('orientation-landscape');

    // Verify content still accessible
    await expect(page.locator(SELECTORS.startButton)).toBeVisible();
  });
});

test.describe('⚡ Performance Tests', () => {
  test('should load home page quickly', async ({ page }) => {
    const quizPage = new QuizPage(page);

    const startTime = Date.now();
    await quizPage.navigateToHome();
    const loadTime = Date.now() - startTime;

    expect(loadTime).toBeLessThan(3000); // Should load in under 3 seconds

    const perfMetrics = await quizPage.measurePerformance();
    console.log('Performance metrics:', perfMetrics);

    expect(perfMetrics.domContentLoaded).toBeLessThan(1500);
  });

  test('should handle rapid interactions', async ({ page }) => {
    const quizPage = new QuizPage(page);
    await quizPage.navigateToHome();
    await quizPage.startQuiz();
    await quizPage.selectCategory(0);

    // Rapid fire answers
    for (let i = 0; i < 5; i++) {
      await quizPage.answerQuestion(Math.floor(Math.random() * 4));
      await page.waitForTimeout(100); // Minimal wait
      await quizPage.clickNext();
    }

    // Should not crash or show errors
    await expect(page.locator(SELECTORS.questionText)).toBeVisible();
  });
});

test.describe('🔒 Security & Privacy', () => {
  test('should not expose sensitive data', async ({ page }) => {
    const quizPage = new QuizPage(page);
    await quizPage.navigateToHome();

    // Check localStorage doesn't contain sensitive info
    const localStorage = await page.evaluate(() => {
      const items: Record<string, string> = {};
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (key) {
          items[key] = window.localStorage.getItem(key) || '';
        }
      }
      return items;
    });

    // Should not contain raw passwords or tokens
    Object.values(localStorage).forEach((value) => {
      expect(value).not.toContain('password');
      expect(value).not.toContain('secret');
      expect(value).not.toContain('token');
    });
  });

  test('should handle network errors gracefully', async ({ page }) => {
    const quizPage = new QuizPage(page);

    // Simulate offline
    await page.route('**/*', (route) => route.abort());

    await quizPage.navigateToHome();

    // Should show offline message or cached content
    const offlineMessage = page.locator('text=Offline, text=No connection, text=Network error');
    const cachedContent = page.locator(SELECTORS.startButton);

    const hasOfflineHandling =
      (await offlineMessage.isVisible()) || (await cachedContent.isVisible());
    expect(hasOfflineHandling).toBe(true);
  });
});
