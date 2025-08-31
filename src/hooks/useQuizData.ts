// src/hooks/useQuizData.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys, APIError } from '../services/api/queryClient';
import { getQuizData, getRandomQuestions, getDailyChallenge } from '../services/devQuizData';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { analytics } from '../services/analytics';

// Types
interface QuizAnswer {
  questionId: string;
  selectedAnswer: number;
  isCorrect: boolean;
  timeSpent: number;
}

interface QuizSession {
  id: string;
  categoryId: string;
  startTime: Date;
  endTime?: Date;
  answers: QuizAnswer[];
  score: number;
  xpEarned: number;
}

// Hook to fetch all quiz categories
export const useQuizCategories = () => {
  return useQuery({
    queryKey: queryKeys.categories(),
    queryFn: async () => {
      try {
        // Track API call
        analytics.track('api_call', { endpoint: 'categories' });

        // In production, this would be an API call
        const data = await getQuizData();

        // Cache in AsyncStorage for offline support
        await AsyncStorage.setItem('@quiz_categories', JSON.stringify(data));

        return data;
      } catch (error) {
        // Try to load from cache if network fails
        const cached = await AsyncStorage.getItem('@quiz_categories');
        if (cached) {
          return JSON.parse(cached);
        }
        throw error;
      }
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
    placeholderData: () => {
      // Return cached data immediately while fetching
      return AsyncStorage.getItem('@quiz_categories').then((cached) =>
        cached ? JSON.parse(cached) : undefined,
      );
    },
  });
};

// Hook to fetch questions for a specific category
export const useQuizQuestions = (categoryId: string, count: number = 10) => {
  return useQuery({
    queryKey: [...queryKeys.category(categoryId), 'questions', count],
    queryFn: async () => {
      analytics.track('fetch_questions', { categoryId, count });

      const categories = await getQuizData();
      const category = categories.find((c) => c.id === categoryId);

      if (!category) {
        throw new APIError(404, `Category ${categoryId} not found`);
      }

      return getRandomQuestions(category.questions, count);
    },
    enabled: !!categoryId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to fetch daily challenge
export const useDailyChallenge = () => {
  const today = new Date().toISOString().split('T')[0];

  return useQuery({
    queryKey: queryKeys.dailyChallenge(today),
    queryFn: async () => {
      analytics.track('fetch_daily_challenge', { date: today });

      const challenge = await getDailyChallenge();

      // Cache daily challenge
      await AsyncStorage.setItem(`@daily_challenge_${today}`, JSON.stringify(challenge));

      return challenge;
    },
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
    gcTime: 7 * 24 * 60 * 60 * 1000, // Keep for 7 days
  });
};

// Hook to submit quiz answers
export const useSubmitQuiz = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (session: QuizSession) => {
      analytics.track('quiz_completed', {
        categoryId: session.categoryId,
        score: session.score,
        questionsCount: session.answers.length,
        duration: session.endTime
          ? (new Date(session.endTime).getTime() - new Date(session.startTime).getTime()) / 1000
          : 0,
      });

      // In production, this would be an API call
      // For now, save to AsyncStorage
      const sessions = await AsyncStorage.getItem('@quiz_sessions');
      const allSessions = sessions ? JSON.parse(sessions) : [];
      allSessions.push(session);
      await AsyncStorage.setItem('@quiz_sessions', JSON.stringify(allSessions));

      // Update user stats
      const stats = await AsyncStorage.getItem('@user_stats');
      const userStats = stats ? JSON.parse(stats) : { xp: 0, level: 1, streak: 0 };
      userStats.xp += session.xpEarned;

      // Check for level up
      const xpForNextLevel = userStats.level * 100;
      if (userStats.xp >= xpForNextLevel) {
        userStats.level += 1;
        userStats.xp -= xpForNextLevel;

        analytics.track('level_up', {
          newLevel: userStats.level,
          totalXp: userStats.xp + xpForNextLevel,
        });
      }

      await AsyncStorage.setItem('@user_stats', JSON.stringify(userStats));

      return { session, userStats };
    },
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: queryKeys.userStats('current') });
      queryClient.invalidateQueries({ queryKey: queryKeys.userProgress('current') });

      // Show success notification
      console.log('Quiz submitted successfully!', data);
    },
    onError: (error) => {
      analytics.track('quiz_submit_error', { error: error.message });
      console.error('Failed to submit quiz:', error);
    },
  });
};

// Hook to fetch user statistics
export const useUserStats = (userId: string = 'current') => {
  return useQuery({
    queryKey: queryKeys.userStats(userId),
    queryFn: async () => {
      const stats = await AsyncStorage.getItem('@user_stats');
      return stats
        ? JSON.parse(stats)
        : {
            userId,
            username: 'Player',
            level: 1,
            xp: 0,
            nextLevelXp: 100,
            streak: 0,
            gems: 50,
            energy: 5,
            maxEnergy: 5,
            rank: 'Beginner',
            achievements: 0,
            completedChallenges: 0,
            totalQuizzes: 0,
            correctAnswers: 0,
            totalAnswers: 0,
            averageScore: 0,
            bestStreak: 0,
            totalPlayTime: 0,
          };
    },
    staleTime: 60 * 1000, // 1 minute
  });
};

// Hook to fetch leaderboard
export const useLeaderboard = (type: 'global' | 'friends' = 'global') => {
  return useQuery({
    queryKey: queryKeys.leaderboard(type),
    queryFn: async () => {
      analytics.track('view_leaderboard', { type });

      // Mock leaderboard data
      const mockLeaderboard = [
        { rank: 1, username: 'CodeMaster', xp: 12500, level: 25, avatar: '🦸' },
        { rank: 2, username: 'DevNinja', xp: 11200, level: 23, avatar: '🥷' },
        { rank: 3, username: 'ByteWizard', xp: 10800, level: 22, avatar: '🧙' },
        { rank: 4, username: 'AlgoKing', xp: 9500, level: 20, avatar: '👑' },
        { rank: 5, username: 'ReactRocket', xp: 8900, level: 18, avatar: '🚀' },
        { rank: 6, username: 'You', xp: 2500, level: 5, avatar: '😎', isCurrentUser: true },
        { rank: 7, username: 'NodeWarrior', xp: 2400, level: 5, avatar: '⚔️' },
        { rank: 8, username: 'PythonPro', xp: 2300, level: 5, avatar: '🐍' },
      ];

      // In production, this would be an API call
      return mockLeaderboard;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to prefetch next questions
export const usePrefetchNextQuestions = () => {
  const queryClient = useQueryClient();

  return (categoryId: string, count: number = 10) => {
    queryClient.prefetchQuery({
      queryKey: [...queryKeys.category(categoryId), 'questions', count],
      queryFn: async () => {
        const categories = await getQuizData();
        const category = categories.find((c) => c.id === categoryId);

        if (!category) {
          throw new APIError(404, `Category ${categoryId} not found`);
        }

        return getRandomQuestions(category.questions, count);
      },
      staleTime: 5 * 60 * 1000,
    });
  };
};

// Hook for infinite scroll of questions (for practice mode)
export const useInfiniteQuestions = (categoryId: string) => {
  return useQuery({
    queryKey: [...queryKeys.category(categoryId), 'infinite'],
    queryFn: async ({ pageParam = 0 }) => {
      const categories = await getQuizData();
      const category = categories.find((c) => c.id === categoryId);

      if (!category) {
        throw new APIError(404, `Category ${categoryId} not found`);
      }

      const pageSize = 5;
      const start = pageParam * pageSize;
      const questions = category.questions.slice(start, start + pageSize);

      return {
        questions,
        nextPage: start + pageSize < category.questions.length ? pageParam + 1 : undefined,
      };
    },
    enabled: !!categoryId,
  });
};
