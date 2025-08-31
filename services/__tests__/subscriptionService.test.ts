import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useSubscriptionStore } from '../subscriptionService';
import { Platform, Linking } from 'react-native';
import analytics from '../analytics';

// Provide a lightweight mock for react-native Platform/Linking used in these tests
jest.mock('react-native', () => ({
  Platform: { OS: 'ios' },
  Linking: { openURL: jest.fn() },
}));

// Mock dependencies
jest.mock('react-native-purchases');
// Require the mocked module after jest.mock to avoid loading the real RN module
const Purchases = (require('react-native-purchases') as any).default || require('react-native-purchases');
jest.mock('../analytics', () => ({ __esModule: true, default: { track: jest.fn(), identify: jest.fn() } }));

// Mock helper functions that don't exist yet
global.getUserId = jest.fn(() => 'test-user-123');
global.getStreakDays = jest.fn(() => 7);
global.getUserLevel = jest.fn(() => 5);
global.getQuestionsAnswered = jest.fn(() => 100);
global.getUserStats = jest.fn(() => ({
  streakDays: 7,
  justLostStreak: false,
  questionsAnswered: 100,
}));
global.getDaysSubscribed = jest.fn(() => 30);
global.scheduleWinBackNotifications = jest.fn();
global.showWhaleAnimation = jest.fn();
global.showCelebration = jest.fn();
global.closePaywall = jest.fn();
global.useHeartsStore = {
  getState: jest.fn(() => ({
    setUnlimited: jest.fn(),
  })),
};
global.useStreakStore = {
  getState: jest.fn(() => ({
    freezesAvailable: 2,
  })),
};

describe('Subscription Service', () => {
  const mockCustomerInfo = {
    entitlements: {
      active: {},
    },
  };

  const mockOfferings = {
    current: {
      monthly: {
        product: {
          price: 9.99,
          priceString: '$9.99',
          currencyCode: 'USD',
          identifier: 'quizmentor_monthly',
        },
      },
      annual: {
        product: {
          price: 89.99,
          priceString: '$89.99',
          currencyCode: 'USD',
          identifier: 'quizmentor_annual',
        },
      },
    },
    all: [
      {
        product: {
          identifier: 'quizmentor_lifetime',
          price: 199,
          priceString: '$199',
        },
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Reset store
    useSubscriptionStore.setState({
      isPremium: false,
      isInterviewPrep: false,
      subscription: null,
      offerings: null,
      loading: false,
    });

    // Setup default mocks
    (Purchases.configure as jest.Mock).mockResolvedValue(undefined);
    (Purchases.setLogLevel as jest.Mock).mockResolvedValue(undefined);
    (Purchases.setAttributes as jest.Mock).mockResolvedValue(undefined);
    (Purchases.getOfferings as jest.Mock).mockResolvedValue(mockOfferings);
    (Purchases.getCustomerInfo as jest.Mock).mockResolvedValue(mockCustomerInfo);
    (Purchases.addCustomerInfoUpdateListener as jest.Mock).mockImplementation(() => {});
  });

  describe('initialize', () => {
    it('should configure RevenueCat with correct API key for iOS', async () => {
      Platform.OS = 'ios';
      process.env.EXPO_PUBLIC_REVENUECAT_IOS = 'ios-key';

      const { result } = renderHook(() => useSubscriptionStore());

      await act(async () => {
        await result.current.initialize();
      });

      expect(Purchases.configure).toHaveBeenCalledWith({
        apiKey: 'ios-key',
      });
    });

    it('should configure RevenueCat with correct API key for Android', async () => {
      Platform.OS = 'android';
      process.env.EXPO_PUBLIC_REVENUECAT_ANDROID = 'android-key';

      const { result } = renderHook(() => useSubscriptionStore());

      await act(async () => {
        await result.current.initialize();
      });

      expect(Purchases.configure).toHaveBeenCalledWith({
        apiKey: 'android-key',
      });
    });

    it('should set user attributes', async () => {
      const { result } = renderHook(() => useSubscriptionStore());

      await act(async () => {
        await result.current.initialize();
      });

      expect(Purchases.setAttributes).toHaveBeenCalledWith({
        streak_days: '7',
        user_level: '5',
        questions_answered: '100',
      });
    });

    it('should fetch and store offerings', async () => {
      const { result } = renderHook(() => useSubscriptionStore());

      await act(async () => {
        await result.current.initialize();
      });

      expect(result.current.offerings).toEqual(mockOfferings.current);
    });

    it('should handle initialization errors', async () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation();
      (Purchases.configure as jest.Mock).mockRejectedValue(new Error('Config failed'));

      const { result } = renderHook(() => useSubscriptionStore());

      await act(async () => {
        await result.current.initialize();
      });

      expect(consoleError).toHaveBeenCalledWith(
        'Failed to initialize RevenueCat:',
        expect.any(Error),
      );
      expect(result.current.loading).toBe(false);

      consoleError.mockRestore();
    });
  });

  describe('checkSubscriptionStatus', () => {
    it('should detect premium subscription', async () => {
      const premiumInfo = {
        entitlements: {
          active: {
            premium: { identifier: 'premium' },
          },
        },
      };
      (Purchases.getCustomerInfo as jest.Mock).mockResolvedValue(premiumInfo);

      const { result } = renderHook(() => useSubscriptionStore());

      await act(async () => {
        await result.current.checkSubscriptionStatus();
      });

      expect(result.current.isPremium).toBe(true);
      expect(result.current.isInterviewPrep).toBe(false);
    });

    it('should detect interview prep subscription', async () => {
      const interviewInfo = {
        entitlements: {
          active: {
            interview_prep: { identifier: 'interview_prep' },
          },
        },
      };
      (Purchases.getCustomerInfo as jest.Mock).mockResolvedValue(interviewInfo);

      const { result } = renderHook(() => useSubscriptionStore());

      await act(async () => {
        await result.current.checkSubscriptionStatus();
      });

      expect(result.current.isPremium).toBe(true); // Interview includes premium
      expect(result.current.isInterviewPrep).toBe(true);
    });

    it('should update app state for premium users', async () => {
      const premiumInfo = {
        entitlements: {
          active: {
            premium: { identifier: 'premium' },
          },
        },
      };
      (Purchases.getCustomerInfo as jest.Mock).mockResolvedValue(premiumInfo);

      const setUnlimited = jest.fn();
      global.useHeartsStore.getState = jest.fn(() => ({
        setUnlimited,
      }));

      const { result } = renderHook(() => useSubscriptionStore());

      await act(async () => {
        await result.current.checkSubscriptionStatus();
      });

      expect(setUnlimited).toHaveBeenCalledWith(true);
    });

    it('should track subscription status in analytics', async () => {
      const premiumInfo = {
        entitlements: {
          active: {
            premium: { identifier: 'premium' },
          },
        },
      };
      (Purchases.getCustomerInfo as jest.Mock).mockResolvedValue(premiumInfo);

      const { result } = renderHook(() => useSubscriptionStore());

      await act(async () => {
        await result.current.checkSubscriptionStatus();
      });

      expect(analytics.identify).toHaveBeenCalledWith('test-user-123', {
        subscription_status: 'premium',
        subscription_type: 'basic',
      });
    });
  });

  describe('purchaseMonthly', () => {
    it('should successfully purchase monthly subscription', async () => {
      const { result } = renderHook(() => useSubscriptionStore());

      // Set offerings first
      await act(async () => {
        useSubscriptionStore.setState({ offerings: mockOfferings.current });
      });

      (Purchases.purchasePackage as jest.Mock).mockResolvedValue({
        customerInfo: mockCustomerInfo,
      });

      let success;
      await act(async () => {
        success = await result.current.purchaseMonthly();
      });

      expect(success).toBe(true);
      expect(analytics.track).toHaveBeenCalledWith('paywall_viewed', {
        product: 'monthly',
        price: '$9.99',
      });
      expect(analytics.track).toHaveBeenCalledWith('purchase_completed', {
        product: 'monthly',
        price: 9.99,
        currency: 'USD',
      });
    });

    it('should handle user cancellation', async () => {
      const { result } = renderHook(() => useSubscriptionStore());

      await act(async () => {
        useSubscriptionStore.setState({ offerings: mockOfferings.current });
      });

      const error = { userCancelled: true, message: 'User cancelled' };
      (Purchases.purchasePackage as jest.Mock).mockRejectedValue(error);

      let success;
      await act(async () => {
        success = await result.current.purchaseMonthly();
      });

      expect(success).toBe(false);
      expect(analytics.track).toHaveBeenCalledWith('purchase_cancelled', {
        product: 'monthly',
      });
    });

    it('should handle purchase errors', async () => {
      const { result } = renderHook(() => useSubscriptionStore());

      await act(async () => {
        useSubscriptionStore.setState({ offerings: mockOfferings.current });
      });

      const error = { message: 'Network error' };
      (Purchases.purchasePackage as jest.Mock).mockRejectedValue(error);

      let success;
      await act(async () => {
        success = await result.current.purchaseMonthly();
      });

      expect(success).toBe(false);
      expect(analytics.track).toHaveBeenCalledWith('purchase_failed', {
        product: 'monthly',
        error: 'Network error',
      });
    });

    it('should return false when monthly offering not available', async () => {
      const { result } = renderHook(() => useSubscriptionStore());

      await act(async () => {
        useSubscriptionStore.setState({ offerings: {} });
      });

      let success;
      await act(async () => {
        success = await result.current.purchaseMonthly();
      });

      expect(success).toBe(false);
    });
  });

  describe('purchaseAnnual', () => {
    it('should successfully purchase annual subscription', async () => {
      const { result } = renderHook(() => useSubscriptionStore());

      await act(async () => {
        useSubscriptionStore.setState({ offerings: mockOfferings.current });
      });

      (Purchases.purchasePackage as jest.Mock).mockResolvedValue({
        customerInfo: mockCustomerInfo,
      });

      let success;
      await act(async () => {
        success = await result.current.purchaseAnnual();
      });

      expect(success).toBe(true);
      expect(analytics.track).toHaveBeenCalledWith('purchase_completed', {
        product: 'annual',
        price: 89.99,
        currency: 'USD',
        savings: expect.any(Number),
      });
    });

    it('should calculate savings correctly', async () => {
      const { result } = renderHook(() => useSubscriptionStore());

      await act(async () => {
        useSubscriptionStore.setState({ offerings: mockOfferings.current });
      });

      (Purchases.purchasePackage as jest.Mock).mockResolvedValue({
        customerInfo: mockCustomerInfo,
      });

      await act(async () => {
        await result.current.purchaseAnnual();
      });

      const expectedSavings = 9.99 * 12 - 89.99;
      expect(analytics.track).toHaveBeenCalledWith('purchase_completed', {
        product: 'annual',
        price: 89.99,
        currency: 'USD',
        savings: expectedSavings,
      });
    });
  });

  describe('purchaseLifetime', () => {
    it('should successfully purchase lifetime subscription', async () => {
      const { result } = renderHook(() => useSubscriptionStore());

      await act(async () => {
        useSubscriptionStore.setState({ offerings: mockOfferings });
      });

      (Purchases.purchasePackage as jest.Mock).mockResolvedValue({
        customerInfo: mockCustomerInfo,
      });

      let success;
      await act(async () => {
        success = await result.current.purchaseLifetime();
      });

      expect(success).toBe(true);
      expect(showWhaleAnimation).toHaveBeenCalled();
      expect(analytics.track).toHaveBeenCalledWith('purchase_completed', {
        product: 'lifetime',
        price: 199,
        is_whale: true,
      });
    });

    it('should return false when lifetime offering not available', async () => {
      const { result } = renderHook(() => useSubscriptionStore());

      await act(async () => {
        useSubscriptionStore.setState({ offerings: { all: [] } });
      });

      let success;
      await act(async () => {
        success = await result.current.purchaseLifetime();
      });

      expect(success).toBe(false);
    });
  });

  describe('restorePurchases', () => {
    it('should restore purchases successfully', async () => {
      const restoredInfo = {
        entitlements: {
          active: {
            premium: { identifier: 'premium' },
          },
        },
      };
      (Purchases.restorePurchases as jest.Mock).mockResolvedValue(restoredInfo);

      const { result } = renderHook(() => useSubscriptionStore());

      await act(async () => {
        await result.current.restorePurchases();
      });

      expect(analytics.track).toHaveBeenCalledWith('purchases_restored', {
        had_premium: true,
      });
      expect(result.current.loading).toBe(false);
    });

    it('should handle restore errors', async () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation();
      (Purchases.restorePurchases as jest.Mock).mockRejectedValue(new Error('Restore failed'));

      const { result } = renderHook(() => useSubscriptionStore());

      await act(async () => {
        await result.current.restorePurchases();
      });

      expect(consoleError).toHaveBeenCalledWith('Failed to restore purchases:', expect.any(Error));
      expect(result.current.loading).toBe(false);

      consoleError.mockRestore();
    });
  });

  describe('cancelSubscription', () => {
    it('should open iOS subscription management', async () => {
      Platform.OS = 'ios';

      const { result } = renderHook(() => useSubscriptionStore());

      await act(async () => {
        await result.current.cancelSubscription();
      });

      expect(Linking.openURL).toHaveBeenCalledWith('https://apps.apple.com/account/subscriptions');
    });

    it('should open Android subscription management', async () => {
      Platform.OS = 'android';

      const { result } = renderHook(() => useSubscriptionStore());

      await act(async () => {
        await result.current.cancelSubscription();
      });

      expect(Linking.openURL).toHaveBeenCalledWith(
        'https://play.google.com/store/account/subscriptions',
      );
    });

    it('should track cancellation intent', async () => {
      const { result } = renderHook(() => useSubscriptionStore());

      await act(async () => {
        useSubscriptionStore.setState({ isInterviewPrep: true });
      });

      await act(async () => {
        await result.current.cancelSubscription();
      });

      expect(analytics.track).toHaveBeenCalledWith('cancellation_initiated', {
        subscription_type: 'interview',
        days_subscribed: 30,
      });
      expect(scheduleWinBackNotifications).toHaveBeenCalled();
    });
  });

  describe('getDynamicPrice', () => {
    it('should return discounted price for users with 30+ day streak', () => {
      global.getUserStats.mockReturnValue({
        streakDays: 35,
        justLostStreak: false,
        questionsAnswered: 100,
      });

      const { result } = renderHook(() => useSubscriptionStore());

      const price = result.current.getDynamicPrice();
      expect(price).toBe('$4.99');
    });

    it('should return streak recovery price for users who just lost streak', () => {
      global.getUserStats.mockReturnValue({
        streakDays: 0,
        justLostStreak: true,
        questionsAnswered: 100,
      });

      const { result } = renderHook(() => useSubscriptionStore());

      const price = result.current.getDynamicPrice();
      expect(price).toBe('$2.99');
    });

    it('should return power user price for users with 500+ questions', () => {
      global.getUserStats.mockReturnValue({
        streakDays: 5,
        justLostStreak: false,
        questionsAnswered: 600,
      });

      const { result } = renderHook(() => useSubscriptionStore());

      const price = result.current.getDynamicPrice();
      expect(price).toBe('$6.99');
    });

    it('should return default price when no special conditions', async () => {
      global.getUserStats.mockReturnValue({
        streakDays: 5,
        justLostStreak: false,
        questionsAnswered: 50,
      });

      const { result } = renderHook(() => useSubscriptionStore());

      await act(async () => {
        useSubscriptionStore.setState({ offerings: mockOfferings.current });
      });

      const price = result.current.getDynamicPrice();
      expect(price).toBe('$9.99');
    });
  });

  describe('Loading States', () => {
    it('should set loading state during initialization', async () => {
      const { result } = renderHook(() => useSubscriptionStore());

      let loadingDuringInit = false;
      (Purchases.configure as jest.Mock).mockImplementation(() => {
        loadingDuringInit = result.current.loading;
        return Promise.resolve();
      });

      await act(async () => {
        await result.current.initialize();
      });

      expect(loadingDuringInit).toBe(true);
      expect(result.current.loading).toBe(false);
    });

    it('should set loading state during purchase', async () => {
      const { result } = renderHook(() => useSubscriptionStore());

      await act(async () => {
        useSubscriptionStore.setState({ offerings: mockOfferings.current });
      });

      let loadingDuringPurchase = false;
      (Purchases.purchasePackage as jest.Mock).mockImplementation(() => {
        loadingDuringPurchase = result.current.loading;
        return Promise.resolve({ customerInfo: mockCustomerInfo });
      });

      await act(async () => {
        await result.current.purchaseMonthly();
      });

      expect(loadingDuringPurchase).toBe(true);
      expect(result.current.loading).toBe(false);
    });
  });
});
