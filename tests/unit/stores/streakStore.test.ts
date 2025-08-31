import { renderHook, act } from '@testing-library/react-hooks';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useStreakStore } from '../../../store/streakStore';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

// Mock notification service
jest.mock('../../../services/notificationService', () => ({
  notificationService: {
    scheduleOneTimeNotification: jest.fn(),
  },
}));

describe('StreakStore', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    // Reset the store
    useStreakStore.setState({
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: null,
      freezesAvailable: 0,
      totalDaysActive: 0,
      milestoneRewards: [],
    });
  });

  describe('updateStreak', () => {
    it('should increment streak when called on consecutive days', () => {
      const { result } = renderHook(() => useStreakStore());

      // First day
      act(() => {
        result.current.updateStreak();
      });
      expect(result.current.currentStreak).toBe(1);
      expect(result.current.totalDaysActive).toBe(1);

      // Mock next day
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      jest.spyOn(global, 'Date').mockImplementation(() => tomorrow as any);

      // Second consecutive day
      act(() => {
        result.current.updateStreak();
      });
      expect(result.current.currentStreak).toBe(2);
      expect(result.current.totalDaysActive).toBe(2);
    });

    it('should reset streak if more than 24 hours have passed', () => {
      const { result } = renderHook(() => useStreakStore());

      // First day
      act(() => {
        result.current.updateStreak();
      });
      expect(result.current.currentStreak).toBe(1);

      // Mock 2 days later
      const twoDaysLater = new Date();
      twoDaysLater.setDate(twoDaysLater.getDate() + 2);
      jest.spyOn(global, 'Date').mockImplementation(() => twoDaysLater as any);

      // Should reset streak
      act(() => {
        result.current.updateStreak();
      });
      expect(result.current.currentStreak).toBe(1);
      expect(result.current.totalDaysActive).toBe(2);
    });

    it('should not increment streak if already updated today', () => {
      const { result } = renderHook(() => useStreakStore());

      act(() => {
        result.current.updateStreak();
      });
      expect(result.current.currentStreak).toBe(1);

      // Try to update again same day
      act(() => {
        result.current.updateStreak();
      });
      expect(result.current.currentStreak).toBe(1); // Should not increment
    });

    it('should update longest streak when current exceeds it', () => {
      const { result } = renderHook(() => useStreakStore());

      // Set initial longest streak
      act(() => {
        useStreakStore.setState({ longestStreak: 5, currentStreak: 5 });
      });

      // Mock next day and update
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      jest.spyOn(global, 'Date').mockImplementation(() => tomorrow as any);

      act(() => {
        result.current.updateStreak();
      });
      expect(result.current.currentStreak).toBe(6);
      expect(result.current.longestStreak).toBe(6);
    });
  });

  describe('checkStreak', () => {
    it('should return true if streak is intact', () => {
      const { result } = renderHook(() => useStreakStore());

      act(() => {
        result.current.updateStreak();
      });

      const isIntact = act(() => result.current.checkStreak());
      expect(isIntact).toBe(true);
    });

    it('should return false if streak is broken', () => {
      const { result } = renderHook(() => useStreakStore());

      act(() => {
        result.current.updateStreak();
      });

      // Mock 2 days later
      const twoDaysLater = new Date();
      twoDaysLater.setDate(twoDaysLater.getDate() + 2);
      jest.spyOn(global, 'Date').mockImplementation(() => twoDaysLater as any);

      const isIntact = act(() => result.current.checkStreak());
      expect(isIntact).toBe(false);
    });
  });

  describe('useStreakFreeze', () => {
    it('should use a freeze and preserve streak', () => {
      const { result } = renderHook(() => useStreakStore());

      // Set up streak with freezes
      act(() => {
        useStreakStore.setState({
          currentStreak: 10,
          freezesAvailable: 2,
          lastActiveDate: new Date(Date.now() - 25 * 60 * 60 * 1000), // 25 hours ago
        });
      });

      act(() => {
        result.current.useStreakFreeze();
      });

      expect(result.current.freezesAvailable).toBe(1);
      expect(result.current.currentStreak).toBe(10); // Streak preserved
    });

    it('should not use freeze if none available', () => {
      const { result } = renderHook(() => useStreakStore());

      act(() => {
        useStreakStore.setState({
          currentStreak: 10,
          freezesAvailable: 0,
        });
      });

      const success = act(() => result.current.useStreakFreeze());
      expect(success).toBe(false);
      expect(result.current.freezesAvailable).toBe(0);
    });

    it('should not use freeze if streak is not in danger', () => {
      const { result } = renderHook(() => useStreakStore());

      act(() => {
        useStreakStore.setState({
          currentStreak: 10,
          freezesAvailable: 2,
          lastActiveDate: new Date(), // Active today
        });
      });

      const success = act(() => result.current.useStreakFreeze());
      expect(success).toBe(false);
      expect(result.current.freezesAvailable).toBe(2); // Not used
    });
  });

  describe('milestone rewards', () => {
    it('should check and award milestone at 7 days', () => {
      const { result } = renderHook(() => useStreakStore());

      // Simulate 7-day streak
      for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        jest.spyOn(global, 'Date').mockImplementation(() => date as any);

        act(() => {
          result.current.updateStreak();
        });
      }

      expect(result.current.currentStreak).toBe(7);

      act(() => {
        result.current.checkMilestone();
      });

      expect(result.current.milestoneRewards).toContainEqual(expect.objectContaining({ day: 7 }));
    });

    it('should award correct rewards for each milestone', () => {
      const { result } = renderHook(() => useStreakStore());

      const milestones = [7, 30, 100, 365];

      milestones.forEach((milestone) => {
        act(() => {
          useStreakStore.setState({ currentStreak: milestone });
          result.current.checkMilestone();
        });

        const reward = result.current.milestoneRewards.find((r) => r.day === milestone);
        expect(reward).toBeDefined();
        expect(reward?.xpBonus).toBeGreaterThan(0);
      });
    });
  });

  describe('streak danger detection', () => {
    it('should detect when streak is in danger zone', () => {
      const { result } = renderHook(() => useStreakStore());

      // Set last active to 20 hours ago (danger zone is 18-24 hours)
      const twentyHoursAgo = new Date(Date.now() - 20 * 60 * 60 * 1000);

      act(() => {
        useStreakStore.setState({
          currentStreak: 15,
          lastActiveDate: twentyHoursAgo,
        });
      });

      const inDanger = act(() => result.current.isStreakInDanger());
      expect(inDanger).toBe(true);
    });

    it('should not show danger if recently active', () => {
      const { result } = renderHook(() => useStreakStore());

      // Set last active to 5 hours ago
      const fiveHoursAgo = new Date(Date.now() - 5 * 60 * 60 * 1000);

      act(() => {
        useStreakStore.setState({
          currentStreak: 15,
          lastActiveDate: fiveHoursAgo,
        });
      });

      const inDanger = act(() => result.current.isStreakInDanger());
      expect(inDanger).toBe(false);
    });
  });

  describe('persistence', () => {
    it('should persist state to AsyncStorage', async () => {
      const { result } = renderHook(() => useStreakStore());

      act(() => {
        result.current.updateStreak();
      });

      // Wait for async storage
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'streak-storage',
        expect.stringContaining('"currentStreak":1'),
      );
    });

    it('should load state from AsyncStorage on init', async () => {
      const mockData = {
        state: {
          currentStreak: 42,
          longestStreak: 50,
          freezesAvailable: 3,
        },
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify(mockData));

      // Reinitialize store
      const { result } = renderHook(() => useStreakStore());

      // Wait for async load
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(result.current.currentStreak).toBe(42);
      expect(result.current.longestStreak).toBe(50);
      expect(result.current.freezesAvailable).toBe(3);
    });
  });

  describe('edge cases', () => {
    it('should handle timezone changes correctly', () => {
      const { result } = renderHook(() => useStreakStore());

      // Simulate different timezone
      const originalTimezone = process.env.TZ;
      process.env.TZ = 'America/New_York';

      act(() => {
        result.current.updateStreak();
      });

      process.env.TZ = 'Asia/Tokyo'; // +14 hours difference

      // Should still recognize same day despite timezone change
      act(() => {
        result.current.updateStreak();
      });

      expect(result.current.currentStreak).toBe(1);

      // Restore original timezone
      process.env.TZ = originalTimezone;
    });

    it('should handle daylight saving time transitions', () => {
      const { result } = renderHook(() => useStreakStore());

      // Mock date before DST
      const beforeDST = new Date('2024-03-09T12:00:00');
      jest.spyOn(global, 'Date').mockImplementation(() => beforeDST as any);

      act(() => {
        result.current.updateStreak();
      });

      // Mock date after DST (spring forward)
      const afterDST = new Date('2024-03-10T12:00:00');
      jest.spyOn(global, 'Date').mockImplementation(() => afterDST as any);

      act(() => {
        result.current.updateStreak();
      });

      expect(result.current.currentStreak).toBe(2);
    });
  });
});
