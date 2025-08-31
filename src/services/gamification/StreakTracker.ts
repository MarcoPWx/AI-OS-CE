/**
 * StreakTracker
 * Manages streak tracking, bonuses, and milestones
 */

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

interface StreakMilestone {
  days: number;
  achievement: string;
  xpBonus: number;
}

interface StreakBonus {
  minDays: number;
  multiplier: number;
}

export class StreakTracker {
  private static readonly MS_PER_DAY = 24 * 60 * 60 * 1000;

  private readonly streakBonuses: StreakBonus[] = [
    { minDays: 100, multiplier: 3.0 },
    { minDays: 60, multiplier: 2.5 },
    { minDays: 30, multiplier: 2.0 },
    { minDays: 14, multiplier: 1.7 },
    { minDays: 7, multiplier: 1.5 },
    { minDays: 3, multiplier: 1.1 },
    { minDays: 0, multiplier: 1.0 },
  ];

  private readonly milestones: StreakMilestone[] = [
    { days: 3, achievement: 'first_streak', xpBonus: 50 },
    { days: 7, achievement: 'week_warrior', xpBonus: 150 },
    { days: 14, achievement: 'fortnight_fighter', xpBonus: 300 },
    { days: 30, achievement: 'month_master', xpBonus: 500 },
    { days: 60, achievement: 'two_month_titan', xpBonus: 1000 },
    { days: 100, achievement: 'century_champion', xpBonus: 2000 },
    { days: 365, achievement: 'year_legend', xpBonus: 10000 },
  ];

  updateStreak(params: StreakParams): StreakResult {
    const daysDifference = this.calculateDaysDifference(params.lastActivity, params.currentDate);

    return this.determineStreakStatus(daysDifference);
  }

  getStreakBonus(streakDays: number): number {
    const bonus = this.streakBonuses.find((bonus) => streakDays >= bonus.minDays);

    return bonus?.multiplier || 1.0;
  }

  checkMilestones(currentStreak: number): StreakMilestone[] {
    return this.milestones.filter((milestone) => milestone.days === currentStreak);
  }

  getNextMilestone(currentStreak: number): StreakMilestone | null {
    return this.milestones.find((milestone) => milestone.days > currentStreak) || null;
  }

  calculateStreakProtectionCost(currentStreak: number): number {
    const BASE_COST = 100;
    const STREAK_TIER = 10;
    const multiplier = Math.floor(currentStreak / STREAK_TIER) + 1;

    return BASE_COST * multiplier;
  }

  private determineStreakStatus(daysDifference: number): StreakResult {
    if (daysDifference === 1) {
      return this.createStreakResult(true, 1, false);
    }

    if (daysDifference > 1) {
      return this.createStreakResult(false, 0, true);
    }

    // Same day
    return this.createStreakResult(true, 1, false);
  }

  private createStreakResult(
    isActive: boolean,
    currentStreak: number,
    streakLost: boolean,
  ): StreakResult {
    return { isActive, currentStreak, streakLost };
  }

  private calculateDaysDifference(startDate: Date, endDate: Date): number {
    const start = this.normalizeToMidnight(startDate);
    const end = this.normalizeToMidnight(endDate);

    return Math.floor((end.getTime() - start.getTime()) / StreakTracker.MS_PER_DAY);
  }

  private normalizeToMidnight(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }
}
