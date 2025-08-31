import { supabase } from '../lib/supabase';
import { Category, UserProfile, CategoryProgress, Achievement } from '../types/domain';
import authService from './authService';

/**
 * Smart Unlocking & Progression Service
 * Implements mastery-based unlocking instead of simple completion
 * Based on research: Progressive unlocking with clear feedback drives engagement
 */
export class ProgressionUnlockService {
  private static instance: ProgressionUnlockService;

  // Unlocking configuration based on research
  private readonly unlockConfig = {
    // Category unlocking tiers
    categoryTiers: [
      { tier: 1, requiredLevel: 1, categories: ['basics', 'introduction'] },
      { tier: 2, requiredLevel: 3, categories: ['elementary', 'fundamentals'] },
      { tier: 3, requiredLevel: 5, categories: ['intermediate', 'core'] },
      { tier: 4, requiredLevel: 8, categories: ['advanced', 'specialized'] },
      { tier: 5, requiredLevel: 12, categories: ['expert', 'mastery'] },
    ],

    // Feature unlocking milestones
    featureUnlocks: {
      dailyChallenge: { type: 'level', value: 2 },
      powerUps: { type: 'questions', value: 20 },
      multiplayer: { type: 'accuracy', value: 70 },
      leaderboards: { type: 'dailyChallenge', value: 1 },
      customCategories: { type: 'level', value: 10 },
      achievements: { type: 'questions', value: 10 },
      streakFreeze: { type: 'streak', value: 3 },
      hintsSystem: { type: 'level', value: 3 },
      speedBonus: { type: 'perfectQuizzes', value: 2 },
    },

    // Mastery requirements for progression
    masteryLevels: {
      attempted: { minAccuracy: 0, minQuestions: 1, stars: 0 },
      familiar: { minAccuracy: 60, minQuestions: 5, stars: 1 },
      proficient: { minAccuracy: 75, minQuestions: 10, stars: 2 },
      advanced: { minAccuracy: 85, minQuestions: 20, stars: 3 },
      mastered: { minAccuracy: 95, minQuestions: 30, stars: 5 },
    },

    // Progressive content unlocking
    contentUnlocks: {
      questionDifficulty: [
        { level: 1, unlocks: [1, 2] }, // Easy questions
        { level: 3, unlocks: [1, 2, 3] }, // + Medium questions
        { level: 5, unlocks: [1, 2, 3, 4] }, // + Hard questions
        { level: 8, unlocks: [1, 2, 3, 4, 5] }, // + Expert questions
      ],
      questionTypes: [
        { level: 1, types: ['multiple_choice'] },
        { level: 4, types: ['multiple_choice', 'true_false'] },
        { level: 7, types: ['multiple_choice', 'true_false', 'fill_blank'] },
        { level: 10, types: ['all'] },
      ],
      sessionModes: [
        { level: 1, modes: ['practice'] },
        { level: 2, modes: ['practice', 'daily'] },
        { level: 5, modes: ['practice', 'daily', 'challenge'] },
        { level: 8, modes: ['practice', 'daily', 'challenge', 'battle'] },
      ],
    },
  };

  private constructor() {}

  static getInstance(): ProgressionUnlockService {
    if (!ProgressionUnlockService.instance) {
      ProgressionUnlockService.instance = new ProgressionUnlockService();
    }
    return ProgressionUnlockService.instance;
  }

  /**
   * Get user's current unlocked content and features
   */
  async getUserUnlocks(userId: string): Promise<UserUnlocks> {
    try {
      const user = await this.getUserProfile(userId);
      const progress = await this.getUserProgress(userId);

      return {
        level: user.level,
        unlockedCategories: await this.getUnlockedCategories(user.level),
        unlockedFeatures: this.getUnlockedFeatures(user, progress),
        unlockedContent: this.getUnlockedContent(user.level),
        nextUnlocks: await this.getNextUnlocks(user),
        masteryProgress: await this.getMasteryProgress(userId),
      };
    } catch (error) {
      console.error('Error getting user unlocks:', error);
      throw error;
    }
  }

  /**
   * Check if specific content/feature is unlocked
   */
  async isUnlocked(
    userId: string,
    unlockType: 'category' | 'feature' | 'content',
    identifier: string,
  ): Promise<boolean> {
    try {
      const unlocks = await this.getUserUnlocks(userId);

      switch (unlockType) {
        case 'category':
          return unlocks.unlockedCategories.some((cat) => cat.slug === identifier);
        case 'feature':
          return unlocks.unlockedFeatures[identifier] === true;
        case 'content':
          return this.checkContentUnlock(unlocks.unlockedContent, identifier);
        default:
          return false;
      }
    } catch (error) {
      console.error('Error checking unlock status:', error);
      return false;
    }
  }

  /**
   * Process unlock progression after completing an action
   */
  async processUnlockProgression(userId: string, action: UnlockAction): Promise<UnlockResult> {
    try {
      const before = await this.getUserUnlocks(userId);

      // Update relevant metrics based on action
      await this.updateProgressMetrics(userId, action);

      // Check for new unlocks
      const after = await this.getUserUnlocks(userId);
      const newUnlocks = this.compareUnlocks(before, after);

      // Process achievements
      const achievements = await this.checkUnlockAchievements(userId, newUnlocks);

      // Send notifications for new unlocks
      if (newUnlocks.length > 0) {
        await this.notifyNewUnlocks(userId, newUnlocks);
      }

      return {
        newUnlocks,
        achievements,
        currentLevel: after.level,
        nextMilestone: after.nextUnlocks[0],
      };
    } catch (error) {
      console.error('Error processing unlock progression:', error);
      throw error;
    }
  }

  /**
   * Get unlocked categories based on user level
   */
  private async getUnlockedCategories(userLevel: number): Promise<Category[]> {
    try {
      // Get all categories
      const { data: allCategories } = await supabase
        .from('categories')
        .select('*')
        .order('required_level', { ascending: true });

      if (!allCategories) return [];

      // Filter based on user level
      const unlockedCategories = allCategories.filter((category) => {
        const requiredLevel = category.required_level || 1;
        return userLevel >= requiredLevel;
      });

      // Add tier-based categories
      const unlockedTiers = this.unlockConfig.categoryTiers.filter(
        (tier) => userLevel >= tier.requiredLevel,
      );

      // Additional filtering based on tiers
      const tierCategories = unlockedCategories.filter((category) => {
        const categoryTier = this.getCategoryTier(category.slug);
        return unlockedTiers.some((tier) => tier.tier >= categoryTier);
      });

      return tierCategories;
    } catch (error) {
      console.error('Error getting unlocked categories:', error);
      return [];
    }
  }

  /**
   * Get unlocked features based on user progress
   */
  private getUnlockedFeatures(
    user: UserProfile,
    progress: Map<string, CategoryProgress>,
  ): Record<string, boolean> {
    const features: Record<string, boolean> = {};

    for (const [feature, requirement] of Object.entries(this.unlockConfig.featureUnlocks)) {
      features[feature] = this.checkFeatureRequirement(user, progress, requirement);
    }

    return features;
  }

  /**
   * Check if feature requirement is met
   */
  private checkFeatureRequirement(
    user: UserProfile,
    progress: Map<string, CategoryProgress>,
    requirement: { type: string; value: number },
  ): boolean {
    switch (requirement.type) {
      case 'level':
        return user.level >= requirement.value;

      case 'questions':
        return user.stats.totalQuestionsAnswered >= requirement.value;

      case 'accuracy':
        return user.stats.accuracy >= requirement.value;

      case 'streak':
        return user.currentStreak >= requirement.value;

      case 'perfectQuizzes':
        return user.stats.perfectQuizzes >= requirement.value;

      case 'dailyChallenge':
        return user.stats.dailyChallengesCompleted >= requirement.value;

      default:
        return false;
    }
  }

  /**
   * Get unlocked content based on level
   */
  private getUnlockedContent(userLevel: number): UnlockedContent {
    const content: UnlockedContent = {
      difficulties: [],
      questionTypes: [],
      sessionModes: [],
      powerUps: [],
    };

    // Unlock difficulties
    const difficultyUnlock = this.unlockConfig.contentUnlocks.questionDifficulty
      .filter((d) => userLevel >= d.level)
      .pop();
    if (difficultyUnlock) {
      content.difficulties = difficultyUnlock.unlocks;
    }

    // Unlock question types
    const typeUnlock = this.unlockConfig.contentUnlocks.questionTypes
      .filter((t) => userLevel >= t.level)
      .pop();
    if (typeUnlock) {
      content.questionTypes = typeUnlock.types;
    }

    // Unlock session modes
    const modeUnlock = this.unlockConfig.contentUnlocks.sessionModes
      .filter((m) => userLevel >= m.level)
      .pop();
    if (modeUnlock) {
      content.sessionModes = modeUnlock.modes;
    }

    // Unlock power-ups based on level
    if (userLevel >= 5) content.powerUps.push('fifty_fifty');
    if (userLevel >= 8) content.powerUps.push('skip');
    if (userLevel >= 10) content.powerUps.push('time_freeze');
    if (userLevel >= 12) content.powerUps.push('double_xp');
    if (userLevel >= 15) content.powerUps.push('hint');

    return content;
  }

  /**
   * Get next unlocks preview
   */
  private async getNextUnlocks(user: UserProfile): Promise<NextUnlock[]> {
    const nextUnlocks: NextUnlock[] = [];

    // Check next level unlocks
    const nextLevel = user.level + 1;
    const nextLevelUnlocks = await this.getUnlockedCategories(nextLevel);
    const currentUnlocks = await this.getUnlockedCategories(user.level);

    const newCategories = nextLevelUnlocks.filter(
      (cat) => !currentUnlocks.some((c) => c.id === cat.id),
    );

    if (newCategories.length > 0) {
      nextUnlocks.push({
        type: 'category',
        name: newCategories[0].name,
        requirement: `Reach level ${nextLevel}`,
        progress: user.level / nextLevel,
        icon: '🏆',
      });
    }

    // Check next feature unlocks
    for (const [feature, req] of Object.entries(this.unlockConfig.featureUnlocks)) {
      if (!this.checkFeatureRequirement(user, new Map(), req)) {
        let progress = 0;
        let requirement = '';

        switch (req.type) {
          case 'level':
            progress = user.level / req.value;
            requirement = `Reach level ${req.value}`;
            break;
          case 'questions':
            progress = user.stats.totalQuestionsAnswered / req.value;
            requirement = `Answer ${req.value} questions`;
            break;
          case 'accuracy':
            progress = user.stats.accuracy / req.value;
            requirement = `Achieve ${req.value}% accuracy`;
            break;
        }

        if (progress < 1) {
          nextUnlocks.push({
            type: 'feature',
            name: this.getFeatureName(feature),
            requirement,
            progress,
            icon: this.getFeatureIcon(feature),
          });
        }
      }
    }

    // Sort by progress (closest first)
    return nextUnlocks.sort((a, b) => b.progress - a.progress).slice(0, 3);
  }

  /**
   * Get mastery progress for all categories
   */
  private async getMasteryProgress(userId: string): Promise<MasteryProgress[]> {
    try {
      const { data: progress } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId);

      if (!progress) return [];

      return progress.map((p) => ({
        categoryId: p.category_id,
        categoryName: p.category_name,
        masteryLevel: p.mastery_level,
        accuracy: p.accuracy,
        questionsAnswered: p.questions_answered,
        starsEarned: this.calculateStars(p),
        nextMilestone: this.getNextMasteryMilestone(p),
      }));
    } catch (error) {
      console.error('Error getting mastery progress:', error);
      return [];
    }
  }

  /**
   * Calculate stars earned for a category
   */
  private calculateStars(progress: any): number {
    const levels = this.unlockConfig.masteryLevels;

    if (
      progress.accuracy >= levels.mastered.minAccuracy &&
      progress.questions_answered >= levels.mastered.minQuestions
    ) {
      return 5;
    } else if (
      progress.accuracy >= levels.advanced.minAccuracy &&
      progress.questions_answered >= levels.advanced.minQuestions
    ) {
      return 3;
    } else if (
      progress.accuracy >= levels.proficient.minAccuracy &&
      progress.questions_answered >= levels.proficient.minQuestions
    ) {
      return 2;
    } else if (
      progress.accuracy >= levels.familiar.minAccuracy &&
      progress.questions_answered >= levels.familiar.minQuestions
    ) {
      return 1;
    }

    return 0;
  }

  /**
   * Get next mastery milestone for a category
   */
  private getNextMasteryMilestone(progress: any): string {
    const levels = this.unlockConfig.masteryLevels;

    if (progress.accuracy < levels.familiar.minAccuracy) {
      return `Achieve ${levels.familiar.minAccuracy}% accuracy`;
    } else if (progress.accuracy < levels.proficient.minAccuracy) {
      return `Achieve ${levels.proficient.minAccuracy}% accuracy`;
    } else if (progress.accuracy < levels.advanced.minAccuracy) {
      return `Achieve ${levels.advanced.minAccuracy}% accuracy`;
    } else if (progress.accuracy < levels.mastered.minAccuracy) {
      return `Achieve ${levels.mastered.minAccuracy}% accuracy`;
    }

    return 'Category mastered! 🎉';
  }

  /**
   * Helper methods
   */
  private async getUserProfile(userId: string): Promise<UserProfile> {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();

    return data as UserProfile;
  }

  private async getUserProgress(userId: string): Promise<Map<string, CategoryProgress>> {
    const { data } = await supabase.from('user_progress').select('*').eq('user_id', userId);

    const progressMap = new Map<string, CategoryProgress>();
    if (data) {
      data.forEach((p) => progressMap.set(p.category_id, p as CategoryProgress));
    }

    return progressMap;
  }

  private getCategoryTier(categorySlug: string): number {
    // Implement logic to determine category tier based on slug
    if (categorySlug.includes('basic') || categorySlug.includes('intro')) return 1;
    if (categorySlug.includes('elementary')) return 2;
    if (categorySlug.includes('intermediate')) return 3;
    if (categorySlug.includes('advanced')) return 4;
    if (categorySlug.includes('expert') || categorySlug.includes('master')) return 5;
    return 2; // Default
  }

  private checkContentUnlock(content: UnlockedContent, identifier: string): boolean {
    // Check if specific content is unlocked
    if (content.difficulties.includes(parseInt(identifier))) return true;
    if (content.questionTypes.includes(identifier)) return true;
    if (content.sessionModes.includes(identifier)) return true;
    if (content.powerUps.includes(identifier)) return true;
    return false;
  }

  private compareUnlocks(before: UserUnlocks, after: UserUnlocks): NewUnlock[] {
    const newUnlocks: NewUnlock[] = [];

    // Check for new categories
    after.unlockedCategories.forEach((cat) => {
      if (!before.unlockedCategories.some((c) => c.id === cat.id)) {
        newUnlocks.push({
          type: 'category',
          id: cat.id,
          name: cat.name,
          description: `New category unlocked: ${cat.name}`,
        });
      }
    });

    // Check for new features
    Object.entries(after.unlockedFeatures).forEach(([feature, unlocked]) => {
      if (unlocked && !before.unlockedFeatures[feature]) {
        newUnlocks.push({
          type: 'feature',
          id: feature,
          name: this.getFeatureName(feature),
          description: `New feature unlocked: ${this.getFeatureName(feature)}`,
        });
      }
    });

    return newUnlocks;
  }

  private async updateProgressMetrics(userId: string, action: UnlockAction): Promise<void> {
    // Update user metrics based on action type
    await supabase.rpc('update_user_metrics', {
      user_id: userId,
      action_type: action.type,
      action_value: action.value,
    });
  }

  private async checkUnlockAchievements(
    userId: string,
    newUnlocks: NewUnlock[],
  ): Promise<Achievement[]> {
    // Check if any achievements were earned from unlocks
    const achievements: Achievement[] = [];

    if (newUnlocks.length >= 3) {
      // Triple unlock achievement
      achievements.push({
        id: 'triple_unlock',
        name: 'Unlock Master',
        description: 'Unlocked 3 items at once',
        icon: '🔓',
        category: 'special',
        tier: 'silver',
        criteria: { type: 'unlock', target: 3 },
        xpReward: 50,
        starReward: 5,
        isSecret: false,
        rarity: 'rare',
      });
    }

    return achievements;
  }

  private async notifyNewUnlocks(userId: string, newUnlocks: NewUnlock[]): Promise<void> {
    // Send notifications for new unlocks
    for (const unlock of newUnlocks) {
      await supabase.from('notifications').insert({
        user_id: userId,
        type: 'unlock',
        title: `New ${unlock.type} unlocked!`,
        message: unlock.description,
        data: { unlockId: unlock.id },
      });
    }
  }

  private getFeatureName(feature: string): string {
    const names: Record<string, string> = {
      dailyChallenge: 'Daily Challenge',
      powerUps: 'Power-Ups',
      multiplayer: 'Multiplayer Mode',
      leaderboards: 'Leaderboards',
      customCategories: 'Custom Categories',
      achievements: 'Achievements',
      streakFreeze: 'Streak Freeze',
      hintsSystem: 'Hints System',
      speedBonus: 'Speed Bonus',
    };
    return names[feature] || feature;
  }

  private getFeatureIcon(feature: string): string {
    const icons: Record<string, string> = {
      dailyChallenge: '📅',
      powerUps: '⚡',
      multiplayer: '👥',
      leaderboards: '🏆',
      customCategories: '📚',
      achievements: '🏅',
      streakFreeze: '❄️',
      hintsSystem: '💡',
      speedBonus: '⚡',
    };
    return icons[feature] || '🎯';
  }
}

// Type definitions
interface UserUnlocks {
  level: number;
  unlockedCategories: Category[];
  unlockedFeatures: Record<string, boolean>;
  unlockedContent: UnlockedContent;
  nextUnlocks: NextUnlock[];
  masteryProgress: MasteryProgress[];
}

interface UnlockedContent {
  difficulties: number[];
  questionTypes: string[];
  sessionModes: string[];
  powerUps: string[];
}

interface NextUnlock {
  type: string;
  name: string;
  requirement: string;
  progress: number;
  icon: string;
}

interface MasteryProgress {
  categoryId: string;
  categoryName: string;
  masteryLevel: string;
  accuracy: number;
  questionsAnswered: number;
  starsEarned: number;
  nextMilestone: string;
}

interface UnlockAction {
  type: 'quiz_complete' | 'level_up' | 'achievement' | 'daily_challenge';
  value: any;
}

interface UnlockResult {
  newUnlocks: NewUnlock[];
  achievements: Achievement[];
  currentLevel: number;
  nextMilestone: NextUnlock | undefined;
}

interface NewUnlock {
  type: string;
  id: string;
  name: string;
  description: string;
}

export default ProgressionUnlockService.getInstance();
