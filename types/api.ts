// API Contracts and DTOs

import {
  User,
  UserProfile,
  Question,
  Category,
  QuizSession,
  Achievement,
  LeaderboardEntry,
  League,
  DailyChallenge,
  Battle,
  Friend,
  Notification,
  CategoryProgress,
  LearningPath,
  UserProgress,
  Streak,
} from './domain';

// Base Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  metadata?: ResponseMetadata;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: Date;
}

export interface ResponseMetadata {
  timestamp: Date;
  version: string;
  requestId: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// Authentication DTOs
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface SignupRequest {
  email: string;
  password: string;
  username: string;
  displayName: string;
  referralCode?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface ResetPasswordRequest {
  email: string;
}

export interface UpdatePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface VerifyEmailRequest {
  token: string;
}

// User DTOs
export interface UpdateProfileRequest {
  displayName?: string;
  avatarUrl?: string;
  preferences?: Partial<UserPreferences>;
}

export interface UserPreferences {
  notificationsEnabled: boolean;
  dailyReminderTime?: string;
  soundEnabled: boolean;
  hapticEnabled: boolean;
  theme: 'light' | 'dark' | 'auto';
  language: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'adaptive';
}

export interface GetUserProfileResponse {
  profile: UserProfile;
  stats: UserStatsSummary;
  recentActivity: ActivityItem[];
}

export interface UserStatsSummary {
  dailyStats: DailyStats;
  weeklyStats: WeeklyStats;
  monthlyStats: MonthlyStats;
  allTimeStats: AllTimeStats;
}

export interface DailyStats {
  questionsAnswered: number;
  xpEarned: number;
  accuracy: number;
  streakMaintained: boolean;
}

export interface WeeklyStats {
  questionsAnswered: number;
  xpEarned: number;
  accuracy: number;
  daysActive: number;
  leaguePosition: number;
}

export interface MonthlyStats {
  questionsAnswered: number;
  xpEarned: number;
  accuracy: number;
  daysActive: number;
  achievementsUnlocked: number;
}

export interface AllTimeStats {
  totalQuestionsAnswered: number;
  totalXp: number;
  overallAccuracy: number;
  categoriesmastered: number;
  achievementsUnlocked: number;
  battlesWon: number;
}

export interface ActivityItem {
  id: string;
  type: 'quiz' | 'achievement' | 'battle' | 'friend' | 'streak';
  description: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

// Quiz DTOs
export interface StartQuizRequest {
  categoryId: string;
  type: 'practice' | 'daily' | 'challenge';
  difficulty?: 'easy' | 'medium' | 'hard' | 'adaptive';
  questionCount?: number;
}

export interface StartQuizResponse {
  sessionId: string;
  questions: Question[];
  timeLimit?: number;
  bonusMultiplier: number;
}

export interface SubmitAnswerRequest {
  sessionId: string;
  questionId: string;
  answer: number;
  timeSpent: number;
  usedPowerUp?: string;
}

export interface SubmitAnswerResponse {
  isCorrect: boolean;
  correctAnswer: number;
  explanation: string;
  xpEarned: number;
  starsEarned: number;
  streakBonus?: number;
}

export interface CompleteQuizRequest {
  sessionId: string;
  answers: QuizAnswer[];
  totalTime: number;
}

export interface QuizAnswer {
  questionId: string;
  answer: number | null;
  timeSpent: number;
  usedPowerUp?: string;
}

export interface CompleteQuizResponse {
  session: QuizSession;
  rewards: QuizRewards;
  achievements: Achievement[];
  leaderboardUpdate?: LeaderboardUpdate;
}

export interface QuizRewards {
  xp: number;
  stars: number;
  streakBonus: number;
  perfectBonus: number;
  speedBonus: number;
  totalXp: number;
  newLevel?: number;
  unlocks?: string[];
}

export interface LeaderboardUpdate {
  previousRank: number;
  currentRank: number;
  leaguePromotion?: boolean;
  leagueRelegation?: boolean;
}

// Category DTOs
export interface GetCategoriesRequest {
  includeProgress?: boolean;
  includePremium?: boolean;
}

export interface GetCategoriesResponse {
  categories: CategoryWithProgress[];
  userLevel: number;
  premiumStatus: boolean;
}

export interface CategoryWithProgress extends Category {
  progress?: CategoryProgress;
  isUnlocked: boolean;
  nextUnlockLevel?: number;
}

// Question DTOs
export interface GetQuestionsRequest {
  categoryId?: string;
  difficulty?: number[];
  tags?: string[];
  limit?: number;
  offset?: number;
  excludeAnswered?: boolean;
}

export interface GetQuestionsResponse extends PaginatedResponse<Question> {
  categoryName?: string;
  totalInCategory?: number;
}

// Achievement DTOs
export interface GetAchievementsRequest {
  category?: string;
  includeSecret?: boolean;
  onlyUnlocked?: boolean;
}

export interface GetAchievementsResponse {
  achievements: AchievementWithProgress[];
  totalUnlocked: number;
  totalAvailable: number;
  totalXpEarned: number;
  totalStarsEarned: number;
}

export interface AchievementWithProgress extends Achievement {
  userProgress?: {
    progress: number;
    isCompleted: boolean;
    unlockedAt?: Date;
  };
}

// Leaderboard DTOs
export interface GetLeaderboardRequest {
  type: 'global' | 'friends' | 'category' | 'league';
  period: 'daily' | 'weekly' | 'monthly' | 'all-time';
  categoryId?: string;
  limit?: number;
  offset?: number;
}

export interface GetLeaderboardResponse extends PaginatedResponse<LeaderboardEntry> {
  userPosition?: LeaderboardEntry;
  lastUpdated: Date;
}

// League DTOs
export interface GetLeagueRequest {
  leagueId?: string;
  userId?: string;
}

export interface GetLeagueResponse {
  league: League;
  userPosition: number;
  timeRemaining: number;
  promotionThreshold: number;
  relegationThreshold: number;
}

// Streak DTOs
export interface GetStreakResponse {
  streak: Streak;
  nextMilestone?: StreakMilestone;
  history: StreakHistory[];
}

export interface StreakHistory {
  date: Date;
  completed: boolean;
  questionsAnswered: number;
  xpEarned: number;
}

export interface UseStreakFreezeRequest {
  date?: Date;
}

export interface UseStreakFreezeResponse {
  success: boolean;
  freezesRemaining: number;
  streakMaintained: boolean;
}

// Daily Challenge DTOs
export interface GetDailyChallengeResponse {
  challenge: DailyChallenge;
  userAttempts: number;
  maxAttempts: number;
  leaderboard: LeaderboardEntry[];
}

export interface StartDailyChallengeResponse {
  sessionId: string;
  questions: Question[];
  timeLimit: number;
  xpMultiplier: number;
}

// Battle DTOs
export interface CreateBattleRequest {
  categoryId: string;
  type: '1v1' | 'tournament' | 'team';
  isPrivate: boolean;
  maxParticipants?: number;
  timePerQuestion?: number;
}

export interface CreateBattleResponse {
  battle: Battle;
  roomCode: string;
  joinUrl: string;
}

export interface JoinBattleRequest {
  roomCode: string;
}

export interface JoinBattleResponse {
  battle: Battle;
  position: number;
}

export interface BattleUpdateMessage {
  type:
    | 'player_joined'
    | 'player_left'
    | 'player_ready'
    | 'game_starting'
    | 'question_revealed'
    | 'answer_submitted'
    | 'round_complete'
    | 'game_complete';
  data: any;
  timestamp: Date;
}

// Friend DTOs
export interface SendFriendRequestRequest {
  username?: string;
  userId?: string;
  message?: string;
}

export interface GetFriendsResponse extends PaginatedResponse<Friend> {
  pendingRequests: Friend[];
  suggestedFriends: SuggestedFriend[];
}

export interface SuggestedFriend {
  userId: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  mutualFriends: number;
  reason: string;
}

export interface ChallengeFriendRequest {
  friendId: string;
  categoryId: string;
  wager?: {
    type: 'xp' | 'stars';
    amount: number;
  };
}

// Notification DTOs
export interface GetNotificationsRequest {
  unreadOnly?: boolean;
  types?: string[];
  limit?: number;
  offset?: number;
}

export interface GetNotificationsResponse extends PaginatedResponse<Notification> {
  unreadCount: number;
}

export interface MarkNotificationReadRequest {
  notificationIds: string[];
}

export interface UpdateNotificationSettingsRequest {
  streakReminders: boolean;
  challengeInvites: boolean;
  friendRequests: boolean;
  achievements: boolean;
  promotions: boolean;
  reminderTime?: string;
  quietHoursStart?: string;
  quietHoursEnd?: string;
}

// Learning Path DTOs
export interface GetLearningPathsRequest {
  difficulty?: string;
  category?: string;
  includeEnrolled?: boolean;
}

export interface GetLearningPathsResponse {
  paths: LearningPathWithProgress[];
  enrolledPaths: string[];
  recommendedPaths: string[];
}

export interface LearningPathWithProgress extends LearningPath {
  userProgress?: UserProgress;
  isEnrolled: boolean;
  isCompleted: boolean;
}

export interface EnrollInPathRequest {
  pathId: string;
}

export interface EnrollInPathResponse {
  success: boolean;
  pathProgress: UserProgress;
  firstMilestone: PathMilestone;
}

// Analytics DTOs
export interface TrackEventRequest {
  event: string;
  properties: Record<string, any>;
  timestamp?: Date;
}

export interface GetAnalyticsRequest {
  userId?: string;
  events?: string[];
  startDate: Date;
  endDate: Date;
  groupBy?: 'hour' | 'day' | 'week' | 'month';
}

export interface GetAnalyticsResponse {
  events: AnalyticsEvent[];
  summary: AnalyticsSummary;
  charts: ChartData[];
}

export interface AnalyticsEvent {
  event: string;
  count: number;
  uniqueUsers: number;
  properties: Record<string, any>;
}

export interface AnalyticsSummary {
  totalEvents: number;
  uniqueUsers: number;
  avgSessionDuration: number;
  bounceRate: number;
  conversionRate: number;
}

export interface ChartData {
  name: string;
  type: 'line' | 'bar' | 'pie';
  data: any[];
  labels: string[];
}

// Subscription DTOs
export interface GetSubscriptionStatusResponse {
  subscription: Subscription | null;
  features: string[];
  limits: SubscriptionLimits;
  upgradeOptions: UpgradeOption[];
}

export interface SubscriptionLimits {
  heartsPerDay: number;
  freezesPerMonth: number;
  categoriesAvailable: number;
  powerUpsPerDay: number;
  friendsLimit: number;
  offlineQuestions: number;
}

export interface UpgradeOption {
  tier: string;
  price: number;
  currency: string;
  billingCycle: string;
  features: string[];
  savings?: number;
  popular?: boolean;
}

export interface UpdateSubscriptionRequest {
  tier: string;
  billingCycle?: string;
  paymentMethod?: string;
}

// Power-up DTOs
export interface GetPowerUpsResponse {
  powerUps: PowerUp[];
  dailyFreeRemaining: number;
  nextFreeReset: Date;
}

export interface UsePowerUpRequest {
  powerUpType: string;
  sessionId?: string;
  questionId?: string;
}

export interface UsePowerUpResponse {
  success: boolean;
  effect: any;
  remaining: number;
}

export interface PurchasePowerUpRequest {
  powerUpType: string;
  quantity: number;
  paymentType: 'stars' | 'coins' | 'money';
}

// WebSocket Message Types
export interface WSMessage {
  type: string;
  payload: any;
  timestamp: Date;
}

export interface WSSubscribeRequest {
  channels: string[];
}

export interface WSUnsubscribeRequest {
  channels: string[];
}
