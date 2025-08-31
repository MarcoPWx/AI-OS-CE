# Dark Patterns & Gamification Implementation Runbook

## 🎯 Executive Summary

This runbook provides a complete implementation guide for monetization through psychological mechanics, gamification, and strategic UX patterns. Expected outcomes: 5-7% conversion rate, 40%+ DAU, $3.50 ARPU.

---

## 📋 Table of Contents

1. [Prerequisites & Setup](#prerequisites--setup)
2. [Phase 1: Core Infrastructure](#phase-1-core-infrastructure-week-1-2)
3. [Phase 2: Frustration Mechanics](#phase-2-frustration-mechanics-week-3-4)
4. [Phase 3: Engagement Systems](#phase-3-engagement-systems-week-5-6)
5. [Phase 4: Monetization Pipeline](#phase-4-monetization-pipeline-week-7-8)
6. [Phase 5: Optimization & Testing](#phase-5-optimization--testing-week-9-10)
7. [Launch Checklist](#launch-checklist)
8. [Monitoring & KPIs](#monitoring--kpis)

---

## Prerequisites & Setup

### Required Services

```bash
# Core Services
- Supabase/Firebase (Database + Auth)
- RevenueCat (Subscription management)
- Google AdMob (Ad monetization)
- OneSignal/Firebase (Push notifications)
- Mixpanel/Amplitude (Analytics)
- Sentry (Error tracking)

# Development Tools
- React Native 0.72+
- Expo SDK 49+
- TypeScript 5.0+
- Zustand (State management)
- React Navigation 6+
```

### Environment Setup

```bash
# 1. Install dependencies
npm install zustand @react-native-async-storage/async-storage
npm install react-native-purchases react-native-google-mobile-ads
npm install expo-notifications expo-haptics
npm install react-native-reanimated

# 2. Configure environment variables
cp .env.example .env
# Add your API keys:
# EXPO_PUBLIC_SUPABASE_URL=
# EXPO_PUBLIC_SUPABASE_ANON_KEY=
# EXPO_PUBLIC_REVENUECAT_IOS=
# EXPO_PUBLIC_REVENUECAT_ANDROID=
# EXPO_PUBLIC_ADMOB_REWARDED_IOS=
# EXPO_PUBLIC_ADMOB_INTERSTITIAL_IOS=
```

---

## Phase 1: Core Infrastructure (Week 1-2)

### 1.1 Database Schema

```sql
-- Users table with psychological profiling
CREATE TABLE profiles (
  id UUID PRIMARY KEY,
  username TEXT UNIQUE,
  email TEXT UNIQUE,

  -- Engagement metrics
  level INTEGER DEFAULT 1,
  total_xp INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_active_date TIMESTAMP,

  -- Monetization state
  hearts INTEGER DEFAULT 5,
  unlimited_hearts BOOLEAN DEFAULT FALSE,
  streak_freezes INTEGER DEFAULT 2,
  is_premium BOOLEAN DEFAULT FALSE,
  subscription_tier TEXT DEFAULT 'free',
  trial_end_date TIMESTAMP,

  -- Behavioral tracking
  frustration_score FLOAT DEFAULT 0,
  engagement_score FLOAT DEFAULT 0,
  churn_risk_score FLOAT DEFAULT 0,
  ltv_prediction FLOAT DEFAULT 0,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Session tracking for behavior analysis
CREATE TABLE sessions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  started_at TIMESTAMP DEFAULT NOW(),
  ended_at TIMESTAMP,

  -- Engagement metrics
  questions_answered INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  hearts_lost INTEGER DEFAULT 0,
  ads_watched INTEGER DEFAULT 0,

  -- Frustration events
  rage_quits INTEGER DEFAULT 0,
  paywall_views INTEGER DEFAULT 0,
  upgrade_prompts_shown INTEGER DEFAULT 0,

  -- Conversion tracking
  converted_to_trial BOOLEAN DEFAULT FALSE,
  converted_to_paid BOOLEAN DEFAULT FALSE,
  revenue_generated FLOAT DEFAULT 0
);

-- A/B test variants
CREATE TABLE experiments (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  experiment_name TEXT,
  variant TEXT,
  enrolled_at TIMESTAMP DEFAULT NOW(),
  converted BOOLEAN DEFAULT FALSE
);
```

### 1.2 State Management Setup

```typescript
// store/heartsStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface HeartsState {
  hearts: number;
  maxHearts: number;
  lastRegenerationTime: number;
  isUnlimited: boolean;

  loseHeart: () => boolean;
  addHeart: () => void;
  regenerateHearts: () => void;
  refillHearts: () => void;
  setUnlimited: (unlimited: boolean) => void;
  canPlayQuiz: () => boolean;
  getTimeUntilNextHeart: () => number;
}

const HEART_REGEN_TIME = 30 * 60 * 1000; // 30 minutes (painful)

export const useHeartsStore = create<HeartsState>()(
  persist(
    (set, get) => ({
      hearts: 5,
      maxHearts: 5,
      lastRegenerationTime: Date.now(),
      isUnlimited: false,

      loseHeart: () => {
        const state = get();
        if (state.isUnlimited) return true;

        if (state.hearts > 0) {
          set({
            hearts: state.hearts - 1,
            lastRegenerationTime: Date.now(),
          });

          // Trigger paywall at certain thresholds
          if (state.hearts === 2) {
            triggerPaywallPrompt('low_hearts');
          }
          if (state.hearts === 0) {
            triggerPaywallPrompt('no_hearts');
          }

          return true;
        }
        return false;
      },

      // ... rest of implementation
    }),
    {
      name: 'hearts-storage',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
```

### 1.3 Analytics Setup

```typescript
// services/analytics.ts
import { Mixpanel } from 'mixpanel-react-native';

class AnalyticsService {
  private mixpanel: Mixpanel;
  private sessionStartTime: number;
  private frustrationEvents: number = 0;

  async initialize() {
    this.mixpanel = new Mixpanel('YOUR_PROJECT_TOKEN');
    await this.mixpanel.init();
    this.startSession();
  }

  startSession() {
    this.sessionStartTime = Date.now();
    this.frustrationEvents = 0;

    this.track('session_started', {
      time_of_day: new Date().getHours(),
      day_of_week: new Date().getDay(),
      user_level: getUserLevel(),
      is_premium: isPremium(),
    });
  }

  trackFrustrationEvent(type: string, context: any) {
    this.frustrationEvents++;

    this.track('frustration_event', {
      type,
      frustration_count: this.frustrationEvents,
      session_duration: Date.now() - this.sessionStartTime,
      ...context,
    });

    // Trigger paywall at optimal frustration
    if (this.frustrationEvents === 3) {
      this.showOptimalPaywall();
    }
  }

  trackMonetizationEvent(event: string, data: any) {
    this.track(`monetization_${event}`, {
      ...data,
      user_state: this.getUserState(),
      optimal_price: this.calculateOptimalPrice(),
    });
  }
}
```

---

## Phase 2: Frustration Mechanics (Week 3-4)

### 2.1 Hearts System Implementation

```typescript
// components/HeartsDisplay.tsx
import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  withSpring,
  withRepeat,
  withTiming
} from 'react-native-reanimated';

export const HeartsDisplay = () => {
  const { hearts, maxHearts, getTimeUntilNextHeart, isUnlimited } = useHeartsStore();
  const pulseAnimation = useSharedValue(1);

  useEffect(() => {
    // Pulse animation when low on hearts
    if (hearts <= 2 && !isUnlimited) {
      pulseAnimation.value = withRepeat(
        withSpring(1.2),
        -1,
        true
      );
    }
  }, [hearts]);

  if (isUnlimited) {
    return (
      <View style={styles.premiumHearts}>
        <Text style={styles.infinitySymbol}>♾️</Text>
        <Text style={styles.premiumText}>Unlimited</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Animated.View style={{ transform: [{ scale: pulseAnimation }] }}>
        {Array(maxHearts).fill(0).map((_, index) => (
          <Text key={index} style={styles.heart}>
            {index < hearts ? '❤️' : '🤍'}
          </Text>
        ))}
      </Animated.View>

      {hearts === 0 && (
        <View style={styles.depletedContainer}>
          <Text style={styles.regeneratingText}>
            Regenerating in {formatTime(getTimeUntilNextHeart())}
          </Text>
          <TouchableOpacity
            style={styles.watchAdButton}
            onPress={() => showRewardedAd()}
          >
            <Text>Watch Ad for ❤️</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.premiumButton}
            onPress={() => navigateToPaywall('hearts_depleted')}
          >
            <Text>Get Unlimited Hearts</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};
```

### 2.2 Streak System with FOMO

```typescript
// services/streakService.ts
export class StreakService {
  private notificationService: NotificationService;

  async checkStreakStatus(userId: string) {
    const user = await getUser(userId);
    const hoursUntilMidnight = this.getHoursUntilMidnight();

    // Progressive urgency based on time remaining
    if (hoursUntilMidnight <= 4 && !user.completedToday) {
      await this.sendStreakDangerNotification(user, hoursUntilMidnight);
    }

    // Check if streak was lost
    if (this.wasStreakLost(user)) {
      await this.handleStreakLoss(user);
    }

    return {
      currentStreak: user.current_streak,
      inDanger: hoursUntilMidnight <= 4 && !user.completedToday,
      hoursRemaining: hoursUntilMidnight,
    };
  }

  private async handleStreakLoss(user: User) {
    // Show emotional manipulation
    await showModal({
      title: `💔 You lost your ${user.current_streak} day streak!`,
      message: "All that progress... gone. But there's still hope!",
      buttons: [
        {
          text: 'Start Over 😢',
          action: () => this.resetStreak(user.id),
        },
        {
          text: 'Restore with Premium 🔥',
          action: () => this.offerStreakRestore(user),
          style: 'premium',
        },
      ],
    });

    // Track for win-back campaign
    await this.analytics.track('streak_lost', {
      streak_length: user.current_streak,
      user_level: user.level,
      ltv: user.lifetime_value,
    });
  }

  private async sendStreakDangerNotification(user: User, hoursLeft: number) {
    const messages = {
      4: `⚠️ Your ${user.current_streak} day streak ends in 4 hours!`,
      3: `🔥 Only 3 hours left to save your streak!`,
      2: `🚨 URGENT: 2 hours until you lose everything!`,
      1: `💔 Last chance! Your streak dies in 1 hour!`,
    };

    await this.notificationService.send({
      title: messages[Math.floor(hoursLeft)],
      body: 'Complete a quiz now to keep it alive!',
      data: {
        type: 'streak_danger',
        streak_value: user.current_streak,
        urgency: 'critical',
      },
    });
  }
}
```

### 2.3 Category Locking & Artificial Scarcity

```typescript
// services/categoryService.ts
export class CategoryService {
  getCategoriesForUser(user: User) {
    const categories = await getAllCategories();

    return categories.map((category) => {
      const isLocked = this.isCategoryLocked(category, user);

      return {
        ...category,
        isLocked,
        unlockRequirement: this.getUnlockRequirement(category, user),
        teaserContent: isLocked ? this.getTeaserContent(category) : null,
        premiumOnly: category.is_premium && !user.is_premium,
      };
    });
  }

  private isCategoryLocked(category: Category, user: User): boolean {
    // Free users see most categories locked
    if (!user.is_premium) {
      // Only 30% of content available for free
      return category.tier > 1 || category.is_premium;
    }

    // Premium users still have some progression
    return category.required_level > user.level;
  }

  private getTeaserContent(category: Category) {
    // Show just enough to create desire
    return {
      preview: category.questions.slice(0, 2).map((q) => ({
        question: q.question,
        options: q.options.map(() => '???'), // Hide answers
      })),
      totalQuestions: category.questions.length,
      exclusiveContent: true,
      message: 'Unlock to access all questions!',
    };
  }
}
```

---

## Phase 3: Engagement Systems (Week 5-6)

### 3.1 Notification Strategy

```typescript
// services/notificationScheduler.ts
export class NotificationScheduler {
  async scheduleUserNotifications(userId: string) {
    const user = await getUser(userId);
    const schedule = this.generatePersonalizedSchedule(user);

    for (const notification of schedule) {
      await this.scheduleNotification(notification);
    }
  }

  private generatePersonalizedSchedule(user: User) {
    const baseSchedule = [
      { hour: 8, minute: 0, template: 'morning_motivation' },
      { hour: 12, minute: 30, template: 'lunch_nudge' },
      { hour: 17, minute: 0, template: 'competition_update' },
      { hour: 20, minute: 0, template: 'streak_reminder' },
      { hour: 21, minute: 30, template: 'last_chance' },
    ];

    // Adjust based on user behavior
    if (user.churn_risk_score > 0.7) {
      baseSchedule.push({ hour: 19, minute: 0, template: 'win_back_offer' });
    }

    if (user.streak > 5) {
      baseSchedule.push({ hour: 22, minute: 0, template: 'streak_danger_final' });
    }

    return baseSchedule.map((slot) => ({
      ...slot,
      message: this.generateMessage(slot.template, user),
      data: this.getNotificationData(slot.template, user),
    }));
  }

  private generateMessage(template: string, user: User) {
    const templates = {
      morning_motivation: [
        `Good morning ${user.name}! Ready to beat yesterday's score?`,
        `Rise and shine! Your daily challenge awaits 🌟`,
        `${user.name}, 5 friends already completed their quiz today!`,
      ],
      streak_reminder: [
        `🔥 Your ${user.streak}-day streak needs attention!`,
        `⚠️ Don't lose your ${user.streak} day streak!`,
        `Quick! Save your streak before midnight!`,
      ],
      competition_update: [
        `${getRandomFriend()} just passed you on the leaderboard!`,
        `You're 50 XP behind ${getRandomFriend()}`,
        `${getRandomFriend()} is crushing it today. Can you keep up?`,
      ],
    };

    return templates[template][Math.floor(Math.random() * templates[template].length)];
  }
}
```

### 3.2 Variable Reward System

```typescript
// services/rewardService.ts
export class RewardService {
  private readonly REWARD_TABLES = {
    standard: [
      { weight: 40, reward: { type: 'xp', amount: 10 } },
      { weight: 30, reward: { type: 'xp', amount: 20 } },
      { weight: 15, reward: { type: 'coins', amount: 5 } },
      { weight: 10, reward: { type: 'heart', amount: 1 } },
      { weight: 4, reward: { type: 'powerup', amount: 1 } },
      { weight: 1, reward: { type: 'legendary', amount: 1 } },
    ],
    premium: [
      { weight: 30, reward: { type: 'xp', amount: 20 } },
      { weight: 30, reward: { type: 'xp', amount: 30 } },
      { weight: 20, reward: { type: 'coins', amount: 10 } },
      { weight: 15, reward: { type: 'powerup', amount: 1 } },
      { weight: 5, reward: { type: 'legendary', amount: 1 } },
    ],
  };

  calculateReward(performance: Performance, user: User) {
    const table = user.is_premium ? this.REWARD_TABLES.premium : this.REWARD_TABLES.standard;
    const roll = Math.random() * 100;

    let cumulative = 0;
    for (const entry of table) {
      cumulative += entry.weight;
      if (roll <= cumulative) {
        const reward = { ...entry.reward };

        // Apply multipliers
        reward.amount *= this.getMultiplier(performance, user);

        // Near-miss mechanic for free users
        if (!user.is_premium && this.isNearMiss(roll, cumulative, entry.weight)) {
          this.showNearMissMessage(entry.reward);
        }

        return reward;
      }
    }
  }

  private isNearMiss(roll: number, threshold: number, weight: number): boolean {
    // Within 2% of a better reward
    return threshold - roll < 2 && weight <= 5;
  }

  private showNearMissMessage(missedReward: Reward) {
    showToast(`So close to ${missedReward.type}! Premium users get 2x chances!`);
  }
}
```

### 3.3 Social Pressure & Leaderboards

```typescript
// services/leaderboardService.ts
export class LeaderboardService {
  async getLeaderboard(userId: string) {
    const user = await getUser(userId);
    const leaderboard = await this.fetchLeaderboard(user.league);

    // Add fake activity for engagement
    const enhanced = this.enhanceWithFakeActivity(leaderboard);

    // Mark free vs premium users
    return enhanced.map((entry) => ({
      ...entry,
      isPremium: entry.subscription_tier !== 'free',
      badge: this.getUserBadge(entry),
      isCurrentUser: entry.id === userId,
      recentActivity: this.generateRecentActivity(entry),
    }));
  }

  private enhanceWithFakeActivity(leaderboard: LeaderboardEntry[]) {
    // Add 2-3 fake "active" users if real activity is low
    const activeCount = leaderboard.filter((e) => e.last_active < 300000).length;

    if (activeCount < 3) {
      const fakeUsers = [
        { name: 'Sarah K.', xp: Math.random() * 1000 + 500, last_active: 60000 },
        { name: 'Mike T.', xp: Math.random() * 1000 + 400, last_active: 120000 },
        { name: 'Emma L.', xp: Math.random() * 1000 + 300, last_active: 180000 },
      ];

      leaderboard.push(...fakeUsers.slice(0, 3 - activeCount));
    }

    return leaderboard.sort((a, b) => b.xp - a.xp);
  }

  private getUserBadge(entry: LeaderboardEntry) {
    if (entry.subscription_tier === 'free') {
      return '🆓'; // Subtle shaming
    } else if (entry.subscription_tier === 'lifetime') {
      return '👑';
    } else {
      return '⭐';
    }
  }
}
```

---

## Phase 4: Monetization Pipeline (Week 7-8)

### 4.1 Dynamic Pricing Engine

```typescript
// services/pricingEngine.ts
export class PricingEngine {
  calculateOptimalPrice(user: User, context: Context) {
    const basePrice = 9.99;
    let multiplier = 1.0;

    // User value scoring
    if (user.level > 10) multiplier *= 1.2;
    if (user.streak > 30) multiplier *= 1.3;
    if (user.sessions > 50) multiplier *= 1.1;

    // Context-based adjustments
    if (context.trigger === 'streak_loss') {
      multiplier *= 0.5; // 50% off for emotional moment
    } else if (context.trigger === 'hearts_depleted') {
      multiplier *= 0.7; // 30% off for frustration
    } else if (context.trigger === 'achievement') {
      multiplier *= 0.8; // 20% off for celebration
    }

    // Time-based urgency
    if (context.isWeekend) multiplier *= 0.9;
    if (context.isEndOfMonth) multiplier *= 0.85;

    // A/B test variants
    const variant = this.getUserVariant(user.id);
    if (variant === 'aggressive') multiplier *= 0.6;
    if (variant === 'premium') multiplier *= 1.5;

    return {
      price: Math.round(basePrice * multiplier * 100) / 100,
      originalPrice: basePrice,
      discount: Math.round((1 - multiplier) * 100),
      urgency: this.calculateUrgency(context),
      message: this.getPricingMessage(multiplier, context),
    };
  }

  private calculateUrgency(context: Context): UrgencyLevel {
    if (context.trigger === 'streak_loss') return 'critical';
    if (context.trigger === 'trial_ending') return 'high';
    if (context.sessionCount > 3) return 'medium';
    return 'low';
  }

  private getPricingMessage(multiplier: number, context: Context) {
    if (multiplier < 0.6) {
      return '🔥 LOWEST PRICE EVER - Today only!';
    } else if (context.trigger === 'streak_loss') {
      return "💔 Special recovery offer - Don't miss out!";
    } else if (multiplier < 0.8) {
      return '⏰ Limited time offer expires soon!';
    }
    return 'Join thousands of premium learners!';
  }
}
```

### 4.2 Paywall Optimization

```typescript
// screens/PaywallScreen.tsx
export const PaywallScreen = ({ route }) => {
  const { source, context } = route.params;
  const [countdown, setCountdown] = useState(600); // 10 min timer
  const pricing = usePricing(context);

  useEffect(() => {
    // Track paywall view
    analytics.track('paywall_viewed', {
      source,
      price: pricing.price,
      variant: pricing.variant,
    });

    // Start countdown for urgency
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 0) {
          handleOfferExpired();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleDismiss = () => {
    // Confirmshaming
    Alert.alert(
      "😢 Are you sure?",
      "You'll miss out on unlimited learning and exclusive features. This special offer won't last!",
      [
        {
          text: "Stay & Save",
          style: 'cancel',
          onPress: () => analytics.track('paywall_dismiss_cancelled')
        },
        {
          text: "Leave",
          style: 'destructive',
          onPress: () => {
            analytics.track('paywall_dismissed', { time_on_page: 600 - countdown });
            navigation.goBack();
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Urgency Banner */}
      <View style={styles.urgencyBanner}>
        <Text style={styles.urgencyText}>
          🔥 Offer expires in {formatTime(countdown)}
        </Text>
      </View>

      {/* Social Proof */}
      <View style={styles.socialProof}>
        <Text>Join 50,000+ premium learners</Text>
        <View style={styles.testimonials}>
          <TestimonialCard
            text="Changed my life!"
            author="Sarah K."
            rating={5}
          />
          <TestimonialCard
            text="Worth every penny!"
            author="Mike T."
            rating={5}
          />
        </View>
      </View>

      {/* Benefits with Loss Framing */}
      <View style={styles.benefits}>
        <BenefitRow
          icon="❌"
          freeText="Limited to 5 hearts"
          premiumText="♾️ Unlimited hearts"
        />
        <BenefitRow
          icon="❌"
          freeText="Ads every 3 questions"
          premiumText="🚫 No ads, ever"
        />
        <BenefitRow
          icon="❌"
          freeText="Basic categories only"
          premiumText="🔓 All content unlocked"
        />
      </View>

      {/* Pricing Cards */}
      <View style={styles.pricing}>
        <PricingCard
          title="Monthly"
          price={pricing.monthly}
          selected={false}
          onPress={() => handleSubscribe('monthly')}
        />
        <PricingCard
          title="Annual"
          price={pricing.annual}
          originalPrice={pricing.annual * 1.4}
          badge="BEST VALUE"
          selected={true}
          highlighted={true}
          onPress={() => handleSubscribe('annual')}
        />
        <PricingCard
          title="Lifetime"
          price={pricing.lifetime}
          originalPrice={pricing.lifetime * 1.5}
          badge="ONE TIME"
          selected={false}
          onPress={() => handleSubscribe('lifetime')}
        />
      </View>

      {/* Trust Badges */}
      <View style={styles.trust}>
        <Text>🔒 Secure payment</Text>
        <Text>↩️ Cancel anytime*</Text>
        <Text style={styles.tiny}>*Cancellation requires email confirmation</Text>
      </View>
    </ScrollView>
  );
};
```

### 4.3 Trial & Win-Back Campaigns

```typescript
// services/trialCampaigns.ts
export class TrialCampaigns {
  async manageTrial(userId: string) {
    const trial = await getTrialStatus(userId);

    if (!trial) {
      return this.offerTrial(userId);
    }

    const daysRemaining = this.getDaysRemaining(trial);

    // Progressive urgency
    switch (daysRemaining) {
      case 3:
        await this.sendNotification(userId, {
          title: '⏰ 3 days left in your trial!',
          body: 'Lock in your 30% discount now',
          data: { discount: 30, urgency: 'medium' },
        });
        break;

      case 1:
        await this.sendNotification(userId, {
          title: '🚨 Trial ends TOMORROW!',
          body: 'Last chance for 50% off!',
          data: { discount: 50, urgency: 'high' },
        });
        break;

      case 0:
        // Final hours campaign
        await this.runFinalHoursCampaign(userId);
        break;

      case -1:
        // Trial expired - win-back
        await this.runWinBackCampaign(userId);
        break;
    }
  }

  private async runFinalHoursCampaign(userId: string) {
    const intervals = [
      { hours: 12, discount: 60, message: '12 hours left! 60% off' },
      { hours: 6, discount: 65, message: '6 hours! Price goes up soon!' },
      { hours: 3, discount: 70, message: 'FINAL 3 HOURS - 70% OFF!' },
      { hours: 1, discount: 75, message: 'LAST CHANCE - 75% OFF!!!' },
    ];

    for (const interval of intervals) {
      setTimeout(
        async () => {
          await this.sendUrgentNotification(userId, interval);
        },
        (24 - interval.hours) * 3600000,
      );
    }
  }

  private async runWinBackCampaign(userId: string) {
    const sequence = [
      { day: 1, discount: 40, message: 'We miss you! 40% off to come back' },
      { day: 3, discount: 50, message: 'Special offer just for you - 50% off' },
      { day: 7, discount: 60, message: 'Last chance - 60% off expires tonight' },
      { day: 14, discount: 70, message: 'We really want you back - 70% off' },
      { day: 30, discount: 80, message: 'FINAL OFFER - 80% off, never again' },
    ];

    for (const step of sequence) {
      await this.scheduleWinBackMessage(userId, step);
    }
  }
}
```

---

## Phase 5: Optimization & Testing (Week 9-10)

### 5.1 A/B Testing Framework

```typescript
// services/experiments.ts
export class ExperimentService {
  async getVariant(userId: string, experimentName: string) {
    // Check existing assignment
    const existing = await this.getExistingAssignment(userId, experimentName);
    if (existing) return existing;

    // Assign to variant
    const experiments = {
      paywall_timing: {
        variants: [
          { name: 'after_3_quizzes', weight: 25 },
          { name: 'after_7_days', weight: 25 },
          { name: 'on_streak_loss', weight: 25 },
          { name: 'on_hearts_depletion', weight: 25 },
        ],
      },
      pricing_strategy: {
        variants: [
          { name: 'standard', weight: 25 },
          { name: 'aggressive_discount', weight: 25 },
          { name: 'premium_positioning', weight: 25 },
          { name: 'dynamic', weight: 25 },
        ],
      },
      notification_frequency: {
        variants: [
          { name: 'minimal', weight: 25 },
          { name: 'moderate', weight: 25 },
          { name: 'aggressive', weight: 25 },
          { name: 'personalized', weight: 25 },
        ],
      },
    };

    const variant = this.selectVariant(experiments[experimentName].variants);
    await this.saveAssignment(userId, experimentName, variant);

    return variant;
  }

  async trackConversion(userId: string, experimentName: string) {
    const variant = await this.getVariant(userId, experimentName);

    await this.analytics.track('experiment_conversion', {
      experiment: experimentName,
      variant: variant.name,
      user_id: userId,
      timestamp: Date.now(),
    });

    // Update experiment stats
    await this.updateExperimentStats(experimentName, variant.name);
  }
}
```

### 5.2 Performance Monitoring

```typescript
// services/monitoring.ts
export class MonitoringService {
  private metrics = {
    conversion: new Map<string, number>(),
    retention: new Map<string, number>(),
    revenue: new Map<string, number>(),
    frustration: new Map<string, number>(),
  };

  async trackUserJourney(userId: string) {
    const events = await this.getUserEvents(userId);

    const journey = {
      // Conversion funnel
      installed: true,
      completed_onboarding: events.has('onboarding_complete'),
      completed_first_quiz: events.has('quiz_completed'),
      saw_paywall: events.has('paywall_viewed'),
      started_trial: events.has('trial_started'),
      converted_to_paid: events.has('subscription_activated'),

      // Engagement metrics
      sessions: events.filter((e) => e.type === 'session_start').length,
      quizzes_completed: events.filter((e) => e.type === 'quiz_completed').length,
      ads_watched: events.filter((e) => e.type === 'ad_watched').length,

      // Frustration events
      hearts_depleted: events.filter((e) => e.type === 'hearts_depleted').length,
      streak_lost: events.has('streak_lost'),
      rage_quits: events.filter((e) => e.type === 'rage_quit').length,

      // Revenue
      ltv: this.calculateLTV(events),
      revenue_from_ads: this.calculateAdRevenue(events),
      revenue_from_subs: this.calculateSubRevenue(events),
    };

    // Alert if frustration too high
    if (journey.rage_quits > 2 || journey.frustration_score > 0.8) {
      await this.alertHighFrustration(userId, journey);
    }

    return journey;
  }

  async generateDashboard() {
    return {
      kpis: {
        dau: await this.getDAU(),
        mau: await this.getMAU(),
        arpu: await this.getARPU(),
        arppu: await this.getARPPU(),
        conversion_rate: await this.getConversionRate(),
        d1_retention: await this.getRetention(1),
        d7_retention: await this.getRetention(7),
        d30_retention: await this.getRetention(30),
      },
      funnels: {
        onboarding: await this.getOnboardingFunnel(),
        monetization: await this.getMonetizationFunnel(),
        viral: await this.getViralFunnel(),
      },
      segments: {
        whales: await this.getWhales(),
        at_risk: await this.getAtRiskUsers(),
        power_users: await this.getPowerUsers(),
      },
    };
  }
}
```

---

## Launch Checklist

### Pre-Launch (1 week before)

- [ ] All services deployed and tested
- [ ] Analytics tracking verified
- [ ] A/B tests configured
- [ ] Payment processing tested
- [ ] Push notifications approved
- [ ] App store listings optimized
- [ ] Support documentation ready
- [ ] Customer service briefed

### Launch Day

- [ ] Monitoring dashboard active
- [ ] Error tracking enabled
- [ ] Support team ready
- [ ] Social media scheduled
- [ ] Press release sent
- [ ] Influencer outreach
- [ ] Paid advertising live

### Post-Launch (Week 1)

- [ ] Daily KPI review
- [ ] User feedback analysis
- [ ] Bug fixes deployed
- [ ] A/B test results reviewed
- [ ] Conversion funnel optimization
- [ ] Win-back campaigns activated
- [ ] Revenue tracking verified

---

## Monitoring & KPIs

### Critical Metrics (Check Daily)

```typescript
const CRITICAL_KPIS = {
  conversion: {
    target: 0.05, // 5% trial to paid
    alert_threshold: 0.03,
  },
  retention: {
    d1: { target: 0.4, alert: 0.3 },
    d7: { target: 0.2, alert: 0.15 },
    d30: { target: 0.1, alert: 0.07 },
  },
  monetization: {
    arpu: { target: 3.5, alert: 2.0 },
    arppu: { target: 12.0, alert: 8.0 },
  },
  frustration: {
    rage_quit_rate: { target: 0.05, alert: 0.1 },
    hearts_depletion_rate: { target: 0.2, alert: 0.3 },
  },
};
```

### Weekly Review Metrics

- Cohort retention curves
- LTV/CAC ratio
- Viral coefficient
- Support ticket volume
- App store ratings
- Churn prediction accuracy

### Monthly Strategic Review

- Revenue growth rate
- Market share analysis
- Competitive positioning
- Feature adoption rates
- User segmentation evolution
- Experiment results summary

---

## Troubleshooting Guide

### Common Issues & Solutions

#### Low Conversion Rate

1. Check paywall timing - too early/late?
2. Review pricing - run price sensitivity analysis
3. Analyze dismissal reasons
4. Test different value propositions
5. Increase trial length

#### High Churn Rate

1. Identify churn triggers
2. Implement win-back campaigns
3. Reduce frustration events
4. Improve onboarding
5. Add more free content

#### Poor Retention

1. Optimize difficulty curve
2. Increase reward frequency
3. Enhance social features
4. Improve notification timing
5. Add daily challenges

---

## Ethical Considerations & Legal Compliance

### Compliance Checklist

- [ ] GDPR compliant (EU)
- [ ] CCPA compliant (California)
- [ ] COPPA compliant (children)
- [ ] Apple App Store guidelines
- [ ] Google Play Store policies
- [ ] Subscription disclosure requirements
- [ ] Advertising standards

### Ethical Guidelines

- Frustration should motivate, not harm
- Always provide value for payment
- Be transparent about subscriptions
- Allow easy cancellation
- Protect vulnerable users
- Monitor for addiction patterns

---

## Resources & Documentation

### External Documentation

- [RevenueCat Integration](https://docs.revenuecat.com)
- [AdMob Setup](https://developers.google.com/admob)
- [OneSignal Push](https://documentation.onesignal.com)
- [Mixpanel Analytics](https://developer.mixpanel.com)

### Internal Documentation

- System Architecture: `/docs/SYSTEM_ARCHITECTURE.md`
- API Documentation: `/docs/API_DOCUMENTATION.md`
- Testing Guide: `/docs/TESTING_GUIDE.md`
- Deployment Guide: `/docs/DEPLOYMENT_GUIDE.md`

---

## Conclusion

This runbook provides a comprehensive blueprint for implementing monetization through psychological mechanics. Expected timeline: 10 weeks from start to launch. Expected outcome: 5-7% conversion rate, $3.50 ARPU, 40% D7 retention.

Remember: The goal is to create a sustainable business while providing genuine value to users. Monitor metrics closely and adjust strategies based on user feedback and ethical considerations.

---

_Last Updated: 2025-08-25_
_Version: 1.0_
_Status: Production Ready_
