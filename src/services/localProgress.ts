/**
 * Local Progress Service - Frictionless Progress Tracking
 * No authentication required - works immediately
 */

interface QuizProgress {
  totalQuestions: number;
  correctAnswers: number;
  currentStreak: number;
  bestStreak: number;
  lastPlayedDate: string;
  xp: number;
  level: number;
  achievements: string[];
  categoryProgress: Record<string, CategoryStat>;
  bookmarkedQuestions: string[];
  preferences: UserPreferences;
  sessionHistory: SessionData[];
  dailyChallengeProgress: DailyChallenge;
}

interface CategoryStat {
  attempted: number;
  correct: number;
  lastPlayed: string;
  bestScore: number;
  averageTime: number;
}

interface UserPreferences {
  difficulty: 'easy' | 'medium' | 'hard';
  soundEnabled: boolean;
  hapticEnabled: boolean;
  dailyReminderTime?: string;
  preferredCategories: string[];
}

interface SessionData {
  date: string;
  questionsAnswered: number;
  correctAnswers: number;
  categories: string[];
  xpEarned: number;
  duration: number; // in seconds
}

interface DailyChallenge {
  date: string;
  completed: boolean;
  score: number;
  timeSpent: number;
}

class LocalProgressService {
  private readonly STORAGE_KEY = 'quizmentor_progress';
  private readonly SESSION_KEY = 'quizmentor_session';
  private readonly DEVICE_ID_KEY = 'quizmentor_device_id';
  private progress: QuizProgress;
  private currentSession: SessionData;

  constructor() {
    this.progress = this.loadProgress();
    this.currentSession = this.initSession();
    this.checkStreakContinuity();
    this.generateDeviceId();
  }

  /**
   * Load progress from localStorage or create new
   */
  private loadProgress(): QuizProgress {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load progress, creating new:', error);
    }

    return this.createNewProgress();
  }

  /**
   * Create fresh progress object
   */
  private createNewProgress(): QuizProgress {
    return {
      totalQuestions: 0,
      correctAnswers: 0,
      currentStreak: 0,
      bestStreak: 0,
      lastPlayedDate: new Date().toISOString(),
      xp: 0,
      level: 1,
      achievements: [],
      categoryProgress: {},
      bookmarkedQuestions: [],
      preferences: {
        difficulty: 'medium',
        soundEnabled: true,
        hapticEnabled: true,
        preferredCategories: [],
      },
      sessionHistory: [],
      dailyChallengeProgress: {
        date: new Date().toDateString(),
        completed: false,
        score: 0,
        timeSpent: 0,
      },
    };
  }

  /**
   * Initialize current session
   */
  private initSession(): SessionData {
    const stored = sessionStorage.getItem(this.SESSION_KEY);
    if (stored) {
      return JSON.parse(stored);
    }

    return {
      date: new Date().toISOString(),
      questionsAnswered: 0,
      correctAnswers: 0,
      categories: [],
      xpEarned: 0,
      duration: 0,
    };
  }

  /**
   * Generate or retrieve device ID for optional sync
   */
  private generateDeviceId(): string {
    let deviceId = localStorage.getItem(this.DEVICE_ID_KEY);
    if (!deviceId) {
      deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem(this.DEVICE_ID_KEY, deviceId);
    }
    return deviceId;
  }

  /**
   * Check and update streak continuity
   */
  private checkStreakContinuity(): void {
    const lastPlayed = new Date(this.progress.lastPlayedDate);
    const today = new Date();
    const daysDiff = Math.floor((today.getTime() - lastPlayed.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDiff > 1) {
      // Streak broken
      this.progress.currentStreak = 0;
    } else if (daysDiff === 1) {
      // Playing consecutive day - streak continues
      this.progress.currentStreak++;
      if (this.progress.currentStreak > this.progress.bestStreak) {
        this.progress.bestStreak = this.progress.currentStreak;
      }
    }
    // If daysDiff === 0, already played today, streak unchanged
  }

  /**
   * Save progress to localStorage
   */
  private saveProgress(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.progress));
      sessionStorage.setItem(this.SESSION_KEY, JSON.stringify(this.currentSession));
    } catch (error) {
      console.error('Failed to save progress:', error);
    }
  }

  /**
   * Record a quiz answer
   */
  recordAnswer(questionId: string, category: string, isCorrect: boolean, timeSpent: number): void {
    // Update totals
    this.progress.totalQuestions++;
    this.currentSession.questionsAnswered++;

    if (isCorrect) {
      this.progress.correctAnswers++;
      this.currentSession.correctAnswers++;

      // Award XP
      const xpGained = this.calculateXP(isCorrect, timeSpent);
      this.progress.xp += xpGained;
      this.currentSession.xpEarned += xpGained;

      // Check for level up
      this.checkLevelUp();
    }

    // Update category progress
    if (!this.progress.categoryProgress[category]) {
      this.progress.categoryProgress[category] = {
        attempted: 0,
        correct: 0,
        lastPlayed: new Date().toISOString(),
        bestScore: 0,
        averageTime: 0,
      };
    }

    const categoryStats = this.progress.categoryProgress[category];
    categoryStats.attempted++;
    if (isCorrect) categoryStats.correct++;
    categoryStats.lastPlayed = new Date().toISOString();
    categoryStats.averageTime =
      (categoryStats.averageTime * (categoryStats.attempted - 1) + timeSpent) /
      categoryStats.attempted;

    // Update session categories
    if (!this.currentSession.categories.includes(category)) {
      this.currentSession.categories.push(category);
    }

    // Update session duration
    this.currentSession.duration += timeSpent;

    // Update last played date
    this.progress.lastPlayedDate = new Date().toISOString();

    // Check for achievements
    this.checkAchievements();

    // Save progress
    this.saveProgress();
  }

  /**
   * Calculate XP based on performance
   */
  private calculateXP(isCorrect: boolean, timeSpent: number): number {
    if (!isCorrect) return 5; // Participation XP

    let xp = 10; // Base XP for correct answer

    // Time bonus (faster = more XP)
    if (timeSpent < 5) xp += 5;
    else if (timeSpent < 10) xp += 3;
    else if (timeSpent < 15) xp += 1;

    // Streak bonus
    if (this.progress.currentStreak > 0) {
      xp += Math.min(this.progress.currentStreak, 10); // Max 10 bonus XP from streak
    }

    // Combo bonus (multiple correct in session)
    const sessionAccuracy =
      this.currentSession.correctAnswers / this.currentSession.questionsAnswered;
    if (sessionAccuracy >= 0.8 && this.currentSession.questionsAnswered >= 5) {
      xp += 5; // Accuracy bonus
    }

    return xp;
  }

  /**
   * Check for level up
   */
  private checkLevelUp(): void {
    const xpForNextLevel = this.getXPForLevel(this.progress.level + 1);
    if (this.progress.xp >= xpForNextLevel) {
      this.progress.level++;
      this.unlockAchievement('level_up');
    }
  }

  /**
   * Get XP required for a specific level
   */
  private getXPForLevel(level: number): number {
    return level * 100 * Math.pow(1.1, level - 1);
  }

  /**
   * Check and unlock achievements
   */
  private checkAchievements(): void {
    // First correct answer
    if (this.progress.correctAnswers === 1) {
      this.unlockAchievement('first_correct');
    }

    // Answer milestones
    if (this.progress.totalQuestions === 10) {
      this.unlockAchievement('quiz_starter');
    }
    if (this.progress.totalQuestions === 50) {
      this.unlockAchievement('quiz_enthusiast');
    }
    if (this.progress.totalQuestions === 100) {
      this.unlockAchievement('quiz_master');
    }

    // Streak achievements
    if (this.progress.currentStreak === 3) {
      this.unlockAchievement('streak_3');
    }
    if (this.progress.currentStreak === 7) {
      this.unlockAchievement('streak_week');
    }
    if (this.progress.currentStreak === 30) {
      this.unlockAchievement('streak_month');
    }

    // Accuracy achievements
    const accuracy = this.progress.correctAnswers / this.progress.totalQuestions;
    if (accuracy >= 0.9 && this.progress.totalQuestions >= 20) {
      this.unlockAchievement('accuracy_master');
    }

    // Category mastery
    Object.entries(this.progress.categoryProgress).forEach(([category, stats]) => {
      if (stats.attempted >= 10 && stats.correct / stats.attempted >= 0.8) {
        this.unlockAchievement(`master_${category}`);
      }
    });
  }

  /**
   * Unlock an achievement (idempotent)
   */
  private unlockAchievement(achievementId: string): void {
    if (!this.progress.achievements.includes(achievementId)) {
      this.progress.achievements.push(achievementId);
      // Trigger celebration animation (handled by UI)
      this.onAchievementUnlocked?.(achievementId);
    }
  }

  /**
   * Bookmark a question
   */
  bookmarkQuestion(questionId: string): void {
    if (!this.progress.bookmarkedQuestions.includes(questionId)) {
      this.progress.bookmarkedQuestions.push(questionId);
    } else {
      // Remove if already bookmarked (toggle)
      const index = this.progress.bookmarkedQuestions.indexOf(questionId);
      this.progress.bookmarkedQuestions.splice(index, 1);
    }
    this.saveProgress();
  }

  /**
   * Update user preferences
   */
  updatePreferences(preferences: Partial<UserPreferences>): void {
    this.progress.preferences = { ...this.progress.preferences, ...preferences };
    this.saveProgress();
  }

  /**
   * Complete daily challenge
   */
  completeDailyChallenge(score: number, timeSpent: number): void {
    const today = new Date().toDateString();
    if (this.progress.dailyChallengeProgress.date !== today) {
      this.progress.dailyChallengeProgress = {
        date: today,
        completed: true,
        score,
        timeSpent,
      };

      // Award bonus XP for daily challenge
      this.progress.xp += 50;
      this.unlockAchievement('daily_challenge');
      this.saveProgress();
    }
  }

  /**
   * End current session
   */
  endSession(): void {
    if (this.currentSession.questionsAnswered > 0) {
      // Add to session history (keep last 30 sessions)
      this.progress.sessionHistory.unshift(this.currentSession);
      if (this.progress.sessionHistory.length > 30) {
        this.progress.sessionHistory.pop();
      }

      // Reset current session
      this.currentSession = this.initSession();
      this.saveProgress();
    }
  }

  /**
   * Get progress summary
   */
  getProgress(): QuizProgress {
    return { ...this.progress };
  }

  /**
   * Get current session
   */
  getCurrentSession(): SessionData {
    return { ...this.currentSession };
  }

  /**
   * Get stats for sharing
   */
  getShareableStats() {
    const accuracy =
      this.progress.totalQuestions > 0
        ? Math.round((this.progress.correctAnswers / this.progress.totalQuestions) * 100)
        : 0;

    return {
      level: this.progress.level,
      xp: this.progress.xp,
      streak: this.progress.currentStreak,
      totalQuestions: this.progress.totalQuestions,
      accuracy,
      achievements: this.progress.achievements.length,
      topCategory: this.getTopCategory(),
    };
  }

  /**
   * Get top performing category
   */
  private getTopCategory(): string | null {
    let topCategory = null;
    let topScore = 0;

    Object.entries(this.progress.categoryProgress).forEach(([category, stats]) => {
      if (stats.attempted >= 5) {
        const score = stats.correct / stats.attempted;
        if (score > topScore) {
          topScore = score;
          topCategory = category;
        }
      }
    });

    return topCategory;
  }

  /**
   * Clear all progress (for testing or user request)
   */
  clearProgress(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    sessionStorage.removeItem(this.SESSION_KEY);
    this.progress = this.createNewProgress();
    this.currentSession = this.initSession();
  }

  /**
   * Export progress data (for user download or sync)
   */
  exportProgress(): string {
    return JSON.stringify(
      {
        progress: this.progress,
        deviceId: this.generateDeviceId(),
        exportDate: new Date().toISOString(),
      },
      null,
      2,
    );
  }

  /**
   * Import progress data
   */
  importProgress(data: string): boolean {
    try {
      const imported = JSON.parse(data);
      if (imported.progress) {
        this.progress = imported.progress;
        this.saveProgress();
        return true;
      }
    } catch (error) {
      console.error('Failed to import progress:', error);
    }
    return false;
  }

  // Event callback for achievement unlocks (set by UI)
  onAchievementUnlocked?: (achievementId: string) => void;
}

// Export singleton instance
export const localProgress = new LocalProgressService();

// Export types
export type { QuizProgress, CategoryStat, UserPreferences, SessionData, DailyChallenge };
