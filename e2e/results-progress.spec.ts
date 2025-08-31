import { test, expect } from '@playwright/test';

test.describe('US-005: Results & Progress', () => {
  test.beforeEach(async ({ page }) => {
    // Complete a quiz first to get to results
    await page.goto(
      'http://localhost:7007/?useMocks=true&skipIntro=1&start=quiz&category=javascript',
    );

    // Answer 5 questions quickly to get to results
    for (let i = 0; i < 5; i++) {
      const isQuizScreen = await page
        .getByTestId('quiz-screen')
        .isVisible()
        .catch(() => false);
      if (!isQuizScreen) break;

      // Alternate between correct and incorrect answers for varied results
      const optionIndex = i % 2 === 0 ? 0 : 2;
      await page.getByTestId(`answer-option-${optionIndex}`).click();
      await page.waitForTimeout(1000);
    }

    // Should be on results screen
    await expect(page.getByTestId('results-screen')).toBeVisible({ timeout: 10000 });
  });

  test('should display final score', async ({ page }) => {
    // Check score is displayed
    await expect(page.getByTestId('final-score')).toBeVisible();
    await expect(page.getByTestId('final-score')).toContainText(/\d+/);

    // Check score breakdown
    await expect(page.getByTestId('score-percentage')).toBeVisible();
    await expect(page.getByTestId('score-percentage')).toContainText(/%/);
  });

  test('should show questions answered correctly', async ({ page }) => {
    // Check correct answers count
    await expect(page.getByTestId('correct-answers')).toBeVisible();
    await expect(page.getByTestId('correct-answers')).toContainText(/\d+ \/ \d+/);

    // Check visual representation (e.g., progress bar or pie chart)
    await expect(page.getByTestId('score-visual')).toBeVisible();
  });

  test('should display performance rating', async ({ page }) => {
    // Check performance badge/rating
    await expect(page.getByTestId('performance-rating')).toBeVisible();

    // Should have a rating text (Excellent, Good, Needs Improvement, etc.)
    const ratingText = await page.getByTestId('performance-rating').textContent();
    expect(ratingText).toMatch(/Excellent|Great|Good|Fair|Needs Improvement/i);
  });

  test('should show XP earned', async ({ page }) => {
    // Check XP display
    await expect(page.getByTestId('xp-earned')).toBeVisible();
    await expect(page.getByTestId('xp-earned')).toContainText(/\+\d+ XP/);

    // Check if level progress is shown
    await expect(page.getByTestId('level-progress')).toBeVisible();
  });

  test('should display time taken', async ({ page }) => {
    // Check time taken display
    await expect(page.getByTestId('time-taken')).toBeVisible();
    await expect(page.getByTestId('time-taken')).toContainText(/\d+:\d+|\d+ seconds?/);
  });

  test('should show category and difficulty', async ({ page }) => {
    // Check category is displayed
    await expect(page.getByTestId('quiz-category')).toBeVisible();
    await expect(page.getByTestId('quiz-category')).toContainText(/JavaScript|React|TypeScript/i);

    // Check difficulty is displayed
    await expect(page.getByTestId('quiz-difficulty')).toBeVisible();
    await expect(page.getByTestId('quiz-difficulty')).toContainText(
      /Beginner|Intermediate|Expert/i,
    );
  });

  test('should provide retry option', async ({ page }) => {
    // Check retry button exists
    await expect(page.getByTestId('retry-quiz-button')).toBeVisible();

    // Click retry
    await page.getByTestId('retry-quiz-button').click();

    // Should navigate back to quiz
    await expect(page).toHaveURL(/\/quiz/);
    await expect(page.getByTestId('quiz-screen')).toBeVisible();
  });

  test('should provide home navigation', async ({ page }) => {
    // Check home button exists
    await expect(page.getByTestId('go-home-button')).toBeVisible();

    // Click home
    await page.getByTestId('go-home-button').click();

    // Should navigate to home
    await expect(page).toHaveURL(/\/home/);
  });

  test('should show achievement unlocked if applicable', async ({ page }) => {
    // Check if achievement popup exists (conditional)
    const achievementExists = await page
      .getByTestId('achievement-unlocked')
      .isVisible()
      .catch(() => false);

    if (achievementExists) {
      await expect(page.getByTestId('achievement-title')).toBeVisible();
      await expect(page.getByTestId('achievement-description')).toBeVisible();
      await expect(page.getByTestId('achievement-icon')).toBeVisible();
    }
  });

  test('should display streak information', async ({ page }) => {
    // Check streak display
    await expect(page.getByTestId('streak-info')).toBeVisible();

    // Should show current streak
    const streakText = await page.getByTestId('streak-info').textContent();
    expect(streakText).toMatch(/\d+ day streak|Streak: \d+/i);
  });

  test('should show leaderboard position', async ({ page }) => {
    // Check leaderboard ranking
    await expect(page.getByTestId('leaderboard-position')).toBeVisible();
    await expect(page.getByTestId('leaderboard-position')).toContainText(/#\d+|Position: \d+/);

    // Check link to full leaderboard
    await expect(page.getByTestId('view-leaderboard-link')).toBeVisible();
  });

  test('should allow sharing results', async ({ page }) => {
    // Check share button exists
    await expect(page.getByTestId('share-results-button')).toBeVisible();

    // Click share
    await page.getByTestId('share-results-button').click();

    // Should show share options
    await expect(page.getByTestId('share-options')).toBeVisible();
    await expect(page.getByTestId('share-twitter')).toBeVisible();
    await expect(page.getByTestId('share-facebook')).toBeVisible();
    await expect(page.getByTestId('share-copy-link')).toBeVisible();
  });

  test('should show question review option', async ({ page }) => {
    // Check review button exists
    await expect(page.getByTestId('review-answers-button')).toBeVisible();

    // Click review
    await page.getByTestId('review-answers-button').click();

    // Should show question review modal or navigate to review
    await expect(page.getByTestId('question-review')).toBeVisible();

    // Should show each question with correct/incorrect status
    const reviewItems = page.locator('[data-testid^="review-question-"]');
    await expect(reviewItems).toHaveCount({ minimum: 1 });
  });

  test('should save progress to user profile', async ({ page }) => {
    // Navigate to profile
    await page.getByTestId('go-home-button').click();
    await page.getByTestId('profile-button').click();

    // Check recent activity includes this quiz
    await expect(page.getByTestId('recent-activity')).toBeVisible();

    const recentQuiz = page
      .locator('[data-testid="recent-activity"] [data-testid^="activity-"]')
      .first();
    await expect(recentQuiz).toContainText(/JavaScript/i);
  });

  test('should show improvement suggestions', async ({ page }) => {
    // Check for improvement section
    await expect(page.getByTestId('improvement-suggestions')).toBeVisible();

    // Should have at least one suggestion
    const suggestions = page.locator('[data-testid^="suggestion-"]');
    await expect(suggestions).toHaveCount({ minimum: 1 });

    // Each suggestion should have text
    const firstSuggestion = suggestions.first();
    await expect(firstSuggestion).not.toBeEmpty();
  });

  test('should display next recommended quiz', async ({ page }) => {
    // Check for next quiz recommendation
    await expect(page.getByTestId('next-quiz-recommendation')).toBeVisible();

    // Should show category and difficulty
    await expect(page.getByTestId('next-quiz-category')).toBeVisible();
    await expect(page.getByTestId('next-quiz-difficulty')).toBeVisible();

    // Should have start button
    await expect(page.getByTestId('start-next-quiz')).toBeVisible();
  });
});
