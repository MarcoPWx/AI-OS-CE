import { create } from 'zustand';
import { adService } from './adService';
import { useSubscriptionStore } from './subscriptionService';
import { useTrialStore, trialService } from './trialService';
import analytics from './analytics';

// Revenue metric types
interface RevenueMetrics {
  // Primary KPIs
  dailyRevenue: number;
  monthlyRevenue: number;
  totalRevenue: number;
  arpu: number; // Average Revenue Per User
  arppu: number; // Average Revenue Per Paying User
  ltv: number; // Lifetime Value
  cac: number; // Customer Acquisition Cost

  // Ad Metrics
  adRevenue: number;
  adImpressions: number;
  ecpm: number;
  fillRate: number;
  adRevenuePerUser: number;

  // Subscription Metrics
  subscriptionRevenue: number;
  mrr: number; // Monthly Recurring Revenue
  arr: number; // Annual Recurring Revenue
  churnRate: number;
  retentionRate: number;
  trialConversionRate: number;

  // User Metrics
  totalUsers: number;
  dau: number; // Daily Active Users
  mau: number; // Monthly Active Users
  dauMauRatio: number;
  payingUsers: number;
  conversionRate: number;

  // Engagement Metrics
  sessionsPerUser: number;
  avgSessionLength: number;
  quizzesPerUser: number;
  retentionDay1: number;
  retentionDay7: number;
  retentionDay30: number;
}

interface CohortAnalysis {
  cohortId: string;
  startDate: Date;
  size: number;
  revenue: number;
  ltv: number;
  retention: number[];
  churn: number[];
}

interface RevenueSegment {
  segmentName: string;
  users: number;
  revenue: number;
  arpu: number;
  conversionRate: number;
}

interface RevenueAnalyticsState {
  metrics: RevenueMetrics;
  cohorts: CohortAnalysis[];
  segments: RevenueSegment[];
  lastUpdated: number;
}

// Revenue Analytics Store
interface RevenueAnalyticsStore extends RevenueAnalyticsState {
  // Actions
  updateMetrics: () => Promise<void>;
  calculateARPU: () => number;
  calculateARPPU: () => number;
  calculateLTV: (userId?: string) => number;
  calculateCAC: () => number;
  calculateChurnRate: (period: 'daily' | 'weekly' | 'monthly') => number;
  getRevenueBySource: () => { ads: number; subscriptions: number; iap: number };
  getRevenueByRegion: () => Map<string, number>;
  getRevenueByPlatform: () => { ios: number; android: number; web: number };
  trackRevenue: (source: string, amount: number, metadata?: any) => void;
  generateReport: (period: 'daily' | 'weekly' | 'monthly') => any;
  predictRevenue: (days: number) => number;
  identifyRevenueOpportunities: () => string[];
  getCohortAnalysis: (cohortId: string) => CohortAnalysis | undefined;
  segmentUsers: () => RevenueSegment[];
}

export const useRevenueAnalytics = create<RevenueAnalyticsStore>((set, get) => ({
  // Initial state
  metrics: {
    dailyRevenue: 0,
    monthlyRevenue: 0,
    totalRevenue: 0,
    arpu: 0,
    arppu: 0,
    ltv: 0,
    cac: 0,
    adRevenue: 0,
    adImpressions: 0,
    ecpm: 0,
    fillRate: 0,
    adRevenuePerUser: 0,
    subscriptionRevenue: 0,
    mrr: 0,
    arr: 0,
    churnRate: 0,
    retentionRate: 0,
    trialConversionRate: 0,
    totalUsers: 0,
    dau: 0,
    mau: 0,
    dauMauRatio: 0,
    payingUsers: 0,
    conversionRate: 0,
    sessionsPerUser: 0,
    avgSessionLength: 0,
    quizzesPerUser: 0,
    retentionDay1: 0,
    retentionDay7: 0,
    retentionDay30: 0,
  },
  cohorts: [],
  segments: [],
  lastUpdated: Date.now(),

  // Update all metrics
  updateMetrics: async () => {
    // Get data from various sources
    const adMetrics = adService.getAdMetrics();
    const subscriptionState = useSubscriptionStore.getState();
    const trialState = useTrialStore.getState();

    // Fetch user data (in production, from database)
    const userData = await fetchUserData();

    // Calculate revenue metrics
    const dailyRevenue = calculateDailyRevenue(adMetrics, subscriptionState);
    const monthlyRevenue = calculateMonthlyRevenue(adMetrics, subscriptionState);
    const totalRevenue = calculateTotalRevenue();

    // Calculate user metrics
    const totalUsers = userData.totalUsers;
    const dau = userData.dailyActiveUsers;
    const mau = userData.monthlyActiveUsers;
    const dauMauRatio = dau / Math.max(1, mau);
    const payingUsers = userData.payingUsers;
    const conversionRate = payingUsers / Math.max(1, totalUsers);

    // Calculate ARPU and ARPPU
    const arpu = totalRevenue / Math.max(1, totalUsers);
    const arppu = subscriptionState.subscription ? monthlyRevenue / Math.max(1, payingUsers) : 0;

    // Calculate LTV
    const ltv = get().calculateLTV();

    // Calculate CAC
    const cac = get().calculateCAC();

    // Calculate ad metrics
    const adRevenue = adMetrics.revenue;
    const adImpressions = adMetrics.impressions;
    const ecpm = adMetrics.ecpm;
    const fillRate = adMetrics.fillRate;
    const adRevenuePerUser = adRevenue / Math.max(1, totalUsers - payingUsers);

    // Calculate subscription metrics
    const subscriptionRevenue = calculateSubscriptionRevenue(subscriptionState);
    const mrr = calculateMRR(subscriptionState);
    const arr = mrr * 12;
    const churnRate = get().calculateChurnRate('monthly');
    const retentionRate = 100 - churnRate;
    const trialConversionRate = calculateTrialConversion(trialState);

    // Calculate engagement metrics
    const engagementData = await fetchEngagementData();
    const sessionsPerUser = engagementData.sessionsPerUser;
    const avgSessionLength = engagementData.avgSessionLength;
    const quizzesPerUser = engagementData.quizzesPerUser;
    const retentionDay1 = engagementData.retentionDay1;
    const retentionDay7 = engagementData.retentionDay7;
    const retentionDay30 = engagementData.retentionDay30;

    // Update state
    set({
      metrics: {
        dailyRevenue,
        monthlyRevenue,
        totalRevenue,
        arpu,
        arppu,
        ltv,
        cac,
        adRevenue,
        adImpressions,
        ecpm,
        fillRate,
        adRevenuePerUser,
        subscriptionRevenue,
        mrr,
        arr,
        churnRate,
        retentionRate,
        trialConversionRate,
        totalUsers,
        dau,
        mau,
        dauMauRatio,
        payingUsers,
        conversionRate,
        sessionsPerUser,
        avgSessionLength,
        quizzesPerUser,
        retentionDay1,
        retentionDay7,
        retentionDay30,
      },
      lastUpdated: Date.now(),
    });

    // Track metrics update
    analytics.track('revenue_metrics_updated', {
      dailyRevenue,
      monthlyRevenue,
      arpu,
      ltv,
      conversionRate,
    });
  },

  // Calculate Average Revenue Per User
  calculateARPU: () => {
    const state = get();
    const { totalRevenue, totalUsers } = state.metrics;

    if (totalUsers === 0) return 0;

    const arpu = totalRevenue / totalUsers;

    set((state) => ({
      metrics: {
        ...state.metrics,
        arpu,
      },
    }));

    return arpu;
  },

  // Calculate Average Revenue Per Paying User
  calculateARPPU: () => {
    const state = get();
    const { subscriptionRevenue, payingUsers } = state.metrics;

    if (payingUsers === 0) return 0;

    const arppu = subscriptionRevenue / payingUsers;

    set((state) => ({
      metrics: {
        ...state.metrics,
        arppu,
      },
    }));

    return arppu;
  },

  // Calculate Lifetime Value
  calculateLTV: (userId?: string) => {
    const state = get();

    if (userId) {
      // Calculate LTV for specific user
      return calculateUserLTV(userId);
    }

    // Calculate average LTV
    const { arpu, churnRate } = state.metrics;

    if (churnRate === 0) return arpu * 12; // Default to 1 year if no churn

    const monthlyChurnRate = churnRate / 100;
    const averageLifetime = 1 / monthlyChurnRate; // in months
    const ltv = arpu * averageLifetime;

    set((state) => ({
      metrics: {
        ...state.metrics,
        ltv,
      },
    }));

    return ltv;
  },

  // Calculate Customer Acquisition Cost
  calculateCAC: () => {
    // In production, get from marketing spend data
    const marketingSpend = getMarketingSpend();
    const newCustomers = getNewCustomers();

    if (newCustomers === 0) return 0;

    const cac = marketingSpend / newCustomers;

    set((state) => ({
      metrics: {
        ...state.metrics,
        cac,
      },
    }));

    return cac;
  },

  // Calculate churn rate
  calculateChurnRate: (period: 'daily' | 'weekly' | 'monthly') => {
    // In production, calculate from user data
    const churnData = getChurnData(period);

    const startUsers = churnData.startUsers;
    const endUsers = churnData.endUsers;
    const newUsers = churnData.newUsers;

    if (startUsers === 0) return 0;

    const churnedUsers = startUsers + newUsers - endUsers;
    const churnRate = (churnedUsers / startUsers) * 100;

    if (period === 'monthly') {
      set((state) => ({
        metrics: {
          ...state.metrics,
          churnRate,
        },
      }));
    }

    return churnRate;
  },

  // Get revenue breakdown by source
  getRevenueBySource: () => {
    const state = get();
    const { adRevenue, subscriptionRevenue } = state.metrics;

    // In production, include more sources
    const iapRevenue = getIAPRevenue();

    return {
      ads: adRevenue,
      subscriptions: subscriptionRevenue,
      iap: iapRevenue,
    };
  },

  // Get revenue by region
  getRevenueByRegion: () => {
    // In production, aggregate from user data
    const regionRevenue = new Map<string, number>();

    regionRevenue.set('US', 45000);
    regionRevenue.set('UK', 12000);
    regionRevenue.set('CA', 8000);
    regionRevenue.set('AU', 6000);
    regionRevenue.set('EU', 15000);
    regionRevenue.set('ASIA', 10000);
    regionRevenue.set('OTHER', 4000);

    return regionRevenue;
  },

  // Get revenue by platform
  getRevenueByPlatform: () => {
    // In production, aggregate from platform data
    return {
      ios: 55000,
      android: 35000,
      web: 10000,
    };
  },

  // Track revenue event
  trackRevenue: (source: string, amount: number, metadata?: any) => {
    // Track revenue event
    analytics.track('revenue_generated', {
      source,
      amount,
      ...metadata,
    });

    // Update metrics
    set((state) => {
      const metrics = { ...state.metrics };

      metrics.totalRevenue += amount;
      metrics.dailyRevenue += amount;

      if (source === 'ad') {
        metrics.adRevenue += amount;
      } else if (source === 'subscription') {
        metrics.subscriptionRevenue += amount;
      }

      return { metrics };
    });
  },

  // Generate revenue report
  generateReport: (period: 'daily' | 'weekly' | 'monthly') => {
    const state = get();
    const metrics = state.metrics;

    const report = {
      period,
      generatedAt: new Date(),
      summary: {
        revenue: period === 'daily' ? metrics.dailyRevenue : metrics.monthlyRevenue,
        users: period === 'daily' ? metrics.dau : metrics.mau,
        arpu: metrics.arpu,
        conversionRate: metrics.conversionRate,
      },
      breakdown: {
        bySource: get().getRevenueBySource(),
        byRegion: Array.from(get().getRevenueByRegion().entries()),
        byPlatform: get().getRevenueByPlatform(),
      },
      trends: {
        revenueGrowth: calculateGrowth(period),
        userGrowth: calculateUserGrowth(period),
        churnTrend: getChurnTrend(period),
      },
      highlights: get().identifyRevenueOpportunities(),
      recommendations: generateRecommendations(metrics),
    };

    return report;
  },

  // Predict future revenue
  predictRevenue: (days: number) => {
    const state = get();
    const { dailyRevenue, arpu, dau } = state.metrics;

    // Simple linear projection (in production, use ML models)
    const growthRate = 0.05; // 5% monthly growth
    const dailyGrowthRate = Math.pow(1 + growthRate, 1 / 30) - 1;

    let predictedRevenue = 0;
    let currentDailyRevenue = dailyRevenue;

    for (let i = 0; i < days; i++) {
      currentDailyRevenue *= 1 + dailyGrowthRate;
      predictedRevenue += currentDailyRevenue;
    }

    return predictedRevenue;
  },

  // Identify revenue optimization opportunities
  identifyRevenueOpportunities: () => {
    const state = get();
    const metrics = state.metrics;
    const opportunities: string[] = [];

    // Low conversion rate
    if (metrics.conversionRate < 0.02) {
      opportunities.push(
        'Conversion rate below 2% - Consider improving onboarding and trial experience',
      );
    }

    // Low ARPU
    if (metrics.arpu < 0.5) {
      opportunities.push('ARPU below $0.50 - Increase ad frequency or improve pricing strategy');
    }

    // High churn
    if (metrics.churnRate > 10) {
      opportunities.push('Monthly churn above 10% - Focus on retention and engagement features');
    }

    // Low trial conversion
    if (metrics.trialConversionRate < 0.15) {
      opportunities.push(
        'Trial conversion below 15% - Optimize trial experience and urgency campaigns',
      );
    }

    // Low DAU/MAU ratio
    if (metrics.dauMauRatio < 0.2) {
      opportunities.push('DAU/MAU below 20% - Improve daily engagement mechanics');
    }

    // Low ad revenue per user
    if (metrics.adRevenuePerUser < 0.3) {
      opportunities.push('Ad revenue per user below $0.30 - Optimize ad placements and frequency');
    }

    // Low LTV/CAC ratio
    if (metrics.ltv / metrics.cac < 3) {
      opportunities.push(
        'LTV/CAC ratio below 3:1 - Reduce acquisition costs or increase lifetime value',
      );
    }

    return opportunities;
  },

  // Get cohort analysis
  getCohortAnalysis: (cohortId: string) => {
    const state = get();
    return state.cohorts.find((c) => c.cohortId === cohortId);
  },

  // Segment users for targeted monetization
  segmentUsers: () => {
    const segments: RevenueSegment[] = [];

    // Whales (top 1% spenders)
    segments.push({
      segmentName: 'Whales',
      users: 100,
      revenue: 25000,
      arpu: 250,
      conversionRate: 1.0,
    });

    // Dolphins (top 10% spenders)
    segments.push({
      segmentName: 'Dolphins',
      users: 900,
      revenue: 35000,
      arpu: 38.89,
      conversionRate: 0.8,
    });

    // Minnows (paying users)
    segments.push({
      segmentName: 'Minnows',
      users: 4000,
      revenue: 20000,
      arpu: 5,
      conversionRate: 0.5,
    });

    // Free users (engaged)
    segments.push({
      segmentName: 'Engaged Free',
      users: 15000,
      revenue: 7500, // Ad revenue
      arpu: 0.5,
      conversionRate: 0,
    });

    // Free users (casual)
    segments.push({
      segmentName: 'Casual Free',
      users: 30000,
      revenue: 3000, // Ad revenue
      arpu: 0.1,
      conversionRate: 0,
    });

    set({ segments });

    return segments;
  },
}));

// Helper functions (in production, these would fetch from database)
async function fetchUserData() {
  // Simulate API call
  return {
    totalUsers: 50000,
    dailyActiveUsers: 5000,
    monthlyActiveUsers: 20000,
    payingUsers: 2500,
  };
}

async function fetchEngagementData() {
  // Simulate API call
  return {
    sessionsPerUser: 2.5,
    avgSessionLength: 8.5, // minutes
    quizzesPerUser: 4.2,
    retentionDay1: 0.45,
    retentionDay7: 0.25,
    retentionDay30: 0.15,
  };
}

function calculateDailyRevenue(adMetrics: any, subscriptionState: any) {
  // Simplified calculation
  const dailyAdRevenue = adMetrics.revenue || 0;
  const dailySubRevenue = (subscriptionState.offerings?.monthly?.product.price || 0) * 10; // Assume 10 daily conversions
  return dailyAdRevenue + dailySubRevenue;
}

function calculateMonthlyRevenue(adMetrics: any, subscriptionState: any) {
  // Simplified calculation
  return calculateDailyRevenue(adMetrics, subscriptionState) * 30;
}

function calculateTotalRevenue() {
  // In production, sum from database
  return 100000; // $100k total revenue
}

function calculateSubscriptionRevenue(subscriptionState: any) {
  // Simplified calculation
  return 70000; // $70k subscription revenue
}

function calculateMRR(subscriptionState: any) {
  // Monthly Recurring Revenue
  return 7000; // $7k MRR
}

function calculateTrialConversion(trialState: any) {
  // Trial to paid conversion rate
  return 0.15; // 15% conversion
}

function calculateUserLTV(userId: string) {
  // Calculate LTV for specific user
  return 50; // $50 average LTV
}

function getMarketingSpend() {
  // Get marketing spend
  return 10000; // $10k monthly spend
}

function getNewCustomers() {
  // Get new customer count
  return 500; // 500 new customers
}

function getChurnData(period: string) {
  // Get churn data for period
  return {
    startUsers: 2500,
    endUsers: 2400,
    newUsers: 150,
  };
}

function getIAPRevenue() {
  // Get in-app purchase revenue
  return 5000; // $5k IAP revenue
}

function calculateGrowth(period: string) {
  // Calculate revenue growth
  return 0.15; // 15% growth
}

function calculateUserGrowth(period: string) {
  // Calculate user growth
  return 0.2; // 20% user growth
}

function getChurnTrend(period: string) {
  // Get churn trend
  return -0.02; // 2% improvement in churn
}

function generateRecommendations(metrics: RevenueMetrics) {
  const recommendations: string[] = [];

  if (metrics.conversionRate < 0.03) {
    recommendations.push('Implement dynamic pricing to improve conversion');
  }

  if (metrics.churnRate > 8) {
    recommendations.push('Launch retention campaign with personalized offers');
  }

  if (metrics.adRevenuePerUser < 0.5) {
    recommendations.push('Test higher ad frequency for engaged users');
  }

  if (metrics.dauMauRatio < 0.25) {
    recommendations.push('Add daily challenges and streak mechanics');
  }

  return recommendations;
}

// Export revenue analytics service
export const revenueAnalytics = {
  // Initialize and start tracking
  initialize: async () => {
    const store = useRevenueAnalytics.getState();

    // Update metrics on initialization
    await store.updateMetrics();

    // Schedule regular updates (every hour)
    setInterval(
      () => {
        store.updateMetrics();
      },
      60 * 60 * 1000,
    );

    // Track revenue events
    analytics.track('revenue_analytics_initialized', {
      timestamp: Date.now(),
    });
  },

  // Get current metrics
  getMetrics: () => {
    return useRevenueAnalytics.getState().metrics;
  },

  // Get revenue dashboard data
  getDashboard: () => {
    const store = useRevenueAnalytics.getState();
    const metrics = store.metrics;

    return {
      overview: {
        revenue: {
          daily: metrics.dailyRevenue,
          monthly: metrics.monthlyRevenue,
          total: metrics.totalRevenue,
        },
        users: {
          total: metrics.totalUsers,
          paying: metrics.payingUsers,
          dau: metrics.dau,
          mau: metrics.mau,
        },
        metrics: {
          arpu: metrics.arpu,
          arppu: metrics.arppu,
          ltv: metrics.ltv,
          cac: metrics.cac,
        },
      },
      breakdown: {
        bySource: store.getRevenueBySource(),
        byRegion: Array.from(store.getRevenueByRegion().entries()),
        byPlatform: store.getRevenueByPlatform(),
      },
      segments: store.segmentUsers(),
      opportunities: store.identifyRevenueOpportunities(),
      prediction: {
        next7Days: store.predictRevenue(7),
        next30Days: store.predictRevenue(30),
        next90Days: store.predictRevenue(90),
      },
    };
  },
};
