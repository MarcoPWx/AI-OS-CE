import { QuizService } from '../quizService';
import { supabase } from '../../lib/supabase';
import { CacheManager, PerformanceMonitor } from '../../lib/api';
import authService from '../authService';
import {
  createMockUser,
  createMockQuestion,
  createMockQuestions,
  createMockQuizSession,
  createMockStartQuizRequest,
  resetIdCounter,
} from '../../tests/factories';

// Mock dependencies
jest.mock('../../lib/supabase');
jest.mock('../../lib/api');
jest.mock('../authService');

describe('QuizService', () => {
  let quizService: QuizService;
  const mockSupabase = supabase as jest.Mocked<typeof supabase>;
  const mockAuthService = authService as jest.Mocked<typeof authService>;
  const mockCacheManager = CacheManager as jest.Mocked<typeof CacheManager>;

  beforeEach(() => {
    jest.clearAllMocks();
    resetIdCounter();
    quizService = QuizService.getInstance();
    // Reset singleton
    (QuizService as any).instance = null;
    quizService = QuizService.getInstance();

    // Mock PerformanceMonitor
    (PerformanceMonitor.measure as jest.Mock) = jest
      .fn()
      .mockImplementation(async (name, fn) => fn());
  });

  describe('getInstance', () => {
    it('should return singleton instance', () => {
      const instance1 = QuizService.getInstance();
      const instance2 = QuizService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('startQuiz', () => {
    it('should start a new quiz session successfully', async () => {
      const mockUser = createMockUser();
      const mockQuestions = createMockQuestions(10);
      const startRequest = createMockStartQuizRequest();

      mockAuthService.getCurrentUser = jest.fn().mockResolvedValue(mockUser);
      mockCacheManager.get = jest.fn().mockResolvedValue(null);
      mockCacheManager.set = jest.fn().mockResolvedValue(undefined);

      // Mock question fetching
      mockSupabase.from = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              order: jest.fn().mockResolvedValue({
                data: mockQuestions.map((q) => ({
                  id: q.id,
                  category_id: q.categoryId,
                  question: q.question,
                  options: q.options,
                  correct_answer: q.correctAnswer,
                  explanation: q.explanation,
                  difficulty: q.difficulty,
                  tags: q.tags,
                  points: q.points,
                })),
                error: null,
              }),
            }),
          }),
        }),
      });

      // Mock bonus multiplier calculation
      mockSupabase.from = jest.fn().mockImplementation((table) => {
        if (table === 'profiles') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: {
                    current_streak: 5,
                    is_premium: false,
                  },
                  error: null,
                }),
              }),
            }),
          };
        }
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              limit: jest.fn().mockReturnValue({
                order: jest.fn().mockResolvedValue({
                  data: mockQuestions.map((q) => ({
                    id: q.id,
                    category_id: q.categoryId,
                    question: q.question,
                    options: q.options,
                    correct_answer: q.correctAnswer,
                    explanation: q.explanation,
                    difficulty: q.difficulty,
                    tags: q.tags,
                    points: q.points,
                  })),
                  error: null,
                }),
              }),
            }),
          }),
        };
      });

      const result = await quizService.startQuiz(startRequest);

      expect(result).toMatchObject({
        sessionId: expect.stringContaining('quiz_'),
        questions: expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(String),
            question: expect.any(String),
            options: expect.any(Array),
          }),
        ]),
        bonusMultiplier: expect.any(Number),
      });

      expect(result.questions).toHaveLength(10);
      expect(mockAuthService.getCurrentUser).toHaveBeenCalled();
    });

    it('should throw error if user is not authenticated', async () => {
      mockAuthService.getCurrentUser = jest.fn().mockResolvedValue(null);
      const startRequest = createMockStartQuizRequest();

      await expect(quizService.startQuiz(startRequest)).rejects.toThrow('User not authenticated');
    });

    it('should throw error if no questions available', async () => {
      const mockUser = createMockUser();
      mockAuthService.getCurrentUser = jest.fn().mockResolvedValue(mockUser);
      mockCacheManager.get = jest.fn().mockResolvedValue(null);

      mockSupabase.from = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              order: jest.fn().mockResolvedValue({
                data: [],
                error: null,
              }),
            }),
          }),
        }),
      });

      const startRequest = createMockStartQuizRequest();

      await expect(quizService.startQuiz(startRequest)).rejects.toThrow(
        'No questions available for this category',
      );
    });

    it('should use cached questions if available', async () => {
      const mockUser = createMockUser();
      const mockQuestions = createMockQuestions(10);
      const startRequest = createMockStartQuizRequest();

      mockAuthService.getCurrentUser = jest.fn().mockResolvedValue(mockUser);
      mockCacheManager.get = jest.fn().mockResolvedValue(mockQuestions);

      // Mock bonus multiplier
      mockSupabase.from = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { current_streak: 0, is_premium: false },
              error: null,
            }),
          }),
        }),
      });

      const result = await quizService.startQuiz(startRequest);

      expect(result.questions).toEqual(mockQuestions);
      expect(mockSupabase.from).not.toHaveBeenCalledWith('questions');
      expect(mockCacheManager.get).toHaveBeenCalled();
    });

    it('should apply correct time limit for daily challenge', async () => {
      const mockUser = createMockUser();
      const mockQuestions = createMockQuestions(10);
      const startRequest = createMockStartQuizRequest({ type: 'daily' });

      mockAuthService.getCurrentUser = jest.fn().mockResolvedValue(mockUser);
      mockCacheManager.get = jest.fn().mockResolvedValue(mockQuestions);

      mockSupabase.from = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { current_streak: 0, is_premium: false },
              error: null,
            }),
          }),
        }),
      });

      const result = await quizService.startQuiz(startRequest);

      expect(result.timeLimit).toBe(300); // 5 minutes for daily
    });
  });

  describe('submitAnswer', () => {
    it('should submit correct answer and calculate rewards', async () => {
      const mockUser = createMockUser();
      const mockQuestion = createMockQuestion({ difficulty: 3 });

      mockAuthService.getCurrentUser = jest.fn().mockResolvedValue(mockUser);

      // Start a quiz first
      const sessionId = 'quiz_test_123';
      (quizService as any).activeSession = {
        id: sessionId,
        userId: mockUser.id,
        categoryId: 'cat-1',
        type: 'practice',
        questionsAnswered: 0,
        correctAnswers: 0,
        wrongAnswers: 0,
        score: 0,
        timeSpent: 0,
        questions: [],
      };

      // Mock question fetching
      mockSupabase.from = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: {
                id: mockQuestion.id,
                category_id: mockQuestion.categoryId,
                question: mockQuestion.question,
                options: mockQuestion.options,
                correct_answer: mockQuestion.correctAnswer,
                explanation: mockQuestion.explanation,
                difficulty: mockQuestion.difficulty,
                tags: mockQuestion.tags,
                points: mockQuestion.points,
              },
              error: null,
            }),
          }),
        }),
      });

      const submitRequest = {
        sessionId,
        questionId: mockQuestion.id,
        answer: mockQuestion.correctAnswer,
        timeSpent: 10,
      };

      const result = await quizService.submitAnswer(submitRequest);

      expect(result).toMatchObject({
        isCorrect: true,
        correctAnswer: mockQuestion.correctAnswer,
        explanation: mockQuestion.explanation,
        xpEarned: expect.any(Number),
        starsEarned: expect.any(Number),
      });

      expect((quizService as any).activeSession.correctAnswers).toBe(1);
      expect((quizService as any).activeSession.questionsAnswered).toBe(1);
    });

    it('should handle incorrect answer', async () => {
      const mockQuestion = createMockQuestion();
      const sessionId = 'quiz_test_123';

      (quizService as any).activeSession = {
        id: sessionId,
        questionsAnswered: 0,
        correctAnswers: 0,
        wrongAnswers: 0,
        score: 0,
        timeSpent: 0,
        questions: [],
      };

      mockSupabase.from = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: {
                id: mockQuestion.id,
                correct_answer: mockQuestion.correctAnswer,
                explanation: mockQuestion.explanation,
                difficulty: mockQuestion.difficulty,
              },
              error: null,
            }),
          }),
        }),
      });

      const submitRequest = {
        sessionId,
        questionId: mockQuestion.id,
        answer: 0, // Wrong answer
        timeSpent: 10,
      };

      const result = await quizService.submitAnswer(submitRequest);

      expect(result.isCorrect).toBe(false);
      expect(result.xpEarned).toBe(0);
      expect(result.starsEarned).toBe(0);
      expect((quizService as any).activeSession.wrongAnswers).toBe(1);
    });

    it('should throw error for invalid session', async () => {
      const submitRequest = {
        sessionId: 'invalid_session',
        questionId: 'q1',
        answer: 1,
        timeSpent: 10,
      };

      await expect(quizService.submitAnswer(submitRequest)).rejects.toThrow(
        'Invalid or expired session',
      );
    });

    it('should calculate streak bonus for consecutive correct answers', async () => {
      const mockQuestion = createMockQuestion({ difficulty: 2 });
      const sessionId = 'quiz_test_123';

      // Set up session with previous correct answers
      (quizService as any).activeSession = {
        id: sessionId,
        questionsAnswered: 3,
        correctAnswers: 3,
        wrongAnswers: 0,
        score: 30,
        timeSpent: 30,
        questions: [
          { questionId: 'q1', isCorrect: true, timeSpent: 10 },
          { questionId: 'q2', isCorrect: true, timeSpent: 10 },
          { questionId: 'q3', isCorrect: true, timeSpent: 10 },
        ],
      };

      mockSupabase.from = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: {
                id: mockQuestion.id,
                correct_answer: mockQuestion.correctAnswer,
                explanation: mockQuestion.explanation,
                difficulty: mockQuestion.difficulty,
              },
              error: null,
            }),
          }),
        }),
      });

      const submitRequest = {
        sessionId,
        questionId: mockQuestion.id,
        answer: mockQuestion.correctAnswer,
        timeSpent: 10,
      };

      const result = await quizService.submitAnswer(submitRequest);

      expect(result.isCorrect).toBe(true);
      expect(result.streakBonus).toBeDefined();
      expect(result.streakBonus).toBeGreaterThan(0);
    });
  });

  describe('completeQuiz', () => {
    it('should complete quiz and calculate rewards', async () => {
      const mockUser = createMockUser();
      const sessionId = 'quiz_test_123';

      mockAuthService.getCurrentUser = jest.fn().mockResolvedValue(mockUser);

      // Set up completed session
      (quizService as any).activeSession = {
        id: sessionId,
        userId: mockUser.id,
        categoryId: 'cat-1',
        type: 'practice',
        questionsAnswered: 10,
        correctAnswers: 8,
        wrongAnswers: 2,
        score: 80,
        maxScore: 100,
        timeSpent: 120,
        questions: [],
      };

      // Mock database operations
      mockSupabase.rpc = jest.fn().mockResolvedValue({ error: null });
      mockSupabase.from = jest.fn().mockImplementation((table) => {
        if (table === 'quiz_sessions') {
          return {
            insert: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: createMockQuizSession(),
                  error: null,
                }),
              }),
            }),
          };
        }
        if (table === 'leaderboards') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: { rank: 50 },
                  error: null,
                }),
              }),
            }),
            upsert: jest.fn().mockResolvedValue({ error: null }),
          };
        }
        return {};
      });

      const completeRequest = {
        sessionId,
        answers: [],
        totalTime: 120,
      };

      const result = await quizService.completeQuiz(completeRequest);

      expect(result).toMatchObject({
        session: expect.objectContaining({
          id: expect.any(String),
          score: expect.any(Number),
          accuracy: expect.any(Number),
        }),
        rewards: expect.objectContaining({
          xp: expect.any(Number),
          stars: expect.any(Number),
          totalXp: expect.any(Number),
        }),
        achievements: expect.any(Array),
      });

      expect(mockSupabase.rpc).toHaveBeenCalledWith('update_user_stats', {
        user_id: mockUser.id,
        xp_to_add: expect.any(Number),
        stars_to_add: expect.any(Number),
      });

      // Session should be cleared
      expect(quizService.getActiveSession()).toBeNull();
    });

    it('should throw error for invalid session', async () => {
      const mockUser = createMockUser();
      mockAuthService.getCurrentUser = jest.fn().mockResolvedValue(mockUser);

      const completeRequest = {
        sessionId: 'invalid_session',
        answers: [],
        totalTime: 120,
      };

      await expect(quizService.completeQuiz(completeRequest)).rejects.toThrow(
        'Invalid or expired session',
      );
    });

    it('should calculate perfect bonus for all correct answers', async () => {
      const mockUser = createMockUser();
      const sessionId = 'quiz_test_123';

      mockAuthService.getCurrentUser = jest.fn().mockResolvedValue(mockUser);

      // Perfect session
      (quizService as any).activeSession = {
        id: sessionId,
        userId: mockUser.id,
        categoryId: 'cat-1',
        type: 'practice',
        questionsAnswered: 10,
        correctAnswers: 10,
        wrongAnswers: 0,
        score: 100,
        maxScore: 100,
        timeSpent: 100,
        questions: [],
      };

      mockSupabase.rpc = jest.fn().mockResolvedValue({ error: null });
      mockSupabase.from = jest.fn().mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: createMockQuizSession(),
              error: null,
            }),
          }),
        }),
      });

      const completeRequest = {
        sessionId,
        answers: [],
        totalTime: 100,
      };

      const result = await quizService.completeQuiz(completeRequest);

      expect(result.rewards.perfectBonus).toBeGreaterThan(0);
      expect(result.session.accuracy).toBe(100);
    });

    it('should calculate speed bonus for fast completion', async () => {
      const mockUser = createMockUser();
      const sessionId = 'quiz_test_123';

      mockAuthService.getCurrentUser = jest.fn().mockResolvedValue(mockUser);

      // Fast completion (5 seconds per question)
      (quizService as any).activeSession = {
        id: sessionId,
        userId: mockUser.id,
        categoryId: 'cat-1',
        type: 'practice',
        questionsAnswered: 10,
        correctAnswers: 8,
        wrongAnswers: 2,
        score: 80,
        maxScore: 100,
        timeSpent: 50, // 5 seconds per question
        questions: [],
      };

      mockSupabase.rpc = jest.fn().mockResolvedValue({ error: null });
      mockSupabase.from = jest.fn().mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: createMockQuizSession(),
              error: null,
            }),
          }),
        }),
      });

      const completeRequest = {
        sessionId,
        answers: [],
        totalTime: 50,
      };

      const result = await quizService.completeQuiz(completeRequest);

      expect(result.rewards.speedBonus).toBeGreaterThan(0);
    });
  });

  describe('getActiveSession', () => {
    it('should return active session if exists', () => {
      const session = {
        id: 'test_session',
        userId: 'user1',
        score: 50,
      };
      (quizService as any).activeSession = session;

      const result = quizService.getActiveSession();
      expect(result).toEqual(session);
    });

    it('should return null if no active session', () => {
      (quizService as any).activeSession = null;
      const result = quizService.getActiveSession();
      expect(result).toBeNull();
    });
  });

  describe('cancelActiveSession', () => {
    it('should clear active session and answers', () => {
      (quizService as any).activeSession = { id: 'test' };
      (quizService as any).sessionAnswers.set('q1', { answer: 1 });

      quizService.cancelActiveSession();

      expect(quizService.getActiveSession()).toBeNull();
      expect((quizService as any).sessionAnswers.size).toBe(0);
    });
  });
});
