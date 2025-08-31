/**
 * Gamification User Journey Integration Tests
 * Testing the complete flow of user interactions with gamification features
 */

import {
  GamificationService,
  XPCalculator,
  AchievementEngine,
  StreakTracker,
  QuestManager,
  RewardDistributor,
} from '../../services/gamification';

describe('Gamification User Journey', () => {
  let gamificationService: GamificationService;

  beforeEach(() => {
    gamificationService = new GamificationService();
  });

  describe('New User Onboarding Journey', () => {
    it('should complete full onboarding flow with rewards', async () => {
      // Step 1: User completes first quiz
      const firstQuizXP = gamificationService.calculateXP({
        score: 70,
        timeSpent: 45,
        difficulty: 'easy',
        perfectScore: false,
      });

      expect(firstQuizXP.totalXP).toBeGreaterThan(0);
      expect(firstQuizXP.baseXP).toBe(10);

      // Step 2: Check for first quiz achievement
      const achievements = await gamificationService.checkAchievements({
        userId: 'new_user',
        event: 'quiz.completed',
        data: {
          isFirstQuiz: true,
          score: 70,
        },
      });

      expect(achievements).toContainEqual(
        expect.objectContaining({
          id: 'first_quiz',
          name: 'First Steps',
        }),
      );

      // Step 3: Generate daily quests for new user
      const quests = await gamificationService.generateDailyQuests({
        userId: 'new_user',
        userLevel: 1,
        preferences: ['javascript', 'react'],
      });

      expect(quests).toHaveLength(3);
      expect(quests[0].type).toBe('daily');
    });
  });

  describe('Daily Active User Journey', () => {
    it('should handle complete daily engagement flow', async () => {
      const userId = 'daily_user';

      // Morning: Check streak status
      const streakStatus = gamificationService.updateStreak({
        userId,
        lastActivity: new Date('2025-08-28T09:00:00'),
        currentDate: new Date('2025-08-29T09:00:00'),
      });

      expect(streakStatus.isActive).toBe(true);
      expect(streakStatus.currentStreak).toBe(1);

      // Complete 3 quizzes for daily quest
      const quizResults = [];
      for (let i = 0; i < 3; i++) {
        const result = gamificationService.calculateXP({
          score: 80 + i * 5,
          timeSpent: 30,
          difficulty: 'medium',
          perfectScore: false,
          streakDays: 1,
        });
        quizResults.push(result);
      }

      // Check quest progress
      const questProgress = gamificationService.updateQuestProgress({
        questId: 'daily_quiz_3',
        userId,
        action: 'quiz.completed',
        currentProgress: 2,
        requirement: 3,
      });

      expect(questProgress.isComplete).toBe(true);
      expect(questProgress.rewardGranted).toBe(true);

      // Check for combo multiplier
      const combo = gamificationService.updateCombo({
        userId,
        correctAnswers: 5,
        timeWindow: 30000,
      });

      expect(combo.multiplier).toBe(1.5);
      expect(combo.nextMilestone).toBe(10);
    });

    it('should warn about streak expiration', () => {
      const warnings = gamificationService.getStreakWarnings({
        userId: 'streak_user',
        lastActivity: new Date('2025-08-29T00:00:00'),
        currentTime: new Date('2025-08-29T20:00:00'),
      });

      expect(warnings.length).toBeGreaterThan(0);
      expect(warnings[0].type).toBe('streak_warning');
      expect(warnings[0].urgency).toBe('high');
    });
  });

  describe('Achievement Progression Journey', () => {
    it('should unlock multiple achievements in sequence', async () => {
      const userId = 'achievement_hunter';
      const unlockedAchievements = [];

      // Perfect score achievement
      const perfectScore = await gamificationService.checkAchievements({
        userId,
        event: 'quiz.completed',
        data: {
          score: 100,
          difficulty: 'hard',
        },
      });

      expect(perfectScore).toContainEqual(
        expect.objectContaining({
          id: 'perfect_score',
        }),
      );
      unlockedAchievements.push(...perfectScore);

      // Streak achievements (3, 7, 30 days)
      const streakMilestones = [3, 7, 30];
      for (const days of streakMilestones) {
        const achievements = await gamificationService.checkAchievements({
          userId,
          event: 'streak.milestone',
          data: {
            streakDays: days,
          },
        });

        if (achievements.length > 0) {
          unlockedAchievements.push(...achievements);
        }
      }

      // Verify XP rewards from achievements
      const totalXP = unlockedAchievements.reduce(
        (sum, achievement) => sum + (achievement.xpReward || 0),
        0,
      );

      expect(totalXP).toBeGreaterThan(0);
    });
  });

  describe('Competitive Mode Journey', () => {
    it('should handle challenge creation and completion', async () => {
      // Create challenge between two users
      const challenge = await gamificationService.createChallenge({
        challengerId: 'player_1',
        challengedId: 'player_2',
        category: 'javascript',
        wager: { xp: 100 },
      });

      expect(challenge.status).toBe('pending');
      expect(challenge.room).toContain('battle_room');

      // Simulate battle with combos
      const player1Combo = gamificationService.updateCombo({
        userId: 'player_1',
        correctAnswers: 10,
        timeWindow: 60000,
      });

      const player2Combo = gamificationService.updateCombo({
        userId: 'player_2',
        correctAnswers: 7,
        timeWindow: 60000,
      });

      expect(player1Combo.multiplier).toBe(2.0);
      expect(player2Combo.multiplier).toBe(1.5);

      // Update leaderboard
      const ranking = await gamificationService.updateLeaderboard({
        userId: 'player_1',
        score: 1200,
        category: 'javascript',
        period: 'weekly',
      });

      expect(ranking.position).toBeDefined();
      expect(ranking.trend).toMatch(/up|down|stable/);
    });
  });

  describe('Reward Distribution Journey', () => {
    it('should handle complete reward flow', async () => {
      const userId = 'reward_user';

      // Distribute achievement rewards
      const achievementRewards = await gamificationService.distributeRewards({
        userId,
        achievementId: 'week_warrior',
        timestamp: new Date(),
      });

      expect(achievementRewards.xp).toBe(150);
      expect(achievementRewards.badge).toBe('week_warrior_badge');
      expect(achievementRewards.notifications).toBeDefined();

      // Check mystery box drop
      let mysteryBoxDropped = false;
      for (let i = 0; i < 20; i++) {
        const drop = gamificationService.checkMysteryBoxDrop({
          userId,
          event: 'quiz.completed',
        });

        if (drop.dropped) {
          mysteryBoxDropped = true;
          expect(drop.contents).toBeDefined();
          break;
        }
      }

      // Should get at least one mystery box in 20 attempts (10% chance)
      expect(mysteryBoxDropped).toBe(true);
    });

    it('should apply FOMO event bonuses correctly', () => {
      // Create flash event
      const flashEvent = gamificationService.createFlashEvent({
        type: 'double_xp',
        category: 'react',
        duration: 3600000, // 1 hour
      });

      expect(flashEvent.type).toBe('double_xp');
      expect(flashEvent.startTime).toBeDefined();

      // Calculate XP with event bonus
      const normalXP = gamificationService.calculateXP({
        score: 80,
        timeSpent: 30,
        difficulty: 'medium',
        perfectScore: false,
        category: 'javascript',
      });

      const eventXP = gamificationService.calculateXP({
        score: 80,
        timeSpent: 30,
        difficulty: 'medium',
        perfectScore: false,
        category: 'react',
        activeEvents: [flashEvent],
      });

      expect(eventXP.eventMultiplier).toBe(2);
      expect(eventXP.totalXP).toBeGreaterThan(normalXP.totalXP);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle zero scores gracefully', () => {
      const result = gamificationService.calculateXP({
        score: 0,
        timeSpent: 60,
        difficulty: 'hard',
        perfectScore: false,
      });

      expect(result.totalXP).toBeGreaterThan(0); // Base XP still awarded
      expect(result.bonusXP).toBe(0);
    });

    it('should handle broken streaks', () => {
      const brokenStreak = gamificationService.updateStreak({
        userId: 'broken_streak_user',
        lastActivity: new Date('2025-08-25'),
        currentDate: new Date('2025-08-29'),
      });

      expect(brokenStreak.isActive).toBe(false);
      expect(brokenStreak.currentStreak).toBe(0);
      expect(brokenStreak.streakLost).toBe(true);
    });

    it('should handle invalid quest progress', () => {
      const progress = gamificationService.updateQuestProgress({
        questId: 'invalid_quest',
        userId: 'test_user',
        action: 'invalid_action',
        currentProgress: 10,
        requirement: 5,
      });

      expect(progress.isComplete).toBe(true); // Already exceeded requirement
    });
  });
});

describe('XP Level Progression', () => {
  let calculator: XPCalculator;

  beforeEach(() => {
    calculator = new XPCalculator();
  });

  it('should handle complete level progression journey', () => {
    const xpMilestones = [0, 100, 500, 1000, 2000, 5000, 10000];
    const expectedLevels: number[] = [];

    xpMilestones.forEach((xp) => {
      const level = calculator.getLevelFromXP(xp);
      expectedLevels.push(level);

      // Verify level increases with XP
      if (expectedLevels.length > 1) {
        expect(level).toBeGreaterThanOrEqual(expectedLevels[expectedLevels.length - 2]);
      }
    });

    // Verify XP requirements increase with level
    for (let level = 1; level < 20; level++) {
      const xpNeeded = calculator.getXPForNextLevel(level);
      expect(xpNeeded).toBeGreaterThan(0);
    }
  });
});
