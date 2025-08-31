import { apiClient, APIResponse, User, Quiz, QuizSession } from '../apiClient';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  multiRemove: jest.fn(),
}));

describe('API Client', () => {
  let mock: MockAdapter;

  beforeEach(() => {
    // Create a new mock adapter for axios
    mock = new MockAdapter(axios);

    // Clear all mocks
    jest.clearAllMocks();

    // Reset AsyncStorage mocks
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
    (AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined);
    (AsyncStorage.multiRemove as jest.Mock).mockResolvedValue(undefined);
  });

  afterEach(() => {
    mock.restore();
  });

  describe('Authentication', () => {
    describe('register', () => {
      it('should register a new user and store tokens', async () => {
        const mockUser: User = {
          id: '123',
          email: 'test@example.com',
          username: 'testuser',
          displayName: 'Test User',
          level: 1,
          xp: 0,
          hearts: 5,
          streak: 0,
          isPremium: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const mockResponse: APIResponse<{ user: User; tokens: any }> = {
          success: true,
          data: {
            user: mockUser,
            tokens: {
              accessToken: 'access_token_123',
              refreshToken: 'refresh_token_123',
            },
          },
        };

        mock.onPost('/auth/register').reply(200, mockResponse);

        const result = await apiClient.register({
          email: 'test@example.com',
          password: 'Password123!',
          username: 'testuser',
          displayName: 'Test User',
        });

        expect(result.success).toBe(true);
        expect(result.data?.user.email).toBe('test@example.com');
        expect(AsyncStorage.setItem).toHaveBeenCalledWith('auth_token', 'access_token_123');
        expect(AsyncStorage.setItem).toHaveBeenCalledWith('refresh_token', 'refresh_token_123');
      });

      it('should handle registration errors', async () => {
        const mockError: APIResponse<any> = {
          success: false,
          error: {
            code: 'EMAIL_EXISTS',
            message: 'Email already registered',
            timestamp: new Date(),
          },
        };

        mock.onPost('/auth/register').reply(400, mockError);

        try {
          await apiClient.register({
            email: 'existing@example.com',
            password: 'Password123!',
            username: 'testuser',
          });
          fail('Should have thrown an error');
        } catch (error: any) {
          expect(error.code).toBe('EMAIL_EXISTS');
          expect(error.message).toBe('Email already registered');
        }
      });
    });

    describe('login', () => {
      it('should login user and store tokens', async () => {
        const mockUser: User = {
          id: '123',
          email: 'test@example.com',
          username: 'testuser',
          displayName: 'Test User',
          level: 5,
          xp: 1500,
          hearts: 3,
          streak: 7,
          isPremium: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const mockResponse: APIResponse<{ user: User; tokens: any }> = {
          success: true,
          data: {
            user: mockUser,
            tokens: {
              accessToken: 'access_token_456',
              refreshToken: 'refresh_token_456',
            },
          },
        };

        mock.onPost('/auth/login').reply(200, mockResponse);

        const result = await apiClient.login({
          email: 'test@example.com',
          password: 'Password123!',
        });

        expect(result.success).toBe(true);
        expect(result.data?.user.isPremium).toBe(true);
        expect(AsyncStorage.setItem).toHaveBeenCalledWith('auth_token', 'access_token_456');
        expect(AsyncStorage.setItem).toHaveBeenCalledWith('refresh_token', 'refresh_token_456');
      });

      it('should handle invalid credentials', async () => {
        const mockError: APIResponse<any> = {
          success: false,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid email or password',
            timestamp: new Date(),
          },
        };

        mock.onPost('/auth/login').reply(401, mockError);

        try {
          await apiClient.login({
            email: 'test@example.com',
            password: 'WrongPassword',
          });
          fail('Should have thrown an error');
        } catch (error: any) {
          expect(error.code).toBe('INVALID_CREDENTIALS');
        }
      });
    });

    describe('logout', () => {
      it('should logout user and clear tokens', async () => {
        mock.onPost('/auth/logout').reply(200, { success: true });

        await apiClient.logout();

        expect(AsyncStorage.multiRemove).toHaveBeenCalledWith(['auth_token', 'refresh_token']);
      });

      it('should clear tokens even if API call fails', async () => {
        mock.onPost('/auth/logout').reply(500);

        await apiClient.logout();

        expect(AsyncStorage.multiRemove).toHaveBeenCalledWith(['auth_token', 'refresh_token']);
      });
    });

    describe('token refresh', () => {
      it('should refresh token on 401 response', async () => {
        // Set up initial tokens
        (AsyncStorage.getItem as jest.Mock)
          .mockResolvedValueOnce('old_access_token')
          .mockResolvedValueOnce('refresh_token_123');

        // First request fails with 401
        mock.onGet('/users/me').replyOnce(401);

        // Token refresh succeeds
        mock.onPost('/auth/refresh').reply(200, {
          success: true,
          data: {
            accessToken: 'new_access_token',
            refreshToken: 'new_refresh_token',
          },
        });

        // Retry original request succeeds
        mock.onGet('/users/me').reply(200, {
          success: true,
          data: {
            id: '123',
            email: 'test@example.com',
          },
        });

        const result = await apiClient.getCurrentUser();

        expect(result.success).toBe(true);
        expect(AsyncStorage.setItem).toHaveBeenCalledWith('auth_token', 'new_access_token');
        expect(AsyncStorage.setItem).toHaveBeenCalledWith('refresh_token', 'new_refresh_token');
      });
    });
  });

  describe('Quiz Operations', () => {
    describe('getQuizzes', () => {
      it('should fetch quizzes with filters', async () => {
        const mockQuizzes: Quiz[] = [
          {
            id: 'quiz1',
            categoryId: 'tech',
            title: 'JavaScript Basics',
            description: 'Test your JS knowledge',
            questions: [],
            difficulty: 2,
            passingScore: 70,
            xpReward: 100,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: 'quiz2',
            categoryId: 'tech',
            title: 'React Fundamentals',
            description: 'React basics quiz',
            questions: [],
            difficulty: 3,
            passingScore: 75,
            xpReward: 150,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ];

        mock.onGet('/quizzes', { params: { categoryId: 'tech', difficulty: 2 } }).reply(200, {
          success: true,
          data: mockQuizzes,
          metadata: {
            total: 2,
            hasMore: false,
          },
        });

        const result = await apiClient.getQuizzes({
          categoryId: 'tech',
          difficulty: 2,
        });

        expect(result.success).toBe(true);
        expect(result.data).toHaveLength(2);
        expect(result.data?.[0].title).toBe('JavaScript Basics');
      });
    });

    describe('startQuizSession', () => {
      it('should start a new quiz session', async () => {
        const mockSession: QuizSession = {
          id: 'session123',
          userId: 'user123',
          quizId: 'quiz123',
          score: 0,
          timeSpent: 0,
          answers: [],
          completed: false,
          earnedXp: 0,
          earnedHearts: 0,
          createdAt: new Date(),
        };

        mock.onPost('/quizzes/quiz123/start').reply(200, {
          success: true,
          data: mockSession,
        });

        const result = await apiClient.startQuizSession('quiz123');

        expect(result.success).toBe(true);
        expect(result.data?.id).toBe('session123');
        expect(result.data?.completed).toBe(false);
      });
    });

    describe('submitAnswer', () => {
      it('should submit an answer and get feedback', async () => {
        mock.onPost('/sessions/session123/answer').reply(200, {
          success: true,
          data: {
            isCorrect: true,
            explanation: 'Great job! This is the correct answer.',
          },
        });

        const result = await apiClient.submitAnswer('session123', {
          questionId: 'q1',
          answerId: 'a1',
          timeSpent: 15,
        });

        expect(result.success).toBe(true);
        expect(result.data?.isCorrect).toBe(true);
        expect(result.data?.explanation).toBeDefined();
      });
    });

    describe('completeQuizSession', () => {
      it('should complete a quiz session and get results', async () => {
        const completedSession: QuizSession = {
          id: 'session123',
          userId: 'user123',
          quizId: 'quiz123',
          score: 85,
          timeSpent: 300,
          answers: [],
          completed: true,
          earnedXp: 100,
          earnedHearts: 2,
          createdAt: new Date(),
          completedAt: new Date(),
        };

        mock.onPost('/sessions/session123/complete').reply(200, {
          success: true,
          data: completedSession,
        });

        const result = await apiClient.completeQuizSession('session123');

        expect(result.success).toBe(true);
        expect(result.data?.completed).toBe(true);
        expect(result.data?.score).toBe(85);
        expect(result.data?.earnedXp).toBe(100);
      });
    });
  });

  describe('Leaderboard Operations', () => {
    it('should fetch leaderboard', async () => {
      mock.onGet('/leaderboard/weekly').reply(200, {
        success: true,
        data: {
          id: 'weekly_2024_01',
          period: 'weekly',
          entries: [
            {
              rank: 1,
              userId: 'user1',
              username: 'champion',
              displayName: 'Champion Player',
              score: 5000,
              level: 25,
              streak: 30,
              isPremium: true,
            },
          ],
          userRank: 42,
          updatedAt: new Date(),
        },
      });

      const result = await apiClient.getLeaderboard('weekly');

      expect(result.success).toBe(true);
      expect(result.data?.entries[0].rank).toBe(1);
      expect(result.data?.userRank).toBe(42);
    });

    it('should get user rank', async () => {
      mock.onGet('/leaderboard/monthly/me').reply(200, {
        success: true,
        data: {
          rank: 15,
          score: 3500,
          percentile: 95,
        },
      });

      const result = await apiClient.getMyRank('monthly');

      expect(result.success).toBe(true);
      expect(result.data?.rank).toBe(15);
      expect(result.data?.percentile).toBe(95);
    });
  });

  describe('Daily Challenge', () => {
    it('should fetch daily challenge', async () => {
      mock.onGet('/daily-challenge').reply(200, {
        success: true,
        data: {
          id: 'daily_2024_01_01',
          date: '2024-01-01',
          quiz: {
            id: 'quiz_daily',
            title: 'Daily Challenge',
            questions: [],
          },
          completed: false,
          participants: 1500,
          averageScore: 72,
          rewards: {
            xp: 200,
            hearts: 3,
            streakBonus: 50,
          },
        },
      });

      const result = await apiClient.getDailyChallenge();

      expect(result.success).toBe(true);
      expect(result.data?.participants).toBe(1500);
      expect(result.data?.rewards.xp).toBe(200);
    });

    it('should complete daily challenge', async () => {
      mock.onPost('/daily-challenge/daily_2024_01_01/complete').reply(200, {
        success: true,
        data: {
          rewards: {
            xp: 200,
            hearts: 3,
            streakBonus: 50,
          },
          rank: 125,
        },
      });

      const result = await apiClient.completeDailyChallenge('daily_2024_01_01', 85);

      expect(result.success).toBe(true);
      expect(result.data?.rank).toBe(125);
      expect(result.data?.rewards.xp).toBe(200);
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors', async () => {
      mock.onGet('/users/me').networkError();

      try {
        await apiClient.getCurrentUser();
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.code).toBe('NETWORK_ERROR');
        expect(error.message).toContain('Network');
      }
    });

    it('should handle timeout errors', async () => {
      mock.onGet('/users/me').timeout();

      try {
        await apiClient.getCurrentUser();
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.code).toBeDefined();
        expect(error.message).toBeDefined();
      }
    });

    it('should handle 500 server errors', async () => {
      mock.onGet('/users/me').reply(500, {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error',
      });

      try {
        await apiClient.getCurrentUser();
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.code).toBe('INTERNAL_ERROR');
      }
    });
  });

  describe('Analytics', () => {
    it('should track events without blocking on failure', async () => {
      mock.onPost('/analytics/event').reply(500);

      // Should not throw
      await apiClient.trackEvent({
        name: 'quiz_completed',
        properties: { quizId: '123', score: 85 },
      });

      expect(true).toBe(true); // Just verify it doesn't throw
    });

    it('should get user stats', async () => {
      mock.onGet('/users/me/stats').reply(200, {
        success: true,
        data: {
          totalQuizzes: 150,
          totalQuestions: 1500,
          accuracy: 0.85,
          averageTime: 15.5,
          strongCategories: ['Tech', 'Science'],
          weakCategories: ['History'],
          learningStreak: 30,
          totalXp: 15000,
        },
      });

      const result = await apiClient.getStats();

      expect(result.success).toBe(true);
      expect(result.data?.totalQuizzes).toBe(150);
      expect(result.data?.accuracy).toBe(0.85);
      expect(result.data?.strongCategories).toContain('Tech');
    });
  });
});
