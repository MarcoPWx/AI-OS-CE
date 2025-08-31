import {
  LoginRequest,
  SignupRequest,
  AuthResponse,
  ResetPasswordRequest,
  UpdatePasswordRequest,
  StartQuizRequest,
  StartQuizResponse,
  SubmitAnswerRequest,
  SubmitAnswerResponse,
  CompleteQuizRequest,
  CompleteQuizResponse,
  GetLeaderboardRequest,
  GetLeaderboardResponse,
  GetLeagueRequest,
  GetLeagueResponse,
  GetAchievementsRequest,
  GetAchievementsResponse,
} from '../types/api';
import {
  User,
  QuizSession,
  Achievement,
  League,
  Battle,
  Notification,
  Friend,
} from '../types/domain';

// Base service interface
export interface IService {
  initialize?(): Promise<void>;
  cleanup?(): void;
}

// Authentication service interface
export interface IAuthService extends IService {
  login(request: LoginRequest): Promise<AuthResponse>;
  signup(request: SignupRequest): Promise<AuthResponse>;
  loginWithProvider(provider: 'google' | 'apple' | 'facebook'): Promise<void>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<User | null>;
  checkUsernameAvailability(username: string): Promise<boolean>;
  resetPassword(request: ResetPasswordRequest): Promise<void>;
  updatePassword(request: UpdatePasswordRequest): Promise<void>;
  deleteAccount(): Promise<void>;
  refreshAccessToken(): Promise<AuthResponse | null>;
  isAuthenticated(): Promise<boolean>;
  onAuthStateChange(callback: (user: User | null) => void): () => void;
}

// Quiz service interface
export interface IQuizService extends IService {
  startQuiz(request: StartQuizRequest): Promise<StartQuizResponse>;
  submitAnswer(request: SubmitAnswerRequest): Promise<SubmitAnswerResponse>;
  completeQuiz(request: CompleteQuizRequest): Promise<CompleteQuizResponse>;
  getActiveSession(): Partial<QuizSession> | null;
  cancelActiveSession(): void;
  getQuizHistory(userId: string, limit?: number): Promise<QuizSession[]>;
  getQuestionsByCategory(categoryId: string, limit?: number): Promise<any[]>;
}

// Leaderboard service interface
export interface ILeaderboardService extends IService {
  getLeaderboard(request: GetLeaderboardRequest): Promise<GetLeaderboardResponse>;
  getLeague(request: GetLeagueRequest): Promise<GetLeagueResponse>;
  updateScore(userId: string, scoreToAdd: number, categoryId?: string): Promise<void>;
  joinLeague(userId: string): Promise<League>;
  processLeagueResults(): Promise<void>;
  getCurrentLeague(): League | null;
  subscribeToLeagueUpdates(userId: string, callback: (league: League) => void): () => void;
}

// Achievement service interface
export interface IAchievementService extends IService {
  getAchievements(request: GetAchievementsRequest): Promise<GetAchievementsResponse>;
  checkQuizAchievements(userId: string, session: QuizSession): Promise<Achievement[]>;
  getAchievementProgress(userId: string, achievementId: string): Promise<number>;
  getNextAchievements(userId: string, limit?: number): Promise<Achievement[]>;
  getAchievementById(achievementId: string): Achievement | undefined;
  getAllAchievements(): Achievement[];
}

// Battle service interface
export interface IBattleService extends IService {
  createBattle(categoryId: string, type: '1v1' | 'tournament' | 'team'): Promise<Battle>;
  joinBattle(roomCode: string): Promise<Battle>;
  leaveBattle(battleId: string): Promise<void>;
  submitBattleAnswer(battleId: string, questionId: string, answer: number): Promise<void>;
  getBattleStatus(battleId: string): Promise<Battle>;
  subscribeToBattleUpdates(battleId: string, callback: (update: any) => void): () => void;
  findOpponent(categoryId: string): Promise<Battle | null>;
}

// Notification service interface
export interface INotificationService extends IService {
  getNotifications(userId: string, unreadOnly?: boolean): Promise<Notification[]>;
  markAsRead(notificationIds: string[]): Promise<void>;
  sendNotification(userId: string, notification: Partial<Notification>): Promise<void>;
  scheduleNotification(
    userId: string,
    notification: Partial<Notification>,
    sendAt: Date,
  ): Promise<void>;
  subscribeToNotifications(
    userId: string,
    callback: (notification: Notification) => void,
  ): () => void;
  updateNotificationSettings(userId: string, settings: any): Promise<void>;
}

// Friend service interface
export interface IFriendService extends IService {
  getFriends(userId: string): Promise<Friend[]>;
  sendFriendRequest(userId: string, friendId: string): Promise<void>;
  acceptFriendRequest(userId: string, friendId: string): Promise<void>;
  rejectFriendRequest(userId: string, friendId: string): Promise<void>;
  removeFriend(userId: string, friendId: string): Promise<void>;
  blockUser(userId: string, blockedUserId: string): Promise<void>;
  unblockUser(userId: string, blockedUserId: string): Promise<void>;
  getSuggestedFriends(userId: string): Promise<any[]>;
  challengeFriend(userId: string, friendId: string, categoryId: string): Promise<Battle>;
}

// Storage service interface
export interface IStorageService {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T): Promise<void>;
  remove(key: string): Promise<void>;
  clear(): Promise<void>;
  getAllKeys(): Promise<string[]>;
}

// Analytics service interface
export interface IAnalyticsService extends IService {
  track(event: string, properties?: Record<string, any>): void;
  identify(userId: string, traits?: Record<string, any>): void;
  screen(name: string, properties?: Record<string, any>): void;
  group(groupId: string, traits?: Record<string, any>): void;
  alias(userId: string): void;
  reset(): void;
}

// Service container interface
export interface IServiceContainer {
  register<T>(name: string, service: T): void;
  get<T>(name: string): T;
  has(name: string): boolean;
  reset(): void;
}

// Service factory interface
export interface IServiceFactory {
  createAuthService(): IAuthService;
  createQuizService(): IQuizService;
  createLeaderboardService(): ILeaderboardService;
  createAchievementService(): IAchievementService;
  createBattleService(): IBattleService;
  createNotificationService(): INotificationService;
  createFriendService(): IFriendService;
  createStorageService(): IStorageService;
  createAnalyticsService(): IAnalyticsService;
}

// Configuration interface
export interface IServiceConfig {
  apiUrl?: string;
  apiKey?: string;
  environment?: 'development' | 'staging' | 'production';
  debug?: boolean;
  offline?: boolean;
  cache?: {
    enabled: boolean;
    ttl: number;
  };
  retry?: {
    maxAttempts: number;
    delay: number;
    backoff: boolean;
  };
}

// Error types
export enum ServiceErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  AUTH_ERROR = 'AUTH_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  RATE_LIMIT = 'RATE_LIMIT',
  SERVER_ERROR = 'SERVER_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export class ServiceError extends Error {
  constructor(
    public type: ServiceErrorType,
    public message: string,
    public details?: any,
  ) {
    super(message);
    this.name = 'ServiceError';
  }
}
