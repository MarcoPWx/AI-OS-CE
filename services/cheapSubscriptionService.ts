import { create } from 'zustand';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { persist } from 'zustand/middleware';

// Free alternative to RevenueCat - Direct implementation
// No monthly fees, just Apple/Google's 15-30% cut

interface SubscriptionState {
  isPremium: boolean;
  subscriptionType: 'free' | 'monthly' | 'annual' | 'lifetime' | null;
  expirationDate: number | null;
  purchaseDate: number | null;

  // Actions
  checkSubscription: () => Promise<void>;
  purchaseSubscription: (type: 'monthly' | 'annual' | 'lifetime') => Promise<boolean>;
  restorePurchases: () => Promise<void>;
  cancelSubscription: () => void;
}

// Simplified pricing - START CHEAP
const PRICING = {
  monthly: {
    price: 2.99, // Start very low
    id: {
      ios: 'com.quizmentor.monthly',
      android: 'monthly_subscription',
    },
  },
  annual: {
    price: 19.99, // ~$1.67/month
    id: {
      ios: 'com.quizmentor.annual',
      android: 'annual_subscription',
    },
  },
  lifetime: {
    price: 49.99, // One-time payment
    id: {
      ios: 'com.quizmentor.lifetime',
      android: 'lifetime_purchase',
    },
  },
};

export const useCheapSubscriptionStore = create<SubscriptionState>()(
  persist(
    (set, get) => ({
      isPremium: false,
      subscriptionType: null,
      expirationDate: null,
      purchaseDate: null,

      checkSubscription: async () => {
        // Check if subscription is still valid
        const state = get();

        if (state.subscriptionType === 'lifetime') {
          set({ isPremium: true });
          return;
        }

        if (state.expirationDate) {
          const now = Date.now();
          const isValid = now < state.expirationDate;

          set({ isPremium: isValid });

          if (!isValid) {
            // Subscription expired
            set({
              subscriptionType: null,
              expirationDate: null,
            });
          }
        }
      },

      purchaseSubscription: async (type: 'monthly' | 'annual' | 'lifetime') => {
        try {
          // In production, this would call native payment APIs
          // For now, simulate the purchase
          console.log(`Processing ${type} purchase at $${PRICING[type].price}`);

          const now = Date.now();
          let expirationDate = null;

          if (type === 'monthly') {
            expirationDate = now + 30 * 24 * 60 * 60 * 1000; // 30 days
          } else if (type === 'annual') {
            expirationDate = now + 365 * 24 * 60 * 60 * 1000; // 365 days
          }
          // lifetime has no expiration

          set({
            isPremium: true,
            subscriptionType: type,
            purchaseDate: now,
            expirationDate,
          });

          // Track the purchase (free analytics)
          console.log('Purchase successful:', {
            type,
            price: PRICING[type].price,
            platform: Platform.OS,
          });

          return true;
        } catch (error) {
          console.error('Purchase failed:', error);
          return false;
        }
      },

      restorePurchases: async () => {
        // In production, check with Apple/Google
        // For now, just check local storage
        await get().checkSubscription();
      },

      cancelSubscription: () => {
        // Note: Can't actually cancel from app (Apple/Google policy)
        // This just tracks the intention
        console.log('User initiated cancellation');

        // For subscriptions, they'll expire naturally
        // For now, just log it
      },
    }),
    {
      name: 'cheap-subscription-storage',
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

// Native payment implementation helpers
export const PaymentService = {
  // iOS StoreKit 2 implementation (free)
  async setupIOS() {
    // This would use react-native-iap (free library)
    // npm install react-native-iap
    console.log('Setting up iOS payments with StoreKit');
  },

  // Android Google Play Billing (free)
  async setupAndroid() {
    // This would use react-native-iap (free library)
    console.log('Setting up Android payments with Google Play');
  },

  // Process payment directly without RevenueCat
  async processPurchase(productId: string) {
    // Direct implementation saves $100s-1000s per month
    const platform = Platform.OS;

    if (platform === 'ios') {
      // Use StoreKit directly
      return this.processIOSPurchase(productId);
    } else {
      // Use Google Play Billing directly
      return this.processAndroidPurchase(productId);
    }
  },

  async processIOSPurchase(productId: string) {
    // Direct StoreKit implementation
    console.log('Processing iOS purchase:', productId);
    // Implementation would go here
    return true;
  },

  async processAndroidPurchase(productId: string) {
    // Direct Google Play Billing implementation
    console.log('Processing Android purchase:', productId);
    // Implementation would go here
    return true;
  },
};
