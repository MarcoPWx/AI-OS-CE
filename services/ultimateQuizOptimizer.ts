/**
 * Ultimate Quiz Optimizer v3.0
 * Even simpler, more effective, production-ready
 */

import { supabase } from '../lib/supabase';

interface QuizConfig {
  questions: any[];
  lives: number;
  timePerQuestion: number | null;
  rewards: {
    baseXP: number;
    streakMultiplier: number;
    perfectBonus: number;
  };
  features: {
    hints: boolean;
    skip: boolean;
    powerups: boolean;
  };
}

export class UltimateQuizOptimizer {
  private userCache = new Map<string, any>();

  /**
   * THE MAIN METHOD - This is all you need to call
   */
  async getSmartQuiz(userId: string, categoryId: string, mode?: string) {
    // 1. Determine quiz mode (with smart defaults)
    const quizMode = this.getQuizMode(mode);

    // 2. Get user context (cached for performance)
    const userContext = await this.getUserContext(userId, categoryId);

    // 3. Select questions intelligently
    const questions = await this.selectSmartQuestions(
      categoryId,
      quizMode.questionCount,
      userContext,
    );

    // 4. Order for psychological flow
    const orderedQuestions = this.createFlowOrder(questions, userContext);

    // 5. Add personalization layer
    const personalizedQuiz = this.addPersonalization(orderedQuestions, userContext);

    return {
      questions: personalizedQuiz,
      config: quizMode,
      userContext,
      estimatedTime: quizMode.questionCount * 30,
    };
  }

  /**
   * QUIZ MODES - Refined for better engagement
   */
  private getQuizMode(mode?: string): any {
    const modes = {
      // Quick Practice - Zero pressure, pure learning
      practice: {
        questionCount: 5,
        lives: 999,
        timePerQuestion: null,
        skipAllowed: true,
        hintsAllowed: 3,
        rewards: { baseXP: 5, streakMultiplier: 1.1, perfectBonus: 50 },
        description: 'Practice without pressure',
      },

      // Daily Quest - The sweet spot
      daily: {
        questionCount: 7,
        lives: 5, // More forgiving than 3
        timePerQuestion: 45,
        skipAllowed: false,
        hintsAllowed: 2,
        rewards: { baseXP: 10, streakMultiplier: 1.2, perfectBonus: 100 },
        description: 'Your daily brain workout',
      },

      // Challenge - For those who want difficulty
      challenge: {
        questionCount: 10,
        lives: 2, // One mistake allowed
        timePerQuestion: 30,
        skipAllowed: false,
        hintsAllowed: 1,
        rewards: { baseXP: 20, streakMultiplier: 1.5, perfectBonus: 500 },
        description: 'Test your limits',
      },

      // Speed Run - New mode for variety
      speed: {
        questionCount: 15,
        lives: 999,
        timePerQuestion: 10, // Fast!
        skipAllowed: true,
        hintsAllowed: 0,
        rewards: { baseXP: 15, streakMultiplier: 2.0, perfectBonus: 300 },
        description: 'How fast can you go?',
      },
    };

    return modes[mode as keyof typeof modes] || modes.daily;
  }

  /**
   * GET USER CONTEXT - Everything we need to know
   */
  private async getUserContext(userId: string, categoryId: string) {
    // Check cache first (5 minute TTL)
    const cacheKey = `${userId}_${categoryId}`;
    const cached = this.userCache.get(cacheKey);
    if (cached && cached.timestamp > Date.now() - 300000) {
      return cached.data;
    }

    // Get all user data in parallel for speed
    const [progress, recentHistory, patterns] = await Promise.all([
      this.getUserProgress(userId, categoryId),
      this.getRecentHistory(userId, categoryId),
      this.getUserPatterns(userId, categoryId),
    ]);

    const context = {
      // Skill level (1-5)
      level: this.calculateLevel(progress),

      // Current state
      isStruggling: recentHistory.wrongStreak >= 2,
      isExcelling: recentHistory.correctStreak >= 3,
      isNew: progress.totalQuestions < 10,

      // Performance metrics
      accuracy: progress.accuracy,
      avgTimePerQuestion: recentHistory.avgTime,

      // Patterns (for smarter selection)
      weakTopics: patterns.weakTopics,
      strongTopics: patterns.strongTopics,
      commonMistakes: patterns.commonMistakes,

      // Engagement metrics
      lastPlayed: progress.lastPlayed,
      playStreak: progress.playStreak,
      motivation: this.calculateMotivation(progress, recentHistory),
    };

    // Cache it
    this.userCache.set(cacheKey, { data: context, timestamp: Date.now() });

    return context;
  }

  /**
   * SMART QUESTION SELECTION - The magic happens here
   */
  private async selectSmartQuestions(categoryId: string, count: number, context: any) {
    const questions: any[] = [];

    // NEW: Dynamic distribution based on user state
    const distribution = this.getQuestionDistribution(context, count);

    // 1. CONFIDENCE BUILDERS (if struggling)
    if (distribution.easy > 0) {
      const easyQuestions = await this.getQuestions(categoryId, {
        difficulty: Math.max(1, context.level - 1),
        limit: distribution.easy,
        exclude: questions.map((q) => q.id),
        preferTopics: context.strongTopics, // Build on strengths
      });
      questions.push(...easyQuestions);
    }

    // 2. REVIEW QUESTIONS (spaced repetition)
    if (distribution.review > 0) {
      const reviewQuestions = await this.getReviewQuestions(categoryId, {
        limit: distribution.review,
        focusOn: context.commonMistakes,
        daysBack: 7,
      });
      questions.push(...reviewQuestions);
    }

    // 3. CURRENT LEVEL (the core)
    if (distribution.normal > 0) {
      const normalQuestions = await this.getQuestions(categoryId, {
        difficulty: context.level,
        limit: distribution.normal,
        exclude: questions.map((q) => q.id),
        avoidTopics: context.isStruggling ? context.weakTopics : [],
      });
      questions.push(...normalQuestions);
    }

    // 4. CHALLENGE QUESTIONS (if excelling)
    if (distribution.hard > 0) {
      const hardQuestions = await this.getQuestions(categoryId, {
        difficulty: Math.min(5, context.level + 1),
        limit: distribution.hard,
        exclude: questions.map((q) => q.id),
        preferTopics: context.weakTopics, // Challenge weak areas when confident
      });
      questions.push(...hardQuestions);
    }

    // 5. SURPRISE ELEMENT (1 random for variety)
    if (questions.length < count) {
      const surpriseQuestion = await this.getSurpriseQuestion(categoryId, questions);
      if (surpriseQuestion) questions.push(surpriseQuestion);
    }

    return questions.slice(0, count);
  }

  /**
   * DYNAMIC DISTRIBUTION - Adapts to user state
   */
  private getQuestionDistribution(context: any, totalCount: number) {
    // NEW USER: Gentle introduction
    if (context.isNew) {
      return {
        easy: Math.ceil(totalCount * 0.6), // 60% easy
        review: 0, // No review yet
        normal: Math.ceil(totalCount * 0.3), // 30% normal
        hard: Math.ceil(totalCount * 0.1), // 10% challenge
      };
    }

    // STRUGGLING: Build confidence
    if (context.isStruggling) {
      return {
        easy: Math.ceil(totalCount * 0.4), // 40% confidence builders
        review: Math.ceil(totalCount * 0.3), // 30% review
        normal: Math.ceil(totalCount * 0.3), // 30% current level
        hard: 0, // No hard questions
      };
    }

    // EXCELLING: Add challenge
    if (context.isExcelling) {
      return {
        easy: Math.ceil(totalCount * 0.1), // 10% warm-up
        review: Math.ceil(totalCount * 0.2), // 20% reinforce
        normal: Math.ceil(totalCount * 0.4), // 40% current
        hard: Math.ceil(totalCount * 0.3), // 30% challenge
      };
    }

    // NORMAL: Balanced mix
    return {
      easy: Math.ceil(totalCount * 0.2), // 20% warm-up
      review: Math.ceil(totalCount * 0.2), // 20% review
      normal: Math.ceil(totalCount * 0.5), // 50% current
      hard: Math.ceil(totalCount * 0.1), // 10% challenge
    };
  }

  /**
   * CREATE FLOW ORDER - Psychological optimization
   */
  private createFlowOrder(questions: any[], context: any) {
    if (questions.length <= 3) return questions;

    // Sort by difficulty first
    const sorted = [...questions].sort((a, b) => a.difficulty - b.difficulty);

    // Different patterns based on user state
    if (context.isStruggling) {
      // GENTLE WAVE: Easy → Gradual increase → Easy finish
      return this.createGentleWave(sorted);
    }

    if (context.isExcelling) {
      // MOUNTAIN CLIMB: Quick warm-up → Steady climb → Peak → Victory lap
      return this.createMountainClimb(sorted);
    }

    // DEFAULT: CLASSIC FLOW
    return this.createClassicFlow(sorted);
  }

  private createGentleWave(sorted: any[]) {
    const result: any[] = [];
    const easy = sorted.filter((q) => q.difficulty <= 2);
    const medium = sorted.filter((q) => q.difficulty > 2 && q.difficulty <= 3.5);
    const hard = sorted.filter((q) => q.difficulty > 3.5);

    // Start easy
    result.push(...easy.splice(0, 2));
    // Add medium
    result.push(...medium);
    // Add any hard in the middle (cushioned)
    if (hard.length > 0) {
      const midPoint = Math.floor(result.length / 2);
      result.splice(midPoint, 0, ...hard);
    }
    // End with remaining easy
    result.push(...easy);

    return result;
  }

  private createMountainClimb(sorted: any[]) {
    // Simply ascending difficulty with peak at 80%
    const peakIndex = Math.floor(sorted.length * 0.8);
    const climbing = sorted.slice(0, peakIndex);
    const descent = sorted.slice(peakIndex).reverse();
    return [...climbing, ...descent];
  }

  private createClassicFlow(sorted: any[]) {
    const result: any[] = [];
    const thirds = Math.ceil(sorted.length / 3);

    // First third: Easy to medium
    result.push(...sorted.slice(0, thirds));

    // Middle third: Hardest questions
    result.push(...sorted.slice(-thirds));

    // Last third: Medium difficulty
    result.push(...sorted.slice(thirds, thirds * 2));

    return result;
  }

  /**
   * ADD PERSONALIZATION - The final touch
   */
  private addPersonalization(questions: any[], context: any) {
    return questions.map((question, index) => {
      // Add metadata for UI
      question.metadata = {
        // Position indicators
        isWarmup: index < 2,
        isPeak: index === Math.floor(questions.length * 0.7),
        isCooldown: index >= questions.length - 2,

        // Difficulty indicator
        difficultyLabel: this.getDifficultyLabel(question.difficulty, context.level),

        // Motivational elements
        encouragement: this.getQuestionEncouragement(index, questions.length, context),

        // Power-ups available
        hintsAvailable: context.isStruggling ? 2 : 1,
        skipAvailable: context.motivation < 0.5 && index > questions.length / 2,

        // Special markers
        isReview: question.isReview || false,
        isChallenge: question.difficulty > context.level,
        isConfidenceBuilder: question.difficulty < context.level,
      };

      return question;
    });
  }

  /**
   * TRACKING & REWARDS - Simple but effective
   */
  async trackAnswer(
    userId: string,
    questionId: string,
    categoryId: string,
    isCorrect: boolean,
    timeSpent: number,
    difficulty: number,
    streak: number,
  ) {
    // Record the answer
    await this.recordAnswer(userId, questionId, categoryId, isCorrect, timeSpent, difficulty);

    // Calculate rewards with streak bonus
    const baseXP = this.calculateXP(difficulty, isCorrect, timeSpent);
    const streakBonus = Math.min(streak * 5, 50); // Cap at 50
    const totalXP = baseXP + streakBonus;

    // Special rewards
    const specialRewards: any[] = [];

    // Time bonus
    if (timeSpent < 5 && isCorrect) {
      specialRewards.push({ type: 'speed_demon', xp: 10, message: '⚡ Lightning Fast!' });
    }

    // Difficulty bonus
    if (difficulty >= 4 && isCorrect) {
      specialRewards.push({ type: 'brain_power', xp: 15, message: '🧠 Big Brain!' });
    }

    // Comeback bonus
    const context = await this.getUserContext(userId, categoryId);
    if (context.isStruggling && isCorrect) {
      specialRewards.push({ type: 'comeback', xp: 20, message: '💪 Great Comeback!' });
    }

    return {
      xp: totalXP,
      stars: Math.ceil(totalXP / 10),
      specialRewards,
      streak: isCorrect ? streak + 1 : 0,
    };
  }

  /**
   * MOTIVATIONAL SYSTEM - Keep users engaged
   */
  getMotivationalMessage(context: any, progress: any) {
    // Context-aware messages
    if (context.isStruggling && progress.correctRatio < 0.5) {
      return {
        message: "Every expert was once a beginner. You're improving! 🌱",
        type: 'encouragement',
        actionHint: 'Try Practice Mode for unlimited attempts',
      };
    }

    if (context.isExcelling && progress.correctRatio > 0.8) {
      return {
        message: "You're on fire! Ready for Challenge Mode? 🔥",
        type: 'celebration',
        actionHint: 'Unlock Challenge Mode with 2 more perfect quizzes',
      };
    }

    if (context.playStreak >= 7) {
      return {
        message: `${context.playStreak} day streak! You're unstoppable! 🚀`,
        type: 'streak',
        actionHint: 'Keep your streak alive tomorrow',
      };
    }

    // Time-based messages
    const hour = new Date().getHours();
    if (hour < 12) {
      return {
        message: 'Great morning brain workout! ☀️',
        type: 'greeting',
        actionHint: null,
      };
    } else if (hour < 17) {
      return {
        message: 'Afternoon learning boost! 📚',
        type: 'greeting',
        actionHint: null,
      };
    } else {
      return {
        message: 'Evening brain training! 🌙',
        type: 'greeting',
        actionHint: null,
      };
    }
  }

  /**
   * HELPER METHODS - Clean and simple
   */

  private calculateLevel(progress: any): number {
    if (!progress || progress.totalQuestions < 5) return 1;

    const accuracy = progress.accuracy;
    if (accuracy >= 0.9) return 5;
    if (accuracy >= 0.8) return 4;
    if (accuracy >= 0.7) return 3;
    if (accuracy >= 0.6) return 2;
    return 1;
  }

  private calculateMotivation(progress: any, history: any): number {
    // Simple motivation score (0-1)
    let motivation = 0.5; // Base

    // Recent performance
    if (history.correctStreak >= 3) motivation += 0.2;
    if (history.wrongStreak >= 2) motivation -= 0.2;

    // Consistency
    if (progress.playStreak >= 3) motivation += 0.1;
    if (progress.daysInactive >= 3) motivation -= 0.1;

    // Progress
    if (progress.levelProgress > 0.7) motivation += 0.1;

    return Math.max(0, Math.min(1, motivation));
  }

  private getDifficultyLabel(difficulty: number, userLevel: number): string {
    const diff = difficulty - userLevel;
    if (diff <= -1) return '🟢 Easy';
    if (diff >= 1) return '🔴 Hard';
    return '🟡 Medium';
  }

  private getQuestionEncouragement(index: number, total: number, context: any): string | null {
    // Strategic encouragement placement
    if (index === 0) return "Let's start easy! 🌟";
    if (index === Math.floor(total / 2)) return 'Halfway there! 💪';
    if (index === total - 1) return 'Last question! 🏁';

    if (context.isStruggling && index === 2) {
      return "You're doing great! Keep going! 💙";
    }

    return null;
  }

  private calculateXP(difficulty: number, isCorrect: boolean, timeSpent: number): number {
    if (!isCorrect) return 5; // Participation points

    let xp = 10; // Base
    xp += difficulty * 5; // Difficulty bonus

    // Time bonus (under 10 seconds)
    if (timeSpent < 10) xp += 10;
    else if (timeSpent < 20) xp += 5;

    return xp;
  }

  // Database helpers (simplified)
  private async getUserProgress(userId: string, categoryId: string) {
    const { data } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('category_id', categoryId)
      .single();

    return (
      data || {
        totalQuestions: 0,
        correctAnswers: 0,
        accuracy: 0,
        lastPlayed: null,
        playStreak: 0,
        levelProgress: 0,
      }
    );
  }

  private async getRecentHistory(userId: string, categoryId: string) {
    const { data } = await supabase
      .from('question_history')
      .select('*')
      .eq('user_id', userId)
      .eq('category_id', categoryId)
      .order('answered_at', { ascending: false })
      .limit(10);

    if (!data || data.length === 0) {
      return { correctStreak: 0, wrongStreak: 0, avgTime: 30 };
    }

    // Calculate streaks
    let correctStreak = 0;
    let wrongStreak = 0;
    for (const answer of data) {
      if (answer.is_correct) {
        correctStreak++;
        wrongStreak = 0;
      } else {
        wrongStreak++;
        correctStreak = 0;
      }
      if (correctStreak >= 3 || wrongStreak >= 2) break;
    }

    const avgTime = data.reduce((sum, a) => sum + a.time_spent, 0) / data.length;

    return { correctStreak, wrongStreak, avgTime };
  }

  private async getUserPatterns(userId: string, categoryId: string) {
    // Analyze patterns from history
    const { data } = await supabase
      .from('question_history')
      .select('question_id, is_correct, topics')
      .eq('user_id', userId)
      .eq('category_id', categoryId)
      .order('answered_at', { ascending: false })
      .limit(50);

    // Simple pattern detection
    const topicPerformance = new Map<string, { correct: number; total: number }>();
    const mistakes: string[] = [];

    (data || []).forEach((item) => {
      if (item.topics) {
        item.topics.forEach((topic: string) => {
          const perf = topicPerformance.get(topic) || { correct: 0, total: 0 };
          perf.total++;
          if (item.is_correct) perf.correct++;
          topicPerformance.set(topic, perf);
        });
      }
      if (!item.is_correct) {
        mistakes.push(item.question_id);
      }
    });

    // Identify weak and strong topics
    const weakTopics: string[] = [];
    const strongTopics: string[] = [];

    topicPerformance.forEach((perf, topic) => {
      const accuracy = perf.correct / perf.total;
      if (accuracy < 0.5) weakTopics.push(topic);
      if (accuracy > 0.8) strongTopics.push(topic);
    });

    return {
      weakTopics,
      strongTopics,
      commonMistakes: mistakes.slice(0, 5),
    };
  }

  private async getQuestions(categoryId: string, options: any) {
    const query = supabase
      .from('questions')
      .select('*')
      .eq('category_id', categoryId)
      .gte('difficulty', options.difficulty - 0.5)
      .lte('difficulty', options.difficulty + 0.5);

    if (options.exclude?.length > 0) {
      query.not('id', 'in', `(${options.exclude.join(',')})`);
    }

    if (options.preferTopics?.length > 0) {
      query.or(options.preferTopics.map((t: string) => `topics.cs.{${t}}`).join(','));
    }

    const { data } = await query.limit(options.limit * 2);

    // Randomize and return
    const shuffled = (data || []).sort(() => Math.random() - 0.5);
    return shuffled.slice(0, options.limit);
  }

  private async getReviewQuestions(categoryId: string, options: any) {
    const { data: mistakes } = await supabase
      .from('question_history')
      .select('question_id')
      .eq('category_id', categoryId)
      .eq('is_correct', false)
      .gte(
        'answered_at',
        new Date(Date.now() - options.daysBack * 24 * 60 * 60 * 1000).toISOString(),
      )
      .limit(options.limit * 2);

    if (!mistakes || mistakes.length === 0) return [];

    const { data: questions } = await supabase
      .from('questions')
      .select('*')
      .in(
        'id',
        mistakes.map((m) => m.question_id),
      )
      .limit(options.limit);

    return (questions || []).map((q) => ({ ...q, isReview: true }));
  }

  private async getSurpriseQuestion(categoryId: string, exclude: any[]) {
    const { data } = await supabase
      .from('questions')
      .select('*')
      .eq('category_id', categoryId)
      .not('id', 'in', `(${exclude.map((q) => q.id).join(',')})`)
      .order('RANDOM()')
      .limit(1)
      .single();

    return data;
  }

  private async recordAnswer(
    userId: string,
    questionId: string,
    categoryId: string,
    isCorrect: boolean,
    timeSpent: number,
    difficulty: number,
  ) {
    await supabase.from('question_history').insert({
      user_id: userId,
      question_id: questionId,
      category_id: categoryId,
      is_correct: isCorrect,
      time_spent: timeSpent,
      difficulty: difficulty,
      answered_at: new Date().toISOString(),
    });
  }
}

export default UltimateQuizOptimizer;
