import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { analyticsService } from './analyticsService';
import { supabase } from '../lib/supabase';

// Types for remote configuration
export interface RemoteConfig {
  features: FeatureFlags;
  experiments: Experiments;
  quizContent: QuizContent;
  monetization: MonetizationConfig;
  engagement: EngagementConfig;
  maintenance: MaintenanceConfig;
  version: string;
  lastUpdated: Date;
}

export interface FeatureFlags {
  // Core Features
  streaksEnabled: boolean;
  heartsEnabled: boolean;
  dailyChallengesEnabled: boolean;
  leaderboardEnabled: boolean;
  socialFeaturesEnabled: boolean;

  // Monetization
  adsEnabled: boolean;
  subscriptionEnabled: boolean;
  dynamicPricingEnabled: boolean;

  // Experimental
  aiHintsEnabled: boolean;
  voiceQuizEnabled: boolean;
  arModeEnabled: boolean;

  // Dark Patterns
  fakeUsersEnabled: boolean;
  manipulativeNotificationsEnabled: boolean;
  artificialScarcityEnabled: boolean;

  // Rollout Percentages
  rolloutPercentages: {
    [key: string]: number; // 0-100
  };
}

export interface Experiments {
  activeExperiments: Experiment[];
  userAssignments: Map<string, string>; // experimentId -> variant
}

export interface Experiment {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'running' | 'paused' | 'completed';
  startDate: Date;
  endDate?: Date;
  targetAudience: TargetAudience;
  variants: Variant[];
  metrics: string[];
  successCriteria: SuccessCriteria;
}

export interface Variant {
  id: string;
  name: string;
  weight: number; // 0-100 percentage
  config: any; // Variant-specific configuration
  isControl: boolean;
}

export interface TargetAudience {
  percentage: number; // 0-100
  segments?: UserSegment[];
  excludeGroups?: string[];
}

export interface UserSegment {
  type: 'new_users' | 'returning_users' | 'premium' | 'free' | 'high_engagement' | 'low_engagement';
  criteria: any;
}

export interface SuccessCriteria {
  primaryMetric: string;
  secondaryMetrics: string[];
  minimumSampleSize: number;
  confidenceLevel: number; // 0.95 = 95%
}

export interface QuizContent {
  categories: QuizCategory[];
  questions: Map<string, Question[]>;
  dynamicDifficulty: DifficultyConfig;
  contentSchedule: ContentSchedule[];
}

export interface QuizCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  isPremium: boolean;
  questionCount: number;
  xpMultiplier: number;
  unlockLevel?: number;
  tags: string[];
}

export interface Question {
  id: string;
  categoryId: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: number; // 1-10
  tags: string[];
  imageUrl?: string;
  timeLimit?: number;
  xpReward: number;
  metadata?: any;
}

export interface DifficultyConfig {
  adaptiveEnabled: boolean;
  difficultyRange: [number, number];
  adjustmentSpeed: number;
  personalizedDifficulty: boolean;
}

export interface ContentSchedule {
  id: string;
  name: string;
  type: 'seasonal' | 'event' | 'limited_time';
  startDate: Date;
  endDate: Date;
  content: {
    categories?: string[];
    questions?: string[];
    rewards?: any[];
  };
}

export interface MonetizationConfig {
  pricing: PricingConfig;
  ads: AdConfig;
  iap: InAppPurchaseConfig;
  promotions: Promotion[];
}

export interface PricingConfig {
  basePrice: number;
  currency: string;
  countryOverrides: Map<string, number>;
  dynamicPricing: {
    enabled: boolean;
    factors: PricingFactor[];
  };
}

export interface PricingFactor {
  type: 'engagement' | 'location' | 'device' | 'time' | 'frustration';
  weight: number;
  rules: any[];
}

export interface AdConfig {
  providers: string[];
  frequency: {
    interstitial: number; // minutes between ads
    rewarded: number; // max per day
    banner: boolean;
  };
  placements: AdPlacement[];
}

export interface AdPlacement {
  id: string;
  type: 'interstitial' | 'rewarded' | 'banner' | 'native';
  trigger: string;
  priority: number;
  targeting?: any;
}

export interface InAppPurchaseConfig {
  products: Product[];
  bundles: Bundle[];
  consumables: Consumable[];
}

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
}

export interface Bundle {
  id: string;
  name: string;
  products: string[];
  discount: number;
  limitedTime?: boolean;
}

export interface Consumable {
  id: string;
  type: 'hearts' | 'hints' | 'freeze' | 'xp_boost';
  quantity: number;
  price: number;
}

export interface Promotion {
  id: string;
  name: string;
  type: 'discount' | 'trial' | 'bonus' | 'bundle';
  value: number;
  startDate: Date;
  endDate: Date;
  eligibility: any;
  maxUses?: number;
}

export interface EngagementConfig {
  notifications: NotificationConfig;
  streaks: StreakConfig;
  hearts: HeartsConfig;
  challenges: ChallengeConfig;
  social: SocialConfig;
}

export interface NotificationConfig {
  schedule: NotificationSchedule[];
  templates: NotificationTemplate[];
  smartTiming: boolean;
  maxPerDay: number;
}

export interface NotificationSchedule {
  id: string;
  type: string;
  time: string; // HH:MM
  days: number[]; // 0-6
  enabled: boolean;
}

export interface NotificationTemplate {
  id: string;
  trigger: string;
  title: string;
  body: string;
  data?: any;
  priority: 'high' | 'normal' | 'low';
}

export interface StreakConfig {
  bonuses: Map<number, any>; // day -> reward
  freezeCost: number;
  freezeDuration: number;
  milestones: number[];
}

export interface HeartsConfig {
  maxHearts: number;
  regenerationTime: number; // minutes
  adReward: number;
  premiumUnlimited: boolean;
}

export interface ChallengeConfig {
  daily: {
    enabled: boolean;
    rewards: any[];
    difficulty: string;
  };
  weekly: {
    enabled: boolean;
    rewards: any[];
  };
  special: SpecialChallenge[];
}

export interface SpecialChallenge {
  id: string;
  name: string;
  description: string;
  requirements: any;
  rewards: any[];
  expiresAt: Date;
}

export interface SocialConfig {
  fakeFriends: {
    enabled: boolean;
    count: number;
    activityLevel: number;
  };
  leaderboard: {
    updateFrequency: number;
    fakeUpdates: boolean;
    riggedRanking: boolean;
  };
  challenges: {
    enabled: boolean;
    wagerLimits: [number, number];
  };
}

export interface MaintenanceConfig {
  enabled: boolean;
  message: string;
  estimatedEndTime?: Date;
  allowedVersions?: string[];
  blockedFeatures?: string[];
}

// Remote Config Service Implementation
class RemoteConfigService {
  private config: RemoteConfig | null = null;
  private cachedConfig: RemoteConfig | null = null;
  private updateInterval: NodeJS.Timeout | null = null;
  private userId: string | null = null;
  private deviceId: string;
  private sessionId: string;

  constructor() {
    this.deviceId = this.generateDeviceId();
    this.sessionId = this.generateSessionId();
  }

  async initialize(userId?: string) {
    this.userId = userId || 'anonymous';

    // Load cached config first
    await this.loadCachedConfig();

    // Fetch latest config from server
    await this.fetchRemoteConfig();

    // Start periodic updates
    this.startAutoUpdate();

    // Initialize experiments
    await this.initializeExperiments();
  }

  private async loadCachedConfig() {
    try {
      const cached = await AsyncStorage.getItem('remote_config');
      if (cached) {
        this.cachedConfig = JSON.parse(cached);
        this.config = this.cachedConfig;
      }
    } catch (error) {
      console.error('Failed to load cached config:', error);
    }
  }

  private async fetchRemoteConfig() {
    try {
      // Fetch from Supabase
      const { data, error } = await supabase
        .from('remote_configs')
        .select('*')
        .eq('active', true)
        .single();

      if (error) throw error;

      // Parse and validate config
      const config = this.parseConfig(data);

      // Apply user-specific overrides
      const personalizedConfig = await this.personalizeConfig(config);

      this.config = personalizedConfig;

      // Cache for offline use
      await this.cacheConfig(personalizedConfig);

      // Track config update
      analyticsService.track('config_updated', {
        version: personalizedConfig.version,
      });
    } catch (error) {
      console.error('Failed to fetch remote config:', error);
      // Fall back to cached config
      this.config = this.cachedConfig;
    }
  }

  private parseConfig(data: any): RemoteConfig {
    return {
      features: data.features || this.getDefaultFeatures(),
      experiments: data.experiments || { activeExperiments: [], userAssignments: new Map() },
      quizContent: data.quizContent || {
        categories: [],
        questions: new Map(),
        dynamicDifficulty: this.getDefaultDifficulty(),
        contentSchedule: [],
      },
      monetization: data.monetization || this.getDefaultMonetization(),
      engagement: data.engagement || this.getDefaultEngagement(),
      maintenance: data.maintenance || { enabled: false, message: '' },
      version: data.version || '1.0.0',
      lastUpdated: new Date(data.updated_at || Date.now()),
    };
  }

  private async personalizeConfig(config: RemoteConfig): Promise<RemoteConfig> {
    // Apply user segmentation
    const userSegment = await this.getUserSegment();

    // Apply feature rollouts
    const personalizedFeatures = this.applyRollouts(config.features, userSegment);

    // Apply experiment assignments
    const experimentsWithAssignments = await this.assignExperiments(config.experiments);

    // Apply dynamic pricing
    const personalizedMonetization = await this.applyDynamicPricing(config.monetization);

    return {
      ...config,
      features: personalizedFeatures,
      experiments: experimentsWithAssignments,
      monetization: personalizedMonetization,
    };
  }

  private async cacheConfig(config: RemoteConfig) {
    try {
      await AsyncStorage.setItem('remote_config', JSON.stringify(config));
    } catch (error) {
      console.error('Failed to cache config:', error);
    }
  }

  private startAutoUpdate() {
    // Update config every 5 minutes
    this.updateInterval = setInterval(
      () => {
        this.fetchRemoteConfig();
      },
      5 * 60 * 1000,
    );
  }

  // Feature Flag Methods
  isFeatureEnabled(feature: keyof FeatureFlags): boolean {
    if (!this.config) return false;

    const isEnabled = this.config.features[feature];

    // Check rollout percentage if applicable
    if (this.config.features.rolloutPercentages[feature] !== undefined) {
      const rolloutPercentage = this.config.features.rolloutPercentages[feature];
      const userHash = this.hashUser(this.userId + feature);
      return isEnabled && userHash % 100 < rolloutPercentage;
    }

    return isEnabled;
  }

  getFeatureValue<T>(feature: string, defaultValue: T): T {
    if (!this.config) return defaultValue;

    const value = this.getNestedValue(this.config, feature);
    return value !== undefined ? value : defaultValue;
  }

  // Experiment Methods
  private async initializeExperiments() {
    if (!this.config) return;

    for (const experiment of this.config.experiments.activeExperiments) {
      if (this.isUserEligibleForExperiment(experiment)) {
        const variant = this.assignVariant(experiment);
        this.config.experiments.userAssignments.set(experiment.id, variant.id);

        // Track experiment exposure
        analyticsService.trackExperiment(experiment.name, variant.name, {
          experimentId: experiment.id,
          variantId: variant.id,
        });
      }
    }
  }

  private isUserEligibleForExperiment(experiment: Experiment): boolean {
    // Check if experiment is running
    if (experiment.status !== 'running') return false;

    // Check date range
    const now = new Date();
    if (now < experiment.startDate || (experiment.endDate && now > experiment.endDate)) {
      return false;
    }

    // Check target audience
    const userHash = this.hashUser(this.userId + experiment.id);
    if (userHash % 100 >= experiment.targetAudience.percentage) {
      return false;
    }

    // Check segments
    if (experiment.targetAudience.segments) {
      const userSegment = this.getUserSegmentSync();
      const isInSegment = experiment.targetAudience.segments.some(
        (segment) => segment.type === userSegment,
      );
      if (!isInSegment) return false;
    }

    return true;
  }

  private assignVariant(experiment: Experiment): Variant {
    const userHash = this.hashUser(this.userId + experiment.id + 'variant');
    const random = userHash % 100;

    let cumulativeWeight = 0;
    for (const variant of experiment.variants) {
      cumulativeWeight += variant.weight;
      if (random < cumulativeWeight) {
        return variant;
      }
    }

    // Fallback to control
    return experiment.variants.find((v) => v.isControl) || experiment.variants[0];
  }

  getExperimentVariant(experimentId: string): string | null {
    if (!this.config) return null;

    return this.config.experiments.userAssignments.get(experimentId) || null;
  }

  getExperimentConfig(experimentId: string): any {
    if (!this.config) return null;

    const experiment = this.config.experiments.activeExperiments.find((e) => e.id === experimentId);

    if (!experiment) return null;

    const variantId = this.getExperimentVariant(experimentId);
    const variant = experiment.variants.find((v) => v.id === variantId);

    return variant?.config || null;
  }

  // Quiz Content Methods
  async fetchDynamicQuizzes(category?: string): Promise<Question[]> {
    try {
      const { data, error } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('active', true)
        .eq(category ? 'category' : 'true', category || 'true')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      return data.map((q) => ({
        id: q.id,
        categoryId: q.category_id,
        question: q.question,
        options: q.options,
        correctAnswer: q.correct_answer,
        explanation: q.explanation,
        difficulty: q.difficulty,
        tags: q.tags || [],
        imageUrl: q.image_url,
        timeLimit: q.time_limit,
        xpReward: q.xp_reward || 10,
        metadata: q.metadata,
      }));
    } catch (error) {
      console.error('Failed to fetch dynamic quizzes:', error);
      return [];
    }
  }

  async submitQuizQuestion(question: Partial<Question>): Promise<boolean> {
    try {
      const { error } = await supabase.from('quiz_submissions').insert({
        ...question,
        submitted_by: this.userId,
        status: 'pending',
      });

      return !error;
    } catch (error) {
      console.error('Failed to submit question:', error);
      return false;
    }
  }

  // User Segmentation
  private async getUserSegment(): Promise<UserSegment['type']> {
    // Analyze user behavior
    const daysActive = await this.getDaysActive();
    const isPremium = await this.checkPremiumStatus();
    const engagementScore = await this.calculateEngagementScore();

    if (isPremium) return 'premium';
    if (daysActive <= 7) return 'new_users';
    if (engagementScore > 0.7) return 'high_engagement';
    if (engagementScore < 0.3) return 'low_engagement';
    return 'returning_users';
  }

  private getUserSegmentSync(): UserSegment['type'] {
    // Simplified synchronous version
    return 'returning_users';
  }

  // Dynamic Pricing
  private async applyDynamicPricing(monetization: MonetizationConfig): Promise<MonetizationConfig> {
    if (!monetization.pricing.dynamicPricing.enabled) {
      return monetization;
    }

    let priceMultiplier = 1.0;

    for (const factor of monetization.pricing.dynamicPricing.factors) {
      const factorValue = await this.calculatePricingFactor(factor);
      priceMultiplier += factorValue * factor.weight;
    }

    // Apply multiplier to base price
    const adjustedPrice = Math.round(monetization.pricing.basePrice * priceMultiplier * 100) / 100;

    return {
      ...monetization,
      pricing: {
        ...monetization.pricing,
        basePrice: adjustedPrice,
      },
    };
  }

  private async calculatePricingFactor(factor: PricingFactor): Promise<number> {
    switch (factor.type) {
      case 'engagement':
        const engagement = await this.calculateEngagementScore();
        return engagement > 0.5 ? 0.1 : -0.1; // Higher price for engaged users

      case 'location':
        const country = await this.getUserCountry();
        const pppIndex = this.getPurchasingPowerParity(country);
        return (1 - pppIndex) * 0.5; // Adjust based on PPP

      case 'frustration':
        const frustration = await this.getFrustrationLevel();
        return frustration > 0.7 ? -0.2 : 0; // Discount for frustrated users

      default:
        return 0;
    }
  }

  // Helper Methods
  private hashUser(input: string): number {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  private generateDeviceId(): string {
    return `${Platform.OS}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getNestedValue(obj: any, path: string): any {
    const keys = path.split('.');
    let current = obj;

    for (const key of keys) {
      if (current[key] === undefined) return undefined;
      current = current[key];
    }

    return current;
  }

  private applyRollouts(features: FeatureFlags, segment: UserSegment['type']): FeatureFlags {
    // Apply segment-specific feature overrides
    const segmentOverrides: Partial<FeatureFlags> = {};

    // New users get simplified experience
    if (segment === 'new_users') {
      segmentOverrides.aiHintsEnabled = false;
      segmentOverrides.socialFeaturesEnabled = false;
    }

    // High engagement users get experimental features
    if (segment === 'high_engagement') {
      segmentOverrides.voiceQuizEnabled = true;
      segmentOverrides.arModeEnabled = true;
    }

    return { ...features, ...segmentOverrides };
  }

  private async assignExperiments(experiments: Experiments): Promise<Experiments> {
    // Implementation already in initializeExperiments
    return experiments;
  }

  private async getDaysActive(): Promise<number> {
    // Get from analytics or storage
    return 10; // Placeholder
  }

  private async checkPremiumStatus(): Promise<boolean> {
    // Check subscription status
    return false; // Placeholder
  }

  private async calculateEngagementScore(): Promise<number> {
    // Calculate based on session frequency, quiz completion, etc.
    return 0.5; // Placeholder
  }

  private async getUserCountry(): Promise<string> {
    // Get from device locale or IP
    return 'US'; // Placeholder
  }

  private getPurchasingPowerParity(country: string): number {
    // PPP index relative to US
    const pppIndex: { [key: string]: number } = {
      US: 1.0,
      UK: 0.9,
      IN: 0.3,
      BR: 0.4,
      NG: 0.3,
      // Add more countries
    };

    return pppIndex[country] || 0.5;
  }

  private async getFrustrationLevel(): Promise<number> {
    // Get from analytics service
    return 0.5; // Placeholder
  }

  // Default Configurations
  private getDefaultFeatures(): FeatureFlags {
    return {
      streaksEnabled: true,
      heartsEnabled: true,
      dailyChallengesEnabled: true,
      leaderboardEnabled: true,
      socialFeaturesEnabled: true,
      adsEnabled: true,
      subscriptionEnabled: true,
      dynamicPricingEnabled: false,
      aiHintsEnabled: false,
      voiceQuizEnabled: false,
      arModeEnabled: false,
      fakeUsersEnabled: true,
      manipulativeNotificationsEnabled: true,
      artificialScarcityEnabled: true,
      rolloutPercentages: {},
    };
  }

  private getDefaultDifficulty(): DifficultyConfig {
    return {
      adaptiveEnabled: true,
      difficultyRange: [1, 10],
      adjustmentSpeed: 0.1,
      personalizedDifficulty: true,
    };
  }

  private getDefaultMonetization(): MonetizationConfig {
    return {
      pricing: {
        basePrice: 9.99,
        currency: 'USD',
        countryOverrides: new Map(),
        dynamicPricing: {
          enabled: false,
          factors: [],
        },
      },
      ads: {
        providers: ['admob'],
        frequency: {
          interstitial: 3,
          rewarded: 10,
          banner: true,
        },
        placements: [],
      },
      iap: {
        products: [],
        bundles: [],
        consumables: [],
      },
      promotions: [],
    };
  }

  private getDefaultEngagement(): EngagementConfig {
    return {
      notifications: {
        schedule: [],
        templates: [],
        smartTiming: true,
        maxPerDay: 8,
      },
      streaks: {
        bonuses: new Map(),
        freezeCost: 100,
        freezeDuration: 24,
        milestones: [7, 30, 100, 365],
      },
      hearts: {
        maxHearts: 5,
        regenerationTime: 30,
        adReward: 3,
        premiumUnlimited: true,
      },
      challenges: {
        daily: {
          enabled: true,
          rewards: [],
          difficulty: 'adaptive',
        },
        weekly: {
          enabled: true,
          rewards: [],
        },
        special: [],
      },
      social: {
        fakeFriends: {
          enabled: true,
          count: 5,
          activityLevel: 0.7,
        },
        leaderboard: {
          updateFrequency: 30,
          fakeUpdates: true,
          riggedRanking: true,
        },
        challenges: {
          enabled: true,
          wagerLimits: [50, 500],
        },
      },
    };
  }

  // Public API
  getConfig(): RemoteConfig | null {
    return this.config;
  }

  async forceRefresh(): Promise<void> {
    await this.fetchRemoteConfig();
  }

  cleanup() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
  }
}

export const remoteConfigService = new RemoteConfigService();
