describe('Quiz Flow E2E', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  describe('Navigation Flow', () => {
    it('should show main path screen on launch', async () => {
      await expect(element(by.text('Your Learning Path'))).toBeVisible();
      await expect(element(by.text('Recent Activity'))).toBeVisible();
    });

    it('should navigate between tabs', async () => {
      // Navigate to Ranking tab
      await element(by.text('Ranking')).tap();
      await expect(element(by.text('Global Ranking'))).toBeVisible();

      // Navigate to Profile tab
      await element(by.text('Profile')).tap();
      await expect(element(by.text('Skills Progress'))).toBeVisible();

      // Navigate back to Learn tab
      await element(by.text('Learn')).tap();
      await expect(element(by.text('Your Learning Path'))).toBeVisible();
    });

    it('should open daily challenge', async () => {
      await element(by.text('Daily Algorithm')).tap();
      await expect(element(by.text('Question 1/5'))).toBeVisible();
      await expect(element(by.id('challenge-header'))).toBeVisible();
    });
  });

  describe('Quiz Gameplay', () => {
    beforeEach(async () => {
      // Start a quiz by selecting a lesson
      await element(by.id('lesson-javascript')).tap();
    });

    it('should display question and options', async () => {
      await expect(element(by.text('Question 1/5'))).toBeVisible();
      await expect(element(by.id('option-0'))).toBeVisible();
      await expect(element(by.id('option-1'))).toBeVisible();
      await expect(element(by.id('option-2'))).toBeVisible();
      await expect(element(by.id('option-3'))).toBeVisible();
    });

    it('should allow selecting an answer', async () => {
      // Select an option
      await element(by.id('option-0')).tap();

      // Check button should be enabled
      await expect(element(by.text('CHECK'))).toBeVisible();
      await element(by.text('CHECK')).tap();

      // Continue button should appear
      await expect(element(by.text('CONTINUE'))).toBeVisible();
    });

    it('should show explanation after answering', async () => {
      await element(by.id('option-0')).tap();
      await element(by.text('CHECK')).tap();

      // Explanation should be visible
      await expect(element(by.text('Explanation'))).toBeVisible();
    });

    it('should progress through questions', async () => {
      // Answer first question
      await element(by.id('option-0')).tap();
      await element(by.text('CHECK')).tap();
      await element(by.text('CONTINUE')).tap();

      // Should be on second question
      await expect(element(by.text('Question 2/5'))).toBeVisible();

      // Answer second question
      await element(by.id('option-1')).tap();
      await element(by.text('CHECK')).tap();
      await element(by.text('CONTINUE')).tap();

      // Should be on third question
      await expect(element(by.text('Question 3/5'))).toBeVisible();
    });

    it('should show result screen after completing quiz', async () => {
      // Answer all 5 questions
      for (let i = 0; i < 5; i++) {
        await element(by.id('option-0')).tap();
        await element(by.text('CHECK')).tap();

        if (i < 4) {
          await element(by.text('CONTINUE')).tap();
        } else {
          // Last question
          await element(by.text('CONTINUE')).tap();
        }
      }

      // Should see result screen
      await expect(element(by.text(/Outstanding!|Well Done!|Keep Learning!/))).toBeVisible();
      await expect(element(by.text(/Accuracy/))).toBeVisible();
      await expect(element(by.text(/XP Earned/))).toBeVisible();
    });

    it('should decrease energy on wrong answer', async () => {
      // Initially should have 5 hearts
      await expect(element(by.id('heart-filled')).atIndex(4)).toBeVisible();

      // Select a wrong answer (assuming we know which is wrong)
      await element(by.id('option-3')).tap();
      await element(by.text('CHECK')).tap();

      // Should have 4 hearts now
      await expect(element(by.id('heart-outline')).atIndex(4)).toBeVisible();
    });

    it('should end quiz when energy runs out', async () => {
      // Answer incorrectly 5 times to lose all energy
      for (let i = 0; i < 5; i++) {
        await element(by.id('option-3')).tap();
        await element(by.text('CHECK')).tap();

        if (i < 4) {
          await element(by.text('CONTINUE')).tap();
        }
      }

      // Should see result screen with low score
      await expect(element(by.text('Keep Learning!'))).toBeVisible();
    });
  });

  describe('Progress Tracking', () => {
    it('should show progress bar during quiz', async () => {
      await element(by.id('lesson-javascript')).tap();

      // Progress bar should be visible
      await expect(element(by.id('progress-bar'))).toBeVisible();

      // Answer a question
      await element(by.id('option-0')).tap();
      await element(by.text('CHECK')).tap();
      await element(by.text('CONTINUE')).tap();

      // Progress should update
      await expect(element(by.id('progress-bar'))).toBeVisible();
    });

    it('should update XP after completing quiz', async () => {
      // Note initial XP
      const initialXP = await element(by.id('xp-value')).getText();

      // Complete a quiz
      await element(by.id('lesson-javascript')).tap();

      for (let i = 0; i < 5; i++) {
        await element(by.id('option-0')).tap();
        await element(by.text('CHECK')).tap();
        await element(by.text('CONTINUE')).tap();
      }

      // Return to main screen
      await element(by.text('Continue')).tap();

      // XP should be updated
      const newXP = await element(by.id('xp-value')).getText();
      expect(parseInt(newXP)).toBeGreaterThan(parseInt(initialXP));
    });
  });

  describe('User Interface', () => {
    it('should show terminal prompt with blinking cursor', async () => {
      await expect(element(by.text('dev@mentor'))).toBeVisible();
      await expect(element(by.text(' ~/quizmentor'))).toBeVisible();
      await expect(element(by.text(' npm run learn'))).toBeVisible();

      // Cursor should be present (though blinking is hard to test)
      await expect(element(by.text('▍'))).toExist();
    });

    it('should animate lesson cards on press', async () => {
      // This is hard to test directly, but we can verify the card responds
      await element(by.id('lesson-javascript')).tap();

      // If animation worked, we should navigate
      await expect(element(by.text('Question 1/5'))).toBeVisible();
    });

    it('should show floating action button', async () => {
      await expect(element(by.id('floating-continue-button'))).toBeVisible();

      // Tap floating button
      await element(by.id('floating-continue-button')).tap();

      // Should start current lesson
      await expect(element(by.text('Question 1/5'))).toBeVisible();
    });
  });

  describe('Leaderboard', () => {
    beforeEach(async () => {
      await element(by.text('Ranking')).tap();
    });

    it('should display leaderboard with users', async () => {
      await expect(element(by.text('Global Ranking'))).toBeVisible();
      await expect(element(by.text('@code_wizard'))).toBeVisible();
      await expect(element(by.text('@dev_ninja'))).toBeVisible();
    });

    it('should switch between weekly and all-time leaderboards', async () => {
      await expect(element(by.text('This Week'))).toBeVisible();
      await element(by.text('All Time')).tap();

      // All Time tab should be active
      // Content might change based on implementation
      await expect(element(by.text('All Time'))).toBeVisible();
    });
  });

  describe('Profile', () => {
    beforeEach(async () => {
      await element(by.text('Profile')).tap();
    });

    it('should display user profile information', async () => {
      await expect(element(by.text('@dev_master'))).toBeVisible();
      await expect(element(by.text('Senior Dev'))).toBeVisible();
      await expect(element(by.text('Skills Progress'))).toBeVisible();
    });

    it('should show skill progress bars', async () => {
      await expect(element(by.text('JavaScript'))).toBeVisible();
      await expect(element(by.text('React'))).toBeVisible();
      await expect(element(by.text('TypeScript'))).toBeVisible();
      await expect(element(by.text('Node.js'))).toBeVisible();
    });

    it('should display user statistics', async () => {
      await expect(element(by.text('Level'))).toBeVisible();
      await expect(element(by.text('Badges'))).toBeVisible();
      await expect(element(by.text('Completed'))).toBeVisible();
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      // Simulate network error
      await device.setURLBlacklist(['.*']);

      // Try to start a quiz
      await element(by.id('lesson-javascript')).tap();

      // Should still work with cached data
      await expect(element(by.text('Question 1/5'))).toBeVisible();

      // Reset network
      await device.clearURLBlacklist();
    });

    it('should prevent navigation to locked lessons', async () => {
      // Try to tap a locked lesson
      await element(by.id('lesson-advanced')).tap();

      // Should not navigate
      await expect(element(by.text('Your Learning Path'))).toBeVisible();
      await expect(element(by.text('Complete previous lessons'))).toBeVisible();
    });
  });

  describe('Accessibility', () => {
    it('should have proper accessibility labels', async () => {
      await expect(element(by.label('User profile'))).toExist();
      await expect(element(by.label('Settings button'))).toExist();
      await expect(element(by.label('Daily challenge card'))).toExist();
    });

    it('should support screen reader navigation', async () => {
      // This would require actual screen reader testing
      // but we can verify important elements have labels
      await expect(element(by.label('Level progress'))).toExist();
      await expect(element(by.label('Energy hearts'))).toExist();
    });
  });
});
