// src/services/api/queryClient.ts
import { QueryClient } from '@tanstack/react-query';
import NetInfo from '@react-native-community/netinfo';

// Custom error class for API errors
export class APIError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public data?: any,
  ) {
    super(message);
    this.name = 'APIError';
  }
}

// Create a QueryClient instance with optimized settings
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Stale time: 5 minutes
      staleTime: 5 * 60 * 1000,
      // Cache time: 10 minutes
      gcTime: 10 * 60 * 1000,
      // Retry failed requests 3 times with exponential backoff
      retry: (failureCount, error) => {
        if (error instanceof APIError) {
          // Don't retry on 4xx errors (except 429)
          if (error.statusCode >= 400 && error.statusCode < 500 && error.statusCode !== 429) {
            return false;
          }
        }
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Refetch on window focus
      refetchOnWindowFocus: true,
      // Refetch on network reconnect
      refetchOnReconnect: 'always',
      // Network mode
      networkMode: 'online',
    },
    mutations: {
      // Retry mutations once
      retry: 1,
      retryDelay: 1000,
      networkMode: 'online',
    },
  },
});

// Network status monitoring
let isOnline = true;

NetInfo.addEventListener((state) => {
  const wasOnline = isOnline;
  isOnline = !!state.isConnected;

  // If we just came back online, refetch active queries
  if (!wasOnline && isOnline) {
    queryClient.refetchQueries({ type: 'active' });
  }
});

// Custom query key factory for consistent key generation
export const queryKeys = {
  all: ['quiz'] as const,
  categories: () => [...queryKeys.all, 'categories'] as const,
  category: (id: string) => [...queryKeys.categories(), id] as const,
  questions: () => [...queryKeys.all, 'questions'] as const,
  question: (id: string) => [...queryKeys.questions(), id] as const,
  dailyChallenge: (date: string) => [...queryKeys.all, 'daily', date] as const,
  leaderboard: (type: 'global' | 'friends' = 'global') =>
    [...queryKeys.all, 'leaderboard', type] as const,
  userStats: (userId: string) => [...queryKeys.all, 'user', userId, 'stats'] as const,
  userProgress: (userId: string) => [...queryKeys.all, 'user', userId, 'progress'] as const,
  achievements: (userId: string) => [...queryKeys.all, 'user', userId, 'achievements'] as const,
};

// Prefetch utilities
export const prefetchQuizData = async () => {
  await queryClient.prefetchQuery({
    queryKey: queryKeys.categories(),
    queryFn: async () => {
      // This would be replaced with actual API call
      const { getQuizData } = await import('../devQuizData');
      return getQuizData();
    },
    staleTime: 60 * 60 * 1000, // 1 hour
  });
};

// Invalidation utilities
export const invalidateUserData = async (userId: string) => {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: queryKeys.userStats(userId) }),
    queryClient.invalidateQueries({ queryKey: queryKeys.userProgress(userId) }),
    queryClient.invalidateQueries({ queryKey: queryKeys.achievements(userId) }),
  ]);
};

// Optimistic update utilities
export const updateUserStatsOptimistically = (userId: string, updater: (oldData: any) => any) => {
  queryClient.setQueryData(queryKeys.userStats(userId), updater);
};

export default queryClient;
