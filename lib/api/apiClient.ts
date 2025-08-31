import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// API Configuration
const API_CONFIG = {
  baseURL: process.env.EXPO_PUBLIC_API_URL || 'https://api.quizmentor.app',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'X-Platform': (Platform as any)?.OS || 'test',
    'X-App-Version': '1.0.0',
  },
};

// TypeScript Interfaces
export interface User {
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  level: number;
  xp: number;
  hearts: number;
  streak: number;
  isPremium: boolean;
  createdAt: Date;
  updatedAt: Date;
  metadata?: UserMetadata;
}

export interface UserMetadata {
  goals: string[];
  interests: string[];
  timeCommitment: string;
  onboardingCompleted: boolean;
  preferences: UserPreferences;
}

export interface UserPreferences {
  notifications: boolean;
  soundEffects: boolean;
  hapticFeedback: boolean;
  difficulty: 'easy' | 'medium' | 'hard' | 'adaptive';
  theme: 'light' | 'dark' | 'auto';
}

export interface Quiz {
  id: string;
  categoryId: string;
  title: string;
  description: string;
  questions: Question[];
  difficulty: number;
  timeLimit?: number;
  passingScore: number;
  xpReward: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Question {
  id: string;
  text: string;
  options: Answer[];
  correctAnswerId: string;
  explanation?: string;
  imageUrl?: string;
  difficulty: number;
  tags: string[];
  timeLimit?: number;
}

export interface Answer {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface QuizSession {
  id: string;
  userId: string;
  quizId: string;
  score: number;
  timeSpent: number;
  answers: SessionAnswer[];
  completed: boolean;
  earnedXp: number;
  earnedHearts: number;
  createdAt: Date;
  completedAt?: Date;
}

export interface SessionAnswer {
  questionId: string;
  answerId: string;
  isCorrect: boolean;
  timeSpent: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  difficulty: number;
  questionsCount: number;
  isLocked: boolean;
  requiredLevel: number;
  isPremium: boolean;
  parentId?: string;
  children?: Category[];
}

export interface Leaderboard {
  id: string;
  period: 'daily' | 'weekly' | 'monthly' | 'all-time';
  entries: LeaderboardEntry[];
  userRank?: number;
  updatedAt: Date;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  score: number;
  level: number;
  streak: number;
  isPremium: boolean;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  xpReward: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt?: Date;
  progress?: number;
  maxProgress?: number;
}

export interface DailyChallenge {
  id: string;
  date: string;
  quiz: Quiz;
  completed: boolean;
  participants: number;
  averageScore: number;
  userScore?: number;
  rewards: {
    xp: number;
    hearts: number;
    streakBonus: number;
  };
}

export interface Subscription {
  id: string;
  userId: string;
  type: 'monthly' | 'annual' | 'lifetime';
  status: 'active' | 'cancelled' | 'expired' | 'trial';
  startDate: Date;
  endDate?: Date;
  trialEndDate?: Date;
  price: number;
  currency: string;
  paymentMethod?: string;
}

// API Error Interface
export interface APIError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
}

// API Response Wrapper
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: APIError;
  metadata?: {
    page?: number;
    limit?: number;
    total?: number;
    hasMore?: boolean;
  };
}

// Request Interceptor for Authentication
class APIClient {
  private client: AxiosInstance;
  private authToken: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    // Use the global axios instance so test mocks (axios-mock-adapter) can intercept requests
    this.client = axios as AxiosInstance;
    // Apply base config to the global instance without creating a new client
    Object.assign(this.client.defaults, API_CONFIG);
    this.setupInterceptors();
    this.loadTokens();
  }

  private async loadTokens() {
    try {
      this.authToken = await AsyncStorage.getItem('auth_token');
      this.refreshToken = await AsyncStorage.getItem('refresh_token');
    } catch (error) {
      console.error('Failed to load tokens:', error);
    }
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      async (config) => {
        if (this.authToken) {
          config.headers.Authorization = `Bearer ${this.authToken}`;
        }

        // Add request ID for tracking
        config.headers['X-Request-ID'] = this.generateRequestId();

        // Add timestamp
        config.headers['X-Timestamp'] = new Date().toISOString();

        return config;
      },
      (error) => {
        return Promise.reject(error);
      },
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        // Log successful responses in dev
        if (__DEV__) {
          console.log(
            `✅ ${response.config.method?.toUpperCase()} ${response.config.url}`,
            response.data,
          );
        }
        return response;
      },
      async (error: AxiosError) => {
        // Handle 401 - Try to refresh token
        if (error.response?.status === 401 && this.refreshToken) {
          try {
            const newToken = await this.refreshAuthToken();
            if (newToken && error.config) {
              error.config.headers.Authorization = `Bearer ${newToken}`;
              return this.client.request(error.config);
            }
          } catch (refreshError) {
            // Refresh failed, logout user
            await this.logout();
          }
        }

        // Log errors in dev
        if (__DEV__) {
          console.error(
            `❌ ${error.config?.method?.toUpperCase()} ${error.config?.url}`,
            error.response?.data,
          );
        }

        return Promise.reject(this.formatError(error));
      },
    );
  }

  private generateRequestId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private formatError(error: AxiosError): APIError {
    if (error.response?.data) {
      const data = error.response.data as any;
      return {
        code: data.code || error.code || 'UNKNOWN_ERROR',
        message: data.message || error.message || 'An unexpected error occurred',
        details: data.details || error.response?.data,
        timestamp: new Date(),
      };
    }

    return {
      code: error.code || 'NETWORK_ERROR',
      message: error.message || 'Network request failed',
      timestamp: new Date(),
    };
  }

  private async refreshAuthToken(): Promise<string | null> {
    try {
      const response = await this.client.post('/auth/refresh', {
        refreshToken: this.refreshToken,
      });

      const { accessToken, refreshToken } = response.data.data;

      this.authToken = accessToken;
      this.refreshToken = refreshToken;

      await AsyncStorage.setItem('auth_token', accessToken);
      await AsyncStorage.setItem('refresh_token', refreshToken);

      return accessToken;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return null;
    }
  }

  // ============= AUTH ENDPOINTS =============
  async register(data: {
    email: string;
    password: string;
    username: string;
    displayName?: string;
  }): Promise<APIResponse<{ user: User; tokens: any }>> {
    const response = await this.client.post('/auth/register', data);

    if (response.data.success) {
      const { accessToken, refreshToken } = response.data.data.tokens;
      this.authToken = accessToken;
      this.refreshToken = refreshToken;

      await AsyncStorage.setItem('auth_token', accessToken);
      await AsyncStorage.setItem('refresh_token', refreshToken);
    }

    return response.data;
  }

  async login(data: {
    email: string;
    password: string;
  }): Promise<APIResponse<{ user: User; tokens: any }>> {
    const response = await this.client.post('/auth/login', data);

    if (response.data.success) {
      const { accessToken, refreshToken } = response.data.data.tokens;
      this.authToken = accessToken;
      this.refreshToken = refreshToken;

      await AsyncStorage.setItem('auth_token', accessToken);
      await AsyncStorage.setItem('refresh_token', refreshToken);
    }

    return response.data;
  }

  async logout(): Promise<void> {
    try {
      await this.client.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.authToken = null;
      this.refreshToken = null;
      await AsyncStorage.multiRemove(['auth_token', 'refresh_token']);
    }
  }

  async forgotPassword(email: string): Promise<APIResponse<void>> {
    const response = await this.client.post('/auth/forgot-password', { email });
    return response.data;
  }

  async resetPassword(data: { token: string; newPassword: string }): Promise<APIResponse<void>> {
    const response = await this.client.post('/auth/reset-password', data);
    return response.data;
  }

  // ============= USER ENDPOINTS =============
  async getCurrentUser(): Promise<APIResponse<User>> {
    const response = await this.client.get('/users/me');
    return response.data;
  }

  async updateUser(data: Partial<User>): Promise<APIResponse<User>> {
    const response = await this.client.patch('/users/me', data);
    return response.data;
  }

  async updateUserPreferences(preferences: Partial<UserPreferences>): Promise<APIResponse<User>> {
    const response = await this.client.patch('/users/me/preferences', preferences);
    return response.data;
  }

  async uploadAvatar(file: FormData): Promise<APIResponse<{ avatarUrl: string }>> {
    const response = await this.client.post('/users/me/avatar', file, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async deleteUser(): Promise<APIResponse<void>> {
    const response = await this.client.delete('/users/me');
    return response.data;
  }

  // ============= QUIZ ENDPOINTS =============
  async getQuizzes(params?: {
    categoryId?: string;
    difficulty?: number;
    limit?: number;
    offset?: number;
  }): Promise<APIResponse<Quiz[]>> {
    const response = await this.client.get('/quizzes', { params });
    return response.data;
  }

  async getQuiz(quizId: string): Promise<APIResponse<Quiz>> {
    const response = await this.client.get(`/quizzes/${quizId}`);
    return response.data;
  }

  async startQuizSession(quizId: string): Promise<APIResponse<QuizSession>> {
    const response = await this.client.post(`/quizzes/${quizId}/start`);
    return response.data;
  }

  async submitAnswer(
    sessionId: string,
    data: {
      questionId: string;
      answerId: string;
      timeSpent: number;
    },
  ): Promise<APIResponse<{ isCorrect: boolean; explanation?: string }>> {
    const response = await this.client.post(`/sessions/${sessionId}/answer`, data);
    return response.data;
  }

  async completeQuizSession(sessionId: string): Promise<APIResponse<QuizSession>> {
    const response = await this.client.post(`/sessions/${sessionId}/complete`);
    return response.data;
  }

  async getQuizHistory(params?: {
    limit?: number;
    offset?: number;
  }): Promise<APIResponse<QuizSession[]>> {
    const response = await this.client.get('/users/me/quiz-history', { params });
    return response.data;
  }

  // ============= CATEGORY ENDPOINTS =============
  async getCategories(): Promise<APIResponse<Category[]>> {
    const response = await this.client.get('/categories');
    return response.data;
  }

  async getCategory(categoryId: string): Promise<APIResponse<Category>> {
    const response = await this.client.get(`/categories/${categoryId}`);
    return response.data;
  }

  async getCategoryProgress(categoryId: string): Promise<
    APIResponse<{
      questionsAnswered: number;
      correctAnswers: number;
      accuracy: number;
      level: number;
      xp: number;
    }>
  > {
    const response = await this.client.get(`/categories/${categoryId}/progress`);
    return response.data;
  }

  // ============= LEADERBOARD ENDPOINTS =============
  async getLeaderboard(
    period: 'daily' | 'weekly' | 'monthly' | 'all-time',
    params?: {
      categoryId?: string;
      limit?: number;
      offset?: number;
    },
  ): Promise<APIResponse<Leaderboard>> {
    const response = await this.client.get(`/leaderboard/${period}`, { params });
    return response.data;
  }

  async getMyRank(period: 'daily' | 'weekly' | 'monthly' | 'all-time'): Promise<
    APIResponse<{
      rank: number;
      score: number;
      percentile: number;
    }>
  > {
    const response = await this.client.get(`/leaderboard/${period}/me`);
    return response.data;
  }

  // ============= ACHIEVEMENT ENDPOINTS =============
  async getAchievements(): Promise<APIResponse<Achievement[]>> {
    const response = await this.client.get('/achievements');
    return response.data;
  }

  async getUserAchievements(): Promise<APIResponse<Achievement[]>> {
    const response = await this.client.get('/users/me/achievements');
    return response.data;
  }

  async claimAchievement(achievementId: string): Promise<
    APIResponse<{
      xpEarned: number;
      newLevel?: number;
    }>
  > {
    const response = await this.client.post(`/achievements/${achievementId}/claim`);
    return response.data;
  }

  // ============= DAILY CHALLENGE ENDPOINTS =============
  async getDailyChallenge(): Promise<APIResponse<DailyChallenge>> {
    const response = await this.client.get('/daily-challenge');
    return response.data;
  }

  async completeDailyChallenge(
    challengeId: string,
    score: number,
  ): Promise<
    APIResponse<{
      rewards: {
        xp: number;
        hearts: number;
        streakBonus: number;
      };
      rank: number;
    }>
  > {
    const response = await this.client.post(`/daily-challenge/${challengeId}/complete`, { score });
    return response.data;
  }

  // ============= SUBSCRIPTION ENDPOINTS =============
  async getSubscription(): Promise<APIResponse<Subscription>> {
    const response = await this.client.get('/subscription');
    return response.data;
  }

  async createSubscription(data: {
    type: 'monthly' | 'annual' | 'lifetime';
    paymentToken: string;
  }): Promise<APIResponse<Subscription>> {
    const response = await this.client.post('/subscription', data);
    return response.data;
  }

  async cancelSubscription(): Promise<APIResponse<void>> {
    const response = await this.client.post('/subscription/cancel');
    return response.data;
  }

  async restoreSubscription(receipt: string): Promise<APIResponse<Subscription>> {
    const response = await this.client.post('/subscription/restore', { receipt });
    return response.data;
  }

  // ============= SOCIAL ENDPOINTS =============
  async getFriends(): Promise<APIResponse<User[]>> {
    const response = await this.client.get('/social/friends');
    return response.data;
  }

  async sendFriendRequest(userId: string): Promise<APIResponse<void>> {
    const response = await this.client.post(`/social/friends/request/${userId}`);
    return response.data;
  }

  async acceptFriendRequest(requestId: string): Promise<APIResponse<void>> {
    const response = await this.client.post(`/social/friends/accept/${requestId}`);
    return response.data;
  }

  async challengeFriend(data: {
    friendId: string;
    quizId: string;
    message?: string;
  }): Promise<APIResponse<{ challengeId: string }>> {
    const response = await this.client.post('/social/challenge', data);
    return response.data;
  }

  // ============= ANALYTICS ENDPOINTS =============
  async trackEvent(event: {
    name: string;
    properties?: Record<string, any>;
    timestamp?: Date;
  }): Promise<void> {
    try {
      await this.client.post('/analytics/event', event);
    } catch (error) {
      // Don't fail if analytics fails
      console.error('Analytics error:', error);
    }
  }

  async getStats(): Promise<
    APIResponse<{
      totalQuizzes: number;
      totalQuestions: number;
      accuracy: number;
      averageTime: number;
      strongCategories: string[];
      weakCategories: string[];
      learningStreak: number;
      totalXp: number;
    }>
  > {
    const response = await this.client.get('/users/me/stats');
    return response.data;
  }

  // ============= NOTIFICATION ENDPOINTS =============
  async registerPushToken(token: string): Promise<APIResponse<void>> {
    const response = await this.client.post('/notifications/register', {
      token,
      platform: Platform.OS,
    });
    return response.data;
  }

  async updateNotificationSettings(settings: {
    dailyReminder?: boolean;
    streakReminder?: boolean;
    challengeNotifications?: boolean;
    leaderboardUpdates?: boolean;
    achievementAlerts?: boolean;
  }): Promise<APIResponse<void>> {
    const response = await this.client.patch('/notifications/settings', settings);
    return response.data;
  }

  // ============= ADMIN ENDPOINTS =============
  async adminGetUsers(params?: {
    limit?: number;
    offset?: number;
    search?: string;
  }): Promise<APIResponse<User[]>> {
    const response = await this.client.get('/admin/users', { params });
    return response.data;
  }

  async adminCreateQuiz(
    quiz: Omit<Quiz, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<APIResponse<Quiz>> {
    const response = await this.client.post('/admin/quizzes', quiz);
    return response.data;
  }

  async adminUpdateQuiz(quizId: string, data: Partial<Quiz>): Promise<APIResponse<Quiz>> {
    const response = await this.client.patch(`/admin/quizzes/${quizId}`, data);
    return response.data;
  }

  async adminDeleteQuiz(quizId: string): Promise<APIResponse<void>> {
    const response = await this.client.delete(`/admin/quizzes/${quizId}`);
    return response.data;
  }

  async adminGetAnalytics(params?: {
    startDate?: Date;
    endDate?: Date;
    metric?: string;
  }): Promise<APIResponse<any>> {
    const response = await this.client.get('/admin/analytics', { params });
    return response.data;
  }
}

// Export singleton instance
export const apiClient = new APIClient();

// Export types
export type { APIClient };
