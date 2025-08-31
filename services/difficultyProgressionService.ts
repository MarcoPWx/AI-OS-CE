import { Question, UserProfile, CategoryProgress, QuizSession } from '../types/domain';
import { supabase } from '../lib/supabase';
import authService from './authService';
import { devQuizData } from './devQuizData';

/**
 * Advanced Difficulty Progression Service
 * Implements adaptive learning with optimal challenge levels
 * Based on research: Target 70-85% success rate for optimal engagement
 */
export class DifficultyProgressionService {
  private static instance: DifficultyProgressionService;

  // Optimal configuration based on research
  private readonly config = {
    targetSuccessRate: { min: 0.7, max: 0.85, optimal: 0.75 },
    sessionLength: {
      casual: 5, // 5-7 questions for casual play
      standard: 7,
      challenge: 10,
      mastery: 15,
    },
    difficultyLevels: {
      beginner: { min: 1, max: 2, label: 'Beginner' },
      elementary: { min: 2, max: 3, label: 'Elementary' },
      intermediate: { min: 3, max: 4, label: 'Intermediate' },
      advanced: { min: 4, max: 5, label: 'Advanced' },
      expert: { min: 5, max: 5, label: 'Expert' },
    },
    mistakeTolerance: {
      practice: Infinity, // Unlimited with hearts
      standard: 3, // 3 mistakes allowed
      challenge: 2, // 2 mistakes allowed
      competitive: 0, // No mistakes (elimination)
    },
    adaptiveThresholds: {
      increaseAfter: 3, // Consecutive correct answers
      decreaseAfter: 2, // Consecutive wrong answers
      maxAdjustment: 0.5, // Maximum difficulty adjustment per question
    },
  };

  private userPerformanceCache = new Map<string, UserPerformanceMetrics>();

  private constructor() {}

  static getInstance(): DifficultyProgressionService {
    if (!DifficultyProgressionService.instance) {
      DifficultyProgressionService.instance = new DifficultyProgressionService();
    }
    return DifficultyProgressionService.instance;
  }

  /**
   * Calculate optimal difficulty for next question
   * Uses adaptive algorithm based on recent performance
   */
  async calculateOptimalDifficulty(
    userId: string,
    categoryId: string,
    recentAnswers: boolean[],
  ): Promise<number> {
    try {
      // Get user's current skill level
      const skillLevel = await this.getUserSkillLevel(userId, categoryId);

      // Calculate performance trend
      const performanceTrend = this.calculatePerformanceTrend(recentAnswers);

      // Apply adaptive difficulty formula
      // Optimal Difficulty = Current Skill Level + 0.3 * Performance Trend
      let optimalDifficulty = skillLevel + 0.3 * performanceTrend;

      // Apply bounds (1-5)
      optimalDifficulty = Math.max(1, Math.min(5, optimalDifficulty));

      // Check if we need comeback mechanics (anti-frustration)
      if (this.needsComebackMechanic(recentAnswers)) {
        optimalDifficulty = Math.max(1, optimalDifficulty - 1);
      }

      return Math.round(optimalDifficulty * 10) / 10; // Round to 1 decimal
    } catch (error) {
      console.error('Error calculating optimal difficulty:', error);
      return 2; // Default to easy-medium
    }
  }

  /**
   * Generate optimized question set for a quiz session
   * Implements the 4-2-1 rule for difficulty distribution
   */
  async generateOptimizedQuestionSet(
    userId: string,
    categoryId: string,
    sessionType: 'casual' | 'standard' | 'challenge' | 'mastery',
    userHistory?: QuizSession[],
  ): Promise<QuestionSelectionResult> {
    try {
      const questionCount = this.config.sessionLength[sessionType];
      const userLevel = await this.getUserSkillLevel(userId, categoryId);

      // Apply 4-2-1 rule for balanced difficulty
      const distribution = this.calculateDifficultyDistribution(questionCount, userLevel);

      // Get questions with smart selection
      const questions = await this.selectQuestionsWithSpacedRepetition(
        categoryId,
        distribution,
        userHistory,
      );

      // Optimize question order (warm-up → core → challenge)
      const optimizedQuestions = this.optimizeQuestionOrder(questions);

      return {
        questions: optimizedQuestions,
        sessionConfig: {
          mistakeTolerance:
            this.config.mistakeTolerance[sessionType === 'casual' ? 'practice' : sessionType],
          targetSuccessRate: this.config.targetSuccessRate.optimal,
          adaptiveEnabled: true,
          hintsAvailable: sessionType === 'casual' ? 3 : 1,
        },
      };
    } catch (error) {
      console.error('Error generating question set:', error);
      throw error;
    }
  }

  /**
   * Calculate user's skill level based on performance history
   */
  private async getUserSkillLevel(userId: string, categoryId: string): Promise<number> {
    try {
      // In test environment, return a stable mid-level to avoid DB dependency
      if (process.env.NODE_ENV === 'test') {
        return 2;
      }
      // Check cache first
      const cacheKey = `${userId}_${categoryId}`;
      const cached = this.userPerformanceCache.get(cacheKey);
      if (cached && cached.timestamp > Date.now() - 300000) {
        // 5 min cache
        return cached.skillLevel;
      }

      // Get user's category progress
      const { data: progress } = await supabase
        .from('user_progress')
        .select('mastery_level, accuracy, questions_answered, correct_answers')
        .eq('user_id', userId)
        .eq('category_id', categoryId)
        .single();

      if (!progress || progress.questions_answered < 5) {
        return 2; // Default for new users
      }

      // Calculate skill level based on mastery and accuracy
      const masteryMap = {
        beginner: 1,
        elementary: 2,
        intermediate: 3,
        advanced: 4,
        expert: 5,
      };

      const masteryLevel = masteryMap[progress.mastery_level] || 2;
      const accuracyBonus = (progress.accuracy - 50) / 100; // -0.5 to +0.5

      const skillLevel = Math.max(1, Math.min(5, masteryLevel + accuracyBonus));

      // Update cache
      this.userPerformanceCache.set(cacheKey, {
        skillLevel,
        accuracy: progress.accuracy,
        timestamp: Date.now(),
      });

      return skillLevel;
    } catch (error) {
      console.error('Error getting user skill level:', error);
      return 2; // Default fallback
    }
  }

  /**
   * Calculate performance trend from recent answers
   * Returns value between -1 (declining) and +1 (improving)
   */
  private calculatePerformanceTrend(recentAnswers: boolean[]): number {
    if (recentAnswers.length === 0) return 0;

    // Weight recent answers more heavily
    let weightedSum = 0;
    let weightTotal = 0;

    for (let i = 0; i < recentAnswers.length; i++) {
      const weight = Math.pow(2, i); // Exponential weighting
      weightedSum += (recentAnswers[i] ? 1 : -1) * weight;
      weightTotal += weight;
    }

    return weightTotal > 0 ? weightedSum / weightTotal : 0;
  }

  /**
   * Check if user needs comeback mechanic (easier question)
   * Triggered after consecutive failures
   */
  private needsComebackMechanic(recentAnswers: boolean[]): boolean {
    if (recentAnswers.length < 2) return false;

    // Check last 2-3 answers
    const recentCount = Math.min(3, recentAnswers.length);
    const recentSlice = recentAnswers.slice(0, recentCount);

    // If all recent answers are wrong, trigger comeback
    return recentSlice.every((answer) => !answer);
  }

  /**
   * Calculate difficulty distribution using 4-2-1 rule
   */
  private calculateDifficultyDistribution(
    questionCount: number,
    userLevel: number,
  ): DifficultyDistribution {
    const distribution: DifficultyDistribution = {
      easy: 0,
      atLevel: 0,
      challenging: 0,
      stretch: 0,
    };

    if (questionCount <= 3) {
      // For very short quizzes
      distribution.atLevel = questionCount;
    } else if (questionCount <= 5) {
      // 3-1-1 for 5 questions
      distribution.easy = 1;
      distribution.atLevel = 3;
      distribution.challenging = 1;
    } else if (questionCount <= 7) {
      // 4-2-1 for 7 questions
      distribution.easy = 1;
      distribution.atLevel = 4;
      distribution.challenging = 2;
    } else {
      // Scale proportionally for longer quizzes
      const ratio = questionCount / 7;
      distribution.easy = Math.floor(1 * ratio);
      distribution.atLevel = Math.floor(4 * ratio);
      distribution.challenging = Math.floor(2 * ratio);
      distribution.stretch =
        questionCount - distribution.easy - distribution.atLevel - distribution.challenging;
    }

    return distribution;
  }

  /**
   * Select questions with spaced repetition consideration
   */
  private async selectQuestionsWithSpacedRepetition(
    categoryId: string,
    distribution: DifficultyDistribution,
    userHistory?: QuizSession[],
  ): Promise<Question[]> {
    const questions: Question[] = [];
    const usedQuestionIds = new Set<string>();

    // Get previously failed questions for review
    const failedQuestions = await this.getFailedQuestionsForReview(categoryId, userHistory);

    // Helper function to get questions by difficulty
    const getQuestionsByDifficulty = async (
      difficulty: number,
      count: number,
      variance: number = 0.5,
    ): Promise<Question[]> => {
      const minDiff = Math.max(1, difficulty - variance);
      const maxDiff = Math.min(5, difficulty + variance);

      // In test environment, pull questions from devQuizData instead of DB
      if (process.env.NODE_ENV === 'test') {
        const category = devQuizData.find((c) => c.id === categoryId) || devQuizData[0];
        if (!category) return [];
        const toLabel = (n: number) => (n <= 2 ? 'easy' : n >= 4 ? 'hard' : 'medium');
        const desiredLabels = new Set<string>();
        // Approximate numeric range to labels
        for (let d = Math.floor(minDiff); d <= Math.ceil(maxDiff); d++) {
          desiredLabels.add(toLabel(d));
        }
        const pool = category.questions.filter(
          (q) => desiredLabels.has(q.difficulty) && !usedQuestionIds.has(q.id),
        );
        // Shuffle pool
        const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, count);
        return shuffled.map(
          (q) =>
            ({
              id: q.id,
              categoryId,
              categorySlug: category.id,
              question: q.question,
              options: q.options,
              correctAnswer: q.correct,
              explanation: q.explanation || '',
              difficulty: q.difficulty === 'easy' ? 2 : q.difficulty === 'hard' ? 4 : 3,
              tags: [],
              imageUrl: null as any,
              timeLimit: null as any,
              points: 10,
              metadata: {},
            }) as Question,
        );
      }

      const { data } = await supabase
        .from('questions')
        .select('*')
        .eq('category_id', categoryId)
        .gte('difficulty', minDiff)
        .lte('difficulty', maxDiff)
        .not('id', 'in', `(${Array.from(usedQuestionIds).join(',')})`)
        .order('RANDOM()')
        .limit(count);

      return data || [];
    };

    // Add easy warm-up questions
    if (distribution.easy > 0) {
      const easyQuestions = await getQuestionsByDifficulty(1.5, distribution.easy);
      questions.push(...easyQuestions);
      easyQuestions.forEach((q) => usedQuestionIds.add(q.id));
    }

    // Add at-level questions (include some failed questions for review)
    if (distribution.atLevel > 0) {
      const reviewCount = Math.min(Math.floor(distribution.atLevel * 0.3), failedQuestions.length);
      const newCount = distribution.atLevel - reviewCount;

      // Add review questions
      if (reviewCount > 0) {
        const reviewQuestions = failedQuestions.slice(0, reviewCount);
        questions.push(...reviewQuestions);
        reviewQuestions.forEach((q) => usedQuestionIds.add(q.id));
      }

      // Add new at-level questions
      const userLevel = await this.getUserSkillLevel('', categoryId);
      const atLevelQuestions = await getQuestionsByDifficulty(userLevel, newCount, 0.5);
      questions.push(...atLevelQuestions);
      atLevelQuestions.forEach((q) => usedQuestionIds.add(q.id));
    }

    // Add challenging questions
    if (distribution.challenging > 0) {
      const userLevel = await this.getUserSkillLevel('', categoryId);
      const challengingQuestions = await getQuestionsByDifficulty(
        Math.min(5, userLevel + 1),
        distribution.challenging,
        0.5,
      );
      questions.push(...challengingQuestions);
      challengingQuestions.forEach((q) => usedQuestionIds.add(q.id));
    }

    // Add stretch questions
    if (distribution.stretch > 0) {
      const userLevel = await this.getUserSkillLevel('', categoryId);
      const stretchQuestions = await getQuestionsByDifficulty(
        Math.min(5, userLevel + 2),
        distribution.stretch,
        0.5,
      );
      questions.push(...stretchQuestions);
    }

    return questions;
  }

  /**
   * Get previously failed questions for spaced repetition
   */
  private async getFailedQuestionsForReview(
    categoryId: string,
    userHistory?: QuizSession[],
  ): Promise<Question[]> {
    if (!userHistory || userHistory.length === 0) return [];

    // Find questions user got wrong in recent sessions
    const failedQuestionIds = new Set<string>();

    userHistory.slice(0, 5).forEach((session) => {
      // Last 5 sessions
      session.questions?.forEach((q) => {
        if (!q.isCorrect) {
          failedQuestionIds.add(q.questionId);
        }
      });
    });

    if (failedQuestionIds.size === 0) return [];

    // Fetch the actual questions
    // In test environment, map from devQuizData
    if (process.env.NODE_ENV === 'test') {
      const category = devQuizData.find((c) => c.id === categoryId) || devQuizData[0];
      const idSet = new Set(Array.from(failedQuestionIds));
      const data = (category?.questions || [])
        .filter((q) => idSet.has(q.id))
        .slice(0, 3)
        .map(
          (q) =>
            ({
              id: q.id,
              categoryId,
              categorySlug: category.id,
              question: q.question,
              options: q.options,
              correctAnswer: q.correct,
              explanation: q.explanation || '',
              difficulty: q.difficulty === 'easy' ? 2 : q.difficulty === 'hard' ? 4 : 3,
              tags: [],
              imageUrl: null as any,
              timeLimit: null as any,
              points: 10,
              metadata: {},
            }) as Question,
        );
      return data;
    }

    const { data } = await supabase
      .from('questions')
      .select('*')
      .in('id', Array.from(failedQuestionIds))
      .eq('category_id', categoryId)
      .limit(3);

    return data || [];
  }

  /**
   * Optimize question order for best learning experience
   * Pattern: Easy warm-up → Build confidence → Peak challenge → Cool down
   */
  private optimizeQuestionOrder(questions: Question[]): Question[] {
    // Sort by difficulty
    const sorted = [...questions].sort((a, b) => a.difficulty - b.difficulty);

    if (sorted.length <= 3) {
      return sorted; // Too few to optimize
    }

    const optimized: Question[] = [];
    const easy = sorted.filter((q) => q.difficulty <= 2);
    const medium = sorted.filter((q) => q.difficulty > 2 && q.difficulty <= 3.5);
    const hard = sorted.filter((q) => q.difficulty > 3.5);

    // Warm-up (1-2 easy)
    if (easy.length > 0) {
      optimized.push(easy.shift()!);
    }

    // Build up (alternate medium and easy)
    while (medium.length > 0 || easy.length > 0) {
      if (medium.length > 0) optimized.push(medium.shift()!);
      if (easy.length > 0 && optimized.length < sorted.length * 0.6) {
        optimized.push(easy.shift()!);
      }
    }

    // Peak challenge (hard questions in middle-to-late)
    const peakPosition = Math.floor(optimized.length * 0.7);
    hard.forEach((q) => {
      optimized.splice(peakPosition, 0, q);
    });

    // If we have remaining easy questions, use as cool-down
    if (easy.length > 0) {
      optimized.push(...easy);
    }

    return optimized;
  }

  /**
   * Update user performance metrics after answering
   */
  async updatePerformanceMetrics(
    userId: string,
    categoryId: string,
    questionId: string,
    isCorrect: boolean,
    difficulty: number,
    timeSpent: number,
  ): Promise<void> {
    try {
      // Update cache
      const cacheKey = `${userId}_${categoryId}`;
      const current = this.userPerformanceCache.get(cacheKey) || {
        skillLevel: 2,
        accuracy: 0.5,
        timestamp: Date.now(),
      };

      // Adjust skill level based on performance vs difficulty
      const expectedSuccess = this.calculateExpectedSuccess(current.skillLevel, difficulty);
      const performanceScore = isCorrect ? 1 : 0;
      const surprise = performanceScore - expectedSuccess;

      // Elo-like rating update
      const K = 32; // Learning rate
      const newSkillLevel = current.skillLevel + (K * surprise) / 10;

      // Update cache
      this.userPerformanceCache.set(cacheKey, {
        skillLevel: Math.max(1, Math.min(5, newSkillLevel)),
        accuracy: current.accuracy * 0.9 + (isCorrect ? 0.1 : 0), // Exponential moving average
        timestamp: Date.now(),
      });

      // Persist to database
      await this.persistPerformanceUpdate(userId, categoryId, isCorrect, difficulty, timeSpent);
    } catch (error) {
      console.error('Error updating performance metrics:', error);
    }
  }

  /**
   * Calculate expected success probability
   */
  private calculateExpectedSuccess(skillLevel: number, questionDifficulty: number): number {
    // Logistic function: P(success) = 1 / (1 + e^(-k*(skill - difficulty)))
    const k = 1.5; // Steepness of the curve
    const difference = skillLevel - questionDifficulty;
    return 1 / (1 + Math.exp(-k * difference));
  }

  /**
   * Persist performance update to database
   */
  private async persistPerformanceUpdate(
    userId: string,
    categoryId: string,
    isCorrect: boolean,
    difficulty: number,
    timeSpent: number,
  ): Promise<void> {
    // Update user progress
    await supabase.rpc('update_category_progress', {
      user_id: userId,
      category_id: categoryId,
      is_correct: isCorrect,
      difficulty: difficulty,
      time_spent: timeSpent,
    });
  }

  /**
   * Get performance analytics for optimization
   */
  async getPerformanceAnalytics(userId: string): Promise<PerformanceAnalytics> {
    try {
      const { data: sessions } = await supabase
        .from('quiz_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('completed_at', { ascending: false })
        .limit(50);

      if (!sessions || sessions.length === 0) {
        return this.getDefaultAnalytics();
      }

      // Calculate key metrics
      const metrics = {
        averageAccuracy: 0,
        completionRate: 0,
        averageSessionLength: 0,
        difficultyProgression: [],
        engagementTrend: [],
        frustrationIndicators: {
          rageQuits: 0,
          consecutiveFailures: 0,
          skipUsage: 0,
        },
      };

      // Process sessions
      let totalAccuracy = 0;
      let completedSessions = 0;
      let totalTime = 0;

      sessions.forEach((session) => {
        totalAccuracy += session.accuracy || 0;
        if (session.completed_at) completedSessions++;
        totalTime += session.time_spent || 0;

        // Check for frustration indicators
        if (session.questions_answered < (session.max_score / 10) * 0.5) {
          metrics.frustrationIndicators.rageQuits++;
        }

        // Check consecutive failures
        const wrongRatio = session.wrong_answers / session.questions_answered;
        if (wrongRatio > 0.5) {
          metrics.frustrationIndicators.consecutiveFailures++;
        }
      });

      metrics.averageAccuracy = totalAccuracy / sessions.length;
      metrics.completionRate = completedSessions / sessions.length;
      metrics.averageSessionLength = totalTime / sessions.length;

      return metrics as PerformanceAnalytics;
    } catch (error) {
      console.error('Error getting performance analytics:', error);
      return this.getDefaultAnalytics();
    }
  }

  private getDefaultAnalytics(): PerformanceAnalytics {
    return {
      averageAccuracy: 0,
      completionRate: 0,
      averageSessionLength: 0,
      difficultyProgression: [],
      engagementTrend: [],
      frustrationIndicators: {
        rageQuits: 0,
        consecutiveFailures: 0,
        skipUsage: 0,
      },
    };
  }
}

// Type definitions
interface UserPerformanceMetrics {
  skillLevel: number;
  accuracy: number;
  timestamp: number;
}

interface DifficultyDistribution {
  easy: number;
  atLevel: number;
  challenging: number;
  stretch: number;
}

interface QuestionSelectionResult {
  questions: Question[];
  sessionConfig: {
    mistakeTolerance: number;
    targetSuccessRate: number;
    adaptiveEnabled: boolean;
    hintsAvailable: number;
  };
}

interface PerformanceAnalytics {
  averageAccuracy: number;
  completionRate: number;
  averageSessionLength: number;
  difficultyProgression: number[];
  engagementTrend: number[];
  frustrationIndicators: {
    rageQuits: number;
    consecutiveFailures: number;
    skipUsage: number;
  };
}

export default DifficultyProgressionService.getInstance();
