import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Animated, Modal, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useDailyChallengeStore } from '../store/dailyChallengeStore';
import { useSubscriptionStore } from '../services/subscriptionServiceMock';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

const { width, height } = Dimensions.get('window');

export const DailyChallengeCard = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const {
    currentChallenge,
    activeUntil,
    questionsCompleted,
    startChallenge,
    getTimeRemaining,
    checkExpiration,
    consecutiveDays,
  } = useDailyChallengeStore();

  const { isPremium } = useSubscriptionStore();

  const [timeRemaining, setTimeRemaining] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const pulseAnim = new Animated.Value(1);
  const shakeAnim = new Animated.Value(0);
  const glowAnim = new Animated.Value(0);

  useEffect(() => {
    // Update countdown every second
    const timer = setInterval(() => {
      const remaining = getTimeRemaining();
      setTimeRemaining(remaining);

      if (remaining > 0 && remaining <= 60) {
        // Urgent shake when less than 1 minute
        Animated.sequence([
          Animated.timing(shakeAnim, {
            toValue: 10,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(shakeAnim, {
            toValue: -10,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(shakeAnim, {
            toValue: 0,
            duration: 100,
            useNativeDriver: true,
          }),
        ]).start();
      }

      checkExpiration();
    }, 1000);

    return () => clearInterval(timer);
  }, [activeUntil]);

  useEffect(() => {
    // Continuous pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    // Glow animation for urgency
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  if (!currentChallenge) return null;

  const isActive = activeUntil && new Date() < new Date(activeUntil);
  const isCompleted = currentChallenge.completedAt;
  const isPremiumChallenge = currentChallenge.isPremiumOnly;
  const canStart = !isPremiumChallenge || isPremium;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    return (questionsCompleted / currentChallenge.questionsRequired) * 100;
  };

  const handlePress = () => {
    if (isCompleted) {
      setShowModal(true);
      return;
    }

    if (!canStart) {
      // Show premium upsell
      navigation.navigate('Paywall', { source: 'daily_challenge' });
      return;
    }

    if (!isActive) {
      startChallenge();
      navigation.navigate('Quiz' as any, {
        categorySlug: 'daily-challenge',
        categoryName: 'Daily Challenge',
        challenge: true,
      });
    } else {
      navigation.navigate('Quiz' as any, {
        categorySlug: 'daily-challenge',
        categoryName: 'Daily Challenge',
        challenge: true,
      });
    }
  };

  return (
    <>
      <Animated.View
        style={{
          transform: [{ scale: pulseAnim }, { translateX: shakeAnim }],
          marginHorizontal: 20,
          marginVertical: 10,
        }}
      >
        <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
          <LinearGradient
            colors={
              isCompleted
                ? ['#10b981', '#059669']
                : isPremiumChallenge && !isPremium
                  ? ['#8b5cf6', '#7c3aed']
                  : timeRemaining <= 60 && isActive
                    ? ['#ef4444', '#dc2626'] // Red for urgency
                    : ['#f59e0b', '#d97706']
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              padding: 20,
              borderRadius: 20,
              elevation: 10,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
            }}
          >
            {/* Glow overlay for urgency */}
            {isActive && timeRemaining <= 300 && (
              <Animated.View
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  borderRadius: 20,
                  backgroundColor: 'rgba(239, 68, 68, 0.3)',
                  opacity: glowAnim,
                }}
              />
            )}

            {/* Header */}
            <View className="flex-row justify-between items-center mb-3">
              <View className="flex-row items-center">
                <Text className="text-white text-2xl font-bold">{currentChallenge.title}</Text>
                {isPremiumChallenge && !isPremium && (
                  <View className="ml-2 bg-yellow-400 px-2 py-1 rounded">
                    <Text className="text-black text-xs font-bold">PRO</Text>
                  </View>
                )}
              </View>

              {consecutiveDays > 0 && (
                <View className="bg-white/20 px-3 py-1 rounded-full">
                  <Text className="text-white font-bold">{consecutiveDays} day streak</Text>
                </View>
              )}
            </View>

            {/* Description */}
            <Text className="text-white/90 mb-4">{currentChallenge.description}</Text>

            {/* Rewards */}
            <View className="flex-row justify-around mb-4">
              <View className="items-center">
                <Text className="text-white text-2xl font-bold">
                  {currentChallenge.xpMultiplier}x
                </Text>
                <Text className="text-white/70 text-xs">XP BOOST</Text>
              </View>
              <View className="items-center">
                <Text className="text-white text-2xl font-bold">
                  +{currentChallenge.heartsReward}
                </Text>
                <Text className="text-white/70 text-xs">HEARTS</Text>
              </View>
              <View className="items-center">
                <Text className="text-white text-2xl font-bold">
                  +{currentChallenge.streakBonus}
                </Text>
                <Text className="text-white/70 text-xs">STREAK</Text>
              </View>
            </View>

            {/* Progress or Timer */}
            {isActive ? (
              <View>
                {/* Progress Bar */}
                <View className="bg-white/20 h-8 rounded-full overflow-hidden mb-2">
                  <View
                    className="bg-white h-full rounded-full items-center justify-center"
                    style={{ width: `${getProgressPercentage()}%` }}
                  >
                    <Text className="text-black text-xs font-bold">
                      {questionsCompleted}/{currentChallenge.questionsRequired}
                    </Text>
                  </View>
                </View>

                {/* Timer */}
                <View className="items-center">
                  <Text
                    className={`font-bold text-3xl ${
                      timeRemaining <= 60 ? 'text-red-200' : 'text-white'
                    }`}
                  >
                    {formatTime(timeRemaining)}
                  </Text>
                  {timeRemaining <= 60 && (
                    <Text className="text-red-200 text-xs animate-pulse">
                      HURRY! TIME IS RUNNING OUT!
                    </Text>
                  )}
                </View>
              </View>
            ) : isCompleted ? (
              <View className="items-center">
                <Text className="text-white text-xl font-bold">✅ COMPLETED!</Text>
                <Text className="text-white/70 text-sm">Tap to claim rewards</Text>
              </View>
            ) : (
              <TouchableOpacity
                className="bg-white rounded-full py-3 items-center"
                onPress={handlePress}
              >
                <Text className="text-gray-900 font-bold text-lg">
                  {!canStart ? '🔒 UNLOCK WITH PREMIUM' : 'START CHALLENGE →'}
                </Text>
              </TouchableOpacity>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

      {/* Completion Modal */}
      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <View className="flex-1 bg-black/80 justify-center items-center">
          <Animated.View
            style={{
              transform: [{ scale: pulseAnim }],
            }}
            className="bg-white rounded-3xl p-8 mx-4 items-center"
          >
            <Text className="text-6xl mb-4">🎉</Text>
            <Text className="text-2xl font-bold mb-2">Challenge Complete!</Text>
            <Text className="text-gray-600 text-center mb-6">You've earned amazing rewards!</Text>

            <View className="mb-6">
              <View className="flex-row items-center mb-2">
                <Text className="text-lg">💰 </Text>
                <Text className="text-lg font-bold">
                  {questionsCompleted * 10 * currentChallenge.xpMultiplier} XP
                </Text>
              </View>
              <View className="flex-row items-center mb-2">
                <Text className="text-lg">❤️ </Text>
                <Text className="text-lg font-bold">+{currentChallenge.heartsReward} Hearts</Text>
              </View>
              <View className="flex-row items-center">
                <Text className="text-lg">🔥 </Text>
                <Text className="text-lg font-bold">
                  +{currentChallenge.streakBonus} Streak Days
                </Text>
              </View>
            </View>

            <TouchableOpacity
              className="bg-green-500 px-8 py-3 rounded-full"
              onPress={() => {
                useDailyChallengeStore.getState().claimRewards();
                setShowModal(false);
              }}
            >
              <Text className="text-white font-bold text-lg">CLAIM REWARDS</Text>
            </TouchableOpacity>

            <Text className="text-gray-500 text-xs mt-4">
              Come back tomorrow for a new challenge!
            </Text>
          </Animated.View>
        </View>
      </Modal>
    </>
  );
};
