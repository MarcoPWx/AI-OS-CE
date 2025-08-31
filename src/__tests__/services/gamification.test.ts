/**
 * Gamification Service Tests
 * Following TDD - Tests written first, then implementation
 */

import {
  GamificationService,
  XPCalculator,
  AchievementEngine,
  StreakTracker,
  QuestManager,
  RewardDistributor,
} from '../../services/gamification';

describe('GamificationService', () => {
  let service: GamificationService;

  beforeEach(() => {
    service = new GamificationService();
  });

  describe('XP Calculation', () => {
    it('should calculate base XP for quiz completion', () => {
      const result = service.calculateXP({
        score: 80,
        timeSpent: 30,
        difficulty: 'medium',
        perfectScore: false,
      });

      expect(result.baseXP).toBe(10);
      expect(result.bonusXP).toBeGreaterThan(0);
      expect(result.totalXP).toBeGreaterThanOrEqual(10);
    });

    it('should apply multipliers for streaks', () => {
      const result = service.calculateXP({
        score: 100,
        timeSpent: 20,
        difficulty: 'hard',
        perfectScore: true,
        streakDays: 7,
      });

      expect(result.multipliers).toContain('streak');
      expect(result.streakMultiplier).toBe(1.5);
      expect(result.totalXP).toBeGreaterThan(50);
    });

    it('should apply variable rewards (slot machine)', () => {
      const results = Array.from({ length: 100 }, () =>
        service.calculateXP({
          score: 70,
          timeSpent: 40,
          difficulty: 'easy',
          perfectScore: false,
        }),
      );

      const multipliers = results.map((r) => r.variableMultiplier);
      expect(Math.max(...multipliers)).toBeGreaterThanOrEqual(2);
      expect(Math.min(...multipliers)).toBe(1);
    });
  });

  describe('Achievement System', () => {
    it('should check and grant first quiz achievement', async () => {
      const achievements = await service.checkAchievements({
        userId: 'user_123',
        event: 'quiz.completed',
        data: {
          isFirstQuiz: true,
          score: 60,
        },
      });

      expect(achievements).toContainEqual(
        expect.objectContaining({
          id: 'first_quiz',
          name: 'First Steps',
          xpReward: 50,
        }),
      );
    });

    it('should grant perfect score achievement', async () => {
      const achievements = await service.checkAchievements({
        userId: 'user_123',
        event: 'quiz.completed',
        data: {
          score: 100,
          difficulty: 'hard',
        },
      });

      expect(achievements).toContainEqual(
        expect.objectContaining({
          id: 'perfect_score',
          name: 'Perfectionist',
        }),
      );
    });

    it('should track milestone achievements', async () => {
      const achievements = await service.checkAchievements({
        userId: 'user_123',
        event: 'quiz.completed',
        data: {
          totalQuizzes: 100,
        },
      });

      expect(achievements).toContainEqual(
        expect.objectContaining({
          id: 'quiz_master',
          name: 'Quiz Master',
          xpReward: 500,
        }),
      );
    });
  });

  describe('Streak Management', () => {
    it('should track daily streaks', () => {
      const streak = service.updateStreak({
        userId: 'user_123',
        lastActivity: new Date('2025-08-28'),
        currentDate: new Date('2025-08-29'),
      });

      expect(streak.isActive).toBe(true);
      expect(streak.currentStreak).toBe(1);
    });

    it('should break streak after missing a day', () => {
      const streak = service.updateStreak({
        userId: 'user_123',
        lastActivity: new Date('2025-08-27'),
        currentDate: new Date('2025-08-29'),
      });

      expect(streak.isActive).toBe(false);
      expect(streak.currentStreak).toBe(0);
      expect(streak.streakLost).toBe(true);
    });

    it('should send streak warnings', () => {
      const warnings = service.getStreakWarnings({
        userId: 'user_123',
        lastActivity: new Date('2025-08-29T14:00:00'),
        currentTime: new Date('2025-08-29T20:00:00'),
      });

      expect(warnings).toContainEqual(
        expect.objectContaining({
          type: 'streak_warning',
          urgency: 'high',
          hoursRemaining: 4,
        }),
      );
    });

    it('should offer streak freeze items', () => {
      const protectionItems = service.getStreakProtection({
        userId: 'user_123',
        currentStreak: 30,
      });

      expect(protectionItems).toContainEqual(
        expect.objectContaining({
          id: 'streak_freeze',
          cost: 100,
          duration: 86400000, // 1 day
        }),
      );
    });
  });

  describe('Quest System', () => {
    it('should generate daily quests', async () => {
      const quests = await service.generateDailyQuests({
        userId: 'user_123',
        userLevel: 10,
        preferences: ['science', 'history'],
      });

      expect(quests).toHaveLength(3);
      expect(quests[0]).toMatchObject({
        type: 'daily',
        expires: expect.any(Date),
        reward: expect.objectContaining({
          xp: expect.any(Number),
        }),
      });
    });

    it('should track quest progress', () => {
      const progress = service.updateQuestProgress({
        questId: 'daily_quiz_3',
        userId: 'user_123',
        action: 'quiz.completed',
        currentProgress: 2,
        requirement: 3,
      });

      expect(progress.currentProgress).toBe(3);
      expect(progress.isComplete).toBe(true);
      expect(progress.rewardGranted).toBe(true);
    });

    it('should personalize quests based on behavior', async () => {
      const quests = await service.generateDailyQuests({
        userId: 'user_123',
        userLevel: 25,
        preferences: ['react', 'typescript'],
        recentActivity: {
          averageScore: 85,
          favoriteTime: 'evening',
          streakLength: 15,
        },
      });

      expect(quests).toContainEqual(
        expect.objectContaining({
          name: expect.stringContaining('Expert'),
          difficulty: 'hard',
        }),
      );
    });
  });

  describe('Reward Distribution', () => {
    it('should distribute achievement rewards', async () => {
      const rewards = await service.distributeRewards({
        userId: 'user_123',
        achievementId: 'week_warrior',
        timestamp: new Date(),
      });

      expect(rewards).toMatchObject({
        xp: 150,
        badge: 'week_warrior_badge',
        title: 'Week Warrior',
        notifications: expect.arrayContaining([
          expect.objectContaining({
            type: 'achievement_unlocked',
          }),
        ]),
      });
    });

    it('should handle mystery box drops', () => {
      const drops = Array.from({ length: 100 }, () =>
        service.checkMysteryBoxDrop({
          userId: 'user_123',
          event: 'quiz.completed',
        }),
      );

      const boxesDropped = drops.filter((d) => d.dropped);
      expect(boxesDropped.length).toBeGreaterThan(5);
      expect(boxesDropped.length).toBeLessThan(20);
    });

    it('should apply FOMO event bonuses', () => {
      const event = service.createFlashEvent({
        type: 'double_xp',
        category: 'science',
        duration: 3600000, // 1 hour
      });

      const xp = service.calculateXP({
        score: 80,
        category: 'science',
        activeEvents: [event],
      });

      expect(xp.eventMultiplier).toBe(2);
      expect(xp.totalXP).toBeGreaterThanOrEqual(20);
    });
  });

  describe('Leaderboard Integration', () => {
    it('should update leaderboard rankings', async () => {
      const ranking = await service.updateLeaderboard({
        userId: 'user_123',
        score: 950,
        category: 'react',
        period: 'weekly',
      });

      expect(ranking).toMatchObject({
        position: expect.any(Number),
        previousPosition: expect.any(Number),
        trend: expect.stringMatching(/up|down|stable/),
      });
    });

    it('should notify about friend activities', async () => {
      const notifications = await service.checkFriendActivity({
        userId: 'user_123',
        friends: ['user_456', 'user_789'],
      });

      expect(notifications).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'friend_beat_score',
            friend: expect.any(String),
            category: expect.any(String),
          }),
        ]),
      );
    });
  });

  describe('Engagement Mechanics', () => {
    it('should implement loss aversion for streaks', () => {
      const urgency = service.calculateStreakUrgency({
        lastActivity: new Date('2025-08-29T18:00:00'),
        currentTime: new Date('2025-08-29T22:00:00'),
      });

      expect(urgency).toMatchObject({
        level: 'critical',
        message: expect.stringContaining('streak'),
        offerStreakFreeze: true,
      });
    });

    it('should create competitive challenges', async () => {
      const challenge = await service.createChallenge({
        challengerId: 'user_123',
        challengedId: 'user_456',
        category: 'javascript',
        wager: { xp: 100 },
      });

      expect(challenge).toMatchObject({
        id: expect.any(String),
        status: 'pending',
        expiresAt: expect.any(Date),
        room: expect.stringContaining('battle'),
      });
    });

    it('should track combo multipliers', () => {
      const combo = service.updateCombo({
        userId: 'user_123',
        correctAnswers: 5,
        timeWindow: 30000,
      });

      expect(combo).toMatchObject({
        currentCombo: 5,
        multiplier: 1.5,
        nextMilestone: 10,
      });
    });
  });
});

describe('XPCalculator', () => {
  let calculator: XPCalculator;

  beforeEach(() => {
    calculator = new XPCalculator();
  });

  it('should calculate level from total XP', () => {
    expect(calculator.getLevelFromXP(0)).toBe(1);
    expect(calculator.getLevelFromXP(99)).toBe(1); // Just under level 2
    expect(calculator.getLevelFromXP(100)).toBe(2); // Exactly level 2
    expect(calculator.getLevelFromXP(999)).toBe(10); // Just under level 11
    expect(calculator.getLevelFromXP(1000)).toBe(11); // Level 11
    expect(calculator.getLevelFromXP(5000)).toBeGreaterThan(20);
  });

  it('should calculate XP needed for next level', () => {
    expect(calculator.getXPForNextLevel(1)).toBe(100);
    expect(calculator.getXPForNextLevel(10)).toBe(150);
    expect(calculator.getXPForNextLevel(50)).toBeGreaterThan(500);
  });

  it('should apply difficulty multipliers', () => {
    expect(calculator.getDifficultyMultiplier('easy')).toBe(0.8);
    expect(calculator.getDifficultyMultiplier('medium')).toBe(1.0);
    expect(calculator.getDifficultyMultiplier('hard')).toBe(1.5);
    expect(calculator.getDifficultyMultiplier('expert')).toBe(2.0);
  });
});

describe('AchievementEngine', () => {
  let engine: AchievementEngine;

  beforeEach(() => {
    engine = new AchievementEngine();
  });

  it('should load achievement definitions', () => {
    const achievements = engine.getAllAchievements();

    expect(achievements).toContainEqual(
      expect.objectContaining({
        id: 'first_quiz',
        category: 'milestone',
      }),
    );
  });

  it('should check multiple conditions', () => {
    const unlocked = engine.checkConditions({
      achievementId: 'speed_demon',
      data: {
        timeSpent: 15,
        score: 100,
        difficulty: 'hard',
      },
    });

    expect(unlocked).toBe(true);
  });

  it('should track achievement progress', () => {
    const progress = engine.getProgress({
      achievementId: 'quiz_master',
      userId: 'user_123',
    });

    expect(progress).toMatchObject({
      current: expect.any(Number),
      required: 100,
      percentage: expect.any(Number),
    });
  });
});

describe('StreakTracker', () => {
  let tracker: StreakTracker;

  beforeEach(() => {
    tracker = new StreakTracker();
  });

  it('should calculate streak bonuses', () => {
    expect(tracker.getStreakBonus(3)).toBe(1.1);
    expect(tracker.getStreakBonus(7)).toBe(1.5);
    expect(tracker.getStreakBonus(30)).toBe(2.0);
    expect(tracker.getStreakBonus(100)).toBe(3.0);
  });

  it('should identify streak milestones', () => {
    const milestones = tracker.checkMilestones(7);

    expect(milestones).toContainEqual(
      expect.objectContaining({
        days: 7,
        achievement: 'week_warrior',
      }),
    );
  });
});

describe('QuestManager', () => {
  let manager: QuestManager;

  beforeEach(() => {
    manager = new QuestManager();
  });

  it('should create personalized quest templates', () => {
    const templates = manager.getQuestTemplates({
      userLevel: 15,
      preferences: ['react', 'testing'],
    });

    expect(templates).toContainEqual(
      expect.objectContaining({
        category: 'react',
        minLevel: expect.any(Number),
      }),
    );
  });

  it('should validate quest completion', () => {
    const isValid = manager.validateCompletion({
      questId: 'daily_perfect',
      requirement: { type: 'perfect_score', count: 1 },
      userActions: [{ type: 'perfect_score', timestamp: new Date() }],
    });

    expect(isValid).toBe(true);
  });
});

describe('RewardDistributor', () => {
  let distributor: RewardDistributor;

  beforeEach(() => {
    distributor = new RewardDistributor();
  });

  it('should queue reward distributions', async () => {
    const queue = await distributor.queueRewards({
      userId: 'user_123',
      rewards: [
        { type: 'xp', amount: 100 },
        { type: 'badge', id: 'champion' },
        { type: 'powerup', id: 'double_xp' },
      ],
    });

    expect(queue.status).toBe('queued');
    expect(queue.estimatedDelivery).toBeDefined();
  });

  it('should handle batch distributions', async () => {
    const result = await distributor.distributeBatch([
      { userId: 'user_123', reward: { type: 'xp', amount: 50 } },
      { userId: 'user_456', reward: { type: 'xp', amount: 75 } },
      { userId: 'user_789', reward: { type: 'badge', id: 'daily_player' } },
    ]);

    expect(result.successful).toBe(3);
    expect(result.failed).toBe(0);
  });
});
