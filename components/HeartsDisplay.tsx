import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Alert } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useHeartsStore } from '../store/heartsStore';
import { useSubscriptionStore } from '../services/subscriptionServiceMock';
import { adService } from '../services/adServiceMock';

export const HeartsDisplay: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const { hearts, maxHearts, isUnlimited, regenerateHearts, getTimeUntilNextHeart, addHearts } =
    useHeartsStore();
  const { isPremium } = useSubscriptionStore();

  const [timeUntilNext, setTimeUntilNext] = useState(0);
  const [showNoHeartsModal, setShowNoHeartsModal] = useState(false);

// Single Heart item to hold its own animated values (avoids hooks in loops)
  const HeartItem: React.FC<{ filled: boolean }> = ({ filled }) => {
    const scale = useSharedValue(1);
    const rotation = useSharedValue(0);
    const opacity = useSharedValue(1);
    const translateY = useSharedValue(0);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [
        { scale: scale.value },
        { rotate: `${rotation.value}deg` },
        { translateY: translateY.value },
      ],
      opacity: opacity.value,
    }));

    return (
      <Animated.View style={[styles.heartWrapper, animatedStyle]}>
        <Text style={styles.heart}>{filled ? '❤️' : '🖤'}</Text>
      </Animated.View>
    );
  };

  // Update timer
  useEffect(() => {
    const interval = setInterval(() => {
      regenerateHearts();
      setTimeUntilNext(getTimeUntilNextHeart());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

// (Optional) heart loss animation could be implemented via events/state if needed.

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleHeartTap = () => {
    if (isUnlimited) {
      // Show premium flex
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      return;
    }

    if (hearts === 0) {
      setShowNoHeartsModal(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  // Premium unlimited display
  if (isUnlimited || isPremium) {
    return (
      <TouchableOpacity onPress={handleHeartTap} style={styles.container}>
        <View style={styles.premiumContainer}>
          <Text style={styles.infinitySymbol}>♾️</Text>
          <Text style={styles.premiumText}>Unlimited</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <>
      <TouchableOpacity onPress={handleHeartTap} style={styles.container}>
        <View style={styles.heartsContainer}>
          {Array(maxHearts)
            .fill(0)
            .map((_, index) => (
              <HeartItem key={index} filled={index < hearts} />
            ))}
        </View>

        {hearts < maxHearts && (
          <View style={styles.regenContainer}>
            <Text style={styles.regenText}>Next ❤️ in {formatTime(timeUntilNext)}</Text>
          </View>
        )}

        {hearts === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Out of hearts! 😢</Text>
            <TouchableOpacity
              style={styles.getHeartsButton}
              onPress={() => setShowNoHeartsModal(true)}
            >
              <Text style={styles.getHeartsText}>Get More</Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>

      {/* No Hearts Modal - Aggressive Upsell */}
      <Modal visible={showNoHeartsModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalEmoji}>💔</Text>
            <Text style={styles.modalTitle}>Out of Hearts!</Text>
            <Text style={styles.modalSubtitle}>
              Your learning journey doesn't have to stop here
            </Text>

            <View style={styles.optionsContainer}>
              {/* Watch Ad Option */}
              <TouchableOpacity
                style={styles.optionCard}
                onPress={async () => {
                  // Watch ad logic
                  setShowNoHeartsModal(false);
                  const success = await adService.showRewardedAd({
                    type: 'hearts',
                    amount: 1,
                  });
                  if (success) {
                    addHearts(1);
                  }
                }}
              >
                <Text style={styles.optionEmoji}>📺</Text>
                <Text style={styles.optionTitle}>Watch Ad</Text>
                <Text style={styles.optionDesc}>+1 Heart</Text>
              </TouchableOpacity>

              {/* Wait Option */}
              <TouchableOpacity
                style={[styles.optionCard, styles.waitOption]}
                onPress={() => setShowNoHeartsModal(false)}
              >
                <Text style={styles.optionEmoji}>⏰</Text>
                <Text style={styles.optionTitle}>Wait</Text>
                <Text style={styles.optionDesc}>{formatTime(timeUntilNext)}</Text>
              </TouchableOpacity>

              {/* Premium Option - Highlighted */}
              <TouchableOpacity
                style={[styles.optionCard, styles.premiumOption]}
                onPress={() => {
                  setShowNoHeartsModal(false);
                  navigation.navigate('Paywall', { source: 'out_of_hearts' });
                }}
              >
                <View style={styles.premiumBadge}>
                  <Text style={styles.premiumBadgeText}>BEST VALUE</Text>
                </View>
                <Text style={styles.optionEmoji}>♾️</Text>
                <Text style={styles.premiumOptionTitle}>Go Premium</Text>
                <Text style={styles.premiumOptionDesc}>Unlimited Forever</Text>
                <Text style={styles.priceText}>From $7.50/mo</Text>
              </TouchableOpacity>
            </View>

            {/* Guilt Trip */}
            <Text style={styles.guiltText}>
              🎯 Sarah just completed 5 quizzes while you're waiting...
            </Text>

            <TouchableOpacity
              style={styles.dismissButton}
              onPress={() => setShowNoHeartsModal(false)}
            >
              <Text style={styles.dismissText}>I'll wait...</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  heartsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heartWrapper: {
    marginHorizontal: 2,
  },
  heart: {
    fontSize: 28,
  },
  premiumContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infinitySymbol: {
    fontSize: 32,
    marginRight: 8,
  },
  premiumText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  regenContainer: {
    marginTop: 8,
    alignItems: 'center',
  },
  regenText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  emptyContainer: {
    marginTop: 8,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#dc2626',
    fontWeight: '600',
    marginBottom: 8,
  },
  getHeartsButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 14,
  },
  getHeartsText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
  },
  modalEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  optionsContainer: {
    width: '100%',
    marginBottom: 16,
  },
  optionCard: {
    backgroundColor: '#f3f4f6',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  waitOption: {
    backgroundColor: '#fef3c7',
  },
  premiumOption: {
    backgroundColor: 'linear-gradient(135deg, #FFD700, #FFA500)',
    borderWidth: 2,
    borderColor: '#FFD700',
    position: 'relative',
  },
  premiumBadge: {
    position: 'absolute',
    top: -10,
    right: 10,
    backgroundColor: '#ef4444',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  premiumBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  optionEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  optionDesc: {
    fontSize: 14,
    color: '#6b7280',
  },
  premiumOptionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  premiumOptionDesc: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  priceText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#059669',
    marginTop: 4,
  },
  guiltText: {
    fontSize: 13,
    color: '#6b7280',
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 16,
  },
  dismissButton: {
    paddingVertical: 12,
  },
  dismissText: {
    fontSize: 14,
    color: '#9ca3af',
    textDecorationLine: 'underline',
  },
});
