import { renderHook, act } from '@testing-library/react-native';
import { useHeartsStore } from '../heartsStore';
import AsyncStorage from '@react-native-async-storage/async-storage';

describe('Hearts Store', () => {
  beforeEach(() => {
    // Clear store between tests
    useHeartsStore.setState({
      hearts: 5,
      maxHearts: 5,
      lastRegenerationTime: Date.now(),
      isUnlimited: false,
    });
    AsyncStorage.clear();
  });

  describe('Initial State', () => {
    it('should have correct initial values', () => {
      const { result } = renderHook(() => useHeartsStore());

      expect(result.current.hearts).toBe(5);
      expect(result.current.maxHearts).toBe(5);
      expect(result.current.isUnlimited).toBe(false);
    });
  });

  describe('loseHeart', () => {
    it('should decrease hearts by 1 when hearts are available', () => {
      const { result } = renderHook(() => useHeartsStore());

      act(() => {
        const success = result.current.loseHeart();
        expect(success).toBe(true);
      });

      expect(result.current.hearts).toBe(4);
    });

    it('should return false when no hearts are left', () => {
      const { result } = renderHook(() => useHeartsStore());

      // Lose all hearts
      act(() => {
        useHeartsStore.setState({ hearts: 0 });
      });

      act(() => {
        const success = result.current.loseHeart();
        expect(success).toBe(false);
      });

      expect(result.current.hearts).toBe(0);
    });

    it('should not decrease hearts for unlimited users', () => {
      const { result } = renderHook(() => useHeartsStore());

      act(() => {
        result.current.setUnlimited(true);
      });

      const initialHearts = result.current.hearts;

      act(() => {
        const success = result.current.loseHeart();
        expect(success).toBe(true);
      });

      expect(result.current.hearts).toBe(initialHearts);
    });

    it('should update lastRegenerationTime when losing a heart', () => {
      const { result } = renderHook(() => useHeartsStore());
      const timeBefore = Date.now();

      act(() => {
        result.current.loseHeart();
      });

      expect(result.current.lastRegenerationTime).toBeGreaterThanOrEqual(timeBefore);
    });
  });

  describe('addHeart', () => {
    it('should increase hearts by 1 when below max', () => {
      const { result } = renderHook(() => useHeartsStore());

      act(() => {
        useHeartsStore.setState({ hearts: 3 });
      });

      act(() => {
        result.current.addHeart();
      });

      expect(result.current.hearts).toBe(4);
    });

    it('should not exceed max hearts', () => {
      const { result } = renderHook(() => useHeartsStore());

      act(() => {
        useHeartsStore.setState({ hearts: 5 });
      });

      act(() => {
        result.current.addHeart();
      });

      expect(result.current.hearts).toBe(5);
    });
  });

  describe('regenerateHearts', () => {
    it('should regenerate hearts after 1 hour', () => {
      const { result } = renderHook(() => useHeartsStore());

      // Set hearts to 2 and lastRegenerationTime to 1 hour ago
      act(() => {
        useHeartsStore.setState({
          hearts: 2,
          lastRegenerationTime: Date.now() - 60 * 60 * 1000, // 1 hour ago
        });
      });

      act(() => {
        result.current.regenerateHearts();
      });

      expect(result.current.hearts).toBe(3);
    });

    it('should regenerate multiple hearts for multiple hours', () => {
      const { result } = renderHook(() => useHeartsStore());

      // Set hearts to 1 and lastRegenerationTime to 3 hours ago
      act(() => {
        useHeartsStore.setState({
          hearts: 1,
          lastRegenerationTime: Date.now() - 3 * 60 * 60 * 1000, // 3 hours ago
        });
      });

      act(() => {
        result.current.regenerateHearts();
      });

      expect(result.current.hearts).toBe(4);
    });

    it('should not exceed max hearts during regeneration', () => {
      const { result } = renderHook(() => useHeartsStore());

      // Set hearts to 3 and lastRegenerationTime to 5 hours ago
      act(() => {
        useHeartsStore.setState({
          hearts: 3,
          lastRegenerationTime: Date.now() - 5 * 60 * 60 * 1000, // 5 hours ago
        });
      });

      act(() => {
        result.current.regenerateHearts();
      });

      expect(result.current.hearts).toBe(5); // Should cap at maxHearts
    });

    it('should not regenerate for unlimited users', () => {
      const { result } = renderHook(() => useHeartsStore());

      act(() => {
        useHeartsStore.setState({
          hearts: 3,
          isUnlimited: true,
          lastRegenerationTime: Date.now() - 60 * 60 * 1000,
        });
      });

      act(() => {
        result.current.regenerateHearts();
      });

      expect(result.current.hearts).toBe(3); // Should remain unchanged
    });
  });

  describe('refillHearts', () => {
    it('should refill hearts to maximum', () => {
      const { result } = renderHook(() => useHeartsStore());

      act(() => {
        useHeartsStore.setState({ hearts: 1 });
      });

      act(() => {
        result.current.refillHearts();
      });

      expect(result.current.hearts).toBe(5);
    });

    it('should reset lastRegenerationTime', () => {
      const { result } = renderHook(() => useHeartsStore());
      const timeBefore = Date.now();

      act(() => {
        result.current.refillHearts();
      });

      expect(result.current.lastRegenerationTime).toBeGreaterThanOrEqual(timeBefore);
    });
  });

  describe('setUnlimited', () => {
    it('should set unlimited status to true', () => {
      const { result } = renderHook(() => useHeartsStore());

      act(() => {
        result.current.setUnlimited(true);
      });

      expect(result.current.isUnlimited).toBe(true);
    });

    it('should refill hearts when setting unlimited', () => {
      const { result } = renderHook(() => useHeartsStore());

      act(() => {
        useHeartsStore.setState({ hearts: 2 });
      });

      act(() => {
        result.current.setUnlimited(true);
      });

      expect(result.current.hearts).toBe(5);
    });

    it('should preserve hearts when removing unlimited', () => {
      const { result } = renderHook(() => useHeartsStore());

      act(() => {
        useHeartsStore.setState({ hearts: 3, isUnlimited: true });
      });

      act(() => {
        result.current.setUnlimited(false);
      });

      expect(result.current.isUnlimited).toBe(false);
      expect(result.current.hearts).toBe(3);
    });
  });

  describe('canPlayQuiz', () => {
    it('should return true when hearts are available', () => {
      const { result } = renderHook(() => useHeartsStore());

      act(() => {
        useHeartsStore.setState({ hearts: 3 });
      });

      expect(result.current.canPlayQuiz()).toBe(true);
    });

    it('should return false when no hearts are available', () => {
      const { result } = renderHook(() => useHeartsStore());

      act(() => {
        useHeartsStore.setState({ hearts: 0 });
      });

      expect(result.current.canPlayQuiz()).toBe(false);
    });

    it('should return true for unlimited users regardless of hearts', () => {
      const { result } = renderHook(() => useHeartsStore());

      act(() => {
        useHeartsStore.setState({ hearts: 0, isUnlimited: true });
      });

      expect(result.current.canPlayQuiz()).toBe(true);
    });
  });

  describe('getTimeUntilNextHeart', () => {
    it('should return time until next heart regeneration', () => {
      const { result } = renderHook(() => useHeartsStore());

      // Set lastRegenerationTime to 30 minutes ago
      act(() => {
        useHeartsStore.setState({
          hearts: 3,
          lastRegenerationTime: Date.now() - 30 * 60 * 1000, // 30 minutes ago
        });
      });

      const timeUntilNext = result.current.getTimeUntilNextHeart();

      // Should be approximately 30 minutes (1800 seconds)
      expect(timeUntilNext).toBeGreaterThan(1790);
      expect(timeUntilNext).toBeLessThanOrEqual(1800);
    });

    it('should return 0 when hearts are full', () => {
      const { result } = renderHook(() => useHeartsStore());

      act(() => {
        useHeartsStore.setState({ hearts: 5 });
      });

      expect(result.current.getTimeUntilNextHeart()).toBe(0);
    });

    it('should return 0 for unlimited users', () => {
      const { result } = renderHook(() => useHeartsStore());

      act(() => {
        useHeartsStore.setState({ hearts: 3, isUnlimited: true });
      });

      expect(result.current.getTimeUntilNextHeart()).toBe(0);
    });
  });

  describe('Persistence', () => {
    it('should persist state to AsyncStorage', async () => {
      const { result } = renderHook(() => useHeartsStore());

      act(() => {
        result.current.loseHeart();
      });

      // Wait for persistence
      await new Promise((resolve) => setTimeout(resolve, 100));

      const storedData = await AsyncStorage.getItem('hearts-storage');
      expect(storedData).toBeTruthy();

      const parsed = JSON.parse(storedData!);
      expect(parsed.state.hearts).toBe(4);
    });
  });
});
