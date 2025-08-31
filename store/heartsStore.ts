import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface HeartsState {
  hearts: number;
  maxHearts: number;
  lastRegenerationTime: number;
  isUnlimited: boolean; // For premium users

  // Actions
  loseHeart: () => boolean; // Returns false if no hearts left
  addHeart: () => void;
  regenerateHearts: () => void;
  refillHearts: () => void;
  setUnlimited: (unlimited: boolean) => void;
  canPlayQuiz: () => boolean;
  getTimeUntilNextHeart: () => number; // Returns seconds
}

const HEART_REGEN_TIME = 60 * 60 * 1000; // 1 hour in milliseconds
const MAX_HEARTS = 5;

export const useHeartsStore = create<HeartsState>()(
  persist(
    (set, get) => ({
      hearts: MAX_HEARTS,
      maxHearts: MAX_HEARTS,
      lastRegenerationTime: Date.now(),
      isUnlimited: false,

      loseHeart: () => {
        const state = get();

        if (state.isUnlimited) {
          return true; // Premium users never lose hearts
        }

        if (state.hearts > 0) {
          set({
            hearts: state.hearts - 1,
            lastRegenerationTime: Date.now(), // Start regeneration timer
          });
          return true;
        }

        return false; // No hearts left
      },

      addHeart: () => {
        const state = get();

        if (state.hearts < state.maxHearts) {
          set({ hearts: state.hearts + 1 });
        }
      },

      regenerateHearts: () => {
        const state = get();

        if (state.isUnlimited || state.hearts >= state.maxHearts) {
          return; // No need to regenerate
        }

        const now = Date.now();
        const timeSinceLastRegen = now - state.lastRegenerationTime;
        const heartsToRegenerate = Math.floor(timeSinceLastRegen / HEART_REGEN_TIME);

        if (heartsToRegenerate > 0) {
          const newHearts = Math.min(state.hearts + heartsToRegenerate, state.maxHearts);
          set({
            hearts: newHearts,
            lastRegenerationTime: now - (timeSinceLastRegen % HEART_REGEN_TIME), // Keep remainder
          });
        }
      },

      refillHearts: () => {
        set({
          hearts: MAX_HEARTS,
          lastRegenerationTime: Date.now(),
        });
      },

      setUnlimited: (unlimited: boolean) => {
        set({
          isUnlimited: unlimited,
          hearts: unlimited ? MAX_HEARTS : get().hearts,
        });
      },

      canPlayQuiz: () => {
        const state = get();
        return state.isUnlimited || state.hearts > 0;
      },

      getTimeUntilNextHeart: () => {
        const state = get();

        if (state.isUnlimited || state.hearts >= state.maxHearts) {
          return 0;
        }

        const timeSinceLastRegen = Date.now() - state.lastRegenerationTime;
        const timeUntilNext = HEART_REGEN_TIME - (timeSinceLastRegen % HEART_REGEN_TIME);

        return Math.ceil(timeUntilNext / 1000); // Return in seconds
      },
    }),
    {
      name: 'hearts-storage',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
