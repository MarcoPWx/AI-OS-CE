/**
 * QuizMentor - Professional Refined Version
 * Cohesive design system with dark theme and consistent branding
 */

import React, { useState, useEffect, useRef } from 'react';
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
  ActivityIndicator,
  KeyboardAvoidingView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Services
import { unifiedQuizData } from './services/unifiedQuizData';

// Components
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
import { AuthProvider, useAuth } from './src/contexts/AuthContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Professional Color Scheme - Consistent throughout
const colors = {
  // Primary brand colors - professional blue
  primary: {
    main: '#0ea5e9', // Bright blue
    dark: '#0369a1', // Dark blue
    darker: '#075985', // Darker blue
    light: '#38bdf8', // Light blue
    lighter: '#7dd3fc', // Lighter blue
  },

  // Dark backgrounds - no more purple/pink gradients
  background: {
    primary: '#0f172a', // Very dark navy
    secondary: '#1e293b', // Dark navy
    tertiary: '#334155', // Medium dark
    elevated: '#475569', // Elevated surface
  },

  // Accent colors - reduced and professional
  accent: {
    success: '#10b981', // Green
    warning: '#f59e0b', // Amber
    error: '#ef4444', // Red
    info: '#3b82f6', // Blue
  },

  // Text colors
  text: {
    primary: '#f8fafc', // Almost white
    secondary: '#cbd5e1', // Light gray
    tertiary: '#94a3b8', // Medium gray
    muted: '#64748b', // Muted gray
  },
};

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
  | 'quiz-playing'
  | 'quiz-results'
  | 'profile'
  | 'leaderboard'
  | 'achievements';

interface User {
  id: string;
  name: string;
  email: string;
  level: number;
  xp: number;
  streak: number;
  interests: string[];
  skillLevel: 'beginner' | 'intermediate' | 'expert';
}

export default function AppProfessionalRefined() {
  // App State
  const [appState, setAppState] = useState<AppState>('loading');
  const [user, setUser] = useState<User | null>(null);
  const [isFirstLaunch, setIsFirstLaunch] = useState(true);

  // Tour State
  const { shouldShowTour, markTourComplete } = useTourStatus();
  const [showTour, setShowTour] = useState(false);

  // Force-enable tour when ?tour=1 or EXPO_PUBLIC_TOUR_DEFAULT=1; enforce ignores suppression
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const sp = new URLSearchParams(window.location.search);
      const enforce = (process.env.EXPO_PUBLIC_TOUR_ENFORCE === '1') || (process.env.NEXT_PUBLIC_TOUR_ENFORCE === '1');
      if (enforce) {
        setShowTour(true);
        return;
      }
      const tourParam = (sp.get('tour') || '').toLowerCase();
      const forceTour =
        tourParam === '1' ||
        tourParam === 'true' ||
        process.env.EXPO_PUBLIC_TOUR_DEFAULT === '1' ||
        process.env.NEXT_PUBLIC_TOUR_AUTO === '1';
      if (forceTour) {
        setShowTour(true);
      } else if (shouldShowTour) {
        setShowTour(true);
      }
    } catch {}
  }, [shouldShowTour]);

  // Intro Animation State
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
  // Email login state (for 'auth-login')
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Game State
  const [currentCategory, setCurrentCategory] = useState<string | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [lives, setLives] = useState(3);
  // Track last quiz total for results screen
  const [lastTotalQuestions, setLastTotalQuestions] = useState(0);

  // Animations
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // E2E/Test harness URL mapping (web only)
  const urlHintsRef = useRef<{
    skipIntro: boolean;
    start?: string;
    category?: string;
    path?: string;
    timerSeconds?: number;
  } | null>(null);
  if (typeof window !== 'undefined' && !urlHintsRef.current) {
    try {
      const sp = new URLSearchParams(window.location.search);
      const skipIntro =
        sp.get('skipIntro') === '1' || sp.get('intro') === '0' || sp.get('noIntro') === '1';
      const start = sp.get('start') || undefined; // e.g. 'home' | 'quiz' | 'results' | 'auth'
      const category = sp.get('category') || sp.get('cat') || undefined;
      const path = window.location.pathname;
      // Timer hints for E2E: /quiz?timer=1&duration=10
      const timerEnabled = sp.get('timer') === '1' || sp.get('timed') === '1';
      const durationRaw = sp.get('duration') || sp.get('seconds');
      const duration = durationRaw ? parseInt(durationRaw, 10) : NaN;
      const timerSeconds =
        timerEnabled || !Number.isNaN(duration)
          ? Math.max(1, Number.isNaN(duration) ? 10 : duration)
          : undefined;
      urlHintsRef.current = { skipIntro, start, category, path, timerSeconds };
      if (skipIntro) {
        // Apply immediately to avoid rendering intro
        // eslint-disable-next-line react-hooks/rules-of-hooks
        setShowIntro(false);
      }
    } catch {}
  }

  // Initialize mocks (RN) if enabled
  useEffect(() => {
    const useMocks =
      process.env.USE_MOCKS === 'true' || process.env.EXPO_PUBLIC_USE_ALL_MOCKS === '1';
    if (useMocks) {
      // Dynamically import to avoid bundling in prod
      import('./src/services/mockIntegration')
        .then((mod) => mod.getMockIntegration?.())
        .then(async (integration) => {
          if (integration) {
            try {
              await integration.initialize();
            } catch {}
          }
        })
        .catch(() => {});
    }
  }, []);

  // Subscribe to AuthService (mock or real)
  useEffect(() => {
    const unsubscribe = authService.subscribe((state) => {
      if (state.user) {
        const mappedUser: User = {
          id: state.user.id,
          name:
            (state.user as any).user_metadata?.name ||
            (state.user as any).profile?.display_name ||
            'User',
          email: state.user.email || 'user@quizmentor.local',
          level: (state.user as any).profile?.level ?? 1,
          xp: (state.user as any).profile?.xp ?? 0,
          streak: (state.user as any).profile?.current_streak ?? 0,
          interests: [],
          skillLevel: 'intermediate',
        };
        setUser(mappedUser);
        AsyncStorage.setItem('user', JSON.stringify(mappedUser));
        setAppState('home');
      }
    });
    return unsubscribe;
  }, []);

  // Initialize app
  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      const savedUser = await AsyncStorage.getItem('user');
      const hasOnboarded = await AsyncStorage.getItem('hasOnboarded');

      if (savedUser) {
        setUser(JSON.parse(savedUser));
        setIsFirstLaunch(false);
      } else if (hasOnboarded) {
        setIsFirstLaunch(false);
      }
    } catch (error) {
      console.error('Failed to initialize app:', error);
    }
  };

  // Animations
  const animateScreenTransition = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: SCREEN_WIDTH,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      fadeAnim.setValue(1);
      slideAnim.setValue(0);
    });

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const animatePulse = () => {
    Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 1.05,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Onboarding Welcome Screen - Refined
  const renderOnboardingWelcome = () => (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <LinearGradient
        colors={[colors.background.primary, colors.background.secondary]}
        style={StyleSheet.absoluteFillObject}
      />

      <SafeAreaView style={styles.onboardingContainer}>
        <View style={styles.onboardingContent}>
          <Animated.Text style={[styles.appLogo, { transform: [{ scale: pulseAnim }] }]}>
            🧠
          </Animated.Text>
          <Text style={styles.appTitle}>QuizMentor</Text>
          <Text style={styles.appSubtitle}>Master Your Craft</Text>

          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <View style={styles.featureIconBg}>
                <Text style={styles.featureIcon}>🎯</Text>
              </View>
              <View style={styles.featureTextContainer}>
                <Text style={styles.featureTitle}>Adaptive Learning</Text>
                <Text style={styles.featureSubtext}>Questions that match your level</Text>
              </View>
            </View>
            <View style={styles.featureItem}>
              <View style={styles.featureIconBg}>
                <Text style={styles.featureIcon}>📊</Text>
              </View>
              <View style={styles.featureTextContainer}>
                <Text style={styles.featureTitle}>Track Progress</Text>
                <Text style={styles.featureSubtext}>Detailed analytics & insights</Text>
              </View>
            </View>
            <View style={styles.featureItem}>
              <View style={styles.featureIconBg}>
                <Text style={styles.featureIcon}>🏆</Text>
              </View>
              <View style={styles.featureTextContainer}>
                <Text style={styles.featureTitle}>Compete & Achieve</Text>
                <Text style={styles.featureSubtext}>Leaderboards & achievements</Text>
              </View>
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
            <LinearGradient
              colors={[colors.primary.main, colors.primary.dark]}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.primaryButtonText}>Get Started</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => {
              AsyncStorage.setItem('hasOnboarded', 'true');
              setAppState('auth-choice');
            }}
          >
            <Text style={styles.secondaryButtonText}>I have an account</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Animated.View>
  );

  // Auth Handler (Demo)
  const handleAuth = async () => {
    setAuthLoading(true);
    setAuthError('');

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

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
      setAppState('home');
    } catch (error) {
      console.error('Auth error:', error);
      setAuthError('Authentication failed. Please try again.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setAuthLoading(false);
    }
  };

  // Home Screen
  const renderHome = () => {
    if (!user) {
      return (
        <View style={[styles.container, styles.centerContent]}>
          <ActivityIndicator size="large" color={colors.primary.main} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      );
    }

    return (
      <>
        <HomeScreenEpic
          user={user}
          onCategorySelect={(category) => {
            startQuiz(category);
          }}
          onStartLearning={() => {
            startQuiz('javascript');
          }}
        />

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
    const cat = categoryId || 'javascript';
    try {
      const fetched = unifiedQuizData.getQuestionsByCategory(cat);
      const prepared =
        fetched && fetched.length > 0
          ? fetched.slice(0, 10)
          : unifiedQuizData.getRandomQuestionsFromAll(10);
      setQuestions(prepared);
      setLastTotalQuestions(prepared.length);
    } catch (e) {
      console.warn('Failed to load questions, using fallback', e);
      const fallback = unifiedQuizData.getRandomQuestionsFromAll(10);
      setQuestions(fallback);
      setLastTotalQuestions(fallback.length);
    }
    setCurrentQuestionIndex(0);
    setScore(0);
    setCombo(0);
    setLives(3);
    setCurrentCategory(cat);
    setAppState('quiz-playing');
  };

  // Show intro animation
  useEffect(() => {
    if (showIntro) {
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

  // Apply URL mapping after intro is disabled
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hints = urlHintsRef.current;
    if (!hints) return;
    if (showIntro) return;

    // Priority: explicit start query param, then pathname
    const p = (hints.path || '').toLowerCase();
    const start = (hints.start || '').toLowerCase();

    // Tour landing: auto-open tour and route to home
    if (p === '/tour') {
      setAppState('home');
      setShowTour(true);
      try {
        window.history.replaceState({}, '', '/');
      } catch {}
      return;
    }

    if (start === 'home' || p === '/home') {
      setAppState('home');
      return;
    }
    if (start === 'auth' || p === '/auth') {
      setAppState('auth-choice');
      return;
    }
    if (start === 'leaderboard' || p === '/leaderboard') {
      setAppState('leaderboard');
      return;
    }
    if (start === 'achievements' || p === '/achievements') {
      setAppState('achievements');
      return;
    }
    if (start === 'profile' || p === '/profile') {
      setAppState('profile');
      return;
    }
    if (start === 'results' || p === '/results') {
      setAppState('quiz-results');
      return;
    }
    if (start === 'quiz' || p === '/quiz' || p.startsWith('/quiz/')) {
      startQuiz(hints.category || 'javascript');
      return;
    }
    // If e2e hint was present but no recognized start, default to home
    const hasHints = Object.values(hints).some(Boolean);
    if (hasHints) setAppState('home');
  }, [showIntro]);

  if (showIntro) {
    return <IntroAnimation onComplete={() => setShowIntro(false)} />;
  }

  // Main render
  switch (appState) {
    case 'loading':
      return (
        <View style={[styles.container, styles.centerContent]}>
          <LinearGradient
            colors={[colors.background.primary, colors.background.secondary]}
            style={StyleSheet.absoluteFillObject}
          />
          <ActivityIndicator size="large" color={colors.primary.main} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      );

    case 'onboarding-welcome':
      return renderOnboardingWelcome();

    case 'auth-choice':
      return (
        <AuthChoiceEpic
          onEmailLogin={() => setAppState('auth-login')}
          onGoogleLogin={() => console.log('Google login')}
          onGitHubLogin={() => authService.signInWithGitHub()}
          onDemoLogin={handleAuth}
          onSignup={() => setAppState('auth-signup')}
        />
      );

    case 'auth-login':
      return (
        <SafeAreaView style={[styles.container, styles.centerContent]}>
          <LinearGradient
            colors={[colors.background.primary, colors.background.secondary]}
            style={StyleSheet.absoluteFillObject}
          />
          <View style={{ width: '90%', maxWidth: 420 }}>
            <Text
              style={{
                color: colors.text.primary,
                fontSize: 28,
                fontWeight: '800',
                marginBottom: 8,
              }}
            >
              {authMode === 'signup' ? 'Create account' : 'Sign in'}
            </Text>
            <Text style={{ color: colors.text.tertiary, marginBottom: 20 }}>
              {authMode === 'signup'
                ? 'Sign up with your email and password'
                : 'Use your email and password'}
            </Text>
            <View
              style={{
                backgroundColor: colors.background.tertiary,
                borderRadius: 12,
                padding: 14,
                marginBottom: 12,
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.06)',
              }}
            >
              <TextInput
                value={loginEmail}
                onChangeText={setLoginEmail}
                placeholder="Email"
                placeholderTextColor={colors.text.muted}
                autoCapitalize="none"
                keyboardType="email-address"
                style={{ color: colors.text.primary, fontSize: 16 }}
              />
            </View>
            <View
              style={{
                backgroundColor: colors.background.tertiary,
                borderRadius: 12,
                padding: 14,
                marginBottom: 8,
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.06)',
              }}
            >
              <TextInput
                value={loginPassword}
                onChangeText={setLoginPassword}
                placeholder="Password"
                placeholderTextColor={colors.text.muted}
                secureTextEntry
                style={{ color: colors.text.primary, fontSize: 16 }}
              />
            </View>
            {loginError ? (
              <Text style={{ color: colors.accent.error, marginBottom: 8 }}>{loginError}</Text>
            ) : null}
            <TouchableOpacity
              onPress={async () => {
                try {
                  setLoginError('');
                  setLoginLoading(true);
                  if (authMode === 'signup') {
                    const { error } = await authService.signUpWithEmail(loginEmail, loginPassword, {
                      display_name: loginEmail.split('@')[0],
                    });
                    if (error) setLoginError(error.message || 'Sign up failed');
                    // Success will be handled by auth subscription on confirmation; for mocks it's immediate
                  } else {
                    const { error } = await authService.signInWithEmail(loginEmail, loginPassword);
                    if (error) setLoginError(error.message || 'Login failed');
                  }
                } catch (e: any) {
                  setLoginError(
                    e?.message || (authMode === 'signup' ? 'Sign up failed' : 'Login failed'),
                  );
                } finally {
                  setLoginLoading(false);
                }
              }}
              disabled={loginLoading}
              style={{ borderRadius: 12, overflow: 'hidden', marginTop: 8 }}
            >
              <LinearGradient
                colors={[colors.primary.main, colors.primary.dark]}
                style={{ paddingVertical: 14, alignItems: 'center' }}
              >
                {loginLoading ? (
                  <ActivityIndicator color={colors.text.primary} />
                ) : (
                  <Text style={{ color: colors.text.primary, fontWeight: '700', fontSize: 16 }}>
                    {authMode === 'signup' ? 'Create Account' : 'Sign In'}
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
            <View style={{ alignItems: 'center', marginTop: 12 }}>
              <Text style={{ color: colors.text.secondary }}>
                {authMode === 'signup' ? 'Already have an account?' : "Don't have an account?"}
                <Text
                  onPress={() => setAuthMode(authMode === 'signup' ? 'login' : 'signup')}
                  style={{ color: colors.primary.light, fontWeight: '700' }}
                >
                  {authMode === 'signup' ? ' Sign in' : ' Create one'}
                </Text>
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setAppState('auth-choice')}
              style={{ paddingVertical: 14, alignItems: 'center', marginTop: 8 }}
            >
              <Text style={{ color: colors.text.secondary }}>Back</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      );

    case 'home':
      return renderHome();

    case 'quiz-playing':
      return (
        <QuizScreenEpic
          category={currentCategory}
          questions={questions && questions.length > 0 ? questions : undefined}
          timerSeconds={urlHintsRef.current?.timerSeconds}
          onComplete={(finalScore, totalQuestions, category) => {
            setScore(finalScore);
            setLastTotalQuestions(totalQuestions || questions.length || 0);
            setAppState('quiz-results');
          }}
          onBack={() => setAppState('home')}
        />
      );

    case 'quiz-results':
      return (
        <ResultsScreenEpic
          score={score}
          totalQuestions={lastTotalQuestions}
          category={currentCategory}
          onGoHome={() => setAppState('home')}
          onRetry={() => startQuiz(currentCategory || 'javascript')}
        />
      );

    case 'leaderboard':
      return <LeaderboardScreenGameified />;

    case 'achievements':
      return <AchievementsScreenGameified />;

    case 'profile':
      return <ProfileScreenGameified />;

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

  // Onboarding
  onboardingContainer: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  onboardingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appLogo: {
    fontSize: 72,
    marginBottom: 24,
  },
  appTitle: {
    fontSize: 40,
    fontWeight: '900',
    color: colors.text.primary,
    marginBottom: 8,
    letterSpacing: -1,
  },
  appSubtitle: {
    fontSize: 18,
    color: colors.text.secondary,
    marginBottom: 48,
    letterSpacing: 0.5,
  },
  featuresList: {
    width: '100%',
    maxWidth: 320,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
  },
  featureIconBg: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.background.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  featureIcon: {
    fontSize: 24,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 2,
  },
  featureSubtext: {
    fontSize: 14,
    color: colors.text.tertiary,
  },
  onboardingActions: {
    paddingBottom: 48,
  },

  // Buttons
  primaryButton: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  buttonGradient: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: colors.text.primary,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  secondaryButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: colors.text.secondary,
    fontSize: 16,
    fontWeight: '500',
  },

  // Loading
  loadingText: {
    color: colors.text.secondary,
    marginTop: 16,
    fontSize: 16,
  },
});
