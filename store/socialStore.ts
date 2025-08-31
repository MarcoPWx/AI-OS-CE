import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { notificationService } from '../services/notificationService';

export interface Friend {
  id: string;
  name: string;
  avatar: string;
  xp: number;
  streak: number;
  lastActive: Date;
  isPremium: boolean;
  isFake?: boolean;
}

export interface Challenge {
  id: string;
  challengerId: string;
  challengerName: string;
  challengedId: string;
  category: string;
  wager: number; // XP wagered
  status: 'pending' | 'active' | 'completed' | 'declined';
  createdAt: Date;
  expiresAt: Date;
  winnerScore?: number;
  loserScore?: number;
  winnerId?: string;
}

export interface SocialShare {
  id: string;
  type: 'achievement' | 'streak' | 'score' | 'challenge_win';
  content: string;
  imageUrl?: string;
  timestamp: Date;
}

interface SocialState {
  friends: Friend[];
  pendingFriendRequests: Friend[];
  challenges: Challenge[];
  shares: SocialShare[];
  dailyShareBonus: boolean;
  referralCode: string;
  referralCount: number;

  // Actions
  addFriend: (friend: Friend) => void;
  sendChallenge: (friendId: string, category: string, wager: number) => void;
  acceptChallenge: (challengeId: string) => void;
  declineChallenge: (challengeId: string) => void;
  completeChallenge: (challengeId: string, userScore: number, opponentScore: number) => void;
  shareAchievement: (type: SocialShare['type'], content: string) => void;
  generateFakeFriendActivity: () => void;
  triggerPeerPressure: () => void;
  claimReferralReward: (code: string) => void;
}

// Fake friends to create social pressure
const fakeFriends: Friend[] = [
  {
    id: 'fake_1',
    name: 'Alex Rivera',
    avatar: '👨‍💼',
    xp: 3200,
    streak: 15,
    lastActive: new Date(),
    isPremium: true,
    isFake: true,
  },
  {
    id: 'fake_2',
    name: 'Jessica Lee',
    avatar: '👩‍🏫',
    xp: 2800,
    streak: 23,
    lastActive: new Date(),
    isPremium: false,
    isFake: true,
  },
  {
    id: 'fake_3',
    name: 'Marcus Johnson',
    avatar: '🧑‍🎓',
    xp: 4100,
    streak: 8,
    lastActive: new Date(),
    isPremium: true,
    isFake: true,
  },
  {
    id: 'fake_4',
    name: 'Sofia Martinez',
    avatar: '👩‍⚕️',
    xp: 3500,
    streak: 31,
    lastActive: new Date(),
    isPremium: false,
    isFake: true,
  },
  {
    id: 'fake_5',
    name: 'David Kim',
    avatar: '👨‍🔬',
    xp: 2900,
    streak: 12,
    lastActive: new Date(),
    isPremium: true,
    isFake: true,
  },
];

export const useSocialStore = create<SocialState>()(
  persist(
    (set, get) => ({
      friends: fakeFriends,
      pendingFriendRequests: [],
      challenges: [],
      shares: [],
      dailyShareBonus: false,
      referralCode: `QUIZ${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      referralCount: 0,

      addFriend: (friend) => {
        set((state) => ({
          friends: [...state.friends, friend],
          pendingFriendRequests: state.pendingFriendRequests.filter((f) => f.id !== friend.id),
        }));

        // Send notification about new friend
        notificationService.scheduleOneTimeNotification(
          `${friend.name} is now your friend!`,
          "Challenge them to show who's the quiz master!",
          1,
          { type: 'new_friend' },
        );
      },

      sendChallenge: (friendId, category, wager) => {
        const friend = get().friends.find((f) => f.id === friendId);
        if (!friend) return;

        const challenge: Challenge = {
          id: `challenge_${Date.now()}`,
          challengerId: 'user',
          challengerName: 'You',
          challengedId: friendId,
          category,
          wager,
          status: 'pending',
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        };

        set((state) => ({
          challenges: [...state.challenges, challenge],
        }));

        // If it's a fake friend, auto-accept after delay
        if (friend.isFake) {
          setTimeout(
            () => {
              get().acceptChallenge(challenge.id);
            },
            Math.random() * 10000 + 5000,
          ); // 5-15 seconds
        }
      },

      acceptChallenge: (challengeId) => {
        set((state) => ({
          challenges: state.challenges.map((c) =>
            c.id === challengeId ? { ...c, status: 'active' } : c,
          ),
        }));

        const challenge = get().challenges.find((c) => c.id === challengeId);
        if (challenge) {
          notificationService.scheduleOneTimeNotification(
            '⚔️ Challenge Accepted!',
            `Your challenge with ${challenge.challengerName} is now active!`,
            1,
            { type: 'challenge_accepted' },
          );
        }
      },

      declineChallenge: (challengeId) => {
        set((state) => ({
          challenges: state.challenges.map((c) =>
            c.id === challengeId ? { ...c, status: 'declined' } : c,
          ),
        }));
      },

      completeChallenge: (challengeId, userScore, opponentScore) => {
        const challenge = get().challenges.find((c) => c.id === challengeId);
        if (!challenge) return;

        const userWon = userScore > opponentScore;
        const xpGained = userWon ? challenge.wager : -challenge.wager;

        set((state) => ({
          challenges: state.challenges.map((c) =>
            c.id === challengeId
              ? {
                  ...c,
                  status: 'completed',
                  winnerScore: userWon ? userScore : opponentScore,
                  loserScore: userWon ? opponentScore : userScore,
                  winnerId: userWon ? 'user' : challenge.challengedId,
                }
              : c,
          ),
        }));

        // Notification based on result
        if (userWon) {
          notificationService.scheduleOneTimeNotification(
            '🏆 Victory!',
            `You beat ${challenge.challengerName} and won ${challenge.wager} XP!`,
            1,
            { type: 'challenge_won' },
          );

          // Encourage sharing
          get().shareAchievement(
            'challenge_win',
            `Just crushed ${challenge.challengerName} in a quiz challenge! 💪`,
          );
        } else {
          notificationService.scheduleOneTimeNotification(
            '😔 Defeated',
            `${challenge.challengerName} beat you. Challenge them again to get revenge!`,
            1,
            { type: 'challenge_lost' },
          );
        }
      },

      shareAchievement: (type, content) => {
        const share: SocialShare = {
          id: `share_${Date.now()}`,
          type,
          content,
          timestamp: new Date(),
        };

        set((state) => ({
          shares: [...state.shares, share],
          dailyShareBonus: true,
        }));

        // Reset daily share bonus at midnight
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        const timeUntilMidnight = tomorrow.getTime() - now.getTime();

        setTimeout(() => {
          set({ dailyShareBonus: false });
        }, timeUntilMidnight);

        // Reward for sharing
        console.log('🎁 Earned 50 XP for sharing!');
      },

      generateFakeFriendActivity: () => {
        const friends = get().friends.filter((f) => f.isFake);
        if (friends.length === 0) return;

        // Random friend makes progress
        const randomFriend = friends[Math.floor(Math.random() * friends.length)];
        const xpGain = Math.floor(Math.random() * 200) + 50;

        set((state) => ({
          friends: state.friends.map((f) =>
            f.id === randomFriend.id
              ? {
                  ...f,
                  xp: f.xp + xpGain,
                  lastActive: new Date(),
                  streak: Math.random() > 0.7 ? f.streak + 1 : f.streak,
                }
              : f,
          ),
        }));

        // Sometimes send fake challenge
        if (Math.random() > 0.8) {
          const challenge: Challenge = {
            id: `fake_challenge_${Date.now()}`,
            challengerId: randomFriend.id,
            challengerName: randomFriend.name,
            challengedId: 'user',
            category: 'Mixed',
            wager: Math.floor(Math.random() * 200) + 100,
            status: 'pending',
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          };

          set((state) => ({
            challenges: [...state.challenges, challenge],
          }));

          notificationService.scheduleOneTimeNotification(
            `⚔️ ${randomFriend.name} challenged you!`,
            `They wagered ${challenge.wager} XP. Are you brave enough?`,
            1,
            { type: 'challenge_received' },
          );
        }
      },

      triggerPeerPressure: () => {
        const friends = get().friends;
        const activeFriends = friends.filter(
          (f) => new Date().getTime() - new Date(f.lastActive).getTime() < 3600000, // Active in last hour
        );

        if (activeFriends.length > 0) {
          const messages = [
            `${activeFriends.length} friends are playing right now!`,
            `${activeFriends[0].name} just beat your high score!`,
            `Your friends completed ${activeFriends.length * 3} quizzes today`,
            `${activeFriends[0].name} has a ${activeFriends[0].streak}-day streak!`,
          ];

          const randomMessage = messages[Math.floor(Math.random() * messages.length)];

          notificationService.scheduleOneTimeNotification('👥 Friend Activity', randomMessage, 1, {
            type: 'peer_pressure',
          });
        }
      },

      claimReferralReward: (code) => {
        if (code === get().referralCode) {
          console.log('Cannot use your own referral code!');
          return;
        }

        set((state) => ({
          referralCount: state.referralCount + 1,
        }));

        // Reward both users
        notificationService.scheduleOneTimeNotification(
          '🎁 Referral Reward!',
          'You earned 500 XP and 5 hearts for using a referral code!',
          1,
          { type: 'referral_reward' },
        );

        // If user refers 3+ friends, push premium
        if (get().referralCount >= 3) {
          notificationService.scheduleOneTimeNotification(
            "🌟 You're popular!",
            'Unlock Premium to share unlimited challenges with friends!',
            5,
            { type: 'premium_social' },
          );
        }
      },
    }),
    {
      name: 'social-storage',
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
        friends: state.friends,
        challenges: state.challenges,
        shares: state.shares,
        referralCode: state.referralCode,
        referralCount: state.referralCount,
      }),
    },
  ),
);

// Initialize fake friend activity
export const initializeSocialFeatures = () => {
  const store = useSocialStore.getState();

  // Generate fake activity every 30 seconds
  setInterval(() => {
    store.generateFakeFriendActivity();
  }, 30000);

  // Trigger peer pressure every 5 minutes
  setInterval(() => {
    store.triggerPeerPressure();
  }, 300000);
};
