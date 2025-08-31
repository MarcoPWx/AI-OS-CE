/**
 * Quiz Service with Batch Processing
 * Optimizes question loading and analytics tracking
 */

import {
  getQuestionProcessor,
  getAnalyticsProcessor,
  getUserDataProcessor,
  type AnalyticsEvent,
} from './batchProcessor';
import { supabase } from './supabase';

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  xpReward: number;
  explanation?: string;
}

export interface QuizSession {
  id: string;
  userId: string;
  questions: Question[];
  currentQuestionIndex: number;
  answers: number[];
  score: number;
  startedAt: Date;
  completedAt?: Date;
  xpEarned: number;
}

export interface QuizConfig {
  questionCount: number;
  category?: string;
  difficulty?: 'easy' | 'medium' | 'hard' | 'mixed';
  timeLimit?: number; // seconds per question
}

class QuizService {
  private currentSession: QuizSession | null = null;
  private questionProcessor = getQuestionProcessor();
  private analyticsProcessor = getAnalyticsProcessor();
  private userDataProcessor = getUserDataProcessor();

  /**
   * Start a new quiz session with batch-loaded questions
   */
  async startQuiz(userId: string, config: QuizConfig): Promise<QuizSession> {
    // Track quiz start event
    await this.analyticsProcessor.track('quiz_start', {
      userId,
      category: config.category,
      difficulty: config.difficulty,
      questionCount: config.questionCount,
      timestamp: Date.now(),
    });

    // Get question IDs based on config
    const questionIds = await this.getQuestionIds(config);

    // Batch load questions
    const questions = await this.batchLoadQuestions(questionIds);

    // Create session
    this.currentSession = {
      id: `quiz-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      questions,
      currentQuestionIndex: 0,
      answers: [],
      score: 0,
      startedAt: new Date(),
      xpEarned: 0,
    };

    // Track session created
    await this.analyticsProcessor.track('quiz_session_created', {
      sessionId: this.currentSession.id,
      userId,
      questionCount: questions.length,
    });

    return this.currentSession;
  }

  /**
   * Submit answer for current question
   */
  async submitAnswer(answer: number): Promise<{
    correct: boolean;
    xpEarned: number;
    explanation?: string;
  }> {
    if (!this.currentSession) {
      throw new Error('No active quiz session');
    }

    const currentQuestion = this.currentSession.questions[this.currentSession.currentQuestionIndex];
    const correct = answer === currentQuestion.correctAnswer;
    const xpEarned = correct ? currentQuestion.xpReward : 0;

    // Update session
    this.currentSession.answers.push(answer);
    if (correct) {
      this.currentSession.score++;
      this.currentSession.xpEarned += xpEarned;
    }

    // Track answer (batched)
    await this.analyticsProcessor.track('answer_submitted', {
      sessionId: this.currentSession.id,
      questionId: currentQuestion.id,
      questionIndex: this.currentSession.currentQuestionIndex,
      answer,
      correct,
      xpEarned,
      responseTime: Date.now() - this.currentSession.startedAt.getTime(),
    });

    // Check for achievements
    if (correct && this.currentSession.score === this.currentSession.questions.length) {
      await this.analyticsProcessor.track('achievement_earned', {
        userId: this.currentSession.userId,
        type: 'perfect_score',
        sessionId: this.currentSession.id,
      });
    }

    return {
      correct,
      xpEarned,
      explanation: currentQuestion.explanation,
    };
  }

  /**
   * Move to next question
   */
  nextQuestion(): Question | null {
    if (!this.currentSession) {
      throw new Error('No active quiz session');
    }

    this.currentSession.currentQuestionIndex++;

    if (this.currentSession.currentQuestionIndex >= this.currentSession.questions.length) {
      return null;
    }

    const nextQuestion = this.currentSession.questions[this.currentSession.currentQuestionIndex];

    // Track question view (batched)
    this.analyticsProcessor.track('question_viewed', {
      sessionId: this.currentSession.id,
      questionId: nextQuestion.id,
      questionIndex: this.currentSession.currentQuestionIndex,
    });

    return nextQuestion;
  }

  /**
   * Complete quiz and sync user data
   */
  async completeQuiz(): Promise<{
    score: number;
    totalQuestions: number;
    xpEarned: number;
    percentage: number;
  }> {
    if (!this.currentSession) {
      throw new Error('No active quiz session');
    }

    this.currentSession.completedAt = new Date();
    const percentage = Math.round(
      (this.currentSession.score / this.currentSession.questions.length) * 100,
    );

    // Track completion (batched)
    await this.analyticsProcessor.track('quiz_completed', {
      sessionId: this.currentSession.id,
      userId: this.currentSession.userId,
      score: this.currentSession.score,
      totalQuestions: this.currentSession.questions.length,
      xpEarned: this.currentSession.xpEarned,
      percentage,
      duration: this.currentSession.completedAt.getTime() - this.currentSession.startedAt.getTime(),
    });

    // Sync user progress (batched)
    await this.userDataProcessor.updateUserData({
      userId: this.currentSession.userId,
      field: 'total_xp',
      value: this.currentSession.xpEarned,
      operation: 'increment',
    });

    await this.userDataProcessor.updateUserData({
      userId: this.currentSession.userId,
      field: 'quizzes_completed',
      value: 1,
      operation: 'increment',
    });

    // Store session for history
    await this.saveQuizSession(this.currentSession);

    const result = {
      score: this.currentSession.score,
      totalQuestions: this.currentSession.questions.length,
      xpEarned: this.currentSession.xpEarned,
      percentage,
    };

    // Clear session
    this.currentSession = null;

    // Flush all batch processors to ensure data is saved
    await Promise.all([this.analyticsProcessor.flush(), this.userDataProcessor.flush()]);

    return result;
  }

  /**
   * Get question IDs based on config
   */
  private async getQuestionIds(config: QuizConfig): Promise<string[]> {
    // In production, this would query the database
    // For now, return mock IDs
    const ids = [];
    for (let i = 1; i <= config.questionCount; i++) {
      ids.push(`q-${i}`);
    }
    return ids;
  }

  /**
   * Batch load questions
   */
  private async batchLoadQuestions(questionIds: string[]): Promise<Question[]> {
    // Use API to fetch questions from imported dataset (or DB) with pagination
    const params = new URLSearchParams({ limit: String(questionIds.length) });
    const response = await fetch(`/api/quiz/questions?${params.toString()}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error('Failed to load questions');
    }

    const result = await response.json();
    const mapped: Question[] = (result.questions || []).map((q: any) => ({
      id: q.id,
      text: q.text,
      options: q.options,
      correctAnswer: q.correct_answer,
      difficulty: q.difficulty,
      category: q.categoryId,
      xpReward: 10,
      explanation: q.explanation,
    }));
    return mapped;
  }

  /**
   * Save quiz session to database
   */
  private async saveQuizSession(session: QuizSession): Promise<void> {
    // In production, save to database
    // For now, just track the save event
    await this.analyticsProcessor.track('quiz_session_saved', {
      sessionId: session.id,
      userId: session.userId,
    });
  }

  /**
   * Get quiz history for user
   */
  async getQuizHistory(userId: string, limit = 10): Promise<QuizSession[]> {
    // Track history view
    await this.analyticsProcessor.track('quiz_history_viewed', {
      userId,
      limit,
    });

    // In production, fetch from database
    // For now, return empty array
    return [];
  }

  /**
   * Get user statistics
   */
  async getUserStats(userId: string): Promise<{
    totalQuizzes: number;
    averageScore: number;
    totalXP: number;
    bestStreak: number;
  }> {
    // Track stats view
    await this.analyticsProcessor.track('user_stats_viewed', {
      userId,
    });

    // In production, aggregate from database
    return {
      totalQuizzes: 0,
      averageScore: 0,
      totalXP: 0,
      bestStreak: 0,
    };
  }

  /**
   * Preload questions for better performance
   */
  async preloadQuestions(category?: string, count = 20): Promise<void> {
    const questionIds = await this.getQuestionIds({
      questionCount: count,
      category,
    });

    // Add to batch processor queue for caching
    for (const id of questionIds) {
      await this.questionProcessor.fetchQuestion(id);
    }
  }

  /**
   * Get current session
   */
  getCurrentSession(): QuizSession | null {
    return this.currentSession;
  }

  /**
   * Abandon current quiz
   */
  async abandonQuiz(): Promise<void> {
    if (!this.currentSession) {
      return;
    }

    await this.analyticsProcessor.track('quiz_abandoned', {
      sessionId: this.currentSession.id,
      userId: this.currentSession.userId,
      questionsAnswered: this.currentSession.answers.length,
      totalQuestions: this.currentSession.questions.length,
    });

    this.currentSession = null;
  }
}

// Export singleton instance
export const quizService = new QuizService();

// Export for testing
export { QuizService };
