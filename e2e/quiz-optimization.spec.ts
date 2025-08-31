import { test, expect, Page } from '@playwright/test';

// Helper to wait for animations
const waitForAnimation = (page: Page) => page.waitForTimeout(500);

test.describe('Optimized Quiz System E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Mock user authentication
    await page.addInitScript(() => {
      localStorage.setItem('auth_token', 'mock_token');
      localStorage.setItem('user_id', 'test_user_123');
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Adaptive Difficulty System', () => {
    test('should start with appropriate difficulty for new users', async ({ page }) => {
      // Navigate to quiz
      await page.click('[data-testid="start-quiz-btn"]');
      await page.click('[data-testid="category-basics"]');

      // First question should be easy
      await expect(page.locator('[data-testid="difficulty-indicator"]')).toHaveText(
        /Easy|Beginner/,
      );
      await expect(page.locator('[data-testid="question-number"]')).toContainText('1 of');
    });

    test('should adjust difficulty based on performance', async ({ page }) => {
      await page.click('[data-testid="start-quiz-btn"]');
      await page.click('[data-testid="category-intermediate"]');

      // Answer first question correctly
      await page.click('[data-testid="answer-option-0"]'); // Assume correct
      await page.click('[data-testid="next-question-btn"]');

      // Answer second question correctly
      await page.click('[data-testid="answer-option-0"]');
      await page.click('[data-testid="next-question-btn"]');

      // Third question should be harder
      await expect(page.locator('[data-testid="difficulty-indicator"]')).toHaveText(
        /Medium|Challenging/,
      );

      // Answer incorrectly twice
      await page.click('[data-testid="answer-option-3"]'); // Assume wrong
      await page.click('[data-testid="next-question-btn"]');
      await page.click('[data-testid="answer-option-3"]'); // Wrong again
      await page.click('[data-testid="next-question-btn"]');

      // Should get easier question (comeback mechanic)
      await expect(page.locator('[data-testid="difficulty-indicator"]')).toHaveText(/Easy|Review/);
    });

    test('should show encouragement after consecutive wrong answers', async ({ page }) => {
      await page.click('[data-testid="start-quiz-btn"]');
      await page.click('[data-testid="category-basics"]');

      // Answer incorrectly twice
      await page.click('[data-testid="answer-option-3"]');
      await expect(page.locator('[data-testid="incorrect-feedback"]')).toBeVisible();
      await page.click('[data-testid="next-question-btn"]');

      await page.click('[data-testid="answer-option-3"]');

      // Should show encouragement message
      await expect(page.locator('[data-testid="encouragement-message"]')).toBeVisible();
      await expect(page.locator('[data-testid="encouragement-message"]')).toContainText(
        /Keep going|Don't give up|You're learning/,
      );
    });
  });

  test.describe('Smart Unlocking System', () => {
    test('should show locked categories for new users', async ({ page }) => {
      // Mock new user with level 1
      await page.addInitScript(() => {
        localStorage.setItem('user_level', '1');
      });

      await page.reload();
      await page.click('[data-testid="categories-btn"]');

      // Basic categories should be unlocked
      await expect(page.locator('[data-testid="category-basics"]')).not.toHaveClass(/locked/);

      // Advanced categories should be locked
      await expect(page.locator('[data-testid="category-advanced"]')).toHaveClass(/locked/);
      await expect(page.locator('[data-testid="category-expert"]')).toHaveClass(/locked/);

      // Should show unlock requirements
      await page.hover('[data-testid="category-advanced"]');
      await expect(page.locator('[data-testid="unlock-tooltip"]')).toContainText(/Reach level 5/);
    });

    test('should unlock features progressively', async ({ page }) => {
      // Mock user with level 3
      await page.addInitScript(() => {
        localStorage.setItem('user_level', '3');
        localStorage.setItem('questions_answered', '25');
      });

      await page.reload();

      // Daily challenge should be unlocked (level 2)
      await expect(page.locator('[data-testid="daily-challenge-card"]')).toBeVisible();

      // Power-ups should be unlocked (20 questions)
      await expect(page.locator('[data-testid="powerups-btn"]')).not.toBeDisabled();

      // Multiplayer should still be locked (needs 70% accuracy)
      await expect(page.locator('[data-testid="multiplayer-btn"]')).toBeDisabled();
    });

    test('should show progress towards next unlock', async ({ page }) => {
      await page.click('[data-testid="profile-btn"]');

      // Should show next unlock milestone
      await expect(page.locator('[data-testid="next-unlock"]')).toBeVisible();
      await expect(page.locator('[data-testid="unlock-progress-bar"]')).toBeVisible();

      // Progress bar should show percentage
      const progressBar = page.locator('[data-testid="unlock-progress-bar"]');
      const progressValue = await progressBar.getAttribute('data-progress');
      expect(Number(progressValue)).toBeGreaterThan(0);
      expect(Number(progressValue)).toBeLessThanOrEqual(100);
    });
  });

  test.describe('Session Optimization', () => {
    test('should offer different session lengths', async ({ page }) => {
      await page.click('[data-testid="start-quiz-btn"]');
      await page.click('[data-testid="category-basics"]');

      // Should show session type options
      await expect(page.locator('[data-testid="session-casual"]')).toBeVisible();
      await expect(page.locator('[data-testid="session-standard"]')).toBeVisible();
      await expect(page.locator('[data-testid="session-challenge"]')).toBeVisible();

      // Select casual session
      await page.click('[data-testid="session-casual"]');

      // Should start with 5 questions
      await expect(page.locator('[data-testid="total-questions"]')).toContainText('5');

      // Should have unlimited hearts (practice mode)
      await expect(page.locator('[data-testid="hearts-display"]')).toContainText('∞');
    });

    test('should implement optimal question flow', async ({ page }) => {
      await page.click('[data-testid="start-quiz-btn"]');
      await page.click('[data-testid="category-intermediate"]');
      await page.click('[data-testid="session-standard"]'); // 7 questions

      const difficulties: string[] = [];

      for (let i = 0; i < 7; i++) {
        const difficulty = await page.locator('[data-testid="difficulty-indicator"]').textContent();
        difficulties.push(difficulty || '');

        // Answer randomly to proceed
        await page.click(`[data-testid="answer-option-${i % 4}"]`);

        if (i < 6) {
          await page.click('[data-testid="next-question-btn"]');
        }
      }

      // Check flow pattern: should start easy, peak around 70%, then cool down
      expect(difficulties[0]).toMatch(/Easy|Warm-up/);
      expect(difficulties[4] || difficulties[5]).toMatch(/Hard|Challenging/); // Peak
      expect(difficulties[6]).not.toMatch(/Expert|Very Hard/); // Cool down
    });
  });

  test.describe('Gamification and Rewards', () => {
    test('should show combo bonuses for consecutive correct answers', async ({ page }) => {
      await page.click('[data-testid="start-quiz-btn"]');
      await page.click('[data-testid="category-basics"]');
      await page.click('[data-testid="session-standard"]');

      // Answer 3 questions correctly in a row
      for (let i = 0; i < 3; i++) {
        await page.click('[data-testid="answer-option-0"]'); // Assume correct

        if (i === 2) {
          // Should show combo bonus after 3 correct
          await expect(page.locator('[data-testid="combo-notification"]')).toBeVisible();
          await expect(page.locator('[data-testid="combo-notification"]')).toContainText(
            /Combo|3x|Streak/,
          );
        }

        if (i < 2) {
          await page.click('[data-testid="next-question-btn"]');
        }
      }
    });

    test('should display dynamic XP based on difficulty and speed', async ({ page }) => {
      await page.click('[data-testid="start-quiz-btn"]');
      await page.click('[data-testid="category-intermediate"]');
      await page.click('[data-testid="session-casual"]');

      // Answer quickly
      await page.click('[data-testid="answer-option-0"]');

      // Should show XP earned with time bonus
      await expect(page.locator('[data-testid="xp-earned"]')).toBeVisible();
      await expect(page.locator('[data-testid="time-bonus"]')).toBeVisible();

      const xpText = await page.locator('[data-testid="xp-earned"]').textContent();
      const xpValue = parseInt(xpText?.match(/\d+/)?.[0] || '0');
      expect(xpValue).toBeGreaterThan(10); // Base XP with bonuses
    });

    test('should unlock achievements based on performance', async ({ page }) => {
      // Complete a perfect quiz
      await page.click('[data-testid="start-quiz-btn"]');
      await page.click('[data-testid="category-basics"]');
      await page.click('[data-testid="session-casual"]');

      // Answer all 5 questions correctly
      for (let i = 0; i < 5; i++) {
        await page.click('[data-testid="answer-option-0"]'); // Assume all correct
        if (i < 4) {
          await page.click('[data-testid="next-question-btn"]');
        }
      }

      // Complete quiz
      await page.click('[data-testid="finish-quiz-btn"]');

      // Should show perfect score achievement
      await expect(page.locator('[data-testid="achievement-popup"]')).toBeVisible();
      await expect(page.locator('[data-testid="achievement-popup"]')).toContainText(/Perfect/);
    });
  });

  test.describe('Personalization Features', () => {
    test('should adapt to user learning style', async ({ page }) => {
      // Mock visual learner profile
      await page.addInitScript(() => {
        localStorage.setItem(
          'learning_style',
          JSON.stringify({
            visual: 0.6,
            verbal: 0.2,
            logical: 0.1,
            kinesthetic: 0.1,
          }),
        );
      });

      await page.reload();
      await page.click('[data-testid="start-quiz-btn"]');
      await page.click('[data-testid="category-basics"]');
      await page.click('[data-testid="session-casual"]');

      // Should show more visual questions/hints
      await page.click('[data-testid="hint-btn"]');
      await expect(page.locator('[data-testid="hint-content"]')).toContainText(
        /Visualize|Picture|Imagine/,
      );
    });

    test('should show personalized hints based on skill level', async ({ page }) => {
      // Mock beginner user
      await page.addInitScript(() => {
        localStorage.setItem('skill_level', '1.5');
      });

      await page.reload();
      await page.click('[data-testid="start-quiz-btn"]');
      await page.click('[data-testid="category-basics"]');
      await page.click('[data-testid="session-casual"]');

      // Hints should be available for beginners
      await expect(page.locator('[data-testid="hint-btn"]')).not.toBeDisabled();

      // Click hint
      await page.click('[data-testid="hint-btn"]');
      await expect(page.locator('[data-testid="hint-content"]')).toBeVisible();
    });
  });

  test.describe('Anti-Frustration Features', () => {
    test('should implement heart system in practice mode', async ({ page }) => {
      await page.click('[data-testid="start-quiz-btn"]');
      await page.click('[data-testid="category-basics"]');
      await page.click('[data-testid="session-casual"]'); // Practice mode

      // Should show unlimited hearts
      await expect(page.locator('[data-testid="hearts-display"]')).toContainText('∞');

      // Answer incorrectly multiple times
      for (let i = 0; i < 5; i++) {
        await page.click('[data-testid="answer-option-3"]'); // Wrong
        await page.click('[data-testid="next-question-btn"]');
      }

      // Should still be able to continue (unlimited hearts)
      await expect(page.locator('[data-testid="quiz-ended-early"]')).not.toBeVisible();
    });

    test('should offer redemption questions after failures', async ({ page }) => {
      await page.click('[data-testid="start-quiz-btn"]');
      await page.click('[data-testid="category-intermediate"]');
      await page.click('[data-testid="session-standard"]');

      // Fail 2 questions in a row
      await page.click('[data-testid="answer-option-3"]'); // Wrong
      await page.click('[data-testid="next-question-btn"]');
      await page.click('[data-testid="answer-option-3"]'); // Wrong again
      await page.click('[data-testid="next-question-btn"]');

      // Next question should be marked as redemption/easier
      await expect(page.locator('[data-testid="redemption-question-badge"]')).toBeVisible();
      await expect(page.locator('[data-testid="difficulty-indicator"]')).toContainText(
        /Easy|Review/,
      );
    });

    test('should allow skipping difficult questions with tokens', async ({ page }) => {
      // Mock advanced user with skip tokens
      await page.addInitScript(() => {
        localStorage.setItem('skill_level', '4');
        localStorage.setItem('skip_tokens', '3');
      });

      await page.reload();
      await page.click('[data-testid="start-quiz-btn"]');
      await page.click('[data-testid="category-advanced"]');
      await page.click('[data-testid="session-challenge"]');

      // Skip button should be available
      await expect(page.locator('[data-testid="skip-btn"]')).toBeVisible();
      await expect(page.locator('[data-testid="skip-tokens-count"]')).toContainText('3');

      // Use skip token
      await page.click('[data-testid="skip-btn"]');

      // Should move to next question
      await expect(page.locator('[data-testid="question-number"]')).toContainText('2');
      await expect(page.locator('[data-testid="skip-tokens-count"]')).toContainText('2');
    });
  });

  test.describe('Results and Analytics', () => {
    test('should show comprehensive results after quiz', async ({ page }) => {
      await page.click('[data-testid="start-quiz-btn"]');
      await page.click('[data-testid="category-basics"]');
      await page.click('[data-testid="session-casual"]');

      // Complete quiz
      for (let i = 0; i < 5; i++) {
        await page.click(`[data-testid="answer-option-${i % 2}"]`);
        if (i < 4) {
          await page.click('[data-testid="next-question-btn"]');
        }
      }

      await page.click('[data-testid="finish-quiz-btn"]');

      // Should show results screen
      await expect(page.locator('[data-testid="results-screen"]')).toBeVisible();

      // Should display key metrics
      await expect(page.locator('[data-testid="accuracy-stat"]')).toBeVisible();
      await expect(page.locator('[data-testid="xp-earned-stat"]')).toBeVisible();
      await expect(page.locator('[data-testid="stars-earned-stat"]')).toBeVisible();
      await expect(page.locator('[data-testid="time-spent-stat"]')).toBeVisible();

      // Should show performance breakdown
      await expect(page.locator('[data-testid="difficulty-breakdown"]')).toBeVisible();
      await expect(page.locator('[data-testid="topic-mastery"]')).toBeVisible();

      // Should show next steps
      await expect(page.locator('[data-testid="recommended-next"]')).toBeVisible();
    });

    test('should track and display learning progress', async ({ page }) => {
      await page.click('[data-testid="profile-btn"]');
      await page.click('[data-testid="progress-tab"]');

      // Should show mastery levels
      await expect(page.locator('[data-testid="mastery-chart"]')).toBeVisible();

      // Should display knowledge map
      await expect(page.locator('[data-testid="knowledge-map"]')).toBeVisible();

      // Should show weak areas
      await expect(page.locator('[data-testid="weak-topics"]')).toBeVisible();

      // Should display learning style adaptation
      await expect(page.locator('[data-testid="learning-style-chart"]')).toBeVisible();
    });
  });

  test.describe('Mobile Responsiveness', () => {
    test('should work seamlessly on mobile devices', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      await page.click('[data-testid="start-quiz-btn"]');
      await page.click('[data-testid="category-basics"]');
      await page.click('[data-testid="session-casual"]');

      // All elements should be visible and clickable
      await expect(page.locator('[data-testid="question-text"]')).toBeVisible();
      await expect(page.locator('[data-testid="answer-options"]')).toBeVisible();

      // Touch interactions should work
      await page.tap('[data-testid="answer-option-0"]');
      await expect(page.locator('[data-testid="answer-feedback"]')).toBeVisible();

      // Swipe for next question (if implemented)
      const questionText = await page.locator('[data-testid="question-text"]').textContent();
      await page.locator('[data-testid="quiz-container"]').swipe({ direction: 'left' });
      await waitForAnimation(page);

      // Check if question changed
      const newQuestionText = await page.locator('[data-testid="question-text"]').textContent();
      expect(newQuestionText).not.toBe(questionText);
    });
  });

  test.describe('Performance and Loading', () => {
    test('should load questions quickly with caching', async ({ page }) => {
      const startTime = Date.now();

      await page.click('[data-testid="start-quiz-btn"]');
      await page.click('[data-testid="category-basics"]');
      await page.click('[data-testid="session-casual"]');

      // First question should load quickly
      await expect(page.locator('[data-testid="question-text"]')).toBeVisible();

      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(2000); // Should load within 2 seconds

      // Navigate through questions quickly
      for (let i = 0; i < 4; i++) {
        const questionStartTime = Date.now();
        await page.click('[data-testid="answer-option-0"]');
        await page.click('[data-testid="next-question-btn"]');
        await expect(page.locator('[data-testid="question-text"]')).toBeVisible();

        const questionLoadTime = Date.now() - questionStartTime;
        expect(questionLoadTime).toBeLessThan(500); // Subsequent questions should be faster
      }
    });

    test('should handle network failures gracefully', async ({ page }) => {
      // Simulate offline mode
      await page.context().setOffline(true);

      await page.click('[data-testid="start-quiz-btn"]');
      await page.click('[data-testid="category-basics"]');

      // Should show offline message
      await expect(page.locator('[data-testid="offline-message"]')).toBeVisible();

      // Go back online
      await page.context().setOffline(false);

      // Should recover and allow retry
      await page.click('[data-testid="retry-btn"]');
      await expect(page.locator('[data-testid="session-options"]')).toBeVisible();
    });
  });
});
