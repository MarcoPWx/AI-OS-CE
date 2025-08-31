import { LeaderboardService } from '../leaderboardService';
import { supabase } from '../../lib/supabase';
import { CacheManager, PerformanceMonitor } from '../../lib/api';
import authService from '../authService';
import {
  createMockUser,
  createMockLeaderboardEntry,
  createMockLeaderboardEntries,
  createMockUserStats,
  resetIdCounter,
} from '../../tests/factories';

// Mock dependencies
jest.mock('../../lib/supabase');
jest.mock('../../lib/api');
jest.mock('../authService');

describe('LeaderboardService', () => {
  let leaderboardService: LeaderboardService;
  const mockSupabase = supabase as jest.Mocked<typeof supabase>;
  const mockAuthService = authService as jest.Mocked<typeof authService>;
  const mockCacheManager = CacheManager as jest.Mocked<typeof CacheManager>;

  beforeEach(() => {
    jest.clearAllMocks();
    resetIdCounter();

    // Reset singleton
    (LeaderboardService as any).instance = null;
    leaderboardService = LeaderboardService.getInstance();

    // Mock PerformanceMonitor
    (PerformanceMonitor.measure as jest.Mock) = jest
      .fn()
      .mockImplementation(async (name, fn) => fn());
  });

  describe('getInstance', () => {
    it('should return singleton instance', () => {
      const instance1 = LeaderboardService.getInstance();
      const instance2 = LeaderboardService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('getGlobalLeaderboard', () => {
    it('should fetch global leaderboard successfully', async () => {
      const mockEntries = createMockLeaderboardEntries(10);
      const mockUser = createMockUser();

      mockAuthService.getCurrentUser = jest.fn().mockResolvedValue(mockUser);
      mockCacheManager.get = jest.fn().mockResolvedValue(null);
      mockCacheManager.set = jest.fn().mockResolvedValue(undefined);

      // Mock leaderboard fetch
      mockSupabase.from = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          order: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue({
              data: mockEntries.map((entry, index) => ({
                user_id: entry.userId,
                username: entry.username,
                display_name: entry.displayName,
                avatar_url: entry.avatarUrl,
                total_xp: entry.totalXp,
                total_stars: entry.totalStars,
                quizzes_completed: entry.quizzesCompleted,
                perfect_scores: entry.perfectScores,
                current_streak: entry.currentStreak,
                longest_streak: entry.longestStreak,
                rank: index + 1,
                level: entry.level,
                badges: entry.badges,
                is_premium: entry.isPremium,
                country: entry.country,
                last_active: entry.lastActive.toISOString(),
              })),
              error: null,
            }),
          }),
        }),
      });

      const result = await leaderboardService.getGlobalLeaderboard({
        timeRange: 'all',
        limit: 10,
      });

      expect(result).toMatchObject({
        entries: expect.arrayContaining([
          expect.objectContaining({
            userId: expect.any(String),
            username: expect.any(String),
            totalXp: expect.any(Number),
            rank: expect.any(Number),
          }),
        ]),
        totalEntries: 10,
        userRank: expect.any(Number),
      });

      expect(mockSupabase.from).toHaveBeenCalledWith('leaderboards');
      expect(result.entries).toHaveLength(10);
    });

    it('should use cached data if available', async () => {
      const mockEntries = createMockLeaderboardEntries(5);
      const mockUser = createMockUser();

      mockAuthService.getCurrentUser = jest.fn().mockResolvedValue(mockUser);
      mockCacheManager.get = jest.fn().mockResolvedValue({
        entries: mockEntries,
        totalEntries: 5,
        userRank: 3,
      });

      const result = await leaderboardService.getGlobalLeaderboard({
        timeRange: 'week',
        limit: 5,
      });

      expect(result.entries).toEqual(mockEntries);
      expect(mockSupabase.from).not.toHaveBeenCalled();
      expect(mockCacheManager.get).toHaveBeenCalledWith(
        expect.stringContaining('leaderboard:global:week'),
      );
    });

    it('should handle different time ranges', async () => {
      const mockEntries = createMockLeaderboardEntries(5);

      mockAuthService.getCurrentUser = jest.fn().mockResolvedValue(null);
      mockCacheManager.get = jest.fn().mockResolvedValue(null);

      // Mock for daily leaderboard
      mockSupabase.from = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          gte: jest.fn().mockReturnValue({
            order: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue({
                data: mockEntries.map((entry) => ({
                  user_id: entry.userId,
                  username: entry.username,
                  display_name: entry.displayName,
                  total_xp: entry.totalXp,
                  rank: entry.rank,
                })),
                error: null,
              }),
            }),
          }),
        }),
      });

      await leaderboardService.getGlobalLeaderboard({
        timeRange: 'day',
        limit: 5,
      });

      expect(mockSupabase.from).toHaveBeenCalledWith('leaderboards');
      // Check that date filter was applied
      const mockCall = (mockSupabase.from as jest.Mock).mock.results[0].value;
      expect(mockCall.select).toHaveBeenCalled();
    });

    it('should include user rank if authenticated', async () => {
      const mockEntries = createMockLeaderboardEntries(10);
      const mockUser = createMockUser();
      const userEntry = createMockLeaderboardEntry({
        userId: mockUser.id,
        rank: 15,
        totalXp: 500,
      });

      mockAuthService.getCurrentUser = jest.fn().mockResolvedValue(mockUser);
      mockCacheManager.get = jest.fn().mockResolvedValue(null);

      // Mock leaderboard fetch
      mockSupabase.from = jest.fn().mockImplementation((table) => {
        if (table === 'leaderboards') {
          return {
            select: jest.fn().mockImplementation((fields) => {
              if (fields?.includes('rank')) {
                // User rank query
                return {
                  eq: jest.fn().mockReturnValue({
                    single: jest.fn().mockResolvedValue({
                      data: { rank: 15 },
                      error: null,
                    }),
                  }),
                };
              }
              // Main leaderboard query
              return {
                order: jest.fn().mockReturnValue({
                  limit: jest.fn().mockResolvedValue({
                    data: mockEntries.map((entry) => ({
                      user_id: entry.userId,
                      username: entry.username,
                      total_xp: entry.totalXp,
                      rank: entry.rank,
                    })),
                    error: null,
                  }),
                }),
              };
            }),
          };
        }
        return {};
      });

      const result = await leaderboardService.getGlobalLeaderboard({
        timeRange: 'all',
        limit: 10,
      });

      expect(result.userRank).toBe(15);
    });

    it('should handle pagination', async () => {
      const mockEntries = createMockLeaderboardEntries(20);

      mockAuthService.getCurrentUser = jest.fn().mockResolvedValue(null);
      mockCacheManager.get = jest.fn().mockResolvedValue(null);

      mockSupabase.from = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          order: jest.fn().mockReturnValue({
            range: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue({
                data: mockEntries.slice(10, 20).map((entry) => ({
                  user_id: entry.userId,
                  username: entry.username,
                  total_xp: entry.totalXp,
                  rank: entry.rank,
                })),
                error: null,
              }),
            }),
          }),
        }),
      });

      const result = await leaderboardService.getGlobalLeaderboard({
        timeRange: 'all',
        limit: 10,
        offset: 10,
      });

      expect(result.entries).toHaveLength(10);
    });
  });

  describe('getCategoryLeaderboard', () => {
    it('should fetch category-specific leaderboard', async () => {
      const mockEntries = createMockLeaderboardEntries(5);
      const categoryId = 'cat-123';

      mockAuthService.getCurrentUser = jest.fn().mockResolvedValue(null);
      mockCacheManager.get = jest.fn().mockResolvedValue(null);

      mockSupabase.from = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue({
                data: mockEntries.map((entry) => ({
                  user_id: entry.userId,
                  username: entry.username,
                  category_xp: 1000,
                  category_quizzes: 20,
                  accuracy: 85.5,
                  rank: entry.rank,
                })),
                error: null,
              }),
            }),
          }),
        }),
      });

      const result = await leaderboardService.getCategoryLeaderboard({
        categoryId,
        timeRange: 'month',
        limit: 5,
      });

      expect(result.entries).toHaveLength(5);
      expect(mockSupabase.from).toHaveBeenCalledWith('category_leaderboards');
    });

    it('should cache category leaderboard data', async () => {
      const mockEntries = createMockLeaderboardEntries(5);
      const categoryId = 'cat-123';

      mockAuthService.getCurrentUser = jest.fn().mockResolvedValue(null);
      mockCacheManager.get = jest.fn().mockResolvedValue(null);
      mockCacheManager.set = jest.fn().mockResolvedValue(undefined);

      mockSupabase.from = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue({
                data: mockEntries.map((entry) => ({
                  user_id: entry.userId,
                  username: entry.username,
                  category_xp: 1000,
                  rank: entry.rank,
                })),
                error: null,
              }),
            }),
          }),
        }),
      });

      await leaderboardService.getCategoryLeaderboard({
        categoryId,
        timeRange: 'week',
        limit: 5,
      });

      expect(mockCacheManager.set).toHaveBeenCalledWith(
        expect.stringContaining(`leaderboard:category:${categoryId}:week`),
        expect.any(Object),
        300, // 5 minutes cache
      );
    });
  });

  describe('getFriendsLeaderboard', () => {
    it('should fetch friends leaderboard for authenticated user', async () => {
      const mockUser = createMockUser();
      const mockFriends = createMockLeaderboardEntries(5);

      mockAuthService.getCurrentUser = jest.fn().mockResolvedValue(mockUser);
      mockCacheManager.get = jest.fn().mockResolvedValue(null);

      // Mock friends fetch
      mockSupabase.from = jest.fn().mockImplementation((table) => {
        if (table === 'friendships') {
          return {
            select: jest.fn().mockReturnValue({
              or: jest.fn().mockReturnValue({
                eq: jest.fn().mockResolvedValue({
                  data: mockFriends.map((f) => ({
                    friend_id: f.userId,
                    user_id: mockUser.id,
                  })),
                  error: null,
                }),
              }),
            }),
          };
        }
        if (table === 'leaderboards') {
          return {
            select: jest.fn().mockReturnValue({
              in: jest.fn().mockReturnValue({
                order: jest.fn().mockResolvedValue({
                  data: mockFriends.map((entry) => ({
                    user_id: entry.userId,
                    username: entry.username,
                    total_xp: entry.totalXp,
                    rank: entry.rank,
                  })),
                  error: null,
                }),
              }),
            }),
          };
        }
        return {};
      });

      const result = await leaderboardService.getFriendsLeaderboard({
        timeRange: 'week',
        limit: 10,
      });

      expect(result.entries).toHaveLength(5);
      expect(mockSupabase.from).toHaveBeenCalledWith('friendships');
      expect(mockSupabase.from).toHaveBeenCalledWith('leaderboards');
    });

    it('should return empty list if user not authenticated', async () => {
      mockAuthService.getCurrentUser = jest.fn().mockResolvedValue(null);

      const result = await leaderboardService.getFriendsLeaderboard({
        timeRange: 'week',
        limit: 10,
      });

      expect(result.entries).toEqual([]);
      expect(result.totalEntries).toBe(0);
    });

    it('should include user in friends leaderboard', async () => {
      const mockUser = createMockUser();
      const mockFriends = createMockLeaderboardEntries(3);
      const userEntry = createMockLeaderboardEntry({
        userId: mockUser.id,
        username: mockUser.username,
        totalXp: 1500,
      });

      mockAuthService.getCurrentUser = jest.fn().mockResolvedValue(mockUser);
      mockCacheManager.get = jest.fn().mockResolvedValue(null);

      mockSupabase.from = jest.fn().mockImplementation((table) => {
        if (table === 'friendships') {
          return {
            select: jest.fn().mockReturnValue({
              or: jest.fn().mockReturnValue({
                eq: jest.fn().mockResolvedValue({
                  data: mockFriends.map((f) => ({ friend_id: f.userId })),
                  error: null,
                }),
              }),
            }),
          };
        }
        if (table === 'leaderboards') {
          return {
            select: jest.fn().mockReturnValue({
              in: jest.fn().mockReturnValue({
                order: jest.fn().mockResolvedValue({
                  data: [...mockFriends, userEntry].map((entry) => ({
                    user_id: entry.userId,
                    username: entry.username,
                    total_xp: entry.totalXp,
                  })),
                  error: null,
                }),
              }),
            }),
          };
        }
        return {};
      });

      const result = await leaderboardService.getFriendsLeaderboard({
        timeRange: 'all',
        limit: 10,
      });

      expect(result.entries.some((e) => e.userId === mockUser.id)).toBe(true);
    });
  });

  describe('getUserStats', () => {
    it('should fetch user statistics', async () => {
      const userId = 'user-123';
      const mockStats = createMockUserStats();

      mockSupabase.from = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: {
                user_id: userId,
                total_xp: mockStats.totalXp,
                total_stars: mockStats.totalStars,
                quizzes_completed: mockStats.quizzesCompleted,
                perfect_scores: mockStats.perfectScores,
                current_streak: mockStats.currentStreak,
                longest_streak: mockStats.longestStreak,
                accuracy_rate: mockStats.accuracyRate,
                rank: mockStats.rank,
                level: mockStats.level,
                badges: mockStats.badges,
                achievements: mockStats.achievements,
                categories_mastered: mockStats.categoriesMastered,
                total_time_spent: mockStats.totalTimeSpent,
              },
              error: null,
            }),
          }),
        }),
      });

      const result = await leaderboardService.getUserStats(userId);

      expect(result).toMatchObject({
        totalXp: mockStats.totalXp,
        totalStars: mockStats.totalStars,
        quizzesCompleted: mockStats.quizzesCompleted,
        rank: mockStats.rank,
        level: mockStats.level,
      });

      expect(mockSupabase.from).toHaveBeenCalledWith('user_stats');
    });

    it('should handle user not found', async () => {
      const userId = 'non-existent';

      mockSupabase.from = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'User not found' },
            }),
          }),
        }),
      });

      await expect(leaderboardService.getUserStats(userId)).rejects.toThrow('User not found');
    });
  });

  describe('updateUserScore', () => {
    it('should update user score after quiz completion', async () => {
      const updateData = {
        userId: 'user-123',
        xpEarned: 100,
        starsEarned: 5,
        categoryId: 'cat-1',
        accuracy: 90,
        timeSpent: 120,
      };

      mockSupabase.rpc = jest.fn().mockResolvedValue({
        data: { success: true },
        error: null,
      });

      await leaderboardService.updateUserScore(updateData);

      expect(mockSupabase.rpc).toHaveBeenCalledWith('update_leaderboard_score', {
        p_user_id: updateData.userId,
        p_xp_earned: updateData.xpEarned,
        p_stars_earned: updateData.starsEarned,
        p_category_id: updateData.categoryId,
        p_accuracy: updateData.accuracy,
        p_time_spent: updateData.timeSpent,
      });
    });

    it('should invalidate cache after score update', async () => {
      const updateData = {
        userId: 'user-123',
        xpEarned: 100,
        starsEarned: 5,
      };

      mockSupabase.rpc = jest.fn().mockResolvedValue({
        data: { success: true },
        error: null,
      });
      mockCacheManager.delete = jest.fn().mockResolvedValue(undefined);

      await leaderboardService.updateUserScore(updateData);

      expect(mockCacheManager.delete).toHaveBeenCalledWith(expect.stringContaining('leaderboard:'));
    });

    it('should handle update errors', async () => {
      const updateData = {
        userId: 'user-123',
        xpEarned: 100,
        starsEarned: 5,
      };

      mockSupabase.rpc = jest.fn().mockResolvedValue({
        data: null,
        error: { message: 'Update failed' },
      });

      await expect(leaderboardService.updateUserScore(updateData)).rejects.toThrow('Update failed');
    });
  });

  describe('getTopPerformers', () => {
    it('should fetch top performers across categories', async () => {
      const mockPerformers = createMockLeaderboardEntries(3);

      mockCacheManager.get = jest.fn().mockResolvedValue(null);

      mockSupabase.from = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          order: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue({
              data: mockPerformers.map((p) => ({
                user_id: p.userId,
                username: p.username,
                total_xp: p.totalXp,
                badges: p.badges,
                is_premium: p.isPremium,
              })),
              error: null,
            }),
          }),
        }),
      });

      const result = await leaderboardService.getTopPerformers({ limit: 3 });

      expect(result).toHaveLength(3);
      expect(result[0]).toMatchObject({
        userId: expect.any(String),
        username: expect.any(String),
        totalXp: expect.any(Number),
      });
    });

    it('should cache top performers data', async () => {
      const mockPerformers = createMockLeaderboardEntries(3);

      mockCacheManager.get = jest.fn().mockResolvedValue(null);
      mockCacheManager.set = jest.fn().mockResolvedValue(undefined);

      mockSupabase.from = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          order: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue({
              data: mockPerformers.map((p) => ({
                user_id: p.userId,
                username: p.username,
                total_xp: p.totalXp,
              })),
              error: null,
            }),
          }),
        }),
      });

      await leaderboardService.getTopPerformers({ limit: 3 });

      expect(mockCacheManager.set).toHaveBeenCalledWith(
        'leaderboard:top_performers',
        expect.any(Array),
        600, // 10 minutes cache
      );
    });
  });
});
