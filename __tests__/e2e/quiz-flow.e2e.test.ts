// __tests__/e2e/quiz-flow.e2e.test.ts
import { by, device, element, expect as detoxExpect, waitFor } from 'detox';

describe('Quiz Flow E2E', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  describe('Complete Quiz Flow', () => {
    it('should complete a full quiz with gamification', async () => {
      // Navigate to quiz screen
      await element(by.id('category-javascript')).tap();
      await element(by.id('start-quiz-button')).tap();

      // Wait for questions to load
      await waitFor(element(by.id('quiz-question')))
        .toBeVisible()
        .withTimeout(5000);

      // Answer first question correctly
      await element(by.id('answer-option-0')).tap();

      // Verify feedback appears
      await waitFor(element(by.id('answer-feedback')))
        .toBeVisible()
        .withTimeout(2000);

      // Verify XP gain animation
      await waitFor(element(by.id('xp-gain-animation')))
        .toBeVisible()
        .withTimeout(1000);

      // Wait for auto-advance
      await waitFor(element(by.text('2 / 10')))
        .toBeVisible()
        .withTimeout(3000);

      // Answer second question correctly to trigger combo
      await element(by.id('answer-option-0')).tap();

      // Verify combo multiplier appears
      await waitFor(element(by.id('combo-multiplier')))
        .toBeVisible()
        .withTimeout(2000);

      // Continue answering questions to complete quiz
      for (let i = 2; i < 10; i++) {
        await waitFor(element(by.id('answer-option-0')))
          .toBeVisible()
          .withTimeout(3000);
        await element(by.id('answer-option-0')).tap();

        if (i < 9) {
          await waitFor(element(by.text(`${i + 2} / 10`)))
            .toBeVisible()
            .withTimeout(3000);
        }
      }

      // Verify results screen
      await waitFor(element(by.id('quiz-results')))
        .toBeVisible()
        .withTimeout(5000);

      // Verify score display
      await detoxExpect(element(by.id('final-score'))).toBeVisible();
      await detoxExpect(element(by.id('accuracy-percentage'))).toBeVisible();

      // Verify gamification elements
      await detoxExpect(element(by.id('xp-gained'))).toBeVisible();
      await detoxExpect(element(by.id('level-display'))).toBeVisible();
    });

    it('should trigger achievement popup for first quiz', async () => {
      // Clear app data to simulate first-time user
      await device.clearKeychain();
      await device.reloadReactNative();

      // Start first quiz
      await element(by.id('category-javascript')).tap();
      await element(by.id('start-quiz-button')).tap();

      // Complete the quiz
      for (let i = 0; i < 10; i++) {
        await waitFor(element(by.id('answer-option-0')))
          .toBeVisible()
          .withTimeout(3000);
        await element(by.id('answer-option-0')).tap();

        if (i < 9) {
          await waitFor(element(by.text(`${i + 2} / 10`)))
            .toBeVisible()
            .withTimeout(3000);
        }
      }

      // Verify achievement popup appears
      await waitFor(element(by.id('achievement-popup')))
        .toBeVisible()
        .withTimeout(5000);

      await detoxExpect(element(by.text('Welcome!'))).toBeVisible();
      await detoxExpect(element(by.text('Complete your first quiz'))).toBeVisible();

      // Close achievement popup
      await element(by.id('achievement-close-button')).tap();

      // Verify popup is dismissed
      await waitFor(element(by.id('achievement-popup')))
        .not.toBeVisible()
        .withTimeout(2000);
    });

    it('should handle wrong answers and break combo', async () => {
      await element(by.id('category-javascript')).tap();
      await element(by.id('start-quiz-button')).tap();

      // Answer first question correctly
      await waitFor(element(by.id('answer-option-0')))
        .toBeVisible()
        .withTimeout(5000);
      await element(by.id('answer-option-0')).tap();

      // Wait for next question
      await waitFor(element(by.text('2 / 10')))
        .toBeVisible()
        .withTimeout(3000);

      // Answer second question correctly to build combo
      await element(by.id('answer-option-0')).tap();

      // Verify combo appears
      await waitFor(element(by.id('combo-multiplier')))
        .toBeVisible()
        .withTimeout(2000);

      // Wait for next question
      await waitFor(element(by.text('3 / 10')))
        .toBeVisible()
        .withTimeout(3000);

      // Answer third question incorrectly
      await element(by.id('answer-option-1')).tap();

      // Verify shake animation for wrong answer
      await waitFor(element(by.id('shake-animation')))
        .toBeVisible()
        .withTimeout(1000);

      // Verify combo is broken (multiplier disappears)
      await waitFor(element(by.id('combo-multiplier')))
        .not.toBeVisible()
        .withTimeout(2000);

      // Verify explanation appears
      await waitFor(element(by.id('answer-explanation')))
        .toBeVisible()
        .withTimeout(2000);
    });

    it('should show perfect score achievement', async () => {
      await element(by.id('category-javascript')).tap();
      await element(by.id('start-quiz-button')).tap();

      // Answer all questions correctly
      for (let i = 0; i < 10; i++) {
        await waitFor(element(by.id('answer-option-0')))
          .toBeVisible()
          .withTimeout(3000);
        await element(by.id('answer-option-0')).tap();

        if (i < 9) {
          await waitFor(element(by.text(`${i + 2} / 10`)))
            .toBeVisible()
            .withTimeout(3000);
        }
      }

      // Verify perfect score achievement
      await waitFor(element(by.id('achievement-popup')))
        .toBeVisible()
        .withTimeout(5000);

      await detoxExpect(element(by.text('Perfectionist'))).toBeVisible();
      await detoxExpect(element(by.text('Get 100% on a quiz'))).toBeVisible();
    });
  });

  describe('Performance and Animations', () => {
    it('should have smooth animations without lag', async () => {
      await element(by.id('category-javascript')).tap();
      await element(by.id('start-quiz-button')).tap();

      // Measure animation performance
      const startTime = Date.now();

      await waitFor(element(by.id('quiz-question')))
        .toBeVisible()
        .withTimeout(5000);

      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(3000); // Should load within 3 seconds

      // Test answer selection responsiveness
      const answerStartTime = Date.now();
      await element(by.id('answer-option-0')).tap();

      await waitFor(element(by.id('answer-feedback')))
        .toBeVisible()
        .withTimeout(1000);

      const responseTime = Date.now() - answerStartTime;
      expect(responseTime).toBeLessThan(500); // Should respond within 500ms
    });

    it('should handle rapid answer selections gracefully', async () => {
      await element(by.id('category-javascript')).tap();
      await element(by.id('start-quiz-button')).tap();

      await waitFor(element(by.id('answer-option-0')))
        .toBeVisible()
        .withTimeout(5000);

      // Rapidly tap answer options (stress test)
      await element(by.id('answer-option-0')).tap();
      await element(by.id('answer-option-1')).tap();
      await element(by.id('answer-option-2')).tap();

      // Should still show feedback for first selection only
      await waitFor(element(by.id('answer-feedback')))
        .toBeVisible()
        .withTimeout(2000);

      // Should advance to next question normally
      await waitFor(element(by.text('2 / 10')))
        .toBeVisible()
        .withTimeout(3000);
    });
  });

  describe('Offline Functionality', () => {
    it('should work offline with cached questions', async () => {
      // First, load questions while online
      await element(by.id('category-javascript')).tap();
      await element(by.id('start-quiz-button')).tap();

      await waitFor(element(by.id('quiz-question')))
        .toBeVisible()
        .withTimeout(5000);

      // Go back to home
      await element(by.id('back-button')).tap();

      // Simulate offline mode
      await device.setNetworkConnection('none');

      // Try to start quiz again (should use cached data)
      await element(by.id('category-javascript')).tap();
      await element(by.id('start-quiz-button')).tap();

      // Should still load questions from cache
      await waitFor(element(by.id('quiz-question')))
        .toBeVisible()
        .withTimeout(5000);

      // Complete a question to verify functionality
      await element(by.id('answer-option-0')).tap();

      await waitFor(element(by.id('answer-feedback')))
        .toBeVisible()
        .withTimeout(2000);

      // Restore network
      await device.setNetworkConnection('wifi');
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      // Simulate network error
      await device.setNetworkConnection('none');

      await element(by.id('category-javascript')).tap();
      await element(by.id('start-quiz-button')).tap();

      // Should show loading state or fallback content
      await waitFor(element(by.id('quiz-question')))
        .toBeVisible()
        .withTimeout(10000);

      // Restore network
      await device.setNetworkConnection('wifi');
    });

    it('should handle app backgrounding during quiz', async () => {
      await element(by.id('category-javascript')).tap();
      await element(by.id('start-quiz-button')).tap();

      await waitFor(element(by.id('quiz-question')))
        .toBeVisible()
        .withTimeout(5000);

      // Background the app
      await device.sendToHome();
      await device.launchApp();

      // Should resume quiz state
      await detoxExpect(element(by.id('quiz-question'))).toBeVisible();
    });
  });

  describe('Accessibility', () => {
    it('should be accessible with screen reader', async () => {
      await element(by.id('category-javascript')).tap();
      await element(by.id('start-quiz-button')).tap();

      await waitFor(element(by.id('quiz-question')))
        .toBeVisible()
        .withTimeout(5000);

      // Verify accessibility labels exist
      await detoxExpect(element(by.id('quiz-question'))).toHaveAccessibilityLabel();
      await detoxExpect(element(by.id('answer-option-0'))).toHaveAccessibilityLabel();
      await detoxExpect(element(by.id('progress-indicator'))).toHaveAccessibilityLabel();
    });
  });
});
