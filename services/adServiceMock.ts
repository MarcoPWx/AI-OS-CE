import { Platform, Alert } from 'react-native';
import { useHeartsStore } from '../store/heartsStore';
import { useStreakStore } from '../store/streakStore';
import { notificationService } from './notificationService';

interface AdReward {
  type: 'hearts' | 'xp' | 'streak_freeze' | 'hints' | 'category_unlock' | 'xp_boost';
  amount: number;
  duration?: number;
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

// Mock Ad Service for testing
class MockAdService {
  private isInitialized = false;
  private adLoadAttempts = 0;
  private lastAdShown = 0;
  private forcedAdInterval = 180000; // 3 minutes
  private userFrustrationLevel = 0;
  private adsWatchedToday = 0;
  private dailyAdLimit = 10;
  private adMetrics: AdMetrics = {
    impressions: 0,
    clicks: 0,
    revenue: 0,
    ecpm: 0,
    fillRate: 0,
  };
  private userProfiles: Map<string, UserAdProfile> = new Map();

  async initialize() {
    console.log('🎬 Initializing Mock Ad Service...');
    this.isInitialized = true;

    // Reset daily counter at midnight
    this.scheduleDailyReset();

    // Start forced ad timer
    this.startForcedAdTimer();

    console.log('✅ Mock Ad service initialized');
  }

  private scheduleDailyReset() {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const timeUntilMidnight = tomorrow.getTime() - now.getTime();

    setTimeout(() => {
      this.adsWatchedToday = 0;
      this.scheduleDailyReset();
    }, timeUntilMidnight);
  }

  private startForcedAdTimer() {
    setInterval(() => {
      const now = Date.now();
      if (now - this.lastAdShown > this.forcedAdInterval) {
        this.showForcedInterstitial('timer');
      }
    }, this.forcedAdInterval);
  }

  async showRewardedAd(reward: AdReward): Promise<boolean> {
    return new Promise((resolve) => {
      console.log('🎬 Mock: Showing rewarded ad for:', reward.type);

      // Simulate ad loading time
      setTimeout(() => {
        Alert.alert(
          '🎬 Watch Ad to Continue',
          `This is a mock ad. In production, a real video ad would play here.\n\nReward: ${reward.amount} ${reward.type}`,
          [
            {
              text: 'Skip (No Reward)',
              style: 'cancel',
              onPress: () => {
                console.log('Ad skipped');
                this.userFrustrationLevel += 5;
                resolve(false);
              },
            },
            {
              text: 'Watch Ad (5s)',
              onPress: () => {
                // Simulate watching ad
                Alert.alert('Watching Ad...', 'Please wait 5 seconds...', [], {
                  cancelable: false,
                });

                setTimeout(() => {
                  this.applyReward(reward);
                  this.adMetrics.impressions++;
                  this.adMetrics.revenue += 0.02; // Mock revenue
                  this.adsWatchedToday++;
                  this.lastAdShown = Date.now();

                  Alert.alert('Success!', `You earned ${reward.amount} ${reward.type}!`);
                  resolve(true);
                }, 5000);
              },
            },
          ],
        );
      }, 500);
    });
  }

  private applyReward(reward: AdReward) {
    switch (reward.type) {
      case 'hearts':
        const heartsStore = useHeartsStore.getState();
        heartsStore.addHearts(reward.amount);
        break;
      case 'streak_freeze':
        const streakStore = useStreakStore.getState();
        streakStore.addFreezeUse(reward.amount);
        break;
      case 'xp':
        // Apply XP boost
        console.log(`Applied ${reward.amount} XP`);
        break;
      case 'hints':
        // Add hints
        console.log(`Added ${reward.amount} hints`);
        break;
    }
  }

  async showInterstitial(trigger: string): Promise<boolean> {
    return new Promise((resolve) => {
      console.log('🎬 Mock: Showing interstitial ad, trigger:', trigger);

      Alert.alert(
        '📺 Advertisement',
        'This is a mock interstitial ad. It would appear between screens in production.',
        [
          {
            text: 'Continue',
            onPress: () => {
              this.adMetrics.impressions++;
              this.lastAdShown = Date.now();
              resolve(true);
            },
          },
        ],
        { cancelable: false },
      );
    });
  }

  private showForcedInterstitial(trigger: string) {
    if (this.adsWatchedToday >= this.dailyAdLimit) {
      console.log('Daily ad limit reached');
      return;
    }

    this.showInterstitial(trigger);
  }

  async promptRewardedAdForHearts() {
    const heartsStore = useHeartsStore.getState();

    if (heartsStore.hearts === 0 && !heartsStore.isPremium) {
      Alert.alert(
        '❤️ Out of Hearts!',
        'Watch a video to get 3 free hearts and continue learning!',
        [
          {
            text: 'Maybe Later',
            style: 'cancel',
            onPress: () => {
              this.userFrustrationLevel += 10;
              notificationService.scheduleOneTimeNotification(
                '💔 Still out of hearts?',
                'Watch a quick video to get back in the game!',
                5,
                { type: 'hearts_prompt' },
              );
            },
          },
          {
            text: 'Watch Ad',
            onPress: () => {
              this.showRewardedAd({
                type: 'hearts',
                amount: 3,
              });
            },
          },
        ],
      );
    }
  }

  checkAndShowInterstitialAd(): boolean {
    const shouldShow = Math.random() < 0.3; // 30% chance

    if (shouldShow && this.adsWatchedToday < this.dailyAdLimit) {
      this.showInterstitial('quiz_complete');
      return true;
    }

    return false;
  }

  getUserAdProfile(userId: string): UserAdProfile {
    if (!this.userProfiles.has(userId)) {
      this.userProfiles.set(userId, {
        userId,
        adsWatched: 0,
        adRevenue: 0,
        lastAdTimestamp: 0,
        frustrationLevel: 0,
        preferredAdTypes: [],
        region: 'US',
      });
    }

    return this.userProfiles.get(userId)!;
  }

  getAdMetrics() {
    return {
      ...this.adMetrics,
      adsWatchedToday: this.adsWatchedToday,
      userFrustrationLevel: this.userFrustrationLevel,
    };
  }
}

export const adService = new MockAdService();
