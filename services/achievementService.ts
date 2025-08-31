import { supabase } from '../lib/supabase';
import {
  GetAchievementsRequest,
  GetAchievementsResponse,
  AchievementWithProgress,
} from '../types/api';
import { Achievement, UserAchievement, QuizSession } from '../types/domain';
import { ApiErrorHandler, CacheManager } from '../lib/api';
import authService from './authService';

interface AchievementCriteria {
  type:
    | 'quiz_count'
    | 'correct_count'
    | 'streak'
    | 'perfect'
    | 'speed'
    | 'category_master'
    | 'social'
    | 'special'
    | 'time_based';
  target: number;
  timeframe?: 'daily' | 'weekly' | 'monthly' | 'all-time';
  categoryId?: string;
  condition?: string;
}

export class AchievementService {
  private static instance: AchievementService;
  private userAchievements: Map<string, UserAchievement> = new Map();
  private allAchievements: Achievement[] = [];

  private constructor() {
    this.loadAchievements();
  }

  static getInstance(): AchievementService {
    if (!AchievementService.instance) {
      AchievementService.instance = new AchievementService();
    }
    return AchievementService.instance;
  }

  // Load all achievements
  private async loadAchievements(): Promise<void> {
    try {
      const { data } = await supabase
        .from('achievements')
        .select('*')
        .order('category', { ascending: true })
        .order('tier', { ascending: true });

      if (data) {
        this.allAchievements = data.map((a) => ({
          id: a.id,
          name: a.name,
          description: a.description,
          icon: a.icon,
          category: a.category,
          tier: a.tier,
          criteria: a.criteria,
          xpReward: a.xp_reward,
          starReward: a.star_reward,
          badgeUrl: a.badge_url,
          isSecret: a.is_secret,
          rarity: a.rarity,
        }));
      }
    } catch (error) {
      console.error('Error loading achievements:', error);
    }
  }

  // Get user achievements
  async getAchievements(request: GetAchievementsRequest): Promise<GetAchievementsResponse> {
    try {
      const user = await authService.getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      // Check cache
      const cacheKey = `achievements_${user.id}_${request.category || 'all'}`;
      const cached = await CacheManager.get<GetAchievementsResponse>(cacheKey);
      if (cached) return cached;

      // Get user's achievement progress
      const { data: userProgress } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', user.id);

      // Create map of user progress
      const progressMap = new Map<string, any>();
      userProgress?.forEach((up) => {
        progressMap.set(up.achievement_id, {
          progress: up.progress,
          isCompleted: true,
          unlockedAt: new Date(up.unlocked_at),
        });
      });

      // Filter achievements based on request
      let achievements = this.allAchievements;

      if (request.category) {
        achievements = achievements.filter((a) => a.category === request.category);
      }

      if (!request.includeSecret) {
        achievements = achievements.filter((a) => !a.isSecret || progressMap.has(a.id));
      }

      if (request.onlyUnlocked) {
        achievements = achievements.filter((a) => progressMap.has(a.id));
      }

      // Add user progress to achievements
      const achievementsWithProgress: AchievementWithProgress[] = achievements.map((a) => ({
        ...a,
        userProgress: progressMap.get(a.id) || {
          progress: 0,
          isCompleted: false,
        },
      }));

      // Calculate stats
      const totalUnlocked = userProgress?.length || 0;
      const totalAvailable = this.allAchievements.filter((a) => !a.isSecret).length;
      const totalXpEarned =
        userProgress?.reduce((sum, up) => {
          const achievement = this.allAchievements.find((a) => a.id === up.achievement_id);
          return sum + (achievement?.xpReward || 0);
        }, 0) || 0;
      const totalStarsEarned =
        userProgress?.reduce((sum, up) => {
          const achievement = this.allAchievements.find((a) => a.id === up.achievement_id);
          return sum + (achievement?.starReward || 0);
        }, 0) || 0;

      const response: GetAchievementsResponse = {
        achievements: achievementsWithProgress,
        totalUnlocked,
        totalAvailable,
        totalXpEarned,
        totalStarsEarned,
      };

      // Cache for 5 minutes
      await CacheManager.set(cacheKey, response, 300000);

      return response;
    } catch (error) {
      throw ApiErrorHandler.handle(error);
    }
  }

  // Check achievements after quiz completion
  async checkQuizAchievements(userId: string, session: QuizSession): Promise<Achievement[]> {
    const unlockedAchievements: Achievement[] = [];

    try {
      // Get user stats
      const { data: userStats } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (!userStats) return [];

      // Get user's quiz history
      const { data: quizHistory } = await supabase
        .from('quiz_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('completed_at', { ascending: false })
        .limit(100);

      // Check each achievement
      for (const achievement of this.allAchievements) {
        // Skip if already unlocked
        if (await this.isAchievementUnlocked(userId, achievement.id)) {
          continue;
        }

        // Check if criteria met
        const criteriaMet = await this.checkCriteria(
          achievement,
          userStats,
          session,
          quizHistory || [],
        );

        if (criteriaMet) {
          // Unlock achievement
          await this.unlockAchievement(userId, achievement);
          unlockedAchievements.push(achievement);
        }
      }

      return unlockedAchievements;
    } catch (error) {
      console.error('Error checking achievements:', error);
      return [];
    }
  }

  // Check if specific criteria is met
  private async checkCriteria(
    achievement: Achievement,
    userStats: any,
    currentSession: QuizSession,
    history: any[],
  ): Promise<boolean> {
    const criteria = achievement.criteria as AchievementCriteria;

    switch (criteria.type) {
      case 'quiz_count':
        return history.length >= criteria.target;

      case 'correct_count':
        const totalCorrect = history.reduce((sum, s) => sum + s.correct_answers, 0);
        return totalCorrect >= criteria.target;

      case 'streak':
        return userStats.current_streak >= criteria.target;

      case 'perfect':
        const perfectCount = history.filter(
          (s) => s.correct_answers === s.questions_answered,
        ).length;
        return perfectCount >= criteria.target;

      case 'speed':
        // Check if completed quiz under time limit
        if (currentSession.timeSpent < criteria.target) {
          return true;
        }
        break;

      case 'category_master':
        if (criteria.categoryId) {
          const categoryHistory = history.filter((s) => s.category_id === criteria.categoryId);
          const categoryAccuracy =
            categoryHistory.length > 0
              ? categoryHistory.reduce((sum, s) => sum + s.accuracy, 0) / categoryHistory.length
              : 0;
          return categoryAccuracy >= criteria.target && categoryHistory.length >= 10;
        }
        break;

      case 'social':
        // Check friend-related achievements
        const { count: friendCount } = await supabase
          .from('friends')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userStats.id)
          .eq('status', 'accepted');
        return (friendCount || 0) >= criteria.target;

      case 'special':
        // Special achievements with custom conditions
        return this.checkSpecialCriteria(achievement, userStats, currentSession);

      case 'time_based':
        // Check time-based achievements (daily, weekly, etc.)
        return this.checkTimeBasedCriteria(criteria, history);
    }

    return false;
  }

  // Check special achievement criteria
  private checkSpecialCriteria(
    achievement: Achievement,
    userStats: any,
    session: QuizSession,
  ): boolean {
    // Special conditions based on achievement ID
    switch (achievement.id) {
      case 'first_quiz':
        return true; // Always unlock on first quiz

      case 'night_owl':
        const hour = new Date().getHours();
        return hour >= 22 || hour <= 4;

      case 'early_bird':
        return new Date().getHours() >= 5 && new Date().getHours() <= 7;

      case 'comeback_kid':
        // Lost streak but started new one
        return userStats.current_streak === 1 && userStats.longest_streak > 7;

      case 'perfectionist':
        return session.accuracy === 100 && session.questionsAnswered >= 20;

      default:
        return false;
    }
  }

  // Check time-based criteria
  private checkTimeBasedCriteria(criteria: AchievementCriteria, history: any[]): boolean {
    const now = new Date();
    let startDate: Date;

    switch (criteria.timeframe) {
      case 'daily':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case 'weekly':
        const day = now.getDay();
        const diff = now.getDate() - day + (day === 0 ? -6 : 1);
        startDate = new Date(now.setDate(diff));
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      default:
        return false;
    }

    const relevantHistory = history.filter((s) => new Date(s.completed_at) >= startDate);

    return relevantHistory.length >= criteria.target;
  }

  // Unlock achievement
  private async unlockAchievement(userId: string, achievement: Achievement): Promise<void> {
    try {
      // Insert into user_achievements
      await supabase.from('user_achievements').insert({
        user_id: userId,
        achievement_id: achievement.id,
        unlocked_at: new Date().toISOString(),
        progress: {
          completed: true,
          unlockedAt: new Date().toISOString(),
        },
      });

      // Update user stats with rewards
      await supabase.rpc('update_user_stats', {
        user_id: userId,
        xp_to_add: achievement.xpReward,
        stars_to_add: achievement.starReward,
      });

      // Cache the unlocked achievement
      this.userAchievements.set(achievement.id, {
        achievementId: achievement.id,
        achievement,
        unlockedAt: new Date(),
        progress: 100,
        isCompleted: true,
      });

      // Send notification
      await this.sendAchievementNotification(userId, achievement);
    } catch (error) {
      console.error('Error unlocking achievement:', error);
    }
  }

  // Check if achievement is already unlocked
  private async isAchievementUnlocked(userId: string, achievementId: string): Promise<boolean> {
    // Check cache first
    if (this.userAchievements.has(achievementId)) {
      return true;
    }

    // Check database
    const { data } = await supabase
      .from('user_achievements')
      .select('id')
      .eq('user_id', userId)
      .eq('achievement_id', achievementId)
      .single();

    return !!data;
  }

  // Send achievement notification
  private async sendAchievementNotification(
    userId: string,
    achievement: Achievement,
  ): Promise<void> {
    try {
      await supabase.from('notifications').insert({
        user_id: userId,
        type: 'achievement',
        title: 'Achievement Unlocked!',
        message: `You've unlocked "${achievement.name}"! +${achievement.xpReward} XP, +${achievement.starReward} Stars`,
        data: {
          achievementId: achievement.id,
          achievementName: achievement.name,
          achievementIcon: achievement.icon,
          xpReward: achievement.xpReward,
          starReward: achievement.starReward,
        },
        read: false,
      });
    } catch (error) {
      console.error('Error sending achievement notification:', error);
    }
  }

  // Get achievement progress
  async getAchievementProgress(userId: string, achievementId: string): Promise<number> {
    try {
      const achievement = this.allAchievements.find((a) => a.id === achievementId);
      if (!achievement) return 0;

      // Check if already unlocked
      if (await this.isAchievementUnlocked(userId, achievementId)) {
        return 100;
      }

      // Calculate progress based on criteria
      const criteria = achievement.criteria as AchievementCriteria;

      switch (criteria.type) {
        case 'quiz_count':
          const { count: quizCount } = await supabase
            .from('quiz_sessions')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId);
          return Math.min(100, ((quizCount || 0) / criteria.target) * 100);

        case 'streak':
          const { data: profile } = await supabase
            .from('profiles')
            .select('current_streak')
            .eq('id', userId)
            .single();
          return Math.min(100, ((profile?.current_streak || 0) / criteria.target) * 100);

        default:
          return 0;
      }
    } catch (error) {
      console.error('Error getting achievement progress:', error);
      return 0;
    }
  }

  // Get next achievable achievements
  async getNextAchievements(userId: string, limit: number = 3): Promise<Achievement[]> {
    try {
      const { achievements } = await this.getAchievements({ onlyUnlocked: false });

      // Filter unlocked and secret achievements
      const available = achievements
        .filter((a) => !a.userProgress?.isCompleted && !a.isSecret)
        .sort((a, b) => {
          // Sort by progress (closest to completion first)
          const progressA = a.userProgress?.progress || 0;
          const progressB = b.userProgress?.progress || 0;
          return progressB - progressA;
        })
        .slice(0, limit);

      return available;
    } catch (error) {
      console.error('Error getting next achievements:', error);
      return [];
    }
  }

  // Get achievement by ID
  getAchievementById(achievementId: string): Achievement | undefined {
    return this.allAchievements.find((a) => a.id === achievementId);
  }

  // Get all achievements (for display)
  getAllAchievements(): Achievement[] {
    return this.allAchievements;
  }
}

export default AchievementService.getInstance();
