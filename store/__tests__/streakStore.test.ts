import { renderHook, act } from '@testing-library/react-native';
import { useStreakStore } from '../streakStore';
import AsyncStorage from '@react-native-async-storage/async-storage';

describe('Streak Store', () => {
  beforeEach(() => {
    // Clear store between tests
    useStreakStore.setState({
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: null,
      freezesAvailable: 2,
      streakSavedToday: false,
      milestonesReached: [],
    });
    AsyncStorage.clear();
    jest.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should have correct initial values', () => {
      const { result } = renderHook(() => useStreakStore());

      expect(result.current.currentStreak).toBe(0);
      expect(result.current.longestStreak).toBe(0);
      expect(result.current.lastActiveDate).toBeNull();
      expect(result.current.freezesAvailable).toBe(2);
      expect(result.current.streakSavedToday).toBe(false);
      expect(result.current.milestonesReached).toEqual([]);
    });
  });

  describe('incrementStreak', () => {
    it('should increment streak for first time', () => {
      const { result } = renderHook(() => useStreakStore());

      act(() => {
        result.current.incrementStreak();
      });

      expect(result.current.currentStreak).toBe(1);
      expect(result.current.longestStreak).toBe(1);
      expect(result.current.lastActiveDate).toBe(new Date().toDateString());
      expect(result.current.streakSavedToday).toBe(true);
    });

    it('should not increment streak twice on the same day', () => {
      const { result } = renderHook(() => useStreakStore());
      const today = new Date().toDateString();

      act(() => {
        useStreakStore.setState({
          currentStreak: 5,
          lastActiveDate: today,
          streakSavedToday: true,
        });
      });

      act(() => {
        result.current.incrementStreak();
      });

      expect(result.current.currentStreak).toBe(5); // Should remain unchanged
    });

    it('should update longest streak when current exceeds it', () => {
      const { result } = renderHook(() => useStreakStore());

      act(() => {
        useStreakStore.setState({
          currentStreak: 9,
          longestStreak: 8,
          streakSavedToday: false,
        });
      });

      act(() => {
        result.current.incrementStreak();
      });

      expect(result.current.currentStreak).toBe(10);
      expect(result.current.longestStreak).toBe(10);
    });

    it('should not update longest streak when current is less', () => {
      const { result } = renderHook(() => useStreakStore());

      act(() => {
        useStreakStore.setState({
          currentStreak: 4,
          longestStreak: 20,
          streakSavedToday: false,
        });
      });

      act(() => {
        result.current.incrementStreak();
      });

      expect(result.current.currentStreak).toBe(5);
      expect(result.current.longestStreak).toBe(20);
    });
  });

  describe('checkStreak', () => {
    it('should maintain streak when active today', () => {
      const { result } = renderHook(() => useStreakStore());
      const today = new Date().toDateString();

      act(() => {
        useStreakStore.setState({
          currentStreak: 5,
          lastActiveDate: today,
        });
      });

      act(() => {
        result.current.checkStreak();
      });

      expect(result.current.currentStreak).toBe(5);
    });

    it('should continue streak when active yesterday', () => {
      const { result } = renderHook(() => useStreakStore());
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      act(() => {
        useStreakStore.setState({
          currentStreak: 5,
          lastActiveDate: yesterday.toDateString(),
          streakSavedToday: true,
        });
      });

      act(() => {
        result.current.checkStreak();
      });

      expect(result.current.currentStreak).toBe(5);
      expect(result.current.streakSavedToday).toBe(false);
    });

    it('should reset streak when missed more than one day', () => {
      const { result } = renderHook(() => useStreakStore());
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

      act(() => {
        useStreakStore.setState({
          currentStreak: 10,
          lastActiveDate: threeDaysAgo.toDateString(),
          freezesAvailable: 2,
        });
      });

      act(() => {
        result.current.checkStreak();
      });

      expect(result.current.currentStreak).toBe(0);
      expect(result.current.streakSavedToday).toBe(false);
    });

    it('should use freeze when missed exactly one day', () => {
      const { result } = renderHook(() => useStreakStore());
      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

      act(() => {
        useStreakStore.setState({
          currentStreak: 7,
          lastActiveDate: twoDaysAgo.toDateString(),
          freezesAvailable: 2,
        });
      });

      act(() => {
        result.current.checkStreak();
      });

      expect(result.current.currentStreak).toBe(7); // Streak maintained
      expect(result.current.freezesAvailable).toBe(1); // Freeze used
      expect(result.current.streakSavedToday).toBe(false);
    });

    it('should reset streak when no freezes available', () => {
      const { result } = renderHook(() => useStreakStore());
      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

      act(() => {
        useStreakStore.setState({
          currentStreak: 7,
          lastActiveDate: twoDaysAgo.toDateString(),
          freezesAvailable: 0,
        });
      });

      act(() => {
        result.current.checkStreak();
      });

      expect(result.current.currentStreak).toBe(0);
      expect(result.current.freezesAvailable).toBe(0);
    });
  });

  describe('useFreeze', () => {
    it('should use a freeze when available', () => {
      const { result } = renderHook(() => useStreakStore());

      act(() => {
        useStreakStore.setState({ freezesAvailable: 2 });
      });

      let success: boolean;
      act(() => {
        success = result.current.useFreeze();
      });

      expect(success!).toBe(true);
      expect(result.current.freezesAvailable).toBe(1);
    });

    it('should return false when no freezes available', () => {
      const { result } = renderHook(() => useStreakStore());

      act(() => {
        useStreakStore.setState({ freezesAvailable: 0 });
      });

      let success: boolean;
      act(() => {
        success = result.current.useFreeze();
      });

      expect(success!).toBe(false);
      expect(result.current.freezesAvailable).toBe(0);
    });
  });

  describe('resetStreak', () => {
    it('should reset current streak to 0', () => {
      const { result } = renderHook(() => useStreakStore());

      act(() => {
        useStreakStore.setState({
          currentStreak: 15,
          streakSavedToday: true,
        });
      });

      act(() => {
        result.current.resetStreak();
      });

      expect(result.current.currentStreak).toBe(0);
      expect(result.current.streakSavedToday).toBe(false);
    });

    it('should not affect longest streak', () => {
      const { result } = renderHook(() => useStreakStore());

      act(() => {
        useStreakStore.setState({
          currentStreak: 15,
          longestStreak: 30,
        });
      });

      act(() => {
        result.current.resetStreak();
      });

      expect(result.current.currentStreak).toBe(0);
      expect(result.current.longestStreak).toBe(30);
    });
  });

  describe('checkMilestone', () => {
    it('should detect 3-day milestone', () => {
      const { result } = renderHook(() => useStreakStore());

      act(() => {
        useStreakStore.setState({
          currentStreak: 3,
          milestonesReached: [],
        });
      });

      let milestone: any;
      act(() => {
        milestone = result.current.checkMilestone();
      });

      expect(milestone).toEqual({ reached: true, milestone: 3 });
      expect(result.current.milestonesReached).toContain(3);
    });

    it('should detect 7-day milestone', () => {
      const { result } = renderHook(() => useStreakStore());

      act(() => {
        useStreakStore.setState({
          currentStreak: 7,
          milestonesReached: [3],
        });
      });

      let milestone: any;
      act(() => {
        milestone = result.current.checkMilestone();
      });

      expect(milestone).toEqual({ reached: true, milestone: 7 });
      expect(result.current.milestonesReached).toEqual([3, 7]);
    });

    it('should not duplicate milestones', () => {
      const { result } = renderHook(() => useStreakStore());

      act(() => {
        useStreakStore.setState({
          currentStreak: 7,
          milestonesReached: [3, 7],
        });
      });

      let milestone: any;
      act(() => {
        milestone = result.current.checkMilestone();
      });

      expect(milestone).toBeNull();
      expect(result.current.milestonesReached).toEqual([3, 7]);
    });

    it('should return null for non-milestone streaks', () => {
      const { result } = renderHook(() => useStreakStore());

      act(() => {
        useStreakStore.setState({
          currentStreak: 5,
          milestonesReached: [3],
        });
      });

      let milestone: any;
      act(() => {
        milestone = result.current.checkMilestone();
      });

      expect(milestone).toBeNull();
    });

    it('should detect all major milestones', () => {
      const { result } = renderHook(() => useStreakStore());
      const milestones = [3, 7, 14, 30, 50, 100, 365];

      milestones.forEach((ms) => {
        act(() => {
          useStreakStore.setState({
            currentStreak: ms,
            milestonesReached: [],
          });
        });

        let milestone: any;
        act(() => {
          milestone = result.current.checkMilestone();
        });

        expect(milestone).toEqual({ reached: true, milestone: ms });
      });
    });
  });

  describe('Persistence', () => {
    it('should persist state to AsyncStorage', async () => {
      const { result } = renderHook(() => useStreakStore());

      act(() => {
        result.current.incrementStreak();
      });

      // Wait for persistence
      await new Promise((resolve) => setTimeout(resolve, 100));

      const storedData = await AsyncStorage.getItem('streak-storage');
      expect(storedData).toBeTruthy();

      const parsed = JSON.parse(storedData!);
      expect(parsed.state.currentStreak).toBe(1);
      expect(parsed.state.streakSavedToday).toBe(true);
    });

    it('should load persisted state on initialization', async () => {
      const persistedState = {
        state: {
          currentStreak: 15,
          longestStreak: 20,
          lastActiveDate: new Date().toDateString(),
          freezesAvailable: 1,
          streakSavedToday: true,
          milestonesReached: [3, 7, 14],
        },
        version: 0,
      };

      await AsyncStorage.setItem('streak-storage', JSON.stringify(persistedState));

      // Force a new hook render to load persisted state
      const { result } = renderHook(() => useStreakStore());

      // Wait for hydration
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(result.current.currentStreak).toBe(15);
      expect(result.current.longestStreak).toBe(20);
      expect(result.current.milestonesReached).toEqual([3, 7, 14]);
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete streak lifecycle', () => {
      const { result } = renderHook(() => useStreakStore());

      // Day 1: Start streak
      act(() => {
        result.current.incrementStreak();
      });
      expect(result.current.currentStreak).toBe(1);

      // Day 2: Continue streak
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      act(() => {
        useStreakStore.setState({
          lastActiveDate: yesterday.toDateString(),
          streakSavedToday: false,
        });
      });

      act(() => {
        result.current.incrementStreak();
      });
      expect(result.current.currentStreak).toBe(2);

      // Day 3: Reach first milestone
      act(() => {
        useStreakStore.setState({
          lastActiveDate: yesterday.toDateString(),
          streakSavedToday: false,
        });
      });

      act(() => {
        result.current.incrementStreak();
      });
      expect(result.current.currentStreak).toBe(3);
      expect(result.current.milestonesReached).toContain(3);
    });
  });
});
