# QuizMentor Ad Service & Monetization Strategy

## 🎯 Executive Summary

This document outlines our comprehensive monetization strategy combining Google Ads integration, engineered trial periods, and revenue optimization tactics to achieve sustainable growth while maintaining user engagement.

### Key Revenue Targets

- **ARPU**: $3.50 (Average Revenue Per User)
- **ARPPU**: $12.00 (Average Revenue Per Paying User)
- **Trial-to-Paid Conversion**: 15-20%
- **Month 1-2 Retention**: 85%
- **Ad Revenue per Free User**: $0.50-1.00/month

## 📊 Google Ads Integration Strategy

### 1. Ad Network Setup

#### Primary: Google AdMob

```javascript
// Production Ad Unit IDs
const ADMOB_IDS = {
  ios: {
    rewarded: 'ca-app-pub-3940256099942544/1712485313',
    interstitial: 'ca-app-pub-3940256099942544/4411468910',
    banner: 'ca-app-pub-3940256099942544/2934735716',
    native: 'ca-app-pub-3940256099942544/3986624511',
    app_open: 'ca-app-pub-3940256099942544/5662855259',
  },
  android: {
    rewarded: 'ca-app-pub-3940256099942544/5224354917',
    interstitial: 'ca-app-pub-3940256099942544/1033173712',
    banner: 'ca-app-pub-3940256099942544/6300978111',
    native: 'ca-app-pub-3940256099942544/2247696110',
    app_open: 'ca-app-pub-3940256099942544/3419835294',
  },
};
```

#### Secondary Networks (Mediation)

- **Facebook Audience Network**: 20-30% fill rate
- **Unity Ads**: Gaming-focused, high eCPM
- **AppLovin**: Strong for rewarded video
- **IronSource**: Excellent mediation layer

### 2. Ad Placement Strategy

#### Rewarded Video Ads

**Placement Points:**

1. **Heart Regeneration**: Watch ad for 3 hearts
2. **Streak Recovery**: Watch ad to save streak
3. **XP Boost**: Watch ad for 2x XP for 30 minutes
4. **Hint Unlock**: Watch ad for 3 hints
5. **Category Preview**: Watch ad to try locked category

**Optimization Rules:**

```javascript
const REWARDED_AD_CONFIG = {
  dailyLimit: 10, // Soft limit
  cooldown: 180, // 3 minutes between ads
  rewards: {
    hearts: { base: 3, decay: 0.1 }, // Diminishing returns
    xp_boost: { duration: 1800, multiplier: 2 },
    hints: { amount: 3, validity: 86400 },
    streak_freeze: { amount: 1, maxStack: 3 },
  },
};
```

#### Interstitial Ads

**Strategic Triggers:**

1. After every 3rd quiz completion
2. When returning to home after 5+ minutes
3. Before viewing leaderboard (30% chance)
4. After claiming daily reward
5. When streak reaches milestone (7, 30, 100 days)

**Frequency Capping:**

```javascript
const INTERSTITIAL_CONFIG = {
  minInterval: 180, // 3 minutes
  maxPerSession: 5,
  maxPerDay: 15,
  skipButtonDelay: 5, // 5 seconds
  triggers: {
    quiz_complete: { chance: 0.33, priority: 1 },
    app_resume: { chance: 0.25, priority: 2 },
    level_up: { chance: 0.5, priority: 3 },
    achievement: { chance: 0.4, priority: 4 },
  },
};
```

#### Banner Ads

**Placement:**

- Bottom of home screen (adaptive banner)
- Top of category selection
- Between leaderboard sections

**Configuration:**

```javascript
const BANNER_CONFIG = {
  refreshRate: 45, // seconds
  collapsible: true, // Google's collapsible banners
  adaptive: true, // Responsive sizing
  smartBanner: true, // Auto-sizing for device
};
```

#### Native Ads

**Integration Points:**

- In quiz question flow (every 10 questions)
- In leaderboard list (every 5 entries)
- In achievement gallery
- In learning path recommendations

### 3. Ad Revenue Optimization

#### eCPM Optimization

```javascript
const AD_OPTIMIZATION = {
  // Floor prices by region
  floorPrices: {
    US: { rewarded: 10, interstitial: 5, banner: 0.5 },
    UK: { rewarded: 8, interstitial: 4, banner: 0.4 },
    TIER_1: { rewarded: 6, interstitial: 3, banner: 0.3 },
    TIER_2: { rewarded: 3, interstitial: 1.5, banner: 0.15 },
    TIER_3: { rewarded: 1, interstitial: 0.5, banner: 0.05 },
  },

  // Waterfall mediation
  waterfall: [
    { network: 'admob', weight: 40 },
    { network: 'facebook', weight: 30 },
    { network: 'unity', weight: 20 },
    { network: 'applovin', weight: 10 },
  ],

  // A/B testing
  experiments: {
    ad_frequency: ['aggressive', 'moderate', 'conservative'],
    reward_amounts: ['standard', 'generous', 'dynamic'],
    placement_timing: ['immediate', 'delayed', 'contextual'],
  },
};
```

## 🎮 Engineered Trial Period System

### 1. Trial Architecture

#### Multi-Tier Trial System

```javascript
const TRIAL_TIERS = {
  DISCOVERY: {
    duration: 3, // days
    features: ['unlimited_hearts', 'no_ads'],
    conversionTarget: 5,
    triggerConditions: ['first_install'],
  },

  ENGAGEMENT: {
    duration: 7, // days
    features: ['unlimited_hearts', 'no_ads', 'premium_categories', 'advanced_stats'],
    conversionTarget: 15,
    triggerConditions: ['streak_7_days', 'level_5_reached'],
  },

  POWER_USER: {
    duration: 14, // days
    features: ['all_premium_features'],
    conversionTarget: 25,
    triggerConditions: ['100_questions_answered', 'friend_referral'],
  },

  WIN_BACK: {
    duration: 3, // days
    features: ['unlimited_hearts', 'no_ads'],
    conversionTarget: 10,
    triggerConditions: ['churned_user_return', 'subscription_cancelled'],
  },
};
```

### 2. Conversion Optimization Mechanics

#### Behavioral Triggers

```javascript
class TrialConversionEngine {
  // Track user behavior during trial
  trackTrialBehavior(userId, action) {
    const behaviors = {
      high_engagement: {
        triggers: ['daily_login', 'streak_maintained', 'social_share'],
        offerDiscount: 30,
        urgencyLevel: 'medium',
      },

      friction_points: {
        triggers: ['ran_out_of_hearts', 'lost_streak', 'ad_frustration'],
        offerDiscount: 50,
        urgencyLevel: 'high',
      },

      power_usage: {
        triggers: ['advanced_features_used', 'leaderboard_top_10', 'achievement_hunter'],
        offerDiscount: 20,
        urgencyLevel: 'low',
      },
    };

    return this.calculateOptimalOffer(userId, behaviors);
  }

  // Dynamic pricing during trial
  calculateOptimalPrice(user) {
    const basePrice = 9.99;
    const factors = {
      engagement_score: user.getEngagementScore(), // 0-1
      price_sensitivity: user.getPriceSensitivity(), // 0-1
      competitor_apps: user.getCompetitorAppCount(),
      region_purchasing_power: user.getRegionPPP(),
    };

    let adjustedPrice = basePrice;

    // High engagement = less discount needed
    adjustedPrice *= 1 - factors.engagement_score * 0.2;

    // Price sensitive = more discount
    adjustedPrice *= 1 - factors.price_sensitivity * 0.3;

    // Has competitor apps = competitive pricing
    if (factors.competitor_apps > 2) {
      adjustedPrice *= 0.8;
    }

    // Regional adjustment
    adjustedPrice *= factors.region_purchasing_power;

    return Math.round(adjustedPrice * 100) / 100;
  }
}
```

#### Trial Expiry Urgency System

```javascript
const TRIAL_URGENCY_CAMPAIGN = {
  day_minus_3: {
    notification: '⏰ 3 days left in your trial!',
    inApp: 'Enjoying premium? Lock in your 30% discount now',
    email: true,
    discount: 30,
  },

  day_minus_1: {
    notification: "🚨 Trial ends tomorrow! Don't lose your progress",
    inApp: 'Last chance: 50% off your first month',
    email: true,
    push_frequency: 3, // 3 notifications throughout the day
    discount: 50,
  },

  final_hours: {
    notification: '💔 Only 3 hours left! Your unlimited hearts expire soon',
    inApp: 'Emergency offer: 70% off - expires with your trial',
    email: true,
    push_frequency: 'hourly',
    discount: 70,
    countdown_timer: true,
  },

  expired: {
    notification: '😢 Trial ended - Get 40% off to continue',
    inApp: "We miss you! Here's an exclusive comeback offer",
    email: true,
    validity: 48, // hours
    discount: 40,
  },
};
```

### 3. Trial Feature Gating

#### Progressive Feature Unlock

```javascript
const TRIAL_FEATURES = {
  day_1: ['unlimited_hearts', 'no_ads'],
  day_2: ['unlimited_hearts', 'no_ads', 'advanced_stats'],
  day_3: ['unlimited_hearts', 'no_ads', 'advanced_stats', 'premium_categories'],
  day_4: ['all_features'],

  // Create dependency to maximize loss aversion
  feature_dependency_map: {
    unlimited_hearts: ['maintain_streak', 'rapid_learning'],
    premium_categories: ['interview_prep', 'specialized_learning'],
    advanced_stats: ['track_improvement', 'identify_weaknesses'],
  },
};
```

## 💰 Revenue Optimization Strategies

### 1. Dynamic Pricing Engine

```javascript
class DynamicPricingEngine {
  calculatePrice(user, context) {
    const strategies = {
      // Time-based pricing
      time_based: () => {
        const hour = new Date().getHours();
        if (hour >= 18 && hour <= 22) return 0.9; // Evening discount
        if (hour >= 6 && hour <= 9) return 1.1; // Morning premium
        return 1.0;
      },

      // Behavior-based pricing
      behavior_based: () => {
        if (user.isAboutToChurn()) return 0.5; // 50% retention offer
        if (user.isWhale()) return 1.5; // Premium pricing for whales
        if (user.justLostStreak()) return 0.7; // Streak recovery offer
        return 1.0;
      },

      // Competition-based pricing
      competition_based: () => {
        const competitorPrices = this.getCompetitorPrices();
        const avgPrice = competitorPrices.reduce((a, b) => a + b) / competitorPrices.length;
        return user.isPriceSensitive() ? 0.8 : 0.95; // Undercut slightly
      },

      // Cohort-based pricing
      cohort_based: () => {
        const cohortValue = this.getCohortLTV(user.cohort);
        if (cohortValue > 100) return 1.2; // High-value cohort
        if (cohortValue < 30) return 0.8; // Low-value cohort
        return 1.0;
      },
    };

    // Combine strategies
    let multiplier = 1.0;
    Object.values(strategies).forEach((strategy) => {
      multiplier *= strategy();
    });

    const basePrice = 9.99;
    return Math.round(basePrice * multiplier * 100) / 100;
  }
}
```

### 2. Subscription Tier Optimization

```javascript
const SUBSCRIPTION_TIERS = {
  BASIC: {
    price: 9.99,
    features: ['unlimited_hearts', 'no_ads', 'basic_stats'],
    target_audience: 'casual_learners',
    conversion_target: 10,
  },

  PREMIUM: {
    price: 19.99,
    features: [
      'everything_in_basic',
      'all_categories',
      'advanced_analytics',
      'priority_support',
      'offline_mode',
    ],
    target_audience: 'serious_learners',
    conversion_target: 5,
  },

  INTERVIEW_PREP: {
    price: 49.99,
    features: [
      'everything_in_premium',
      'interview_questions',
      'mock_interviews',
      'resume_review',
      'salary_negotiation',
      '1_on_1_mentoring',
    ],
    target_audience: 'job_seekers',
    conversion_target: 2,
  },

  TEAM: {
    price: 99.99,
    features: [
      '5_accounts',
      'team_leaderboard',
      'progress_tracking',
      'custom_categories',
      'admin_dashboard',
    ],
    target_audience: 'companies',
    conversion_target: 0.5,
  },
};
```

### 3. Retention & Win-Back Campaigns

```javascript
const RETENTION_CAMPAIGNS = {
  pre_churn: {
    trigger: 'no_activity_3_days',
    actions: [
      { type: 'notification', message: 'Your streak needs you! 🔥' },
      { type: 'email', template: 'win_back_streak' },
      { type: 'offer', discount: 30, validity: 24 },
    ],
  },

  post_cancel: {
    trigger: 'subscription_cancelled',
    actions: [
      { type: 'survey', questions: ['cancellation_reason'] },
      { type: 'offer', discount: 50, validity: 72 },
      { type: 'feature', unlock: 'premium_category_sample' },
    ],
  },

  dormant_user: {
    trigger: 'no_activity_30_days',
    actions: [
      { type: 'email', template: 'whats_new' },
      { type: 'offer', trial: 'WIN_BACK', duration: 3 },
      { type: 'notification', message: 'We added your requested feature!' },
    ],
  },
};
```

## 📊 Analytics & KPI Tracking

### 1. Revenue Metrics Dashboard

```javascript
const REVENUE_METRICS = {
  // Primary KPIs
  primary: {
    daily_revenue: 'sum(ad_revenue + subscription_revenue)',
    arpu: 'total_revenue / active_users',
    arppu: 'subscription_revenue / paying_users',
    conversion_rate: 'paying_users / trial_users',
    churn_rate: 'cancelled_subscriptions / total_subscriptions',
  },

  // Ad Metrics
  ad_metrics: {
    ad_revenue_per_user: 'ad_revenue / free_users',
    fill_rate: 'ads_served / ad_requests',
    ecpm: '(ad_revenue / impressions) * 1000',
    viewability: 'viewable_impressions / total_impressions',
    click_through_rate: 'clicks / impressions',
  },

  // Subscription Metrics
  subscription_metrics: {
    trial_conversion: 'paid_conversions / trial_starts',
    mrr: 'sum(active_subscriptions * subscription_price)',
    ltv: 'arpu * average_customer_lifetime',
    cac: 'marketing_spend / new_customers',
    payback_period: 'cac / arpu',
  },

  // Engagement Metrics
  engagement_metrics: {
    dau_mau: 'daily_active_users / monthly_active_users',
    session_length: 'avg(session_end - session_start)',
    sessions_per_user: 'total_sessions / unique_users',
    retention_day_1: 'users_returned_day_1 / new_users',
    retention_day_7: 'users_returned_day_7 / new_users',
    retention_day_30: 'users_returned_day_30 / new_users',
  },
};
```

### 2. A/B Testing Framework

```javascript
const AB_TESTS = {
  current_experiments: [
    {
      name: 'trial_duration',
      variants: [3, 7, 14], // days
      metric: 'conversion_rate',
      sample_size: 10000,
    },
    {
      name: 'ad_frequency',
      variants: ['high', 'medium', 'low'],
      metric: 'arpu',
      sample_size: 15000,
    },
    {
      name: 'pricing',
      variants: [7.99, 9.99, 12.99],
      metric: 'ltv',
      sample_size: 5000,
    },
    {
      name: 'paywall_design',
      variants: ['minimal', 'detailed', 'video'],
      metric: 'conversion_rate',
      sample_size: 8000,
    },
  ],
};
```

## 🚀 Implementation Roadmap

### Phase 1: Foundation (Week 1-2)

1. **Google AdMob Integration**
   - Set up AdMob account and ad units
   - Implement SDK in React Native
   - Create ad service wrapper
   - Test ad placements

2. **Basic Trial System**
   - Implement 7-day trial
   - Set up trial tracking
   - Create conversion funnel
   - Add urgency notifications

### Phase 2: Optimization (Week 3-4)

1. **Ad Mediation**
   - Add Facebook Audience Network
   - Implement waterfall logic
   - Set up floor prices
   - A/B test placements

2. **Trial Enhancement**
   - Add behavioral triggers
   - Implement dynamic pricing
   - Create urgency campaigns
   - Set up win-back flows

### Phase 3: Advanced Features (Week 5-6)

1. **Revenue Analytics**
   - Build analytics dashboard
   - Set up event tracking
   - Implement cohort analysis
   - Create revenue reports

2. **Subscription Tiers**
   - Launch premium tiers
   - Add team plans
   - Implement upgrade flows
   - Create retention campaigns

### Phase 4: Scale & Optimize (Ongoing)

1. **Continuous Optimization**
   - Run A/B tests
   - Optimize ad placements
   - Refine pricing strategy
   - Improve conversion funnels

2. **Expansion**
   - Add new ad networks
   - Launch referral program
   - Implement affiliate system
   - Create B2B offerings

## 🎯 Success Metrics

### Month 1 Targets

- **Ad Revenue**: $500
- **Subscription Revenue**: $2,000
- **Total Users**: 10,000
- **Paying Users**: 200
- **ARPU**: $0.25

### Month 3 Targets

- **Ad Revenue**: $5,000
- **Subscription Revenue**: $20,000
- **Total Users**: 50,000
- **Paying Users**: 2,000
- **ARPU**: $0.50

### Month 6 Targets

- **Ad Revenue**: $25,000
- **Subscription Revenue**: $100,000
- **Total Users**: 200,000
- **Paying Users**: 10,000
- **ARPU**: $0.625

### Year 1 Targets

- **Ad Revenue**: $150,000
- **Subscription Revenue**: $850,000
- **Total Users**: 1,000,000
- **Paying Users**: 70,000
- **ARPU**: $1.00
- **Total Revenue**: $1,000,000

## 🔧 Technical Implementation

### Required SDKs

```json
{
  "dependencies": {
    "react-native-google-mobile-ads": "^13.0.0",
    "react-native-fbads": "^6.0.0",
    "react-native-applovin-max": "^2.0.0",
    "react-native-ironsource": "^2.0.0",
    "react-native-purchases": "^7.0.0",
    "react-native-analytics": "^2.0.0",
    "react-native-onesignal": "^5.0.0"
  }
}
```

### Environment Variables

```env
# AdMob
ADMOB_APP_ID_IOS=ca-app-pub-xxxxx
ADMOB_APP_ID_ANDROID=ca-app-pub-xxxxx

# Facebook
FB_APP_ID=xxxxx
FB_PLACEMENT_ID=xxxxx

# RevenueCat
REVENUECAT_API_KEY_IOS=xxxxx
REVENUECAT_API_KEY_ANDROID=xxxxx

# Analytics
MIXPANEL_TOKEN=xxxxx
AMPLITUDE_API_KEY=xxxxx

# OneSignal
ONESIGNAL_APP_ID=xxxxx
```

## 📝 Best Practices

### Ad Implementation

1. **Always provide value** - Rewarded ads should feel worthwhile
2. **Respect user experience** - Don't interrupt critical moments
3. **Frequency cap everything** - Prevent ad fatigue
4. **Test extensively** - Different audiences respond differently
5. **Monitor metrics daily** - Quick response to issues

### Trial Optimization

1. **Front-load value** - Show best features early
2. **Create dependency** - Make features integral to experience
3. **Use social proof** - Show what others are achieving
4. **Personalize offers** - Different users need different triggers
5. **Never give up** - Win-back campaigns can be highly effective

### Revenue Growth

1. **Focus on retention** - Retained users are more valuable
2. **Segment ruthlessly** - Different strategies for different users
3. **Test pricing constantly** - Optimal price changes over time
4. **Build habits** - Daily active users monetize better
5. **Provide genuine value** - Sustainable monetization requires real value

---

_This strategy document should be reviewed and updated monthly based on performance data and market conditions._
