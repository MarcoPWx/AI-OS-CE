import { AdaptiveLearningEngine } from '../adaptiveLearningEngine';
import { supabase } from '../../lib/supabase';

// Mock Supabase
jest.mock('../../lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

describe('AdaptiveLearningEngine', () => {
  let engine: AdaptiveLearningEngine;
  let mockSupabaseQuery: any;

  beforeEach(() => {
    jest.clearAllMocks();
    engine = AdaptiveLearningEngine.getInstance();

    // Setup mock Supabase chain
    mockSupabaseQuery = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      lte: jest.fn().mockReturnThis(),
      in: jest.fn().mockReturnThis(),
      not: jest.fn().mockReturnThis(),
      match: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      single: jest.fn().mockReturnThis(),
      upsert: jest.fn().mockResolvedValue({ data: null, error: null }),
    };

    (supabase.from as jest.Mock).mockReturnValue(mockSupabaseQuery);
  });

  describe('generateOptimalSession', () => {
    it('should generate an optimal quiz session with default preferences', async () => {
      // Mock user learning profile
      mockSupabaseQuery.single.mockResolvedValueOnce({
        data: {
          userId: 'user123',
          categoryId: 'cat456',
          skillLevel: 3,
          overallMastery: 0.6,
          currentStreak: 5,
          seenQuestions: ['q1', 'q2'],
          knowledgeMap: [
            { topic: 'topic1', mastery: 0.8, lastSeen: new Date() },
            { topic: 'topic2', mastery: 0.4, lastSeen: new Date() },
          ],
          learningStyle: {
            visual: 0.4,
            verbal: 0.2,
            logical: 0.3,
            kinesthetic: 0.1,
          },
          performanceHistory: [],
          lastSessionDate: new Date(),
        },
      });

      // Mock question selection queries
      mockSupabaseQuery.limit.mockResolvedValue({
        data: [
          {
            id: 'q3',
            question: 'Test question 1',
            options: ['A', 'B', 'C', 'D'],
            correctAnswer: 0,
            difficulty: 2,
            explanation: 'Test explanation',
          },
          {
            id: 'q4',
            question: 'Test question 2',
            options: ['A', 'B', 'C', 'D'],
            correctAnswer: 1,
            difficulty: 3,
            explanation: 'Test explanation 2',
          },
        ],
      });

      const session = await engine.generateOptimalSession('user123', 'cat456');

      expect(session).toHaveProperty('questions');
      expect(session).toHaveProperty('sessionParams');
      expect(session).toHaveProperty('rewards');
      expect(session).toHaveProperty('adaptiveFeatures');
      expect(session).toHaveProperty('personalizedHints');

      expect(session.questions.length).toBeGreaterThan(0);
      expect(session.sessionParams.questionCount).toBeGreaterThanOrEqual(5);
      expect(session.sessionParams.questionCount).toBeLessThanOrEqual(15);
      expect(session.rewards.xpPerCorrect).toBeGreaterThan(0);
    });

    it('should respect user preferences when generating session', async () => {
      mockSupabaseQuery.single.mockResolvedValueOnce({ data: null });
      mockSupabaseQuery.limit.mockResolvedValue({
        data: Array(10)
          .fill(null)
          .map((_, i) => ({
            id: `q${i}`,
            question: `Question ${i}`,
            options: ['A', 'B', 'C', 'D'],
            correctAnswer: 0,
            difficulty: 2 + (i % 3),
            explanation: `Explanation ${i}`,
          })),
      });

      const preferences = {
        questionCount: 10,
        difficulty: 'medium',
        timeLimit: 300000,
      };

      const session = await engine.generateOptimalSession('user123', 'cat456', preferences);

      expect(session.sessionParams.questionCount).toBeLessThanOrEqual(10);
      expect(session.sessionParams.timeLimit).toBeDefined();
    });

    it('should handle new users with no learning profile', async () => {
      mockSupabaseQuery.single.mockResolvedValueOnce({ data: null });
      mockSupabaseQuery.limit.mockResolvedValue({
        data: [
          {
            id: 'q1',
            question: 'Beginner question',
            options: ['A', 'B', 'C', 'D'],
            correctAnswer: 0,
            difficulty: 1,
            explanation: 'Basic explanation',
          },
        ],
      });

      const session = await engine.generateOptimalSession('newuser', 'cat456');

      expect(session.sessionParams.averageDifficulty).toBe(2); // Default skill level
      expect(session.adaptiveFeatures.enableHints).toBe(true); // Hints for beginners
      expect(session.adaptiveFeatures.enableSkip).toBe(false); // No skip for beginners
    });
  });

  describe('updateUserModel', () => {
    it('should update user model after quiz session', async () => {
      mockSupabaseQuery.single.mockResolvedValueOnce({
        data: {
          userId: 'user123',
          categoryId: 'cat456',
          skillLevel: 2.5,
          overallMastery: 0.5,
          currentStreak: 3,
          seenQuestions: ['q1', 'q2'],
          knowledgeMap: [],
          learningStyle: {
            visual: 0.25,
            verbal: 0.25,
            logical: 0.25,
            kinesthetic: 0.25,
          },
          performanceHistory: [],
          lastSessionDate: new Date(),
        },
      });

      const sessionResults = {
        accuracy: 0.8,
        averageDifficulty: 3,
        questionIds: ['q3', 'q4', 'q5'],
        questionResults: [
          {
            questionId: 'q3',
            topic: 'topic1',
            correct: true,
            timeSpent: 10000,
            hasImage: true,
          },
          {
            questionId: 'q4',
            topic: 'topic2',
            correct: true,
            timeSpent: 12000,
            requiresReasoning: true,
          },
          {
            questionId: 'q5',
            topic: 'topic1',
            correct: false,
            timeSpent: 20000,
          },
        ],
      };

      await engine.updateUserModel('user123', 'cat456', sessionResults);

      expect(mockSupabaseQuery.upsert).toHaveBeenCalled();
      const upsertCall = mockSupabaseQuery.upsert.mock.calls[0][0];

      expect(upsertCall.user_id).toBe('user123');
      expect(upsertCall.category_id).toBe('cat456');
      expect(upsertCall.currentStreak).toBe(4); // Increased due to 80% accuracy
      expect(upsertCall.seenQuestions).toContain('q3');
      expect(upsertCall.seenQuestions).toContain('q4');
      expect(upsertCall.seenQuestions).toContain('q5');
    });

    it('should reset streak on poor performance', async () => {
      mockSupabaseQuery.single.mockResolvedValueOnce({
        data: {
          userId: 'user123',
          categoryId: 'cat456',
          skillLevel: 3,
          overallMastery: 0.6,
          currentStreak: 10,
          seenQuestions: [],
          knowledgeMap: [],
          learningStyle: {
            visual: 0.25,
            verbal: 0.25,
            logical: 0.25,
            kinesthetic: 0.25,
          },
          performanceHistory: [],
          lastSessionDate: new Date(),
        },
      });

      const sessionResults = {
        accuracy: 0.4, // Poor performance
        averageDifficulty: 3,
        questionIds: ['q1'],
        questionResults: [
          {
            questionId: 'q1',
            topic: 'topic1',
            correct: false,
            timeSpent: 30000,
          },
        ],
      };

      await engine.updateUserModel('user123', 'cat456', sessionResults);

      const upsertCall = mockSupabaseQuery.upsert.mock.calls[0][0];
      expect(upsertCall.currentStreak).toBe(0); // Reset due to poor performance
    });
  });

  describe('Question Selection Strategies', () => {
    it('should select questions using spaced repetition', async () => {
      // Mock review questions that need repetition
      mockSupabaseQuery.limit.mockResolvedValueOnce({
        data: [
          {
            question_id: 'q1',
            last_seen: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
            easiness_factor: 2.0,
            interval: 3,
          },
          {
            question_id: 'q2',
            last_seen: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
            easiness_factor: 2.5,
            interval: 1,
          },
        ],
      });

      // Mock fetching actual questions
      mockSupabaseQuery.in.mockResolvedValueOnce({
        data: [
          {
            id: 'q2', // More overdue based on interval
            question: 'Review question',
            difficulty: 2,
          },
        ],
      });

      mockSupabaseQuery.single.mockResolvedValueOnce({ data: null }); // No user profile

      const session = await engine.generateOptimalSession('user123', 'cat456');

      expect(mockSupabaseQuery.select).toHaveBeenCalledWith(expect.stringContaining('question_id'));
    });

    it('should target knowledge gaps in weak topics', async () => {
      mockSupabaseQuery.single.mockResolvedValueOnce({
        data: {
          userId: 'user123',
          categoryId: 'cat456',
          skillLevel: 3,
          overallMastery: 0.5,
          currentStreak: 0,
          seenQuestions: [],
          knowledgeMap: [
            { topic: 'strong_topic', mastery: 0.9, lastSeen: new Date() },
            { topic: 'weak_topic', mastery: 0.3, lastSeen: new Date() },
            { topic: 'medium_topic', mastery: 0.6, lastSeen: new Date() },
          ],
          learningStyle: {
            visual: 0.25,
            verbal: 0.25,
            logical: 0.25,
            kinesthetic: 0.25,
          },
          performanceHistory: [],
          lastSessionDate: new Date(),
        },
      });

      mockSupabaseQuery.limit.mockResolvedValue({
        data: [
          {
            id: 'weak_q1',
            question: 'Weak topic question',
            topic: 'weak_topic',
            difficulty: 2,
          },
        ],
      });

      const session = await engine.generateOptimalSession('user123', 'cat456');

      // Verify that questions from weak topics were requested
      expect(mockSupabaseQuery.in).toHaveBeenCalledWith(
        'topic',
        expect.arrayContaining(['weak_topic']),
      );
    });

    it('should generate optimal difficulty curve', async () => {
      mockSupabaseQuery.single.mockResolvedValueOnce({
        data: {
          userId: 'user123',
          categoryId: 'cat456',
          skillLevel: 3,
          overallMastery: 0.6,
          currentStreak: 5,
          seenQuestions: [],
          knowledgeMap: [],
          learningStyle: {
            visual: 0.25,
            verbal: 0.25,
            logical: 0.25,
            kinesthetic: 0.25,
          },
          performanceHistory: [],
          lastSessionDate: new Date(),
        },
      });

      const questions = [
        { id: 'q1', difficulty: 1 },
        { id: 'q2', difficulty: 2 },
        { id: 'q3', difficulty: 3 },
        { id: 'q4', difficulty: 4 },
        { id: 'q5', difficulty: 5 },
        { id: 'q6', difficulty: 3 },
        { id: 'q7', difficulty: 2 },
      ];

      mockSupabaseQuery.limit.mockResolvedValue({ data: questions });
      mockSupabaseQuery.single.mockResolvedValue({ data: questions[0] });

      const session = await engine.generateOptimalSession('user123', 'cat456');

      // Check that questions are ordered for flow state
      if (session.questions.length > 3) {
        const firstQuestion = session.questions[0];
        const peakQuestion = session.questions[Math.floor(session.questions.length * 0.7)];
        const lastQuestion = session.questions[session.questions.length - 1];

        // Should start easier than peak
        expect(firstQuestion.difficulty).toBeLessThanOrEqual(peakQuestion.difficulty);
        // Should cool down after peak
        expect(lastQuestion.difficulty).toBeLessThanOrEqual(peakQuestion.difficulty);
      }
    });
  });

  describe('Reward Calculation', () => {
    it('should calculate dynamic rewards based on performance', async () => {
      mockSupabaseQuery.single.mockResolvedValueOnce({
        data: {
          userId: 'user123',
          categoryId: 'cat456',
          skillLevel: 4,
          overallMastery: 0.8,
          currentStreak: 7,
          seenQuestions: [],
          knowledgeMap: [],
          learningStyle: {
            visual: 0.25,
            verbal: 0.25,
            logical: 0.25,
            kinesthetic: 0.25,
          },
          performanceHistory: [],
          lastSessionDate: new Date(),
        },
      });

      mockSupabaseQuery.limit.mockResolvedValue({ data: [] });

      const session = await engine.generateOptimalSession('user123', 'cat456');

      // High streak should give bonus
      expect(session.rewards.xpPerCorrect).toBeGreaterThan(10);

      // Check bonus thresholds
      expect(session.rewards.bonusThresholds).toHaveLength(4);
      expect(session.rewards.bonusThresholds[0].correctCount).toBe(3);
      expect(session.rewards.bonusThresholds[3].correctCount).toBe(10);

      // Check time bonuses
      expect(session.rewards.timeBonus.fast.multiplier).toBeGreaterThan(
        session.rewards.timeBonus.slow.multiplier,
      );

      // Check accuracy bonuses
      expect(session.rewards.accuracyBonus.perfect.bonus).toBeGreaterThan(
        session.rewards.accuracyBonus.good.bonus,
      );
    });
  });

  describe('Adaptive Features', () => {
    it('should enable appropriate features based on user skill', async () => {
      // Test beginner user
      mockSupabaseQuery.single.mockResolvedValueOnce({
        data: {
          userId: 'beginner',
          categoryId: 'cat456',
          skillLevel: 1.5,
          overallMastery: 0.2,
          currentStreak: 0,
          seenQuestions: [],
          knowledgeMap: [],
          learningStyle: {
            visual: 0.25,
            verbal: 0.25,
            logical: 0.25,
            kinesthetic: 0.25,
          },
          performanceHistory: [],
          lastSessionDate: new Date(),
        },
      });

      mockSupabaseQuery.limit.mockResolvedValue({ data: [] });

      const beginnerSession = await engine.generateOptimalSession('beginner', 'cat456');

      expect(beginnerSession.adaptiveFeatures.enableHints).toBe(true);
      expect(beginnerSession.adaptiveFeatures.enableSkip).toBe(false);
      expect(beginnerSession.sessionParams.powerUpsEnabled).toBe(false);

      // Test advanced user
      jest.clearAllMocks();
      mockSupabaseQuery.single.mockResolvedValueOnce({
        data: {
          userId: 'advanced',
          categoryId: 'cat456',
          skillLevel: 4.5,
          overallMastery: 0.85,
          currentStreak: 15,
          seenQuestions: [],
          knowledgeMap: [],
          learningStyle: {
            visual: 0.1,
            verbal: 0.2,
            logical: 0.5,
            kinesthetic: 0.2,
          },
          performanceHistory: [],
          lastSessionDate: new Date(),
        },
      });

      mockSupabaseQuery.limit.mockResolvedValue({ data: [] });

      const advancedSession = await engine.generateOptimalSession('advanced', 'cat456');

      expect(advancedSession.adaptiveFeatures.enableHints).toBe(false);
      expect(advancedSession.adaptiveFeatures.enableSkip).toBe(true);
      expect(advancedSession.sessionParams.powerUpsEnabled).toBe(true);
      expect(advancedSession.adaptiveFeatures.showTimer).toBe(true); // Logical learner
    });

    it('should generate personalized hints based on learning style', async () => {
      mockSupabaseQuery.single.mockResolvedValueOnce({
        data: {
          userId: 'user123',
          categoryId: 'cat456',
          skillLevel: 3,
          overallMastery: 0.5,
          currentStreak: 0,
          seenQuestions: [],
          knowledgeMap: [],
          learningStyle: {
            visual: 0.6, // Visual learner
            verbal: 0.1,
            logical: 0.2,
            kinesthetic: 0.1,
          },
          performanceHistory: [],
          lastSessionDate: new Date(),
        },
      });

      mockSupabaseQuery.limit.mockResolvedValue({
        data: [
          {
            id: 'q1',
            question: 'Test question',
            options: ['A', 'B', 'C', 'D'],
            correctAnswer: 0,
            difficulty: 3,
          },
        ],
      });

      const session = await engine.generateOptimalSession('user123', 'cat456');

      expect(session.personalizedHints.size).toBeGreaterThan(0);

      const hints = session.personalizedHints.get('q1');
      expect(hints).toBeDefined();
      expect(hints![0]).toContain('Visualize'); // Visual hint for visual learner
    });
  });

  describe('Flow State Optimization', () => {
    it('should create optimal flow curve for questions', async () => {
      mockSupabaseQuery.single.mockResolvedValueOnce({ data: null });

      const questions = Array(10)
        .fill(null)
        .map((_, i) => ({
          id: `q${i}`,
          question: `Question ${i}`,
          options: ['A', 'B', 'C', 'D'],
          correctAnswer: 0,
          difficulty: (i % 5) + 1,
          explanation: `Explanation ${i}`,
        }));

      mockSupabaseQuery.limit.mockResolvedValue({ data: questions });

      const session = await engine.generateOptimalSession('user123', 'cat456');

      if (session.questions.length >= 5) {
        // Check flow pattern
        const difficulties = session.questions.map((q) => q.difficulty);
        const peakIndex = Math.floor(difficulties.length * 0.7);

        // Early questions should generally be easier than peak
        const earlyAvg = difficulties.slice(0, 2).reduce((a, b) => a + b, 0) / 2;
        const peakDifficulty = difficulties[peakIndex];

        expect(earlyAvg).toBeLessThanOrEqual(peakDifficulty + 1);
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      mockSupabaseQuery.single.mockRejectedValueOnce(new Error('Database error'));
      mockSupabaseQuery.limit.mockResolvedValue({ data: [] });

      const session = await engine.generateOptimalSession('user123', 'cat456');

      // Should still return a valid session with defaults
      expect(session).toBeDefined();
      expect(session.sessionParams.averageDifficulty).toBe(2); // Default
    });

    it('should handle empty question results', async () => {
      mockSupabaseQuery.single.mockResolvedValueOnce({ data: null });
      mockSupabaseQuery.limit.mockResolvedValue({ data: null });

      const session = await engine.generateOptimalSession('user123', 'cat456');

      expect(session.questions).toEqual([]);
    });
  });

  describe('Learning Style Adaptation', () => {
    it('should adapt learning style based on performance', async () => {
      mockSupabaseQuery.single.mockResolvedValueOnce({
        data: {
          userId: 'user123',
          categoryId: 'cat456',
          skillLevel: 3,
          overallMastery: 0.5,
          currentStreak: 0,
          seenQuestions: [],
          knowledgeMap: [],
          learningStyle: {
            visual: 0.25,
            verbal: 0.25,
            logical: 0.25,
            kinesthetic: 0.25,
          },
          performanceHistory: [],
          lastSessionDate: new Date(),
        },
      });

      const sessionResults = {
        accuracy: 0.8,
        averageDifficulty: 3,
        questionIds: ['q1', 'q2', 'q3'],
        questionResults: [
          {
            questionId: 'q1',
            topic: 'topic1',
            correct: true,
            timeSpent: 8000,
            hasImage: true, // Visual question answered correctly
          },
          {
            questionId: 'q2',
            topic: 'topic2',
            correct: true,
            timeSpent: 10000,
            hasImage: true, // Another visual question correct
          },
          {
            questionId: 'q3',
            topic: 'topic3',
            correct: false,
            timeSpent: 15000,
            requiresReasoning: true, // Logical question wrong
          },
        ],
      };

      await engine.updateUserModel('user123', 'cat456', sessionResults);

      const upsertCall = mockSupabaseQuery.upsert.mock.calls[0][0];

      // Visual style should increase due to better performance
      expect(upsertCall.learningStyle.visual).toBeGreaterThan(0.25);
    });
  });

  describe('Singleton Pattern', () => {
    it('should always return the same instance', () => {
      const instance1 = AdaptiveLearningEngine.getInstance();
      const instance2 = AdaptiveLearningEngine.getInstance();

      expect(instance1).toBe(instance2);
    });
  });
});
