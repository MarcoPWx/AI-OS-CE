import { test, expect } from '@playwright/test';
import { createTestUser, deleteTestUser, loginUser } from './helpers/test-users';

test.describe('Quiz Flow', () => {
  let testUser: any;

  test.beforeAll(async () => {
    testUser = await createTestUser();
  });

  test.afterAll(async () => {
    await deleteTestUser(testUser.email);
  });

  test.beforeEach(async ({ page }) => {
    await loginUser(page, testUser);
    await page.click('[data-testid="quiz-tab"]');
  });

  test('should display quiz categories', async ({ page }) => {
    await expect(page.locator('[data-testid="quiz-categories"]')).toBeVisible();
    await expect(page.locator('[data-testid="category-card"]')).toHaveCount(6, { timeout: 10000 });

    // Check category details
    const firstCategory = page.locator('[data-testid="category-card"]').first();
    await expect(firstCategory.locator('[data-testid="category-name"]')).toBeVisible();
    await expect(firstCategory.locator('[data-testid="category-description"]')).toBeVisible();
    await expect(firstCategory.locator('[data-testid="category-progress"]')).toBeVisible();
  });

  test('should start a practice quiz', async ({ page }) => {
    // Select a category
    await page.click('[data-testid="category-card"]:first-child');

    // Select practice mode
    await page.click('[data-testid="practice-mode-button"]');

    // Configure quiz settings
    await page.selectOption('[data-testid="difficulty-select"]', 'medium');
    await page.selectOption('[data-testid="question-count-select"]', '10');

    // Start quiz
    await page.click('[data-testid="start-quiz-button"]');

    // Verify quiz started
    await expect(page.locator('[data-testid="quiz-screen"]')).toBeVisible();
    await expect(page.locator('[data-testid="question-number"]')).toContainText('1 / 10');
    await expect(page.locator('[data-testid="quiz-timer"]')).toBeVisible();
    await expect(page.locator('[data-testid="quiz-question"]')).toBeVisible();
    await expect(page.locator('[data-testid="answer-option"]')).toHaveCount(4);
  });

  test('should answer questions and show feedback', async ({ page }) => {
    // Start a quiz
    await page.click('[data-testid="category-card"]:first-child');
    await page.click('[data-testid="practice-mode-button"]');
    await page.click('[data-testid="start-quiz-button"]');

    // Answer first question
    await page.click('[data-testid="answer-option"]:first-child');
    await page.click('[data-testid="submit-answer-button"]');

    // Check feedback
    const feedback = page.locator('[data-testid="answer-feedback"]');
    await expect(feedback).toBeVisible();

    // Feedback should show correct/incorrect status
    const isCorrect = await feedback.getAttribute('data-correct');
    if (isCorrect === 'true') {
      await expect(feedback).toContainText('Correct!');
      await expect(page.locator('[data-testid="xp-earned"]')).toBeVisible();
    } else {
      await expect(feedback).toContainText('Incorrect');
      await expect(page.locator('[data-testid="correct-answer"]')).toBeVisible();
    }

    // Check explanation
    await expect(page.locator('[data-testid="answer-explanation"]')).toBeVisible();

    // Continue to next question
    await page.click('[data-testid="next-question-button"]');
    await expect(page.locator('[data-testid="question-number"]')).toContainText('2 / 10');
  });

  test('should complete quiz and show results', async ({ page }) => {
    // Start a short quiz
    await page.click('[data-testid="category-card"]:first-child');
    await page.click('[data-testid="practice-mode-button"]');
    await page.selectOption('[data-testid="question-count-select"]', '3');
    await page.click('[data-testid="start-quiz-button"]');

    // Answer all questions
    for (let i = 0; i < 3; i++) {
      await page.click('[data-testid="answer-option"]:first-child');
      await page.click('[data-testid="submit-answer-button"]');

      if (i < 2) {
        await page.click('[data-testid="next-question-button"]');
      } else {
        await page.click('[data-testid="finish-quiz-button"]');
      }
    }

    // Check results screen
    await expect(page.locator('[data-testid="quiz-results"]')).toBeVisible();
    await expect(page.locator('[data-testid="final-score"]')).toBeVisible();
    await expect(page.locator('[data-testid="accuracy-percentage"]')).toBeVisible();
    await expect(page.locator('[data-testid="time-spent"]')).toBeVisible();
    await expect(page.locator('[data-testid="xp-summary"]')).toBeVisible();
    await expect(page.locator('[data-testid="stars-earned"]')).toBeVisible();
  });

  test('should handle quiz timer expiry', async ({ page }) => {
    // Start a timed quiz
    await page.click('[data-testid="category-card"]:first-child');
    await page.click('[data-testid="timed-mode-button"]');
    await page.selectOption('[data-testid="time-limit-select"]', '1'); // 1 minute
    await page.click('[data-testid="start-quiz-button"]');

    // Wait for timer to expire (using test mode short timer)
    await page.evaluate(() => {
      // Simulate timer expiry in test mode
      window.dispatchEvent(new CustomEvent('quiz-timer-expired'));
    });

    // Should show time up modal
    await expect(page.locator('[data-testid="time-up-modal"]')).toBeVisible();
    await expect(page.locator('[data-testid="time-up-message"]')).toContainText("Time's up!");

    // Continue to results
    await page.click('[data-testid="view-results-button"]');
    await expect(page.locator('[data-testid="quiz-results"]')).toBeVisible();
  });

  test('should allow quiz pause and resume', async ({ page }) => {
    // Start a quiz
    await page.click('[data-testid="category-card"]:first-child');
    await page.click('[data-testid="practice-mode-button"]');
    await page.click('[data-testid="start-quiz-button"]');

    // Pause quiz
    await page.click('[data-testid="pause-button"]');
    await expect(page.locator('[data-testid="pause-modal"]')).toBeVisible();
    await expect(page.locator('[data-testid="quiz-timer"]')).toHaveAttribute('data-paused', 'true');

    // Resume quiz
    await page.click('[data-testid="resume-button"]');
    await expect(page.locator('[data-testid="quiz-screen"]')).toBeVisible();
    await expect(page.locator('[data-testid="quiz-timer"]')).toHaveAttribute(
      'data-paused',
      'false',
    );
  });

  test('should track streak bonus', async ({ page }) => {
    // Start a quiz
    await page.click('[data-testid="category-card"]:first-child');
    await page.click('[data-testid="practice-mode-button"]');
    await page.selectOption('[data-testid="question-count-select"]', '5');
    await page.click('[data-testid="start-quiz-button"]');

    // Answer multiple questions correctly in a row
    for (let i = 0; i < 3; i++) {
      // Get the correct answer (marked in test mode)
      const correctAnswer = await page.locator(
        '[data-testid="answer-option"][data-test-correct="true"]',
      );
      await correctAnswer.click();
      await page.click('[data-testid="submit-answer-button"]');

      if (i >= 2) {
        // Check for streak bonus after 3 correct answers
        await expect(page.locator('[data-testid="streak-bonus"]')).toBeVisible();
        await expect(page.locator('[data-testid="streak-count"]')).toContainText('3');
      }

      if (i < 4) {
        await page.click('[data-testid="next-question-button"]');
      }
    }
  });

  test('should start daily challenge', async ({ page }) => {
    // Navigate to daily challenge
    await page.click('[data-testid="daily-challenge-card"]');

    // Check daily challenge details
    await expect(page.locator('[data-testid="daily-challenge-modal"]')).toBeVisible();
    await expect(page.locator('[data-testid="challenge-rewards"]')).toBeVisible();
    await expect(page.locator('[data-testid="challenge-rules"]')).toBeVisible();

    // Start challenge
    await page.click('[data-testid="start-challenge-button"]');

    // Verify challenge started
    await expect(page.locator('[data-testid="quiz-screen"]')).toBeVisible();
    await expect(page.locator('[data-testid="challenge-indicator"]')).toBeVisible();
    await expect(page.locator('[data-testid="quiz-timer"]')).toContainText('5:00'); // 5 minute limit
  });

  test('should show achievements earned', async ({ page }) => {
    // Complete a perfect quiz
    await page.click('[data-testid="category-card"]:first-child');
    await page.click('[data-testid="practice-mode-button"]');
    await page.selectOption('[data-testid="question-count-select"]', '3');
    await page.click('[data-testid="start-quiz-button"]');

    // Answer all questions correctly
    for (let i = 0; i < 3; i++) {
      const correctAnswer = await page.locator(
        '[data-testid="answer-option"][data-test-correct="true"]',
      );
      await correctAnswer.click();
      await page.click('[data-testid="submit-answer-button"]');

      if (i < 2) {
        await page.click('[data-testid="next-question-button"]');
      } else {
        await page.click('[data-testid="finish-quiz-button"]');
      }
    }

    // Check for perfect score achievement
    await expect(page.locator('[data-testid="achievement-popup"]')).toBeVisible();
    await expect(page.locator('[data-testid="achievement-name"]')).toContainText('Perfect Score');
    await expect(page.locator('[data-testid="achievement-xp"]')).toBeVisible();
  });

  test('should filter categories by difficulty', async ({ page }) => {
    // Apply difficulty filter
    await page.click('[data-testid="filter-button"]');
    await page.click('[data-testid="difficulty-filter-easy"]');
    await page.click('[data-testid="apply-filters-button"]');

    // Check filtered results
    const categories = page.locator('[data-testid="category-card"]');
    const count = await categories.count();

    for (let i = 0; i < count; i++) {
      const difficulty = await categories
        .nth(i)
        .locator('[data-testid="category-difficulty"]')
        .textContent();
      expect(difficulty).toBe('Easy');
    }
  });

  test('should show quiz history', async ({ page }) => {
    // Complete a quiz first
    await page.click('[data-testid="category-card"]:first-child');
    await page.click('[data-testid="practice-mode-button"]');
    await page.selectOption('[data-testid="question-count-select"]', '3');
    await page.click('[data-testid="start-quiz-button"]');

    // Answer questions
    for (let i = 0; i < 3; i++) {
      await page.click('[data-testid="answer-option"]:first-child');
      await page.click('[data-testid="submit-answer-button"]');

      if (i < 2) {
        await page.click('[data-testid="next-question-button"]');
      } else {
        await page.click('[data-testid="finish-quiz-button"]');
      }
    }

    // Go to profile and check history
    await page.click('[data-testid="profile-tab"]');
    await page.click('[data-testid="quiz-history-button"]');

    await expect(page.locator('[data-testid="history-list"]')).toBeVisible();
    await expect(page.locator('[data-testid="history-item"]').first()).toBeVisible();

    const firstItem = page.locator('[data-testid="history-item"]').first();
    await expect(firstItem.locator('[data-testid="history-date"]')).toBeVisible();
    await expect(firstItem.locator('[data-testid="history-score"]')).toBeVisible();
    await expect(firstItem.locator('[data-testid="history-category"]')).toBeVisible();
  });
});
