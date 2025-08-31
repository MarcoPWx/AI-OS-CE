// Mock Subscription Service for testing
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SubscriptionState {
  isPremium: boolean;
  isInterviewPrep: boolean;
  expirationDate: Date | null;
  offerings: any | null;
  loading: boolean;
  error: string | null;

  // Actions
  initialize: () => Promise<void>;
  purchaseMonthly: () => Promise<boolean>;
  purchaseAnnual: () => Promise<boolean>;
  purchaseLifetime: () => Promise<boolean>;
  restorePurchases: () => Promise<void>;
  checkSubscriptionStatus: () => Promise<void>;
  cancelSubscription: () => void;
  getDynamicPrice: () => string;
}

export const useSubscriptionStore = create<SubscriptionState>()(
  persist(
    (set, get) => ({
      isPremium: false,
      isInterviewPrep: false,
      expirationDate: null,
      offerings: null,
      loading: false,
      error: null,

      initialize: async () => {
        console.log('🔧 Initializing Mock Subscription Service');
        set({ loading: true });

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Mock offerings
        set({
          offerings: {
            monthly: {
              product: {
                priceString: '$9.99',
                price: 9.99,
              },
            },
            annual: {
              product: {
                priceString: '$89.99',
                price: 89.99,
              },
            },
            lifetime: {
              product: {
                priceString: '$199.99',
                price: 199.99,
              },
            },
          },
          loading: false,
        });

        console.log('✅ Mock Subscription Service initialized');
      },

      purchaseMonthly: async () => {
        console.log('💰 Mock: Processing monthly subscription...');
        set({ loading: true });

        await new Promise((resolve) => setTimeout(resolve, 1500));

        set({
          isPremium: true,
          expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          loading: false,
        });

        console.log('✅ Monthly subscription activated (mock)');
        return true;
      },

      purchaseAnnual: async () => {
        console.log('💰 Mock: Processing annual subscription...');
        set({ loading: true });

        await new Promise((resolve) => setTimeout(resolve, 1500));

        set({
          isPremium: true,
          expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          loading: false,
        });

        console.log('✅ Annual subscription activated (mock)');
        return true;
      },

      purchaseLifetime: async () => {
        console.log('💰 Mock: Processing lifetime subscription...');
        set({ loading: true });

        await new Promise((resolve) => setTimeout(resolve, 1500));

        set({
          isPremium: true,
          expirationDate: null, // No expiration for lifetime
          loading: false,
        });

        console.log('✅ Lifetime subscription activated (mock)');
        return true;
      },

      restorePurchases: async () => {
        console.log('🔄 Mock: Restoring purchases...');
        set({ loading: true });

        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Randomly restore a subscription for testing
        if (Math.random() > 0.5) {
          set({
            isPremium: true,
            expirationDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
          });
          console.log('✅ Purchases restored (mock)');
        } else {
          console.log('❌ No purchases to restore (mock)');
        }

        set({ loading: false });
      },

      checkSubscriptionStatus: async () => {
        const state = get();

        if (state.expirationDate && state.expirationDate < new Date()) {
          // Subscription expired
          set({
            isPremium: false,
            expirationDate: null,
          });
          console.log('⏰ Subscription expired (mock)');
        }
      },

      cancelSubscription: () => {
        console.log('🚫 Mock: Subscription cancellation requested');
        // In production, this would open the platform's subscription management
      },

      getDynamicPrice: () => {
        // Mock dynamic pricing
        const prices = ['$4.99', '$6.99', '$9.99'];
        return prices[Math.floor(Math.random() * prices.length)];
      },
    }),
    {
      name: 'subscription-storage',
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
    },
  ),
);

// Helper function to initialize subscriptions
export async function initializeSubscriptions() {
  const store = useSubscriptionStore.getState();
  await store.initialize();
  await store.checkSubscriptionStatus();
}
