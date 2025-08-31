// src/services/gamification.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Haptics, ImpactFeedbackStyle } from 'expo-haptics';
import * as Notifications from 'expo-notifications';
import AnalyticsService from './analyticsService';

const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// XP and Level Configuration
const LEVEL_CONFIG = {
  baseXP: 100,
  exponent: 1.5,
  maxLevel: 100,
};

// Achievement Definitions
export const ACHIEVEMENTS = {
  // Streak Achievements
  FIRST_STREAK: {
    id: 'first_streak',
    name: 'On Fire!',
    description: 'Get a 3-day streak',
    icon: '🔥',
    xp: 50,
    tier: 'bronze',
  },
  WEEK_WARRIOR: {
    id: 'week_warrior',
    name: 'Week Warrior',
    description: '7-day streak',
    icon: '⚔️',
    xp: 150,
    tier: 'silver',
  },
  UNSTOPPABLE: {
    id: 'unstoppable',
    name: 'Unstoppable',
    description: '30-day streak',
    icon: '💪',
    xp: 500,
    tier: 'gold',
  },
  LEGENDARY: {
    id: 'legendary',
    name: 'Legendary',
    description: '100-day streak',
    icon: '👑',
    xp: 2000,
    tier: 'platinum',
  },

  // Performance Achievements
  PERFECT_SCORE: {
    id: 'perfect_score',
    name: 'Perfectionist',
    description: 'Get 100% on a quiz',
    icon: '💯',
    xp: 100,
    tier: 'bronze',
  },
  SPEED_DEMON: {
    id: 'speed_demon',
    name: 'Speed Demon',
    description: 'Complete quiz in under 30 seconds',
    icon: '⚡',
    xp: 75,
    tier: 'bronze',
  },
  COMEBACK_KID: {
    id: 'comeback_kid',
    name: 'Comeback Kid',
    description: 'Improve score by 50%',
    icon: '📈',
    xp: 100,
    tier: 'silver',
  },

  // Milestone Achievements
  FIRST_QUIZ: {
    id: 'first_quiz',
    name: 'Welcome!',
    description: 'Complete your first quiz',
    icon: '🎯',
    xp: 25,
    tier: 'bronze',
  },
  QUIZ_MASTER: {
    id: 'quiz_master',
    name: 'Quiz Master',
    description: 'Complete 100 quizzes',
    icon: '🎓',
    xp: 300,
    tier: 'gold',
  },
  KNOWLEDGE_SEEKER: {
    id: 'knowledge_seeker',
    name: 'Knowledge Seeker',
    description: 'Complete 1000 quizzes',
    icon: '🧠',
    xp: 1000,
    tier: 'platinum',
  },

  // Category Mastery
  CATEGORY_EXPLORER: {
    id: 'category_explorer',
    name: 'Explorer',
    description: 'Try all categories',
    icon: '🗺️',
    xp: 200,
    tier: 'silver',
  },
  CATEGORY_MASTER: {
    id: 'category_master',
    name: 'Master',
    description: 'Master a category',
    icon: '🏆',
    xp: 300,
    tier: 'gold',
  },
  POLYMATH: {
    id: 'polymath',
    name: 'Polymath',
    description: 'Master 5 categories',
    icon: '🌟',
    xp: 1000,
    tier: 'platinum',
  },

  // Social Achievements
  SOCIAL_BUTTERFLY: {
    id: 'social_butterfly',
    name: 'Social Butterfly',
    description: 'Share 10 results',
    icon: '🦋',
    xp: 50,
    tier: 'bronze',
  },
  CHALLENGER: {
    id: 'challenger',
    name: 'Challenger',
    description: 'Challenge 5 friends',
    icon: '⚔️',
    xp: 100,
    tier: 'silver',
  },
  MENTOR: {
    id: 'mentor',
    name: 'Mentor',
    description: 'Help 10 friends improve',
    icon: '🤝',
    xp: 200,
    tier: 'gold',
  },

  // Special Achievements
  NIGHT_OWL: {
    id: 'night_owl',
    name: 'Night Owl',
    description: 'Complete quiz after midnight',
    icon: '🦉',
    xp: 50,
    tier: 'bronze',
    secret: true,
  },
  EARLY_BIRD: {
    id: 'early_bird',
    name: 'Early Bird',
    description: 'Complete quiz before 6 AM',
    icon: '🐦',
    xp: 50,
    tier: 'bronze',
    secret: true,
  },
  LUCKY_SEVEN: {
    id: 'lucky_seven',
    name: 'Lucky Seven',
    description: 'Score exactly 77%',
    icon: '🎰',
    xp: 77,
    tier: 'silver',
    secret: true,
  },
};

// Dark Pattern Configurations
const DARK_PATTERNS = {
  // Loss Aversion
  STREAK_WARNING_HOURS: 20, // Warn when streak is about to break
  XP_DECAY_DAYS: 7, // XP starts decaying after inactivity
  RANK_DROP_WARNING: true, // Warn about potential rank drop

  // Variable Rewards
  MYSTERY_BOX_CHANCE: 0.1, // 10% chance for mystery reward
  RANDOM_XP_MULTIPLIER: [1, 1, 1, 1.5, 2, 3], // Variable XP rewards

  // FOMO Mechanics
  LIMITED_TIME_EVENTS: true,
  DAILY_BONUS_WINDOW: 24, // Hours to claim daily bonus
  FLASH_CHALLENGES: true,

  // Social Proof
  SHOW_FRIEND_ACTIVITY: true,
  LEADERBOARD_UPDATES: true,
  ACHIEVEMENT_BROADCASTS: true,

  // Sunk Cost Fallacy
  SHOW_TIME_INVESTED: true,
  SHOW_PROGRESS_LOSS: true,

  // Endowment Effect
  TEMPORARY_POWER_UPS: true,
  EXPIRING_REWARDS: true,
};

interface UserStats {
  userId: string;
  xp: number;
  level: number;
  streak: number;
  lastActive: Date;
  totalQuizzes: number;
  perfectScores: number;
  achievements: string[];
  badges: Badge[];
  powerUps: PowerUp[];
  dailyBonus: DailyBonus;
  rank: number;
  rankTrend: 'up' | 'down' | 'stable';
}

interface Badge {
  id: string;
  name: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  unlockedAt: Date;
  progress?: number;
}

interface PowerUp {
  id: string;
  name: string;
  type: 'xp_boost' | 'time_freeze' | 'skip_question' | 'hint' | 'double_points';
  quantity: number;
  expiresAt?: Date;
}

interface DailyBonus {
  day: number;
  claimed: boolean;
  claimBy: Date;
  rewards: Reward[];
}

interface Reward {
  type: 'xp' | 'powerup' | 'badge' | 'currency';
  amount: number;
  item?: any;
}

interface Quest {
  id: string;
  name: string;
  description: string;
  type: 'daily' | 'weekly' | 'special';
  requirements: QuestRequirement[];
  rewards: Reward[];
  progress: number;
  expiresAt: Date;
}

interface QuestRequirement {
  type: 'quiz_complete' | 'perfect_score' | 'category' | 'streak' | 'xp_earn';
  target: number;
  current: number;
}

class GamificationService {
  private static instance: GamificationService;
  private userStats: UserStats | null = null;
  private activeQuests: Quest[] = [];
  private comboMultiplier: number = 1;
  private sessionXP: number = 0;
  private initialized: boolean = false;

  private constructor() {
    this.initialize();
  }

  static getInstance(): GamificationService {
    if (!GamificationService.instance) {
      GamificationService.instance = new GamificationService();
    }
    return GamificationService.instance;
  }

  private async initialize() {
    if (this.initialized) return;

    try {
      await this.loadUserStats();
      await this.checkDailyLogin();
      await this.loadActiveQuests();
      this.startDecayTimer();
      this.scheduleNotifications();
      this.initialized = true;
    } catch (error) {
      console.warn('Gamification initialization failed, using defaults:', error);
      this.userStats = this.getDefaultUserStats();
      this.initialized = true;
    }
  }

  // XP and Level System
  calculateLevelFromXP(xp: number): number {
    let level = 1;
    let totalXP = 0;

    while (totalXP < xp && level < LEVEL_CONFIG.maxLevel) {
      const xpForLevel = Math.floor(LEVEL_CONFIG.baseXP * Math.pow(level, LEVEL_CONFIG.exponent));
      if (totalXP + xpForLevel > xp) break;
      totalXP += xpForLevel;
      level++;
    }

    return level;
  }

  getXPForNextLevel(currentLevel: number): number {
    return Math.floor(LEVEL_CONFIG.baseXP * Math.pow(currentLevel + 1, LEVEL_CONFIG.exponent));
  }

  async awardXP(
    baseXP: number,
    reason: string,
  ): Promise<{
    xpGained: number;
    levelUp: boolean;
    newLevel?: number;
    bonuses: string[];
  }> {
    if (!this.userStats) await this.loadUserStats();

    const bonuses: string[] = [];
    let multiplier = 1;

    // Apply combo multiplier
    if (this.comboMultiplier > 1) {
      multiplier *= this.comboMultiplier;
      bonuses.push(`Combo x${this.comboMultiplier}`);
    }

    // Apply streak bonus
    if (this.userStats!.streak > 0) {
      const streakBonus = 1 + this.userStats!.streak * 0.1;
      multiplier *= streakBonus;
      bonuses.push(`Streak Bonus x${streakBonus.toFixed(1)}`);
    }

    // Variable reward (dark pattern)
    const randomMultiplier =
      DARK_PATTERNS.RANDOM_XP_MULTIPLIER[
        Math.floor(Math.random() * DARK_PATTERNS.RANDOM_XP_MULTIPLIER.length)
      ];
    if (randomMultiplier > 1) {
      multiplier *= randomMultiplier;
      bonuses.push(`Lucky Bonus x${randomMultiplier}`);
    }

    // Check for active XP boost power-up
    const xpBoost = this.userStats!.powerUps.find((p) => p.type === 'xp_boost');
    if (xpBoost && xpBoost.quantity > 0) {
      multiplier *= 2;
      bonuses.push('XP Boost x2');
      xpBoost.quantity--;
    }

    const xpGained = Math.floor(baseXP * multiplier);
    const oldLevel = this.userStats!.level;

    this.userStats!.xp += xpGained;
    this.sessionXP += xpGained;

    const newLevel = this.calculateLevelFromXP(this.userStats!.xp);
    const levelUp = newLevel > oldLevel;

    if (levelUp) {
      this.userStats!.level = newLevel;
      await this.triggerLevelUpRewards(newLevel);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Track level up event
      await AnalyticsService.trackGamificationEvent('level_up', {
        event_type: 'level_up',
        level_reached: newLevel,
        context: reason,
      });
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    // Track XP gained event
    await AnalyticsService.trackGamificationEvent('xp_gained', {
      event_type: 'xp_gained',
      xp_amount: xpGained,
      context: reason,
    });

    await this.saveUserStats();
    await this.trackXPGain(xpGained, reason);

    return {
      xpGained,
      levelUp,
      newLevel: levelUp ? newLevel : undefined,
      bonuses,
    };
  }

  // Streak System
  async updateStreak(): Promise<{ maintained: boolean; broken: boolean; bonus?: number }> {
    if (!this.userStats) await this.loadUserStats();

    const now = new Date();
    const lastActive = new Date(this.userStats!.lastActive);
    const hoursSinceActive = (now.getTime() - lastActive.getTime()) / (1000 * 60 * 60);

    if (hoursSinceActive < 24) {
      // Streak maintained
      return { maintained: true, broken: false };
    } else if (hoursSinceActive < 48) {
      // New day, increment streak
      this.userStats!.streak++;
      this.userStats!.lastActive = now;

      // Check streak achievements
      await this.checkStreakAchievements(this.userStats!.streak);

      // Streak bonus XP
      const bonus = this.userStats!.streak * 10;
      await this.awardXP(bonus, 'streak_bonus');

      await this.saveUserStats();
      return { maintained: true, broken: false, bonus };
    } else {
      // Streak broken
      const oldStreak = this.userStats!.streak;
      this.userStats!.streak = 1;
      this.userStats!.lastActive = now;

      await this.saveUserStats();

      // Dark pattern: Show what they lost
      if (oldStreak > 3) {
        await this.showStreakLossWarning(oldStreak);
      }

      return { maintained: false, broken: true };
    }
  }

  // Achievement System
  async unlockAchievement(achievementId: string): Promise<{
    unlocked: boolean;
    achievement?: any;
    rewards?: Reward[];
  }> {
    if (!this.userStats) await this.loadUserStats();

    if (this.userStats!.achievements.includes(achievementId)) {
      return { unlocked: false };
    }

    const achievement = Object.values(ACHIEVEMENTS).find((a) => a.id === achievementId);
    if (!achievement) return { unlocked: false };

    this.userStats!.achievements.push(achievementId);

    // Award XP for achievement
    await this.awardXP(achievement.xp, `achievement_${achievementId}`);

    // Add badge
    this.userStats!.badges.push({
      id: achievement.id,
      name: achievement.name,
      tier: achievement.tier as any,
      unlockedAt: new Date(),
    });

    await this.saveUserStats();

    // Haptic feedback for achievement
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Dark pattern: Broadcast to friends
    if (DARK_PATTERNS.ACHIEVEMENT_BROADCASTS) {
      await this.broadcastAchievement(achievement);
    }

    return {
      unlocked: true,
      achievement,
      rewards: [{ type: 'xp', amount: achievement.xp }],
    };
  }

  private async checkStreakAchievements(streak: number) {
    if (streak === 3) await this.unlockAchievement('first_streak');
    if (streak === 7) await this.unlockAchievement('week_warrior');
    if (streak === 30) await this.unlockAchievement('unstoppable');
    if (streak === 100) await this.unlockAchievement('legendary');
  }

  // Combo System
  startCombo() {
    this.comboMultiplier = 1;
  }

  incrementCombo(): number {
    this.comboMultiplier = Math.min(this.comboMultiplier + 0.5, 5);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    return this.comboMultiplier;
  }

  breakCombo() {
    if (this.comboMultiplier > 1) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
    this.comboMultiplier = 1;
  }

  // Check for new achievements
  async checkAchievements(): Promise<any[]> {
    if (!this.userStats) return [];

    const newAchievements: any[] = [];
    const stats = this.userStats;

    // Check for first quiz achievement
    if (stats.quizzesCompleted === 1 && !stats.achievements.find((a) => a.id === 'first_quiz')) {
      const achievement = { ...ACHIEVEMENTS.FIRST_QUIZ, unlockedAt: new Date() };
      stats.achievements.push(achievement);
      newAchievements.push(achievement);
    }

    // Check for perfect score
    if (
      stats.lastQuizAccuracy === 100 &&
      !stats.achievements.find((a) => a.id === 'perfect_score')
    ) {
      const achievement = { ...ACHIEVEMENTS.PERFECT_SCORE, unlockedAt: new Date() };
      stats.achievements.push(achievement);
      newAchievements.push(achievement);
    }

    // Check streak achievements
    if (stats.streak === 3 && !stats.achievements.find((a) => a.id === 'first_streak')) {
      const achievement = { ...ACHIEVEMENTS.FIRST_STREAK, unlockedAt: new Date() };
      stats.achievements.push(achievement);
      newAchievements.push(achievement);

      // Track achievement unlock
      await AnalyticsService.trackGamificationEvent('achievement_unlocked', {
        event_type: 'achievement_unlocked',
        achievement_id: achievement.id,
        context: 'streak_milestone',
      });
    } else if (stats.streak === 7 && !stats.achievements.find((a) => a.id === 'week_warrior')) {
      const achievement = { ...ACHIEVEMENTS.WEEK_WARRIOR, unlockedAt: new Date() };
      stats.achievements.push(achievement);
      newAchievements.push(achievement);

      // Track achievement unlock
      await AnalyticsService.trackGamificationEvent('achievement_unlocked', {
        event_type: 'achievement_unlocked',
        achievement_id: achievement.id,
        context: 'streak_milestone',
      });
    }

    // Check quiz milestone achievements
    if (stats.quizzesCompleted === 100 && !stats.achievements.find((a) => a.id === 'quiz_master')) {
      const achievement = { ...ACHIEVEMENTS.QUIZ_MASTER, unlockedAt: new Date() };
      stats.achievements.push(achievement);
      newAchievements.push(achievement);
    }

    return newAchievements;
  }

  getComboMultiplier(): number {
    return this.comboMultiplier;
  }

  // Get default user stats for offline/error scenarios
  private getDefaultUserStats(): UserStats {
    return {
      userId: 'offline-user',
      xp: 0,
      level: 1,
      streak: 0,
      longestStreak: 0,
      quizzesCompleted: 0,
      correctAnswers: 0,
      totalAnswers: 0,
      averageAccuracy: 0,
      lastQuizAccuracy: 0,
      categoriesUnlocked: ['JavaScript'], // Default category
      achievements: [],
      powerUps: [],
      lastActive: new Date(),
      joinedAt: new Date(),
      preferences: {
        notifications: true,
        haptics: true,
        animations: true,
        darkMode: false,
      },
    };
  }

  // Ensure user stats are loaded
  private async ensureUserStats(): Promise<UserStats> {
    if (!this.userStats) {
      await this.initialize();
    }
    return this.userStats!;
  }

  // Get current user stats (public method)
  async getUserStats(): Promise<UserStats> {
    return await this.ensureUserStats();
  }

  // Daily Bonus System (Dark Pattern: Daily Login Hook)
  async checkDailyLogin(): Promise<DailyBonus | null> {
    if (!this.userStats) await this.loadUserStats();

    const now = new Date();
    const bonus = this.userStats!.dailyBonus;

    if (bonus.claimed && bonus.claimBy > now) {
      return null; // Already claimed today
    }

    // Reset if expired
    if (bonus.claimBy < now && !bonus.claimed) {
      bonus.day = 1;
    } else if (bonus.claimed) {
      bonus.day = Math.min(bonus.day + 1, 30);
    }

    // Generate rewards based on day
    bonus.rewards = this.generateDailyRewards(bonus.day);
    bonus.claimed = false;
    bonus.claimBy = new Date(now.getTime() + DARK_PATTERNS.DAILY_BONUS_WINDOW * 60 * 60 * 1000);

    this.userStats!.dailyBonus = bonus;
    await this.saveUserStats();

    return bonus;
  }

  private generateDailyRewards(day: number): Reward[] {
    const rewards: Reward[] = [];

    // Base XP reward
    rewards.push({ type: 'xp', amount: day * 10 });

    // Power-ups on certain days
    if (day % 5 === 0) {
      rewards.push({
        type: 'powerup',
        amount: 1,
        item: { type: 'xp_boost', quantity: 1 },
      });
    }

    // Mystery box chance
    if (Math.random() < DARK_PATTERNS.MYSTERY_BOX_CHANCE) {
      rewards.push({
        type: 'powerup',
        amount: 1,
        item: { type: 'hint', quantity: 3 },
      });
    }

    return rewards;
  }

  async claimDailyBonus(): Promise<Reward[]> {
    if (!this.userStats) await this.loadUserStats();

    const bonus = this.userStats!.dailyBonus;
    if (bonus.claimed) return [];

    bonus.claimed = true;

    // Apply rewards
    for (const reward of bonus.rewards) {
      if (reward.type === 'xp') {
        await this.awardXP(reward.amount, 'daily_bonus');
      } else if (reward.type === 'powerup' && reward.item) {
        this.addPowerUp(reward.item);
      }
    }

    await this.saveUserStats();
    return bonus.rewards;
  }

  // Quest System
  async getActiveQuests(): Promise<Quest[]> {
    const now = new Date();

    // Filter expired quests
    this.activeQuests = this.activeQuests.filter((q) => q.expiresAt > now);

    // Generate new daily quests if needed
    if (!this.activeQuests.some((q) => q.type === 'daily')) {
      this.activeQuests.push(...this.generateDailyQuests());
    }

    // Check for special events
    if (DARK_PATTERNS.LIMITED_TIME_EVENTS) {
      const specialQuest = this.generateSpecialQuest();
      if (specialQuest) this.activeQuests.push(specialQuest);
    }

    return this.activeQuests;
  }

  private generateDailyQuests(): Quest[] {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    return [
      {
        id: `daily_${now.getDate()}`,
        name: 'Daily Challenge',
        description: 'Complete 3 quizzes today',
        type: 'daily',
        requirements: [{ type: 'quiz_complete', target: 3, current: 0 }],
        rewards: [
          { type: 'xp', amount: 100 },
          { type: 'powerup', amount: 1, item: { type: 'hint', quantity: 1 } },
        ],
        progress: 0,
        expiresAt: tomorrow,
      },
      {
        id: `perfect_${now.getDate()}`,
        name: 'Perfectionist',
        description: 'Get a perfect score',
        type: 'daily',
        requirements: [{ type: 'perfect_score', target: 1, current: 0 }],
        rewards: [{ type: 'xp', amount: 150 }],
        progress: 0,
        expiresAt: tomorrow,
      },
    ];
  }

  private generateSpecialQuest(): Quest | null {
    // Flash challenges (Dark Pattern: FOMO)
    if (DARK_PATTERNS.FLASH_CHALLENGES && Math.random() < 0.1) {
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour

      return {
        id: `flash_${Date.now()}`,
        name: '⚡ Flash Challenge',
        description: 'Complete 5 quizzes in the next hour!',
        type: 'special',
        requirements: [{ type: 'quiz_complete', target: 5, current: 0 }],
        rewards: [
          { type: 'xp', amount: 500 },
          { type: 'badge', amount: 1, item: { name: 'Speed Runner' } },
        ],
        progress: 0,
        expiresAt,
      };
    }

    return null;
  }

  async updateQuestProgress(type: string, amount: number = 1) {
    let questsCompleted = false;

    for (const quest of this.activeQuests) {
      for (const req of quest.requirements) {
        if (req.type === type && req.current < req.target) {
          req.current = Math.min(req.current + amount, req.target);
          quest.progress = (req.current / req.target) * 100;

          if (quest.progress === 100 && !questsCompleted) {
            await this.completeQuest(quest);
            questsCompleted = true;
          }
        }
      }
    }

    return questsCompleted;
  }

  private async completeQuest(quest: Quest) {
    // Apply rewards
    for (const reward of quest.rewards) {
      if (reward.type === 'xp') {
        await this.awardXP(reward.amount, `quest_${quest.id}`);
      } else if (reward.type === 'powerup' && reward.item) {
        this.addPowerUp(reward.item);
      } else if (reward.type === 'badge' && reward.item) {
        this.userStats!.badges.push({
          id: `quest_${quest.id}`,
          name: reward.item.name,
          tier: 'silver',
          unlockedAt: new Date(),
        });
      }
    }

    // Remove completed quest
    this.activeQuests = this.activeQuests.filter((q) => q.id !== quest.id);

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }

  // Power-Up System
  addPowerUp(powerUp: Partial<PowerUp>) {
    if (!this.userStats) return;

    const existing = this.userStats.powerUps.find((p) => p.type === powerUp.type);
    if (existing) {
      existing.quantity += powerUp.quantity || 1;
    } else {
      this.userStats.powerUps.push({
        id: `${powerUp.type}_${Date.now()}`,
        name: this.getPowerUpName(powerUp.type!),
        type: powerUp.type as any,
        quantity: powerUp.quantity || 1,
        expiresAt:
          powerUp.type === 'xp_boost'
            ? new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
            : undefined,
      });
    }

    this.saveUserStats();
  }

  private getPowerUpName(type: string): string {
    const names: Record<string, string> = {
      xp_boost: 'XP Boost',
      time_freeze: 'Time Freeze',
      skip_question: 'Skip Question',
      hint: 'Hint',
      double_points: 'Double Points',
    };
    return names[type] || 'Power-Up';
  }

  usePowerUp(type: string): boolean {
    if (!this.userStats) return false;

    const powerUp = this.userStats.powerUps.find((p) => p.type === type && p.quantity > 0);
    if (!powerUp) return false;

    powerUp.quantity--;

    if (powerUp.quantity === 0) {
      this.userStats.powerUps = this.userStats.powerUps.filter((p) => p.id !== powerUp.id);
    }

    this.saveUserStats();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    return true;
  }

  // Leaderboard System
  async getLeaderboard(type: 'global' | 'friends' | 'weekly' = 'global'): Promise<any[]> {
    try {
      let query = supabase
        .from('user_stats')
        .select('*')
        .order('xp', { ascending: false })
        .limit(100);

      if (type === 'weekly') {
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        query = query.gte('last_active', weekAgo.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;

      // Dark pattern: Always show user in leaderboard even if not in top 100
      const leaderboard = data || [];
      const userInList = leaderboard.find((u) => u.userId === this.userStats?.userId);

      if (!userInList && this.userStats) {
        // Get user's actual rank
        const { count } = await supabase
          .from('user_stats')
          .select('*', { count: 'exact', head: true })
          .gt('xp', this.userStats.xp);

        this.userStats.rank = (count || 0) + 1;

        // Add user to bottom of visible list with their actual rank
        leaderboard.push({
          ...this.userStats,
          isCurrentUser: true,
        });
      }

      return leaderboard;
    } catch (error) {
      console.error('Failed to get leaderboard:', error);
      return [];
    }
  }

  // Dark Pattern Implementations
  private async showStreakLossWarning(lostStreak: number) {
    // Calculate what was lost
    const lostXP = lostStreak * 10;
    const message = `You lost your ${lostStreak}-day streak! That's ${lostXP} bonus XP gone. Don't let it happen again!`;

    // Schedule notification
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🔥 Streak Lost!',
        body: message,
        data: { type: 'streak_lost', lostStreak },
      },
      trigger: null, // Show immediately
    });
  }

  private async scheduleNotifications() {
    // Dark Pattern: Re-engagement notifications
    if (DARK_PATTERNS.STREAK_WARNING_HOURS) {
      await this.scheduleStreakReminder();
    }

    // Dark Pattern: FOMO notifications
    if (DARK_PATTERNS.LIMITED_TIME_EVENTS) {
      await this.scheduleLimitedTimeEvents();
    }

    // Dark Pattern: Social proof
    if (DARK_PATTERNS.SHOW_FRIEND_ACTIVITY) {
      await this.scheduleSocialNotifications();
    }
  }

  private async scheduleStreakReminder() {
    const lastActive = new Date(this.userStats?.lastActive || Date.now());
    const reminderTime = new Date(
      lastActive.getTime() + DARK_PATTERNS.STREAK_WARNING_HOURS * 60 * 60 * 1000,
    );

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🔥 Your streak is in danger!',
        body: `Complete a quiz in the next ${24 - DARK_PATTERNS.STREAK_WARNING_HOURS} hours to maintain your ${this.userStats?.streak}-day streak!`,
        data: { type: 'streak_warning' },
      },
      trigger: { date: reminderTime },
    });
  }

  private async scheduleLimitedTimeEvents() {
    // Schedule random "limited time" events
    const randomHour = Math.floor(Math.random() * 24);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(randomHour, 0, 0, 0);

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '⚡ Limited Time Challenge!',
        body: "Double XP for the next 2 hours! Don't miss out!",
        data: { type: 'limited_event' },
      },
      trigger: { date: tomorrow },
    });
  }

  private async scheduleSocialNotifications() {
    // Fake friend activity (dark pattern)
    const friends = ['Alex', 'Sarah', 'Mike', 'Emma', 'John'];
    const friend = friends[Math.floor(Math.random() * friends.length)];
    const achievement = Object.values(ACHIEVEMENTS)[Math.floor(Math.random() * 5)];

    await Notifications.scheduleNotificationAsync({
      content: {
        title: `${friend} just unlocked ${achievement.icon} ${achievement.name}!`,
        body: 'Can you beat their score?',
        data: { type: 'friend_activity' },
      },
      trigger: { seconds: 3600 * Math.random() * 12 }, // Random time in next 12 hours
    });
  }

  private async broadcastAchievement(achievement: any) {
    // Simulate broadcasting to friends
    await supabase.from('activity_feed').insert({
      user_id: this.userStats?.userId,
      type: 'achievement',
      content: {
        achievement_id: achievement.id,
        achievement_name: achievement.name,
        achievement_icon: achievement.icon,
      },
      created_at: new Date().toISOString(),
    });
  }

  // XP Decay (Dark Pattern: Loss Aversion)
  private startDecayTimer() {
    setInterval(
      async () => {
        if (!this.userStats) return;

        const daysSinceActive =
          (Date.now() - new Date(this.userStats.lastActive).getTime()) / (1000 * 60 * 60 * 24);

        if (daysSinceActive > DARK_PATTERNS.XP_DECAY_DAYS) {
          const decayAmount = Math.floor(this.userStats.xp * 0.01); // 1% per day
          this.userStats.xp = Math.max(0, this.userStats.xp - decayAmount);

          // Recalculate level
          const newLevel = this.calculateLevelFromXP(this.userStats.xp);
          if (newLevel < this.userStats.level) {
            // Show level drop warning
            await Notifications.scheduleNotificationAsync({
              content: {
                title: "📉 You're losing progress!",
                body: `You dropped to Level ${newLevel}! Come back to stop the decay!`,
                data: { type: 'xp_decay' },
              },
              trigger: null,
            });
            this.userStats.level = newLevel;
          }

          await this.saveUserStats();
        }
      },
      24 * 60 * 60 * 1000,
    ); // Check daily
  }

  // Analytics tracking
  private async trackXPGain(amount: number, reason: string) {
    await supabase.from('analytics_events').insert({
      user_id: this.userStats?.userId,
      event: 'xp_gained',
      properties: {
        amount,
        reason,
        total_xp: this.userStats?.xp,
        level: this.userStats?.level,
        session_xp: this.sessionXP,
      },
      created_at: new Date().toISOString(),
    });
  }

  private async triggerLevelUpRewards(level: number) {
    const rewards: Reward[] = [];

    // XP milestone rewards
    if (level % 5 === 0) {
      rewards.push({ type: 'powerup', amount: 2, item: { type: 'hint', quantity: 2 } });
    }

    if (level % 10 === 0) {
      rewards.push({ type: 'powerup', amount: 1, item: { type: 'xp_boost', quantity: 1 } });
    }

    // Special level rewards
    const specialLevels: Record<number, Reward[]> = {
      10: [{ type: 'badge', amount: 1, item: { name: 'Rising Star', tier: 'bronze' } }],
      25: [{ type: 'badge', amount: 1, item: { name: 'Expert', tier: 'silver' } }],
      50: [{ type: 'badge', amount: 1, item: { name: 'Master', tier: 'gold' } }],
      100: [{ type: 'badge', amount: 1, item: { name: 'Legend', tier: 'platinum' } }],
    };

    if (specialLevels[level]) {
      rewards.push(...specialLevels[level]);
    }

    // Apply rewards
    for (const reward of rewards) {
      if (reward.type === 'powerup' && reward.item) {
        this.addPowerUp(reward.item);
      } else if (reward.type === 'badge' && reward.item) {
        this.userStats!.badges.push({
          id: `level_${level}`,
          name: reward.item.name,
          tier: reward.item.tier as any,
          unlockedAt: new Date(),
        });
      }
    }
  }

  // Persistence
  private async loadUserStats() {
    try {
      const stats = await AsyncStorage.getItem('@user_stats');
      if (stats) {
        this.userStats = JSON.parse(stats);
      } else {
        // Initialize new user
        this.userStats = {
          userId: `user_${Date.now()}`,
          xp: 0,
          level: 1,
          streak: 0,
          lastActive: new Date(),
          totalQuizzes: 0,
          perfectScores: 0,
          achievements: [],
          badges: [],
          powerUps: [],
          dailyBonus: {
            day: 1,
            claimed: false,
            claimBy: new Date(Date.now() + 24 * 60 * 60 * 1000),
            rewards: [],
          },
          rank: 0,
          rankTrend: 'stable',
        };
      }
    } catch (error) {
      console.error('Failed to load user stats:', error);
    }
  }

  private async saveUserStats() {
    try {
      await AsyncStorage.setItem('@user_stats', JSON.stringify(this.userStats));

      // Sync with Supabase
      if (this.userStats) {
        await supabase.from('user_stats').upsert({
          ...this.userStats,
          updated_at: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('Failed to save user stats:', error);
    }
  }

  // Public getters
  getUserStats(): UserStats | null {
    return this.userStats;
  }

  getSessionXP(): number {
    return this.sessionXP;
  }

  resetSession() {
    this.sessionXP = 0;
    this.comboMultiplier = 1;
  }
}

export default GamificationService.getInstance();
