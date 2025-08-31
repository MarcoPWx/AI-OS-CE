import {
  User,
  UserProfile,
  Question,
  Category,
  QuizSession,
  Achievement,
  LeaderboardEntry,
  League,
  Battle,
  Friend,
  Notification,
  Streak,
} from '../../types/domain';
import { LoginRequest, SignupRequest, StartQuizRequest, AuthResponse } from '../../types/api';

/**
 * Test data factories for generating consistent test data
 */

// Counter for unique IDs
let idCounter = 0;
const nextId = () => `test-id-${++idCounter}`;

// User factory
export const createMockUser = (overrides?: Partial<User>): User => ({
  id: nextId(),
  email: 'test@example.com',
  username: 'testuser',
  displayName: 'Test User',
  avatarUrl: 'https://example.com/avatar.jpg',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
});

// UserProfile factory
export const createMockUserProfile = (overrides?: Partial<UserProfile>): UserProfile => ({
  ...createMockUser(),
  level: 1,
  totalXp: 0,
  stars: 50,
  rating: 1200,
  currentStreak: 0,
  longestStreak: 0,
  lastActiveDate: new Date('2024-01-01'),
  hearts: 5,
  unlimitedHearts: false,
  streakFreezes: 2,
  isPremium: false,
  subscriptionTier: 'free',
  achievements: [],
  stats: {
    totalQuestionsAnswered: 0,
    correctAnswers: 0,
    accuracy: 0,
    averageTimePerQuestion: 0,
    categoriesCompleted: 0,
    perfectQuizzes: 0,
    dailyChallengesCompleted: 0,
    battlesWon: 0,
    battlesLost: 0,
    friendsCount: 0,
  },
  preferences: {
    notificationsEnabled: true,
    soundEnabled: true,
    hapticEnabled: true,
    theme: 'light',
    language: 'en',
    difficulty: 'medium',
  },
  ...overrides,
});

// Question factory
export const createMockQuestion = (overrides?: Partial<Question>): Question => ({
  id: nextId(),
  categoryId: 'cat-1',
  categorySlug: 'javascript',
  question: 'What is the result of 2 + 2?',
  options: ['3', '4', '5', '6'],
  correctAnswer: 1,
  explanation: '2 + 2 equals 4',
  difficulty: 1,
  tags: ['math', 'basic'],
  points: 10,
  ...overrides,
});

// Category factory
export const createMockCategory = (overrides?: Partial<Category>): Category => ({
  id: nextId(),
  name: 'JavaScript',
  slug: 'javascript',
  description: 'Test your JavaScript knowledge',
  icon: '🌟',
  color: '#f7df1e',
  order: 1,
  questionCount: 50,
  isPremium: false,
  ...overrides,
});

// QuizSession factory
export const createMockQuizSession = (overrides?: Partial<QuizSession>): QuizSession => ({
  id: nextId(),
  userId: 'user-1',
  categoryId: 'cat-1',
  categoryName: 'JavaScript',
  type: 'practice',
  score: 80,
  maxScore: 100,
  accuracy: 80,
  timeSpent: 300,
  questionsAnswered: 10,
  correctAnswers: 8,
  wrongAnswers: 2,
  skippedQuestions: 0,
  stars: 5,
  xpEarned: 100,
  streakBonus: 10,
  perfectBonus: 0,
  speedBonus: 20,
  completedAt: new Date('2024-01-01'),
  questions: [],
  ...overrides,
});

// Achievement factory
export const createMockAchievement = (overrides?: Partial<Achievement>): Achievement => ({
  id: nextId(),
  name: 'First Steps',
  description: 'Complete your first quiz',
  icon: '🎯',
  category: 'dedication',
  tier: 'bronze',
  criteria: {
    type: 'quiz_count',
    target: 1,
  },
  xpReward: 50,
  starReward: 10,
  isSecret: false,
  rarity: 'common',
  ...overrides,
});

// LeaderboardEntry factory
export const createMockLeaderboardEntry = (
  overrides?: any,
): LeaderboardEntry => ({
  rank: 1,
  userId: 'user-1',
  username: 'testuser',
  displayName: 'Test User',
  avatarUrl: 'https://example.com/avatar.jpg',
  score: 1000,
  level: 10,
  change: 0,
  isCurrentUser: false,
  isFriend: false,
  // Extended fields used by some tests
  totalXp: 1000,
  totalStars: 50,
  quizzesCompleted: 25,
  perfectScores: 5,
  currentStreak: 3,
  longestStreak: 10,
  badges: ['starter'],
  isPremium: false,
  country: 'US',
  lastActive: new Date('2024-01-01'),
  ...overrides,
});

// League factory
export const createMockLeague = (overrides?: Partial<League>): League => ({
  id: nextId(),
  name: 'bronze',
  icon: '🥉',
  color: '#CD7F32',
  minScore: 0,
  maxScore: 1000,
  participants: [],
  promotionZone: 10,
  relegationZone: 10,
  weekNumber: 1,
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-01-07'),
  ...overrides,
});

// Battle factory
export const createMockBattle = (overrides?: Partial<Battle>): Battle => ({
  id: nextId(),
  roomCode: 'ABCD1234',
  status: 'waiting',
  type: '1v1',
  categoryId: 'cat-1',
  participants: [],
  questions: [],
  currentQuestion: 0,
  timePerQuestion: 30,
  createdAt: new Date('2024-01-01'),
  ...overrides,
});

// Friend factory
export const createMockFriend = (overrides?: Partial<Friend>): Friend => ({
  userId: 'user-1',
  friendId: 'friend-1',
  friend: createMockUserProfile({ id: 'friend-1' }),
  status: 'accepted',
  createdAt: new Date('2024-01-01'),
  challengesPlayed: 0,
  challengesWon: 0,
  ...overrides,
});

// Notification factory
export const createMockNotification = (overrides?: Partial<Notification>): Notification => ({
  id: nextId(),
  userId: 'user-1',
  type: 'system',
  title: 'Test Notification',
  message: 'This is a test notification',
  read: false,
  createdAt: new Date('2024-01-01'),
  ...overrides,
});

// Streak factory
export const createMockStreak = (overrides?: Partial<Streak>): Streak => ({
  currentStreak: 0,
  longestStreak: 0,
  lastActiveDate: new Date('2024-01-01'),
  freezesAvailable: 2,
  freezesUsed: 0,
  todayCompleted: false,
  milestone: null,
  ...overrides,
});

// API request factories
export const createMockLoginRequest = (overrides?: Partial<LoginRequest>): LoginRequest => ({
  email: 'test@example.com',
  password: 'password123',
  ...overrides,
});

export const createMockSignupRequest = (overrides?: Partial<SignupRequest>): SignupRequest => ({
  email: 'newuser@example.com',
  password: 'password123',
  username: 'newuser',
  displayName: 'New User',
  ...overrides,
});

export const createMockStartQuizRequest = (
  overrides?: Partial<StartQuizRequest>,
): StartQuizRequest => ({
  categoryId: 'cat-1',
  type: 'practice',
  ...overrides,
});

export const createMockAuthResponse = (overrides?: Partial<AuthResponse>): AuthResponse => ({
  user: createMockUser(),
  accessToken: 'mock-access-token',
  refreshToken: 'mock-refresh-token',
  expiresIn: 3600,
  ...overrides,
});

// Batch factories for creating multiple items
export const createMockQuestions = (count: number = 10): Question[] => {
  return Array.from({ length: count }, (_, i) =>
    createMockQuestion({
      id: `question-${i + 1}`,
      question: `Question ${i + 1}`,
      difficulty: (Math.floor(Math.random() * 5) + 1) as any,
    }),
  );
};

export const createMockCategories = (count: number = 5): Category[] => {
  const categoryNames = ['JavaScript', 'Python', 'React', 'Node.js', 'TypeScript'];
  return Array.from({ length: Math.min(count, categoryNames.length) }, (_, i) =>
    createMockCategory({
      id: `category-${i + 1}`,
      name: categoryNames[i],
      slug: categoryNames[i].toLowerCase().replace('.', ''),
      order: i + 1,
    }),
  );
};

export const createMockLeaderboard = (count: number = 10): LeaderboardEntry[] => {
  return Array.from({ length: count }, (_, i) =>
    createMockLeaderboardEntry({
      rank: i + 1,
      userId: `user-${i + 1}`,
      username: `user${i + 1}`,
      displayName: `User ${i + 1}`,
      score: 1000 - i * 50,
      totalXp: 1000 - i * 50,
      level: 10 - Math.floor(i / 2),
      lastActive: new Date('2024-01-01'),
    }),
  );
};

// Backward-compatible helpers expected by some tests
export const createMockLeaderboardEntries = (count: number = 10): LeaderboardEntry[] =>
  createMockLeaderboard(count);

export const createMockUserStats = () => ({
  totalXp: 12345,
  totalStars: 678,
  quizzesCompleted: 90,
  perfectScores: 12,
  currentStreak: 7,
  longestStreak: 21,
  accuracyRate: 85.5,
  rank: 42,
  level: 12,
  badges: ['early_bird', 'quick_learner'],
  achievements: ['first_quiz', 'streak_7'],
  categoriesMastered: 3,
  totalTimeSpent: 123456,
});

// Helper function to reset ID counter (useful for test isolation)
export const resetIdCounter = () => {
  idCounter = 0;
};

// Helper to create a complete mock quiz session with questions
export const createMockQuizSessionWithQuestions = (questionCount: number = 10) => {
  const questions = createMockQuestions(questionCount);
  const correctAnswers = Math.floor(questionCount * 0.8);
  const wrongAnswers = questionCount - correctAnswers;

  return createMockQuizSession({
    questions: questions.map((q, i) => ({
      questionId: q.id,
      userAnswer: i < correctAnswers ? q.correctAnswer : 0,
      isCorrect: i < correctAnswers,
      timeSpent: Math.floor(Math.random() * 30) + 5,
    })),
    questionsAnswered: questionCount,
    correctAnswers,
    wrongAnswers,
    accuracy: (correctAnswers / questionCount) * 100,
  });
};
