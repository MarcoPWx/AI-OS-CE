import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
  Home: undefined;
  Categories: undefined;
  Quiz: { categorySlug: string; categoryName: string };
  Results: { score: number; total: number; categoryName: string };
  Leaderboard: undefined;
  Paywall: { source: string };
};

type PaywallScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Paywall'>;

export default function PaywallScreen() {
  const navigation = useNavigation<PaywallScreenNavigationProp>();
  const route = useRoute();
  const source = (route.params as any)?.source || 'unknown';

  // Mock subscription functionality for web compatibility
  const [loading, setLoading] = useState(false);
  const isPremium = false; // Always false for demo

  const getDynamicPrice = () => {
    // Simulate dynamic pricing
    const prices = ['$9.99', '$11.99', '$12.99', '$14.99'];
    return prices[Math.floor(Math.random() * prices.length)];
  };

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

  // If already premium, redirect
  useEffect(() => {
    if (isPremium) {
      Alert.alert('Already Premium!', 'You already have premium access!');
      navigation.goBack();
    }
  }, [isPremium]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePurchase = async () => {
    setLoading(true);

    // Simulate purchase delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setLoading(false);

    // Always succeed for demo
    Alert.alert(
      '🎉 Welcome to Premium!',
      'Enjoy unlimited hearts, no ads, and exclusive features!',
      [{ text: 'Awesome!', onPress: () => navigation.goBack() }],
    );
  };

  const BenefitRow = ({ icon, text }: { icon: string; text: string }) => (
    <View style={styles.benefitRow}>
      <Text style={styles.benefitIcon}>{icon}</Text>
      <Text style={styles.benefitText}>{text}</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
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
        <Text style={styles.subtitle}>Join 50,000+ learners advancing their knowledge</Text>
      </View>

      {/* Benefits */}
      <View style={styles.benefits}>
        <BenefitRow icon="♾️" text="Unlimited hearts - never stop learning" />
        <BenefitRow icon="🔥" text="Unlimited streak freezes" />
        <BenefitRow icon="🎯" text="All categories unlocked" />
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
        <Text style={styles.socialText}>⭐⭐⭐⭐⭐ "Helped me learn so much!" - Sarah K.</Text>
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
        <Text style={[styles.trustText, { marginRight: 12 }]}>🔒 Secure payment</Text>
        <Text style={[styles.trustText, { marginLeft: 12 }]}>↩️ Cancel anytime</Text>
      </View>

      {/* Dismiss (Confirmshaming) */}
      <TouchableOpacity
        style={styles.dismissButton}
        onPress={() => {
          Alert.alert(
            '😢 Are you sure?',
            "You'll miss out on unlimited learning and exclusive features...",
            [
              {
                text: 'Stay & Subscribe',
                style: 'cancel',
              },
              {
                text: 'Leave anyway',
                onPress: () => navigation.goBack(),
                style: 'destructive',
              },
            ],
          );
        }}
      >
        <Text style={styles.dismissText}>No thanks, I'll stick with limited features</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  urgencyBanner: {
    backgroundColor: '#ef4444',
    padding: 12,
    alignItems: 'center',
  },
  urgencyText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  hero: {
    padding: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  benefits: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  benefitIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  benefitText: {
    fontSize: 16,
    color: '#4b5563',
    flex: 1,
  },
  pricingCards: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  priceCard: {
    backgroundColor: '#f3f4f6',
    padding: 20,
    borderRadius: 16,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selected: {
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
  },
  recommended: {
    backgroundColor: '#fef3c7',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -12,
    backgroundColor: '#ef4444',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  planName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  price: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  period: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  savings: {
    fontSize: 16,
    color: '#059669',
    fontWeight: 'bold',
    marginTop: 8,
  },
  crossed: {
    fontSize: 20,
    color: '#9ca3af',
    textDecorationLine: 'line-through',
  },
  socialProof: {
    paddingHorizontal: 24,
    marginBottom: 24,
    alignItems: 'center',
  },
  socialText: {
    fontSize: 16,
    color: '#4b5563',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  ctaButton: {
    backgroundColor: '#3b82f6',
    marginHorizontal: 24,
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  ctaText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  trustBadges: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  trustText: {
    fontSize: 14,
    color: '#6b7280',
  },
  dismissButton: {
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 32,
  },
  dismissText: {
    fontSize: 14,
    color: '#9ca3af',
    textDecorationLine: 'underline',
  },
});
