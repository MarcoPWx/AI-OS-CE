import { renderHook, act } from '@testing-library/react-native';
import { useDailyChallengeStore } from '../dailyChallengeStore';
import AsyncStorage from '@react-native-async-storage/async-storage';

describe('Daily Challenge Store (TDD)', () => {
  beforeEach(() => {
    // Clear store between tests
    jest.clearAllMocks();
    AsyncStorage.clear();
  });

  describe('Initial State', () => {
    it('should have correct initial values', () => {
      const { result } = renderHook(() => useDailyChallengeStore());

      expect(result.current.currentChallenge).toBeNull();
      expect(result.current.completedChallenges).toEqual([]);
      expect(result.current.lastChallengeDate).toBeNull();
      expect(result.current.challengeStreak).toBe(0);
      expect(result.current.totalPoints).toBe(0);
    });
  });

  describe('generateDailyChallenge', () => {
    it('should generate a new challenge for today', () => {
      const { result } = renderHook(() => useDailyChallengeStore());

      act(() => {
        result.current.generateDailyChallenge();
      });

      expect(result.current.currentChallenge).toBeDefined();
      expect(result.current.currentChallenge?.id).toBeTruthy();
      expect(result.current.currentChallenge?.title).toBeTruthy();
      expect(result.current.currentChallenge?.description).toBeTruthy();
      expect(result.current.currentChallenge?.difficulty).toMatch(/easy|medium|hard/);
      expect(result.current.currentChallenge?.points).toBeGreaterThan(0);
      expect(result.current.currentChallenge?.category).toBeTruthy();
      expect(result.current.currentChallenge?.targetQuestions).toBeGreaterThan(0);
      expect(result.current.currentChallenge?.targetAccuracy).toBeGreaterThanOrEqual(0);
      expect(result.current.currentChallenge?.targetAccuracy).toBeLessThanOrEqual(100);
    });

    it('should not generate a new challenge if one already exists for today', () => {
      const { result } = renderHook(() => useDailyChallengeStore());

      // Generate first challenge
      act(() => {
        result.current.generateDailyChallenge();
      });

      const firstChallenge = result.current.currentChallenge;

      // Try to generate again
      act(() => {
        result.current.generateDailyChallenge();
      });

      expect(result.current.currentChallenge).toEqual(firstChallenge);
    });

    it('should generate different challenges on different days', () => {
      const { result } = renderHook(() => useDailyChallengeStore());

      // Generate challenge for "yesterday"
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      act(() => {
        useDailyChallengeStore.setState({
          lastChallengeDate: yesterday.toDateString(),
          currentChallenge: {
            id: 'yesterday-challenge',
            title: 'Yesterday Challenge',
            description: 'Complete 10 questions',
            difficulty: 'easy',
            points: 100,
            category: 'General',
            targetQuestions: 10,
            targetAccuracy: 70,
            progress: 0,
            completed: false,
          },
        });
      });

      // Generate new challenge for today
      act(() => {
        result.current.generateDailyChallenge();
      });

      expect(result.current.currentChallenge?.id).not.toBe('yesterday-challenge');
      expect(result.current.lastChallengeDate).toBe(new Date().toDateString());
    });
  });

  describe('updateChallengeProgress', () => {
    it('should update challenge progress', () => {
      const { result } = renderHook(() => useDailyChallengeStore());

      // Setup a challenge
      act(() => {
        result.current.generateDailyChallenge();
      });

      act(() => {
        result.current.updateChallengeProgress(5, 80);
      });

      expect(result.current.currentChallenge?.progress).toBe(5);
    });

    it('should mark challenge as completed when target is reached', () => {
      const { result } = renderHook(() => useDailyChallengeStore());

      // Setup a challenge with specific targets
      act(() => {
        useDailyChallengeStore.setState({
          currentChallenge: {
            id: 'test-challenge',
            title: 'Test Challenge',
            description: 'Complete 10 questions with 70% accuracy',
            difficulty: 'medium',
            points: 200,
            category: 'React',
            targetQuestions: 10,
            targetAccuracy: 70,
            progress: 0,
            completed: false,
          },
          lastChallengeDate: new Date().toDateString(),
        });
      });

      // Update with progress that meets targets
      act(() => {
        result.current.updateChallengeProgress(10, 75);
      });

      expect(result.current.currentChallenge?.completed).toBe(true);
      expect(result.current.currentChallenge?.progress).toBe(10);
    });

    it('should not mark as completed if accuracy is below target', () => {
      const { result } = renderHook(() => useDailyChallengeStore());

      act(() => {
        useDailyChallengeStore.setState({
          currentChallenge: {
            id: 'test-challenge',
            title: 'Test Challenge',
            description: 'Complete 10 questions with 80% accuracy',
            difficulty: 'hard',
            points: 300,
            category: 'TypeScript',
            targetQuestions: 10,
            targetAccuracy: 80,
            progress: 0,
            completed: false,
          },
          lastChallengeDate: new Date().toDateString(),
        });
      });

      act(() => {
        result.current.updateChallengeProgress(10, 70);
      });

      expect(result.current.currentChallenge?.completed).toBe(false);
    });
  });

  describe('completeChallenge', () => {
    it('should add completed challenge to history', () => {
      const { result } = renderHook(() => useDailyChallengeStore());

      const challenge = {
        id: 'complete-test',
        title: 'Complete Test',
        description: 'Test challenge',
        difficulty: 'easy' as const,
        points: 100,
        category: 'General',
        targetQuestions: 5,
        targetAccuracy: 60,
        progress: 5,
        completed: false,
      };

      act(() => {
        useDailyChallengeStore.setState({
          currentChallenge: challenge,
          lastChallengeDate: new Date().toDateString(),
        });
      });

      act(() => {
        result.current.completeChallenge();
      });

      expect(result.current.completedChallenges).toHaveLength(1);
      expect(result.current.completedChallenges[0]).toMatchObject({
        ...challenge,
        completed: true,
        completedDate: expect.any(String),
      });
    });

    it('should increment challenge streak', () => {
      const { result } = renderHook(() => useDailyChallengeStore());

      act(() => {
        useDailyChallengeStore.setState({
          currentChallenge: {
            id: 'streak-test',
            title: 'Streak Test',
            description: 'Test',
            difficulty: 'medium',
            points: 150,
            category: 'General',
            targetQuestions: 10,
            targetAccuracy: 70,
            progress: 10,
            completed: false,
          },
          challengeStreak: 5,
          lastChallengeDate: new Date().toDateString(),
        });
      });

      act(() => {
        result.current.completeChallenge();
      });

      expect(result.current.challengeStreak).toBe(6);
    });

    it('should add points to total', () => {
      const { result } = renderHook(() => useDailyChallengeStore());

      act(() => {
        useDailyChallengeStore.setState({
          currentChallenge: {
            id: 'points-test',
            title: 'Points Test',
            description: 'Test',
            difficulty: 'hard',
            points: 500,
            category: 'Advanced',
            targetQuestions: 20,
            targetAccuracy: 90,
            progress: 20,
            completed: false,
          },
          totalPoints: 1000,
          lastChallengeDate: new Date().toDateString(),
        });
      });

      act(() => {
        result.current.completeChallenge();
      });

      expect(result.current.totalPoints).toBe(1500);
    });

    it('should apply streak bonus to points', () => {
      const { result } = renderHook(() => useDailyChallengeStore());

      act(() => {
        useDailyChallengeStore.setState({
          currentChallenge: {
            id: 'bonus-test',
            title: 'Bonus Test',
            description: 'Test',
            difficulty: 'medium',
            points: 100,
            category: 'General',
            targetQuestions: 10,
            targetAccuracy: 70,
            progress: 10,
            completed: false,
          },
          challengeStreak: 7, // 7 day streak = 1.7x multiplier
          totalPoints: 0,
          lastChallengeDate: new Date().toDateString(),
        });
      });

      act(() => {
        result.current.completeChallenge();
      });

      // 100 points * 1.7 = 170 points
      expect(result.current.totalPoints).toBe(170);
    });
  });

  describe('getChallengeRewards', () => {
    it('should calculate rewards based on difficulty', () => {
      const { result } = renderHook(() => useDailyChallengeStore());

      const easyRewards = result.current.getChallengeRewards('easy');
      const mediumRewards = result.current.getChallengeRewards('medium');
      const hardRewards = result.current.getChallengeRewards('hard');

      expect(easyRewards.points).toBe(100);
      expect(mediumRewards.points).toBe(200);
      expect(hardRewards.points).toBe(500);

      expect(easyRewards.xp).toBe(50);
      expect(mediumRewards.xp).toBe(100);
      expect(hardRewards.xp).toBe(250);
    });

    it('should include streak multiplier in rewards', () => {
      const { result } = renderHook(() => useDailyChallengeStore());

      act(() => {
        useDailyChallengeStore.setState({ challengeStreak: 10 });
      });

      const rewards = result.current.getChallengeRewards('medium');

      // 10 day streak = 2x multiplier
      expect(rewards.points).toBe(400); // 200 * 2
      expect(rewards.xp).toBe(200); // 100 * 2
      expect(rewards.streakMultiplier).toBe(2);
    });
  });

  describe('resetChallengeStreak', () => {
    it('should reset streak to 0', () => {
      const { result } = renderHook(() => useDailyChallengeStore());

      act(() => {
        useDailyChallengeStore.setState({ challengeStreak: 15 });
      });

      act(() => {
        result.current.resetChallengeStreak();
      });

      expect(result.current.challengeStreak).toBe(0);
    });
  });

  describe('getStreakMultiplier', () => {
    it('should return correct multiplier for different streak lengths', () => {
      const { result } = renderHook(() => useDailyChallengeStore());

      const testCases = [
        { streak: 0, expected: 1.0 },
        { streak: 3, expected: 1.3 },
        { streak: 7, expected: 1.7 },
        { streak: 14, expected: 2.4 },
        { streak: 30, expected: 4.0 },
      ];

      testCases.forEach(({ streak, expected }) => {
        act(() => {
          useDailyChallengeStore.setState({ challengeStreak: streak });
        });

        expect(result.current.getStreakMultiplier()).toBe(expected);
      });
    });

    it('should cap multiplier at 5x', () => {
      const { result } = renderHook(() => useDailyChallengeStore());

      act(() => {
        useDailyChallengeStore.setState({ challengeStreak: 100 });
      });

      expect(result.current.getStreakMultiplier()).toBe(5.0);
    });
  });

  describe('Persistence', () => {
    it('should persist state to AsyncStorage', async () => {
      const { result } = renderHook(() => useDailyChallengeStore());

      act(() => {
        result.current.generateDailyChallenge();
      });

      // Wait for persistence
      await new Promise((resolve) => setTimeout(resolve, 100));

      const storedData = await AsyncStorage.getItem('daily-challenge-storage');
      expect(storedData).toBeTruthy();

      const parsed = JSON.parse(storedData!);
      expect(parsed.state.currentChallenge).toBeDefined();
    });
  });
});
