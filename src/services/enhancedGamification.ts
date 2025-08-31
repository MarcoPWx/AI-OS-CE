// src/services/enhancedGamification.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import AnalyticsService from './analyticsService';

// Trust-first gamification patterns inspired by Harvest.ai
interface UserState {
  // Core stats
  xp: number;
  level: number;
  streak: number;
  combo: number;

  // Trust metrics
  trustScore: number;
  accuracyHistory: number[];
  learningVelocity: number;
  consistencyScore: number;

  // Psychological state
  confidenceLevel: number;
  motivationState: 'exploring' | 'focused' | 'struggling' | 'mastering';
  lastActiveTime: number;

  // Achievements
  achievements: Achievement[];
  milestones: Milestone[];

  // Adaptive settings
  difficultyPreference: 'adaptive' | 'challenging' | 'comfortable';
  feedbackStyle: 'encouraging' | 'direct' | 'detailed';
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt: number;
  category: string;
}

interface Milestone {
  id: string;
  name: string;
  progress: number;
  target: number;
  reward: string;
  category: string;
}

interface LearningMoment {
  timestamp: number;
  category: string;
  difficulty: number;
  accuracy: number;
  responseTime: number;
  confidenceLevel: number;
}

class EnhancedGamificationService {
  private static instance: EnhancedGamificationService;
  private userState: UserState | null = null;
  private learningHistory: LearningMoment[] = [];

  // Trust-building constants
  private readonly TRUST_THRESHOLDS = {
    TRANSPARENT: 0.8, // Show honest feedback
    SUPPORTIVE: 0.6, // Provide encouragement
    ADAPTIVE: 0.4, // Adjust difficulty
    GENTLE: 0.2, // Be extra encouraging
  };

  // Psychological patterns from portfolio analysis
  private readonly MOTIVATION_PATTERNS = {
    exploring: {
      xpMultiplier: 1.0,
      encouragementLevel: 'high',
      difficultyRamp: 'gentle',
    },
    focused: {
      xpMultiplier: 1.2,
      encouragementLevel: 'moderate',
      difficultyRamp: 'steady',
    },
    struggling: {
      xpMultiplier: 0.8,
      encouragementLevel: 'maximum',
      difficultyRamp: 'reduced',
    },
    mastering: {
      xpMultiplier: 1.5,
      encouragementLevel: 'achievement-focused',
      difficultyRamp: 'accelerated',
    },
  };

  public static getInstance(): EnhancedGamificationService {
    if (!EnhancedGamificationService.instance) {
      EnhancedGamificationService.instance = new EnhancedGamificationService();
    }
    return EnhancedGamificationService.instance;
  }

  async initialize(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem('enhanced_user_state');
      if (stored) {
        this.userState = JSON.parse(stored);
      } else {
        this.userState = this.createInitialState();
        await this.saveState();
      }

      const historyStored = await AsyncStorage.getItem('learning_history');
      if (historyStored) {
        this.learningHistory = JSON.parse(historyStored);
      }
    } catch (error) {
      console.warn('Failed to initialize enhanced gamification:', error);
      this.userState = this.createInitialState();
    }
  }

  private createInitialState(): UserState {
    return {
      xp: 0,
      level: 1,
      streak: 0,
      combo: 0,
      trustScore: 0.5, // Start neutral
      accuracyHistory: [],
      learningVelocity: 0,
      consistencyScore: 0,
      confidenceLevel: 0.5,
      motivationState: 'exploring',
      lastActiveTime: Date.now(),
      achievements: [],
      milestones: this.createInitialMilestones(),
      difficultyPreference: 'adaptive',
      feedbackStyle: 'encouraging',
    };
  }

  private createInitialMilestones(): Milestone[] {
    return [
      {
        id: 'first_correct',
        name: 'First Success',
        progress: 0,
        target: 1,
        reward: 'Confidence boost',
        category: 'learning',
      },
      {
        id: 'consistency_week',
        name: 'Week Warrior',
        progress: 0,
        target: 7,
        reward: 'Streak multiplier',
        category: 'consistency',
      },
      {
        id: 'accuracy_master',
        name: 'Precision Pro',
        progress: 0,
        target: 50,
        reward: 'Accuracy badge',
        category: 'skill',
      },
    ];
  }

  // Core gamification with trust-building
  async recordLearningMoment(
    category: string,
    isCorrect: boolean,
    responseTime: number,
    difficulty: number = 0.5,
  ): Promise<{
    xpGained: number;
    levelUp: boolean;
    achievements: Achievement[];
    feedback: string;
    trustImpact: number;
  }> {
    if (!this.userState) await this.initialize();

    const moment: LearningMoment = {
      timestamp: Date.now(),
      category,
      difficulty,
      accuracy: isCorrect ? 1 : 0,
      responseTime,
      confidenceLevel: this.userState!.confidenceLevel,
    };

    this.learningHistory.push(moment);

    // Update core stats
    const accuracy = isCorrect ? 1 : 0;
    this.userState!.accuracyHistory.push(accuracy);

    // Keep only last 50 for performance
    if (this.userState!.accuracyHistory.length > 50) {
      this.userState!.accuracyHistory = this.userState!.accuracyHistory.slice(-50);
    }

    // Calculate trust impact
    const trustImpact = this.calculateTrustImpact(moment);
    this.userState!.trustScore = Math.max(0, Math.min(1, this.userState!.trustScore + trustImpact));

    // Update motivation state
    this.updateMotivationState();

    // Calculate XP with psychological multipliers
    const baseXP = isCorrect ? 10 : 2; // Still reward effort on wrong answers
    const xpMultiplier = this.calculateXPMultiplier(moment);
    const xpGained = Math.floor(baseXP * xpMultiplier);

    const oldLevel = this.userState!.level;
    this.userState!.xp += xpGained;
    this.updateLevel();
    const levelUp = this.userState!.level > oldLevel;

    // Update combo and streak
    if (isCorrect) {
      this.userState!.combo += 1;
      this.updateStreak();
    } else {
      this.userState!.combo = 0;
    }

    // Check achievements
    const newAchievements = await this.checkAchievements();

    // Generate trust-appropriate feedback
    const feedback = this.generateFeedback(moment, isCorrect);

    // Update milestones
    this.updateMilestones(moment, isCorrect);

    await this.saveState();

    // Analytics
    AnalyticsService.trackEvent('learning_moment', {
      category,
      accuracy,
      xp_gained: xpGained,
      trust_score: this.userState!.trustScore,
      motivation_state: this.userState!.motivationState,
      level: this.userState!.level,
    });

    return {
      xpGained,
      levelUp,
      achievements: newAchievements,
      feedback,
      trustImpact,
    };
  }

  private calculateTrustImpact(moment: LearningMoment): number {
    // Trust builds through consistent, honest interaction
    let impact = 0;

    // Consistency builds trust
    const recentAccuracy = this.getRecentAccuracy();
    if (recentAccuracy > 0.7) impact += 0.01;
    if (recentAccuracy < 0.3) impact -= 0.005; // Gentle trust erosion

    // Regular usage builds trust
    const daysSinceLastActive =
      (Date.now() - this.userState!.lastActiveTime) / (1000 * 60 * 60 * 24);
    if (daysSinceLastActive < 1) impact += 0.005;
    if (daysSinceLastActive > 7) impact -= 0.01;

    // Appropriate difficulty builds trust
    const accuracyVsDifficulty = moment.accuracy / Math.max(0.1, moment.difficulty);
    if (accuracyVsDifficulty > 0.8 && accuracyVsDifficulty < 1.2) {
      impact += 0.01; // Sweet spot
    }

    return impact;
  }

  private updateMotivationState(): void {
    const recentAccuracy = this.getRecentAccuracy();
    const recentActivity = this.getRecentActivityLevel();

    if (recentAccuracy > 0.8 && recentActivity > 0.7) {
      this.userState!.motivationState = 'mastering';
    } else if (recentAccuracy > 0.6 && recentActivity > 0.5) {
      this.userState!.motivationState = 'focused';
    } else if (recentAccuracy < 0.4 || recentActivity < 0.3) {
      this.userState!.motivationState = 'struggling';
    } else {
      this.userState!.motivationState = 'exploring';
    }
  }

  private calculateXPMultiplier(moment: LearningMoment): number {
    const baseMultiplier = this.MOTIVATION_PATTERNS[this.userState!.motivationState].xpMultiplier;

    let multiplier = baseMultiplier;

    // Combo bonus (psychological variable reward)
    if (this.userState!.combo > 0) {
      multiplier *= 1 + Math.min(0.5, this.userState!.combo * 0.1);
    }

    // Difficulty bonus
    multiplier *= 0.8 + moment.difficulty * 0.4;

    // Trust bonus - higher trust = more generous rewards
    multiplier *= 0.9 + this.userState!.trustScore * 0.2;

    // Speed bonus for quick correct answers
    if (moment.accuracy === 1 && moment.responseTime < 5000) {
      multiplier *= 1.1;
    }

    return multiplier;
  }

  private generateFeedback(moment: LearningMoment, isCorrect: boolean): string {
    const trustLevel = this.userState!.trustScore;
    const motivationState = this.userState!.motivationState;

    if (isCorrect) {
      if (motivationState === 'struggling') {
        return "Great job! You're getting stronger with each question. 💪";
      } else if (motivationState === 'mastering') {
        return `Excellent! ${this.userState!.combo} in a row - you're on fire! 🔥`;
      } else if (trustLevel > this.TRUST_THRESHOLDS.TRANSPARENT) {
        return `Correct! Your accuracy is ${Math.round(this.getRecentAccuracy() * 100)}% - solid progress.`;
      } else {
        return 'Nice work! Keep it up! ✨';
      }
    } else {
      if (motivationState === 'struggling') {
        return "No worries - learning happens through mistakes. You've got this! 🌱";
      } else if (trustLevel > this.TRUST_THRESHOLDS.TRANSPARENT) {
        return `Not quite, but you're learning! Your overall accuracy is still strong at ${Math.round(this.getRecentAccuracy() * 100)}%.`;
      } else {
        return 'Close! Every attempt makes you stronger. 💫';
      }
    }
  }

  private async checkAchievements(): Promise<Achievement[]> {
    const newAchievements: Achievement[] = [];

    // Trust-based achievements
    if (this.userState!.trustScore > 0.8 && !this.hasAchievement('trusted_learner')) {
      newAchievements.push({
        id: 'trusted_learner',
        name: 'Trusted Learner',
        description: 'Built strong trust through consistent learning',
        icon: '🤝',
        rarity: 'rare',
        unlockedAt: Date.now(),
        category: 'trust',
      });
    }

    // Consistency achievements
    if (this.userState!.streak >= 7 && !this.hasAchievement('week_warrior')) {
      newAchievements.push({
        id: 'week_warrior',
        name: 'Week Warrior',
        description: 'Learned consistently for 7 days',
        icon: '📅',
        rarity: 'common',
        unlockedAt: Date.now(),
        category: 'consistency',
      });
    }

    // Skill achievements
    const recentAccuracy = this.getRecentAccuracy();
    if (
      recentAccuracy > 0.9 &&
      this.userState!.accuracyHistory.length >= 20 &&
      !this.hasAchievement('precision_master')
    ) {
      newAchievements.push({
        id: 'precision_master',
        name: 'Precision Master',
        description: 'Maintained 90%+ accuracy over 20 questions',
        icon: '🎯',
        rarity: 'epic',
        unlockedAt: Date.now(),
        category: 'skill',
      });
    }

    // Add new achievements to state
    this.userState!.achievements.push(...newAchievements);

    return newAchievements;
  }

  private updateMilestones(moment: LearningMoment, isCorrect: boolean): void {
    this.userState!.milestones.forEach((milestone) => {
      switch (milestone.id) {
        case 'first_correct':
          if (isCorrect && milestone.progress === 0) {
            milestone.progress = 1;
          }
          break;
        case 'consistency_week':
          if (this.userState!.streak > milestone.progress) {
            milestone.progress = Math.min(milestone.target, this.userState!.streak);
          }
          break;
        case 'accuracy_master':
          if (isCorrect) {
            milestone.progress = Math.min(milestone.target, milestone.progress + 1);
          }
          break;
      }
    });
  }

  // Helper methods
  private getRecentAccuracy(): number {
    if (this.userState!.accuracyHistory.length === 0) return 0.5;
    const recent = this.userState!.accuracyHistory.slice(-10);
    return recent.reduce((sum, acc) => sum + acc, 0) / recent.length;
  }

  private getRecentActivityLevel(): number {
    const recentMoments = this.learningHistory.slice(-20);
    if (recentMoments.length === 0) return 0;

    const timeSpan = Date.now() - recentMoments[0].timestamp;
    const daysSpan = Math.max(1, timeSpan / (1000 * 60 * 60 * 24));

    return Math.min(1, recentMoments.length / (daysSpan * 5)); // 5 questions per day = 1.0
  }

  private hasAchievement(id: string): boolean {
    return this.userState!.achievements.some((achievement) => achievement.id === id);
  }

  private updateLevel(): void {
    const xpForNextLevel = this.userState!.level * 100;
    if (this.userState!.xp >= xpForNextLevel) {
      this.userState!.level += 1;
      AnalyticsService.trackEvent('level_up', {
        new_level: this.userState!.level,
        total_xp: this.userState!.xp,
        trust_score: this.userState!.trustScore,
      });
    }
  }

  private updateStreak(): void {
    const now = Date.now();
    const lastActive = this.userState!.lastActiveTime;
    const hoursSinceLastActive = (now - lastActive) / (1000 * 60 * 60);

    if (hoursSinceLastActive < 48) {
      // 2-day grace period
      this.userState!.streak += 1;
    } else {
      this.userState!.streak = 1; // Reset but count today
    }

    this.userState!.lastActiveTime = now;
  }

  private async saveState(): Promise<void> {
    try {
      await AsyncStorage.setItem('enhanced_user_state', JSON.stringify(this.userState));
      await AsyncStorage.setItem(
        'learning_history',
        JSON.stringify(this.learningHistory.slice(-100)),
      );
    } catch (error) {
      console.warn('Failed to save enhanced gamification state:', error);
    }
  }

  // Public getters
  getUserState(): UserState | null {
    return this.userState;
  }

  getTrustScore(): number {
    return this.userState?.trustScore || 0;
  }

  getMotivationState(): string {
    return this.userState?.motivationState || 'exploring';
  }

  getPersonalizedEncouragement(): string {
    if (!this.userState) return 'Keep learning! 📚';

    const state = this.userState.motivationState;
    const trust = this.userState.trustScore;

    if (state === 'mastering') {
      return "You're absolutely crushing it! 🚀";
    } else if (state === 'struggling' && trust > 0.6) {
      return "Every expert was once a beginner. You're making real progress! 💪";
    } else if (state === 'focused') {
      return 'Great focus! Your consistency is paying off. 🎯';
    } else {
      return 'Every question makes you stronger! 🌟';
    }
  }
}

export default EnhancedGamificationService.getInstance();
