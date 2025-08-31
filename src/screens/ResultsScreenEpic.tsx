import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Dimensions,
  ScrollView,
  Platform,
  Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
// import { useNavigation } from '@react-navigation/native'; // Removed - using callback props
import * as Haptics from 'expo-haptics';
import soundEffectsService from '../services/soundEffects';
import { ParticleExplosion, useParticleExplosion } from '../components/ParticleExplosion';
import { colors as themeColors } from '../design/theme';

const { width, height } = Dimensions.get('window');

interface ResultsScreenEpicProps {
  route?: any;
  score?: number;
  totalQuestions?: number;
  category?: string;
  onGoHome?: () => void;
  onRetry?: () => void;
}

export default function ResultsScreenEpic({
  route,
  score: scoreProp,
  totalQuestions: totalQuestionsProp,
  category: categoryProp,
  onGoHome,
  onRetry,
}: ResultsScreenEpicProps) {
  // const navigation = useNavigation(); // Removed - using callback props
  const score = scoreProp ?? route?.params?.score ?? 0;
  const totalQuestions = totalQuestionsProp ?? route?.params?.totalQuestions ?? 10;
  const category = categoryProp ?? route?.params?.category ?? 'General';
  const { explosion, triggerExplosion, hideExplosion } = useParticleExplosion();

  // Animation values
  const containerAnim = useRef(new Animated.Value(0)).current;
  const scoreAnim = useRef(new Animated.Value(0)).current;
  const statsAnim = useRef(new Animated.Value(0)).current;
  const buttonsAnim = useRef(new Animated.Value(0)).current;
  const confettiAnim = useRef(new Animated.Value(0)).current;

  // Calculate results
  const accuracy = Math.round((score / (totalQuestions * 10)) * 100);
  const grade =
    accuracy >= 90 ? 'A' : accuracy >= 80 ? 'B' : accuracy >= 70 ? 'C' : accuracy >= 60 ? 'D' : 'F';
  const isPerfect = accuracy === 100;
  const isExcellent = accuracy >= 90;

  useEffect(() => {
    // Initialize sound effects (safe)
    try {
      soundEffectsService.initialize();
    } catch (e) {
      console.warn('Sound effects init failed (results):', e);
    }

    // Start entrance animations
    Animated.stagger(300, [
      Animated.spring(containerAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(scoreAnim, {
        toValue: 1,
        tension: 40,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(statsAnim, {
        toValue: 1,
        tension: 35,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(buttonsAnim, {
        toValue: 1,
        tension: 30,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Trigger celebration effects
    if (isPerfect || isExcellent) {
      setTimeout(() => {
        triggerExplosion(width / 2, height / 2, 'celebration');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        soundEffectsService.playEffect('achievement_unlock');
      }, 1000);
    }

    // Confetti animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(confettiAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(confettiAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  const getGradeColor = () => {
    switch (grade) {
      case 'A':
        return themeColors.semantic.success;
      case 'B':
        return themeColors.primary[500];
      case 'C':
        return themeColors.semantic.warning;
      case 'D':
        return '#EF4444';
      case 'F':
        return themeColors.semantic.error;
      default:
        return '#9CA3AF';
    }
  };

  const getGradeMessage = () => {
    if (isPerfect) return "Perfect! You're a coding master! 🎯";
    if (isExcellent) return "Excellent work! You're on fire! 🔥";
    if (accuracy >= 80) return 'Great job! Keep up the momentum! 💪';
    if (accuracy >= 70) return 'Good effort! Practice makes perfect! 📚';
    if (accuracy >= 60) return 'Not bad! Room for improvement! 🎯';
    return "Keep practicing! You'll get there! 💪";
  };

  const renderStatCard = (title: string, value: string, icon: string, color: string) => (
    <Animated.View
      style={[
        styles.statCard,
        {
          transform: [
            {
              translateY: statsAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              }),
            },
          ],
        },
      ]}
    >
      <LinearGradient colors={[`${color}20`, `${color}10`]} style={styles.statGradient}>
        <View style={styles.statHeader}>
          <Ionicons name={icon as any} size={24} color={color} />
          <Text style={[styles.statTitle, { color }]}>{title}</Text>
        </View>
        <Text style={[styles.statValue, { color }]}>{value}</Text>
      </LinearGradient>
    </Animated.View>
  );

  return (
    <SafeAreaView testID="results-screen" style={styles.container}>
      <LinearGradient colors={themeColors.gradients.dark} style={StyleSheet.absoluteFillObject} />

      {/* Confetti Background */}
      <Animated.View
        style={[
          styles.confettiContainer,
          {
            opacity: confettiAnim,
            transform: [
              {
                translateY: confettiAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -20],
                }),
              },
            ],
          },
        ]}
      >
        {[...Array(20)].map((_, i) => (
          <View
            key={i}
            style={[
              styles.confetti,
              {
                left: Math.random() * width,
                top: Math.random() * height,
                backgroundColor: [
                  themeColors.primary[500],
                  themeColors.semantic.success,
                  themeColors.semantic.warning,
                ][Math.floor(Math.random() * 3)],
              },
            ]}
          />
        ))}
      </Animated.View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View
          style={[
            styles.header,
            {
              opacity: containerAnim,
              transform: [
                {
                  translateY: containerAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-50, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => (onGoHome ? onGoHome() : console.warn('No onGoHome callback provided'))}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Quiz Results</Text>
          <View style={styles.placeholder} />
        </Animated.View>

        {/* Score Display */}
        <Animated.View
          style={[
            styles.scoreContainer,
            {
              transform: [
                {
                  scale: scoreAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1],
                  }),
                },
              ],
            },
          ]}
        >
          <LinearGradient
            colors={['rgba(14, 165, 233, 0.2)', 'rgba(14, 165, 233, 0.1)']}
            style={styles.scoreGradient}
          >
            <Text testID="final-score" style={styles.scoreText}>
              {score}
            </Text>
            <Text style={styles.scoreLabel}>TOTAL POINTS</Text>

            {/* Grade Badge */}
            <View style={[styles.gradeBadge, { backgroundColor: getGradeColor() }]}>
              <Text style={styles.gradeText}>{grade}</Text>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Grade Message */}
        <Animated.View
          style={[
            styles.messageContainer,
            {
              opacity: scoreAnim,
              transform: [
                {
                  translateY: scoreAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [30, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.messageText}>{getGradeMessage()}</Text>
        </Animated.View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {renderStatCard('Accuracy', `${accuracy}%`, 'analytics', themeColors.primary[500])}
          {renderStatCard(
            'Questions',
            `${totalQuestions}`,
            'help-circle',
            themeColors.accent.slate,
          )}
          {renderStatCard('Category', category, 'bookmark', themeColors.accent.teal)}
          {renderStatCard('Performance', grade, 'trophy', getGradeColor())}
        </View>

        {/* Achievement Section */}
        {(isPerfect || isExcellent) && (
          <Animated.View
            style={[
              styles.achievementContainer,
              {
                opacity: statsAnim,
                transform: [
                  {
                    translateY: statsAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [30, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <LinearGradient
              colors={['rgba(34, 197, 94, 0.2)', 'rgba(22, 163, 74, 0.2)']}
              style={styles.achievementGradient}
            >
              <Ionicons name="medal" size={32} color="#22C55E" />
              <Text style={styles.achievementTitle}>
                {isPerfect ? 'Perfect Score!' : 'Excellent Performance!'}
              </Text>
              <Text style={styles.achievementSubtitle}>
                {isPerfect ? 'You aced every question!' : 'Outstanding work!'}
              </Text>
            </LinearGradient>
          </Animated.View>
        )}

        {/* Action Buttons */}
        <Animated.View
          style={[
            styles.buttonsContainer,
            {
              opacity: buttonsAnim,
              transform: [
                {
                  translateY: buttonsAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <TouchableOpacity
            testID="results-home"
            style={styles.primaryButton}
            onPress={() => (onGoHome ? onGoHome() : console.warn('No onGoHome callback provided'))}
          >
            <LinearGradient
              colors={[themeColors.primary[500], themeColors.primary[700]]}
              style={styles.buttonGradient}
            >
              <Ionicons name="home" size={20} color="#FFFFFF" />
              <Text style={styles.buttonText}>Back to Home</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            testID="results-retry"
            style={styles.secondaryButton}
            onPress={() => (onRetry ? onRetry() : console.warn('No onRetry callback provided'))}
          >
            <View style={styles.secondaryButtonContent}>
              <Ionicons name="refresh" size={20} color={themeColors.primary[500]} />
              <Text style={styles.secondaryButtonText}>Try Again</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.shareButton}
            onPress={() => {
              // Share functionality
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            }}
          >
            <View style={styles.shareButtonContent}>
              <Ionicons name="share-social" size={20} color="#F59E0B" />
              <Text style={styles.shareButtonText}>Share Results</Text>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>

      {/* Particle Explosion Effects */}
      <ParticleExplosion
        visible={explosion.visible}
        centerX={explosion.centerX}
        centerY={explosion.centerY}
        type={explosion.type}
        onComplete={hideExplosion}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  confettiContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
  confetti: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  placeholder: {
    width: 40,
  },
  scoreContainer: {
    alignItems: 'center',
    marginVertical: 30,
  },
  scoreGradient: {
    padding: 40,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(79, 70, 229, 0.3)',
  },
  scoreText: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#4F46E5',
    marginBottom: 8,
  },
  scoreLabel: {
    fontSize: 14,
    color: '#9CA3AF',
    letterSpacing: 2,
    marginBottom: 20,
  },
  gradeBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 60,
    alignItems: 'center',
  },
  gradeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  messageContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  messageText: {
    fontSize: 18,
    color: '#E5E7EB',
    textAlign: 'center',
    lineHeight: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  statCard: {
    width: '48%',
    marginBottom: 16,
  },
  statGradient: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  achievementContainer: {
    marginBottom: 30,
  },
  achievementGradient: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.3)',
  },
  achievementTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#22C55E',
    marginTop: 12,
    marginBottom: 4,
  },
  achievementSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  buttonsContainer: {
    gap: 16,
  },
  primaryButton: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  secondaryButton: {
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#4F46E5',
    backgroundColor: 'rgba(79, 70, 229, 0.1)',
  },
  secondaryButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4F46E5',
    marginLeft: 8,
  },
  shareButton: {
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#F59E0B',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
  },
  shareButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  shareButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F59E0B',
    marginLeft: 8,
  },
});
