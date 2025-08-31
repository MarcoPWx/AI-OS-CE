import React from 'react';
import { QueryClient, QueryClientProvider, QueryCache, MutationCache } from '@tanstack/react-query';
import { Platform } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import Toast from 'react-native-toast-message';

// Create a query client with custom configuration
const createQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Stale time: Consider data fresh for 1 minute
        staleTime: 60 * 1000,
        // Cache time: Keep inactive data in cache for 5 minutes
        gcTime: 5 * 60 * 1000,
        // Retry failed requests 3 times with exponential backoff
        retry: (failureCount, error: any) => {
          // Don't retry on 4xx errors except 401 (unauthorized)
          if (
            error?.response?.status &&
            error.response.status >= 400 &&
            error.response.status !== 401
          ) {
            return false;
          }
          // Retry up to 3 times
          return failureCount < 3;
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        // Refetch on window focus
        refetchOnWindowFocus: true,
        // Refetch on reconnect
        refetchOnReconnect: true,
        // Network mode
        networkMode: 'online',
      },
      mutations: {
        // Retry mutations once
        retry: 1,
        retryDelay: 1000,
        // Network mode
        networkMode: 'online',
      },
    },
    // Query cache configuration
    queryCache: new QueryCache({
      onError: (error: any, query) => {
        // Show error toast for non-background queries
        if (query.state.data !== undefined) {
          const message = error?.message || 'An error occurred while fetching data';
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: message,
            position: 'top',
            visibilityTime: 3000,
          });
        }
      },
      onSuccess: (data, query) => {
        // Log successful queries in development
        if (__DEV__) {
          console.log(`Query ${query.queryKey} succeeded`);
        }
      },
    }),
    // Mutation cache configuration
    mutationCache: new MutationCache({
      onError: (error: any, variables, context, mutation) => {
        // Show error toast for mutations
        const message = error?.message || 'An error occurred';
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: message,
          position: 'top',
          visibilityTime: 4000,
        });
      },
      onSuccess: (data, variables, context, mutation) => {
        // Show success toast for specific mutations
        const mutationKey = mutation.options.mutationKey;
        if (mutationKey && shouldShowSuccessToast(mutationKey)) {
          Toast.show({
            type: 'success',
            text1: 'Success',
            text2: getSuccessMessage(mutationKey),
            position: 'top',
            visibilityTime: 2000,
          });
        }
      },
    }),
  });
};

// Determine if a success toast should be shown for a mutation
const shouldShowSuccessToast = (mutationKey: any): boolean => {
  const keysToShow = [
    'submitQuiz',
    'unlockAchievement',
    'updateProfile',
    'sendFriendRequest',
    'joinLeague',
  ];

  if (Array.isArray(mutationKey)) {
    return keysToShow.some((key) => mutationKey.includes(key));
  }

  return keysToShow.includes(mutationKey);
};

// Get success message for mutation
const getSuccessMessage = (mutationKey: any): string => {
  const messages: Record<string, string> = {
    submitQuiz: 'Quiz completed successfully!',
    unlockAchievement: 'Achievement unlocked!',
    updateProfile: 'Profile updated successfully',
    sendFriendRequest: 'Friend request sent',
    joinLeague: 'Joined league successfully',
  };

  if (Array.isArray(mutationKey)) {
    const key = mutationKey.find((k) => messages[k]);
    return messages[key] || 'Operation completed successfully';
  }

  return messages[mutationKey] || 'Operation completed successfully';
};

// Create query client instance
const queryClient = createQueryClient();

// Network status management
export const onlineManager = {
  setOnline: (online: boolean) => {
    queryClient.setMutationDefaults(['*'], {
      networkMode: online ? 'online' : 'offline',
    });
    queryClient.setQueryDefaults(['*'], {
      networkMode: online ? 'online' : 'offline',
    });
  },
};

// Set up network listener
if (Platform.OS !== 'web') {
  NetInfo.addEventListener((state) => {
    onlineManager.setOnline(state.isConnected ?? false);

    if (state.isConnected) {
      // Refetch queries when coming back online
      queryClient.refetchQueries({
        type: 'active',
        stale: true,
      });

      // Resume paused mutations
      queryClient.resumePausedMutations();
    }
  });
}

// Query key factory for consistent key generation
export const queryKeys = {
  all: ['quizmentor'] as const,
  auth: {
    all: () => [...queryKeys.all, 'auth'] as const,
    user: () => [...queryKeys.auth.all(), 'user'] as const,
    session: () => [...queryKeys.auth.all(), 'session'] as const,
  },
  quiz: {
    all: () => [...queryKeys.all, 'quiz'] as const,
    list: (filters?: any) => [...queryKeys.quiz.all(), 'list', filters] as const,
    detail: (id: string) => [...queryKeys.quiz.all(), 'detail', id] as const,
    questions: (categoryId: string) => [...queryKeys.quiz.all(), 'questions', categoryId] as const,
    session: (sessionId: string) => [...queryKeys.quiz.all(), 'session', sessionId] as const,
  },
  categories: {
    all: () => [...queryKeys.all, 'categories'] as const,
    list: () => [...queryKeys.categories.all(), 'list'] as const,
    detail: (id: string) => [...queryKeys.categories.all(), 'detail', id] as const,
    progress: (userId: string) => [...queryKeys.categories.all(), 'progress', userId] as const,
  },
  leaderboard: {
    all: () => [...queryKeys.all, 'leaderboard'] as const,
    global: (period: string) => [...queryKeys.leaderboard.all(), 'global', period] as const,
    friends: (period: string) => [...queryKeys.leaderboard.all(), 'friends', period] as const,
    league: (leagueId: string) => [...queryKeys.leaderboard.all(), 'league', leagueId] as const,
  },
  achievements: {
    all: () => [...queryKeys.all, 'achievements'] as const,
    list: (userId: string) => [...queryKeys.achievements.all(), 'list', userId] as const,
    progress: (userId: string) => [...queryKeys.achievements.all(), 'progress', userId] as const,
  },
  friends: {
    all: () => [...queryKeys.all, 'friends'] as const,
    list: (userId: string) => [...queryKeys.friends.all(), 'list', userId] as const,
    requests: (userId: string) => [...queryKeys.friends.all(), 'requests', userId] as const,
  },
  notifications: {
    all: () => [...queryKeys.all, 'notifications'] as const,
    list: (userId: string) => [...queryKeys.notifications.all(), 'list', userId] as const,
    unread: (userId: string) => [...queryKeys.notifications.all(), 'unread', userId] as const,
  },
  profile: {
    all: () => [...queryKeys.all, 'profile'] as const,
    detail: (userId: string) => [...queryKeys.profile.all(), userId] as const,
    stats: (userId: string) => [...queryKeys.profile.all(), 'stats', userId] as const,
  },
};

// Provider component
interface QueryProviderProps {
  children: React.ReactNode;
}

export const QueryProvider: React.FC<QueryProviderProps> = ({ children }) => {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

// Export query client for use in other parts of the app
export { queryClient };

// Utility functions for cache management
export const invalidateQueries = (keys: readonly unknown[]) => {
  return queryClient.invalidateQueries({ queryKey: keys });
};

export const prefetchQuery = async (keys: readonly unknown[], fetcher: () => Promise<any>) => {
  return queryClient.prefetchQuery({
    queryKey: keys,
    queryFn: fetcher,
  });
};

export const setQueryData = (keys: readonly unknown[], data: any) => {
  queryClient.setQueryData(keys, data);
};

export const getQueryData = (keys: readonly unknown[]) => {
  return queryClient.getQueryData(keys);
};

// Optimistic update helper
export const optimisticUpdate = <T,>(keys: readonly unknown[], updater: (old: T) => T) => {
  const previousData = queryClient.getQueryData(keys);

  if (previousData) {
    queryClient.setQueryData(keys, updater(previousData as T));
  }

  return { previousData };
};

// Reset all queries (useful for logout)
export const resetQueries = () => {
  queryClient.clear();
  queryClient.resetQueries();
};
