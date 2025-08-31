import AsyncStorage from '@react-native-async-storage/async-storage';
import { useHeartsStore } from '../store/heartsStore';
import { useStreakStore } from '../store/streakStore';
import { useSubscriptionStore } from '../store/subscriptionStore';
import { useDailyChallengeStore } from '../store/dailyChallengeStore';

interface AnalyticsEvent {
  eventName: string;
  properties: Record<string, any>;
  timestamp: Date;
  sessionId: string;
  userId?: string;
}

interface UserSession {
  sessionId: string;
  startTime: Date;
  endTime?: Date;
  events: AnalyticsEvent[];
  frustrationScore: number;
  engagementScore: number;
  monetizationPotential: number;
}

interface ManipulationMetrics {
  streakPressureEffectiveness: number;
  heartsFrustrationLevel: number;
  notificationResponseRate: number;
  adToleranceThreshold: number;
  premiumConversionLikelihood: number;
  socialPressureSusceptibility: number;
  fomoDrivenActions: number;
  darkPatternEffectiveness: Record<string, number>;
}

class AnalyticsService {
  private currentSession: UserSession | null = null;
  private manipulationMetrics: ManipulationMetrics = {
    streakPressureEffectiveness: 0,
    heartsFrustrationLevel: 0,
    notificationResponseRate: 0,
    adToleranceThreshold: 10,
    premiumConversionLikelihood: 0,
    socialPressureSusceptibility: 0,
    fomoDrivenActions: 0,
    darkPatternEffectiveness: {},
  };

  private frustrationEvents = {
    heartsDepletedCount: 0,
    streakLostCount: 0,
    adsWatchedCount: 0,
    paywallViewsCount: 0,
    ragequitCount: 0,
  };

  async initialize() {
    // Load previous metrics
    await this.loadStoredMetrics();

    // Start new session
    this.startSession();

    // Track app lifecycle
    this.trackAppLifecycle();

    // Monitor manipulation effectiveness
    this.startMetricsCollection();
  }

  private async loadStoredMetrics() {
    try {
      const stored = await AsyncStorage.getItem('manipulation_metrics');
      if (stored) {
        this.manipulationMetrics = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load metrics:', error);
    }
  }

  private async saveMetrics() {
    try {
      await AsyncStorage.setItem('manipulation_metrics', JSON.stringify(this.manipulationMetrics));
    } catch (error) {
      console.error('Failed to save metrics:', error);
    }
  }

  private startSession() {
    this.currentSession = {
      sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      startTime: new Date(),
      events: [],
      frustrationScore: 0,
      engagementScore: 0,
      monetizationPotential: 0,
    };
  }

  private trackAppLifecycle() {
    // Track when app goes to background (potential ragequit)
    // In React Native, use AppState
  }

  private startMetricsCollection() {
    // Collect metrics every 30 seconds
    setInterval(() => {
      this.calculateManipulationEffectiveness();
      this.identifyConversionTriggers();
      this.measureUserFrustration();
    }, 30000);
  }

  // Core tracking methods
  track(eventName: string, properties: Record<string, any> = {}) {
    if (!this.currentSession) {
      this.startSession();
    }

    const event: AnalyticsEvent = {
      eventName,
      properties,
      timestamp: new Date(),
      sessionId: this.currentSession!.sessionId,
    };

    this.currentSession!.events.push(event);

    // Process event for manipulation metrics
    this.processEventForMetrics(event);

    // Log for debugging
    console.log(`📊 [Analytics] ${eventName}:`, properties);
  }

  private processEventForMetrics(event: AnalyticsEvent) {
    // Track dark pattern effectiveness
    switch (event.eventName) {
      case 'streak_modal_shown':
        this.manipulationMetrics.darkPatternEffectiveness['streak_fear'] =
          (this.manipulationMetrics.darkPatternEffectiveness['streak_fear'] || 0) + 1;
        break;

      case 'hearts_depleted':
        this.frustrationEvents.heartsDepletedCount++;
        this.manipulationMetrics.heartsFrustrationLevel++;
        break;

      case 'ad_watched':
        this.frustrationEvents.adsWatchedCount++;
        if (
          this.frustrationEvents.adsWatchedCount > this.manipulationMetrics.adToleranceThreshold
        ) {
          this.track('ad_fatigue_reached');
        }
        break;

      case 'paywall_viewed':
        this.frustrationEvents.paywallViewsCount++;
        this.calculatePremiumConversionLikelihood();
        break;

      case 'notification_opened':
        this.manipulationMetrics.notificationResponseRate++;
        break;

      case 'challenge_accepted':
        this.manipulationMetrics.socialPressureSusceptibility++;
        break;

      case 'fomo_action':
        this.manipulationMetrics.fomoDrivenActions++;
        break;
    }
  }

  // Manipulation effectiveness calculations
  private calculateManipulationEffectiveness() {
    const streakStore = useStreakStore.getState();
    const heartsStore = useHeartsStore.getState();
    const challengeStore = useDailyChallengeStore.getState();

    // Streak pressure effectiveness
    if (streakStore.currentStreak > 0) {
      const lastQuizTime = this.getLastQuizTime();
      const hoursSinceLastQuiz = lastQuizTime ? (Date.now() - lastQuizTime) / (1000 * 60 * 60) : 24;

      if (hoursSinceLastQuiz < 24) {
        this.manipulationMetrics.streakPressureEffectiveness = Math.min(
          1,
          streakStore.currentStreak / 30,
        ); // Max at 30 days
      }
    }

    // Hearts frustration
    if (heartsStore.hearts === 0) {
      this.manipulationMetrics.heartsFrustrationLevel = Math.min(
        1,
        this.frustrationEvents.heartsDepletedCount / 5,
      );
    }

    // Challenge engagement
    if (challengeStore.currentChallenge) {
      const completionRate = challengeStore.consecutiveDays / 7;
      this.track('challenge_engagement', {
        completionRate,
        consecutiveDays: challengeStore.consecutiveDays,
      });
    }
  }

  private calculatePremiumConversionLikelihood() {
    const factors = {
      paywallViews: this.frustrationEvents.paywallViewsCount * 0.1,
      heartsDepletion: this.frustrationEvents.heartsDepletedCount * 0.15,
      adFatigue: Math.min(this.frustrationEvents.adsWatchedCount / 20, 0.3),
      streakLength: Math.min(useStreakStore.getState().currentStreak / 30, 0.2),
      sessionCount: Math.min(this.getSessionCount() / 10, 0.25),
    };

    this.manipulationMetrics.premiumConversionLikelihood = Object.values(factors).reduce(
      (a, b) => a + b,
      0,
    );

    // Trigger aggressive upsell if likelihood > 70%
    if (this.manipulationMetrics.premiumConversionLikelihood > 0.7) {
      this.track('high_conversion_potential', {
        likelihood: this.manipulationMetrics.premiumConversionLikelihood,
      });
    }
  }

  private identifyConversionTriggers() {
    const triggers = [];

    if (this.frustrationEvents.heartsDepletedCount >= 3) {
      triggers.push('hearts_frustration');
    }

    if (this.frustrationEvents.adsWatchedCount >= 10) {
      triggers.push('ad_fatigue');
    }

    if (useStreakStore.getState().currentStreak >= 7) {
      triggers.push('streak_investment');
    }

    if (this.manipulationMetrics.socialPressureSusceptibility > 5) {
      triggers.push('social_pressure');
    }

    if (triggers.length > 0) {
      this.track('conversion_triggers_identified', { triggers });
    }

    return triggers;
  }

  private measureUserFrustration() {
    if (!this.currentSession) return;

    const frustrationFactors = {
      heartsEmpty: useHeartsStore.getState().hearts === 0 ? 20 : 0,
      adsWatched: Math.min(this.frustrationEvents.adsWatchedCount * 5, 30),
      paywallsSeen: Math.min(this.frustrationEvents.paywallViewsCount * 10, 30),
      challengesFailed: 0, // Track failed challenges
      notificationOverload: Math.min(this.manipulationMetrics.notificationResponseRate * 2, 20),
    };

    this.currentSession.frustrationScore = Object.values(frustrationFactors).reduce(
      (a, b) => a + b,
      0,
    );

    // Alert if frustration too high (risk of churn)
    if (this.currentSession.frustrationScore > 70) {
      this.track('high_frustration_detected', {
        score: this.currentSession.frustrationScore,
        factors: frustrationFactors,
      });

      // Back off on aggressive tactics
      console.warn('⚠️ User frustration critical - reduce pressure');
    }
  }

  // Conversion funnel tracking
  trackFunnelStep(funnel: string, step: string, properties?: Record<string, any>) {
    this.track(`funnel_${funnel}_${step}`, {
      funnel,
      step,
      ...properties,
    });
  }

  // A/B testing support
  trackExperiment(experimentName: string, variant: string, properties?: Record<string, any>) {
    this.track('experiment_exposure', {
      experiment: experimentName,
      variant,
      ...properties,
    });
  }

  // Revenue tracking
  trackRevenue(amount: number, source: string, properties?: Record<string, any>) {
    this.track('revenue', {
      amount,
      source,
      currency: 'USD',
      ...properties,
    });
  }

  // Helper methods
  private getLastQuizTime(): number | null {
    if (!this.currentSession) return null;

    const quizEvents = this.currentSession.events.filter((e) => e.eventName === 'quiz_completed');

    if (quizEvents.length === 0) return null;

    return quizEvents[quizEvents.length - 1].timestamp.getTime();
  }

  private getSessionCount(): number {
    // In production, track across multiple sessions
    return 1;
  }

  // Export metrics for optimization
  async exportMetrics(): Promise<ManipulationMetrics> {
    await this.saveMetrics();
    return this.manipulationMetrics;
  }

  // Get recommendations for increasing manipulation
  getManipulationRecommendations(): string[] {
    const recommendations = [];

    if (this.manipulationMetrics.streakPressureEffectiveness < 0.5) {
      recommendations.push('Increase streak reminder frequency');
    }

    if (this.manipulationMetrics.heartsFrustrationLevel < 0.3) {
      recommendations.push('Reduce hearts regeneration rate');
    }

    if (this.manipulationMetrics.notificationResponseRate < 0.2) {
      recommendations.push('Test more aggressive notification copy');
    }

    if (this.manipulationMetrics.premiumConversionLikelihood > 0.6) {
      recommendations.push('Show limited-time offer immediately');
    }

    if (this.manipulationMetrics.socialPressureSusceptibility > 0.7) {
      recommendations.push('Increase fake friend activity');
    }

    return recommendations;
  }
}

export const analyticsService = new AnalyticsService();

// Predefined events for easy tracking
export const AnalyticsEvents = {
  // Engagement
  APP_OPENED: 'app_opened',
  QUIZ_STARTED: 'quiz_started',
  QUIZ_COMPLETED: 'quiz_completed',
  QUESTION_ANSWERED: 'question_answered',

  // Monetization
  PAYWALL_VIEWED: 'paywall_viewed',
  SUBSCRIPTION_STARTED: 'subscription_started',
  AD_WATCHED: 'ad_watched',
  AD_CLICKED: 'ad_clicked',

  // Frustration
  HEARTS_DEPLETED: 'hearts_depleted',
  STREAK_LOST: 'streak_lost',
  APP_BACKGROUNDED: 'app_backgrounded',

  // Dark Patterns
  STREAK_MODAL_SHOWN: 'streak_modal_shown',
  FOMO_ACTION: 'fomo_action',
  NOTIFICATION_OPENED: 'notification_opened',
  CHALLENGE_ACCEPTED: 'challenge_accepted',

  // Social
  FRIEND_CHALLENGED: 'friend_challenged',
  ACHIEVEMENT_SHARED: 'achievement_shared',
  LEADERBOARD_VIEWED: 'leaderboard_viewed',
};
