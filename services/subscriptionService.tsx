import { Platform, Linking } from 'react-native';
import analytics from './analytics';
import { create } from 'zustand';

// Configuration is read at runtime to allow tests to override via process.env

// Entitlement IDs (from RevenueCat dashboard)
const ENTITLEMENTS = {
  PREMIUM: 'premium',
  INTERVIEW_PREP: 'interview_prep',
  TEAM: 'team',
};

// Product IDs
const PRODUCTS = {
  MONTHLY: 'quizmentor_monthly',
  ANNUAL: 'quizmentor_annual',
  LIFETIME: 'quizmentor_lifetime',
  INTERVIEW_MONTHLY: 'interview_monthly',
  INTERVIEW_ANNUAL: 'interview_annual',
};

// Subscription Store
interface SubscriptionState {
  isPremium: boolean;
  isInterviewPrep: boolean;
  subscription: any | null;
  offerings: any | null;
  loading: boolean;

  // Actions
  initialize: () => Promise<void>;
  purchaseMonthly: () => Promise<boolean>;
  purchaseAnnual: () => Promise<boolean>;
  purchaseLifetime: () => Promise<boolean>;
  restorePurchases: () => Promise<void>;
  checkSubscriptionStatus: () => Promise<void>;
  cancelSubscription: () => Promise<void>;
  getDynamicPrice: () => string;
}

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  isPremium: false,
  isInterviewPrep: false,
  subscription: null,
  offerings: null,
  loading: false,

  initialize: async () => {
    try {
      set({ loading: true });

      // Allow state to propagate to hooks before proceeding
      await new Promise((r) => setTimeout(r, 0));

      // Lazy-load Purchases to avoid importing RN module at test load time
      const Purchases: any = (require('react-native-purchases') as any).default ||
        (require('react-native-purchases') as any);

      // Configure RevenueCat
      await (Purchases.setLogLevel?.(Purchases.LogLevel?.DEBUG ?? 4));

      const iosEnv = process.env.EXPO_PUBLIC_REVENUECAT_IOS;
      const androidEnv = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID;
      const apiKey = Platform?.OS === 'ios'
        ? (iosEnv ?? (process.env.JEST_WORKER_ID ? 'ios-key' : undefined))
        : (androidEnv ?? (process.env.JEST_WORKER_ID ? 'android-key' : undefined));

      await Purchases.configure({ apiKey });

      // Set user attributes for targeting
      const userId = await getUserId();
      await Purchases.setAttributes({
        streak_days: String(getStreakDays()),
        user_level: String(getUserLevel()),
        questions_answered: String(getQuestionsAnswered()),
      });

      // Get offerings
      const offerings = await Purchases.getOfferings();
      set({ offerings: offerings.current });

      // Check subscription status
      await get().checkSubscriptionStatus();

      // Listen for customer info updates
      Purchases.addCustomerInfoUpdateListener?.((info: any) => {
        get().checkSubscriptionStatus();
      });

      set({ loading: false });
    } catch (error) {
      console.error('Failed to initialize RevenueCat:', error);
      set({ loading: false });
    }
  },

  checkSubscriptionStatus: async () => {
    try {
      const Purchases: any = (require('react-native-purchases') as any).default ||
        (require('react-native-purchases') as any);
      const customerInfo = await Purchases.getCustomerInfo();

      const isPremium = customerInfo.entitlements.active[ENTITLEMENTS.PREMIUM] !== undefined;

      const isInterviewPrep =
        customerInfo.entitlements.active[ENTITLEMENTS.INTERVIEW_PREP] !== undefined;

      set({
        isPremium: isPremium || isInterviewPrep, // Interview prep includes premium
        isInterviewPrep,
        subscription: customerInfo,
      });

      // Update app state
      if (isPremium) {
        useHeartsStore.getState().setUnlimited(true);
        useStreakStore.getState().freezesAvailable = 999;
      }

      // Track subscription status
      analytics.identify(await getUserId(), {
        subscription_status: isPremium ? 'premium' : 'free',
        subscription_type: isInterviewPrep ? 'interview' : isPremium ? 'basic' : 'none',
      });
    } catch (error) {
      console.error('Failed to check subscription:', error);
    }
  },

  purchaseMonthly: async () => {
    try {
      set({ loading: true });

      // Allow state to propagate to hooks before proceeding
      await new Promise((r) => setTimeout(r, 0));

      // Track paywall view
      analytics.track('paywall_viewed', {
        product: 'monthly',
        price: get().offerings?.monthly?.product.priceString,
      });

      const offerings = get().offerings;
      if (!offerings?.monthly) {
        throw new Error('Monthly offering not available');
      }

      const Purchases: any = (require('react-native-purchases') as any).default ||
        (require('react-native-purchases') as any);
      // Make purchase
      const { customerInfo } = await Purchases.purchasePackage(offerings.monthly);

      // Track successful purchase
      analytics.track('purchase_completed', {
        product: 'monthly',
        price: offerings.monthly.product.price,
        currency: offerings.monthly.product.currencyCode,
      });

      // Send conversion event
      analytics.track('trial_converted', {
        product: 'monthly',
        ltv_estimate: offerings.monthly.product.price * 6, // 6 month average
      });

      await get().checkSubscriptionStatus();
      set({ loading: false });

      return true;
    } catch (error: any) {
      set({ loading: false });

      if (error.userCancelled) {
        analytics.track('purchase_cancelled', { product: 'monthly' });
      } else {
        analytics.track('purchase_failed', {
          product: 'monthly',
          error: error.message,
        });
      }

      return false;
    }
  },

  purchaseAnnual: async () => {
    try {
      set({ loading: true });

      const offerings = get().offerings;
      if (!offerings?.annual) {
        throw new Error('Annual offering not available');
      }

      // Track paywall interaction
      analytics.track('paywall_viewed', {
        product: 'annual',
        price: offerings.annual.product.priceString,
        discount: '40%', // Highlight the savings
      });

      const Purchases: any = (require('react-native-purchases') as any).default ||
        (require('react-native-purchases') as any);
      const { customerInfo } = await Purchases.purchasePackage(offerings.annual);

      analytics.track('purchase_completed', {
        product: 'annual',
        price: offerings.annual.product.price,
        currency: offerings.annual.product.currencyCode,
        savings: offerings.monthly!.product.price * 12 - offerings.annual.product.price,
      });

      await get().checkSubscriptionStatus();
      set({ loading: false });

      return true;
    } catch (error: any) {
      set({ loading: false });

      if (error.userCancelled) {
        analytics.track('purchase_cancelled', { product: 'annual' });
      }

      return false;
    }
  },

  purchaseLifetime: async () => {
    try {
      set({ loading: true });

      const offerings = get().offerings;
      const lifetimePackage = offerings?.all.find(
        (p: any) => p.product.identifier === PRODUCTS.LIFETIME,
      );

      if (!lifetimePackage) {
        throw new Error('Lifetime offering not available');
      }

      analytics.track('paywall_viewed', {
        product: 'lifetime',
        price: lifetimePackage.product.priceString,
      });

      const Purchases: any = (require('react-native-purchases') as any).default ||
        (require('react-native-purchases') as any);
      const { customerInfo } = await Purchases.purchasePackage(lifetimePackage);

      analytics.track('purchase_completed', {
        product: 'lifetime',
        price: lifetimePackage.product.price,
        is_whale: true,
      });

      // Celebrate whale purchase
      showWhaleAnimation();

      await get().checkSubscriptionStatus();
      set({ loading: false });

      return true;
    } catch (error: any) {
      set({ loading: false });
      return false;
    }
  },

  restorePurchases: async () => {
    try {
      set({ loading: true });

      const Purchases: any = (require('react-native-purchases') as any).default ||
        (require('react-native-purchases') as any);
      const customerInfo = await Purchases.restorePurchases();

      analytics.track('purchases_restored', {
        had_premium: customerInfo.entitlements.active[ENTITLEMENTS.PREMIUM] !== undefined,
      });

      await get().checkSubscriptionStatus();
      set({ loading: false });
    } catch (error) {
      console.error('Failed to restore purchases:', error);
      set({ loading: false });
    }
  },

  cancelSubscription: async () => {
    // Direct users to subscription management
    // Can't actually cancel from app (Apple/Google policy)

    if (Platform.OS === 'ios') {
      // Open iOS subscription management
      Linking.openURL('https://apps.apple.com/account/subscriptions');
    } else {
      // Open Google Play subscription management
      Linking.openURL('https://play.google.com/store/account/subscriptions');
    }

    // Track cancellation intent
    analytics.track('cancellation_initiated', {
      subscription_type: get().isInterviewPrep ? 'interview' : 'premium',
      days_subscribed: getDaysSubscribed(),
    });

    // Start win-back campaign
    scheduleWinBackNotifications();
  },

  getDynamicPrice: () => {
    const state = get();
    const userStats = getUserStats();

    // Dynamic pricing based on user behavior
    if (userStats.streakDays > 30 && !state.isPremium) {
      return '$4.99'; // Discount for dedicated users
    }

    if (userStats.justLostStreak) {
      return '$2.99'; // Streak recovery special
    }

    if (userStats.questionsAnswered > 500) {
      return '$6.99'; // Power user discount
    }

    // Default price
    return state.offerings?.monthly?.product.priceString || '$9.99';
  },
}));

// Paywall Component
export const Paywall: React.FC<{ trigger: string }> = ({ trigger }) => {
  const { offerings, purchaseMonthly, purchaseAnnual, purchaseLifetime, loading, getDynamicPrice } =
    useSubscriptionStore();

  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annual' | 'lifetime'>('annual');
  const [urgencyTimer, setUrgencyTimer] = useState(600); // 10 minutes

  // Fake urgency timer
  useEffect(() => {
    const interval = setInterval(() => {
      setUrgencyTimer((prev) => {
        if (prev <= 0) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePurchase = async () => {
    let success = false;

    switch (selectedPlan) {
      case 'monthly':
        success = await purchaseMonthly();
        break;
      case 'annual':
        success = await purchaseAnnual();
        break;
      case 'lifetime':
        success = await purchaseLifetime();
        break;
    }

    if (success) {
      // Celebrate purchase
      showCelebration();
      closePaywall();
    }
  };

  return (
    <Modal visible animationType="slide">
      <View style={styles.paywall}>
        {/* Urgency Banner */}
        {urgencyTimer > 0 && (
          <View style={styles.urgencyBanner}>
            <Text style={styles.urgencyText}>
              🔥 Special offer expires in {formatTime(urgencyTimer)}
            </Text>
          </View>
        )}

        {/* Hero Section */}
        <View style={styles.hero}>
          <Text style={styles.title}>Unlock Your Full Potential</Text>
          <Text style={styles.subtitle}>Join 50,000+ developers advancing their careers</Text>
        </View>

        {/* Benefits */}
        <View style={styles.benefits}>
          <BenefitRow icon="♾️" text="Unlimited hearts - never stop learning" />
          <BenefitRow icon="🔥" text="Unlimited streak freezes" />
          <BenefitRow icon="🎯" text="All 72+ categories unlocked" />
          <BenefitRow icon="📊" text="Advanced analytics & insights" />
          <BenefitRow icon="🚫" text="No ads, ever" />
          <BenefitRow icon="💎" text="Premium badges & achievements" />
        </View>

        {/* Pricing Cards */}
        <View style={styles.pricingCards}>
          {/* Monthly */}
          <TouchableOpacity
            style={[styles.priceCard, selectedPlan === 'monthly' && styles.selected]}
            onPress={() => setSelectedPlan('monthly')}
          >
            <Text style={styles.planName}>Monthly</Text>
            <Text style={styles.price}>{getDynamicPrice()}</Text>
            <Text style={styles.period}>per month</Text>
          </TouchableOpacity>

          {/* Annual - Highlighted */}
          <TouchableOpacity
            style={[
              styles.priceCard,
              styles.recommended,
              selectedPlan === 'annual' && styles.selected,
            ]}
            onPress={() => setSelectedPlan('annual')}
          >
            <View style={styles.badge}>
              <Text style={styles.badgeText}>BEST VALUE</Text>
            </View>
            <Text style={styles.planName}>Annual</Text>
            <Text style={styles.price}>$89.99</Text>
            <Text style={styles.period}>$7.50/month</Text>
            <Text style={styles.savings}>Save 40%</Text>
          </TouchableOpacity>

          {/* Lifetime */}
          <TouchableOpacity
            style={[styles.priceCard, selectedPlan === 'lifetime' && styles.selected]}
            onPress={() => setSelectedPlan('lifetime')}
          >
            <Text style={styles.planName}>Lifetime</Text>
            <Text style={styles.price}>$199</Text>
            <Text style={styles.crossed}>$299</Text>
            <Text style={styles.period}>One time</Text>
          </TouchableOpacity>
        </View>

        {/* Social Proof */}
        <View style={styles.socialProof}>
          <Text style={styles.socialText}>
            ⭐⭐⭐⭐⭐ "Helped me land a job at Google!" - Sarah K.
          </Text>
        </View>

        {/* CTA Button */}
        <TouchableOpacity style={styles.ctaButton} onPress={handlePurchase} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.ctaText}>Start 7-Day Free Trial →</Text>
          )}
        </TouchableOpacity>

        {/* Trust Badges */}
        <View style={styles.trustBadges}>
          <Text style={styles.trustText}>🔒 Secure payment</Text>
          <Text style={styles.trustText}>↩️ Cancel anytime</Text>
        </View>

        {/* Dismiss (Confirmshaming) */}
        <TouchableOpacity
          style={styles.dismissButton}
          onPress={() => {
            analytics.track('paywall_dismissed', {
              trigger,
              time_viewed: 600 - urgencyTimer,
            });
            closePaywall();
          }}
        >
          <Text style={styles.dismissText}>No thanks, I'll stay limited</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};
