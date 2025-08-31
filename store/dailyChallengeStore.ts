import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { notificationService } from '../services/notificationService';

interface Challenge {
  id: string;
  title: string;
  description: string;
  category: string;
  questionsRequired: number;
  xpMultiplier: number;
  streakBonus: number;
  heartsReward: number;
  timeLimit: number; // in minutes
  expiresAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  isPremiumOnly: boolean;
  // Test-facing fields
  difficulty?: 'easy' | 'medium' | 'hard';
  points?: number;
  targetQuestions?: number;
  targetAccuracy?: number;
  progress?: number;
  completed?: boolean;
}

interface DailyChallengeState {
  currentChallenge: Challenge | null;
  challengeHistory: Challenge[];
  activeUntil: Date | null;
  questionsCompleted: number;
  totalXpEarned: number;
  consecutiveDays: number;

  // Test-facing fields
  completedChallenges: Array<Challenge & { completedDate: string }>;
  lastChallengeDate: string | null;
  challengeStreak: number;
  totalPoints: number;

  // Actions
  generateDailyChallenge: () => void;
  startChallenge: () => void;
  updateProgress: (questionsAnswered: number) => void;
  completeChallenge: () => { xpEarned: number; rewards: any };
  checkExpiration: () => boolean;
  getTimeRemaining: () => number;
  claimRewards: () => void;

  // Test-facing actions
  updateChallengeProgress: (progress: number, accuracy: number) => void;
  getChallengeRewards: (difficulty: 'easy' | 'medium' | 'hard') => {
    points: number;
    xp: number;
    streakMultiplier: number;
  };
  resetChallengeStreak: () => void;
  getStreakMultiplier: () => number;
}

const challengeTemplates = [
  {
    title: '⚡ Lightning Round',
    description: 'Answer 10 questions in 5 minutes',
    questionsRequired: 10,
    xpMultiplier: 3,
    streakBonus: 2,
    heartsReward: 3,
    timeLimit: 5,
    isPremiumOnly: false,
  },
  {
    title: '🎯 Perfect Score',
    description: 'Get 5 questions right without any mistakes',
    questionsRequired: 5,
    xpMultiplier: 4,
    streakBonus: 3,
    heartsReward: 5,
    timeLimit: 10,
    isPremiumOnly: false,
  },
  {
    title: '💎 Premium Marathon',
    description: 'Complete 20 questions for massive rewards',
    questionsRequired: 20,
    xpMultiplier: 5,
    streakBonus: 5,
    heartsReward: 10,
    timeLimit: 15,
    isPremiumOnly: true,
  },
  {
    title: '🔥 Streak Builder',
    description: 'Complete 7 questions to boost your streak',
    questionsRequired: 7,
    xpMultiplier: 2,
    streakBonus: 10, // Huge streak bonus
    heartsReward: 2,
    timeLimit: 8,
    isPremiumOnly: false,
  },
  {
    title: '🏆 Champion Challenge',
    description: 'Answer 15 questions for elite rewards',
    questionsRequired: 15,
    xpMultiplier: 6,
    streakBonus: 4,
    heartsReward: 8,
    timeLimit: 12,
    isPremiumOnly: true,
  },
];

export const useDailyChallengeStore = create<DailyChallengeState>()(
  persist(
    (set, get) => ({
      currentChallenge: null,
      challengeHistory: [],
      activeUntil: null,
      questionsCompleted: 0,
      totalXpEarned: 0,
      consecutiveDays: 0,

      // Test-facing defaults
      completedChallenges: [],
      lastChallengeDate: null,
      challengeStreak: 0,
      totalPoints: 0,

      generateDailyChallenge: () => {
        const state = get();
        const now = new Date();

        // Check if today's challenge already exists
        if (state.currentChallenge) {
          const challengeDate = new Date(state.currentChallenge.expiresAt);
          if (challengeDate.toDateString() === now.toDateString()) {
            return; // Challenge already exists for today
          }
        }

        // Select a random challenge template
        const template = challengeTemplates[Math.floor(Math.random() * challengeTemplates.length)];

        // Create expiration at midnight
        const expiresAt = new Date();
        expiresAt.setHours(23, 59, 59, 999);

        // Map to test-facing fields
        const difficulty: 'easy' | 'medium' | 'hard' = ['easy', 'medium', 'hard'][
          Math.floor(Math.random() * 3)
        ];
        const basePoints = difficulty === 'easy' ? 100 : difficulty === 'medium' ? 200 : 500;
        const targetQuestions = difficulty === 'easy' ? 5 : difficulty === 'medium' ? 10 : 15;
        const targetAccuracy = difficulty === 'easy' ? 60 : difficulty === 'medium' ? 70 : 80;

        const newChallenge: Challenge = {
          id: `challenge_${Date.now()}`,
          ...template,
          category: 'General',
          expiresAt,
          difficulty,
          points: basePoints,
          targetQuestions,
          targetAccuracy,
          progress: 0,
          completed: false,
        };

        set({
          currentChallenge: newChallenge,
          questionsCompleted: 0,
          activeUntil: null,
          lastChallengeDate: new Date().toDateString(),
        });

        // Schedule notification for challenge
        notificationService.scheduleOneTimeNotification(
          '🎯 Daily Challenge Available!',
          `${template.title} - ${template.xpMultiplier}x XP for ${template.timeLimit} minutes!`,
          1,
          { type: 'daily_challenge' },
        );

        // Schedule reminder 2 hours before expiration
        const reminderTime = (expiresAt.getTime() - now.getTime() - 2 * 60 * 60 * 1000) / 1000;
        if (reminderTime > 0) {
          notificationService.scheduleOneTimeNotification(
            '⏰ Daily Challenge Expiring Soon!',
            'Complete it in the next 2 hours for bonus rewards!',
            reminderTime,
            { type: 'challenge_reminder' },
          );
        }
      },

      startChallenge: () => {
        const state = get();
        if (!state.currentChallenge || state.activeUntil) return;

        const now = new Date();
        const activeUntil = new Date(now.getTime() + state.currentChallenge.timeLimit * 60 * 1000);

        set({
          activeUntil,
          currentChallenge: {
            ...state.currentChallenge,
            startedAt: now,
          },
        });

        // Send urgency notification
        notificationService.scheduleOneTimeNotification(
          `⚡ ${state.currentChallenge.timeLimit} minutes remaining!`,
          'Complete the challenge before time runs out!',
          (state.currentChallenge.timeLimit - 1) * 60, // 1 minute before end
          { type: 'challenge_urgency' },
        );
      },

      updateProgress: (questionsAnswered: number) => {
        const state = get();
        if (!state.currentChallenge || !state.activeUntil) return;

        const newProgress = state.questionsCompleted + questionsAnswered;

        set({
          questionsCompleted: newProgress,
        });

        // Check if challenge is complete
        if (newProgress >= state.currentChallenge.questionsRequired) {
          get().completeChallenge();
        }
      },

      // Test-facing API: update challenge progress with accuracy
      updateChallengeProgress: (progress: number, accuracy: number) => {
        const state = get();
        if (!state.currentChallenge) return;
        const targetQ =
          state.currentChallenge.targetQuestions ?? state.currentChallenge.questionsRequired;
        const targetAcc = state.currentChallenge.targetAccuracy ?? 70;
        const isComplete = progress >= targetQ && accuracy >= targetAcc;
        set({
          currentChallenge: {
            ...state.currentChallenge,
            progress,
            completed: isComplete,
          },
        });
      },

      completeChallenge: () => {
        const state = get();
        if (!state.currentChallenge) return { xpEarned: 0, rewards: {} };

        const baseXp = state.questionsCompleted * 10;
        const xpEarned = baseXp * state.currentChallenge.xpMultiplier;

        const completedChallenge = {
          ...state.currentChallenge,
          completedAt: new Date(),
        };

        set({
          challengeHistory: [...state.challengeHistory, completedChallenge],
          totalXpEarned: state.totalXpEarned + xpEarned,
          consecutiveDays: state.consecutiveDays + 1,
          currentChallenge: {
            ...state.currentChallenge,
            completedAt: new Date(),
            completed: true,
            progress: state.currentChallenge.targetQuestions ?? state.questionsCompleted,
          },
        });

        // Celebration notification
        notificationService.scheduleOneTimeNotification(
          '🎉 Challenge Complete!',
          `You earned ${xpEarned} XP and ${state.currentChallenge.heartsReward} hearts!`,
          1,
          { type: 'challenge_complete' },
        );

        // Schedule next challenge teaser
        notificationService.scheduleOneTimeNotification(
          "🔮 Tomorrow's challenge will be even better!",
          'Come back tomorrow for a special reward',
          3600, // 1 hour later
          { type: 'next_challenge_tease' },
        );

        // Test-facing: push to completedChallenges, update streak & points
        const todayStr = new Date().toDateString();
        const completedEntry = {
          ...(state.currentChallenge as Required<Challenge>),
          completed: true,
          progress: state.currentChallenge.targetQuestions ?? state.questionsCompleted,
          completedDate: new Date().toISOString(),
        };
        const multiplier = get().getStreakMultiplier();
        const pointsToAdd = (state.currentChallenge.points ?? 0) * multiplier;
        set({
          completedChallenges: [...state.completedChallenges, completedEntry],
          challengeStreak: state.challengeStreak + 1,
          totalPoints: state.totalPoints + pointsToAdd,
          lastChallengeDate: todayStr,
        });

        return {
          xpEarned,
          rewards: {
            hearts: state.currentChallenge.heartsReward,
            streakBonus: state.currentChallenge.streakBonus,
            badge: state.consecutiveDays >= 7 ? 'Challenge Master' : null,
          },
        };
      },

      checkExpiration: () => {
        const state = get();
        if (!state.activeUntil) return false;

        const now = new Date();
        const expired = now > state.activeUntil;

        if (expired) {
          set({
            activeUntil: null,
            questionsCompleted: 0,
          });

          // Shame notification for failure
          notificationService.scheduleOneTimeNotification(
            '😔 Challenge Failed',
            'You ran out of time! Try again tomorrow.',
            1,
            { type: 'challenge_failed' },
          );
        }

        return expired;
      },

      getTimeRemaining: () => {
        const state = get();
        if (!state.activeUntil) return 0;

        const now = new Date();
        const remaining = state.activeUntil.getTime() - now.getTime();

        return Math.max(0, Math.floor(remaining / 1000)); // Return seconds
      },

      claimRewards: () => {
        const state = get();
        if (!state.currentChallenge?.completedAt) return;

        // Integrate with hearts and streak stores
        const heartsStore = require('./heartsStore').useHeartsStore.getState();
        const streakStore = require('./streakStore').useStreakStore.getState();

        heartsStore.addHearts(state.currentChallenge.heartsReward);
        streakStore.extendStreak(state.currentChallenge.streakBonus);

        // Clear the completed challenge
        set({
          currentChallenge: null,
          questionsCompleted: 0,
          activeUntil: null,
        });
      },

      // Test-facing helpers
      getChallengeRewards: (difficulty) => {
        const basePoints = difficulty === 'easy' ? 100 : difficulty === 'medium' ? 200 : 500;
        const baseXp = difficulty === 'easy' ? 50 : difficulty === 'medium' ? 100 : 250;
        const mult = get().getStreakMultiplier();
        return { points: basePoints * mult, xp: baseXp * mult, streakMultiplier: mult };
      },
      resetChallengeStreak: () => set({ challengeStreak: 0 }),
      getStreakMultiplier: () => {
        const s = get().challengeStreak;
        let mult = 1.0;
        if (s >= 100) mult = 5.0;
        else if (s >= 30) mult = 4.0;
        else if (s >= 14) mult = 2.4;
        else if (s >= 10) mult = 2.0;
        else if (s >= 7) mult = 1.7;
        else if (s >= 3) mult = 1.3;
        return Math.min(mult, 5.0);
      },
    }),
    {
      name: 'daily-challenge-storage',
      storage: {
        getItem: async (name) => {
          const value = await AsyncStorage.getItem(name);
          return value ? JSON.parse(value) : null;
        },
        setItem: async (name, value) => {
          await AsyncStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: async (name) => {
          await AsyncStorage.removeItem(name);
        },
      },
      partialize: (state) => ({
        challengeHistory: state.challengeHistory,
        totalXpEarned: state.totalXpEarned,
        consecutiveDays: state.consecutiveDays,
        currentChallenge: state.currentChallenge,
        // Ensure test-facing fields are persisted to allow clean reset when storage cleared
        completedChallenges: state.completedChallenges,
        lastChallengeDate: state.lastChallengeDate,
        challengeStreak: state.challengeStreak,
        totalPoints: state.totalPoints,
      }),
      onRehydrateStorage: () => (persistedState) => {
        if (!persistedState) {
          // Storage empty; reset to defaults
          set({
            currentChallenge: null,
            challengeHistory: [],
            activeUntil: null,
            questionsCompleted: 0,
            totalXpEarned: 0,
            consecutiveDays: 0,
            completedChallenges: [],
            lastChallengeDate: null,
            challengeStreak: 0,
            totalPoints: 0,
          });
        }
      },
    },
  ),
);

// Auto-generate daily challenge on app startup
export const initializeDailyChallenge = () => {
  const store = useDailyChallengeStore.getState();
  store.generateDailyChallenge();

  // Check expiration every minute
  setInterval(() => {
    store.checkExpiration();
  }, 60000);
};

// Test helper to reset store state between tests
export const __resetDailyChallengeStoreForTests = () => {
  useDailyChallengeStore.setState({
    currentChallenge: null,
    challengeHistory: [],
    activeUntil: null,
    questionsCompleted: 0,
    totalXpEarned: 0,
    consecutiveDays: 0,
    completedChallenges: [],
    lastChallengeDate: null,
    challengeStreak: 0,
    totalPoints: 0,
  });
};
