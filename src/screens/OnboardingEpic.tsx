import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors as themeColors } from '../design/theme';

const { width, height } = Dimensions.get('window');

interface OnboardingEpicProps {
  onGetStarted?: () => void;
  onSkip?: () => void;
}

export default function OnboardingEpic({ onGetStarted, onSkip }: OnboardingEpicProps) {
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const particleAnim = useRef(new Animated.Value(0)).current;
  const logoAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const sparkleAnim = useRef(new Animated.Value(0)).current;

  // Interactive state
  const [selectedFeature, setSelectedFeature] = useState<number | null>(null);
  const [buttonPressed, setButtonPressed] = useState(false);

  // Start animations
  useEffect(() => {
    const animations = [
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(logoAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }),
      Animated.timing(glowAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      }),
    ];

    Animated.parallel(animations).start();

    // Start particle animation
    Animated.loop(
      Animated.timing(particleAnim, {
        toValue: 1,
        duration: 4000,
        useNativeDriver: true,
      }),
    ).start();

    // Start sparkle animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(sparkleAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(sparkleAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    // Start pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  const handleGetStarted = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setButtonPressed(true);

    // Add a small delay for the press effect
    setTimeout(() => {
      onGetStarted?.();
    }, 200);
  };

  const handleSkip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSkip?.();
  };

  const handleFeaturePress = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedFeature(index);

    // Reset selection after 1 second
    setTimeout(() => {
      setSelectedFeature(null);
    }, 1000);
  };

  const features = [
    {
      icon: '🎯',
      title: 'Adaptive Learning',
      description: 'AI-powered quizzes that adapt to your skill level',
      gradient: [themeColors.primary[500], themeColors.primary[700]],
      sparkle: '✨',
    },
    {
      icon: '🏆',
      title: 'Compete with Friends',
      description: 'Challenge your friends and climb the leaderboard',
      gradient: [themeColors.primary[500], themeColors.primary[700]],
      sparkle: '⭐',
    },
    {
      icon: '🔥',
      title: 'Build Streaks',
      description: 'Maintain daily streaks to unlock achievements',
      gradient: [themeColors.primary[500], themeColors.primary[700]],
      sparkle: '💫',
    },
    {
      icon: '🚀',
      title: 'Epic Experience',
      description: 'Beautiful animations and engaging gameplay',
      gradient: [themeColors.primary[500], themeColors.primary[700]],
      sparkle: '🌟',
    },
  ];

  return (
    <View style={styles.container}>
      {/* Animated Background */}
      <LinearGradient
        colors={themeColors.gradients.dark}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Floating Particles */}
      <Animated.View style={[styles.particlesContainer, { opacity: particleAnim }]}>
        {[...Array(30)].map((_, i) => (
          <Animated.View
            key={i}
            style={[
              styles.particle,
              {
                left: Math.random() * width,
                top: Math.random() * height,
                backgroundColor: ['#FFFFFF', '#FFD700', '#FF69B4', '#00CED1', '#98FB98', '#FFB6C1'][
                  i % 6
                ],
                // animationDelay: `${Math.random() * 4}s`,
              },
            ]}
          />
        ))}
      </Animated.View>

      {/* Sparkle Effects */}
      <Animated.View style={[styles.sparkleContainer, { opacity: sparkleAnim }]}>
        {[...Array(15)].map((_, i) => (
          <Animated.View
            key={i}
            style={[
              styles.sparkle,
              {
                left: Math.random() * width,
                top: Math.random() * height,
                animationDelay: `${Math.random() * 3}s`,
              },
            ]}
          />
        ))}
      </Animated.View>

      {/* Glow Effect */}
      <Animated.View style={[styles.glowContainer, { opacity: glowAnim }]}>
        <View style={styles.glowEffect} />
      </Animated.View>

      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Logo Section */}
          <Animated.View
            style={[
              styles.logoSection,
              {
                opacity: logoAnim,
                transform: [{ scale: logoAnim }],
              },
            ]}
          >
            <Animated.View style={[styles.logoContainer, { transform: [{ scale: pulseAnim }] }]}>
              <LinearGradient
                colors={[themeColors.primary[600], themeColors.primary[700]]}
                style={styles.logo}
              >
                <MaterialCommunityIcons name="brain" size={80} color="#FFFFFF" />
              </LinearGradient>
              <View style={styles.logoGlow} />
            </Animated.View>
            <Text style={styles.appTitle}>QuizMentor</Text>
            <Text style={styles.appSubtitle}>Level up your knowledge</Text>
            <Text style={styles.appTagline}>Epic Gaming Experience for Developers</Text>
          </Animated.View>

          {/* Features Section */}
          <Animated.View
            style={[
              styles.featuresSection,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Text style={styles.featuresTitle}>Why Choose QuizMentor?</Text>
            <Text style={styles.featuresSubtitle}>Tap on features to see them in action!</Text>
            <View style={styles.featuresList}>
              {features.map((feature, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleFeaturePress(index)}
                  activeOpacity={0.8}
                >
                  <Animated.View
                    style={[
                      styles.featureItem,
                      {
                        opacity: fadeAnim,
                        transform: [
                          { translateY: slideAnim },
                          { scale: selectedFeature === index ? 1.05 : scaleAnim },
                        ],
                      },
                    ]}
                  >
                    <LinearGradient colors={feature.gradient} style={styles.featureGradient}>
                      <View style={styles.featureIconContainer}>
                        <Text style={styles.featureIcon}>{feature.icon}</Text>
                        {selectedFeature === index && (
                          <Animated.View style={styles.sparkleOverlay}>
                            <Text style={styles.sparkleText}>{feature.sparkle}</Text>
                          </Animated.View>
                        )}
                      </View>
                      <View style={styles.featureContent}>
                        <Text style={styles.featureTitle}>{feature.title}</Text>
                        <Text style={styles.featureDescription}>{feature.description}</Text>
                      </View>
                    </LinearGradient>
                  </Animated.View>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>

          {/* Action Buttons */}
          <Animated.View
            style={[
              styles.actionsSection,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <TouchableOpacity
              style={[styles.getStartedButton, buttonPressed && styles.getStartedButtonPressed]}
              onPress={handleGetStarted}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[themeColors.primary[500], themeColors.primary[700]]}
                style={styles.getStartedGradient}
              >
                <Text style={styles.getStartedText}>🚀 Get Started</Text>
                <MaterialCommunityIcons name="rocket-launch" size={24} color="#FFFFFF" />
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.skipButton} onPress={handleSkip} activeOpacity={0.8}>
              <Text style={styles.skipButtonText}>I have an account</Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  particlesContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
  particle: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    opacity: 0.7,
  },
  sparkleContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
  sparkle: {
    position: 'absolute',
    fontSize: 20,
    opacity: 0.8,
  },
  glowContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
  glowEffect: {
    position: 'absolute',
    top: '20%',
    left: '20%',
    right: '20%',
    bottom: '20%',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 200,
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 100,
  },
  logoSection: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 40,
  },
  logoContainer: {
    marginBottom: 20,
    position: 'relative',
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  logoGlow: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.2)',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
  },
  appTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  appSubtitle: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginBottom: 4,
  },
  appTagline: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  featuresSection: {
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  featuresTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  featuresSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginBottom: 30,
  },
  featuresList: {
    gap: 16,
  },
  featureItem: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  featureGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    position: 'relative',
  },
  featureIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    position: 'relative',
  },
  featureIcon: {
    fontSize: 28,
  },
  sparkleOverlay: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 15,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sparkleText: {
    fontSize: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 20,
  },
  actionsSection: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  getStartedButton: {
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
    marginBottom: 20,
  },
  getStartedButtonPressed: {
    transform: [{ scale: 0.95 }],
  },
  getStartedGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 40,
  },
  getStartedText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginRight: 8,
  },
  skipButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  skipButtonText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
});
