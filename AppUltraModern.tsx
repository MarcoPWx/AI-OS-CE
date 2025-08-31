/**
 * QuizMentor - Ultra Modern Experience
 * Enhanced with web support, advanced animations, and premium features
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform,
  Dimensions,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  ActivityIndicator,
  Easing,
  Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Services
import { unifiedQuizData } from './services/unifiedQuizData';
import { localProgress } from './src/services/localProgress';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';
const MAX_WIDTH = 768;

// Animation Presets based on user type
const ANIMATION_PRESETS = {
  free: {
    duration: { fast: 300, normal: 500, slow: 800 },
    easing: Easing.out(Easing.quad),
    springs: { damping: 15, stiffness: 100 },
  },
  premium: {
    duration: { fast: 150, normal: 300, slow: 500 },
    easing: Easing.out(Easing.exp),
    springs: { damping: 10, stiffness: 150, mass: 0.5 },
    extras: { haptics: true, particles: true, sounds: true, screenShake: true },
  },
};

// App States
type AppState =
  | 'loading'
  | 'onboarding-welcome'
  | 'onboarding-interests'
  | 'onboarding-skill'
  | 'onboarding-notifications'
  | 'auth-choice'
  | 'auth-login'
  | 'auth-signup'
  | 'home'
  | 'quiz-playing'
  | 'quiz-results'
  | 'profile'
  | 'leaderboard'
  | 'achievements'
  | 'settings'
  | 'premium-upsell';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  level: number;
  xp: number;
  streak: number;
  hearts: number;
  interests: string[];
  skillLevel: 'beginner' | 'intermediate' | 'expert';
  isPremium: boolean;
  achievements: string[];
  dailyGoal: number;
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  notificationsEnabled: boolean;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  xpReward: number;
  unlocked: boolean;
  progress: number;
  target: number;
}

export default function AppUltraModern() {
  // App State
  const [appState, setAppState] = useState<AppState>('loading');
  const [user, setUser] = useState<User | null>(null);
  const [isFirstLaunch, setIsFirstLaunch] = useState(true);

  // Onboarding State
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedSkillLevel, setSelectedSkillLevel] = useState<
    'beginner' | 'intermediate' | 'expert' | null
  >(null);
  const [notificationPreference, setNotificationPreference] = useState<boolean | null>(null);

  // Auth State
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' });
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  // Game State
  const [currentCategory, setCurrentCategory] = useState<string | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [lives, setLives] = useState(3);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [perfectStreak, setPerfectStreak] = useState(0);

  // UI State
  const [selectedTab, setSelectedTab] = useState<
    'home' | 'leaderboard' | 'achievements' | 'profile'
  >('home');
  const [dailyProgress, setDailyProgress] = useState(0);
  const [showLevelUpModal, setShowLevelUpModal] = useState(false);
  const [newAchievements, setNewAchievements] = useState<Achievement[]>([]);
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(SCREEN_WIDTH)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const heartBeatAnim = useRef(new Animated.Value(1)).current;
  const comboScaleAnim = useRef(new Animated.Value(1)).current;
  const streakFlameAnim = useRef(new Animated.Value(1)).current;

  // Particle animations
  const particles = useRef(
    Array(30)
      .fill(0)
      .map(() => ({
        x: new Animated.Value(0),
        y: new Animated.Value(0),
        opacity: new Animated.Value(0),
        scale: new Animated.Value(0),
        rotation: new Animated.Value(0),
      })),
  ).current;

  // Get animation config based on user type
  const animConfig = user?.isPremium ? ANIMATION_PRESETS.premium : ANIMATION_PRESETS.free;

  // Initialize continuous animations
  useEffect(() => {
    // Glow effect
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();

    // Float effect for premium elements
    if (user?.isPremium) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(floatAnim, {
            toValue: -10,
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(floatAnim, {
            toValue: 0,
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ).start();
    }

    // Streak flame animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(streakFlameAnim, {
          toValue: 1.2,
          duration: 600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(streakFlameAnim, {
          toValue: 1,
          duration: 600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [user?.isPremium]);

  // Initialize app
  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      const savedUser = await AsyncStorage.getItem('user');
      const hasOnboarded = await AsyncStorage.getItem('hasOnboarded');

      if (savedUser) {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setIsFirstLaunch(false);
        setAppState('home');

        // Check daily login for streak
        checkDailyLogin(userData);
      } else if (hasOnboarded) {
        setIsFirstLaunch(false);
        setAppState('auth-choice');
      } else {
        setAppState('onboarding-welcome');
      }

      // Fade in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: animConfig.duration.normal,
        useNativeDriver: true,
      }).start();
    } catch (error) {
      console.error('Failed to initialize app:', error);
      setAppState('onboarding-welcome');
    }
  };

  const checkDailyLogin = async (userData: User) => {
    const lastLogin = await AsyncStorage.getItem('lastLogin');
    const today = new Date().toDateString();

    if (lastLogin !== today) {
      // New day - update streak
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      const newStreak = lastLogin === yesterday ? userData.streak + 1 : 1;

      setUser({ ...userData, streak: newStreak });
      await AsyncStorage.setItem('lastLogin', today);

      // Show streak animation if maintained
      if (newStreak > 1) {
        triggerStreakAnimation();
      }
    }
  };

  // Advanced Animation Functions
  const animateScreenTransition = (direction: 'forward' | 'back' = 'forward') => {
    const fromValue = direction === 'forward' ? SCREEN_WIDTH : -SCREEN_WIDTH;
    slideAnim.setValue(fromValue);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: animConfig.duration.fast,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        ...animConfig.springs,
        useNativeDriver: true,
      }),
    ]).start(() => {
      fadeAnim.setValue(1);
    });

    if (animConfig.extras?.haptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const triggerScreenShake = () => {
    if (!animConfig.extras?.screenShake) return;

    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const triggerCelebration = (intensity: 'small' | 'medium' | 'large' = 'medium') => {
    const particleCount = intensity === 'small' ? 10 : intensity === 'medium' ? 20 : 30;

    particles.slice(0, particleCount).forEach((particle, i) => {
      const delay = i * 30;
      const angle = (Math.PI * 2 * i) / particleCount;
      const distance = intensity === 'small' ? 100 : intensity === 'medium' ? 200 : 300;
      const endX = Math.cos(angle) * distance;
      const endY = Math.sin(angle) * distance;

      setTimeout(() => {
        Animated.parallel([
          Animated.sequence([
            Animated.spring(particle.scale, {
              toValue: 1,
              ...animConfig.springs,
              useNativeDriver: true,
            }),
            Animated.timing(particle.scale, {
              toValue: 0,
              duration: animConfig.duration.normal,
              useNativeDriver: true,
            }),
          ]),
          Animated.timing(particle.x, {
            toValue: endX,
            duration: animConfig.duration.slow,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(particle.y, {
            toValue: endY,
            duration: animConfig.duration.slow,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(particle.rotation, {
            toValue: 360,
            duration: animConfig.duration.slow,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(particle.opacity, {
              toValue: 1,
              duration: animConfig.duration.fast,
              useNativeDriver: true,
            }),
            Animated.timing(particle.opacity, {
              toValue: 0,
              duration: animConfig.duration.normal,
              delay: animConfig.duration.fast,
              useNativeDriver: true,
            }),
          ]),
        ]).start(() => {
          // Reset particle
          particle.x.setValue(0);
          particle.y.setValue(0);
          particle.scale.setValue(0);
          particle.rotation.setValue(0);
          particle.opacity.setValue(0);
        });
      }, delay);
    });
  };

  const triggerComboAnimation = () => {
    Animated.sequence([
      Animated.spring(comboScaleAnim, {
        toValue: 1.5,
        ...animConfig.springs,
        useNativeDriver: true,
      }),
      Animated.spring(comboScaleAnim, {
        toValue: 1,
        ...animConfig.springs,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const triggerHeartLoss = () => {
    Animated.sequence([
      Animated.timing(heartBeatAnim, {
        toValue: 1.5,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(heartBeatAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      heartBeatAnim.setValue(1);
    });

    triggerScreenShake();
  };

  const triggerStreakAnimation = () => {
    // Premium users get more elaborate animation
    if (user?.isPremium) {
      triggerCelebration('large');
    }

    Animated.sequence([
      Animated.spring(streakFlameAnim, {
        toValue: 2,
        ...animConfig.springs,
        useNativeDriver: true,
      }),
      Animated.spring(streakFlameAnim, {
        toValue: 1.2,
        ...animConfig.springs,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const animatePulse = (target: Animated.Value = pulseAnim, scale: number = 1.1) => {
    Animated.sequence([
      Animated.spring(target, {
        toValue: scale,
        ...animConfig.springs,
        useNativeDriver: true,
      }),
      Animated.spring(target, {
        toValue: 1,
        ...animConfig.springs,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Container wrapper for web max width
  const WebContainer: React.FC<{ children: React.ReactNode; style?: any }> = ({
    children,
    style,
  }) => {
    if (isWeb) {
      return (
        <View style={[styles.webContainer, style]}>
          <View style={styles.webContent}>{children}</View>
        </View>
      );
    }
    return <>{children}</>;
  };

  // Onboarding Screens
  const renderOnboardingWelcome = () => (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <LinearGradient
        colors={['#667eea', '#764ba2', '#f093fb']}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <WebContainer>
        <SafeAreaView style={styles.onboardingContainer}>
          <View style={styles.onboardingContent}>
            <Animated.Text
              style={[
                styles.appLogo,
                {
                  transform: [{ scale: pulseAnim }, { translateY: floatAnim }],
                },
              ]}
            >
              🧠
            </Animated.Text>
            <Text style={styles.appTitle}>QuizMentor</Text>
            <Text style={styles.appSubtitle}>Level up your knowledge</Text>

            <View style={styles.featuresList}>
              <Animated.View style={[styles.featureItem, { transform: [{ scale: pulseAnim }] }]}>
                <Text style={styles.featureIcon}>🎯</Text>
                <Text style={styles.featureText}>Adaptive learning AI</Text>
              </Animated.View>
              <Animated.View style={[styles.featureItem, { opacity: fadeAnim }]}>
                <Text style={styles.featureIcon}>🏆</Text>
                <Text style={styles.featureText}>Global leaderboards</Text>
              </Animated.View>
              <Animated.View style={[styles.featureItem, { opacity: fadeAnim }]}>
                <Text style={styles.featureIcon}>🔥</Text>
                <Text style={styles.featureText}>Daily streaks & rewards</Text>
              </Animated.View>
              <Animated.View style={[styles.featureItem, { opacity: fadeAnim }]}>
                <Text style={styles.featureIcon}>💎</Text>
                <Text style={styles.featureText}>Premium features</Text>
              </Animated.View>
            </View>
          </View>

          <View style={styles.onboardingActions}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => {
                animateScreenTransition();
                setAppState('onboarding-interests');
              }}
            >
              <LinearGradient colors={['#fff', '#f0f0f0']} style={styles.buttonGradient}>
                <Text style={styles.primaryButtonText}>Get Started</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.skipButton}
              onPress={() => {
                AsyncStorage.setItem('hasOnboarded', 'true');
                setAppState('auth-choice');
              }}
            >
              <Text style={styles.skipButtonText}>I already have an account</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </WebContainer>
    </Animated.View>
  );

  const renderOnboardingInterests = () => {
    const interests = [
      { id: 'javascript', icon: '🟨', name: 'JavaScript', color: '#F7DF1E' },
      { id: 'react', icon: '⚛️', name: 'React', color: '#61DAFB' },
      { id: 'typescript', icon: '🔷', name: 'TypeScript', color: '#3178C6' },
      { id: 'nodejs', icon: '🟩', name: 'Node.js', color: '#339933' },
      { id: 'python', icon: '🐍', name: 'Python', color: '#3776AB' },
      { id: 'devops', icon: '🔧', name: 'DevOps', color: '#FF6B6B' },
      { id: 'mobile', icon: '📱', name: 'Mobile', color: '#A4C639' },
      { id: 'cloud', icon: '☁️', name: 'Cloud', color: '#FF9900' },
    ];

    return (
      <Animated.View style={[styles.container, { transform: [{ translateX: slideAnim }] }]}>
        <LinearGradient
          colors={['#667eea', '#764ba2', '#f093fb']}
          style={StyleSheet.absoluteFillObject}
        />

        <WebContainer>
          <SafeAreaView style={styles.onboardingContainer}>
            <View style={styles.progressBar}>
              <Animated.View
                style={[
                  styles.progressFill,
                  {
                    width: '25%',
                    transform: [
                      {
                        scaleX: progressAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, 1],
                        }),
                      },
                    ],
                  },
                ]}
              />
            </View>

            <View style={styles.onboardingContent}>
              <Text style={styles.onboardingTitle}>What do you want to learn?</Text>
              <Text style={styles.onboardingSubtitle}>Choose at least 3 topics</Text>

              <View style={styles.interestsGrid}>
                {interests.map((interest, index) => {
                  const isSelected = selectedInterests.includes(interest.id);
                  const animatedScale = new Animated.Value(1);

                  return (
                    <Pressable
                      key={interest.id}
                      style={[
                        styles.interestCard,
                        isSelected && [
                          styles.interestCardSelected,
                          { borderColor: interest.color },
                        ],
                      ]}
                      onPressIn={() => {
                        Animated.timing(animatedScale, {
                          toValue: 0.95,
                          duration: 100,
                          useNativeDriver: true,
                        }).start();
                      }}
                      onPressOut={() => {
                        Animated.spring(animatedScale, {
                          toValue: 1,
                          ...animConfig.springs,
                          useNativeDriver: true,
                        }).start();
                      }}
                      onPress={() => {
                        if (isSelected) {
                          setSelectedInterests((prev) => prev.filter((i) => i !== interest.id));
                        } else {
                          setSelectedInterests((prev) => [...prev, interest.id]);
                          animatePulse();
                          if (user?.isPremium) {
                            triggerCelebration('small');
                          }
                        }
                        Haptics.selectionAsync();
                      }}
                    >
                      <Animated.View
                        style={[
                          styles.interestCardInner,
                          { transform: [{ scale: animatedScale }] },
                        ]}
                      >
                        <Text style={styles.interestIcon}>{interest.icon}</Text>
                        <Text
                          style={[styles.interestName, isSelected && styles.interestNameSelected]}
                        >
                          {interest.name}
                        </Text>
                        {isSelected && (
                          <Animated.View
                            style={[styles.checkmark, { backgroundColor: interest.color }]}
                          >
                            <Text style={styles.checkmarkText}>✓</Text>
                          </Animated.View>
                        )}
                      </Animated.View>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={styles.onboardingActions}>
              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  selectedInterests.length < 3 && styles.disabledButton,
                ]}
                onPress={() => {
                  if (selectedInterests.length >= 3) {
                    animateScreenTransition();
                    setAppState('onboarding-skill');
                  }
                }}
                disabled={selectedInterests.length < 3}
              >
                <Text
                  style={[
                    styles.primaryButtonText,
                    { color: selectedInterests.length >= 3 ? '#667eea' : '#999' },
                  ]}
                >
                  Continue ({selectedInterests.length}/3)
                </Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </WebContainer>
      </Animated.View>
    );
  };

  const renderOnboardingSkillLevel = () => {
    const skillLevels = [
      {
        id: 'beginner' as const,
        title: 'Beginner',
        subtitle: 'New to development',
        description: 'Perfect for those just starting their coding journey',
        icon: '🌱',
        color: '#4ade80',
        gradient: ['#4ade80', '#22c55e'],
      },
      {
        id: 'intermediate' as const,
        title: 'Intermediate',
        subtitle: '1-3 years experience',
        description: 'For developers with solid fundamentals',
        icon: '🌿',
        color: '#fbbf24',
        gradient: ['#fbbf24', '#f59e0b'],
      },
      {
        id: 'expert' as const,
        title: 'Expert',
        subtitle: '3+ years experience',
        description: 'Advanced concepts and best practices',
        icon: '🌳',
        color: '#f87171',
        gradient: ['#f87171', '#ef4444'],
      },
    ];

    return (
      <Animated.View style={[styles.container, { transform: [{ translateX: slideAnim }] }]}>
        <LinearGradient
          colors={['#667eea', '#764ba2', '#f093fb']}
          style={StyleSheet.absoluteFillObject}
        />

        <WebContainer>
          <SafeAreaView style={styles.onboardingContainer}>
            <View style={styles.progressBar}>
              <Animated.View style={[styles.progressFill, { width: '50%' }]} />
            </View>

            <View style={styles.onboardingContent}>
              <Text style={styles.onboardingTitle}>What's your experience level?</Text>
              <Text style={styles.onboardingSubtitle}>We'll personalize your learning path</Text>

              <View style={styles.skillLevels}>
                {skillLevels.map((level) => {
                  const isSelected = selectedSkillLevel === level.id;
                  const animatedScale = new Animated.Value(1);

                  return (
                    <Pressable
                      key={level.id}
                      onPressIn={() => {
                        Animated.timing(animatedScale, {
                          toValue: 0.98,
                          duration: 100,
                          useNativeDriver: true,
                        }).start();
                      }}
                      onPressOut={() => {
                        Animated.spring(animatedScale, {
                          toValue: 1,
                          ...animConfig.springs,
                          useNativeDriver: true,
                        }).start();
                      }}
                      onPress={() => {
                        setSelectedSkillLevel(level.id);
                        animatePulse();
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                      }}
                    >
                      <Animated.View style={[{ transform: [{ scale: animatedScale }] }]}>
                        <LinearGradient
                          colors={
                            isSelected
                              ? level.gradient
                              : ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']
                          }
                          style={[
                            styles.skillCard,
                            isSelected && { borderColor: level.color, borderWidth: 2 },
                          ]}
                        >
                          <View style={styles.skillCardHeader}>
                            <Text style={styles.skillIcon}>{level.icon}</Text>
                            <View style={styles.skillCardText}>
                              <Text style={styles.skillTitle}>{level.title}</Text>
                              <Text style={styles.skillSubtitle}>{level.subtitle}</Text>
                            </View>
                            {isSelected && (
                              <View
                                style={[styles.selectedIndicator, { backgroundColor: level.color }]}
                              >
                                <Text style={styles.selectedIndicatorText}>✓</Text>
                              </View>
                            )}
                          </View>
                          <Text style={styles.skillDescription}>{level.description}</Text>
                        </LinearGradient>
                      </Animated.View>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={styles.onboardingActions}>
              <TouchableOpacity
                style={[styles.primaryButton, !selectedSkillLevel && styles.disabledButton]}
                onPress={() => {
                  if (selectedSkillLevel) {
                    animateScreenTransition();
                    setAppState('onboarding-notifications');
                  }
                }}
                disabled={!selectedSkillLevel}
              >
                <Text
                  style={[
                    styles.primaryButtonText,
                    { color: selectedSkillLevel ? '#667eea' : '#999' },
                  ]}
                >
                  Continue
                </Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </WebContainer>
      </Animated.View>
    );
  };

  const renderOnboardingNotifications = () => {
    const notificationOptions = [
      {
        id: 'daily',
        title: 'Daily Reminders',
        subtitle: 'Never miss your learning streak',
        icon: '📅',
        enabled: true,
      },
      {
        id: 'achievements',
        title: 'Achievements',
        subtitle: 'Celebrate your progress',
        icon: '🏆',
        enabled: true,
      },
      {
        id: 'weekly',
        title: 'Weekly Reports',
        subtitle: 'Track your improvement',
        icon: '📊',
        enabled: false,
      },
    ];

    return (
      <Animated.View style={[styles.container, { transform: [{ translateX: slideAnim }] }]}>
        <LinearGradient
          colors={['#667eea', '#764ba2', '#f093fb']}
          style={StyleSheet.absoluteFillObject}
        />

        <WebContainer>
          <SafeAreaView style={styles.onboardingContainer}>
            <View style={styles.progressBar}>
              <Animated.View style={[styles.progressFill, { width: '75%' }]} />
            </View>

            <View style={styles.onboardingContent}>
              <Text style={styles.onboardingTitle}>Stay on track 🎯</Text>
              <Text style={styles.onboardingSubtitle}>
                Enable notifications to maintain your streak
              </Text>

              <View style={styles.notificationGraphic}>
                <Animated.Text
                  style={[
                    styles.notificationEmoji,
                    {
                      transform: [
                        { scale: pulseAnim },
                        {
                          rotate: glowAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: ['0deg', '15deg'],
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  🔔
                </Animated.Text>
              </View>

              <View style={styles.notificationBenefits}>
                <View style={styles.benefitItem}>
                  <Text style={styles.benefitIcon}>🔥</Text>
                  <Text style={styles.benefitText}>Keep your streak alive</Text>
                </View>
                <View style={styles.benefitItem}>
                  <Text style={styles.benefitIcon}>📈</Text>
                  <Text style={styles.benefitText}>Track your progress</Text>
                </View>
                <View style={styles.benefitItem}>
                  <Text style={styles.benefitIcon}>🎁</Text>
                  <Text style={styles.benefitText}>Get exclusive rewards</Text>
                </View>
              </View>
            </View>

            <View style={styles.onboardingActions}>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={async () => {
                  setNotificationPreference(true);
                  await AsyncStorage.setItem('hasOnboarded', 'true');
                  animateScreenTransition();
                  setAppState('auth-choice');
                }}
              >
                <LinearGradient colors={['#fff', '#f0f0f0']} style={styles.buttonGradient}>
                  <Text style={styles.primaryButtonText}>Enable Notifications</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.skipButton}
                onPress={async () => {
                  setNotificationPreference(false);
                  await AsyncStorage.setItem('hasOnboarded', 'true');
                  setAppState('auth-choice');
                }}
              >
                <Text style={styles.skipButtonText}>Maybe later</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </WebContainer>
      </Animated.View>
    );
  };

  // Home Screen with advanced features
  const renderHome = () => {
    if (!user) return null;

    const categories = unifiedQuizData.getCategoryStats().slice(0, 8);
    const xpForNextLevel = Math.floor(100 * Math.pow(user.level, 1.5));
    const xpProgress = (user.xp % xpForNextLevel) / xpForNextLevel;

    // Daily challenge progress
    const dailyChallengeComplete = dailyProgress >= 10;

    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#1a1a2e', '#16213e', '#0f3460']}
          style={StyleSheet.absoluteFillObject}
        />

        {/* Animated background elements */}
        <Animated.View
          style={[
            styles.backgroundOrb,
            {
              opacity: glowAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.1, 0.3],
              }),
              transform: [
                {
                  scale: glowAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 1.2],
                  }),
                },
              ],
            },
          ]}
        />

        <WebContainer>
          <SafeAreaView style={styles.homeContainer}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.homeScrollContent}
            >
              {/* Header */}
              <View style={styles.homeHeader}>
                <View style={styles.headerLeft}>
                  <Text style={styles.greeting}>
                    {getGreeting()}, {user.name}!
                  </Text>
                  <View style={styles.levelContainer}>
                    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.levelBadge}>
                      <Text style={styles.levelText}>Level {user.level}</Text>
                    </LinearGradient>
                    {user.isPremium && (
                      <View style={styles.premiumBadge}>
                        <Text style={styles.premiumIcon}>💎</Text>
                      </View>
                    )}
                  </View>
                </View>

                <View style={styles.headerRight}>
                  <TouchableOpacity
                    style={styles.streakBadge}
                    onPress={() => {
                      triggerStreakAnimation();
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                  >
                    <Animated.Text
                      style={[styles.streakFlame, { transform: [{ scale: streakFlameAnim }] }]}
                    >
                      🔥
                    </Animated.Text>
                    <Text style={styles.streakCount}>{user.streak}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.heartContainer}>
                    <Text style={styles.heartIcon}>❤️</Text>
                    <Text style={styles.heartCount}>{user.isPremium ? '∞' : user.hearts}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* XP Progress */}
              <View style={styles.xpSection}>
                <View style={styles.xpHeader}>
                  <Text style={styles.xpLabel}>Level {user.level} Progress</Text>
                  <Text style={styles.xpText}>
                    {user.xp % xpForNextLevel} / {xpForNextLevel} XP
                  </Text>
                </View>
                <View style={styles.xpBarContainer}>
                  <View style={styles.xpBar}>
                    <Animated.View style={[styles.xpFill, { width: `${xpProgress * 100}%` }]} />
                  </View>
                  {user.isPremium && (
                    <Animated.View
                      style={[
                        styles.xpGlow,
                        {
                          opacity: glowAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.5, 1],
                          }),
                        },
                      ]}
                    />
                  )}
                </View>
              </View>

              {/* Daily Challenge */}
              <TouchableOpacity
                style={[
                  styles.dailyChallenge,
                  dailyChallengeComplete && styles.dailyChallengeComplete,
                ]}
                onPress={() => {
                  if (!dailyChallengeComplete) {
                    setCurrentCategory('daily');
                    startQuiz('daily');
                  }
                }}
                activeOpacity={dailyChallengeComplete ? 1 : 0.8}
                disabled={dailyChallengeComplete}
              >
                <LinearGradient
                  colors={dailyChallengeComplete ? ['#4ade80', '#22c55e'] : ['#f093fb', '#f5576c']}
                  style={styles.dailyChallengeGradient}
                >
                  <View style={styles.dailyChallengeContent}>
                    <Animated.Text
                      style={[styles.dailyChallengeIcon, { transform: [{ scale: pulseAnim }] }]}
                    >
                      {dailyChallengeComplete ? '✅' : '⚡'}
                    </Animated.Text>
                    <View style={styles.dailyChallengeText}>
                      <Text style={styles.dailyChallengeTitle}>
                        {dailyChallengeComplete ? 'Challenge Complete!' : 'Daily Challenge'}
                      </Text>
                      <Text style={styles.dailyChallengeSubtitle}>
                        {dailyChallengeComplete
                          ? 'Great job! Come back tomorrow'
                          : `${dailyProgress}/10 questions completed`}
                      </Text>
                    </View>
                  </View>
                  {!dailyChallengeComplete && (
                    <View style={styles.dailyChallengeProgress}>
                      <View
                        style={[
                          styles.dailyChallengeProgressFill,
                          { width: `${(dailyProgress / 10) * 100}%` },
                        ]}
                      />
                    </View>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* Quick Actions */}
              <View style={styles.quickActions}>
                <TouchableOpacity
                  style={styles.quickActionCard}
                  onPress={() => setAppState('leaderboard')}
                >
                  <LinearGradient
                    colors={['rgba(255,215,0,0.2)', 'rgba(255,215,0,0.1)']}
                    style={styles.quickActionGradient}
                  >
                    <Text style={styles.quickActionIcon}>🏆</Text>
                    <Text style={styles.quickActionText}>Leaderboard</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.quickActionCard}
                  onPress={() => setAppState('achievements')}
                >
                  <LinearGradient
                    colors={['rgba(147,51,234,0.2)', 'rgba(147,51,234,0.1)']}
                    style={styles.quickActionGradient}
                  >
                    <Text style={styles.quickActionIcon}>🎖️</Text>
                    <Text style={styles.quickActionText}>Achievements</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.quickActionCard}
                  onPress={() => {
                    if (!user.isPremium) {
                      setShowPremiumModal(true);
                    }
                  }}
                >
                  <LinearGradient
                    colors={['rgba(59,130,246,0.2)', 'rgba(59,130,246,0.1)']}
                    style={styles.quickActionGradient}
                  >
                    <Text style={styles.quickActionIcon}>💎</Text>
                    <Text style={styles.quickActionText}>
                      {user.isPremium ? 'Premium' : 'Go Pro'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>

              {/* Categories */}
              <View style={styles.categoriesSection}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Quiz Categories</Text>
                  <TouchableOpacity>
                    <Text style={styles.sectionAction}>See all →</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.categoriesGrid}>
                  {categories.map((category, index) => {
                    const animatedScale = new Animated.Value(1);
                    const delay = index * 50;
                    // Initial mount animation without hooks
                    setTimeout(() => {
                      Animated.timing(animatedScale, {
                        toValue: 1,
                        duration: animConfig.duration.normal,
                        delay,
                        useNativeDriver: true,
                      }).start();
                    }, 0);

                    return (
                      <Pressable
                        key={category.id}
                        style={styles.categoryCard}
                        onPressIn={() => {
                          Animated.timing(animatedScale, {
                            toValue: 0.95,
                            duration: 100,
                            useNativeDriver: true,
                          }).start();
                        }}
                        onPressOut={() => {
                          Animated.spring(animatedScale, {
                            toValue: 1,
                            ...animConfig.springs,
                            useNativeDriver: true,
                          }).start();
                        }}
                        onPress={() => {
                          if (user.hearts > 0 || user.isPremium) {
                            setCurrentCategory(category.id);
                            startQuiz(category.id);
                          } else {
                            setShowPremiumModal(true);
                          }
                        }}
                      >
                        <Animated.View style={{ transform: [{ scale: animatedScale }] }}>
                          <LinearGradient
                            colors={[
                              category.color ? `${category.color}30` : '#667eea30',
                              category.color ? `${category.color}10` : '#667eea10',
                            ]}
                            style={styles.categoryGradient}
                          >
                            <Text style={styles.categoryIcon}>{category.icon}</Text>
                            <Text style={styles.categoryName}>{category.name}</Text>
                            <View style={styles.categoryStats}>
                              <Text style={styles.categoryQuestions}>
                                {category.totalQuestions} questions
                              </Text>
                              <View style={styles.categoryDifficulty}>
                                {renderDifficultyDots(category.difficulty)}
                              </View>
                            </View>
                          </LinearGradient>
                        </Animated.View>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            </ScrollView>

            {/* Tab Bar */}
            <View style={styles.tabBar}>{renderTabBar()}</View>
          </SafeAreaView>
        </WebContainer>

        {/* Premium Modal */}
        {showPremiumModal && renderPremiumModal()}

        {/* Level Up Modal */}
        {showLevelUpModal && renderLevelUpModal()}
      </View>
    );
  };

  const renderDifficultyDots = (difficulty: any) => {
    const total = difficulty.easy + difficulty.medium + difficulty.hard;
    const easyPercent = (difficulty.easy / total) * 100;
    const mediumPercent = (difficulty.medium / total) * 100;

    return (
      <View style={styles.difficultyBar}>
        <View style={[styles.difficultySegment, styles.easy, { flex: difficulty.easy }]} />
        <View style={[styles.difficultySegment, styles.medium, { flex: difficulty.medium }]} />
        <View style={[styles.difficultySegment, styles.hard, { flex: difficulty.hard }]} />
      </View>
    );
  };

  const renderTabBar = () => {
    const tabs = [
      { id: 'home', icon: '🏠', label: 'Home' },
      { id: 'leaderboard', icon: '🏆', label: 'Ranks' },
      { id: 'achievements', icon: '🎖️', label: 'Awards' },
      { id: 'profile', icon: '👤', label: 'Profile' },
    ];

    return tabs.map((tab) => (
      <TouchableOpacity
        key={tab.id}
        style={styles.tabItem}
        onPress={() => setSelectedTab(tab.id as any)}
      >
        <Animated.View
          style={[styles.tabIconContainer, selectedTab === tab.id && styles.tabActive]}
        >
          <Text style={[styles.tabIcon, selectedTab === tab.id && styles.tabIconActive]}>
            {tab.icon}
          </Text>
        </Animated.View>
        <Text style={[styles.tabLabel, selectedTab === tab.id && styles.tabLabelActive]}>
          {tab.label}
        </Text>
      </TouchableOpacity>
    ));
  };

  const renderPremiumModal = () => (
    <Animated.View style={styles.modalOverlay}>
      <TouchableOpacity
        style={StyleSheet.absoluteFillObject}
        onPress={() => setShowPremiumModal(false)}
      />
      <Animated.View style={[styles.premiumModal, { transform: [{ scale: scaleAnim }] }]}>
        <LinearGradient
          colors={['#667eea', '#764ba2', '#f093fb']}
          style={styles.premiumModalGradient}
        >
          <Text style={styles.premiumTitle}>🌟 Go Premium 🌟</Text>
          <Text style={styles.premiumSubtitle}>Unlock the full QuizMentor experience</Text>

          <View style={styles.premiumFeatures}>
            <View style={styles.premiumFeature}>
              <Text style={styles.premiumFeatureIcon}>❤️</Text>
              <Text style={styles.premiumFeatureText}>Unlimited Hearts</Text>
            </View>
            <View style={styles.premiumFeature}>
              <Text style={styles.premiumFeatureIcon}>🚀</Text>
              <Text style={styles.premiumFeatureText}>2x XP Boost</Text>
            </View>
            <View style={styles.premiumFeature}>
              <Text style={styles.premiumFeatureIcon}>🎯</Text>
              <Text style={styles.premiumFeatureText}>Advanced Analytics</Text>
            </View>
            <View style={styles.premiumFeature}>
              <Text style={styles.premiumFeatureIcon}>✨</Text>
              <Text style={styles.premiumFeatureText}>Premium Animations</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.premiumButton}>
            <Text style={styles.premiumButtonText}>Start Free Trial</Text>
            <Text style={styles.premiumPrice}>Then $9.99/month</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.premiumClose} onPress={() => setShowPremiumModal(false)}>
            <Text style={styles.premiumCloseText}>Maybe later</Text>
          </TouchableOpacity>
        </LinearGradient>
      </Animated.View>
    </Animated.View>
  );

  const renderLevelUpModal = () => (
    <Animated.View style={styles.modalOverlay}>
      <Animated.View
        style={[
          styles.levelUpModal,
          {
            transform: [
              { scale: scaleAnim },
              {
                rotate: glowAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '360deg'],
                }),
              },
            ],
          },
        ]}
      >
        <Text style={styles.levelUpTitle}>LEVEL UP!</Text>
        <Text style={styles.levelUpNumber}>Level {user?.level}</Text>

        <Animated.View style={[styles.levelUpRewards, { opacity: fadeAnim }]}>
          <Text style={styles.rewardText}>🎁 +50 Bonus XP</Text>
          <Text style={styles.rewardText}>🔓 New Challenges Unlocked</Text>
        </Animated.View>

        <TouchableOpacity
          style={styles.levelUpButton}
          onPress={() => {
            setShowLevelUpModal(false);
            triggerCelebration('large');
          }}
        >
          <Text style={styles.levelUpButtonText}>Awesome!</Text>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const startQuiz = (categoryId: string) => {
    const questions =
      categoryId === 'daily'
        ? unifiedQuizData.getAdaptiveQuestions(user?.level || 1, null, 10)
        : unifiedQuizData.getQuestionsByCategory(categoryId).slice(0, 10);

    setQuestions(questions);
    setCurrentQuestionIndex(0);
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setPerfectStreak(0);
    setLives(user?.isPremium ? 999 : 3);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setAppState('quiz-playing');

    // Animate transition
    animateScreenTransition();
  };

  // Quiz Screen with enhanced features
  const renderQuiz = () => {
    if (!questions.length || !questions[currentQuestionIndex]) return null;

    const question = questions[currentQuestionIndex];
    const progress = (currentQuestionIndex + 1) / questions.length;

    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#1a1a2e', '#16213e', '#0f3460']}
          style={StyleSheet.absoluteFillObject}
        />

        <WebContainer>
          <SafeAreaView style={styles.quizContainer}>
            {/* Quiz Header */}
            <Animated.View style={[styles.quizHeader, { transform: [{ translateX: shakeAnim }] }]}>
              <TouchableOpacity
                style={styles.quitButton}
                onPress={() => {
                  setAppState('home');
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                }}
              >
                <Text style={styles.quitButtonText}>✕</Text>
              </TouchableOpacity>

              <View style={styles.livesContainer}>
                {user?.isPremium ? (
                  <View style={styles.premiumLives}>
                    <Text style={styles.heart}>❤️</Text>
                    <Text style={styles.infinitySymbol}>∞</Text>
                  </View>
                ) : (
                  Array(3)
                    .fill(0)
                    .map((_, i) => (
                      <Animated.Text
                        key={i}
                        style={[
                          styles.heart,
                          i >= lives && styles.lostHeart,
                          i === lives - 1 && {
                            transform: [{ scale: heartBeatAnim }],
                          },
                        ]}
                      >
                        {i < lives ? '❤️' : '💔'}
                      </Animated.Text>
                    ))
                )}
              </View>

              <View style={styles.scoreContainer}>
                <Text style={styles.scoreText}>{score}</Text>
                {combo > 0 && (
                  <Animated.View
                    style={[
                      styles.comboContainer,
                      {
                        transform: [{ scale: comboScaleAnim }],
                        backgroundColor: getComboColor(combo),
                      },
                    ]}
                  >
                    <Text style={styles.comboText}>×{combo + 1}</Text>
                  </Animated.View>
                )}
              </View>
            </Animated.View>

            {/* Progress Bar */}
            <View style={styles.quizProgressBar}>
              <Animated.View
                style={[
                  styles.quizProgressFill,
                  {
                    width: `${progress * 100}%`,
                    backgroundColor: combo >= 3 ? '#f093fb' : '#667eea',
                  },
                ]}
              />
            </View>

            {/* Question */}
            <ScrollView style={styles.questionSection} showsVerticalScrollIndicator={false}>
              <View style={styles.questionHeader}>
                <Text style={styles.questionNumber}>
                  Question {currentQuestionIndex + 1} of {questions.length}
                </Text>
                <View
                  style={[
                    styles.difficultyBadge,
                    { backgroundColor: getDifficultyColor(question.difficulty) },
                  ]}
                >
                  <Text style={styles.difficultyText}>
                    {question.difficulty?.toUpperCase() || 'MEDIUM'}
                  </Text>
                </View>
              </View>

              <Animated.Text
                style={[styles.questionText, { transform: [{ translateX: slideAnim }] }]}
              >
                {question.question}
              </Animated.Text>

              {question.codeSnippet && (
                <View style={styles.codeBlock}>
                  <Text style={styles.codeBlockHeader}>Code:</Text>
                  <Text style={styles.codeText}>{question.codeSnippet}</Text>
                </View>
              )}

              {/* Options */}
              <View style={styles.optionsContainer}>
                {question.options.map((option: string, index: number) => {
                  const isSelected = selectedAnswer === index;
                  const isCorrect = index === question.correct;
                  const showResult = selectedAnswer !== null;
                  const animatedScale = new Animated.Value(1);

                  return (
                    <Pressable
                      key={index}
                      style={[
                        styles.optionButton,
                        isSelected && styles.selectedOption,
                        showResult && isCorrect && styles.correctOption,
                        showResult && isSelected && !isCorrect && styles.wrongOption,
                      ]}
                      onPressIn={() => {
                        if (!showResult) {
                          Animated.timing(animatedScale, {
                            toValue: 0.98,
                            duration: 100,
                            useNativeDriver: true,
                          }).start();
                        }
                      }}
                      onPressOut={() => {
                        Animated.spring(animatedScale, {
                          toValue: 1,
                          ...animConfig.springs,
                          useNativeDriver: true,
                        }).start();
                      }}
                      onPress={() => handleAnswer(index)}
                      disabled={selectedAnswer !== null}
                    >
                      <Animated.View
                        style={[styles.optionContent, { transform: [{ scale: animatedScale }] }]}
                      >
                        <View style={styles.optionLeft}>
                          <View
                            style={[
                              styles.optionLetter,
                              showResult && isCorrect && styles.correctLetter,
                              showResult && isSelected && !isCorrect && styles.wrongLetter,
                            ]}
                          >
                            <Text style={styles.optionLetterText}>
                              {String.fromCharCode(65 + index)}
                            </Text>
                          </View>
                          <Text
                            style={[
                              styles.optionText,
                              showResult && isCorrect && styles.correctOptionText,
                              showResult && isSelected && !isCorrect && styles.wrongOptionText,
                            ]}
                          >
                            {option}
                          </Text>
                        </View>
                        {showResult && isCorrect && (
                          <Animated.Text
                            style={[styles.checkmark, { transform: [{ scale: pulseAnim }] }]}
                          >
                            ✓
                          </Animated.Text>
                        )}
                        {showResult && isSelected && !isCorrect && (
                          <Text style={styles.cross}>✗</Text>
                        )}
                      </Animated.View>
                    </Pressable>
                  );
                })}
              </View>

              {/* Explanation */}
              {showExplanation && question.explanation && (
                <Animated.View
                  style={[
                    styles.explanationCard,
                    {
                      opacity: fadeAnim,
                      transform: [{ translateY: slideAnim }],
                    },
                  ]}
                >
                  <Text style={styles.explanationTitle}>💡 Explanation</Text>
                  <Text style={styles.explanationText}>{question.explanation}</Text>
                </Animated.View>
              )}
            </ScrollView>

            {/* Celebration Particles */}
            {renderParticles()}
          </SafeAreaView>
        </WebContainer>
      </View>
    );
  };

  const renderParticles = () => (
    <View style={styles.particlesContainer} pointerEvents="none">
      {particles.map((particle, i) => (
        <Animated.View
          key={i}
          style={[
            styles.particle,
            {
              transform: [
                { translateX: particle.x },
                { translateY: particle.y },
                { scale: particle.scale },
                {
                  rotate: particle.rotation.interpolate({
                    inputRange: [0, 360],
                    outputRange: ['0deg', '360deg'],
                  }),
                },
              ],
              opacity: particle.opacity,
              backgroundColor: ['#ff006e', '#8338ec', '#3a86ff', '#06ffa5', '#fbbf24'][i % 5],
            },
          ]}
        />
      ))}
    </View>
  );

  const handleAnswer = (answerIndex: number) => {
    if (selectedAnswer !== null) return;

    setSelectedAnswer(answerIndex);
    const isCorrect = answerIndex === questions[currentQuestionIndex].correct;

    if (isCorrect) {
      // Correct answer
      const newCombo = combo + 1;
      const comboMultiplier = 1 + newCombo * 0.5;
      const points = Math.floor(10 * comboMultiplier);

      setCombo(newCombo);
      setScore(score + points);
      setPerfectStreak(perfectStreak + 1);

      if (newCombo > maxCombo) {
        setMaxCombo(newCombo);
      }

      // Update user XP
      if (user) {
        const xpGained = user.isPremium ? points * 2 : points;
        const newXP = user.xp + xpGained;
        setUser({ ...user, xp: newXP });

        // Check for level up
        const xpForNextLevel = Math.floor(100 * Math.pow(user.level, 1.5));
        if (newXP >= xpForNextLevel) {
          handleLevelUp();
        }
      }

      // Animations
      triggerComboAnimation();
      if (newCombo >= 3) {
        triggerCelebration('medium');
      }
      if (perfectStreak === 5) {
        triggerCelebration('large');
      }

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else {
      // Wrong answer
      setCombo(0);
      setPerfectStreak(0);

      if (!user?.isPremium) {
        const newLives = lives - 1;
        setLives(newLives);
        triggerHeartLoss();

        if (newLives <= 0) {
          setTimeout(() => endQuiz(), 1000);
          return;
        }
      }

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }

    setShowExplanation(true);

    // Auto advance after delay
    setTimeout(
      () => {
        if (currentQuestionIndex < questions.length - 1) {
          setCurrentQuestionIndex(currentQuestionIndex + 1);
          setSelectedAnswer(null);
          setShowExplanation(false);
          animateScreenTransition();
        } else {
          endQuiz();
        }
      },
      isCorrect ? 1500 : 2000,
    );
  };

  const handleLevelUp = () => {
    if (!user) return;

    const newLevel = user.level + 1;
    setUser({ ...user, level: newLevel });
    setShowLevelUpModal(true);

    triggerCelebration('large');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const endQuiz = () => {
    // Update daily progress if it's daily challenge
    if (currentCategory === 'daily') {
      setDailyProgress(questions.length);
    }

    // Save progress
    if (user) {
      AsyncStorage.setItem('user', JSON.stringify(user));
    }

    setAppState('quiz-results');
  };

  const renderQuizResults = () => {
    const correctAnswers = Math.floor(score / 10);
    const accuracy = (correctAnswers / questions.length) * 100;
    const grade = getGrade(accuracy);

    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#1a1a2e', '#16213e', '#0f3460']}
          style={StyleSheet.absoluteFillObject}
        />

        <WebContainer>
          <SafeAreaView style={styles.resultsContainer}>
            <ScrollView
              contentContainerStyle={styles.resultsScrollContent}
              showsVerticalScrollIndicator={false}
            >
              <Animated.View style={[styles.resultsCard, { transform: [{ scale: scaleAnim }] }]}>
                <Text style={styles.resultsTitle}>Quiz Complete! 🎉</Text>

                {/* Grade Circle */}
                <View style={styles.gradeCircle}>
                  <LinearGradient colors={getGradeColors(grade)} style={styles.gradeGradient}>
                    <Text style={styles.gradeText}>{grade}</Text>
                    <Text style={styles.accuracyText}>{accuracy.toFixed(0)}%</Text>
                  </LinearGradient>
                </View>

                {/* Score Breakdown */}
                <View style={styles.scoreBreakdown}>
                  <View style={styles.scoreRow}>
                    <Text style={styles.scoreLabel}>Base Score</Text>
                    <Text style={styles.scoreValue}>{correctAnswers * 10}</Text>
                  </View>
                  <View style={styles.scoreRow}>
                    <Text style={styles.scoreLabel}>Combo Bonus</Text>
                    <Text style={styles.scoreValue}>+{score - correctAnswers * 10}</Text>
                  </View>
                  <View style={styles.scoreDivider} />
                  <View style={styles.scoreRow}>
                    <Text style={styles.scoreTotalLabel}>Total Score</Text>
                    <Text style={styles.scoreTotalValue}>{score}</Text>
                  </View>
                </View>

                {/* Stats */}
                <View style={styles.resultsStats}>
                  <View style={styles.resultStat}>
                    <Text style={styles.resultIcon}>🎯</Text>
                    <Text style={styles.resultValue}>
                      {correctAnswers}/{questions.length}
                    </Text>
                    <Text style={styles.resultLabel}>Correct</Text>
                  </View>
                  <View style={styles.resultStat}>
                    <Text style={styles.resultIcon}>🔥</Text>
                    <Text style={styles.resultValue}>{maxCombo}x</Text>
                    <Text style={styles.resultLabel}>Best Combo</Text>
                  </View>
                  <View style={styles.resultStat}>
                    <Text style={styles.resultIcon}>⭐</Text>
                    <Text style={styles.resultValue}>+{score}</Text>
                    <Text style={styles.resultLabel}>XP Earned</Text>
                  </View>
                </View>

                {/* Achievements Earned */}
                {newAchievements.length > 0 && (
                  <View style={styles.achievementsEarned}>
                    <Text style={styles.achievementsTitle}>New Achievements!</Text>
                    {newAchievements.map((achievement) => (
                      <View key={achievement.id} style={styles.achievementItem}>
                        <Text style={styles.achievementIcon}>{achievement.icon}</Text>
                        <View style={styles.achievementInfo}>
                          <Text style={styles.achievementName}>{achievement.title}</Text>
                          <Text style={styles.achievementDesc}>{achievement.description}</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                )}

                {/* Action Buttons */}
                <View style={styles.resultsActions}>
                  <TouchableOpacity
                    style={styles.primaryResultButton}
                    onPress={() => {
                      setAppState('home');
                      triggerCelebration('small');
                    }}
                  >
                    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.buttonGradient}>
                      <Text style={styles.primaryResultButtonText}>Continue</Text>
                    </LinearGradient>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.secondaryResultButton}
                    onPress={() => {
                      // Share results
                      Haptics.selectionAsync();
                    }}
                  >
                    <Text style={styles.secondaryResultButtonText}>Share Results 📤</Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            </ScrollView>
          </SafeAreaView>
        </WebContainer>
      </View>
    );
  };

  const getGrade = (accuracy: number): string => {
    if (accuracy >= 90) return 'A+';
    if (accuracy >= 80) return 'A';
    if (accuracy >= 70) return 'B';
    if (accuracy >= 60) return 'C';
    if (accuracy >= 50) return 'D';
    return 'F';
  };

  const getGradeColors = (grade: string): string[] => {
    switch (grade) {
      case 'A+':
      case 'A':
        return ['#4ade80', '#22c55e'];
      case 'B':
        return ['#3b82f6', '#2563eb'];
      case 'C':
        return ['#fbbf24', '#f59e0b'];
      case 'D':
        return ['#f97316', '#ea580c'];
      default:
        return ['#ef4444', '#dc2626'];
    }
  };

  const getComboColor = (combo: number): string => {
    if (combo >= 10) return '#f093fb'; // Pink
    if (combo >= 5) return '#fbbf24'; // Gold
    if (combo >= 3) return '#3b82f6'; // Blue
    return '#667eea'; // Purple
  };

  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
        return '#4ade80';
      case 'medium':
        return '#fbbf24';
      case 'hard':
        return '#f87171';
      default:
        return '#667eea';
    }
  };

  // Auth screens remain similar but with enhanced animations
  const renderAuthChoice = () => (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f3460']}
        style={StyleSheet.absoluteFillObject}
      />

      <WebContainer>
        <SafeAreaView style={styles.authContainer}>
          <View style={styles.authContent}>
            <Animated.Text
              style={[
                styles.appLogo,
                { transform: [{ scale: pulseAnim }, { translateY: floatAnim }] },
              ]}
            >
              🧠
            </Animated.Text>
            <Text style={styles.authTitle}>Welcome back!</Text>

            <View style={styles.authChoices}>
              <TouchableOpacity
                style={styles.authMethodButton}
                onPress={() => setAppState('auth-login')}
              >
                <LinearGradient colors={['#667eea', '#764ba2']} style={styles.authMethodGradient}>
                  <Text style={styles.authMethodText}>Login with Email</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity style={styles.authMethodButton}>
                <View style={styles.authMethodSocial}>
                  <Text style={styles.socialIcon}>📧</Text>
                  <Text style={styles.authMethodTextDark}>Continue with Google</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={styles.authMethodButton}>
                <View style={styles.authMethodSocial}>
                  <Text style={styles.socialIcon}>🐙</Text>
                  <Text style={styles.authMethodTextDark}>Continue with GitHub</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={styles.authFooter}
            onPress={() => {
              setAuthMode('signup');
              setAppState('auth-signup');
            }}
          >
            <Text style={styles.authFooterText}>
              Don't have an account? <Text style={styles.authFooterLink}>Sign up</Text>
            </Text>
          </TouchableOpacity>
        </SafeAreaView>
      </WebContainer>
    </Animated.View>
  );

  const renderAuthForm = () => {
    const isLogin = authMode === 'login';

    return (
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <LinearGradient
          colors={['#1a1a2e', '#16213e', '#0f3460']}
          style={StyleSheet.absoluteFillObject}
        />

        <WebContainer>
          <SafeAreaView style={styles.authContainer}>
            <ScrollView contentContainerStyle={styles.authScrollContent}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => setAppState('auth-choice')}
              >
                <Text style={styles.backButtonText}>←</Text>
              </TouchableOpacity>

              <View style={styles.authFormHeader}>
                <Text style={styles.authTitle}>{isLogin ? 'Welcome back!' : 'Create account'}</Text>
                <Text style={styles.authSubtitle}>
                  {isLogin ? 'Login to continue learning' : 'Start your journey'}
                </Text>
              </View>

              {authError ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{authError}</Text>
                </View>
              ) : null}

              <View style={styles.authForm}>
                {!isLogin && (
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Name</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="John Doe"
                      placeholderTextColor="rgba(255,255,255,0.3)"
                      value={authForm.name}
                      onChangeText={(text) => setAuthForm({ ...authForm, name: text })}
                      autoCapitalize="words"
                    />
                  </View>
                )}

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Email</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="john@example.com"
                    placeholderTextColor="rgba(255,255,255,0.3)"
                    value={authForm.email}
                    onChangeText={(text) => setAuthForm({ ...authForm, email: text })}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Password</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="••••••••"
                    placeholderTextColor="rgba(255,255,255,0.3)"
                    value={authForm.password}
                    onChangeText={(text) => setAuthForm({ ...authForm, password: text })}
                    secureTextEntry
                  />
                </View>

                {isLogin && (
                  <TouchableOpacity style={styles.forgotPassword}>
                    <Text style={styles.forgotPasswordText}>Forgot password?</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={[styles.primaryButton, authLoading && styles.disabledButton]}
                  onPress={handleAuth}
                  disabled={authLoading}
                >
                  {authLoading ? (
                    <ActivityIndicator color="#667eea" />
                  ) : (
                    <Text style={styles.primaryButtonText}>
                      {isLogin ? 'Login' : 'Create Account'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.authSwitch}
                onPress={() => {
                  setAuthMode(isLogin ? 'signup' : 'login');
                  setAuthError('');
                }}
              >
                <Text style={styles.authSwitchText}>
                  {isLogin ? "Don't have an account? " : 'Already have an account? '}
                  <Text style={styles.authSwitchLink}>{isLogin ? 'Sign up' : 'Login'}</Text>
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </SafeAreaView>
        </WebContainer>
      </KeyboardAvoidingView>
    );
  };

  const handleAuth = async () => {
    setAuthLoading(true);
    setAuthError('');

    try {
      // Simulate auth - in real app this would call Supabase
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Mock user creation
      const mockUser: User = {
        id: Date.now().toString(),
        name: authForm.name || 'Guest User',
        email: authForm.email,
        level: 1,
        xp: 0,
        streak: 0,
        hearts: 5,
        interests: selectedInterests,
        skillLevel: selectedSkillLevel || 'beginner',
        isPremium: false,
        achievements: [],
        dailyGoal: 10,
        soundEnabled: true,
        hapticsEnabled: true,
        notificationsEnabled: notificationPreference || false,
      };

      await AsyncStorage.setItem('user', JSON.stringify(mockUser));
      setUser(mockUser);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setAppState('home');

      // Show welcome animation
      triggerCelebration('large');
    } catch (error) {
      setAuthError('Authentication failed. Please try again.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setAuthLoading(false);
    }
  };

  // Main render
  switch (appState) {
    case 'loading':
      return (
        <View style={[styles.container, styles.centerContent]}>
          <ActivityIndicator size="large" color="#667eea" />
        </View>
      );
    case 'onboarding-welcome':
      return renderOnboardingWelcome();
    case 'onboarding-interests':
      return renderOnboardingInterests();
    case 'onboarding-skill':
      return renderOnboardingSkillLevel();
    case 'onboarding-notifications':
      return renderOnboardingNotifications();
    case 'auth-choice':
      return renderAuthChoice();
    case 'auth-login':
    case 'auth-signup':
      return renderAuthForm();
    case 'home':
      return renderHome();
    case 'quiz-playing':
      return renderQuiz();
    case 'quiz-results':
      return renderQuizResults();
    default:
      return renderHome();
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  webContainer: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  webContent: {
    flex: 1,
    width: '100%',
    maxWidth: isWeb ? MAX_WIDTH : '100%',
  },

  // Background elements
  backgroundOrb: {
    position: 'absolute',
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: '#667eea',
    top: -100,
    right: -100,
    opacity: 0.1,
  },

  // Onboarding
  onboardingContainer: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  onboardingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appLogo: {
    fontSize: 80,
    marginBottom: 20,
  },
  appTitle: {
    fontSize: 36,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 10,
  },
  appSubtitle: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 40,
  },
  featuresList: {
    marginTop: 40,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  featureText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  onboardingActions: {
    paddingBottom: 40,
  },
  primaryButton: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 15,
    overflow: 'hidden',
  },
  buttonGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 30,
  },
  primaryButtonText: {
    color: '#667eea',
    fontSize: 18,
    fontWeight: '700',
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  skipButtonText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
  },
  disabledButton: {
    opacity: 0.5,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    marginTop: 60,
    marginBottom: 20,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 2,
  },
  onboardingTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
  },
  onboardingSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 40,
    textAlign: 'center',
  },

  // Interests
  interestsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 20,
  },
  interestCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    margin: 8,
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  interestCardInner: {
    paddingVertical: 20,
    paddingHorizontal: 25,
    alignItems: 'center',
    position: 'relative',
  },
  interestCardSelected: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  interestIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  interestName: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  interestNameSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  checkmark: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
  },

  // Skill Level
  skillLevels: {
    marginTop: 20,
    width: '100%',
  },
  skillCard: {
    padding: 20,
    borderRadius: 20,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  skillCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  skillIcon: {
    fontSize: 40,
    marginRight: 15,
  },
  skillCardText: {
    flex: 1,
  },
  skillTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  skillSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  skillDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 20,
  },
  selectedIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedIndicatorText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },

  // Notifications
  notificationGraphic: {
    marginVertical: 40,
  },
  notificationEmoji: {
    fontSize: 80,
  },
  notificationBenefits: {
    marginTop: 20,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 15,
    borderRadius: 15,
  },
  benefitIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  benefitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  // Auth
  authContainer: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  authContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  authTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
  },
  authSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 30,
    textAlign: 'center',
  },
  authChoices: {
    width: '100%',
    maxWidth: 350,
    marginTop: 30,
  },
  authMethodButton: {
    marginBottom: 15,
  },
  authMethodGradient: {
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
  },
  authMethodText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  authMethodSocial: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  socialIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  authMethodTextDark: {
    color: '#1a1a2e',
    fontSize: 16,
    fontWeight: '600',
  },
  authFooter: {
    paddingBottom: 40,
    alignItems: 'center',
  },
  authFooterText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
  },
  authFooterLink: {
    color: '#667eea',
    fontWeight: '600',
  },
  authScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 0,
    padding: 10,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 24,
  },
  authFormHeader: {
    marginBottom: 30,
  },
  authForm: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: '#667eea',
    fontSize: 14,
  },
  authSwitch: {
    marginTop: 20,
    alignItems: 'center',
  },
  authSwitchText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
  },
  authSwitchLink: {
    color: '#667eea',
    fontWeight: '600',
  },
  errorContainer: {
    backgroundColor: 'rgba(248,113,113,0.2)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  errorText: {
    color: '#f87171',
    fontSize: 14,
    textAlign: 'center',
  },

  // Home
  homeContainer: {
    flex: 1,
  },
  homeScrollContent: {
    paddingBottom: 100,
  },
  homeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 12,
  },
  greeting: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  levelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  levelBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  levelText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  premiumBadge: {
    backgroundColor: 'rgba(255,215,0,0.2)',
    padding: 4,
    borderRadius: 8,
  },
  premiumIcon: {
    fontSize: 16,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  streakFlame: {
    fontSize: 20,
    marginRight: 5,
  },
  streakCount: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  heartContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  heartIcon: {
    fontSize: 20,
    marginRight: 5,
  },
  heartCount: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  xpSection: {
    paddingHorizontal: 20,
    marginVertical: 20,
  },
  xpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  xpLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
  },
  xpText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  xpBarContainer: {
    position: 'relative',
  },
  xpBar: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  xpFill: {
    height: '100%',
    backgroundColor: '#667eea',
    borderRadius: 4,
  },
  xpGlow: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    backgroundColor: '#667eea',
    borderRadius: 14,
    opacity: 0.3,
  },
  dailyChallenge: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#f093fb',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  dailyChallengeComplete: {
    opacity: 0.8,
  },
  dailyChallengeGradient: {
    padding: 20,
  },
  dailyChallengeContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dailyChallengeIcon: {
    fontSize: 40,
    marginRight: 15,
  },
  dailyChallengeText: {
    flex: 1,
  },
  dailyChallengeTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  dailyChallengeSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    marginTop: 2,
  },
  dailyChallengeProgress: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 3,
    marginTop: 15,
    overflow: 'hidden',
  },
  dailyChallengeProgressFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 3,
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  quickActionCard: {
    flex: 1,
    borderRadius: 15,
    overflow: 'hidden',
  },
  quickActionGradient: {
    padding: 20,
    alignItems: 'center',
  },
  quickActionIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  quickActionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  categoriesSection: {
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  sectionAction: {
    color: '#667eea',
    fontSize: 14,
    fontWeight: '600',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: '48%',
    marginBottom: 15,
    borderRadius: 20,
    overflow: 'hidden',
  },
  categoryGradient: {
    padding: 20,
    alignItems: 'center',
  },
  categoryIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  categoryName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  categoryStats: {
    alignItems: 'center',
  },
  categoryQuestions: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginBottom: 8,
  },
  categoryDifficulty: {
    flexDirection: 'row',
    gap: 2,
  },
  difficultyBar: {
    flexDirection: 'row',
    height: 3,
    borderRadius: 2,
    overflow: 'hidden',
    width: 60,
  },
  difficultySegment: {
    height: '100%',
  },
  easy: {
    backgroundColor: '#4ade80',
  },
  medium: {
    backgroundColor: '#fbbf24',
  },
  hard: {
    backgroundColor: '#f87171',
  },

  // Tab Bar
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#0f3460',
    flexDirection: 'row',
    paddingBottom: Platform.OS === 'ios' ? 25 : 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
  },
  tabIconContainer: {
    padding: 4,
  },
  tabIcon: {
    fontSize: 24,
    marginBottom: 4,
    opacity: 0.6,
  },
  tabIconActive: {
    opacity: 1,
  },
  tabLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#667eea',
  },
  tabLabelActive: {
    color: '#fff',
  },

  // Quiz
  quizContainer: {
    flex: 1,
  },
  quizHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  quitButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quitButtonText: {
    color: '#fff',
    fontSize: 18,
  },
  livesContainer: {
    flexDirection: 'row',
  },
  premiumLives: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,215,0,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 15,
  },
  infinitySymbol: {
    color: '#ffd700',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 4,
  },
  heart: {
    fontSize: 20,
    marginHorizontal: 2,
  },
  lostHeart: {
    opacity: 0.3,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
  },
  comboContainer: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    marginLeft: 8,
  },
  comboText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  quizProgressBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: 20,
    borderRadius: 2,
    overflow: 'hidden',
  },
  quizProgressFill: {
    height: '100%',
    backgroundColor: '#667eea',
    borderRadius: 2,
  },
  questionSection: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  questionNumber: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  questionText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '600',
    lineHeight: 30,
    marginBottom: 20,
  },
  codeBlock: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  codeBlockHeader: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    marginBottom: 8,
  },
  codeText: {
    color: '#4ade80',
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
    fontSize: 14,
    lineHeight: 20,
  },
  optionsContainer: {
    paddingBottom: 20,
  },
  optionButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 15,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  selectedOption: {
    borderColor: '#667eea',
    backgroundColor: 'rgba(102,126,234,0.2)',
  },
  correctOption: {
    borderColor: '#4ade80',
    backgroundColor: 'rgba(74,222,128,0.2)',
  },
  wrongOption: {
    borderColor: '#f87171',
    backgroundColor: 'rgba(248,113,113,0.2)',
  },
  optionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionLetter: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  correctLetter: {
    backgroundColor: '#4ade80',
  },
  wrongLetter: {
    backgroundColor: '#f87171',
  },
  optionLetterText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  optionText: {
    color: '#fff',
    fontSize: 16,
    flex: 1,
  },
  correctOptionText: {
    color: '#4ade80',
    fontWeight: '600',
  },
  wrongOptionText: {
    color: '#f87171',
    fontWeight: '600',
  },
  checkmark: {
    color: '#4ade80',
    fontSize: 24,
    fontWeight: '800',
  },
  cross: {
    color: '#f87171',
    fontSize: 24,
    fontWeight: '800',
  },
  explanationCard: {
    backgroundColor: 'rgba(102,126,234,0.1)',
    borderRadius: 15,
    padding: 20,
    marginTop: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#667eea',
  },
  explanationTitle: {
    color: '#667eea',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
  },
  explanationText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    lineHeight: 20,
  },
  particlesContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  particle: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
  },

  // Results
  resultsContainer: {
    flex: 1,
  },
  resultsScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  resultsCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 30,
    padding: 30,
    alignItems: 'center',
  },
  resultsTitle: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '900',
    marginBottom: 30,
    textAlign: 'center',
  },
  gradeCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    overflow: 'hidden',
    marginBottom: 30,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  gradeGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradeText: {
    color: '#fff',
    fontSize: 48,
    fontWeight: '900',
  },
  accuracyText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 20,
    fontWeight: '600',
  },
  scoreBreakdown: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 30,
    width: '100%',
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 5,
  },
  scoreLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
  },
  scoreValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  scoreDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginVertical: 10,
  },
  scoreTotalLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  scoreTotalValue: {
    color: '#667eea',
    fontSize: 20,
    fontWeight: '800',
  },
  resultsStats: {
    flexDirection: 'row',
    marginBottom: 30,
  },
  resultStat: {
    alignItems: 'center',
    flex: 1,
  },
  resultIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  resultValue: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  resultLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
  },
  achievementsEarned: {
    backgroundColor: 'rgba(147,51,234,0.1)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    width: '100%',
  },
  achievementsTitle: {
    color: '#9333ea',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 15,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  achievementIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  achievementDesc: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    marginTop: 2,
  },
  resultsActions: {
    width: '100%',
  },
  primaryResultButton: {
    marginBottom: 15,
    borderRadius: 25,
    overflow: 'hidden',
  },
  primaryResultButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    paddingVertical: 16,
  },
  secondaryResultButton: {
    borderWidth: 1,
    borderColor: '#667eea',
    borderRadius: 25,
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryResultButtonText: {
    color: '#667eea',
    fontSize: 16,
    fontWeight: '600',
  },

  // Modals
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  premiumModal: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 30,
    overflow: 'hidden',
  },
  premiumModalGradient: {
    padding: 30,
    alignItems: 'center',
  },
  premiumTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 10,
    textAlign: 'center',
  },
  premiumSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
    marginBottom: 30,
    textAlign: 'center',
  },
  premiumFeatures: {
    marginBottom: 30,
  },
  premiumFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
  },
  premiumFeatureIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  premiumFeatureText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  premiumButton: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 25,
    marginBottom: 15,
  },
  premiumButtonText: {
    color: '#667eea',
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
  premiumPrice: {
    color: '#667eea',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 4,
  },
  premiumClose: {
    padding: 10,
  },
  premiumCloseText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 16,
  },
  levelUpModal: {
    backgroundColor: '#fff',
    borderRadius: 30,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
    elevation: 20,
  },
  levelUpTitle: {
    color: '#667eea',
    fontSize: 36,
    fontWeight: '900',
    marginBottom: 10,
  },
  levelUpNumber: {
    color: '#764ba2',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 30,
  },
  levelUpRewards: {
    marginBottom: 30,
  },
  rewardText: {
    color: '#667eea',
    fontSize: 16,
    marginBottom: 8,
  },
  levelUpButton: {
    backgroundColor: '#667eea',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 25,
  },
  levelUpButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});
