import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withRepeat,
  Easing,
  runOnJS,
  interpolate,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useStreakStore } from '../store/streakStore';
import { useSubscriptionStore } from '../services/subscriptionServiceMock';

interface StreakDisplayProps {
  onPress?: () => void;
}

export const StreakDisplay: React.FC<StreakDisplayProps> = ({ onPress }) => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const { currentStreak, longestStreak, freezesAvailable, checkStreak, lastActiveDate } =
    useStreakStore();
  const { isPremium } = useSubscriptionStore();

  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);
  const opacity = useSharedValue(1);
  const glowIntensity = useSharedValue(0);

  useEffect(() => {
    checkStreak();
  }, []);

  useEffect(() => {
    // More dramatic animation for higher streaks
    const intensity = Math.min(currentStreak / 10, 3);

    // Pulsing animation
    scale.value = withRepeat(
      withSequence(
        withTiming(1 + 0.2 * intensity, { duration: 600 }),
        withTiming(1, { duration: 600 }),
      ),
      -1,
      true,
    );

    // Wobble animation
    rotation.value = withRepeat(
      withSequence(
        withTiming(5 * intensity, { duration: 1000 }),
        withTiming(-5 * intensity, { duration: 1000 }),
      ),
      -1,
      true,
    );

    // Premium glow effect
    if (isPremium) {
      glowIntensity.value = withRepeat(
        withSequence(withTiming(1, { duration: 1500 }), withTiming(0.3, { duration: 1500 })),
        -1,
        true,
      );
    }

    // Milestone celebration
    if (currentStreak === 7 || currentStreak === 30 || currentStreak === 100) {
      celebrateMilestone();
    }
  }, [currentStreak, isPremium]);

  const celebrateMilestone = () => {
    'worklet';
    runOnJS(Haptics.notificationAsync)(Haptics.NotificationFeedbackType.Success);

    scale.value = withSequence(withSpring(2, { damping: 5 }), withSpring(1, { damping: 10 }));
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { rotate: `${rotation.value}deg` }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    shadowOpacity: interpolate(glowIntensity.value, [0, 1], [0.3, 0.8]),
    shadowRadius: interpolate(glowIntensity.value, [0, 1], [5, 20]),
  }));

  const getFlameColor = () => {
    if (currentStreak >= 365) return '#FF00FF'; // Purple (legendary)
    if (currentStreak >= 100) return '#FFD700'; // Gold
    if (currentStreak >= 30) return '#FF4500'; // Red-orange
    if (currentStreak >= 7) return '#FFA500'; // Orange
    return '#FF6347'; // Tomato
  };

  const getStreakMessage = () => {
    if (currentStreak === 0) return 'Start your streak! 🔥';
    if (currentStreak === 1) return 'Great start! Keep going!';
    if (currentStreak < 7) return `${7 - currentStreak} days to milestone!`;
    if (currentStreak < 30) return "You're on fire! 🔥";
    if (currentStreak < 100) return 'Unstoppable force!';
    if (currentStreak < 365) return 'Quiz Master!';
    return 'LEGENDARY STATUS! 👑';
  };

  const hasCompletedToday = () => {
    if (!lastActiveDate) return false;
    const today = new Date();
    const lastActive = new Date(lastActiveDate);
    return (
      lastActive.getDate() === today.getDate() &&
      lastActive.getMonth() === today.getMonth() &&
      lastActive.getFullYear() === today.getFullYear()
    );
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (currentStreak === 0) {
      // Prompt to start quiz
      onPress?.();
    } else if (freezesAvailable === 0 && !isPremium) {
      // Show premium upsell
      navigation.navigate('Paywall', { source: 'streak_protection' });
    }
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
      <View style={styles.container}>
        <Animated.View style={[styles.flameContainer, animatedStyle, isPremium && glowStyle]}>
          <Text style={[styles.flame, { color: getFlameColor() }]}>🔥</Text>
          <View style={styles.numberContainer}>
            <Text style={[styles.streakNumber, isPremium && styles.premiumNumber]}>
              {currentStreak}
            </Text>
            {currentStreak > 0 && (
              <Text style={styles.dayText}>{currentStreak === 1 ? 'day' : 'days'}</Text>
            )}
          </View>
        </Animated.View>

        <View style={styles.infoContainer}>
          <Text style={styles.message}>{getStreakMessage()}</Text>

          {!isPremium && (
            <View style={styles.freezeContainer}>
              <Text style={styles.freezeText}>❄️ {freezesAvailable} freezes left</Text>
              {freezesAvailable === 0 && (
                <TouchableOpacity
                  style={styles.getMoreButton}
                  onPress={() => navigation.navigate('Paywall', { source: 'freeze_depleted' })}
                >
                  <Text style={styles.getMoreText}>Get More</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {isPremium && (
            <View style={styles.premiumBadge}>
              <Text style={styles.premiumText}>♾️ Unlimited Protection</Text>
            </View>
          )}

          {currentStreak > 0 && currentStreak < longestStreak && (
            <Text style={styles.longestText}>Longest: {longestStreak} days</Text>
          )}
        </View>

        {/* Danger zone - streak at risk */}
        {currentStreak > 0 && !hasCompletedToday() && (
          <Animated.View
            style={[
              styles.dangerBanner,
              { opacity: withRepeat(withTiming(0.5, { duration: 500 }), -1, true) },
            ]}
          >
            <Text style={styles.dangerText}>⚠️ Streak at risk! Complete a quiz today</Text>
          </Animated.View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  flameContainer: {
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#FFA500',
  },
  flame: {
    fontSize: 48,
    marginBottom: -10,
  },
  numberContainer: {
    alignItems: 'center',
  },
  streakNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  premiumNumber: {
    color: '#FFD700',
    textShadowColor: '#FFD700',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  dayText: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: -4,
  },
  infoContainer: {
    alignItems: 'center',
  },
  message: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  freezeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  freezeText: {
    fontSize: 14,
    color: '#6b7280',
  },
  getMoreButton: {
    marginLeft: 8,
    backgroundColor: '#3b82f6',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  getMoreText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  premiumBadge: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 8,
  },
  premiumText: {
    color: '#1f2937',
    fontSize: 12,
    fontWeight: '600',
  },
  longestText: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
  },
  dangerBanner: {
    backgroundColor: '#fee2e2',
    padding: 8,
    borderRadius: 8,
    marginTop: 12,
  },
  dangerText: {
    color: '#dc2626',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});
