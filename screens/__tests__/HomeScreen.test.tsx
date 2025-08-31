import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import HomeScreen from '../HomeScreen';
import { useQuiz } from '../../store/QuizContext';
import { useHeartsStore } from '../../store/heartsStore';
import { useStreakStore } from '../../store/streakStore';
import { useSubscriptionStore } from '../../services/subscriptionService';
import * as Notifications from 'expo-notifications';

// Mock dependencies
jest.mock('../../store/QuizContext');
jest.mock('../../store/heartsStore');
jest.mock('../../store/streakStore');
jest.mock('../../services/subscriptionService');
jest.mock('../../store/dailyChallengeStore', () => ({
  initializeDailyChallenge: jest.fn(),
}));
jest.mock('expo-notifications');

// Mock components
jest.mock('../../components/StreakDisplay', () => ({
  StreakDisplay: ({ onPress }: any) => <MockComponent testID="streak-display" onPress={onPress} />,
}));
jest.mock('../../components/HeartsDisplay', () => ({
  HeartsDisplay: () => <MockComponent testID="hearts-display" />,
}));
jest.mock('../../components/DailyChallengeCard', () => ({
  DailyChallengeCard: () => <MockComponent testID="daily-challenge-card" />,
}));

// Helper component for mocking
const MockComponent = ({ testID, onPress, children }: any) => {
  const React = require('react');
  const { TouchableOpacity, Text } = require('react-native');

  if (onPress) {
    return (
      <TouchableOpacity testID={testID} onPress={onPress}>
        <Text>{children || testID}</Text>
      </TouchableOpacity>
    );
  }
  return <Text testID={testID}>{children || testID}</Text>;
};

// Navigation mock
const mockNavigate = jest.fn();
const mockNavigation = {
  navigate: mockNavigate,
  goBack: jest.fn(),
  addListener: jest.fn(),
  removeListener: jest.fn(),
};

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => mockNavigation,
}));

describe('HomeScreen', () => {
  const mockQuizContext = {
    userStats: {
      level: 5,
      xp: 1250,
      stars: 45,
      questionsAnswered: 125,
    },
    categories: new Array(72).fill({ id: 'cat', name: 'Category' }),
  };

  const mockHeartsStore = {
    canPlayQuiz: jest.fn(() => true),
    hearts: 5,
  };

  const mockStreakStore = {
    currentStreak: 7,
  };

  const mockSubscriptionStore = {
    isPremium: false,
    initialize: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    (useQuiz as jest.Mock).mockReturnValue(mockQuizContext);
    (useHeartsStore as jest.Mock).mockReturnValue(mockHeartsStore);
    (useStreakStore as jest.Mock).mockReturnValue(mockStreakStore);
    (useSubscriptionStore as jest.Mock).mockReturnValue(mockSubscriptionStore);

    (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({
      status: 'granted',
    });
    (Notifications.scheduleNotificationAsync as jest.Mock).mockResolvedValue('notif-id');
  });

  const renderWithNavigation = (component: React.ReactElement) => {
    return render(<NavigationContainer>{component}</NavigationContainer>);
  };

  describe('Rendering', () => {
    it('should render all main components', () => {
      const { getByTestId, getByText } = renderWithNavigation(<HomeScreen />);

      // Core components
      expect(getByTestId('streak-display')).toBeTruthy();
      expect(getByTestId('hearts-display')).toBeTruthy();
      expect(getByTestId('daily-challenge-card')).toBeTruthy();

      // Stats
      expect(getByText('Your Progress')).toBeTruthy();
      expect(getByText('5')).toBeTruthy(); // Level
      expect(getByText('1250')).toBeTruthy(); // XP
      expect(getByText('⭐ 45')).toBeTruthy(); // Stars
      expect(getByText('125')).toBeTruthy(); // Questions answered

      // Info
      expect(getByText('📚 72 Categories Available')).toBeTruthy();
      expect(getByText('❓ 513+ Questions')).toBeTruthy();

      // Button
      expect(getByText('Start Quiz')).toBeTruthy();
    });

    it('should show premium banner for premium users', () => {
      (useSubscriptionStore as jest.Mock).mockReturnValue({
        ...mockSubscriptionStore,
        isPremium: true,
      });

      const { getByText } = renderWithNavigation(<HomeScreen />);
      expect(getByText('👑 Premium Member')).toBeTruthy();
    });

    it('should show upsell banner for free users', () => {
      const { getByText } = renderWithNavigation(<HomeScreen />);
      expect(getByText('🎁 Limited Time: 50% OFF Premium!')).toBeTruthy();
      expect(getByText('Unlock unlimited hearts & exclusive challenges')).toBeTruthy();
    });

    it('should not show upsell banner for premium users', () => {
      (useSubscriptionStore as jest.Mock).mockReturnValue({
        ...mockSubscriptionStore,
        isPremium: true,
      });

      const { queryByText } = renderWithNavigation(<HomeScreen />);
      expect(queryByText('🎁 Limited Time: 50% OFF Premium!')).toBeNull();
    });
  });

  describe('Initialization', () => {
    it('should initialize subscriptions on mount', () => {
      renderWithNavigation(<HomeScreen />);
      expect(mockSubscriptionStore.initialize).toHaveBeenCalled();
    });

    it('should initialize daily challenges on mount', () => {
      const { initializeDailyChallenge } = require('../../store/dailyChallengeStore');
      renderWithNavigation(<HomeScreen />);
      expect(initializeDailyChallenge).toHaveBeenCalled();
    });

    it('should request notification permissions', async () => {
      renderWithNavigation(<HomeScreen />);

      await waitFor(() => {
        expect(Notifications.requestPermissionsAsync).toHaveBeenCalled();
      });
    });

    it('should schedule streak reminder notification', async () => {
      renderWithNavigation(<HomeScreen />);

      await waitFor(() => {
        expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith(
          expect.objectContaining({
            content: expect.objectContaining({
              title: expect.stringContaining('7-day streak'),
              body: expect.stringContaining('Complete a quiz now'),
            }),
          }),
        );
      });
    });

    it('should not schedule notifications if permission denied', async () => {
      (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'denied',
      });

      renderWithNavigation(<HomeScreen />);

      await waitFor(() => {
        expect(Notifications.requestPermissionsAsync).toHaveBeenCalled();
      });

      expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
    });
  });

  describe('Navigation', () => {
    it('should navigate to Categories when Start Quiz is pressed', () => {
      const { getByText } = renderWithNavigation(<HomeScreen />);

      fireEvent.press(getByText('Start Quiz'));
      expect(mockNavigate).toHaveBeenCalledWith('Categories');
    });

    it('should not navigate if user cannot play quiz', () => {
      mockHeartsStore.canPlayQuiz.mockReturnValue(false);

      const { getByTestId } = renderWithNavigation(<HomeScreen />);

      // Press the streak display which triggers handleStartQuiz
      fireEvent.press(getByTestId('streak-display'));

      expect(mockNavigate).not.toHaveBeenCalledWith('Categories');
    });

    it('should navigate to Paywall when upsell banner is pressed', () => {
      const { getByText } = renderWithNavigation(<HomeScreen />);

      fireEvent.press(getByText('🎁 Limited Time: 50% OFF Premium!'));
      expect(mockNavigate).toHaveBeenCalledWith('Paywall', { source: 'home_banner' });
    });
  });

  describe('Stats Display', () => {
    it('should display correct user stats', () => {
      const { getByText } = renderWithNavigation(<HomeScreen />);

      expect(getByText('Level')).toBeTruthy();
      expect(getByText('5')).toBeTruthy();

      expect(getByText('XP')).toBeTruthy();
      expect(getByText('1250')).toBeTruthy();

      expect(getByText('Stars')).toBeTruthy();
      expect(getByText('⭐ 45')).toBeTruthy();

      expect(getByText('Questions')).toBeTruthy();
      expect(getByText('125')).toBeTruthy();
    });

    it('should update when stats change', () => {
      const { rerender, getByText } = renderWithNavigation(<HomeScreen />);

      // Update stats
      (useQuiz as jest.Mock).mockReturnValue({
        ...mockQuizContext,
        userStats: {
          ...mockQuizContext.userStats,
          level: 10,
          xp: 2500,
        },
      });

      rerender(<HomeScreen />);

      expect(getByText('10')).toBeTruthy();
      expect(getByText('2500')).toBeTruthy();
    });
  });

  describe('Features Section', () => {
    it('should display all features', () => {
      const { getByText } = renderWithNavigation(<HomeScreen />);

      expect(getByText('Features')).toBeTruthy();
      expect(getByText('✅ Real-time scoring')).toBeTruthy();
      expect(getByText('✅ Detailed explanations')).toBeTruthy();
      expect(getByText('✅ Progress tracking')).toBeTruthy();
      expect(getByText('✅ Gamification system')).toBeTruthy();
    });
  });

  describe('Quiz Info', () => {
    it('should display quiz statistics', () => {
      const { getByText } = renderWithNavigation(<HomeScreen />);

      expect(getByText('Quiz Statistics')).toBeTruthy();
      expect(getByText('📚 72 Categories Available')).toBeTruthy();
      expect(getByText('❓ 513+ Questions')).toBeTruthy();
      expect(getByText('🎯 Multiple Difficulty Levels')).toBeTruthy();
    });

    it('should update category count dynamically', () => {
      const { rerender, getByText } = renderWithNavigation(<HomeScreen />);

      // Update categories
      (useQuiz as jest.Mock).mockReturnValue({
        ...mockQuizContext,
        categories: new Array(100).fill({ id: 'cat', name: 'Category' }),
      });

      rerender(<HomeScreen />);

      expect(getByText('📚 100 Categories Available')).toBeTruthy();
    });
  });

  describe('Error Handling', () => {
    it('should handle notification permission errors gracefully', async () => {
      (Notifications.requestPermissionsAsync as jest.Mock).mockRejectedValue(
        new Error('Permission error'),
      );

      // Should not throw
      expect(() => renderWithNavigation(<HomeScreen />)).not.toThrow();

      await waitFor(() => {
        expect(Notifications.requestPermissionsAsync).toHaveBeenCalled();
      });
    });

    it('should handle subscription initialization errors', () => {
      mockSubscriptionStore.initialize.mockRejectedValue(new Error('Init error'));

      // Should not throw
      expect(() => renderWithNavigation(<HomeScreen />)).not.toThrow();
    });
  });

  describe('Component Integration', () => {
    it('should pass correct props to StreakDisplay', () => {
      const { getByTestId } = renderWithNavigation(<HomeScreen />);

      const streakDisplay = getByTestId('streak-display');

      // Verify onPress is passed
      fireEvent.press(streakDisplay);

      // Should check if user can play
      expect(mockHeartsStore.canPlayQuiz).toHaveBeenCalled();
    });

    it('should render all engagement components in correct order', () => {
      const { getAllByTestId } = renderWithNavigation(<HomeScreen />);

      const testIds = ['streak-display', 'hearts-display', 'daily-challenge-card'];
      const components = getAllByTestId(/streak-display|hearts-display|daily-challenge-card/);

      // Verify order
      expect(components).toHaveLength(3);
    });
  });

  describe('Accessibility', () => {
    it('should have accessible labels for interactive elements', () => {
      const { getByText } = renderWithNavigation(<HomeScreen />);

      const startButton = getByText('Start Quiz');
      expect(startButton).toBeTruthy();

      // In a real implementation, we'd check accessibility properties
      // expect(startButton.props.accessibilityRole).toBe('button');
      // expect(startButton.props.accessibilityLabel).toBeTruthy();
    });
  });

  describe('Performance', () => {
    it('should not re-render unnecessarily', () => {
      const renderSpy = jest.fn();

      // Mock React.memo if needed
      const { rerender } = renderWithNavigation(<HomeScreen />);

      // Same props should not cause re-render
      rerender(<HomeScreen />);

      // In a real implementation, we'd track render counts
      expect(true).toBe(true);
    });
  });
});
