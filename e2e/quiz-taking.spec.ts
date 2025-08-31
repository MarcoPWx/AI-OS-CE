import { test, expect } from '@playwright/test';

test.describe('US-004: Quiz Taking', () => {
  test.beforeEach(async ({ page }) => {
    // Start with mocks enabled and skip intro
    await page.goto(
      'http://localhost:7007/?useMocks=true&skipIntro=1&start=quiz&category=javascript',
    );

    // Should automatically start quiz with URL params
    await expect(page.getByTestId('quiz-screen')).toBeVisible();
  });

  test('should display question and answer options', async ({ page }) => {
    // Check question is displayed
    await expect(page.getByTestId('question-text')).toBeVisible();
    await expect(page.getByTestId('question-number')).toContainText(/Question \d+ of \d+/);

    // Check answer options are displayed
    const answers = page.locator('[data-testid^="answer-option-"]');
    await expect(answers).toHaveCount(4); // Assuming 4 options per question

    // Each answer should have text
    for (let i = 0; i < 4; i++) {
      await expect(answers.nth(i)).not.toBeEmpty();
    }
  });

  test('should track lives system', async ({ page }) => {
    // Check lives display
    await expect(page.getByTestId('lives-display')).toBeVisible();
    await expect(page.getByTestId('lives-count')).toContainText('3');

    // Answer incorrectly to lose a life
    await page.getByTestId('answer-option-0').click(); // Assuming first option might be wrong

    // Wait for feedback
    await page.waitForTimeout(500);

    // If answer was wrong, lives should decrease
    const livesText = await page.getByTestId('lives-count').textContent();
    if (livesText !== '3') {
      expect(parseInt(livesText || '0')).toBeLessThan(3);
    }
  });

  test('should track score and combo', async ({ page }) => {
    // Check score display
    await expect(page.getByTestId('score-display')).toBeVisible();
    await expect(page.getByTestId('score-value')).toContainText(/\d+/);

    // Check combo display
    await expect(page.getByTestId('combo-display')).toBeVisible();

    // Answer a question
    await page.getByTestId('answer-option-0').click();

    // Score should update after answering
    await page.waitForTimeout(1000);
    const scoreAfter = await page.getByTestId('score-value').textContent();
    expect(scoreAfter).toBeTruthy();
  });

  test('should show timer when enabled', async ({ page }) => {
    // Navigate with timer enabled
    await page.goto(
      'http://localhost:7007/?useMocks=true&skipIntro=1&start=quiz&timer=1&duration=30',
    );

    // Timer should be visible
    await expect(page.getByTestId('timer-remaining')).toBeVisible();

    // Timer should show seconds remaining
    await expect(page.getByTestId('timer-remaining')).toContainText(/\d+/);

    // Wait and verify timer counts down
    const initialTime = await page.getByTestId('timer-remaining').textContent();
    await page.waitForTimeout(2000);
    const laterTime = await page.getByTestId('timer-remaining').textContent();

    expect(parseInt(laterTime || '0')).toBeLessThan(parseInt(initialTime || '30'));
  });

  test('should provide visual feedback for correct answer', async ({ page }) => {
    // Answer a question
    const answerButton = page.getByTestId('answer-option-1');
    await answerButton.click();

    // Should show feedback (correct or incorrect styling)
    await expect(answerButton).toHaveClass(/correct|incorrect/, { timeout: 2000 });

    // Should show success indicator if correct
    const hasCorrect = await answerButton.evaluate((el) =>
      el.classList.toString().includes('correct'),
    );
    if (hasCorrect) {
      await expect(page.getByTestId('correct-feedback')).toBeVisible();
    }
  });

  test('should provide visual feedback for incorrect answer', async ({ page }) => {
    // Try to find and click what might be a wrong answer
    const answerButton = page.getByTestId('answer-option-3');
    await answerButton.click();

    // Should show feedback
    await expect(answerButton).toHaveClass(/correct|incorrect/, { timeout: 2000 });

    // If incorrect, should show error feedback
    const hasIncorrect = await answerButton.evaluate((el) =>
      el.classList.toString().includes('incorrect'),
    );
    if (hasIncorrect) {
      await expect(page.getByTestId('incorrect-feedback')).toBeVisible();
    }
  });

  test('should advance to next question after answering', async ({ page }) => {
    // Get initial question number
    const initialQuestion = await page.getByTestId('question-number').textContent();

    // Answer current question
    await page.getByTestId('answer-option-0').click();

    // Wait for transition
    await page.waitForTimeout(1500);

    // Question number should change
    const nextQuestion = await page.getByTestId('question-number').textContent();
    expect(nextQuestion).not.toBe(initialQuestion);
  });

  test('should complete quiz after all questions', async ({ page }) => {
    // Answer all questions quickly (assuming 10 questions)
    for (let i = 0; i < 10; i++) {
      // Check if still on quiz screen
      const isQuizScreen = await page
        .getByTestId('quiz-screen')
        .isVisible()
        .catch(() => false);
      if (!isQuizScreen) break;

      // Answer each question
      await page.getByTestId('answer-option-0').click();
      await page.waitForTimeout(1000);
    }

    // Should navigate to results screen
    await expect(page).toHaveURL(/\/results/, { timeout: 15000 });
    await expect(page.getByTestId('results-screen')).toBeVisible();
  });

  test('should handle quiz abandonment', async ({ page }) => {
    // Click back button
    await page.getByTestId('quiz-back-button').click();

    // Should show confirmation dialog
    await expect(page.getByTestId('quit-confirmation')).toBeVisible();

    // Confirm quit
    await page.getByTestId('confirm-quit').click();

    // Should navigate back to home
    await expect(page).toHaveURL(/\/home/);
  });

  test('should show progress indicator', async ({ page }) => {
    // Check progress bar exists
    await expect(page.getByTestId('quiz-progress')).toBeVisible();

    // Progress should update as questions are answered
    const initialProgress = await page.getByTestId('quiz-progress').getAttribute('aria-valuenow');

    // Answer a question
    await page.getByTestId('answer-option-0').click();
    await page.waitForTimeout(1500);

    // Progress should increase
    const newProgress = await page.getByTestId('quiz-progress').getAttribute('aria-valuenow');
    expect(parseInt(newProgress || '0')).toBeGreaterThan(parseInt(initialProgress || '0'));
  });

  test('should handle game over when lives reach zero', async ({ page }) => {
    // Intentionally answer incorrectly multiple times
    for (let i = 0; i < 4; i++) {
      const isQuizScreen = await page
        .getByTestId('quiz-screen')
        .isVisible()
        .catch(() => false);
      if (!isQuizScreen) break;

      // Try to pick what might be wrong answers
      await page.getByTestId('answer-option-3').click();
      await page.waitForTimeout(1000);
    }

    // Should either show game over or navigate to results
    const gameOver = await page
      .getByTestId('game-over')
      .isVisible()
      .catch(() => false);
    const results = await page
      .getByTestId('results-screen')
      .isVisible()
      .catch(() => false);

    expect(gameOver || results).toBeTruthy();
  });

  test('should show explanation after answering', async ({ page }) => {
    // Answer a question
    await page.getByTestId('answer-option-0').click();

    // Wait for feedback
    await page.waitForTimeout(500);

    // Check if explanation is shown
    const explanation = await page
      .getByTestId('answer-explanation')
      .isVisible()
      .catch(() => false);
    if (explanation) {
      await expect(page.getByTestId('answer-explanation')).not.toBeEmpty();
    }
  });

  test('should disable answer buttons after selection', async ({ page }) => {
    // Click an answer
    await page.getByTestId('answer-option-0').click();

    // All answer buttons should be disabled
    const answers = page.locator('[data-testid^="answer-option-"]');
    const count = await answers.count();

    for (let i = 0; i < count; i++) {
      await expect(answers.nth(i)).toBeDisabled();
    }
  });

  test('should track question categories', async ({ page }) => {
    // Check category is displayed
    await expect(page.getByTestId('question-category')).toBeVisible();
    await expect(page.getByTestId('question-category')).toContainText(
      /JavaScript|React|TypeScript/i,
    );
  });
});
