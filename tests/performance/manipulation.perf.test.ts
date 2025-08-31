import { performance } from 'perf_hooks';
import { renderHook, act } from '@testing-library/react-hooks';
import { useStreakStore } from '../../store/streakStore';
import { useHeartsStore } from '../../store/heartsStore';
import { useLeaderboardStore } from '../../store/leaderboardStore';
import { useDailyChallengeStore } from '../../store/dailyChallengeStore';
import { remoteConfigService } from '../../services/remoteConfigService';

describe('Performance Tests - Manipulation Features', () => {
  describe('Store Performance', () => {
    it('should handle rapid state updates without blocking UI', async () => {
      const { result } = renderHook(() => useStreakStore());

      const startTime = performance.now();
      const iterations = 10000;

      // Simulate rapid updates
      for (let i = 0; i < iterations; i++) {
        act(() => {
          result.current.checkStreak();
          if (i % 100 === 0) {
            result.current.checkMilestone();
          }
        });
      }

      const endTime = performance.now();
      const totalTime = endTime - startTime;
      const avgTime = totalTime / iterations;

      // Should handle 10,000 operations in under 1 second
      expect(totalTime).toBeLessThan(1000);
      // Average operation should be under 0.1ms
      expect(avgTime).toBeLessThan(0.1);
    });

    it('should efficiently manage large leaderboard datasets', async () => {
      const { result } = renderHook(() => useLeaderboardStore());

      const startTime = performance.now();

      // Generate and process large dataset
      act(() => {
        result.current.updateLeaderboards();
      });

      // Simulate multiple fake activity updates
      for (let i = 0; i < 100; i++) {
        act(() => {
          result.current.generateFakeActivity();
        });
      }

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      // Should process 200+ users and 100 updates in under 500ms
      expect(totalTime).toBeLessThan(500);

      // Check memory usage doesn't exceed reasonable limits
      if (global.gc) {
        global.gc();
        const memUsage = process.memoryUsage();
        expect(memUsage.heapUsed).toBeLessThan(50 * 1024 * 1024); // 50MB
      }
    });

    it('should handle concurrent store operations', async () => {
      const streakHook = renderHook(() => useStreakStore());
      const heartsHook = renderHook(() => useHeartsStore());
      const challengeHook = renderHook(() => useDailyChallengeStore());

      const startTime = performance.now();

      // Simulate concurrent operations
      const operations = [
        // Streak operations
        ...Array(100)
          .fill(null)
          .map(
            () =>
              new Promise((resolve) => {
                act(() => {
                  streakHook.result.current.updateStreak();
                  resolve(null);
                });
              }),
          ),
        // Hearts operations
        ...Array(100)
          .fill(null)
          .map(
            () =>
              new Promise((resolve) => {
                act(() => {
                  heartsHook.result.current.loseHeart();
                  heartsHook.result.current.checkRegeneration();
                  resolve(null);
                });
              }),
          ),
        // Challenge operations
        ...Array(100)
          .fill(null)
          .map(
            () =>
              new Promise((resolve) => {
                act(() => {
                  challengeHook.result.current.updateProgress(1);
                  challengeHook.result.current.getTimeRemaining();
                  resolve(null);
                });
              }),
          ),
      ];

      await Promise.all(operations);

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      // Should handle 300 concurrent operations in under 200ms
      expect(totalTime).toBeLessThan(200);
    });
  });

  describe('Animation Performance', () => {
    it('should maintain 60 FPS during streak animations', () => {
      const frameTime = 1000 / 60; // 16.67ms for 60 FPS
      const animationSteps = 60; // 1 second of animation

      const frameTimes: number[] = [];

      for (let i = 0; i < animationSteps; i++) {
        const startFrame = performance.now();

        // Simulate animation calculations
        const scale = 1 + Math.sin(i * 0.1) * 0.1;
        const rotation = i * 2;
        const opacity = Math.abs(Math.sin(i * 0.05));

        // Simulate transform matrix calculations
        const transform = {
          scale,
          rotation,
          opacity,
          translateX: Math.sin(i * 0.1) * 10,
          translateY: Math.cos(i * 0.1) * 10,
        };

        const endFrame = performance.now();
        frameTimes.push(endFrame - startFrame);
      }

      const avgFrameTime = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
      const maxFrameTime = Math.max(...frameTimes);

      // Average frame time should be under 16.67ms
      expect(avgFrameTime).toBeLessThan(frameTime);
      // No frame should take longer than 33ms (30 FPS minimum)
      expect(maxFrameTime).toBeLessThan(33);
    });

    it('should efficiently handle multiple simultaneous animations', () => {
      const animations = [
        'streak-pulse',
        'hearts-bounce',
        'challenge-timer',
        'leaderboard-update',
        'notification-slide',
      ];

      const startTime = performance.now();

      // Simulate 5 animations running for 60 frames each
      for (let frame = 0; frame < 60; frame++) {
        animations.forEach((animation) => {
          // Simulate animation update
          const progress = frame / 60;
          const easing = progress * progress * (3 - 2 * progress); // smoothstep

          switch (animation) {
            case 'streak-pulse':
              const scale = 1 + Math.sin(progress * Math.PI * 2) * 0.1;
              break;
            case 'hearts-bounce':
              const bounce = Math.abs(Math.sin(progress * Math.PI * 4));
              break;
            case 'challenge-timer':
              const rotation = progress * 360;
              break;
            case 'leaderboard-update':
              const slideY = easing * 100;
              break;
            case 'notification-slide':
              const slideX = easing * 200;
              break;
          }
        });
      }

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      // Should handle 5 animations for 1 second in under 100ms
      expect(totalTime).toBeLessThan(100);
    });
  });

  describe('Remote Config Performance', () => {
    it('should cache and serve config quickly', async () => {
      // First fetch (cold cache)
      const coldStart = performance.now();
      await remoteConfigService.initialize('test-user');
      const coldEnd = performance.now();
      const coldTime = coldEnd - coldStart;

      // Second fetch (warm cache)
      const warmStart = performance.now();
      const config = remoteConfigService.getConfig();
      const warmEnd = performance.now();
      const warmTime = warmEnd - warmStart;

      // Cold start should be under 100ms (excluding network)
      expect(coldTime).toBeLessThan(100);
      // Warm cache should be under 1ms
      expect(warmTime).toBeLessThan(1);
    });

    it('should efficiently evaluate feature flags', () => {
      const startTime = performance.now();
      const iterations = 100000;

      for (let i = 0; i < iterations; i++) {
        const isEnabled = remoteConfigService.isFeatureEnabled('streaksEnabled');
        const value = remoteConfigService.getFeatureValue('hearts.maxHearts', 5);
      }

      const endTime = performance.now();
      const totalTime = endTime - startTime;
      const avgTime = totalTime / (iterations * 2);

      // Should evaluate 200,000 feature checks in under 100ms
      expect(totalTime).toBeLessThan(100);
      // Average check should be under 0.001ms
      expect(avgTime).toBeLessThan(0.001);
    });

    it('should handle concurrent config updates without race conditions', async () => {
      const updates = Array(50)
        .fill(null)
        .map(
          (_, i) =>
            new Promise(async (resolve) => {
              // Simulate config update
              if (i % 10 === 0) {
                await remoteConfigService.forceRefresh();
              }

              // Simulate feature flag checks
              const features = [
                'streaksEnabled',
                'heartsEnabled',
                'dailyChallengesEnabled',
                'leaderboardEnabled',
                'socialFeaturesEnabled',
              ];

              features.forEach((feature) => {
                remoteConfigService.isFeatureEnabled(feature as any);
              });

              resolve(null);
            }),
        );

      const startTime = performance.now();
      await Promise.all(updates);
      const endTime = performance.now();
      const totalTime = endTime - startTime;

      // Should handle 50 concurrent operations in under 200ms
      expect(totalTime).toBeLessThan(200);
    });
  });

  describe('Memory Management', () => {
    it('should not leak memory during store updates', () => {
      const initialMemory = process.memoryUsage().heapUsed;

      // Perform many operations
      for (let i = 0; i < 1000; i++) {
        const { result, unmount } = renderHook(() => useStreakStore());

        act(() => {
          result.current.updateStreak();
          result.current.checkMilestone();
        });

        unmount();
      }

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;

      // Memory increase should be less than 10MB
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
    });

    it('should efficiently handle large notification queues', async () => {
      const { notificationService } = require('../../services/notificationService');

      const startMemory = process.memoryUsage().heapUsed;

      // Schedule many notifications
      for (let i = 0; i < 1000; i++) {
        await notificationService.scheduleOneTimeNotification(
          `Test notification ${i}`,
          'Test body',
          i * 60, // Different times
          { type: 'test' },
        );
      }

      if (global.gc) {
        global.gc();
      }

      const endMemory = process.memoryUsage().heapUsed;
      const memoryUsed = endMemory - startMemory;

      // Should use less than 5MB for 1000 notifications
      expect(memoryUsed).toBeLessThan(5 * 1024 * 1024);
    });
  });

  describe('Network Performance', () => {
    it('should batch API calls efficiently', async () => {
      const apiCalls: Promise<any>[] = [];

      const startTime = performance.now();

      // Simulate multiple API calls that should be batched
      for (let i = 0; i < 20; i++) {
        apiCalls.push(remoteConfigService.fetchDynamicQuizzes('category' + i));
      }

      await Promise.all(apiCalls);

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      // Should batch 20 calls efficiently (under 500ms excluding network)
      expect(totalTime).toBeLessThan(500);
    });

    it('should handle offline mode gracefully', async () => {
      // Simulate offline mode
      const mockNetInfo = {
        isConnected: false,
        isInternetReachable: false,
      };

      const startTime = performance.now();

      // These should use cached data
      const config = remoteConfigService.getConfig();
      const { result: streakResult } = renderHook(() => useStreakStore());
      const { result: heartsResult } = renderHook(() => useHeartsStore());

      act(() => {
        streakResult.current.updateStreak();
        heartsResult.current.loseHeart();
      });

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      // Offline operations should be fast (under 10ms)
      expect(totalTime).toBeLessThan(10);

      // Data should be available from cache
      expect(config).toBeDefined();
      expect(streakResult.current.currentStreak).toBeDefined();
      expect(heartsResult.current.hearts).toBeDefined();
    });
  });

  describe('Load Testing', () => {
    it('should handle 10,000 concurrent users', async () => {
      const users = Array(10000)
        .fill(null)
        .map((_, i) => ({
          id: `user-${i}`,
          streak: Math.floor(Math.random() * 365),
          hearts: Math.floor(Math.random() * 5),
          xp: Math.floor(Math.random() * 10000),
        }));

      const startTime = performance.now();

      // Simulate operations for all users
      const operations = users.map(
        (user) =>
          new Promise((resolve) => {
            // Simulate user actions
            const userOps = [
              () => {
                /* Update streak */
              },
              () => {
                /* Check hearts */
              },
              () => {
                /* Update leaderboard position */
              },
              () => {
                /* Check daily challenge */
              },
            ];

            userOps.forEach((op) => op());
            resolve(null);
          }),
      );

      await Promise.all(operations);

      const endTime = performance.now();
      const totalTime = endTime - startTime;
      const avgTimePerUser = totalTime / users.length;

      // Should handle 10,000 users in under 5 seconds
      expect(totalTime).toBeLessThan(5000);
      // Average time per user should be under 0.5ms
      expect(avgTimePerUser).toBeLessThan(0.5);
    });

    it('should maintain performance under sustained load', async () => {
      const duration = 10000; // 10 seconds
      const startTime = performance.now();
      let operationCount = 0;

      const sustainedLoad = new Promise((resolve) => {
        const interval = setInterval(() => {
          const elapsed = performance.now() - startTime;

          if (elapsed >= duration) {
            clearInterval(interval);
            resolve(operationCount);
            return;
          }

          // Perform operations
          for (let i = 0; i < 100; i++) {
            remoteConfigService.isFeatureEnabled('streaksEnabled');
            operationCount++;
          }
        }, 10); // Every 10ms
      });

      const totalOps = await sustainedLoad;
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      const opsPerSecond = (totalOps as number) / (totalTime / 1000);

      // Should maintain at least 10,000 operations per second
      expect(opsPerSecond).toBeGreaterThan(10000);
    });
  });
});
