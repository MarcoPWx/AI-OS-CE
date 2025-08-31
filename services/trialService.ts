import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { notificationService } from './notificationService';
import { useSubscriptionStore } from './subscriptionService';
import analytics from './analytics';

// Trial configuration types
interface TrialTier {
  name: string;
  duration: number; // days
  features: string[];
  conversionTarget: number; // percentage
  triggerConditions: string[];
  dynamicPricing: boolean;
  urgencyCampaign: boolean;
}

interface TrialBehavior {
  action: string;
  timestamp: number;
  context?: any;
}

interface TrialMetrics {
  featureUsage: Map<string, number>;
  engagementScore: number;
  conversionProbability: number;
  optimalPrice: number;
  frustrationEvents: number;
  delightEvents: number;
}

interface TrialState {
  isActive: boolean;
  tier: TrialTier | null;
  startDate: number | null;
  endDate: number | null;
  behaviors: TrialBehavior[];
  metrics: TrialMetrics;
  hasSeenPaywall: boolean;
  conversionAttempts: number;
  lastOfferPrice: number;
  lastOfferDiscount: number;
}

// Trial tiers configuration
const TRIAL_TIERS: { [key: string]: TrialTier } = {
  DISCOVERY: {
    name: 'Discovery Trial',
    duration: 3,
    features: ['unlimited_hearts', 'no_ads'],
    conversionTarget: 5,
    triggerConditions: ['first_install'],
    dynamicPricing: false,
    urgencyCampaign: true,
  },

  ENGAGEMENT: {
    name: 'Engagement Trial',
    duration: 7,
    features: ['unlimited_hearts', 'no_ads', 'premium_categories', 'advanced_stats'],
    conversionTarget: 15,
    triggerConditions: ['streak_7_days', 'level_5_reached', 'high_engagement'],
    dynamicPricing: true,
    urgencyCampaign: true,
  },

  POWER_USER: {
    name: 'Power User Trial',
    duration: 14,
    features: ['all_premium_features'],
    conversionTarget: 25,
    triggerConditions: ['100_questions_answered', 'friend_referral', 'achievement_hunter'],
    dynamicPricing: true,
    urgencyCampaign: false,
  },

  WIN_BACK: {
    name: 'Win-Back Trial',
    duration: 3,
    features: ['unlimited_hearts', 'no_ads'],
    conversionTarget: 10,
    triggerConditions: ['churned_user_return', 'subscription_cancelled', 'long_absence'],
    dynamicPricing: true,
    urgencyCampaign: true,
  },

  SEASONAL: {
    name: 'Seasonal Trial',
    duration: 7,
    features: ['all_premium_features', 'exclusive_content'],
    conversionTarget: 20,
    triggerConditions: ['holiday_period', 'special_event'],
    dynamicPricing: true,
    urgencyCampaign: true,
  },
};

// Urgency campaign configuration
const URGENCY_CAMPAIGNS = {
  day_minus_3: {
    notification: '⏰ 3 days left in your trial!',
    inApp: 'Enjoying premium? Lock in your 30% discount now',
    email: true,
    discount: 30,
    showCountdown: false,
  },

  day_minus_2: {
    notification: '📅 Only 2 days left of unlimited learning!',
    inApp: 'Special offer: 40% off if you subscribe today',
    email: false,
    discount: 40,
    showCountdown: true,
  },

  day_minus_1: {
    notification: "🚨 Trial ends tomorrow! Don't lose your progress",
    inApp: 'Last chance: 50% off your first month',
    email: true,
    pushFrequency: 3,
    discount: 50,
    showCountdown: true,
  },

  final_12_hours: {
    notification: '⏳ 12 hours left! Your benefits expire soon',
    inApp: 'Final offer: 60% off - valid for 12 hours only',
    email: true,
    pushFrequency: 2,
    discount: 60,
    showCountdown: true,
  },

  final_3_hours: {
    notification: '💔 Only 3 hours left! Your unlimited hearts expire soon',
    inApp: 'Emergency offer: 70% off - expires with your trial',
    email: true,
    pushFrequency: 'hourly',
    discount: 70,
    showCountdown: true,
    createUrgency: true,
  },

  expired: {
    notification: '😢 Trial ended - Get 40% off to continue',
    inApp: "We miss you! Here's an exclusive comeback offer",
    email: true,
    validity: 48,
    discount: 40,
    showCountdown: false,
  },
};

// Create trial store
interface TrialStore extends TrialState {
  // Actions
  startTrial: (tierName: string) => Promise<void>;
  endTrial: () => Promise<void>;
  trackBehavior: (action: string, context?: any) => void;
  checkTrialStatus: () => boolean;
  getTimeRemaining: () => number;
  calculateOptimalPrice: () => number;
  getConversionProbability: () => number;
  triggerUrgencyCampaign: () => void;
  offerDynamicDiscount: () => Promise<number>;
  extendTrial: (days: number) => void;
  pauseTrial: () => void;
  resumeTrial: () => void;
}

export const useTrialStore = create<TrialStore>()(
  persist(
    (set, get) => ({
      // Initial state
      isActive: false,
      tier: null,
      startDate: null,
      endDate: null,
      behaviors: [],
      metrics: {
        featureUsage: new Map(),
        engagementScore: 0,
        conversionProbability: 0,
        optimalPrice: 9.99,
        frustrationEvents: 0,
        delightEvents: 0,
      },
      hasSeenPaywall: false,
      conversionAttempts: 0,
      lastOfferPrice: 9.99,
      lastOfferDiscount: 0,

      // Start a trial
      startTrial: async (tierName: string) => {
        const tier = TRIAL_TIERS[tierName];
        if (!tier) {
          console.error('Invalid trial tier:', tierName);
          return;
        }

        const startDate = Date.now();
        const endDate = startDate + tier.duration * 24 * 60 * 60 * 1000;

        set({
          isActive: true,
          tier,
          startDate,
          endDate,
          behaviors: [],
          metrics: {
            featureUsage: new Map(),
            engagementScore: 0,
            conversionProbability: 0,
            optimalPrice: 9.99,
            frustrationEvents: 0,
            delightEvents: 0,
          },
          hasSeenPaywall: false,
          conversionAttempts: 0,
        });

        // Track trial start
        analytics.track('trial_started', {
          tier: tierName,
          duration: tier.duration,
          features: tier.features,
        });

        // Schedule urgency notifications
        get().scheduleUrgencyNotifications();

        // Enable trial features
        get().enableTrialFeatures(tier.features);

        console.log(`Started ${tier.name} for ${tier.duration} days`);
      },

      // End trial
      endTrial: async () => {
        const state = get();

        // Track trial end
        analytics.track('trial_ended', {
          tier: state.tier?.name,
          duration: state.tier?.duration,
          engagementScore: state.metrics.engagementScore,
          conversionProbability: state.metrics.conversionProbability,
          converted: false,
        });

        // Disable trial features
        if (state.tier) {
          get().disableTrialFeatures(state.tier.features);
        }

        set({
          isActive: false,
          tier: null,
          startDate: null,
          endDate: null,
        });

        // Trigger win-back campaign
        setTimeout(
          () => {
            get().triggerWinBackCampaign();
          },
          24 * 60 * 60 * 1000,
        ); // 24 hours later
      },

      // Track user behavior
      trackBehavior: (action: string, context?: any) => {
        const behavior: TrialBehavior = {
          action,
          timestamp: Date.now(),
          context,
        };

        set((state) => ({
          behaviors: [...state.behaviors, behavior],
        }));

        // Update metrics based on behavior
        get().updateMetrics(action, context);

        // Check for conversion triggers
        get().checkConversionTriggers(action);
      },

      // Check if trial is active
      checkTrialStatus: () => {
        const state = get();

        if (!state.isActive || !state.endDate) {
          return false;
        }

        const now = Date.now();
        if (now > state.endDate) {
          get().endTrial();
          return false;
        }

        return true;
      },

      // Get time remaining in trial
      getTimeRemaining: () => {
        const state = get();

        if (!state.isActive || !state.endDate) {
          return 0;
        }

        const now = Date.now();
        return Math.max(0, state.endDate - now);
      },

      // Calculate optimal price based on user behavior
      calculateOptimalPrice: () => {
        const state = get();
        const basePrice = 9.99;

        // Factors affecting price
        const factors = {
          engagementScore: state.metrics.engagementScore,
          frustrationLevel: state.metrics.frustrationEvents / Math.max(1, state.behaviors.length),
          delightLevel: state.metrics.delightEvents / Math.max(1, state.behaviors.length),
          daysInTrial: state.startDate ? (Date.now() - state.startDate) / (24 * 60 * 60 * 1000) : 0,
          conversionAttempts: state.conversionAttempts,
        };

        let priceMultiplier = 1.0;

        // High engagement = less discount needed
        priceMultiplier *= 0.7 + factors.engagementScore * 0.3;

        // High frustration = more discount
        priceMultiplier *= 1 - factors.frustrationLevel * 0.3;

        // High delight = less discount
        priceMultiplier *= 1 + factors.delightLevel * 0.2;

        // Multiple conversion attempts = more discount
        priceMultiplier *= Math.max(0.5, 1 - factors.conversionAttempts * 0.15);

        // Time pressure
        const timeRemaining = get().getTimeRemaining();
        const hoursRemaining = timeRemaining / (60 * 60 * 1000);

        if (hoursRemaining < 24) {
          priceMultiplier *= 0.7; // 30% off in last 24 hours
        } else if (hoursRemaining < 72) {
          priceMultiplier *= 0.85; // 15% off in last 3 days
        }

        const optimalPrice = Math.round(basePrice * priceMultiplier * 100) / 100;

        set((state) => ({
          metrics: {
            ...state.metrics,
            optimalPrice,
          },
        }));

        return optimalPrice;
      },

      // Calculate conversion probability
      getConversionProbability: () => {
        const state = get();

        // Positive signals
        const positiveSignals = {
          highEngagement: state.metrics.engagementScore > 0.7 ? 0.2 : 0,
          frequentUsage:
            state.behaviors.filter((b) => b.action === 'quiz_completed').length > 10 ? 0.15 : 0,
          premiumFeatureUsage: state.metrics.featureUsage.get('premium_categories') ? 0.1 : 0,
          socialSharing: state.behaviors.some((b) => b.action === 'shared_progress') ? 0.1 : 0,
          achievementUnlocked: state.behaviors.some((b) => b.action === 'achievement_unlocked')
            ? 0.05
            : 0,
        };

        // Negative signals
        const negativeSignals = {
          lowEngagement: state.metrics.engagementScore < 0.3 ? -0.2 : 0,
          highFrustration: state.metrics.frustrationEvents > 5 ? -0.15 : 0,
          noRecentActivity:
            state.behaviors.length > 0 &&
            Date.now() - state.behaviors[state.behaviors.length - 1].timestamp > 48 * 60 * 60 * 1000
              ? -0.1
              : 0,
          dismissedPaywall: state.hasSeenPaywall && state.conversionAttempts === 0 ? -0.1 : 0,
        };

        // Calculate base probability
        let probability = 0.1; // Base 10% conversion

        // Add positive signals
        Object.values(positiveSignals).forEach((signal) => {
          probability += signal;
        });

        // Add negative signals
        Object.values(negativeSignals).forEach((signal) => {
          probability += signal;
        });

        // Clamp between 0 and 1
        probability = Math.max(0, Math.min(1, probability));

        set((state) => ({
          metrics: {
            ...state.metrics,
            conversionProbability: probability,
          },
        }));

        return probability;
      },

      // Trigger urgency campaign
      triggerUrgencyCampaign: () => {
        const state = get();
        const timeRemaining = get().getTimeRemaining();
        const hoursRemaining = timeRemaining / (60 * 60 * 1000);

        let campaign = null;

        if (hoursRemaining <= 3) {
          campaign = URGENCY_CAMPAIGNS.final_3_hours;
        } else if (hoursRemaining <= 12) {
          campaign = URGENCY_CAMPAIGNS.final_12_hours;
        } else if (hoursRemaining <= 24) {
          campaign = URGENCY_CAMPAIGNS.day_minus_1;
        } else if (hoursRemaining <= 48) {
          campaign = URGENCY_CAMPAIGNS.day_minus_2;
        } else if (hoursRemaining <= 72) {
          campaign = URGENCY_CAMPAIGNS.day_minus_3;
        }

        if (campaign) {
          // Send notification
          notificationService.scheduleOneTimeNotification(
            campaign.notification,
            campaign.inApp,
            1,
            { type: 'trial_urgency', discount: campaign.discount },
          );

          // Track campaign trigger
          analytics.track('urgency_campaign_triggered', {
            hoursRemaining,
            discount: campaign.discount,
            tier: state.tier?.name,
          });

          // Update last offer
          set({
            lastOfferDiscount: campaign.discount,
          });
        }
      },

      // Offer dynamic discount
      offerDynamicDiscount: async () => {
        const state = get();
        const optimalPrice = get().calculateOptimalPrice();
        const basePrice = 9.99;
        const discount = Math.round((1 - optimalPrice / basePrice) * 100);

        set({
          lastOfferPrice: optimalPrice,
          lastOfferDiscount: discount,
          conversionAttempts: state.conversionAttempts + 1,
        });

        // Track offer
        analytics.track('dynamic_discount_offered', {
          price: optimalPrice,
          discount,
          attempt: state.conversionAttempts,
          conversionProbability: state.metrics.conversionProbability,
        });

        return discount;
      },

      // Extend trial
      extendTrial: (days: number) => {
        set((state) => ({
          endDate: state.endDate ? state.endDate + days * 24 * 60 * 60 * 1000 : null,
        }));

        // Track extension
        analytics.track('trial_extended', {
          days,
          reason: 'user_request',
        });
      },

      // Pause trial
      pauseTrial: () => {
        // Store remaining time
        const timeRemaining = get().getTimeRemaining();

        set({
          isActive: false,
          // Store paused state in behaviors
          behaviors: [
            ...get().behaviors,
            {
              action: 'trial_paused',
              timestamp: Date.now(),
              context: { timeRemaining },
            },
          ],
        });
      },

      // Resume trial
      resumeTrial: () => {
        const pausedBehavior = get()
          .behaviors.filter((b) => b.action === 'trial_paused')
          .pop();

        if (pausedBehavior && pausedBehavior.context?.timeRemaining) {
          set({
            isActive: true,
            endDate: Date.now() + pausedBehavior.context.timeRemaining,
          });
        }
      },

      // Private helper methods
      updateMetrics: (action: string, context?: any) => {
        set((state) => {
          const metrics = { ...state.metrics };

          // Update feature usage
          if (action.startsWith('feature_')) {
            const feature = action.replace('feature_', '');
            const currentUsage = metrics.featureUsage.get(feature) || 0;
            metrics.featureUsage.set(feature, currentUsage + 1);
          }

          // Update engagement score
          const engagementActions = [
            'quiz_completed',
            'streak_maintained',
            'achievement_unlocked',
            'friend_invited',
            'shared_progress',
          ];

          if (engagementActions.includes(action)) {
            metrics.engagementScore = Math.min(1, metrics.engagementScore + 0.05);
          }

          // Track frustration events
          const frustrationActions = [
            'ran_out_of_hearts',
            'lost_streak',
            'quiz_failed',
            'paywall_dismissed',
          ];

          if (frustrationActions.includes(action)) {
            metrics.frustrationEvents++;
          }

          // Track delight events
          const delightActions = [
            'perfect_score',
            'streak_milestone',
            'achievement_unlocked',
            'leaderboard_top_10',
          ];

          if (delightActions.includes(action)) {
            metrics.delightEvents++;
          }

          return { metrics };
        });
      },

      checkConversionTriggers: (action: string) => {
        const state = get();

        // High-intent actions that should trigger conversion flow
        const conversionTriggers = [
          'premium_feature_blocked',
          'ran_out_of_hearts',
          'streak_about_to_break',
          'locked_category_tapped',
          'ad_limit_reached',
        ];

        if (conversionTriggers.includes(action)) {
          // Calculate conversion probability
          const probability = get().getConversionProbability();

          // If probability is high, show targeted offer
          if (probability > 0.3) {
            get().offerDynamicDiscount();
          }
        }
      },

      scheduleUrgencyNotifications: () => {
        const state = get();

        if (!state.tier || !state.endDate) return;

        // Schedule notifications for each urgency campaign
        const now = Date.now();

        // 3 days before
        const threeDaysBefore = state.endDate - 3 * 24 * 60 * 60 * 1000;
        if (threeDaysBefore > now) {
          notificationService.scheduleOneTimeNotification(
            URGENCY_CAMPAIGNS.day_minus_3.notification,
            URGENCY_CAMPAIGNS.day_minus_3.inApp,
            (threeDaysBefore - now) / 1000,
            { type: 'trial_urgency', days_remaining: 3 },
          );
        }

        // 1 day before
        const oneDayBefore = state.endDate - 24 * 60 * 60 * 1000;
        if (oneDayBefore > now) {
          notificationService.scheduleOneTimeNotification(
            URGENCY_CAMPAIGNS.day_minus_1.notification,
            URGENCY_CAMPAIGNS.day_minus_1.inApp,
            (oneDayBefore - now) / 1000,
            { type: 'trial_urgency', days_remaining: 1 },
          );
        }

        // 3 hours before
        const threeHoursBefore = state.endDate - 3 * 60 * 60 * 1000;
        if (threeHoursBefore > now) {
          notificationService.scheduleOneTimeNotification(
            URGENCY_CAMPAIGNS.final_3_hours.notification,
            URGENCY_CAMPAIGNS.final_3_hours.inApp,
            (threeHoursBefore - now) / 1000,
            { type: 'trial_urgency', hours_remaining: 3 },
          );
        }
      },

      enableTrialFeatures: (features: string[]) => {
        // Enable premium features during trial
        const subscriptionStore = useSubscriptionStore.getState();

        features.forEach((feature) => {
          switch (feature) {
            case 'unlimited_hearts':
              // Enable unlimited hearts
              useHeartsStore.getState().setUnlimited(true);
              break;
            case 'no_ads':
              // Disable ads during trial
              // adService.disableAds();
              break;
            case 'premium_categories':
              // Unlock premium categories
              // categoryService.unlockPremium();
              break;
            case 'advanced_stats':
              // Enable advanced analytics
              // analyticsService.enableAdvanced();
              break;
            default:
              console.log(`Enabling feature: ${feature}`);
          }
        });
      },

      disableTrialFeatures: (features: string[]) => {
        // Disable premium features after trial
        features.forEach((feature) => {
          switch (feature) {
            case 'unlimited_hearts':
              // Disable unlimited hearts
              useHeartsStore.getState().setUnlimited(false);
              break;
            case 'no_ads':
              // Re-enable ads
              // adService.enableAds();
              break;
            case 'premium_categories':
              // Lock premium categories
              // categoryService.lockPremium();
              break;
            case 'advanced_stats':
              // Disable advanced analytics
              // analyticsService.disableAdvanced();
              break;
            default:
              console.log(`Disabling feature: ${feature}`);
          }
        });
      },

      triggerWinBackCampaign: () => {
        // Send win-back notification
        notificationService.scheduleOneTimeNotification(
          '🎁 We miss you! Come back for a special offer',
          'Get 50% off your first month - exclusive for returning users',
          1,
          { type: 'win_back', discount: 50 },
        );

        // Track win-back attempt
        analytics.track('win_back_campaign_sent', {
          days_since_trial: 1,
          last_engagement_score: get().metrics.engagementScore,
        });
      },
    }),
    {
      name: 'trial-storage',
      storage: {
        getItem: async (name) => {
          const value = await AsyncStorage.getItem(name);
          return value ? JSON.parse(value) : null;
        },
        setItem: async (name, value) => {
          await AsyncStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: async (name) => {
          await AsyncStorage.removeItem(name);
        },
      },
      partialize: (state) => ({
        isActive: state.isActive,
        tier: state.tier,
        startDate: state.startDate,
        endDate: state.endDate,
        behaviors: state.behaviors,
        metrics: state.metrics,
        hasSeenPaywall: state.hasSeenPaywall,
        conversionAttempts: state.conversionAttempts,
        lastOfferPrice: state.lastOfferPrice,
        lastOfferDiscount: state.lastOfferDiscount,
      }),
    },
  ),
);

// Export trial service singleton
export const trialService = {
  // Check and auto-start trial for new users
  checkAndStartTrial: async (userId: string, isNewUser: boolean) => {
    const trialStore = useTrialStore.getState();

    if (isNewUser && !trialStore.isActive) {
      // Start discovery trial for new users
      await trialStore.startTrial('DISCOVERY');
    }
  },

  // Check for trial eligibility based on user behavior
  checkTrialEligibility: (userStats: any) => {
    const eligibleTiers: string[] = [];

    // Check each tier's trigger conditions
    Object.entries(TRIAL_TIERS).forEach(([tierName, tier]) => {
      const meetsConditions = tier.triggerConditions.some((condition) => {
        switch (condition) {
          case 'streak_7_days':
            return userStats.currentStreak >= 7;
          case 'level_5_reached':
            return userStats.level >= 5;
          case '100_questions_answered':
            return userStats.questionsAnswered >= 100;
          case 'friend_referral':
            return userStats.referrals > 0;
          case 'churned_user_return':
            return userStats.daysSinceLastActive > 30;
          case 'subscription_cancelled':
            return userStats.hadSubscription && !userStats.hasSubscription;
          default:
            return false;
        }
      });

      if (meetsConditions) {
        eligibleTiers.push(tierName);
      }
    });

    return eligibleTiers;
  },

  // Get current trial status
  getTrialStatus: () => {
    const trialStore = useTrialStore.getState();

    if (!trialStore.isActive) {
      return {
        active: false,
        tier: null,
        daysRemaining: 0,
        hoursRemaining: 0,
        features: [],
      };
    }

    const timeRemaining = trialStore.getTimeRemaining();
    const daysRemaining = Math.floor(timeRemaining / (24 * 60 * 60 * 1000));
    const hoursRemaining = Math.floor(timeRemaining / (60 * 60 * 1000));

    return {
      active: true,
      tier: trialStore.tier?.name,
      daysRemaining,
      hoursRemaining,
      features: trialStore.tier?.features || [],
      conversionProbability: trialStore.getConversionProbability(),
      optimalPrice: trialStore.calculateOptimalPrice(),
    };
  },
};
