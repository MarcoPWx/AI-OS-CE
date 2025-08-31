/**
 * Test Data Factory
 * Comprehensive test data management with fixtures and seeders
 */

import { faker } from '@faker-js/faker';

// Type definitions
interface User {
  id?: string;
  email: string;
  username: string;
  password: string;
  displayName: string;
  level: number;
  xp: number;
  hearts: number;
  streak: number;
  isPremium: boolean;
  createdAt?: Date;
  preferences?: UserPreferences;
}

interface UserPreferences {
  goal: 'learn' | 'compete' | 'challenge' | 'fun';
  interests: string[];
  timeCommitment: number;
  difficulty: 'easy' | 'medium' | 'hard';
  notifications: boolean;
  darkMode: boolean;
}

interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  isLocked: boolean;
  isPremium: boolean;
  questionsCount: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  unlockRequirements?: {
    level?: number;
    questionsAnswered?: number;
    accuracy?: number;
  };
}

interface Question {
  id: string;
  text: string;
  options: QuestionOption[];
  correctAnswer: number;
  explanation: string;
  difficulty: number;
  category: string;
  tags: string[];
  imageUrl?: string;
  timeLimit: number;
}

interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface QuizSession {
  id: string;
  userId: string;
  categoryId: string;
  questions: Question[];
  answers: Answer[];
  score: number;
  startTime: Date;
  endTime?: Date;
  status: 'in_progress' | 'completed' | 'abandoned';
}

interface Answer {
  questionId: string;
  optionId: string;
  isCorrect: boolean;
  timeSpent: number;
  timestamp: Date;
}

// Factory classes
export class UserFactory {
  static create(overrides?: Partial<User>): User {
    const username = overrides?.username || faker.internet.userName().toLowerCase();

    return {
      id: faker.string.uuid(),
      email: overrides?.email || faker.internet.email().toLowerCase(),
      username,
      password: overrides?.password || 'TestPass123!',
      displayName: overrides?.displayName || faker.person.fullName(),
      level: overrides?.level || faker.number.int({ min: 1, max: 50 }),
      xp: overrides?.xp || faker.number.int({ min: 0, max: 10000 }),
      hearts: overrides?.hearts || faker.number.int({ min: 0, max: 5 }),
      streak: overrides?.streak || faker.number.int({ min: 0, max: 365 }),
      isPremium: overrides?.isPremium || faker.datatype.boolean(),
      createdAt: overrides?.createdAt || faker.date.past(),
      preferences: overrides?.preferences || this.createPreferences(),
      ...overrides,
    };
  }

  static createBatch(count: number, overrides?: Partial<User>): User[] {
    return Array.from({ length: count }, () => this.create(overrides));
  }

  static createPreferences(): UserPreferences {
    return {
      goal: faker.helpers.arrayElement(['learn', 'compete', 'challenge', 'fun']),
      interests: faker.helpers.arrayElements(
        ['technology', 'science', 'history', 'arts', 'sports', 'music', 'geography'],
        { min: 3, max: 5 },
      ),
      timeCommitment: faker.helpers.arrayElement([5, 10, 15, 20, 30]),
      difficulty: faker.helpers.arrayElement(['easy', 'medium', 'hard']),
      notifications: faker.datatype.boolean(),
      darkMode: faker.datatype.boolean(),
    };
  }

  // Specific user types
  static createNewUser(): User {
    return this.create({
      level: 1,
      xp: 0,
      hearts: 5,
      streak: 0,
      isPremium: false,
      createdAt: new Date(),
    });
  }

  static createPremiumUser(): User {
    return this.create({
      isPremium: true,
      hearts: 5, // Always full hearts for premium
      level: faker.number.int({ min: 10, max: 50 }),
    });
  }

  static createAdvancedUser(): User {
    return this.create({
      level: faker.number.int({ min: 20, max: 50 }),
      xp: faker.number.int({ min: 5000, max: 20000 }),
      streak: faker.number.int({ min: 30, max: 365 }),
    });
  }

  static createStrugglingUser(): User {
    return this.create({
      level: faker.number.int({ min: 1, max: 5 }),
      xp: faker.number.int({ min: 0, max: 500 }),
      hearts: faker.number.int({ min: 0, max: 2 }),
      streak: 0,
      isPremium: false,
    });
  }
}

export class CategoryFactory {
  private static categories = [
    { name: 'Technology', icon: '💻', color: '#667EEA' },
    { name: 'Science', icon: '🔬', color: '#84FAB0' },
    { name: 'Mathematics', icon: '📐', color: '#FBD38D' },
    { name: 'History', icon: '📚', color: '#FBB6CE' },
    { name: 'Geography', icon: '🌍', color: '#81E6D9' },
    { name: 'Literature', icon: '📖', color: '#C084FC' },
    { name: 'Arts', icon: '🎨', color: '#FCA5A5' },
    { name: 'Sports', icon: '⚽', color: '#93C5FD' },
    { name: 'Music', icon: '🎵', color: '#FDBA74' },
    { name: 'Movies', icon: '🎬', color: '#A78BFA' },
  ];

  static create(overrides?: Partial<Category>): Category {
    const template = faker.helpers.arrayElement(this.categories);

    return {
      id: faker.string.uuid(),
      name: overrides?.name || template.name,
      description: overrides?.description || faker.lorem.sentence(),
      icon: overrides?.icon || template.icon,
      color: overrides?.color || template.color,
      isLocked: overrides?.isLocked ?? faker.datatype.boolean({ probability: 0.3 }),
      isPremium: overrides?.isPremium ?? faker.datatype.boolean({ probability: 0.2 }),
      questionsCount: overrides?.questionsCount || faker.number.int({ min: 50, max: 500 }),
      difficulty:
        overrides?.difficulty || faker.helpers.arrayElement(['easy', 'medium', 'hard', 'expert']),
      unlockRequirements: overrides?.unlockRequirements || this.createUnlockRequirements(),
      ...overrides,
    };
  }

  static createBatch(count: number = 10): Category[] {
    return this.categories.slice(0, count).map((template, index) =>
      this.create({
        name: template.name,
        icon: template.icon,
        color: template.color,
        isLocked: index > 2, // First 3 categories are unlocked
        isPremium: index > 6, // Last 3 categories are premium
      }),
    );
  }

  private static createUnlockRequirements() {
    const type = faker.helpers.arrayElement(['level', 'questions', 'accuracy', 'mixed']);

    switch (type) {
      case 'level':
        return { level: faker.number.int({ min: 5, max: 30 }) };
      case 'questions':
        return { questionsAnswered: faker.number.int({ min: 50, max: 500 }) };
      case 'accuracy':
        return { accuracy: faker.number.int({ min: 60, max: 90 }) };
      case 'mixed':
        return {
          level: faker.number.int({ min: 5, max: 20 }),
          questionsAnswered: faker.number.int({ min: 50, max: 200 }),
          accuracy: faker.number.int({ min: 70, max: 85 }),
        };
      default:
        return undefined;
    }
  }
}

export class QuestionFactory {
  static create(categoryId: string, overrides?: Partial<Question>): Question {
    const correctIndex = faker.number.int({ min: 0, max: 3 });

    return {
      id: faker.string.uuid(),
      text: overrides?.text || faker.lorem.sentence().replace('.', '?'),
      options: overrides?.options || this.createOptions(correctIndex),
      correctAnswer: overrides?.correctAnswer ?? correctIndex,
      explanation: overrides?.explanation || faker.lorem.paragraph(),
      difficulty: overrides?.difficulty || faker.number.int({ min: 1, max: 5 }),
      category: categoryId,
      tags:
        overrides?.tags ||
        faker.helpers.arrayElements(
          ['basics', 'advanced', 'trivia', 'facts', 'concepts', 'practical'],
          { min: 1, max: 3 },
        ),
      imageUrl: faker.datatype.boolean({ probability: 0.2 }) ? faker.image.url() : undefined,
      timeLimit: overrides?.timeLimit || faker.helpers.arrayElement([30, 45, 60, 90]),
      ...overrides,
    };
  }

  static createBatch(categoryId: string, count: number = 10): Question[] {
    return Array.from({ length: count }, () => this.create(categoryId));
  }

  private static createOptions(correctIndex: number): QuestionOption[] {
    const options: QuestionOption[] = [];

    for (let i = 0; i < 4; i++) {
      options.push({
        id: faker.string.uuid(),
        text: faker.lorem.words(faker.number.int({ min: 1, max: 5 })),
        isCorrect: i === correctIndex,
      });
    }

    return options;
  }

  // Specific question types
  static createEasyQuestion(categoryId: string): Question {
    return this.create(categoryId, {
      difficulty: 1,
      timeLimit: 90,
      options: this.createOptions(faker.number.int({ min: 0, max: 1 })), // Correct answer in first two options
    });
  }

  static createHardQuestion(categoryId: string): Question {
    return this.create(categoryId, {
      difficulty: 5,
      timeLimit: 30,
      text: faker.lorem.sentences(2).replace('.', '?'),
      explanation: faker.lorem.paragraphs(2),
    });
  }

  static createImageQuestion(categoryId: string): Question {
    return this.create(categoryId, {
      imageUrl: faker.image.url(),
      text: 'What is shown in this image?',
    });
  }
}

export class QuizSessionFactory {
  static create(userId: string, categoryId: string, overrides?: Partial<QuizSession>): QuizSession {
    const questions = QuestionFactory.createBatch(categoryId, 10);
    const isCompleted =
      overrides?.status === 'completed' || faker.datatype.boolean({ probability: 0.7 });

    const session: QuizSession = {
      id: faker.string.uuid(),
      userId,
      categoryId,
      questions,
      answers: [],
      score: 0,
      startTime: faker.date.recent(),
      status: isCompleted ? 'completed' : 'in_progress',
      ...overrides,
    };

    if (isCompleted) {
      session.answers = this.createAnswers(questions);
      session.score = this.calculateScore(session.answers);
      session.endTime = new Date(
        session.startTime.getTime() + faker.number.int({ min: 300000, max: 1800000 }),
      );
      session.status = 'completed';
    }

    return session;
  }

  private static createAnswers(questions: Question[]): Answer[] {
    return questions.map((question) => {
      const isCorrect = faker.datatype.boolean({ probability: 0.7 }); // 70% accuracy
      const selectedOption = isCorrect
        ? question.options.find((o) => o.isCorrect)!
        : faker.helpers.arrayElement(question.options.filter((o) => !o.isCorrect));

      return {
        questionId: question.id,
        optionId: selectedOption.id,
        isCorrect,
        timeSpent: faker.number.int({ min: 5, max: 45 }),
        timestamp: faker.date.recent(),
      };
    });
  }

  private static calculateScore(answers: Answer[]): number {
    const correct = answers.filter((a) => a.isCorrect).length;
    return Math.round((correct / answers.length) * 100);
  }

  // Specific session types
  static createPerfectSession(userId: string, categoryId: string): QuizSession {
    const session = this.create(userId, categoryId, { status: 'completed' });
    session.answers = session.questions.map((q) => ({
      questionId: q.id,
      optionId: q.options.find((o) => o.isCorrect)!.id,
      isCorrect: true,
      timeSpent: faker.number.int({ min: 5, max: 20 }),
      timestamp: faker.date.recent(),
    }));
    session.score = 100;
    return session;
  }

  static createFailedSession(userId: string, categoryId: string): QuizSession {
    const session = this.create(userId, categoryId, { status: 'completed' });
    session.answers = session.questions.map((q) => ({
      questionId: q.id,
      optionId: q.options.find((o) => !o.isCorrect)!.id,
      isCorrect: false,
      timeSpent: faker.number.int({ min: 30, max: 60 }),
      timestamp: faker.date.recent(),
    }));
    session.score = 0;
    return session;
  }

  static createAbandonedSession(userId: string, categoryId: string): QuizSession {
    const session = this.create(userId, categoryId, { status: 'abandoned' });
    // Only answer first few questions
    const answeredCount = faker.number.int({ min: 1, max: 3 });
    session.answers = session.questions.slice(0, answeredCount).map((q) => ({
      questionId: q.id,
      optionId: faker.helpers.arrayElement(q.options).id,
      isCorrect: faker.datatype.boolean(),
      timeSpent: faker.number.int({ min: 5, max: 45 }),
      timestamp: faker.date.recent(),
    }));
    return session;
  }
}

// Test data seeders
export class TestDataSeeder {
  private users: User[] = [];
  private categories: Category[] = [];
  private questions: Map<string, Question[]> = new Map();
  private sessions: QuizSession[] = [];

  async seed() {
    this.seedUsers();
    this.seedCategories();
    this.seedQuestions();
    this.seedQuizSessions();

    return {
      users: this.users,
      categories: this.categories,
      questions: this.questions,
      sessions: this.sessions,
    };
  }

  private seedUsers() {
    // Create different user types
    this.users.push(
      UserFactory.createNewUser(),
      UserFactory.createPremiumUser(),
      UserFactory.createAdvancedUser(),
      UserFactory.createStrugglingUser(),
      ...UserFactory.createBatch(10), // Random users
    );
  }

  private seedCategories() {
    this.categories = CategoryFactory.createBatch(10);
  }

  private seedQuestions() {
    this.categories.forEach((category) => {
      const questions = [
        ...QuestionFactory.createBatch(category.id, 20),
        ...Array.from({ length: 5 }, () => QuestionFactory.createEasyQuestion(category.id)),
        ...Array.from({ length: 5 }, () => QuestionFactory.createHardQuestion(category.id)),
        ...Array.from({ length: 3 }, () => QuestionFactory.createImageQuestion(category.id)),
      ];
      this.questions.set(category.id, questions);
    });
  }

  private seedQuizSessions() {
    this.users.forEach((user) => {
      // Each user has taken some quizzes
      const sessionCount = faker.number.int({ min: 1, max: 5 });
      for (let i = 0; i < sessionCount; i++) {
        const category = faker.helpers.arrayElement(this.categories);

        // Mix of different session types
        const sessionType = faker.helpers.arrayElement([
          'normal',
          'perfect',
          'failed',
          'abandoned',
        ]);

        switch (sessionType) {
          case 'perfect':
            this.sessions.push(QuizSessionFactory.createPerfectSession(user.id!, category.id));
            break;
          case 'failed':
            this.sessions.push(QuizSessionFactory.createFailedSession(user.id!, category.id));
            break;
          case 'abandoned':
            this.sessions.push(QuizSessionFactory.createAbandonedSession(user.id!, category.id));
            break;
          default:
            this.sessions.push(QuizSessionFactory.create(user.id!, category.id));
        }
      }
    });
  }

  // Utility methods
  getUser(criteria: Partial<User>): User | undefined {
    return this.users.find((user) =>
      Object.entries(criteria).every(([key, value]) => user[key as keyof User] === value),
    );
  }

  getUsers(criteria?: Partial<User>): User[] {
    if (!criteria) return this.users;

    return this.users.filter((user) =>
      Object.entries(criteria).every(([key, value]) => user[key as keyof User] === value),
    );
  }

  getCategory(id: string): Category | undefined {
    return this.categories.find((cat) => cat.id === id);
  }

  getQuestions(categoryId: string): Question[] {
    return this.questions.get(categoryId) || [];
  }

  getUserSessions(userId: string): QuizSession[] {
    return this.sessions.filter((session) => session.userId === userId);
  }
}

// Test data fixtures
export const fixtures = {
  users: {
    newUser: UserFactory.createNewUser(),
    premiumUser: UserFactory.createPremiumUser(),
    advancedUser: UserFactory.createAdvancedUser(),
    strugglingUser: UserFactory.createStrugglingUser(),
  },

  categories: {
    unlocked: CategoryFactory.create({ isLocked: false, isPremium: false }),
    locked: CategoryFactory.create({ isLocked: true, isPremium: false }),
    premium: CategoryFactory.create({ isLocked: false, isPremium: true }),
  },

  questions: {
    easy: QuestionFactory.createEasyQuestion('test-category'),
    hard: QuestionFactory.createHardQuestion('test-category'),
    withImage: QuestionFactory.createImageQuestion('test-category'),
  },

  sessions: {
    perfect: QuizSessionFactory.createPerfectSession('test-user', 'test-category'),
    failed: QuizSessionFactory.createFailedSession('test-user', 'test-category'),
    abandoned: QuizSessionFactory.createAbandonedSession('test-user', 'test-category'),
  },
};

// Export convenience functions
export function createTestUser(overrides?: Partial<User>): User {
  return UserFactory.create(overrides);
}

export function createTestCategory(overrides?: Partial<Category>): Category {
  return CategoryFactory.create(overrides);
}

export function createTestQuestion(categoryId: string, overrides?: Partial<Question>): Question {
  return QuestionFactory.create(categoryId, overrides);
}

export function createTestSession(
  userId: string,
  categoryId: string,
  overrides?: Partial<QuizSession>,
): QuizSession {
  return QuizSessionFactory.create(userId, categoryId, overrides);
}

export async function seedTestData() {
  const seeder = new TestDataSeeder();
  return await seeder.seed();
}
