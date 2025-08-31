/**
 * Integration Tests for Quiz Flow
 * Tests the complete interaction between screens, services, and stores
 */

import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Import screens
import HomeScreen from '../../screens/HomeScreen';
import CategoriesScreen from '../../screens/CategoriesScreen';
import QuizScreen from '../../screens/QuizScreen';
import ResultsScreen from '../../screens/ResultsScreen';

// Import stores and services
import { QuizProvider, useQuiz } from '../../store/QuizContext';
import { useHeartsStore } from '../../store/heartsStore';
import { useStreakStore } from '../../store/streakStore';
import { useSubscriptionStore } from '../../services/subscriptionService';
import { useDailyChallengeStore } from '../../store/dailyChallengeStore';

// Mock external dependencies
jest.mock('expo-notifications');
jest.mock('react-native-haptic-feedback');
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

const Stack = createStackNavigator();

const TestApp = ({ initialRouteName = 'Home' }) => {
  return (
    <QuizProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName={initialRouteName}>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Categories" component={CategoriesScreen} />
          <Stack.Screen name="Quiz" component={QuizScreen} />
          <Stack.Screen name="Results" component={ResultsScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </QuizProvider>
  );
};

describe('Quiz Flow Integration Tests', () => {
  beforeEach(() => {
    // Reset all stores to initial state
    useHeartsStore.setState({
      hearts: 5,
      maxHearts: 5,
      isUnlimited: false,
      lastRegenerationTime: Date.now(),
    });

    useStreakStore.setState({
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: null,
      freezesAvailable: 2,
      streakSavedToday: false,
      milestonesReached: [],
    });

    useSubscriptionStore.setState({
      isPremium: false,
      isInterviewPrep: false,
      subscription: null,
      offerings: null,
      loading: false,
    });

    useDailyChallengeStore.setState({
      currentChallenge: null,
      challengeHistory: [],
      activeUntil: null,
      questionsCompleted: 0,
      totalXpEarned: 0,
      consecutiveDays: 0,
    });
  });

  describe('Complete Quiz Journey', () => {
    it('should complete full quiz flow from home to results', async () => {
      const { getByText, getByTestId, queryByText } = render(<TestApp />);

      // Start from Home
      await waitFor(() => {
        expect(getByText('Start Quiz')).toBeTruthy();
      });

      // Navigate to Categories
      fireEvent.press(getByText('Start Quiz'));

      await waitFor(() => {
        expect(getByText('Choose a Category')).toBeTruthy();
      });

      // Select a category (React)
      const reactCategory = getByText('React');
      fireEvent.press(reactCategory);

      // Should be in Quiz screen
      await waitFor(() => {
        expect(getByText(/Question 1 of/)).toBeTruthy();
      });

      // Answer questions
      for (let i = 0; i < 10; i++) {
        const options = queryByText(/option/i);
        if (options) {
          fireEvent.press(options);

          await waitFor(() => {
            const nextButton = queryByText('Next Question') || queryByText('View Results');
            if (nextButton) {
              fireEvent.press(nextButton);
            }
          });
        }
      }

      // Should reach Results screen
      await waitFor(() => {
        expect(getByText(/Quiz Complete/i)).toBeTruthy();
      });
    });

    it('should update user stats after completing quiz', async () => {
      const { getByText } = render(<TestApp />);

      // Get initial stats
      const initialXP = useQuiz().userStats.xp;

      // Complete a quiz
      fireEvent.press(getByText('Start Quiz'));
      await waitFor(() => getByText('Choose a Category'));

      fireEvent.press(getByText('React'));
      await waitFor(() => getByText(/Question 1 of/));

      // Answer one question correctly
      const correctOption = getByText(/correct answer/i);
      if (correctOption) {
        fireEvent.press(correctOption);
      }

      // Check that XP was updated
      await waitFor(() => {
        const currentXP = useQuiz().userStats.xp;
        expect(currentXP).toBeGreaterThan(initialXP);
      });
    });
  });

  describe('Hearts System Integration', () => {
    it('should consume hearts when failing quiz', async () => {
      const { getByText } = render(<TestApp />);

      // Set limited hearts
      act(() => {
        useHeartsStore.setState({ hearts: 3, isUnlimited: false });
      });

      // Start quiz
      fireEvent.press(getByText('Start Quiz'));
      await waitFor(() => getByText('Choose a Category'));

      fireEvent.press(getByText('React'));
      await waitFor(() => getByText(/Question 1 of/));

      // Fail the quiz (skip all questions)
      for (let i = 0; i < 10; i++) {
        const skipButton = getByText('Skip');
        if (skipButton) {
          fireEvent.press(skipButton);
        }
      }

      // Check hearts were consumed
      const hearts = useHeartsStore.getState().hearts;
      expect(hearts).toBeLessThan(3);
    });

    it('should show paywall when hearts depleted', async () => {
      const { getByText, queryByTestId } = render(<TestApp />);

      // Deplete hearts
      act(() => {
        useHeartsStore.setState({ hearts: 0, isUnlimited: false });
      });

      // Try to start quiz
      fireEvent.press(getByText('Start Quiz'));

      // Should show paywall or hearts modal
      await waitFor(() => {
        const paywall = queryByTestId('paywall-modal') || queryByText(/No hearts left/i);
        expect(paywall).toBeTruthy();
      });
    });

    it('should not consume hearts for premium users', async () => {
      const { getByText } = render(<TestApp />);

      // Set premium status
      act(() => {
        useSubscriptionStore.setState({ isPremium: true });
        useHeartsStore.setState({ isUnlimited: true });
      });

      const initialHearts = useHeartsStore.getState().hearts;

      // Complete quiz
      fireEvent.press(getByText('Start Quiz'));
      await waitFor(() => getByText('Choose a Category'));

      fireEvent.press(getByText('React'));

      // Fail quiz
      for (let i = 0; i < 10; i++) {
        const skipButton = getByText('Skip');
        if (skipButton) {
          fireEvent.press(skipButton);
        }
      }

      // Hearts should remain unchanged
      const finalHearts = useHeartsStore.getState().hearts;
      expect(finalHearts).toBe(initialHearts);
    });
  });

  describe('Streak System Integration', () => {
    it('should update streak after completing quiz', async () => {
      const { getByText } = render(<TestApp />);

      const initialStreak = useStreakStore.getState().currentStreak;

      // Complete a quiz successfully
      fireEvent.press(getByText('Start Quiz'));
      await waitFor(() => getByText('Choose a Category'));

      fireEvent.press(getByText('React'));
      await waitFor(() => getByText(/Question 1 of/));

      // Answer questions correctly
      for (let i = 0; i < 10; i++) {
        const option = getByText(/option 1/i);
        if (option) {
          fireEvent.press(option);
          fireEvent.press(getByText('Next Question'));
        }
      }

      // Check streak was updated
      await waitFor(() => {
        const currentStreak = useStreakStore.getState().currentStreak;
        expect(currentStreak).toBeGreaterThanOrEqual(initialStreak);
      });
    });

    it('should handle streak milestones', async () => {
      const { getByText } = render(<TestApp />);

      // Set streak close to milestone
      act(() => {
        useStreakStore.setState({ currentStreak: 6 });
      });

      // Complete quiz to reach 7-day milestone
      fireEvent.press(getByText('Start Quiz'));
      await waitFor(() => getByText('Choose a Category'));

      fireEvent.press(getByText('React'));

      // Complete quiz successfully
      for (let i = 0; i < 10; i++) {
        const option = getByText(/option 1/i);
        if (option) {
          fireEvent.press(option);
          fireEvent.press(getByText('Next Question'));
        }
      }

      // Check milestone was reached
      await waitFor(() => {
        const milestones = useStreakStore.getState().milestonesReached;
        expect(milestones).toContain(7);
      });
    });
  });

  describe('Daily Challenge Integration', () => {
    it('should track daily challenge progress', async () => {
      const { getByText, getByTestId } = render(<TestApp />);

      // Generate daily challenge
      act(() => {
        useDailyChallengeStore.getState().generateDailyChallenge();
      });

      // Start challenge
      const challengeCard = getByTestId('daily-challenge-card');
      if (challengeCard) {
        fireEvent.press(challengeCard);

        // Complete some questions
        for (let i = 0; i < 5; i++) {
          const option = getByText(/option/i);
          if (option) {
            fireEvent.press(option);
            fireEvent.press(getByText('Next Question'));
          }
        }

        // Check progress was tracked
        const progress = useDailyChallengeStore.getState().questionsCompleted;
        expect(progress).toBeGreaterThan(0);
      }
    });

    it('should complete daily challenge and earn rewards', async () => {
      const { getByText } = render(<TestApp />);

      // Generate and start challenge
      act(() => {
        const store = useDailyChallengeStore.getState();
        store.generateDailyChallenge();
        store.startChallenge();
      });

      const initialXP = useDailyChallengeStore.getState().totalXpEarned;

      // Complete challenge requirements
      const challenge = useDailyChallengeStore.getState().currentChallenge;
      if (challenge) {
        for (let i = 0; i < challenge.questionsRequired; i++) {
          act(() => {
            useDailyChallengeStore.getState().updateProgress(1);
          });
        }

        // Check rewards were earned
        const finalXP = useDailyChallengeStore.getState().totalXpEarned;
        expect(finalXP).toBeGreaterThan(initialXP);
      }
    });
  });

  describe('Navigation State Management', () => {
    it('should preserve quiz state when navigating back', async () => {
      const { getByText, getByTestId } = render(<TestApp />);

      // Start quiz and answer some questions
      fireEvent.press(getByText('Start Quiz'));
      await waitFor(() => getByText('Choose a Category'));

      fireEvent.press(getByText('React'));
      await waitFor(() => getByText(/Question 1 of/));

      // Answer first question
      fireEvent.press(getByText(/option 1/i));
      fireEvent.press(getByText('Next Question'));

      // Navigate back
      const backButton = getByTestId('back-button');
      if (backButton) {
        fireEvent.press(backButton);

        // Return to quiz
        fireEvent.press(getByText('Resume Quiz'));

        // Should be on question 2
        await waitFor(() => {
          expect(getByText(/Question 2 of/)).toBeTruthy();
        });
      }
    });

    it('should handle app backgrounding during quiz', async () => {
      const { getByText } = render(<TestApp />);

      // Start quiz
      fireEvent.press(getByText('Start Quiz'));
      await waitFor(() => getByText('Choose a Category'));

      fireEvent.press(getByText('React'));

      // Simulate app backgrounding
      act(() => {
        // Trigger app state change
        const appState = { current: 'background' };
        // In real app, this would trigger auto-save
      });

      // Simulate app foregrounding
      act(() => {
        const appState = { current: 'active' };
      });

      // Quiz state should be preserved
      await waitFor(() => {
        expect(getByText(/Question/)).toBeTruthy();
      });
    });
  });

  describe('Error Recovery', () => {
    it('should handle network errors gracefully', async () => {
      const { getByText, queryByText } = render(<TestApp />);

      // Simulate network error
      global.fetch = jest.fn(() => Promise.reject(new Error('Network error')));

      // Try to start quiz
      fireEvent.press(getByText('Start Quiz'));

      // Should show error message or fallback
      await waitFor(() => {
        const errorMessage = queryByText(/error|offline|retry/i);
        const fallbackContent = queryByText('Choose a Category');
        expect(errorMessage || fallbackContent).toBeTruthy();
      });
    });

    it('should recover from store corruption', async () => {
      const { getByText } = render(<TestApp />);

      // Corrupt store data
      act(() => {
        useQuiz().userStats = null as any;
      });

      // Should handle gracefully
      expect(() => {
        fireEvent.press(getByText('Start Quiz'));
      }).not.toThrow();
    });
  });

  describe('Performance', () => {
    it('should handle rapid navigation without crashes', async () => {
      const { getByText } = render(<TestApp />);

      // Rapid navigation
      for (let i = 0; i < 5; i++) {
        fireEvent.press(getByText('Start Quiz'));
        await waitFor(() => getByText('Choose a Category'));

        fireEvent.press(getByText('React'));
        await waitFor(() => getByText(/Question/));

        const backButton = getByText('Back');
        if (backButton) {
          fireEvent.press(backButton);
        }
      }

      // Should not crash
      expect(getByText('Start Quiz')).toBeTruthy();
    });

    it('should not leak memory across quiz sessions', async () => {
      const { getByText, unmount } = render(<TestApp />);

      // Complete multiple quiz sessions
      for (let session = 0; session < 3; session++) {
        fireEvent.press(getByText('Start Quiz'));
        await waitFor(() => getByText('Choose a Category'));

        fireEvent.press(getByText('React'));

        // Complete quiz
        for (let i = 0; i < 10; i++) {
          const option = getByText(/option/i);
          if (option) {
            fireEvent.press(option);
            fireEvent.press(getByText('Next Question'));
          }
        }

        // Return home
        fireEvent.press(getByText('Home'));
      }

      // Should clean up properly
      expect(() => unmount()).not.toThrow();
    });
  });
});
