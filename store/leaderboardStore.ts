import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface LeaderboardUser {
  id: string;
  name: string;
  avatar: string;
  xp: number;
  level: number;
  streak: number;
  country: string;
  isPremium: boolean;
  isOnline: boolean;
  lastActive: Date;
  weeklyXp: number;
  rank: number;
  previousRank: number;
  isFake?: boolean; // Internal flag for fake users
}

interface LeaderboardState {
  globalLeaderboard: LeaderboardUser[];
  weeklyLeaderboard: LeaderboardUser[];
  friendsLeaderboard: LeaderboardUser[];
  userRank: number;
  userPreviousRank: number;
  lastUpdated: Date;
  nearbyCompetitors: LeaderboardUser[];

  // Actions
  updateLeaderboards: () => void;
  getUserPosition: () => { global: number; weekly: number; friends: number };
  generateFakeActivity: () => void;
  triggerCompetitivePressure: () => void;
  getFakeProgressUpdate: () => { user: LeaderboardUser; action: string };
}

// Fake user templates for psychological manipulation
const fakeUserTemplates = [
  { name: 'Sarah Chen', country: '🇺🇸', avatar: '👩‍🎓' },
  { name: 'Mike Johnson', country: '🇬🇧', avatar: '🧑‍💼' },
  { name: 'Emma Wilson', country: '🇨🇦', avatar: '👩‍🔬' },
  { name: 'Lucas Silva', country: '🇧🇷', avatar: '👨‍💻' },
  { name: 'Sophie Martin', country: '🇫🇷', avatar: '👩‍🎨' },
  { name: 'Raj Patel', country: '🇮🇳', avatar: '👨‍⚕️' },
  { name: 'Anna Schmidt', country: '🇩🇪', avatar: '👩‍🏫' },
  { name: 'Yuki Tanaka', country: '🇯🇵', avatar: '🧑‍🎓' },
  { name: 'Omar Hassan', country: '🇪🇬', avatar: '👨‍🔬' },
  { name: 'Maria Garcia', country: '🇪🇸', avatar: '👩‍⚖️' },
];

// Generate fake users with realistic-looking stats
const generateFakeUsers = (count: number, userXp: number): LeaderboardUser[] => {
  return Array.from({ length: count }, (_, i) => {
    const template = fakeUserTemplates[i % fakeUserTemplates.length];
    const variance = Math.random() * 0.4 - 0.2; // ±20% variance
    const baseXp = userXp * (1 + variance);

    // Make some users slightly ahead to create pressure
    const competitiveXp = i < 3 ? userXp + Math.floor(Math.random() * 500) + 100 : baseXp;

    return {
      id: `fake_${i}_${Date.now()}`,
      name: template.name,
      avatar: template.avatar,
      xp: Math.floor(competitiveXp),
      level: Math.floor(competitiveXp / 1000) + 1,
      streak: Math.floor(Math.random() * 45) + 1,
      country: template.country,
      isPremium: Math.random() > 0.6, // 40% premium to create FOMO
      isOnline: Math.random() > 0.3, // 70% "online" to show activity
      lastActive: new Date(Date.now() - Math.random() * 3600000), // Within last hour
      weeklyXp: Math.floor(Math.random() * 5000) + 1000,
      rank: i + 1,
      previousRank: i + Math.floor(Math.random() * 5) - 2,
      isFake: true,
    };
  });
};

export const useLeaderboardStore = create<LeaderboardState>()(
  persist(
    (set, get) => ({
      globalLeaderboard: [],
      weeklyLeaderboard: [],
      friendsLeaderboard: [],
      userRank: 150, // Start user at mediocre rank to motivate climbing
      userPreviousRank: 155,
      lastUpdated: new Date(),
      nearbyCompetitors: [],

      updateLeaderboards: () => {
        const state = get();
        const userXp = 2500; // Get from user stats

        // Generate fake global leaderboard
        const fakeGlobal = generateFakeUsers(200, userXp);

        // Position user strategically (not too high, not too low)
        const userPosition = Math.floor(Math.random() * 50) + 100; // Ranks 100-150

        // Insert real user
        const realUser: LeaderboardUser = {
          id: 'real_user',
          name: 'You',
          avatar: '🎮',
          xp: userXp,
          level: Math.floor(userXp / 1000) + 1,
          streak: 7, // From streak store
          country: '🏁',
          isPremium: false, // From subscription store
          isOnline: true,
          lastActive: new Date(),
          weeklyXp: Math.floor(Math.random() * 3000) + 500,
          rank: userPosition,
          previousRank: userPosition + 5,
          isFake: false,
        };

        fakeGlobal.splice(userPosition - 1, 0, realUser);

        // Update ranks
        fakeGlobal.forEach((user, index) => {
          user.rank = index + 1;
        });

        // Get nearby competitors (5 above, 5 below)
        const nearbyStart = Math.max(0, userPosition - 6);
        const nearbyEnd = Math.min(fakeGlobal.length, userPosition + 5);
        const nearby = fakeGlobal.slice(nearbyStart, nearbyEnd);

        // Weekly leaderboard - make user rank higher to give hope
        const weeklyPosition = Math.floor(Math.random() * 20) + 30; // Ranks 30-50
        const fakeWeekly = generateFakeUsers(100, userXp);
        fakeWeekly.splice(weeklyPosition - 1, 0, { ...realUser, rank: weeklyPosition });

        // Friends leaderboard - always show user in middle for pressure from both sides
        const fakeFriends = generateFakeUsers(20, userXp);
        fakeFriends.splice(10, 0, { ...realUser, rank: 11 });

        set({
          globalLeaderboard: fakeGlobal.slice(0, 100), // Show top 100
          weeklyLeaderboard: fakeWeekly.slice(0, 50),
          friendsLeaderboard: fakeFriends,
          userRank: userPosition,
          userPreviousRank: userPosition + 5,
          nearbyCompetitors: nearby,
          lastUpdated: new Date(),
        });
      },

      getUserPosition: () => {
        const state = get();
        return {
          global: state.userRank,
          weekly: state.weeklyLeaderboard.findIndex((u) => u.id === 'real_user') + 1,
          friends: state.friendsLeaderboard.findIndex((u) => u.id === 'real_user') + 1,
        };
      },

      generateFakeActivity: () => {
        const state = get();

        // Randomly update fake user scores to show "live" activity
        const updatedGlobal = state.globalLeaderboard.map((user) => {
          if (user.isFake && Math.random() > 0.8) {
            return {
              ...user,
              xp: user.xp + Math.floor(Math.random() * 100) + 10,
              lastActive: new Date(),
              isOnline: true,
            };
          }
          return user;
        });

        // Re-sort and update ranks
        updatedGlobal.sort((a, b) => b.xp - a.xp);
        updatedGlobal.forEach((user, index) => {
          user.previousRank = user.rank;
          user.rank = index + 1;
        });

        // Check if user dropped in rank
        const newUserRank = updatedGlobal.findIndex((u) => u.id === 'real_user') + 1;
        const dropped = newUserRank > state.userRank;

        set({
          globalLeaderboard: updatedGlobal,
          userRank: newUserRank,
          userPreviousRank: state.userRank,
        });

        // Trigger notification if user dropped
        if (dropped) {
          const passedBy = updatedGlobal[newUserRank - 2]; // User who passed
          if (passedBy?.isFake) {
            // Send push notification
            console.log(`${passedBy.name} just passed you! 📉`);
          }
        }
      },

      triggerCompetitivePressure: () => {
        const state = get();

        // Find a nearby competitor who's about to pass
        const userIndex = state.nearbyCompetitors.findIndex((u) => u.id === 'real_user');
        if (userIndex > 0) {
          const competitor = state.nearbyCompetitors[userIndex - 1];
          const gap = competitor.xp - (state.nearbyCompetitors[userIndex]?.xp || 0);

          if (gap < 100) {
            // Trigger urgent notification
            console.log(`⚠️ ${competitor.name} is only ${gap} XP behind you!`);
            return;
          }
        }

        // Or find someone ahead who's catchable
        if (userIndex < state.nearbyCompetitors.length - 1) {
          const target = state.nearbyCompetitors[userIndex + 1];
          const gap = (state.nearbyCompetitors[userIndex]?.xp || 0) - target.xp;

          if (gap < 200) {
            console.log(`🎯 You're only ${gap} XP from passing ${target.name}!`);
          }
        }
      },

      getFakeProgressUpdate: () => {
        const fakeUpdates = [
          { action: 'just completed a perfect quiz!' },
          { action: 'earned a 7-day streak bonus!' },
          { action: 'unlocked Master level!' },
          { action: 'completed the daily challenge!' },
          { action: 'earned 500 XP in 10 minutes!' },
          { action: 'is on fire! 🔥 15 correct answers!' },
        ];

        const randomUser = fakeUserTemplates[Math.floor(Math.random() * fakeUserTemplates.length)];
        const randomAction = fakeUpdates[Math.floor(Math.random() * fakeUpdates.length)];

        return {
          user: {
            ...randomUser,
            id: 'fake_notification',
            xp: 0,
            level: 0,
            streak: 0,
            isPremium: Math.random() > 0.5,
            isOnline: true,
            lastActive: new Date(),
            weeklyXp: 0,
            rank: 0,
            previousRank: 0,
          } as LeaderboardUser,
          action: randomAction.action,
        };
      },
    }),
    {
      name: 'leaderboard-storage',
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
        userRank: state.userRank,
        userPreviousRank: state.userPreviousRank,
      }),
    },
  ),
);

// Auto-generate fake activity
export const initializeLeaderboard = () => {
  const store = useLeaderboardStore.getState();

  // Initial load
  store.updateLeaderboards();

  // Fake activity every 30 seconds
  setInterval(() => {
    store.generateFakeActivity();
  }, 30000);

  // Competitive pressure every 2 minutes
  setInterval(() => {
    store.triggerCompetitivePressure();
  }, 120000);
};
