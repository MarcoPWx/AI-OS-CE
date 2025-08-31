import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface StreakState {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
  freezesAvailable: number;
  streakSavedToday: boolean;

  // Milestones
  milestonesReached: number[];

  // Actions
  checkStreak: () => void;
  incrementStreak: () => void;
  useFreeze: () => boolean;
  resetStreak: () => void;
  checkMilestone: () => { reached: boolean; milestone: number } | null;
}

const STREAK_MILESTONES = [3, 7, 14, 30, 50, 100, 365];

export const useStreakStore = create<StreakState>()(
  persist(
    (set, get) => ({
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: null,
      freezesAvailable: 2, // 2 free freezes per month
      streakSavedToday: false,
      milestonesReached: [],

      checkStreak: () => {
        const state = get();
        const today = new Date().toDateString();
        const lastActive = state.lastActiveDate
          ? new Date(state.lastActiveDate).toDateString()
          : null;

        if (lastActive === today) {
          // Already active today
          return;
        }

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayString = yesterday.toDateString();

        if (lastActive === yesterdayString) {
          // Streak continues
          set({ streakSavedToday: false });
        } else if (lastActive) {
          // Streak broken - check if we can use a freeze
          const daysSinceActive = Math.floor(
            (new Date().getTime() - new Date(state.lastActiveDate!).getTime()) /
              (1000 * 60 * 60 * 24),
          );

          if (daysSinceActive === 2 && state.freezesAvailable > 0) {
            // Can use freeze for yesterday
            set({
              streakSavedToday: false,
              freezesAvailable: state.freezesAvailable - 1,
            });
          } else {
            // Streak broken
            set({
              currentStreak: 0,
              streakSavedToday: false,
            });
          }
        }
      },

      incrementStreak: () => {
        const state = get();
        const today = new Date().toDateString();
        const lastActive = state.lastActiveDate
          ? new Date(state.lastActiveDate).toDateString()
          : null;

        if (lastActive === today && state.streakSavedToday) {
          // Already incremented today
          return;
        }

        const newStreak = state.currentStreak + 1;
        const newLongest = Math.max(newStreak, state.longestStreak);

        set({
          currentStreak: newStreak,
          longestStreak: newLongest,
          lastActiveDate: today,
          streakSavedToday: true,
        });

        // Check for milestone
        get().checkMilestone();
      },

      useFreeze: () => {
        const state = get();
        if (state.freezesAvailable > 0) {
          set({ freezesAvailable: state.freezesAvailable - 1 });
          return true;
        }
        return false;
      },

      resetStreak: () => {
        set({
          currentStreak: 0,
          streakSavedToday: false,
        });
      },

      checkMilestone: () => {
        const state = get();
        const currentStreak = state.currentStreak;

        for (const milestone of STREAK_MILESTONES) {
          if (currentStreak === milestone && !state.milestonesReached.includes(milestone)) {
            set({
              milestonesReached: [...state.milestonesReached, milestone],
            });
            return { reached: true, milestone };
          }
        }

        return null;
      },
    }),
    {
      name: 'streak-storage',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
