/**
 * AchievementEngine
 * Manages achievement definitions, checking, and progress tracking
 */

interface Achievement {
  id: string;
  name: string;
  description: string;
  category: string;
  xpReward: number;
  badge?: string;
  conditions: any;
}

interface AchievementCheckParams {
  userId: string;
  event: string;
  data: any;
}

export class AchievementEngine {
  private achievements: Map<string, Achievement>;

  constructor() {
    this.achievements = new Map();
    this.loadAchievements();
  }

  private loadAchievements(): void {
    const achievementDefinitions: Achievement[] = [
      {
        id: 'first_quiz',
        name: 'First Steps',
        description: 'Complete your first quiz',
        category: 'milestone',
        xpReward: 50,
        badge: 'bronze_star',
        conditions: { isFirstQuiz: true },
      },
      {
        id: 'perfect_score',
        name: 'Perfectionist',
        description: 'Get a perfect score',
        category: 'performance',
        xpReward: 100,
        badge: 'gold_star',
        conditions: { score: 100 },
      },
      {
        id: 'quiz_master',
        name: 'Quiz Master',
        description: 'Complete 100 quizzes',
        category: 'milestone',
        xpReward: 500,
        badge: 'diamond_crown',
        conditions: { totalQuizzes: 100 },
      },
      {
        id: 'speed_demon',
        name: 'Speed Demon',
        description: 'Complete a hard quiz in under 30 seconds with perfect score',
        category: 'performance',
        xpReward: 200,
        badge: 'lightning_bolt',
        conditions: { timeSpent: 30, score: 100, difficulty: 'hard' },
      },
      {
        id: 'week_warrior',
        name: 'Week Warrior',
        description: 'Maintain a 7-day streak',
        category: 'streak',
        xpReward: 150,
        badge: 'fire_seven',
        conditions: { streakDays: 7 },
      },
      {
        id: 'first_streak',
        name: 'Streak Started',
        description: 'Maintain a 3-day streak',
        category: 'streak',
        xpReward: 50,
        badge: 'fire_three',
        conditions: { streakDays: 3 },
      },
      {
        id: 'unstoppable',
        name: 'Unstoppable',
        description: 'Maintain a 30-day streak',
        category: 'streak',
        xpReward: 500,
        badge: 'fire_thirty',
        conditions: { streakDays: 30 },
      },
      {
        id: 'legendary',
        name: 'Legendary',
        description: 'Maintain a 100-day streak',
        category: 'streak',
        xpReward: 2000,
        badge: 'fire_hundred',
        conditions: { streakDays: 100 },
      },
      {
        id: 'knowledge_seeker',
        name: 'Knowledge Seeker',
        description: 'Complete 1000 quizzes',
        category: 'milestone',
        xpReward: 2000,
        badge: 'scholar_hat',
        conditions: { totalQuizzes: 1000 },
      },
    ];

    achievementDefinitions.forEach((achievement) => {
      this.achievements.set(achievement.id, achievement);
    });
  }

  async checkAchievements(params: AchievementCheckParams): Promise<Achievement[]> {
    const unlockedAchievements: Achievement[] = [];

    for (const [id, achievement] of this.achievements) {
      if (this.checkConditions({ achievementId: id, data: params.data })) {
        unlockedAchievements.push(achievement);
      }
    }

    return unlockedAchievements;
  }

  checkConditions(params: { achievementId: string; data: any }): boolean {
    const achievement = this.achievements.get(params.achievementId);
    if (!achievement) return false;

    const conditions = achievement.conditions;

    // Check all conditions
    for (const [key, value] of Object.entries(conditions)) {
      if (key === 'timeSpent') {
        // For time conditions, check if actual time is less than or equal
        if (params.data[key] > value) return false;
      } else if (key === 'streakDays' || key === 'totalQuizzes') {
        // For cumulative conditions, check if value is reached
        if (params.data[key] < value) return false;
      } else {
        // For exact match conditions
        if (params.data[key] !== value) return false;
      }
    }

    return true;
  }

  getAllAchievements(): Achievement[] {
    return Array.from(this.achievements.values());
  }

  getProgress(params: { achievementId: string; userId: string }): any {
    const achievement = this.achievements.get(params.achievementId);
    if (!achievement) return null;

    // Simulate progress tracking
    const current = Math.floor(Math.random() * 50);
    const required = achievement.conditions.totalQuizzes || 100;
    const percentage = (current / required) * 100;

    return {
      current,
      required,
      percentage,
    };
  }
}
