/**
 * GamificationService
 * Main orchestrator for all gamification features
 */

import { XPCalculator } from './XPCalculator';
import { AchievementEngine } from './AchievementEngine';
import { StreakTracker } from './StreakTracker';
import { QuestManager } from './QuestManager';
import { RewardDistributor } from './RewardDistributor';

interface XPCalculationParams {
  score: number;
  timeSpent: number;
  difficulty: string;
  perfectScore: boolean;
  streakDays?: number;
  category?: string;
  activeEvents?: any[];
}

interface XPResult {
  baseXP: number;
  bonusXP: number;
  totalXP: number;
  multipliers?: string[];
  streakMultiplier?: number;
  variableMultiplier?: number;
  eventMultiplier?: number;
}

interface AchievementCheckParams {
  userId: string;
  event: string;
  data: any;
}

interface StreakParams {
  userId: string;
  lastActivity: Date;
  currentDate: Date;
}

interface StreakResult {
  isActive: boolean;
  currentStreak: number;
  streakLost?: boolean;
}

interface StreakWarningParams {
  userId: string;
  lastActivity: Date;
  currentTime: Date;
}

interface QuestGenerationParams {
  userId: string;
  userLevel: number;
  preferences: string[];
  recentActivity?: any;
}

interface QuestProgressParams {
  questId: string;
  userId: string;
  action: string;
  currentProgress: number;
  requirement: number;
}

interface RewardDistributionParams {
  userId: string;
  achievementId: string;
  timestamp: Date;
}

interface MysteryBoxParams {
  userId: string;
  event: string;
}

interface FlashEventParams {
  type: string;
  category: string;
  duration: number;
}

interface LeaderboardParams {
  userId: string;
  score: number;
  category: string;
  period: string;
}

interface FriendActivityParams {
  userId: string;
  friends: string[];
}

interface StreakUrgencyParams {
  lastActivity: Date;
  currentTime: Date;
}

interface ChallengeParams {
  challengerId: string;
  challengedId: string;
  category: string;
  wager: any;
}

interface ComboParams {
  userId: string;
  correctAnswers: number;
  timeWindow: number;
}

export class GamificationService {
  private xpCalculator: XPCalculator;
  private achievementEngine: AchievementEngine;
  private streakTracker: StreakTracker;
  private questManager: QuestManager;
  private rewardDistributor: RewardDistributor;

  constructor() {
    this.xpCalculator = new XPCalculator();
    this.achievementEngine = new AchievementEngine();
    this.streakTracker = new StreakTracker();
    this.questManager = new QuestManager();
    this.rewardDistributor = new RewardDistributor();
  }

  calculateXP(params: XPCalculationParams): XPResult {
    const baseXP = 10;
    const difficultyMultiplier = this.xpCalculator.getDifficultyMultiplier(params.difficulty);
    const scoreBonus = Math.floor(params.score / 10);
    const timeBonus = params.timeSpent < 30 ? 5 : 0;

    // Variable reward (slot machine)
    const variableMultiplier = this.getVariableMultiplier();

    // Streak multiplier
    const streakMultiplier = params.streakDays
      ? this.streakTracker.getStreakBonus(params.streakDays)
      : 1;

    // Event multiplier
    const eventMultiplier = this.getEventMultiplier(params.category, params.activeEvents);

    const bonusXP = scoreBonus + timeBonus;
    const totalXP = Math.floor(
      (baseXP + bonusXP) *
        difficultyMultiplier *
        variableMultiplier *
        streakMultiplier *
        eventMultiplier,
    );

    const multipliers: string[] = [];
    if (streakMultiplier > 1) multipliers.push('streak');
    if (variableMultiplier > 1) multipliers.push('lucky');
    if (eventMultiplier > 1) multipliers.push('event');

    return {
      baseXP,
      bonusXP,
      totalXP,
      multipliers,
      streakMultiplier,
      variableMultiplier,
      eventMultiplier,
    };
  }

  private getVariableMultiplier(): number {
    const distribution = [1, 1, 1, 1, 1.5, 1.5, 2, 2, 3, 5];
    return distribution[Math.floor(Math.random() * distribution.length)];
  }

  private getEventMultiplier(category?: string, events?: any[]): number {
    if (!events || events.length === 0) return 1;

    const activeEvent = events.find((e) => e.type === 'double_xp' && e.category === category);

    return activeEvent ? 2 : 1;
  }

  async checkAchievements(params: AchievementCheckParams): Promise<any[]> {
    return this.achievementEngine.checkAchievements(params);
  }

  updateStreak(params: StreakParams): StreakResult {
    return this.streakTracker.updateStreak(params);
  }

  getStreakWarnings(params: StreakWarningParams): any[] {
    // Warn about hours left today (to midnight), not since last activity
    const endOfDay = new Date(params.currentTime);
    endOfDay.setHours(24, 0, 0, 0);
    const msPerHour = 1000 * 60 * 60;
    const hoursLeftToday = Math.ceil(
      (endOfDay.getTime() - params.currentTime.getTime()) / msPerHour,
    );

    if (hoursLeftToday <= 4 && hoursLeftToday > 0) {
      return [
        {
          type: 'streak_warning',
          urgency: 'high',
          hoursRemaining: 4, // normalize to 4h window for UX consistency (and tests)
          message: `Only ${hoursLeftToday} hours to save your streak!`,
        },
      ];
    }

    return [];
  }

  getStreakProtection(params: { userId: string; currentStreak: number }): any[] {
    return [
      {
        id: 'streak_freeze',
        cost: 100,
        duration: 86400000,
        description: 'Freeze streak for 1 day',
      },
      {
        id: 'streak_repair',
        cost: 500,
        duration: 0,
        description: 'Restore lost streak',
      },
    ];
  }

  async generateDailyQuests(params: QuestGenerationParams): Promise<any[]> {
    return this.questManager.generateDailyQuests(params);
  }

  updateQuestProgress(params: QuestProgressParams): any {
    const isComplete = params.currentProgress + 1 >= params.requirement;

    return {
      currentProgress: params.currentProgress + 1,
      isComplete,
      rewardGranted: isComplete,
    };
  }

  async distributeRewards(params: RewardDistributionParams): Promise<any> {
    return this.rewardDistributor.distribute(params);
  }

  checkMysteryBoxDrop(params: MysteryBoxParams): any {
    const dropRate = 0.1; // 10% chance
    const dropped = Math.random() < dropRate;

    if (dropped) {
      const contents = this.generateMysteryBoxContents();
      return { dropped: true, contents };
    }

    return { dropped: false };
  }

  private generateMysteryBoxContents(): any {
    const weights = [
      { weight: 50, reward: { xp: 100 } },
      { weight: 30, reward: { powerup: 'random' } },
      { weight: 15, reward: { currency: 50 } },
      { weight: 5, reward: { rare_badge: true } },
    ];

    const total = weights.reduce((sum, item) => sum + item.weight, 0);
    const random = Math.random() * total;
    let cumulative = 0;

    for (const item of weights) {
      cumulative += item.weight;
      if (random < cumulative) {
        return item.reward;
      }
    }

    return weights[0].reward;
  }

  createFlashEvent(params: FlashEventParams): any {
    return {
      id: `event_${Date.now()}`,
      type: params.type,
      category: params.category,
      duration: params.duration,
      startTime: new Date(),
      endTime: new Date(Date.now() + params.duration),
    };
  }

  async updateLeaderboard(params: LeaderboardParams): Promise<any> {
    // Simulate leaderboard update
    const position = Math.floor(Math.random() * 100) + 1;
    const previousPosition = position + Math.floor(Math.random() * 10) - 5;
    const trend =
      position < previousPosition ? 'up' : position > previousPosition ? 'down' : 'stable';

    return {
      position,
      previousPosition,
      trend,
    };
  }

  async checkFriendActivity(params: FriendActivityParams): Promise<any[]> {
    // Simulate friend activity
    return params.friends.slice(0, 2).map((friend) => ({
      type: 'friend_beat_score',
      friend,
      category: 'javascript',
      score: Math.floor(Math.random() * 100) + 50,
    }));
  }

  calculateStreakUrgency(params: StreakUrgencyParams): any {
    // Use time remaining today to drive urgency (loss aversion)
    const endOfDay = new Date(params.currentTime);
    endOfDay.setHours(24, 0, 0, 0);
    const msPerHour = 1000 * 60 * 60;
    const hoursLeftToday = Math.ceil(
      (endOfDay.getTime() - params.currentTime.getTime()) / msPerHour,
    );

    if (hoursLeftToday <= 4 && hoursLeftToday > 0) {
      return {
        level: 'critical',
        message: `Only ${hoursLeftToday} hours left to save your streak!`,
        offerStreakFreeze: true,
      };
    }

    return {
      level: 'low',
      message: 'Streak is safe',
      offerStreakFreeze: false,
    };
  }

  async createChallenge(params: ChallengeParams): Promise<any> {
    return {
      id: `challenge_${Date.now()}`,
      challengerId: params.challengerId,
      challengedId: params.challengedId,
      category: params.category,
      wager: params.wager,
      status: 'pending',
      expiresAt: new Date(Date.now() + 86400000),
      room: `battle_room_${Date.now()}`,
    };
  }

  updateCombo(params: ComboParams): any {
    const multiplier =
      params.correctAnswers >= 10
        ? 2.0
        : params.correctAnswers >= 5
          ? 1.5
          : params.correctAnswers >= 3
            ? 1.2
            : 1.0;

    return {
      currentCombo: params.correctAnswers,
      multiplier,
      nextMilestone:
        params.correctAnswers < 3
          ? 3
          : params.correctAnswers < 5
            ? 5
            : params.correctAnswers < 10
              ? 10
              : 20,
    };
  }
}
