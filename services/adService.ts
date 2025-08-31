import { Platform } from 'react-native';
import { useHeartsStore } from '../store/heartsStore';
import { useStreakStore } from '../store/streakStore';
import { notificationService } from './notificationService';
import {
  RewardedAd,
  RewardedAdEventType,
  InterstitialAd,
  AdEventType,
  BannerAd,
  BannerAdSize,
  TestIds,
  MobileAds,
  AppOpenAd,
  MaxAdContentRating,
} from 'react-native-google-mobile-ads';

// Production Ad Unit IDs - Using test IDs in dev
const AD_UNITS = __DEV__
  ? {
      ios: {
        rewarded: TestIds.REWARDED,
        interstitial: TestIds.INTERSTITIAL,
        banner: TestIds.BANNER,
        native: TestIds.NATIVE,
        app_open: TestIds.APP_OPEN,
      },
      android: {
        rewarded: TestIds.REWARDED,
        interstitial: TestIds.INTERSTITIAL,
        banner: TestIds.BANNER,
        native: TestIds.NATIVE,
        app_open: TestIds.APP_OPEN,
      },
    }
  : {
      ios: {
        rewarded:
          process.env.EXPO_PUBLIC_ADMOB_REWARDED_IOS || 'ca-app-pub-3940256099942544/1712485313',
        interstitial:
          process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_IOS ||
          'ca-app-pub-3940256099942544/4411468910',
        banner:
          process.env.EXPO_PUBLIC_ADMOB_BANNER_IOS || 'ca-app-pub-3940256099942544/2934735716',
        native:
          process.env.EXPO_PUBLIC_ADMOB_NATIVE_IOS || 'ca-app-pub-3940256099942544/3986624511',
        app_open:
          process.env.EXPO_PUBLIC_ADMOB_APP_OPEN_IOS || 'ca-app-pub-3940256099942544/5662855259',
      },
      android: {
        rewarded:
          process.env.EXPO_PUBLIC_ADMOB_REWARDED_ANDROID ||
          'ca-app-pub-3940256099942544/5224354917',
        interstitial:
          process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_ANDROID ||
          'ca-app-pub-3940256099942544/1033173712',
        banner:
          process.env.EXPO_PUBLIC_ADMOB_BANNER_ANDROID || 'ca-app-pub-3940256099942544/6300978111',
        native:
          process.env.EXPO_PUBLIC_ADMOB_NATIVE_ANDROID || 'ca-app-pub-3940256099942544/2247696110',
        app_open:
          process.env.EXPO_PUBLIC_ADMOB_APP_OPEN_ANDROID ||
          'ca-app-pub-3940256099942544/3419835294',
      },
    };

interface AdReward {
  type: 'hearts' | 'xp' | 'streak_freeze' | 'hints' | 'category_unlock' | 'xp_boost';
  amount: number;
  duration?: number; // For time-based rewards
}

interface AdMetrics {
  impressions: number;
  clicks: number;
  revenue: number;
  ecpm: number;
  fillRate: number;
}

interface UserAdProfile {
  userId: string;
  adsWatched: number;
  adRevenue: number;
  lastAdTimestamp: number;
  frustrationLevel: number;
  preferredAdTypes: string[];
  region: string;
}

class AdService {
  private isInitialized = false;
  private adLoadAttempts = 0;
  private lastAdShown = 0;
  private forcedAdInterval = 180000; // 3 minutes
  private userFrustrationLevel = 0;
  private adsWatchedToday = 0;
  private dailyAdLimit = 10; // Soft limit before aggressive prompts
  private rewardedAd: RewardedAd | null = null;
  private interstitialAd: InterstitialAd | null = null;
  private appOpenAd: AppOpenAd | null = null;
  private adMetrics: AdMetrics = {
    impressions: 0,
    clicks: 0,
    revenue: 0,
    ecpm: 0,
    fillRate: 0,
  };
  private userProfiles: Map<string, UserAdProfile> = new Map();
  private mediationWaterfall = [
    { network: 'admob', priority: 1, fillRate: 0.95 },
    { network: 'facebook', priority: 2, fillRate: 0.7 },
    { network: 'unity', priority: 3, fillRate: 0.6 },
    { network: 'applovin', priority: 4, fillRate: 0.5 },
  ];

  async initialize() {
    try {
      console.log('Initializing Google Mobile Ads SDK...');

      // Initialize Mobile Ads SDK
      await MobileAds().initialize();

      // Configure ad settings
      await MobileAds().setRequestConfiguration({
        maxAdContentRating: MaxAdContentRating.T,
        tagForChildDirectedTreatment: false,
        tagForUnderAgeOfConsent: false,
        testDeviceIdentifiers: __DEV__ ? ['EMULATOR'] : [],
      });

      // Preload ads
      await this.preloadAds();

      this.isInitialized = true;
      console.log('Ad service initialized successfully');

      // Reset daily counter at midnight
      this.scheduleDailyReset();

      // Start forced ad timer
      this.startForcedAdTimer();

      // Initialize app open ad for cold starts
      this.initializeAppOpenAd();
    } catch (error) {
      console.error('Failed to initialize ad service:', error);
      this.isInitialized = false;
    }
  }

  private async preloadAds() {
    const platform = Platform.OS;

    // Preload rewarded ad
    this.rewardedAd = RewardedAd.createForAdRequest(AD_UNITS[platform].rewarded, {
      requestNonPersonalizedAdsOnly: false,
      keywords: ['education', 'quiz', 'learning', 'programming'],
    });

    // Preload interstitial ad
    this.interstitialAd = InterstitialAd.createForAdRequest(AD_UNITS[platform].interstitial, {
      requestNonPersonalizedAdsOnly: false,
      keywords: ['education', 'quiz', 'learning', 'programming'],
    });

    // Load the ads
    await Promise.all([this.rewardedAd.load(), this.interstitialAd.load()]);
  }

  private async initializeAppOpenAd() {
    const platform = Platform.OS;

    this.appOpenAd = AppOpenAd.createForAdRequest(AD_UNITS[platform].app_open, {
      requestNonPersonalizedAdsOnly: false,
    });

    // Listen for app state changes
    this.appOpenAd.addAdEventListener(AdEventType.LOADED, () => {
      console.log('App open ad loaded');
    });

    await this.appOpenAd.load();
  }

  private scheduleDailyReset() {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const timeUntilMidnight = tomorrow.getTime() - now.getTime();

    setTimeout(() => {
      this.adsWatchedToday = 0;
      this.scheduleDailyReset(); // Reschedule for next day
    }, timeUntilMidnight);
  }

  private startForcedAdTimer() {
    setInterval(() => {
      const now = Date.now();
      if (now - this.lastAdShown > this.forcedAdInterval) {
        this.showForcedInterstitial('timer');
      }
    }, 60000); // Check every minute
  }

  async showRewardedAd(rewardType: AdReward['type']): Promise<boolean> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (!this.rewardedAd) {
      console.error('Rewarded ad not loaded');
      return false;
    }

    return new Promise((resolve) => {
      // Track user frustration
      this.userFrustrationLevel++;

      // Set up event listeners
      const unsubscribeLoaded = this.rewardedAd.addAdEventListener(
        RewardedAdEventType.LOADED,
        () => {
          console.log('Rewarded ad loaded');
        },
      );

      const unsubscribeEarned = this.rewardedAd.addAdEventListener(
        RewardedAdEventType.EARNED_REWARD,
        (reward) => {
          console.log(`User earned reward: ${reward.amount} ${reward.type}`);

          // Update metrics
          this.lastAdShown = Date.now();
          this.adsWatchedToday++;
          this.adMetrics.impressions++;
          this.adMetrics.revenue += this.calculateAdRevenue('rewarded');

          // Grant reward
          this.grantReward(rewardType);

          // Track successful ad view
          this.trackAdMetrics('rewarded', 'user_initiated', true);

          // Push premium if watching too many ads
          if (this.adsWatchedToday >= 5) {
            this.pushPremiumAfterAds();
          }

          // Clean up listeners
          unsubscribeLoaded();
          unsubscribeEarned();
          unsubscribeClosed();

          // Preload next ad
          this.preloadRewardedAd();

          resolve(true);
        },
      );

      const unsubscribeClosed = this.rewardedAd.addAdEventListener(AdEventType.CLOSED, () => {
        console.log('Rewarded ad closed without earning reward');

        // Track skipped ad
        this.trackAdMetrics('rewarded', 'user_initiated', false);

        // Clean up listeners
        unsubscribeLoaded();
        unsubscribeEarned();
        unsubscribeClosed();

        // Preload next ad
        this.preloadRewardedAd();

        resolve(false);
      });

      // Show the ad
      this.rewardedAd.show().catch((error) => {
        console.error('Failed to show rewarded ad:', error);

        // Clean up listeners
        unsubscribeLoaded();
        unsubscribeEarned();
        unsubscribeClosed();

        resolve(false);
      });
    });
  }

  private async preloadRewardedAd() {
    const platform = Platform.OS;

    this.rewardedAd = RewardedAd.createForAdRequest(AD_UNITS[platform].rewarded, {
      requestNonPersonalizedAdsOnly: false,
      keywords: ['education', 'quiz', 'learning', 'programming'],
    });

    await this.rewardedAd.load();
  }

  async showInterstitialAd(trigger: string): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    // Don't show too frequently
    const now = Date.now();
    if (now - this.lastAdShown < 30000) {
      // 30 second minimum gap
      return;
    }

    if (!this.interstitialAd) {
      console.error('Interstitial ad not loaded');
      return;
    }

    return new Promise((resolve) => {
      console.log(`Showing interstitial ad (trigger: ${trigger})...`);

      // Set up event listeners
      const unsubscribeClosed = this.interstitialAd.addAdEventListener(AdEventType.CLOSED, () => {
        console.log('Interstitial ad closed');

        // Update metrics
        this.lastAdShown = Date.now();
        this.userFrustrationLevel += 2; // Interstitials are more annoying
        this.adMetrics.impressions++;
        this.adMetrics.revenue += this.calculateAdRevenue('interstitial');

        // Track ad display
        this.trackAdMetrics('interstitial', trigger, true);

        // Clean up
        unsubscribeClosed();

        // Preload next ad
        this.preloadInterstitialAd();

        resolve();
      });

      // Show the ad
      this.interstitialAd.show().catch((error) => {
        console.error('Failed to show interstitial ad:', error);

        // Clean up
        unsubscribeClosed();

        // Track failed ad
        this.trackAdMetrics('interstitial', trigger, false);

        resolve();
      });
    });
  }

  private async preloadInterstitialAd() {
    const platform = Platform.OS;

    this.interstitialAd = InterstitialAd.createForAdRequest(AD_UNITS[platform].interstitial, {
      requestNonPersonalizedAdsOnly: false,
      keywords: ['education', 'quiz', 'learning', 'programming'],
    });

    await this.interstitialAd.load();
  }

  private async showForcedInterstitial(trigger: string) {
    // Force an interstitial ad at strategic moments
    const heartsStore = useHeartsStore.getState();
    const streakStore = useStreakStore.getState();

    // Show more ads when user is engaged
    if (heartsStore.hearts > 0 || streakStore.currentStreak > 3) {
      await this.showInterstitialAd(trigger);
    }
  }

  async showBannerAd(position: 'top' | 'bottom'): Promise<void> {
    console.log(`Showing banner ad at ${position}`);
    // In production, display actual banner
  }

  private async simulateAdLoading(): Promise<void> {
    // Simulate network delay
    return new Promise((resolve) => {
      setTimeout(resolve, Math.random() * 2000 + 1000); // 1-3 seconds
    });
  }

  private async simulateAdWatching(): Promise<boolean> {
    // Simulate user watching ad (30 seconds)
    // In production, this would be handled by ad SDK callbacks
    return new Promise((resolve) => {
      console.log('Ad playing for 30 seconds...');
      setTimeout(() => {
        // 95% completion rate (some users close early)
        resolve(Math.random() > 0.05);
      }, 3000); // Shortened for testing
    });
  }

  private async simulateInterstitialDisplay(): Promise<void> {
    // Simulate 5-second unskippable ad
    return new Promise((resolve) => {
      console.log('Interstitial ad displaying...');
      setTimeout(resolve, 5000);
    });
  }

  private grantReward(rewardType: AdReward['type']) {
    const heartsStore = useHeartsStore.getState();
    const streakStore = useStreakStore.getState();

    switch (rewardType) {
      case 'hearts':
        const heartsAmount = this.calculateDynamicReward('hearts');
        heartsStore.addHearts(heartsAmount);
        console.log(`✅ Granted ${heartsAmount} hearts from ad`);

        notificationService.scheduleOneTimeNotification(
          `❤️ +${heartsAmount} Hearts!`,
          'Keep watching ads for more rewards!',
          1,
          { type: 'ad_reward' },
        );
        break;

      case 'xp':
        const xpAmount = this.calculateDynamicReward('xp');
        console.log(`✅ Granted ${xpAmount} XP from ad`);
        break;

      case 'streak_freeze':
        streakStore.addStreakFreeze();
        console.log('✅ Granted streak freeze from ad');
        break;

      case 'hints':
        console.log('✅ Granted 3 hints from ad');
        break;
    }
  }

  private calculateDynamicReward(type: string): number {
    // Give less rewards as users watch more ads (diminishing returns)
    const baseReward = type === 'hearts' ? 3 : 100; // 3 hearts or 100 XP
    const multiplier = Math.max(0.5, 1 - this.adsWatchedToday * 0.1);
    return Math.floor(baseReward * multiplier);
  }

  private pushPremiumAfterAds() {
    notificationService.scheduleOneTimeNotification(
      '😓 Tired of ads?',
      'Get Premium for an ad-free experience + unlimited hearts!',
      5,
      { type: 'premium_ad_fatigue' },
    );
  }

  private calculateAdRevenue(adType: string): number {
    // Calculate revenue based on ad type and region
    const baseRates = {
      rewarded: 0.01, // $0.01 per rewarded ad
      interstitial: 0.005, // $0.005 per interstitial
      banner: 0.0001, // $0.0001 per banner impression
      native: 0.0005, // $0.0005 per native ad
      app_open: 0.008, // $0.008 per app open ad
    };

    // Apply regional multipliers
    const regionMultipliers: { [key: string]: number } = {
      US: 1.5,
      UK: 1.3,
      CA: 1.2,
      AU: 1.2,
      DEFAULT: 1.0,
    };

    const userRegion = this.getUserRegion();
    const multiplier = regionMultipliers[userRegion] || regionMultipliers.DEFAULT;

    return (baseRates[adType] || 0) * multiplier;
  }

  private getUserRegion(): string {
    // In production, get from device locale or IP geolocation
    return 'US';
  }

  private trackAdMetrics(adType: string, trigger: string, success: boolean) {
    // Calculate current metrics
    this.adMetrics.fillRate =
      this.adMetrics.impressions / (this.adMetrics.impressions + this.adLoadAttempts);
    this.adMetrics.ecpm = (this.adMetrics.revenue / this.adMetrics.impressions) * 1000;

    // Track for optimization
    const metrics = {
      adType,
      trigger,
      success,
      frustrationLevel: this.userFrustrationLevel,
      adsWatchedToday: this.adsWatchedToday,
      revenue: this.adMetrics.revenue,
      ecpm: this.adMetrics.ecpm,
      fillRate: this.adMetrics.fillRate,
      timestamp: new Date(),
    };

    console.log('Ad metrics:', metrics);

    // In production, send to analytics
    // analytics.track('ad_displayed', metrics);
  }

  // Aggressive ad prompts
  async promptRewardedAdForHearts(): Promise<boolean> {
    const options = [
      {
        title: '❤️ Out of Hearts!',
        message: 'Watch a quick video to get 3 free hearts and keep playing!',
        cta: 'Watch Ad',
      },
      {
        title: '💔 No Hearts Left',
        message: "Don't let your streak die! Watch an ad for instant hearts.",
        cta: 'Save My Streak',
      },
      {
        title: '⏰ Hearts Regenerating...',
        message: 'Or watch a video now to play immediately!',
        cta: 'Play Now',
      },
    ];

    const option = options[Math.floor(Math.random() * options.length)];
    console.log(option.title, option.message);

    return await this.showRewardedAd('hearts');
  }

  async promptRewardedAdForStreak(): Promise<boolean> {
    console.log('🔥 Your streak is in danger!');
    console.log('Watch an ad to get a free streak freeze');

    return await this.showRewardedAd('streak_freeze');
  }

  // Strategic ad placement
  shouldShowInterstitialAfterQuiz(): boolean {
    const quizzesSinceAd = Math.floor((Date.now() - this.lastAdShown) / 60000); // Minutes

    // Show ad after every 3 quizzes or 5 minutes
    return quizzesSinceAd >= 5 || Math.random() > 0.7;
  }

  shouldShowAdBeforeReward(): boolean {
    // 30% chance to show ad before giving rewards
    return Math.random() > 0.7;
  }

  getAdFrequencyMultiplier(): number {
    // Increase ad frequency for non-premium users who are engaged
    const heartsStore = useHeartsStore.getState();
    const streakStore = useStreakStore.getState();

    if (streakStore.currentStreak > 7) return 1.5;
    if (heartsStore.hearts === 0) return 2.0;
    if (this.userFrustrationLevel > 10) return 0.8; // Back off if too frustrated

    return 1.0;
  }

  // Get current ad metrics for dashboard
  getAdMetrics(): AdMetrics {
    return { ...this.adMetrics };
  }

  // Get user ad profile
  getUserAdProfile(userId: string): UserAdProfile | undefined {
    return this.userProfiles.get(userId);
  }

  // Update user ad profile
  updateUserAdProfile(userId: string, updates: Partial<UserAdProfile>) {
    const existing = this.userProfiles.get(userId) || {
      userId,
      adsWatched: 0,
      adRevenue: 0,
      lastAdTimestamp: 0,
      frustrationLevel: 0,
      preferredAdTypes: [],
      region: this.getUserRegion(),
    };

    this.userProfiles.set(userId, {
      ...existing,
      ...updates,
    });
  }

  // Show app open ad on cold start
  async showAppOpenAd(): Promise<void> {
    if (!this.appOpenAd || !this.isInitialized) {
      return;
    }

    try {
      await this.appOpenAd.show();
      this.adMetrics.impressions++;
      this.adMetrics.revenue += this.calculateAdRevenue('app_open');
    } catch (error) {
      console.error('Failed to show app open ad:', error);
    }
  }
}

export const adService = new AdService();

// Ad placement strategies
export const AD_TRIGGERS = {
  QUIZ_COMPLETE: 'quiz_complete',
  HEARTS_EMPTY: 'hearts_empty',
  STREAK_DANGER: 'streak_danger',
  APP_LAUNCH: 'app_launch',
  LEVEL_UP: 'level_up',
  CHALLENGE_COMPLETE: 'challenge_complete',
  LEADERBOARD_VIEW: 'leaderboard_view',
  TIMER: 'timer',
  REWARD_CLAIM: 'reward_claim',
};

// Export for use in components
export const AdPrompts = {
  async showHeartsAd(): Promise<boolean> {
    return await adService.promptRewardedAdForHearts();
  },

  async showStreakAd(): Promise<boolean> {
    return await adService.promptRewardedAdForStreak();
  },

  async showInterstitial(trigger: string): Promise<void> {
    if (adService.shouldShowInterstitialAfterQuiz()) {
      await adService.showInterstitialAd(trigger);
    }
  },

  async showRewardedVideo(type: AdReward['type']): Promise<boolean> {
    return await adService.showRewardedAd(type);
  },
};
