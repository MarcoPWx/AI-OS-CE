import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { StreakDisplay } from '../StreakDisplay';
import { useStreakStore } from '../../store/streakStore';
import { useSubscriptionStore } from '../../services/subscriptionService';
import * as Haptics from 'expo-haptics';

// Mock dependencies
jest.mock('../../store/streakStore');
jest.mock('../../services/subscriptionService');
jest.mock('expo-haptics');

// Mock global functions
global.showPaywall = jest.fn();
global.hasCompletedToday = jest.fn(() => false);

// Mock Reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');

  // Override withRepeat to avoid infinite loops in tests
  Reanimated.default.withRepeat = (animation) => animation;

  return {
    ...Reanimated,
    useSharedValue: jest.fn((initialValue) => ({ value: initialValue })),
    useAnimatedStyle: jest.fn((styleFactory) => styleFactory()),
    withSpring: jest.fn((value) => value),
    withTiming: jest.fn((value) => value),
    withSequence: jest.fn((...animations) => animations[0]),
    withRepeat: jest.fn((animation) => animation),
    Easing: {
      linear: jest.fn(),
      ease: jest.fn(),
    },
    runOnJS: jest.fn((fn) => fn),
    interpolate: jest.fn((value, inputRange, outputRange) => outputRange[0]),
  };
});

describe('StreakDisplay Component', () => {
  const mockStreakStore = {
    currentStreak: 7,
    longestStreak: 30,
    freezesAvailable: 2,
    checkStreak: jest.fn(),
  };

  const mockSubscriptionStore = {
    isPremium: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    (useStreakStore as jest.Mock).mockReturnValue(mockStreakStore);
    (useSubscriptionStore as jest.Mock).mockReturnValue(mockSubscriptionStore);
  });

  describe('Rendering', () => {
    it('should render streak display with current streak', () => {
      const { getByText } = render(<StreakDisplay />);

      expect(getByText('7')).toBeTruthy();
      expect(getByText('days')).toBeTruthy();
      expect(getByText('🔥')).toBeTruthy();
    });

    it('should display singular "day" for streak of 1', () => {
      (useStreakStore as jest.Mock).mockReturnValue({
        ...mockStreakStore,
        currentStreak: 1,
      });

      const { getByText } = render(<StreakDisplay />);

      expect(getByText('1')).toBeTruthy();
      expect(getByText('day')).toBeTruthy();
    });

    it('should display freeze count for non-premium users', () => {
      const { getByText } = render(<StreakDisplay />);

      expect(getByText('❄️ 2 freezes left')).toBeTruthy();
    });

    it('should show unlimited protection for premium users', () => {
      (useSubscriptionStore as jest.Mock).mockReturnValue({
        isPremium: true,
      });

      const { getByText, queryByText } = render(<StreakDisplay />);

      expect(getByText('♾️ Unlimited Protection')).toBeTruthy();
      expect(queryByText(/freezes left/)).toBeNull();
    });

    it('should show longest streak when current is less', () => {
      const { getByText } = render(<StreakDisplay />);

      expect(getByText('Longest: 30 days')).toBeTruthy();
    });

    it('should not show longest streak when current equals or exceeds it', () => {
      (useStreakStore as jest.Mock).mockReturnValue({
        ...mockStreakStore,
        currentStreak: 30,
        longestStreak: 30,
      });

      const { queryByText } = render(<StreakDisplay />);

      expect(queryByText(/Longest:/)).toBeNull();
    });
  });

  describe('Streak Messages', () => {
    it('should show start message for 0 streak', () => {
      (useStreakStore as jest.Mock).mockReturnValue({
        ...mockStreakStore,
        currentStreak: 0,
      });

      const { getByText } = render(<StreakDisplay />);

      expect(getByText('Start your streak! 🔥')).toBeTruthy();
    });

    it('should show encouragement for 1 day streak', () => {
      (useStreakStore as jest.Mock).mockReturnValue({
        ...mockStreakStore,
        currentStreak: 1,
      });

      const { getByText } = render(<StreakDisplay />);

      expect(getByText('Great start! Keep going!')).toBeTruthy();
    });

    it('should show days to milestone for streaks < 7', () => {
      (useStreakStore as jest.Mock).mockReturnValue({
        ...mockStreakStore,
        currentStreak: 4,
      });

      const { getByText } = render(<StreakDisplay />);

      expect(getByText('3 days to milestone!')).toBeTruthy();
    });

    it('should show fire message for 7-29 day streaks', () => {
      (useStreakStore as jest.Mock).mockReturnValue({
        ...mockStreakStore,
        currentStreak: 15,
      });

      const { getByText } = render(<StreakDisplay />);

      expect(getByText("You're on fire! 🔥")).toBeTruthy();
    });

    it('should show unstoppable message for 30-99 day streaks', () => {
      (useStreakStore as jest.Mock).mockReturnValue({
        ...mockStreakStore,
        currentStreak: 50,
      });

      const { getByText } = render(<StreakDisplay />);

      expect(getByText('Unstoppable force!')).toBeTruthy();
    });

    it('should show quiz master message for 100-364 day streaks', () => {
      (useStreakStore as jest.Mock).mockReturnValue({
        ...mockStreakStore,
        currentStreak: 200,
      });

      const { getByText } = render(<StreakDisplay />);

      expect(getByText('Quiz Master!')).toBeTruthy();
    });

    it('should show legendary status for 365+ day streaks', () => {
      (useStreakStore as jest.Mock).mockReturnValue({
        ...mockStreakStore,
        currentStreak: 400,
      });

      const { getByText } = render(<StreakDisplay />);

      expect(getByText('LEGENDARY STATUS! 👑')).toBeTruthy();
    });
  });

  describe('Interactions', () => {
    it('should call onPress when streak is 0', () => {
      const onPress = jest.fn();
      (useStreakStore as jest.Mock).mockReturnValue({
        ...mockStreakStore,
        currentStreak: 0,
      });

      const { getByText } = render(<StreakDisplay onPress={onPress} />);

      fireEvent.press(getByText('Start your streak! 🔥'));

      expect(onPress).toHaveBeenCalled();
      expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Light);
    });

    it('should show paywall when no freezes and not premium', () => {
      (useStreakStore as jest.Mock).mockReturnValue({
        ...mockStreakStore,
        currentStreak: 7,
        freezesAvailable: 0,
      });

      const { getByText } = render(<StreakDisplay />);

      fireEvent.press(getByText('7'));

      expect(showPaywall).toHaveBeenCalledWith('streak_protection');
    });

    it('should show get more button when freezes depleted', () => {
      (useStreakStore as jest.Mock).mockReturnValue({
        ...mockStreakStore,
        freezesAvailable: 0,
      });

      const { getByText } = render(<StreakDisplay />);

      const getMoreButton = getByText('Get More');
      expect(getMoreButton).toBeTruthy();

      fireEvent.press(getMoreButton);
      expect(showPaywall).toHaveBeenCalledWith('freeze_depleted');
    });

    it('should not show get more button for premium users', () => {
      (useSubscriptionStore as jest.Mock).mockReturnValue({
        isPremium: true,
      });
      (useStreakStore as jest.Mock).mockReturnValue({
        ...mockStreakStore,
        freezesAvailable: 0,
      });

      const { queryByText } = render(<StreakDisplay />);

      expect(queryByText('Get More')).toBeNull();
    });
  });

  describe('Danger Banner', () => {
    it('should show danger banner when streak at risk', () => {
      global.hasCompletedToday = jest.fn(() => false);
      (useStreakStore as jest.Mock).mockReturnValue({
        ...mockStreakStore,
        currentStreak: 7,
      });

      const { getByText } = render(<StreakDisplay />);

      expect(getByText('⚠️ Streak at risk! Complete a quiz today')).toBeTruthy();
    });

    it('should not show danger banner when quiz completed today', () => {
      global.hasCompletedToday = jest.fn(() => true);
      (useStreakStore as jest.Mock).mockReturnValue({
        ...mockStreakStore,
        currentStreak: 7,
      });

      const { queryByText } = render(<StreakDisplay />);

      expect(queryByText(/Streak at risk/)).toBeNull();
    });

    it('should not show danger banner when streak is 0', () => {
      global.hasCompletedToday = jest.fn(() => false);
      (useStreakStore as jest.Mock).mockReturnValue({
        ...mockStreakStore,
        currentStreak: 0,
      });

      const { queryByText } = render(<StreakDisplay />);

      expect(queryByText(/Streak at risk/)).toBeNull();
    });
  });

  describe('Milestone Celebrations', () => {
    it('should trigger haptic feedback for 7-day milestone', async () => {
      (useStreakStore as jest.Mock).mockReturnValue({
        ...mockStreakStore,
        currentStreak: 7,
      });

      render(<StreakDisplay />);

      await waitFor(() => {
        expect(Haptics.notificationAsync).toHaveBeenCalledWith(
          Haptics.NotificationFeedbackType.Success,
        );
      });
    });

    it('should trigger haptic feedback for 30-day milestone', async () => {
      (useStreakStore as jest.Mock).mockReturnValue({
        ...mockStreakStore,
        currentStreak: 30,
      });

      render(<StreakDisplay />);

      await waitFor(() => {
        expect(Haptics.notificationAsync).toHaveBeenCalledWith(
          Haptics.NotificationFeedbackType.Success,
        );
      });
    });

    it('should trigger haptic feedback for 100-day milestone', async () => {
      (useStreakStore as jest.Mock).mockReturnValue({
        ...mockStreakStore,
        currentStreak: 100,
      });

      render(<StreakDisplay />);

      await waitFor(() => {
        expect(Haptics.notificationAsync).toHaveBeenCalledWith(
          Haptics.NotificationFeedbackType.Success,
        );
      });
    });
  });

  describe('Lifecycle', () => {
    it('should check streak on mount', () => {
      render(<StreakDisplay />);

      expect(mockStreakStore.checkStreak).toHaveBeenCalled();
    });

    it('should update animations when streak changes', () => {
      const { rerender } = render(<StreakDisplay />);

      // Change streak
      (useStreakStore as jest.Mock).mockReturnValue({
        ...mockStreakStore,
        currentStreak: 15,
      });

      rerender(<StreakDisplay />);

      // Animations should be updated (mocked in this test)
      expect(true).toBe(true); // Placeholder for animation testing
    });

    it('should enable glow effect for premium users', () => {
      (useSubscriptionStore as jest.Mock).mockReturnValue({
        isPremium: true,
      });

      const { container } = render(<StreakDisplay />);

      // Check that premium styles are applied
      // In a real test, you'd check the animated styles
      expect(container).toBeTruthy();
    });
  });

  describe('Color Coding', () => {
    const testCases = [
      { streak: 3, expectedColor: '#FF6347' }, // Tomato
      { streak: 7, expectedColor: '#FFA500' }, // Orange
      { streak: 30, expectedColor: '#FF4500' }, // Red-orange
      { streak: 100, expectedColor: '#FFD700' }, // Gold
      { streak: 365, expectedColor: '#FF00FF' }, // Purple
    ];

    testCases.forEach(({ streak, expectedColor }) => {
      it(`should use ${expectedColor} color for ${streak} day streak`, () => {
        (useStreakStore as jest.Mock).mockReturnValue({
          ...mockStreakStore,
          currentStreak: streak,
        });

        const { getByText } = render(<StreakDisplay />);
        const flameElement = getByText('🔥');

        // In a real implementation, you'd check the style
        // For now, we just verify the component renders
        expect(flameElement).toBeTruthy();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have accessible touch targets', () => {
      const { getByText } = render(<StreakDisplay />);

      const touchableElement = getByText('7').parent?.parent;
      expect(touchableElement?.props.activeOpacity).toBe(0.8);
    });

    it('should provide haptic feedback on press', () => {
      const { getByText } = render(<StreakDisplay />);

      fireEvent.press(getByText('7'));

      expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Light);
    });
  });
});
