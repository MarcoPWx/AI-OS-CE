import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function PaywallScreen() {
  const navigation = useNavigation();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annual' | 'lifetime'>('annual');

  const handlePurchase = () => {
    Alert.alert('🎉 Welcome to Premium!', 'This is a mock purchase. Enjoy unlimited features!', [
      { text: 'Awesome!', onPress: () => navigation.goBack() },
    ]);
  };

  const BenefitRow = ({ icon, text }: { icon: string; text: string }) => (
    <View style={styles.benefitRow}>
      <Text style={styles.benefitIcon}>{icon}</Text>
      <Text style={styles.benefitText}>{text}</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
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
          <Text style={styles.price}>$12.99</Text>
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
          <Text style={styles.period}>One time</Text>
        </TouchableOpacity>
      </View>

      {/* CTA Button */}
      <TouchableOpacity style={styles.ctaButton} onPress={handlePurchase}>
        <Text style={styles.ctaText}>Start 7-Day Free Trial →</Text>
      </TouchableOpacity>

      {/* Trust Badges */}
      <View style={styles.trustBadges}>
        <Text style={styles.trustText}>🔒 Secure payment</Text>
        <Text style={styles.trustText}>↩️ Cancel anytime</Text>
      </View>

      {/* Dismiss */}
      <TouchableOpacity style={styles.dismissButton} onPress={() => navigation.goBack()}>
        <Text style={styles.dismissText}>No thanks, maybe later</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
    marginHorizontal: 12,
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
