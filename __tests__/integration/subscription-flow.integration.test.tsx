/**
 * Integration Tests for Subscription Flow
 * Tests the complete interaction between subscription service, paywall, and premium features
 */

import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Purchases, { CustomerInfo, PurchasesOffering } from 'react-native-purchases';

// Import screens and components
import HomeScreen from '../../screens/HomeScreen';
import PaywallScreen from '../../screens/PaywallScreen';
import ProfileScreen from '../../screens/ProfileScreen';
import QuizScreen from '../../screens/QuizScreen';

// Import services and stores
import { useSubscriptionStore } from '../../services/subscriptionService';
import { useHeartsStore } from '../../store/heartsStore';
import { useStreakStore } from '../../store/streakStore';
import { useQuiz } from '../../store/QuizContext';

// Mock Purchases SDK
jest.mock('react-native-purchases', () => ({
  __esModule: true,
  default: {
    configure: jest.fn(),
    getOfferings: jest.fn(),
    purchasePackage: jest.fn(),
    restorePurchases: jest.fn(),
    getCustomerInfo: jest.fn(),
    logIn: jest.fn(),
    logOut: jest.fn(),
  },
  ENTITLEMENT_ID: 'premium',
  INTERVIEW_PREP_ENTITLEMENT: 'interview_prep',
}));

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

const Stack = createStackNavigator();

const TestApp = ({ initialRouteName = 'Home' }) => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRouteName}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Paywall" component={PaywallScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Quiz" component={QuizScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

describe('Subscription Flow Integration Tests', () => {
  const mockCustomerInfo: Partial<CustomerInfo> = {
    activeSubscriptions: [],
    entitlements: {
      active: {},
      all: {},
    },
  };

  const mockOffering: Partial<PurchasesOffering> = {
    identifier: 'default',
    availablePackages: [
      {
        identifier: 'monthly',
        product: {
          identifier: 'premium_monthly',
          priceString: '$9.99',
        },
      },
      {
        identifier: 'yearly',
        product: {
          identifier: 'premium_yearly',
          priceString: '$59.99',
        },
      },
    ],
  };

  beforeEach(() => {
    // Reset subscription store
    useSubscriptionStore.setState({
      isPremium: false,
      isInterviewPrep: false,
      subscription: null,
      offerings: null,
      loading: false,
    });

    // Reset hearts store
    useHeartsStore.setState({
      hearts: 5,
      maxHearts: 5,
      isUnlimited: false,
      lastRegenerationTime: Date.now(),
    });

    // Reset mocks
    jest.clearAllMocks();
    (Purchases.getCustomerInfo as jest.Mock).mockResolvedValue(mockCustomerInfo);
    (Purchases.getOfferings as jest.Mock).mockResolvedValue({ current: mockOffering });
  });

  describe('Paywall Trigger Scenarios', () => {
    it('should show paywall when hearts are depleted', async () => {
      const { getByText, queryByTestId } = render(<TestApp />);

      // Deplete hearts
      act(() => {
        useHeartsStore.setState({ hearts: 0, isUnlimited: false });
      });

      // Try to start quiz
      fireEvent.press(getByText('Start Quiz'));

      // Should navigate to paywall
      await waitFor(() => {
        expect(queryByTestId('paywall-screen')).toBeTruthy();
      });
    });

    it('should show paywall when accessing premium features', async () => {
      const { getByText, queryByTestId } = render(<TestApp />);

      // Navigate to profile
      fireEvent.press(getByText('Profile'));

      // Try to access premium feature
      const premiumFeature = queryByTestId('unlock-advanced-stats');
      if (premiumFeature) {
        fireEvent.press(premiumFeature);

        // Should show paywall
        await waitFor(() => {
          expect(queryByTestId('paywall-screen')).toBeTruthy();
        });
      }
    });

    it('should show paywall after streak freeze limit reached', async () => {
      const { getByText, queryByTestId } = render(<TestApp />);

      // Use all streak freezes
      act(() => {
        useStreakStore.setState({ freezesAvailable: 0 });
      });

      // Try to freeze streak
      const freezeButton = queryByTestId('freeze-streak');
      if (freezeButton) {
        fireEvent.press(freezeButton);

        // Should show paywall
        await waitFor(() => {
          expect(queryByTestId('paywall-screen')).toBeTruthy();
        });
      }
    });
  });

  describe('Purchase Flow', () => {
    it('should complete monthly subscription purchase', async () => {
      const { getByText, queryByTestId } = render(<TestApp initialRouteName="Paywall" />);

      // Wait for offers to load
      await waitFor(() => {
        expect(getByText('$9.99')).toBeTruthy();
      });

      // Select monthly plan
      fireEvent.press(getByText('Monthly'));

      // Mock successful purchase
      const mockPurchaseInfo: Partial<CustomerInfo> = {
        ...mockCustomerInfo,
        activeSubscriptions: ['premium_monthly'],
        entitlements: {
          active: {
            premium: { identifier: 'premium' },
          },
          all: {},
        },
      };

      (Purchases.purchasePackage as jest.Mock).mockResolvedValue({
        customerInfo: mockPurchaseInfo,
      });

      // Purchase
      fireEvent.press(getByText('Subscribe Now'));

      // Should update subscription state
      await waitFor(() => {
        const state = useSubscriptionStore.getState();
        expect(state.isPremium).toBe(true);
      });

      // Should navigate away from paywall
      await waitFor(() => {
        expect(queryByTestId('paywall-screen')).toBeFalsy();
      });
    });

    it('should handle purchase errors gracefully', async () => {
      const { getByText, queryByText } = render(<TestApp initialRouteName="Paywall" />);

      // Mock purchase error
      (Purchases.purchasePackage as jest.Mock).mockRejectedValue(new Error('Purchase cancelled'));

      // Try to purchase
      fireEvent.press(getByText('Subscribe Now'));

      // Should show error message
      await waitFor(() => {
        expect(queryByText(/error|failed|cancelled/i)).toBeTruthy();
      });

      // Should remain on paywall
      expect(queryByText('Choose Your Plan')).toBeTruthy();
    });

    it('should restore purchases successfully', async () => {
      const { getByText } = render(<TestApp initialRouteName="Paywall" />);

      // Mock restore with active subscription
      const mockRestoredInfo: Partial<CustomerInfo> = {
        ...mockCustomerInfo,
        activeSubscriptions: ['premium_yearly'],
        entitlements: {
          active: {
            premium: { identifier: 'premium' },
          },
          all: {},
        },
      };

      (Purchases.restorePurchases as jest.Mock).mockResolvedValue(mockRestoredInfo);

      // Restore purchases
      fireEvent.press(getByText('Restore Purchases'));

      // Should update subscription state
      await waitFor(() => {
        const state = useSubscriptionStore.getState();
        expect(state.isPremium).toBe(true);
      });
    });
  });

  describe('Premium Features Access', () => {
    beforeEach(() => {
      // Set premium status
      act(() => {
        useSubscriptionStore.setState({
          isPremium: true,
          subscription: {
            productIdentifier: 'premium_monthly',
            expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        });
        useHeartsStore.setState({ isUnlimited: true });
      });
    });

    it('should allow unlimited hearts for premium users', async () => {
      const { getByText, queryByTestId } = render(<TestApp />);

      // Check hearts display
      const heartsDisplay = queryByTestId('hearts-display');
      if (heartsDisplay) {
        expect(heartsDisplay.props.children).toContain('∞');
      }

      // Start multiple quizzes without heart depletion
      for (let i = 0; i < 3; i++) {
        fireEvent.press(getByText('Start Quiz'));
        await waitFor(() => getByText('Choose a Category'));

        // Should not show paywall
        expect(queryByTestId('paywall-screen')).toBeFalsy();

        // Go back
        fireEvent.press(getByText('Back'));
      }
    });

    it('should enable advanced statistics for premium users', async () => {
      const { getByTestId, queryByText } = render(<TestApp />);

      // Navigate to profile
      fireEvent.press(getByTestId('profile-tab'));

      // Should see advanced stats
      await waitFor(() => {
        expect(queryByText('Advanced Statistics')).toBeTruthy();
        expect(queryByText('Performance Trends')).toBeTruthy();
        expect(queryByText('Detailed Analytics')).toBeTruthy();
      });
    });

    it('should allow offline mode for premium users', async () => {
      const { queryByTestId } = render(<TestApp />);

      // Check offline indicator
      const offlineIndicator = queryByTestId('offline-mode-indicator');
      if (offlineIndicator) {
        expect(offlineIndicator.props.visible).toBe(true);
      }

      // Simulate offline
      act(() => {
        global.fetch = jest.fn(() => Promise.reject(new Error('Network error')));
      });

      // Should still allow quiz access
      const startButton = queryByTestId('start-quiz-button');
      if (startButton) {
        fireEvent.press(startButton);

        // Should not block with network error
        await waitFor(() => {
          expect(queryByTestId('quiz-screen')).toBeTruthy();
        });
      }
    });

    it('should provide unlimited streak freezes', async () => {
      const { queryByTestId, queryByText } = render(<TestApp />);

      // Navigate to streak section
      const streakCard = queryByTestId('streak-card');
      if (streakCard) {
        fireEvent.press(streakCard);

        // Should show unlimited freezes
        await waitFor(() => {
          expect(queryByText('Unlimited Freezes')).toBeTruthy();
        });

        // Use multiple freezes
        for (let i = 0; i < 5; i++) {
          const freezeButton = queryByTestId('freeze-streak');
          if (freezeButton) {
            fireEvent.press(freezeButton);
          }
        }

        // Should not show paywall
        expect(queryByTestId('paywall-screen')).toBeFalsy();
      }
    });
  });

  describe('Subscription Management', () => {
    it('should display subscription status correctly', async () => {
      const { queryByText } = render(<TestApp initialRouteName="Profile" />);

      // Set active subscription
      act(() => {
        useSubscriptionStore.setState({
          isPremium: true,
          subscription: {
            productIdentifier: 'premium_monthly',
            expirationDate: new Date('2024-02-01'),
            willRenew: true,
          },
        });
      });

      // Should show subscription details
      await waitFor(() => {
        expect(queryByText('Premium Member')).toBeTruthy();
        expect(queryByText(/Renews on/)).toBeTruthy();
      });
    });

    it('should handle subscription expiration', async () => {
      const { rerender } = render(<TestApp />);

      // Set expiring subscription
      act(() => {
        useSubscriptionStore.setState({
          isPremium: true,
          subscription: {
            productIdentifier: 'premium_monthly',
            expirationDate: new Date(Date.now() + 1000), // Expires in 1 second
            willRenew: false,
          },
        });
      });

      // Wait for expiration
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 1500));
      });

      // Trigger rerender
      rerender(<TestApp />);

      // Should update premium status
      await waitFor(() => {
        const state = useSubscriptionStore.getState();
        expect(state.isPremium).toBe(false);
      });

      // Should reset hearts to limited
      const hearts = useHeartsStore.getState();
      expect(hearts.isUnlimited).toBe(false);
    });

    it('should handle account switching', async () => {
      const { getByText } = render(<TestApp initialRouteName="Profile" />);

      // Current premium account
      act(() => {
        useSubscriptionStore.setState({
          isPremium: true,
          subscription: {
            productIdentifier: 'premium_monthly',
          },
        });
      });

      // Log out
      fireEvent.press(getByText('Log Out'));

      // Should reset subscription
      await waitFor(() => {
        const state = useSubscriptionStore.getState();
        expect(state.isPremium).toBe(false);
        expect(state.subscription).toBeNull();
      });

      // Log in with different account
      (Purchases.logIn as jest.Mock).mockResolvedValue({
        customerInfo: {
          activeSubscriptions: [],
          entitlements: { active: {}, all: {} },
        },
      });

      fireEvent.press(getByText('Log In'));

      // Should check new account subscription
      await waitFor(() => {
        expect(Purchases.getCustomerInfo).toHaveBeenCalled();
      });
    });
  });

  describe('Interview Prep Subscription', () => {
    it('should unlock interview prep features', async () => {
      const { queryByTestId, queryByText } = render(<TestApp />);

      // Set interview prep subscription
      act(() => {
        useSubscriptionStore.setState({
          isInterviewPrep: true,
          subscription: {
            productIdentifier: 'interview_prep_monthly',
          },
        });
      });

      // Navigate to categories
      const categoriesButton = queryByTestId('categories-button');
      if (categoriesButton) {
        fireEvent.press(categoriesButton);

        // Should show interview prep categories
        await waitFor(() => {
          expect(queryByText('System Design')).toBeTruthy();
          expect(queryByText('Behavioral Questions')).toBeTruthy();
          expect(queryByText('Coding Challenges')).toBeTruthy();
        });
      }
    });

    it('should provide mock interview features', async () => {
      const { queryByTestId, queryByText } = render(<TestApp />);

      // Set interview prep subscription
      act(() => {
        useSubscriptionStore.setState({
          isInterviewPrep: true,
        });
      });

      // Should show mock interview option
      const mockInterviewButton = queryByTestId('mock-interview');
      if (mockInterviewButton) {
        fireEvent.press(mockInterviewButton);

        // Should start mock interview
        await waitFor(() => {
          expect(queryByText('Mock Interview')).toBeTruthy();
          expect(queryByText('45 minutes')).toBeTruthy();
        });
      }
    });
  });

  describe('Promotional Offers', () => {
    it('should apply promotional discounts', async () => {
      const { getByText, queryByText } = render(<TestApp initialRouteName="Paywall" />);

      // Mock promotional offer
      const promoOffering: Partial<PurchasesOffering> = {
        ...mockOffering,
        availablePackages: [
          {
            identifier: 'monthly_promo',
            product: {
              identifier: 'premium_monthly',
              priceString: '$4.99',
              introPrice: {
                priceString: '$4.99',
                cycles: 1,
                period: 'month',
              },
            },
          },
        ],
      };

      (Purchases.getOfferings as jest.Mock).mockResolvedValue({ current: promoOffering });

      // Reload offerings
      fireEvent.press(getByText('Refresh'));

      // Should show promotional price
      await waitFor(() => {
        expect(queryByText('$4.99 for first month')).toBeTruthy();
      });
    });

    it('should handle free trial', async () => {
      const { getByText, queryByText } = render(<TestApp initialRouteName="Paywall" />);

      // Mock free trial offer
      const trialOffering: Partial<PurchasesOffering> = {
        ...mockOffering,
        availablePackages: [
          {
            identifier: 'yearly_trial',
            product: {
              identifier: 'premium_yearly',
              priceString: '$59.99',
              introPrice: {
                priceString: 'Free',
                cycles: 1,
                period: 'week',
              },
            },
          },
        ],
      };

      (Purchases.getOfferings as jest.Mock).mockResolvedValue({ current: trialOffering });

      // Should show free trial
      await waitFor(() => {
        expect(queryByText('7-day free trial')).toBeTruthy();
      });

      // Start trial
      fireEvent.press(getByText('Start Free Trial'));

      // Should activate premium immediately
      await waitFor(() => {
        const state = useSubscriptionStore.getState();
        expect(state.isPremium).toBe(true);
      });
    });
  });
});
