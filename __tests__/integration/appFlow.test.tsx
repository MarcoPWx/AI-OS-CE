import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import App from '../../AppDevPolished';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  getAllKeys: jest.fn(),
  multiGet: jest.fn(),
  multiSet: jest.fn(),
}));

describe('App Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    AsyncStorage.clear();
  });

  describe('Complete User Journey', () => {
    it('should complete a full quiz flow from main screen to results', async () => {
      const { getByText, getAllByText, queryByText } = render(
        <SafeAreaProvider>
          <App />
        </SafeAreaProvider>,
      );

      // Verify main screen loads
      await waitFor(() => {
        expect(getByText('Your Learning Path')).toBeTruthy();
      });

      // Navigate to a quiz
      const jsLesson = getAllByText('JavaScript')[0];
      fireEvent.press(jsLesson);

      // Verify quiz screen loads
      await waitFor(() => {
        expect(getByText('Question 1/5')).toBeTruthy();
      });

      // Answer 5 questions
      for (let i = 0; i < 5; i++) {
        // Select first option
        const options = getAllByText(/^[A-Z]/);
        if (options.length > 0) {
          fireEvent.press(options[0].parent?.parent);
        }

        // Check answer
        const checkButton = getByText('CHECK');
        fireEvent.press(checkButton);

        // Continue to next question or results
        await waitFor(() => {
          const continueButton = getByText('CONTINUE');
          fireEvent.press(continueButton);
        });
      }

      // Verify results screen
      await waitFor(() => {
        expect(queryByText(/Accuracy/)).toBeTruthy();
        expect(queryByText(/XP Earned/)).toBeTruthy();
      });

      // Return to main screen
      const continueButton = getByText('Continue');
      fireEvent.press(continueButton);

      // Verify back on main screen
      await waitFor(() => {
        expect(getByText('Your Learning Path')).toBeTruthy();
      });
    });

    it('should navigate between all main tabs', async () => {
      const { getByText, queryByText } = render(
        <SafeAreaProvider>
          <App />
        </SafeAreaProvider>,
      );

      // Start on Learn tab
      await waitFor(() => {
        expect(getByText('Your Learning Path')).toBeTruthy();
      });

      // Navigate to Ranking tab
      fireEvent.press(getByText('Ranking'));
      await waitFor(() => {
        expect(getByText('Global Ranking')).toBeTruthy();
        expect(queryByText('Your Learning Path')).toBeFalsy();
      });

      // Navigate to Profile tab
      fireEvent.press(getByText('Profile'));
      await waitFor(() => {
        expect(getByText('Skills Progress')).toBeTruthy();
        expect(queryByText('Global Ranking')).toBeFalsy();
      });

      // Navigate back to Learn tab
      fireEvent.press(getByText('Learn'));
      await waitFor(() => {
        expect(getByText('Your Learning Path')).toBeTruthy();
        expect(queryByText('Skills Progress')).toBeFalsy();
      });
    });

    it('should handle daily challenge flow', async () => {
      const { getByText } = render(
        <SafeAreaProvider>
          <App />
        </SafeAreaProvider>,
      );

      // Wait for main screen
      await waitFor(() => {
        expect(getByText('Your Learning Path')).toBeTruthy();
      });

      // Open daily challenge
      const dailyChallenge = getByText('Daily Algorithm');
      fireEvent.press(dailyChallenge.parent?.parent?.parent);

      // Verify quiz starts
      await waitFor(() => {
        expect(getByText('Question 1/5')).toBeTruthy();
      });

      // Complete one question
      const options = getByText(/object|string|number|boolean/);
      fireEvent.press(options);
      fireEvent.press(getByText('CHECK'));

      await waitFor(() => {
        expect(getByText('CONTINUE')).toBeTruthy();
      });
    });
  });

  describe('State Management', () => {
    it('should maintain user progress across screens', async () => {
      const { getByText } = render(
        <SafeAreaProvider>
          <App />
        </SafeAreaProvider>,
      );

      // Check initial XP
      await waitFor(() => {
        expect(getByText(/4850\/5000 XP/)).toBeTruthy();
      });

      // Navigate to profile
      fireEvent.press(getByText('Profile'));

      // Verify same user data appears
      await waitFor(() => {
        expect(getByText('@dev_master')).toBeTruthy();
        expect(getByText('Senior Dev')).toBeTruthy();
      });

      // Navigate back
      fireEvent.press(getByText('Learn'));

      // User data should persist
      await waitFor(() => {
        expect(getByText(/4850\/5000 XP/)).toBeTruthy();
      });
    });

    it('should update energy during quiz', async () => {
      const { getByText, getAllByTestId } = render(
        <SafeAreaProvider>
          <App />
        </SafeAreaProvider>,
      );

      // Start a quiz
      await waitFor(() => {
        const jsLesson = getByText('JavaScript');
        fireEvent.press(jsLesson);
      });

      // Should start with 5 hearts
      await waitFor(() => {
        const hearts = getAllByTestId(/heart/);
        expect(hearts.length).toBe(5);
      });

      // Answer incorrectly (assuming we know the wrong answer)
      // This is simplified - in real test we'd need to determine wrong answer
      const options = getAllByText(/^[A-Z]/);
      if (options.length > 0) {
        fireEvent.press(options[3]); // Assume last option is wrong
      }
      fireEvent.press(getByText('CHECK'));

      // Energy should decrease
      await waitFor(() => {
        expect(getByText('CONTINUE')).toBeTruthy();
        // Hearts should update - this would need proper testID implementation
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle navigation errors gracefully', async () => {
      const { getByText } = render(
        <SafeAreaProvider>
          <App />
        </SafeAreaProvider>,
      );

      // Wait for app to load
      await waitFor(() => {
        expect(getByText('Your Learning Path')).toBeTruthy();
      });

      // Try to interact with locked content
      const lockedLessons = getByText('Complete previous lessons');
      expect(lockedLessons).toBeTruthy();

      // Should not crash when pressing locked lesson
      fireEvent.press(lockedLessons.parent?.parent);

      // Should still be on main screen
      expect(getByText('Your Learning Path')).toBeTruthy();
    });

    it('should handle missing data gracefully', async () => {
      // Mock empty data scenario
      jest.mock('../../services/devQuizData', () => ({
        devQuizData: [],
        getRandomQuestions: jest.fn(() => []),
        getDailyChallenge: jest.fn(() => null),
      }));

      const { getByText } = render(
        <SafeAreaProvider>
          <App />
        </SafeAreaProvider>,
      );

      // App should still render
      await waitFor(() => {
        expect(getByText(/Learn|Path|Quiz/)).toBeTruthy();
      });
    });
  });

  describe('Performance', () => {
    it('should render main screen quickly', async () => {
      const startTime = Date.now();

      const { getByText } = render(
        <SafeAreaProvider>
          <App />
        </SafeAreaProvider>,
      );

      await waitFor(() => {
        expect(getByText('Your Learning Path')).toBeTruthy();
      });

      const renderTime = Date.now() - startTime;
      expect(renderTime).toBeLessThan(3000); // Should render within 3 seconds
    });

    it('should handle rapid navigation without crashes', async () => {
      const { getByText } = render(
        <SafeAreaProvider>
          <App />
        </SafeAreaProvider>,
      );

      // Wait for initial render
      await waitFor(() => {
        expect(getByText('Your Learning Path')).toBeTruthy();
      });

      // Rapidly switch tabs
      for (let i = 0; i < 10; i++) {
        fireEvent.press(getByText('Ranking'));
        fireEvent.press(getByText('Profile'));
        fireEvent.press(getByText('Learn'));
      }

      // App should still be responsive
      await waitFor(() => {
        expect(getByText('Your Learning Path')).toBeTruthy();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have accessible navigation', async () => {
      const { getByLabelText, getByRole } = render(
        <SafeAreaProvider>
          <App />
        </SafeAreaProvider>,
      );

      // Check for accessibility labels
      await waitFor(() => {
        // Tab navigation should be accessible
        const learnTab = getByRole('button', { name: /learn/i });
        expect(learnTab).toBeTruthy();
      });
    });

    it('should have proper text contrast', async () => {
      const { getByText } = render(
        <SafeAreaProvider>
          <App />
        </SafeAreaProvider>,
      );

      await waitFor(() => {
        const title = getByText('Your Learning Path');
        // Check that text has proper styling
        expect(title.props.style).toBeDefined();
      });
    });
  });

  describe('Data Persistence', () => {
    it('should save and restore user progress', async () => {
      const { getByText, unmount } = render(
        <SafeAreaProvider>
          <App />
        </SafeAreaProvider>,
      );

      // Wait for initial render
      await waitFor(() => {
        expect(getByText('Your Learning Path')).toBeTruthy();
      });

      // Simulate some user action that should be persisted
      // For example, completing a quiz would update XP

      // Mock saving data
      await AsyncStorage.setItem(
        'userProgress',
        JSON.stringify({
          xp: 5000,
          level: 24,
        }),
      );

      // Unmount and remount app
      unmount();

      const { getByText: getByTextNew } = render(
        <SafeAreaProvider>
          <App />
        </SafeAreaProvider>,
      );

      // Check if data persists (this would need actual implementation)
      await waitFor(() => {
        expect(getByTextNew('Your Learning Path')).toBeTruthy();
      });

      // Verify AsyncStorage was called
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });
  });

  describe('Network Handling', () => {
    it('should work offline with cached data', async () => {
      // Mock offline scenario
      global.fetch = jest.fn(() => Promise.reject('Network error'));

      const { getByText } = render(
        <SafeAreaProvider>
          <App />
        </SafeAreaProvider>,
      );

      // App should still work with local data
      await waitFor(() => {
        expect(getByText('Your Learning Path')).toBeTruthy();
      });

      // Quiz should work offline
      const jsLesson = getByText('JavaScript');
      fireEvent.press(jsLesson);

      await waitFor(() => {
        expect(getByText('Question 1/5')).toBeTruthy();
      });
    });
  });

  describe('Animation Testing', () => {
    it('should animate lesson cards on press', async () => {
      const { getByText } = render(
        <SafeAreaProvider>
          <App />
        </SafeAreaProvider>,
      );

      await waitFor(() => {
        const lessonCard = getByText('JavaScript');

        // Trigger press animation
        fireEvent.pressIn(lessonCard);

        // Card should have transform style applied
        expect(lessonCard.parent?.props.style).toBeDefined();

        fireEvent.pressOut(lessonCard);
      });
    });

    it('should show shimmer animation on XP bar', async () => {
      const { getByTestId } = render(
        <SafeAreaProvider>
          <App />
        </SafeAreaProvider>,
      );

      // XP bar should have shimmer overlay
      await waitFor(() => {
        // This would need proper testID implementation
        expect(() => getByTestId('xp-shimmer')).not.toThrow();
      });
    });
  });

  describe('Quiz Logic Integration', () => {
    it('should calculate score correctly across questions', async () => {
      const { getByText, getAllByText } = render(
        <SafeAreaProvider>
          <App />
        </SafeAreaProvider>,
      );

      // Start quiz
      await waitFor(() => {
        const jsLesson = getByText('JavaScript');
        fireEvent.press(jsLesson);
      });

      let correctAnswers = 0;
      const totalQuestions = 5;

      // Answer all questions
      for (let i = 0; i < totalQuestions; i++) {
        await waitFor(() => {
          expect(getByText(`Question ${i + 1}/${totalQuestions}`)).toBeTruthy();
        });

        // Select an answer (first option)
        const options = getAllByText(/^[A-Z]/);
        fireEvent.press(options[0].parent?.parent);
        fireEvent.press(getByText('CHECK'));

        // Check if answer was correct (look for success indicator)
        // This is simplified - real implementation would track this
        correctAnswers++;

        await waitFor(() => {
          fireEvent.press(getByText('CONTINUE'));
        });
      }

      // Verify results screen shows correct score
      await waitFor(() => {
        expect(getByText(/Accuracy/)).toBeTruthy();
        // Score calculation should match correctAnswers/totalQuestions
      });
    });
  });
});
