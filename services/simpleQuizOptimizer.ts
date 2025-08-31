/**
 * Simple Quiz Optimizer - Clear, Understandable Logic
 * No overengineering, just smart question selection
 */

import { Question } from '../types/domain';
import { supabase } from '../lib/supabase';

export class SimpleQuizOptimizer {
  /**
   * Main entry point - Gets optimized questions for a quiz
   * This is what actually gets called when user starts a quiz
   */
  async getOptimizedQuiz(
    userId: string,
    categoryId: string,
    sessionType: 'quick' | 'normal' | 'challenge' = 'normal',
  ) {
    // Step 1: Determine session config based on type
    const config = this.getSessionConfig(sessionType);

    // Step 2: Get user's current skill level
    const userSkill = await this.getUserSkillLevel(userId, categoryId);

    // Step 3: Get user's recent performance
    const recentPerformance = await this.getRecentPerformance(userId, categoryId);

    // Step 4: Select questions with smart logic
    const questions = await this.selectQuestions(
      categoryId,
      config.questionCount,
      userSkill,
      recentPerformance,
    );

    // Step 5: Order questions for best experience
    const orderedQuestions = this.orderQuestions(questions);

    return {
      questions: orderedQuestions,
      config,
      userLevel: userSkill.level,
      estimatedTime: config.questionCount * 30, // 30 seconds per question
    };
  }

  /**
   * Simple session configurations
   * Just 3 types - no complexity
   */
  private getSessionConfig(type: 'quick' | 'normal' | 'challenge') {
    const configs = {
      quick: {
        questionCount: 5,
        livesAllowed: 999, // Unlimited
        timePerQuestion: null, // No timer
        difficulty: 'adaptive',
        rewards: { xpMultiplier: 1, starsPerCorrect: 1 },
      },
      normal: {
        questionCount: 7,
        livesAllowed: 3,
        timePerQuestion: 45, // 45 seconds
        difficulty: 'adaptive',
        rewards: { xpMultiplier: 1.5, starsPerCorrect: 2 },
      },
      challenge: {
        questionCount: 10,
        livesAllowed: 1,
        timePerQuestion: 30, // 30 seconds
        difficulty: 'hard',
        rewards: { xpMultiplier: 2, starsPerCorrect: 3 },
      },
    };

    return configs[type];
  }

  /**
   * Get user's skill level - Simple calculation
   */
  private async getUserSkillLevel(userId: string, categoryId: string) {
    const { data } = await supabase
      .from('user_progress')
      .select('total_questions, correct_answers, current_level')
      .eq('user_id', userId)
      .eq('category_id', categoryId)
      .single();

    if (!data || data.total_questions < 5) {
      // New user or category
      return {
        level: 1,
        accuracy: 0,
        isNew: true,
      };
    }

    const accuracy = data.correct_answers / data.total_questions;

    // Simple level calculation based on accuracy
    let level = 1;
    if (accuracy >= 0.9)
      level = 5; // Expert
    else if (accuracy >= 0.8)
      level = 4; // Advanced
    else if (accuracy >= 0.7)
      level = 3; // Intermediate
    else if (accuracy >= 0.6)
      level = 2; // Improving
    else level = 1; // Beginner

    return {
      level,
      accuracy,
      isNew: false,
    };
  }

  /**
   * Get recent performance - Last 10 questions
   */
  private async getRecentPerformance(userId: string, categoryId: string) {
    const { data } = await supabase
      .from('question_history')
      .select('is_correct, difficulty')
      .eq('user_id', userId)
      .eq('category_id', categoryId)
      .order('answered_at', { ascending: false })
      .limit(10);

    if (!data || data.length === 0) {
      return {
        recentAccuracy: 0.5, // Default to 50%
        consecutiveWrong: 0,
        consecutiveCorrect: 0,
        averageDifficulty: 2,
      };
    }

    // Calculate simple metrics
    const correct = data.filter((q) => q.is_correct).length;
    const recentAccuracy = correct / data.length;

    // Count consecutive results
    let consecutiveWrong = 0;
    let consecutiveCorrect = 0;

    for (const answer of data) {
      if (answer.is_correct) {
        consecutiveCorrect++;
        consecutiveWrong = 0;
      } else {
        consecutiveWrong++;
        consecutiveCorrect = 0;
      }
      if (consecutiveCorrect >= 3 || consecutiveWrong >= 2) break;
    }

    const averageDifficulty = data.reduce((sum, q) => sum + q.difficulty, 0) / data.length;

    return {
      recentAccuracy,
      consecutiveWrong,
      consecutiveCorrect,
      averageDifficulty,
    };
  }

  /**
   * Select questions with clear, simple logic
   */
  private async selectQuestions(
    categoryId: string,
    count: number,
    userSkill: any,
    recentPerformance: any,
  ): Promise<Question[]> {
    const questions: Question[] = [];

    // LOGIC 1: If user is struggling (2+ wrong in a row), get easier questions
    if (recentPerformance.consecutiveWrong >= 2) {
      const easyQuestions = await this.getQuestionsByDifficulty(
        categoryId,
        Math.max(1, userSkill.level - 1), // One level easier
        Math.ceil(count * 0.4), // 40% of questions
      );
      questions.push(...easyQuestions);
    }

    // LOGIC 2: If user is doing great (3+ correct), add harder questions
    if (recentPerformance.consecutiveCorrect >= 3) {
      const hardQuestions = await this.getQuestionsByDifficulty(
        categoryId,
        Math.min(5, userSkill.level + 1), // One level harder
        Math.ceil(count * 0.3), // 30% of questions
      );
      questions.push(...hardQuestions);
    }

    // LOGIC 3: Get questions user got wrong before (spaced repetition)
    const reviewQuestions = await this.getReviewQuestions(
      categoryId,
      Math.ceil(count * 0.2), // 20% review
    );
    questions.push(...reviewQuestions);

    // LOGIC 4: Fill remaining with appropriate level questions
    const remaining = count - questions.length;
    if (remaining > 0) {
      const normalQuestions = await this.getQuestionsByDifficulty(
        categoryId,
        userSkill.level,
        remaining,
      );
      questions.push(...normalQuestions);
    }

    return questions.slice(0, count); // Ensure we don't exceed count
  }

  /**
   * Get questions by difficulty level
   */
  private async getQuestionsByDifficulty(
    categoryId: string,
    targetDifficulty: number,
    limit: number,
  ): Promise<Question[]> {
    // Allow some variance (±0.5 difficulty)
    const minDiff = Math.max(1, targetDifficulty - 0.5);
    const maxDiff = Math.min(5, targetDifficulty + 0.5);

    const { data } = await supabase
      .from('questions')
      .select('*')
      .eq('category_id', categoryId)
      .gte('difficulty', minDiff)
      .lte('difficulty', maxDiff)
      .order('last_shown', { ascending: true }) // Prioritize questions not shown recently
      .limit(limit * 2); // Get extra to allow filtering

    if (!data) return [];

    // Randomly select from pool to add variety
    const shuffled = data.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, limit);
  }

  /**
   * Get questions user previously got wrong
   */
  private async getReviewQuestions(categoryId: string, limit: number): Promise<Question[]> {
    // Get questions user got wrong in last 7 days
    const { data: wrongQuestions } = await supabase
      .from('question_history')
      .select('question_id')
      .eq('category_id', categoryId)
      .eq('is_correct', false)
      .gte('answered_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .limit(limit * 2);

    if (!wrongQuestions || wrongQuestions.length === 0) return [];

    const questionIds = wrongQuestions.map((q) => q.question_id);

    const { data: questions } = await supabase
      .from('questions')
      .select('*')
      .in('id', questionIds)
      .limit(limit);

    return questions || [];
  }

  /**
   * Order questions for optimal experience
   * Simple pattern: Easy → Medium → Hard → Medium
   */
  private orderQuestions(questions: Question[]): Question[] {
    if (questions.length <= 3) return questions;

    // Sort by difficulty
    const sorted = [...questions].sort((a, b) => a.difficulty - b.difficulty);

    // Create flow pattern
    const ordered: Question[] = [];
    const easy = sorted.filter((q) => q.difficulty <= 2);
    const medium = sorted.filter((q) => q.difficulty > 2 && q.difficulty <= 3.5);
    const hard = sorted.filter((q) => q.difficulty > 3.5);

    // Pattern for different quiz lengths
    if (questions.length === 5) {
      // Easy → Medium → Medium → Hard → Medium
      ordered.push(...easy.slice(0, 1));
      ordered.push(...medium.slice(0, 2));
      ordered.push(...hard.slice(0, 1));
      ordered.push(...medium.slice(2, 3));
    } else if (questions.length === 7) {
      // Easy → Easy → Medium → Medium → Hard → Hard → Medium
      ordered.push(...easy.slice(0, 2));
      ordered.push(...medium.slice(0, 2));
      ordered.push(...hard.slice(0, 2));
      ordered.push(...medium.slice(2, 3));
    } else {
      // For 10 questions: gradual increase then decrease
      const third = Math.floor(questions.length / 3);
      ordered.push(...easy.slice(0, third));
      ordered.push(...medium.slice(0, third));
      ordered.push(...hard);
      ordered.push(...medium.slice(third));
      ordered.push(...easy.slice(third));
    }

    // Fill any gaps with remaining questions
    const used = new Set(ordered.map((q) => q.id));
    const unused = questions.filter((q) => !used.has(q.id));
    ordered.push(...unused);

    return ordered.slice(0, questions.length);
  }

  /**
   * Update user performance after answering
   * Simple tracking for future optimization
   */
  async trackAnswer(
    userId: string,
    questionId: string,
    categoryId: string,
    isCorrect: boolean,
    timeSpent: number,
    difficulty: number,
  ) {
    // Record in history
    await supabase.from('question_history').insert({
      user_id: userId,
      question_id: questionId,
      category_id: categoryId,
      is_correct: isCorrect,
      time_spent: timeSpent,
      difficulty: difficulty,
      answered_at: new Date().toISOString(),
    });

    // Update user progress
    await supabase.rpc('update_user_progress', {
      user_id: userId,
      category_id: categoryId,
      correct: isCorrect ? 1 : 0,
      total: 1,
    });

    // Simple XP calculation
    let xp = 10; // Base XP
    if (isCorrect) {
      xp += difficulty * 5; // Bonus for difficulty
      if (timeSpent < 10) xp += 5; // Speed bonus
    }

    return { xp, stars: isCorrect ? Math.ceil(xp / 10) : 0 };
  }

  /**
   * Get encouragement message for struggling users
   */
  getEncouragementMessage(consecutiveWrong: number): string | null {
    if (consecutiveWrong < 2) return null;

    const messages = [
      "Don't worry! The next question will be easier 💪",
      "You're learning! That's what matters 🌟",
      'Every expert was once a beginner. Keep going! 🚀',
      "Take a deep breath. You've got this! 💙",
      "Mistakes help us learn. You're doing great! ✨",
    ];

    return messages[Math.floor(Math.random() * messages.length)];
  }

  /**
   * Check if user should unlock something
   */
  async checkUnlocks(userId: string, categoryId: string) {
    const { data: progress } = await supabase
      .from('user_progress')
      .select('total_questions, correct_answers, current_level')
      .eq('user_id', userId)
      .eq('category_id', categoryId)
      .single();

    if (!progress) return [];

    const unlocks = [];
    const accuracy = progress.correct_answers / progress.total_questions;

    // Simple unlock logic
    if (progress.total_questions >= 20 && !progress.unlocked_hints) {
      unlocks.push({ type: 'feature', name: 'Hints', icon: '💡' });
    }

    if (accuracy >= 0.8 && progress.total_questions >= 50 && !progress.unlocked_challenge) {
      unlocks.push({ type: 'mode', name: 'Challenge Mode', icon: '🏆' });
    }

    if (progress.current_level >= 3 && !progress.unlocked_multiplayer) {
      unlocks.push({ type: 'feature', name: 'Multiplayer', icon: '👥' });
    }

    return unlocks;
  }
}

// How to use this in your app:
/*

// In QuizScreen.tsx
const optimizer = new SimpleQuizOptimizer();

// When starting a quiz
const quizData = await optimizer.getOptimizedQuiz(
  userId,
  categoryId,
  'normal' // or 'quick' or 'challenge'
);

// Display questions
quizData.questions.forEach(question => {
  // Show question to user
});

// After each answer
const rewards = await optimizer.trackAnswer(
  userId,
  questionId,
  categoryId,
  isCorrect,
  timeSpent,
  question.difficulty
);

// Check for unlocks periodically
const newUnlocks = await optimizer.checkUnlocks(userId, categoryId);

*/

export default SimpleQuizOptimizer;
