/**
 * QuizMentor - Complete Modern Mobile Experience
 * Full app with onboarding, auth, gamification, and all features
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  Image,
  KeyboardAvoidingView,
  ActivityIndicator,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Services
import { unifiedQuizData } from './services/unifiedQuizData';
import { localProgress } from './src/services/localProgress';

// Components
import HomeScreenGameified from './src/screens/HomeScreenGameified';
import HomeScreenEpic from './src/screens/HomeScreenEpic';
import OnboardingEpic from './src/screens/OnboardingEpic';
import AuthChoiceEpic from './src/screens/AuthChoiceEpic';
import IntroAnimation from './src/components/IntroAnimation';
import LeaderboardScreenGameified from './src/screens/LeaderboardScreenGameified';
import AchievementsScreenGameified from './src/screens/AchievementsScreenGameified';
import ProfileScreenGameified from './src/screens/ProfileScreenGameified';
import { GameTour, useTourStatus } from './src/components/GameTour';
import QuizScreenEpic from './src/screens/QuizScreenEpic';
import ResultsScreenEpic from './src/screens/ResultsScreenEpic';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';
const MAX_WIDTH = 768; // Max width for web

// App States
type AppState =
  | 'loading'
  | 'onboarding-welcome'
  | 'onboarding-interests'
  | 'onboarding-skill'
  | 'auth-choice'
  | 'auth-login'
  | 'auth-signup'
  | 'home'
  | 'quiz-selection'
  | 'quiz-playing'
  | 'quiz-results'
  | 'profile'
  | 'leaderboard'
  | 'achievements';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  level: number;
  xp: number;
  streak: number;
  interests: string[];
  skillLevel: 'beginner' | 'intermediate' | 'expert';
}

export default function AppModernComplete() {
  // App State - PROPER FLOW: SPLASH → LOGIN → ONBOARDING → HOME
  const [appState, setAppState] = useState<AppState>('loading');
  const [user, setUser] = useState<User | null>(null);
  const [isFirstLaunch, setIsFirstLaunch] = useState(true);

  // Fallback state to prevent white screen
  const [transitionFailed, setTransitionFailed] = useState(false);

  // Tour State
  const { shouldShowTour, isLoading: tourLoading, markTourComplete } = useTourStatus();
  const [showTour, setShowTour] = useState(false);

  // Intro Animation State - RESTORED FOR PROPER FLOW
  const [showIntro, setShowIntro] = useState(true);

  // Onboarding State
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedSkillLevel, setSelectedSkillLevel] = useState<
    'beginner' | 'intermediate' | 'expert' | null
  >(null);

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
  const [lives, setLives] = useState(3);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  // UI State
  const [selectedTab, setSelectedTab] = useState<
    'home' | 'leaderboard' | 'achievements' | 'profile'
  >('home');
  const [dailyProgress, setDailyProgress] = useState(0);

  // Animations - Start visible for immediate display
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const onboardingProgress = useRef(new Animated.Value(0)).current;

  // Initialize app
  useEffect(() => {
    initializeApp();

    // Fallback timeout to prevent getting stuck
    const fallbackTimeout = setTimeout(() => {
      if (appState === 'loading') {
        console.log('Fallback: transitioning to onboarding-welcome');
        setAppState('onboarding-welcome');
      }
    }, 10000); // 10 seconds

    return () => clearTimeout(fallbackTimeout);
  }, []);

  // Force animations to be visible
  useEffect(() => {
    if (appState !== 'loading' && appState !== 'home') {
      console.log('Forcing animations to be visible for appState:', appState);
      fadeAnim.setValue(1);
      slideAnim.setValue(0);
      scaleAnim.setValue(1);
    }
  }, [appState, fadeAnim, slideAnim, scaleAnim]);

  const initializeApp = async () => {
    try {
      // Check if user exists
      const savedUser = await AsyncStorage.getItem('user');
      const hasOnboarded = await AsyncStorage.getItem('hasOnboarded');

      // Store the app state to transition to after intro
      if (savedUser) {
        setUser(JSON.parse(savedUser));
        setIsFirstLaunch(false);
        // Will transition to 'home' after intro
      } else if (hasOnboarded) {
        setIsFirstLaunch(false);
        // Will transition to 'auth-choice' after intro
      } else {
        // Will transition to 'onboarding-welcome' after intro
      }

      // Keep intro animation visible, don't change appState yet
      console.log('App initialized, showing intro animation...');
    } catch (error) {
      console.error('Failed to initialize app:', error);
      // Will transition to 'onboarding-welcome' after intro
    }
  };

  // Animations
  const animateScreenTransition = (direction: 'forward' | 'back' = 'forward') => {
    const fromValue = direction === 'forward' ? SCREEN_WIDTH : -SCREEN_WIDTH;
    slideAnim.setValue(fromValue);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      fadeAnim.setValue(1);
    });

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const animatePulse = () => {
    Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 1.1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Onboarding Flow
  const renderOnboardingWelcome = () => (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <LinearGradient
        colors={['#4f46e5', '#7c3aed']} // Professional indigo to deep purple
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <SafeAreaView style={styles.onboardingContainer}>
        <View style={styles.onboardingContent}>
          <Animated.Text style={[styles.appLogo, { transform: [{ scale: pulseAnim }] }]}>
            🧠
          </Animated.Text>
          <Text style={styles.appTitle}>QuizMentor</Text>
          <Text style={styles.appSubtitle}>Level up your knowledge</Text>

          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🎯</Text>
              <Text style={styles.featureText}>Adaptive learning</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🏆</Text>
              <Text style={styles.featureText}>Compete with friends</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🔥</Text>
              <Text style={styles.featureText}>Build streaks</Text>
            </View>
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
            <Text style={styles.primaryButtonText}>Get Started</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.skipButton}
            onPress={() => {
              AsyncStorage.setItem('hasOnboarded', 'true');
              setAppState('auth-choice');
            }}
          >
            <Text style={styles.skipButtonText}>I have an account</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Animated.View>
  );

  const renderOnboardingInterests = () => {
    const interests = [
      { id: 'tech', icon: '💻', name: 'Technology' },
      { id: 'science', icon: '🔬', name: 'Science' },
      { id: 'history', icon: '📜', name: 'History' },
      { id: 'arts', icon: '🎨', name: 'Arts' },
      { id: 'business', icon: '💼', name: 'Business' },
      { id: 'language', icon: '🗣️', name: 'Languages' },
      { id: 'math', icon: '🔢', name: 'Mathematics' },
      { id: 'nature', icon: '🌿', name: 'Nature' },
    ];

    return (
      <Animated.View style={[styles.container, { transform: [{ translateX: slideAnim }] }]}>
        <LinearGradient
          colors={['#4f46e5', '#7c3aed']} // Professional indigo to deep purple
          style={StyleSheet.absoluteFillObject}
        />

        <SafeAreaView style={styles.onboardingContainer}>
          <View style={styles.progressBar}>
            <Animated.View style={[styles.progressFill, { width: '33%' }]} />
          </View>

          <View style={styles.onboardingContent}>
            <Text style={styles.onboardingTitle}>What interests you?</Text>
            <Text style={styles.onboardingSubtitle}>Choose at least 3 topics</Text>

            <View style={styles.interestsGrid}>
              {interests.map((interest) => {
                const isSelected = selectedInterests.includes(interest.id);
                return (
                  <TouchableOpacity
                    key={interest.id}
                    style={[styles.interestCard, isSelected && styles.interestCardSelected]}
                    onPress={() => {
                      if (isSelected) {
                        setSelectedInterests((prev) => prev.filter((i) => i !== interest.id));
                      } else {
                        setSelectedInterests((prev) => [...prev, interest.id]);
                      }
                      animatePulse();
                      Haptics.selectionAsync();
                    }}
                  >
                    <Text style={styles.interestIcon}>{interest.icon}</Text>
                    <Text style={[styles.interestName, isSelected && styles.interestNameSelected]}>
                      {interest.name}
                    </Text>
                    {isSelected && (
                      <View style={styles.checkmark}>
                        <Text style={styles.checkmarkText}>✓</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.onboardingActions}>
            <TouchableOpacity
              style={[styles.primaryButton, selectedInterests.length < 3 && styles.disabledButton]}
              onPress={() => {
                if (selectedInterests.length >= 3) {
                  animateScreenTransition();
                  setAppState('onboarding-skill');
                }
              }}
              disabled={selectedInterests.length < 3}
            >
              <Text style={styles.primaryButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Animated.View>
    );
  };

  const renderOnboardingSkillLevel = () => {
    const skillLevels = [
      {
        id: 'beginner',
        title: 'Beginner',
        subtitle: 'Just starting out',
        icon: '🌱',
        color: '#4ade80',
      },
      {
        id: 'intermediate',
        title: 'Intermediate',
        subtitle: 'Some experience',
        icon: '🌿',
        color: '#fbbf24',
      },
      {
        id: 'expert',
        title: 'Expert',
        subtitle: 'Very experienced',
        icon: '🌳',
        color: '#f87171',
      },
    ];

    return (
      <Animated.View style={[styles.container, { transform: [{ translateX: slideAnim }] }]}>
        <LinearGradient
          colors={['#4f46e5', '#7c3aed']} // Professional indigo to deep purple
          style={StyleSheet.absoluteFillObject}
        />

        <SafeAreaView style={styles.onboardingContainer}>
          <View style={styles.progressBar}>
            <Animated.View style={[styles.progressFill, { width: '66%' }]} />
          </View>

          <View style={styles.onboardingContent}>
            <Text style={styles.onboardingTitle}>What's your skill level?</Text>
            <Text style={styles.onboardingSubtitle}>We'll adapt questions to match</Text>

            <View style={styles.skillLevels}>
              {skillLevels.map((level) => {
                const isSelected = selectedSkillLevel === level.id;
                return (
                  <TouchableOpacity
                    key={level.id}
                    style={[
                      styles.skillCard,
                      isSelected && { borderColor: level.color, borderWidth: 3 },
                    ]}
                    onPress={() => {
                      setSelectedSkillLevel(level.id as any);
                      animatePulse();
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    }}
                  >
                    <Text style={styles.skillIcon}>{level.icon}</Text>
                    <Text style={styles.skillTitle}>{level.title}</Text>
                    <Text style={styles.skillSubtitle}>{level.subtitle}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.onboardingActions}>
            <TouchableOpacity
              style={[styles.primaryButton, !selectedSkillLevel && styles.disabledButton]}
              onPress={async () => {
                if (selectedSkillLevel) {
                  await AsyncStorage.setItem('hasOnboarded', 'true');
                  animateScreenTransition();
                  setAppState('auth-choice');
                }
              }}
              disabled={!selectedSkillLevel}
            >
              <Text style={styles.primaryButtonText}>Complete Setup</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Animated.View>
    );
  };

  // Auth Screens
  const renderAuthChoice = () => (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <LinearGradient
        colors={['#1e293b', '#334155']} // Professional dark slate gradient
        style={StyleSheet.absoluteFillObject}
      />

      <SafeAreaView style={styles.authContainer}>
        <View style={styles.authContent}>
          <Text style={styles.appLogo}>🧠</Text>
          <Text style={styles.authTitle}>Welcome back!</Text>

          <View style={styles.authChoices}>
            <TouchableOpacity
              style={styles.authMethodButton}
              onPress={() => setAppState('auth-login')}
            >
              <LinearGradient
                colors={['#1d4ed8', '#0d9488']} // Professional blue to teal
                style={styles.authMethodGradient}
              >
                <Text style={styles.authMethodText}>Login with Email</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.authMethodButton}>
              <View style={styles.authMethodSocial}>
                <Text style={styles.socialIcon}>📧</Text>
                <Text style={styles.authMethodTextDark}>Continue with Google</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.authMethodButton, { marginTop: 20 }]}
              onPress={() => {
                // Quick demo login
                handleAuth();
              }}
            >
              <View style={[styles.authMethodSocial, { backgroundColor: '#22c55e' }]}>
                <Text style={styles.socialIcon}>🚀</Text>
                <Text style={[styles.authMethodTextDark, { color: '#fff' }]}>
                  Demo Login (Quick Start)
                </Text>
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
          colors={['#1e293b', '#334155']} // Professional dark slate gradient
          style={StyleSheet.absoluteFillObject}
        />

        <SafeAreaView style={styles.authContainer}>
          <ScrollView contentContainerStyle={styles.authScrollContent}>
            <TouchableOpacity style={styles.backButton} onPress={() => setAppState('auth-choice')}>
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
                  <ActivityIndicator color="#fff" />
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
      </KeyboardAvoidingView>
    );
  };

  const handleAuth = async () => {
    setAuthLoading(true);
    setAuthError('');

    try {
      // Simulate auth - in real app this would call Supabase
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Create demo user for development
      const mockUser: User = {
        id: Date.now().toString(),
        name: 'Demo User',
        email: 'demo@quizmentor.com',
        level: 5,
        xp: 1250,
        streak: 7,
        interests: ['javascript', 'react', 'typescript'],
        skillLevel: 'intermediate',
      };

      await AsyncStorage.setItem('user', JSON.stringify(mockUser));
      setUser(mockUser);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Check if user has onboarded - if not, show onboarding AFTER login
      const hasOnboarded = await AsyncStorage.getItem('hasOnboarded');
      if (!hasOnboarded) {
        setAppState('onboarding-welcome');
        console.log('Auth completed, showing onboarding for new user');
      } else {
        setAppState('home');
        console.log('Auth completed, user set:', mockUser.name, 'appState: home');
      }
    } catch (error) {
      console.error('Auth error:', error);
      setAuthError('Authentication failed. Please try again.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setAuthLoading(false);
    }
  };

  // Home Screen - Now using the new portfolio-style version
  const renderHome = () => {
    if (!user) {
      // Show loading while user is being set
      return (
        <View style={[styles.container, styles.centerContent]}>
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text style={{ color: '#FFFFFF', marginTop: 20 }}>Loading user...</Text>
        </View>
      );
    }

    return (
      <>
        <HomeScreenEpic
          user={user}
          onCategorySelect={(category) => {
            console.log('Category selected:', category);
            startQuiz(category);
          }}
          onStartLearning={() => {
            console.log('Start learning pressed');
            // Start with JavaScript by default
            startQuiz('javascript');
          }}
        />

        {/* Game Tour - can be triggered manually */}
        <GameTour
          visible={showTour}
          onComplete={() => {
            setShowTour(false);
            markTourComplete();
          }}
        />
      </>
    );
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
    setLives(3);
    setSelectedAnswer(null);
    setAppState('quiz-playing');
  };

  // Quiz Screen - Now using epic quiz screen - CLEAN VERSION
  const renderQuiz = () => {
    return <QuizScreenEpic route={{ params: { category: 'JavaScript' } }} />;
  };

  const handleAnswer = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
    const isCorrect = answerIndex === questions[currentQuestionIndex].correct;

    if (isCorrect) {
      const points = 10 * (combo + 1);
      setScore(score + points);
      setCombo(combo + 1);

      // Update user XP
      if (user) {
        const newXP = user.xp + points;
        setUser({ ...user, xp: newXP });
      }

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else {
      setCombo(0);
      setLives(lives - 1);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

      if (lives <= 1) {
        setTimeout(() => endQuiz(), 1000);
        return;
      }
    }

    // Auto advance
    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswer(null);
      } else {
        endQuiz();
      }
    }, 1500);
  };

  const endQuiz = () => {
    // Update daily progress if it's daily challenge
    if (currentCategory === 'daily') {
      setDailyProgress(questions.length);
    }

    setAppState('quiz-results');
  };

  const renderQuizResults = () => {
    return (
      <ResultsScreenEpic
        route={{ params: { score, totalQuestions: questions.length, category: currentCategory } }}
      />
    );
  };

  // Show intro animation first
  useEffect(() => {
    if (showIntro) {
      // Auto-transition after 5.5 seconds
      const timer = setTimeout(() => {
        setShowIntro(false);
        if (isFirstLaunch) {
          setAppState('onboarding-welcome');
        } else {
          setAppState('auth-choice');
        }
      }, 5500);

      return () => clearTimeout(timer);
    }
  }, [showIntro, isFirstLaunch]);

  if (showIntro) {
    return (
      <IntroAnimation
        onComplete={() => {
          // Backup completion handler
          console.log('Intro animation completed!');
          console.log('isFirstLaunch:', isFirstLaunch);
          setShowIntro(false);

          // Add a small delay to ensure state updates properly
          setTimeout(() => {
            if (isFirstLaunch) {
              console.log('Transitioning to onboarding-welcome');
              setAppState('onboarding-welcome');
            } else {
              console.log('Transitioning to auth-choice');
              setAppState('auth-choice');
            }
          }, 100);
        }}
      />
    );
  }

  // Main render
  console.log('Current appState:', appState);

  switch (appState) {
    case 'loading':
      return (
        <View style={[styles.container, styles.centerContent]}>
          <ActivityIndicator size="large" color="#667eea" />
          <Text style={{ color: '#FFFFFF', marginTop: 20 }}>Loading...</Text>
        </View>
      );
    case 'onboarding-welcome':
      console.log('Rendering onboarding-welcome');
      return (
        <OnboardingEpic
          onGetStarted={() => {
            console.log('Get Started pressed');
            setAppState('onboarding-interests');
          }}
          onSkip={() => {
            console.log('Skip pressed');
            AsyncStorage.setItem('hasOnboarded', 'true');
            setAppState('auth-choice');
          }}
        />
      );
    case 'onboarding-interests':
      return renderOnboardingInterests();
    case 'onboarding-skill':
      return renderOnboardingSkillLevel();
    case 'auth-choice':
      console.log('Rendering auth-choice');
      return (
        <AuthChoiceEpic
          onEmailLogin={() => {
            console.log('Email login pressed');
            setAuthMode('login');
            setAppState('auth-login');
          }}
          onGoogleLogin={() => {
            console.log('Google login pressed');
            // TODO: Implement Google OAuth
          }}
          onGitHubLogin={() => {
            console.log('GitHub login pressed');
            // TODO: Implement GitHub OAuth
          }}
          onDemoLogin={() => {
            console.log('Demo login pressed');
            handleAuth();
          }}
          onSignup={() => {
            console.log('Signup pressed');
            setAuthMode('signup');
            setAppState('auth-signup');
          }}
        />
      );
    case 'auth-login':
    case 'auth-signup':
      return renderAuthForm();
    case 'home':
      console.log('Rendering home');
      return renderHome();
    case 'leaderboard':
      return <LeaderboardScreenGameified />;
    case 'achievements':
      return <AchievementsScreenGameified />;
    case 'profile':
      return <ProfileScreenGameified />;
    case 'quiz-playing':
      return renderQuiz();
    case 'quiz-results':
      return renderQuizResults();
    default:
      console.log('Default case - rendering home');
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
  },
  featureIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  featureText: {
    fontSize: 16,
    color: '#fff',
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
    paddingVertical: 20,
    paddingHorizontal: 25,
    borderRadius: 20,
    margin: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  interestCardSelected: {
    borderColor: '#fff',
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
    backgroundColor: '#fff',
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    color: '#667eea',
    fontSize: 12,
    fontWeight: '800',
  },

  // Skill Level
  skillLevels: {
    marginTop: 20,
  },
  skillCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 20,
    borderRadius: 20,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  skillIcon: {
    fontSize: 40,
    marginRight: 20,
  },
  skillTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  skillSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
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
  homeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  levelBadge: {
    backgroundColor: '#667eea',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  levelText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
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
  dailyChallenge: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
  },
  dailyChallengeGradient: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dailyChallengeContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dailyChallengeIcon: {
    fontSize: 32,
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
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  dailyChallengeProgressText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  categoriesSection: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 15,
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
  categoryQuestions: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
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
  tabIcon: {
    fontSize: 24,
    marginBottom: 4,
    opacity: 0.6,
  },
  tabLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
  },
  tabActive: {
    opacity: 1,
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
  heart: {
    fontSize: 20,
    marginHorizontal: 2,
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
    backgroundColor: '#f093fb',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  comboText: {
    color: '#fff',
    fontSize: 12,
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
    paddingTop: 40,
    paddingBottom: 20,
  },
  questionNumber: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    marginBottom: 10,
  },
  questionText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '600',
    lineHeight: 30,
  },
  codeBlock: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  codeText: {
    color: '#4ade80',
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace' }),
    fontSize: 14,
  },
  optionsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  optionButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 18,
    borderRadius: 15,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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

  // Results
  resultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  resultsTitle: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '900',
    marginBottom: 40,
  },
  scoreCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(102,126,234,0.2)',
    borderWidth: 4,
    borderColor: '#667eea',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  finalScore: {
    color: '#fff',
    fontSize: 48,
    fontWeight: '900',
  },
  scoreLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    letterSpacing: 1,
  },
  resultsStats: {
    flexDirection: 'row',
    marginBottom: 40,
  },
  resultStat: {
    alignItems: 'center',
    marginHorizontal: 20,
  },
  resultValue: {
    color: '#4ade80',
    fontSize: 24,
    fontWeight: '700',
  },
  resultLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    marginTop: 4,
  },

  // Common
  checkmark: {
    color: '#4ade80',
    fontSize: 20,
    fontWeight: '800',
  },
  cross: {
    color: '#f87171',
    fontSize: 20,
    fontWeight: '800',
  },
});
