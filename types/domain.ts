// Domain Entity Interfaces

export interface User {
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile extends User {
  level: number;
  totalXp: number;
  stars: number;
  rating: number;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: Date;
  hearts: number;
  unlimitedHearts: boolean;
  streakFreezes: number;
  isPremium: boolean;
  subscriptionTier?: 'free' | 'plus' | 'team' | 'lifetime';
  achievements: UserAchievement[];
  stats: UserStats;
  preferences: UserPreferences;
}

export interface UserStats {
  totalQuestionsAnswered: number;
  correctAnswers: number;
  accuracy: number;
  averageTimePerQuestion: number;
  categoriesCompleted: number;
  perfectQuizzes: number;
  dailyChallengesCompleted: number;
  battlesWon: number;
  battlesLost: number;
  friendsCount: number;
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

export interface Question {
  id: string;
  categoryId: string;
  categorySlug: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  tags: string[];
  imageUrl?: string;
  timeLimit?: number;
  points: number;
  metadata?: Record<string, any>;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  order: number;
  parentId?: string;
  questionCount: number;
  requiredLevel?: number;
  isPremium: boolean;
  children?: Category[];
}

export interface QuizSession {
  id: string;
  userId: string;
  categoryId: string;
  categoryName: string;
  type: 'practice' | 'daily' | 'battle' | 'challenge';
  score: number;
  maxScore: number;
  accuracy: number;
  timeSpent: number;
  questionsAnswered: number;
  correctAnswers: number;
  wrongAnswers: number;
  skippedQuestions: number;
  stars: number;
  xpEarned: number;
  streakBonus: number;
  perfectBonus: number;
  speedBonus: number;
  completedAt: Date;
  questions: QuizQuestion[];
}

export interface QuizQuestion {
  questionId: string;
  userAnswer: number | null;
  isCorrect: boolean;
  timeSpent: number;
  usedPowerUp?: PowerUpType;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'speed' | 'accuracy' | 'dedication' | 'social' | 'special';
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  criteria: AchievementCriteria;
  xpReward: number;
  starReward: number;
  badgeUrl?: string;
  isSecret: boolean;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

export interface AchievementCriteria {
  type: string;
  target: number;
  timeframe?: 'daily' | 'weekly' | 'monthly' | 'all-time';
  conditions?: Record<string, any>;
}

export interface UserAchievement {
  achievementId: string;
  achievement: Achievement;
  unlockedAt: Date;
  progress: number;
  isCompleted: boolean;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  score: number;
  level: number;
  change: number; // Position change from last period
  isCurrentUser: boolean;
  isFriend: boolean;
}

export interface League {
  id: string;
  name: 'bronze' | 'silver' | 'gold' | 'diamond' | 'master' | 'grandmaster';
  icon: string;
  color: string;
  minScore: number;
  maxScore?: number;
  participants: LeaderboardEntry[];
  promotionZone: number; // Top N users get promoted
  relegationZone: number; // Bottom N users get relegated
  weekNumber: number;
  startDate: Date;
  endDate: Date;
}

export interface Streak {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: Date;
  freezesAvailable: number;
  freezesUsed: number;
  todayCompleted: boolean;
  milestone: StreakMilestone | null;
}

export interface StreakMilestone {
  days: number;
  name: string;
  icon: string;
  reward: {
    xp: number;
    stars: number;
    freezes?: number;
  };
}

export interface DailyChallenge {
  id: string;
  date: Date;
  categoryId: string;
  categoryName: string;
  questions: Question[];
  difficulty: 'easy' | 'medium' | 'hard';
  xpMultiplier: number;
  timeLimit?: number;
  participants: number;
  averageScore: number;
  topScore: number;
  userScore?: number;
  completed: boolean;
}

export interface Battle {
  id: string;
  roomCode: string;
  status: 'waiting' | 'starting' | 'in_progress' | 'completed';
  type: '1v1' | 'tournament' | 'team';
  categoryId: string;
  participants: BattleParticipant[];
  questions: Question[];
  currentQuestion: number;
  timePerQuestion: number;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  winner?: BattleParticipant;
}

export interface BattleParticipant {
  userId: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  score: number;
  answers: number[];
  timeSpent: number[];
  isReady: boolean;
  isConnected: boolean;
  rating: number;
  ratingChange?: number;
}

export type PowerUpType = 'fifty_fifty' | 'skip' | 'time_freeze' | 'double_xp' | 'hint';

export interface PowerUp {
  type: PowerUpType;
  name: string;
  description: string;
  icon: string;
  cost: {
    stars?: number;
    coins?: number;
  };
  quantity: number;
  cooldown?: number;
  effect: PowerUpEffect;
}

export interface PowerUpEffect {
  type: string;
  value: number | string;
  duration?: number;
}

export interface Friend {
  userId: string;
  friendId: string;
  friend: UserProfile;
  status: 'pending' | 'accepted' | 'blocked';
  createdAt: Date;
  sharedStreak?: number;
  challengesPlayed: number;
  challengesWon: number;
}

export interface Notification {
  id: string;
  userId: string;
  type:
    | 'streak_reminder'
    | 'challenge_invite'
    | 'achievement'
    | 'friend_request'
    | 'promotion'
    | 'system';
  title: string;
  message: string;
  data?: Record<string, any>;
  read: boolean;
  createdAt: Date;
  expiresAt?: Date;
}

export interface Subscription {
  id: string;
  userId: string;
  tier: 'free' | 'plus' | 'team' | 'lifetime';
  status: 'active' | 'cancelled' | 'expired' | 'paused';
  startDate: Date;
  endDate?: Date;
  billingCycle?: 'monthly' | 'annual';
  price?: number;
  currency?: string;
  features: string[];
  autoRenew: boolean;
  paymentMethod?: string;
  teamSeats?: number;
  teamMembers?: string[];
}

export interface AnalyticsEvent {
  id: string;
  userId: string;
  sessionId: string;
  event: string;
  properties: Record<string, any>;
  timestamp: Date;
  platform: 'ios' | 'android' | 'web';
  appVersion: string;
  deviceInfo?: Record<string, any>;
}

export interface CategoryProgress {
  userId: string;
  categoryId: string;
  questionsAnswered: number;
  correctAnswers: number;
  accuracy: number;
  currentStreak: number;
  bestStreak: number;
  categoryRating: number;
  crownsEarned: number;
  maxCrowns: number;
  lastActivity: Date;
  completionPercentage: number;
  unlockedQuestions: string[];
  masteryLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'master';
}

export interface LearningPath {
  id: string;
  name: string;
  description: string;
  icon: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedHours: number;
  categories: string[];
  prerequisites: string[];
  milestones: PathMilestone[];
  certificateUrl?: string;
  enrolledUsers: number;
  averageRating: number;
  completionRate: number;
}

export interface PathMilestone {
  id: string;
  name: string;
  description: string;
  order: number;
  requiredQuestions: number;
  requiredAccuracy: number;
  categoryId: string;
  reward: {
    xp: number;
    stars: number;
    badge?: string;
  };
}

export interface UserProgress {
  userId: string;
  pathId: string;
  enrolledAt: Date;
  completedMilestones: string[];
  currentMilestone: string;
  progressPercentage: number;
  totalTimeSpent: number;
  lastActivityAt: Date;
  completedAt?: Date;
  certificateEarned: boolean;
}
