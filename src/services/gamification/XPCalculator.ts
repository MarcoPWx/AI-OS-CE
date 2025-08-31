/**
 * XPCalculator
 * Clean implementation with proper abstraction and no magic numbers
 */

interface LevelProgress {
  current: number;
  needed: number;
  percentage: number;
}

interface LevelRequirement {
  level: number;
  totalXPRequired: number;
  xpToNext: number;
}

enum Difficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
  EXPERT = 'expert',
}

type DifficultyMultiplier = {
  [key in Difficulty]: number;
};

export class XPCalculator {
  private static readonly BASE_XP = 100;
  private static readonly LEVEL_CAP = 100;

  private readonly difficultyMultipliers: DifficultyMultiplier = {
    [Difficulty.EASY]: 0.8,
    [Difficulty.MEDIUM]: 1.0,
    [Difficulty.HARD]: 1.5,
    [Difficulty.EXPERT]: 2.0,
  };

  private readonly levelRequirements: Map<number, LevelRequirement>;

  constructor() {
    this.levelRequirements = this.initializeLevelRequirements();
  }

  /**
   * Initialize level requirements with a clean progression curve
   */
  private initializeLevelRequirements(): Map<number, LevelRequirement> {
    const requirements = new Map<number, LevelRequirement>();
    let cumulativeXP = 0;

    for (let level = 1; level <= XPCalculator.LEVEL_CAP; level++) {
      const xpToNext = this.calculateXPForLevel(level);
      requirements.set(level, {
        level,
        totalXPRequired: cumulativeXP,
        xpToNext,
      });
      cumulativeXP += xpToNext;
    }

    return requirements;
  }

  /**
   * Calculate XP needed for a specific level using a growth formula
   */
  private calculateXPForLevel(level: number): number {
    // Use a tiered system for cleaner progression
    const tier = this.getLevelTier(level);
    const baseMultiplier = this.getTierMultiplier(tier);

    return Math.floor(XPCalculator.BASE_XP * baseMultiplier);
  }

  /**
   * Determine which tier a level belongs to
   */
  private getLevelTier(level: number): 'beginner' | 'intermediate' | 'advanced' | 'expert' {
    if (level <= 5) return 'beginner';
    if (level <= 20) return 'intermediate';
    if (level <= 60) return 'advanced';
    return 'expert';
  }

  /**
   * Get multiplier for each tier
   */
  private getTierMultiplier(tier: string): number {
    const multipliers = {
      beginner: 1.0, // 100 XP per level (levels 1-5)
      intermediate: 1.5, // 150 XP per level (levels 6-20)
      advanced: 6.0, // 600 XP per level (levels 21-60)
      expert: 12.0, // 1200 XP per level (levels 61+)
    } as const;
    return multipliers[tier as keyof typeof multipliers] ?? 1.0;
  }

  /**
   * Get current level from total XP
   */
  getLevelFromXP(totalXP: number): number {
    if (totalXP <= 0) return 1;
    // Use a simple base progression for level calculation to keep feedback frequent
    const level = Math.floor(totalXP / XPCalculator.BASE_XP) + 1;
    return Math.min(level, XPCalculator.LEVEL_CAP);
  }

  /**
   * Get XP needed for next level
   */
  getXPForNextLevel(currentLevel: number): number {
    const requirement = this.levelRequirements.get(currentLevel);
    return requirement?.xpToNext ?? XPCalculator.BASE_XP;
  }

  /**
   * Get difficulty multiplier for XP calculations
   */
  getDifficultyMultiplier(difficulty?: string): number {
    if (!difficulty) return 1.0;
    const normalizedDifficulty = difficulty.toLowerCase() as Difficulty;
    return this.difficultyMultipliers[normalizedDifficulty] ?? 1.0;
  }

  /**
   * Calculate progress towards next level
   */
  calculateProgressToNextLevel(totalXP: number): LevelProgress {
    const currentLevel = this.getLevelFromXP(totalXP);
    const currentRequirement = this.levelRequirements.get(currentLevel);
    const nextRequirement = this.levelRequirements.get(currentLevel + 1);

    if (!currentRequirement || !nextRequirement) {
      return { current: 0, needed: 100, percentage: 0 };
    }

    const current = totalXP - currentRequirement.totalXPRequired;
    const needed = currentRequirement.xpToNext;
    const percentage = this.calculatePercentage(current, needed);

    return { current, needed, percentage };
  }

  /**
   * Safe percentage calculation with bounds
   */
  private calculatePercentage(current: number, total: number): number {
    if (total <= 0) return 0;

    const percentage = (current / total) * 100;
    return Math.min(100, Math.max(0, percentage));
  }

  /**
   * Get total XP required to reach a specific level
   */
  getTotalXPForLevel(targetLevel: number): number {
    const requirement = this.levelRequirements.get(targetLevel);
    return requirement?.totalXPRequired ?? 0;
  }
}
