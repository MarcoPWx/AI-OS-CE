import React, { useState, useContext, createContext, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Platform,
  Dimensions,
  StyleSheet,
  Animated,
  Image,
  FlatList,
} from 'react-native';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { QueryClientProvider } from '@tanstack/react-query';
import * as Sentry from '@sentry/react-native';
import {
  devQuizData,
  getRandomQuestions,
  getDailyChallenge,
  Category,
  Question,
} from './services/devQuizData';
import { queryClient } from './src/services/api/queryClient';
import analytics from './src/services/analytics/supabaseAnalytics';

// Get screen dimensions
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';

// Enhanced developer color palette (GitHub/VS Code dark inspired)
const colors = {
  // Main theme colors - true dark
  background: '#0d1117',
  backgroundSecondary: '#0f141b',
  surface: '#161b22',
  surfaceLight: '#1e2430',
  surfaceHighlight: '#222938',

  // Gradients tuned to theme accents
  gradientPrimary: ['#1f6feb', '#58a6ff'],
  gradientSuccess: ['#238636', '#2ea043'],
  gradientWarning: ['#d29922', '#f2cc60'],
  gradientDanger: ['#f85149', '#f78166'],
  gradientInfo: ['#6fddff', '#58a6ff'],

  // Primary / accent colors
  primary: '#58a6ff',
  primaryLight: '#79c0ff',
  primaryDark: '#1f6feb',

  // Accent green
  accent: '#2ea043',
  accentDark: '#238636',
  accentLight: '#3fb950',

  // Syntax highlighting-ish
  keyword: '#ff7b72',
  string: '#a5d6ff',
  comment: '#8b949e',
  function: '#d2a8ff',
  variable: '#ffa657',

  // Status
  success: '#3fb950',
  warning: '#d29922',
  danger: '#f85149',
  info: '#58a6ff',

  // Text
  text: '#c9d1d9',
  textSecondary: '#8b949e',
  textMuted: '#6e7681',
  textDim: '#484f58',

  // Special
  gold: '#ffd700',
  purple: '#9f7aea',
  pink: '#ed64a6',

  // Borders
  border: '#30363d',
  borderLight: '#3d444d',
  borderGlow: 'rgba(88, 166, 255, 0.28)',
};

// Fonts
const fonts = {
  mono: Platform.select({
    ios: 'Menlo',
    android: 'monospace',
    default: 'Consolas, Monaco, monospace',
  }),
  regular: Platform.select({
    ios: 'System',
    android: 'Roboto',
    default: 'system-ui, -apple-system, sans-serif',
  }),
};

// Enhanced Context
const DevContext = createContext<any>({});

function DevProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState({
    username: '@dev_master',
    level: 23,
    xp: 4850,
    nextLevelXp: 5000,
    streak: 15,
    gems: 1250,
    energy: 5,
    maxEnergy: 5,
    rank: 'Senior Dev',
    contributions: 1847,
    badges: ['git-master', 'react-hero', 'bug-hunter', 'code-reviewer'],
    currentPath: 'Full Stack Developer',
    achievements: 28,
    completedChallenges: 156,
  });

  return <DevContext.Provider value={{ user, setUser }}>{children}</DevContext.Provider>;
}

// Animated Gradient Card Component
const GradientCard = ({ gradient, children, style, onPress }: any) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 100,
      useNativeDriver: true,
    }).start();
  };

  return (
    <TouchableOpacity onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut}>
      <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
        <LinearGradient
          colors={gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientCard}
        >
          {children}
        </LinearGradient>
      </Animated.View>
    </TouchableOpacity>
  );
};

// Floating Action Button
const FloatingButton = ({ icon, onPress, style }: any) => {
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  return (
    <TouchableOpacity onPress={onPress} style={[styles.floatingButton, style]}>
      <Animated.View
        style={{
          transform: [
            {
              rotate: rotateAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', '360deg'],
              }),
            },
          ],
        }}
      >
        <LinearGradient colors={colors.gradientPrimary} style={styles.floatingButtonGradient}>
          <Ionicons name={icon} size={28} color="#fff" />
        </LinearGradient>
      </Animated.View>
    </TouchableOpacity>
  );
};

// Animated lesson card item with press feedback
const LessonCardItem = ({ item, onPress }: any) => {
  const scale = useRef(new Animated.Value(1)).current;
  const handleIn = () => {
    Animated.spring(scale, { toValue: 0.98, useNativeDriver: true }).start();
  };
  const handleOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      friction: 4,
      tension: 120,
      useNativeDriver: true,
    }).start();
  };
  return (
    <TouchableOpacity
      style={styles.lessonCard}
      onPress={onPress}
      onPressIn={handleIn}
      onPressOut={handleOut}
    >
      <Animated.View
        style={[
          styles.lessonCardInner,
          { transform: [{ scale }] },
          item.isCurrent && styles.lessonCardCurrent,
          item.isCompleted && styles.lessonCardCompleted,
          item.isLocked && styles.lessonCardLocked,
        ]}
      >
        {item.isCompleted && (
          <View style={styles.completedBadge}>
            <Ionicons name="checkmark" size={16} color="#fff" />
          </View>
        )}

        <Text style={styles.lessonIcon}>{item.isLocked ? '🔒' : item.icon}</Text>
        <Text style={styles.lessonName}>{item.name}</Text>

        {item.isCurrent && (
          <View style={styles.lessonProgressContainer}>
            <View style={styles.lessonProgressBar}>
              <View
                style={[
                  styles.lessonProgressFill,
                  { width: `${item.progress * 100}%`, backgroundColor: item.color },
                ]}
              />
            </View>
            <Text style={styles.lessonProgressText}>{Math.round(item.progress * 100)}%</Text>
          </View>
        )}

        {!item.isLocked && (
          <>
            <Text style={styles.lessonDifficulty}>{item.difficulty}</Text>
            <View style={styles.lessonFooter}>
              <Text style={styles.lessonXP}>+{item.xpReward} XP</Text>
              <Text style={styles.lessonQuestions}>{item.questions.length} Questions</Text>
            </View>
          </>
        )}

        {item.isLocked && <Text style={styles.lockedText}>Complete previous lessons</Text>}
      </Animated.View>
    </TouchableOpacity>
  );
};

// Main Path Screen with Enhanced Design
function PathScreen({ navigation }: any) {
  const { user } = useContext(DevContext);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [blink, setBlink] = useState(true);
  const [xpBarWidth, setXpBarWidth] = useState(0);
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    const id = setInterval(() => setBlink((b) => !b), 700);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (xpBarWidth > 0) {
      shimmerAnim.setValue(0);
      Animated.loop(
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1600,
          useNativeDriver: true,
        }),
      ).start();
    }
  }, [xpBarWidth, user.xp, user.nextLevelXp]);

  const lessons = devQuizData.map((category, index) => ({
    ...category,
    isCompleted: index < 3,
    isCurrent: index === 3,
    isLocked: index > 6,
    progress: index < 3 ? 1 : index === 3 ? 0.6 : 0,
    xpReward: (index + 1) * 50,
    difficulty: index < 3 ? 'Beginner' : index < 6 ? 'Intermediate' : 'Advanced',
  }));

  const filledRatio = Math.min(1, Math.max(0, user.xp / user.nextLevelXp));
  const filledWidth = xpBarWidth * filledRatio;
  const shimmerTranslate = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-50, Math.max(0, filledWidth)],
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.contentWrapper}>
          {/* Hero Header Section */}
          <Animated.View
            style={[
              styles.heroSection,
              {
                opacity: fadeAnim,
              },
            ]}
          >
            <LinearGradient colors={['#0a0e1a00', '#0a0e1a']} style={styles.heroGradient} />

            {/* Profile Card */}
            <View style={styles.profileCard}>
              <View style={styles.profileLeft}>
                <View style={styles.avatarContainer}>
                  <LinearGradient colors={colors.gradientPrimary} style={styles.avatarGradient}>
                    <Text style={styles.avatarEmoji}>👨‍💻</Text>
                  </LinearGradient>
                  <View style={styles.levelBadge}>
                    <Text style={styles.levelText}>{user.level}</Text>
                  </View>
                </View>
                <View style={styles.profileInfo}>
                  <Text style={styles.username}>{user.username}</Text>
                  <Text style={styles.userRank}>{user.rank}</Text>
                </View>
              </View>

              <TouchableOpacity style={styles.settingsButton}>
                <Ionicons name="settings-outline" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Terminal prompt line */}
            <View style={styles.termLine}>
              <Text style={styles.termPrompt}>dev@mentor</Text>
              <Text style={styles.termPath}> ~/quizmentor</Text>
              <Text style={styles.termDollar}> $</Text>
              <Text style={styles.termCmd}> npm run learn</Text>
              <Text style={[styles.termCursor, { opacity: blink ? 1 : 0 }]}>▍</Text>
            </View>

            {/* XP Progress Card */}
            <View style={styles.xpCard}>
              <View style={styles.xpHeader}>
                <Text style={styles.xpTitle}>Level {user.level} Progress</Text>
                <Text style={styles.xpValue}>
                  {user.xp}/{user.nextLevelXp} XP
                </Text>
              </View>
              <View style={styles.xpBarContainer}>
                <View
                  style={styles.xpBarBackground}
                  onLayout={(e) => setXpBarWidth(e.nativeEvent.layout.width)}
                >
                  <Animated.View
                    style={[styles.xpBarFill, { width: `${(user.xp / user.nextLevelXp) * 100}%` }]}
                  >
                    <LinearGradient
                      colors={colors.gradientSuccess}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.xpGradientFill}
                    />

                    <Animated.View
                      pointerEvents="none"
                      style={[
                        styles.xpShimmerOverlay,
                        { transform: [{ translateX: shimmerTranslate }] },
                      ]}
                    >
                      <LinearGradient
                        colors={['#ffffff00', '#ffffff44', '#ffffff00']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={{ flex: 1 }}
                      />
                    </Animated.View>
                  </Animated.View>
                </View>
              </View>
              <View style={styles.xpFooter}>
                <Text style={styles.xpNext}>
                  Next: {user.rank === 'Senior Dev' ? 'Tech Lead' : 'Architect'}
                </Text>
                <Text style={styles.xpRemaining}>{user.nextLevelXp - user.xp} XP to go</Text>
              </View>
            </View>

            {/* Stats Grid */}
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <LinearGradient colors={['#ff657550', '#ff657520']} style={styles.statCardGradient}>
                  <Text style={styles.statEmoji}>🔥</Text>
                  <Text style={styles.statValue}>{user.streak}</Text>
                  <Text style={styles.statLabel}>Day Streak</Text>
                </LinearGradient>
              </View>

              <View style={styles.statCard}>
                <LinearGradient colors={['#38ef7d50', '#38ef7d20']} style={styles.statCardGradient}>
                  <Text style={styles.statEmoji}>💎</Text>
                  <Text style={styles.statValue}>{user.gems}</Text>
                  <Text style={styles.statLabel}>Gems</Text>
                </LinearGradient>
              </View>

              <View style={styles.statCard}>
                <LinearGradient colors={['#667eea50', '#667eea20']} style={styles.statCardGradient}>
                  <Text style={styles.statEmoji}>⚡</Text>
                  <Text style={styles.statValue}>
                    {user.energy}/{user.maxEnergy}
                  </Text>
                  <Text style={styles.statLabel}>Energy</Text>
                </LinearGradient>
              </View>

              <View style={styles.statCard}>
                <LinearGradient colors={['#f9758350', '#f9758320']} style={styles.statCardGradient}>
                  <Text style={styles.statEmoji}>🏆</Text>
                  <Text style={styles.statValue}>{user.achievements}</Text>
                  <Text style={styles.statLabel}>Badges</Text>
                </LinearGradient>
              </View>
            </View>
          </Animated.View>

          {/* Daily Challenge Card */}
          <TouchableOpacity
            style={styles.dailyChallenge}
            onPress={() => navigation.navigate('DailyChallenge')}
          >
            <View style={styles.dailyChallengeGradient}>
              <View style={styles.dailyChallengeContent}>
                <View style={styles.dailyChallengeLeft}>
                  <Text style={styles.dailyChallengeEmoji}>🚀</Text>
                  <View>
                    <Text style={styles.dailyChallengeTitle}>Daily Algorithm</Text>
                    <Text style={styles.dailyChallengeDesc}>Binary Search Challenge</Text>
                  </View>
                </View>
                <View style={styles.dailyChallengeReward}>
                  <Text style={styles.rewardText}>+200 XP</Text>
                  <Ionicons name="chevron-forward" size={20} color={colors.primary} />
                </View>
              </View>
            </View>
          </TouchableOpacity>

          {/* Learning Path Section */}
          <View style={styles.pathSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Your Learning Path</Text>
              <TouchableOpacity>
                <Text style={styles.sectionAction}>View All →</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={lessons}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <LessonCardItem
                  item={item}
                  onPress={() => {
                    if (!item.isLocked) {
                      navigation.navigate('CodeChallenge', { category: item });
                    }
                  }}
                />
              )}
            />
          </View>

          {/* Recent Activity */}
          <View style={styles.activitySection}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <View style={styles.activityList}>
              {[
                { icon: '✅', text: 'Completed JavaScript Arrays', time: '2h ago', xp: '+50 XP' },
                { icon: '🔥', text: '7 Day Streak!', time: '5h ago', xp: '+100 XP' },
                { icon: '🏆', text: 'Unlocked React Hero Badge', time: '1d ago', xp: '+200 XP' },
              ].map((activity, index) => (
                <View key={index} style={styles.activityItem}>
                  <Text style={styles.activityIcon}>{activity.icon}</Text>
                  <View style={styles.activityContent}>
                    <Text style={styles.activityText}>{activity.text}</Text>
                    <Text style={styles.activityTime}>{activity.time}</Text>
                  </View>
                  <Text style={styles.activityXP}>{activity.xp}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      {/* Floating Continue Button */}
      <FloatingButton
        icon="play"
        onPress={() => {
          const currentLesson = lessons.find((l) => l.isCurrent);
          if (currentLesson) {
            navigation.navigate('CodeChallenge', { category: currentLesson });
          }
        }}
      />
    </SafeAreaView>
  );
}

// Code Challenge Screen (keeping the same quiz logic but with enhanced UI)
function CodeChallengeScreen({ navigation, route }: any) {
  const category: Category = route.params?.category || devQuizData[0];
  const [questions] = useState<Question[]>(() => getRandomQuestions(category.id, 5));
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [energy, setEnergy] = useState(5);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  const shakeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(300)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const explanationAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: 0,
      friction: 8,
      tension: 100,
      useNativeDriver: true,
    }).start();

    Animated.timing(progressAnim, {
      toValue: (currentQuestion / questions.length) * 100,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [currentQuestion]);

  useEffect(() => {
    if (showExplanation) {
      explanationAnim.setValue(0);
      Animated.timing(explanationAnim, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }).start();
    }
  }, [showExplanation]);

  const question = questions[currentQuestion];

  const handleAnswer = (index: number) => {
    if (isAnswerSubmitted) return;
    setSelectedAnswer(index);
    if (!isWeb) Haptics.selectionAsync();
  };

  const checkAnswer = () => {
    if (selectedAnswer === null) return;

    setIsAnswerSubmitted(true);
    const isCorrect = selectedAnswer === question.correct;

    if (isCorrect) {
      setScore(score + 1);
      if (!isWeb) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      setEnergy(energy - 1);
      if (!isWeb) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

      // Shake animation
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]).start();

      if (energy <= 1) {
        setTimeout(() => setShowResult(true), 1500);
        return;
      }
    }

    setShowExplanation(true);
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setIsAnswerSubmitted(false);
      setShowExplanation(false);

      slideAnim.setValue(300);
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 100,
        useNativeDriver: true,
      }).start();
    } else {
      setShowResult(true);
    }
  };

  if (showResult) {
    const accuracy = Math.round((score / questions.length) * 100);
    const xpEarned = score * 20;

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.resultContainer}>
          <LinearGradient
            colors={
              accuracy >= 80
                ? colors.gradientSuccess
                : accuracy >= 60
                  ? colors.gradientWarning
                  : colors.gradientDanger
            }
            style={styles.resultCard}
          >
            <Text style={styles.resultEmoji}>
              {accuracy >= 80 ? '🏆' : accuracy >= 60 ? '⭐' : '💪'}
            </Text>
            <Text style={styles.resultTitle}>
              {accuracy >= 80 ? 'Outstanding!' : accuracy >= 60 ? 'Well Done!' : 'Keep Learning!'}
            </Text>
            <View style={styles.resultStats}>
              <Text style={styles.resultScore}>
                {score}/{questions.length}
              </Text>
              <Text style={styles.resultAccuracy}>{accuracy}% Accuracy</Text>
            </View>
            <View style={styles.resultXP}>
              <Text style={styles.resultXPText}>+{xpEarned} XP Earned</Text>
            </View>
            <TouchableOpacity
              style={styles.resultButton}
              onPress={() => navigation.navigate('Path')}
            >
              <Text style={styles.resultButtonText}>Continue</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.challengeContainer}>
      {/* Header */}
      <View style={styles.challengeHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={28} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.challengeProgress}>
          <View style={styles.challengeProgressBar}>
            <Animated.View
              style={[
                styles.challengeProgressFill,
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 100],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            >
              <LinearGradient
                colors={colors.gradientPrimary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ flex: 1 }}
              />
            </Animated.View>
          </View>
        </View>

        <View style={styles.energyContainer}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Ionicons
              key={i}
              name={i < energy ? 'heart' : 'heart-outline'}
              size={24}
              color={i < energy ? colors.danger : colors.textDim}
            />
          ))}
        </View>
      </View>

      {/* Question Content */}
      <Animated.View
        style={[
          styles.questionContent,
          {
            transform: [{ translateX: shakeAnim }, { translateX: slideAnim }],
          },
        ]}
      >
        <View style={styles.questionCard}>
          <View style={styles.questionHeader}>
            <Text style={styles.questionNumber}>
              Question {currentQuestion + 1}/{questions.length}
            </Text>
            <View
              style={[
                styles.difficultyBadge,
                {
                  backgroundColor:
                    question.difficulty === 'easy'
                      ? colors.success + '20'
                      : question.difficulty === 'medium'
                        ? colors.warning + '20'
                        : colors.danger + '20',
                },
              ]}
            >
              <Text
                style={[
                  styles.difficultyText,
                  {
                    color:
                      question.difficulty === 'easy'
                        ? colors.success
                        : question.difficulty === 'medium'
                          ? colors.warning
                          : colors.danger,
                  },
                ]}
              >
                {question.difficulty}
              </Text>
            </View>
          </View>

          {question.codeSnippet && (
            <View style={styles.codeBlock}>
              <Text style={styles.codeText}>{question.codeSnippet}</Text>
            </View>
          )}

          <Text style={styles.questionText}>{question.question}</Text>
        </View>

        <View style={styles.optionsContainer}>
          {question.options.map((option, index) => {
            const isSelected = selectedAnswer === index;
            const isCorrect = index === question.correct;
            const showCorrect = isAnswerSubmitted && isCorrect;
            const showWrong = isAnswerSubmitted && isSelected && !isCorrect;

            return (
              <TouchableOpacity
                key={index}
                onPress={() => handleAnswer(index)}
                disabled={isAnswerSubmitted}
                style={[
                  styles.optionButton,
                  isSelected && !isAnswerSubmitted && styles.optionSelected,
                  showCorrect && styles.optionCorrect,
                  showWrong && styles.optionWrong,
                ]}
              >
                <View style={styles.optionContent}>
                  <View
                    style={[
                      styles.optionIndex,
                      isSelected && !isAnswerSubmitted && styles.optionIndexSelected,
                      showCorrect && styles.optionIndexCorrect,
                      showWrong && styles.optionIndexWrong,
                    ]}
                  >
                    <Text style={styles.optionIndexText}>{String.fromCharCode(65 + index)}</Text>
                  </View>
                  <Text
                    style={[
                      styles.optionText,
                      isSelected && !isAnswerSubmitted && styles.optionTextSelected,
                      showCorrect && styles.optionTextCorrect,
                      showWrong && styles.optionTextWrong,
                    ]}
                  >
                    {option}
                  </Text>
                </View>
                {showCorrect && (
                  <Ionicons name="checkmark-circle" size={24} color={colors.success} />
                )}
                {showWrong && <Ionicons name="close-circle" size={24} color={colors.danger} />}
              </TouchableOpacity>
            );
          })}
        </View>

        {showExplanation && question.explanation && (
          <Animated.View
            style={[
              styles.explanationCard,
              {
                opacity: explanationAnim,
                transform: [
                  {
                    translateY: explanationAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [8, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.explanationHeader}>
              <Ionicons name="bulb" size={20} color={colors.warning} />
              <Text style={styles.explanationTitle}>Explanation</Text>
            </View>
            <Text style={styles.explanationText}>{question.explanation}</Text>
          </Animated.View>
        )}
      </Animated.View>

      {/* Bottom Action */}
      <View style={styles.bottomAction}>
        <TouchableOpacity
          style={[
            styles.actionButton,
            !isAnswerSubmitted
              ? selectedAnswer !== null
                ? styles.actionButtonReady
                : styles.actionButtonDisabled
              : selectedAnswer === question.correct
                ? styles.actionButtonSuccess
                : styles.actionButtonWarning,
          ]}
          onPress={!isAnswerSubmitted ? checkAnswer : nextQuestion}
          disabled={!isAnswerSubmitted && selectedAnswer === null}
        >
          <Text style={styles.actionButtonText}>{!isAnswerSubmitted ? 'CHECK' : 'CONTINUE'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// Profile Screen
function ProfileScreen() {
  const { user } = useContext(DevContext);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <LinearGradient colors={['#667eea20', '#764ba220']} style={styles.profileHero}>
          <View style={styles.profileAvatarSection}>
            <View style={styles.profileAvatar}>
              <Text style={styles.profileAvatarEmoji}>👨‍💻</Text>
            </View>
            <Text style={styles.profileName}>{user.username}</Text>
            <Text style={styles.profileRank}>{user.rank}</Text>
            <View style={styles.profileStats}>
              <View style={styles.profileStat}>
                <Text style={styles.profileStatValue}>{user.level}</Text>
                <Text style={styles.profileStatLabel}>Level</Text>
              </View>
              <View style={styles.profileStatDivider} />
              <View style={styles.profileStat}>
                <Text style={styles.profileStatValue}>{user.achievements}</Text>
                <Text style={styles.profileStatLabel}>Badges</Text>
              </View>
              <View style={styles.profileStatDivider} />
              <View style={styles.profileStat}>
                <Text style={styles.profileStatValue}>{user.completedChallenges}</Text>
                <Text style={styles.profileStatLabel}>Completed</Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.profileContent}>
          <Text style={styles.profileSectionTitle}>Skills Progress</Text>
          {Object.entries({
            JavaScript: 85,
            React: 72,
            TypeScript: 65,
            'Node.js': 78,
          }).map(([skill, progress]) => (
            <View key={skill} style={styles.skillItem}>
              <Text style={styles.skillName}>{skill}</Text>
              <View style={styles.skillBarContainer}>
                <View style={[styles.skillBarFill, { width: `${progress}%` }]}>
                  <LinearGradient
                    colors={colors.gradientPrimary}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{ flex: 1 }}
                  />
                </View>
              </View>
              <Text style={styles.skillPercent}>{progress}%</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Leaderboard Screen
function LeaderboardScreen() {
  const leaderboard = [
    { rank: 1, username: '@code_wizard', xp: 12450, level: 45, avatar: '🧙‍♂️' },
    { rank: 2, username: '@dev_ninja', xp: 11200, level: 42, avatar: '🥷' },
    { rank: 3, username: '@bug_hunter', xp: 10800, level: 40, avatar: '🕵️' },
    { rank: 4, username: '@algo_master', xp: 9500, level: 37, avatar: '🧠' },
    { rank: 5, username: '@react_hero', xp: 8200, level: 34, avatar: '⚛️' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.leaderboardHeader}>
        <Text style={styles.leaderboardTitle}>Global Ranking</Text>
        <View style={styles.leaderboardTabs}>
          <TouchableOpacity style={styles.leaderboardTabActive}>
            <Text style={styles.leaderboardTabTextActive}>This Week</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.leaderboardTab}>
            <Text style={styles.leaderboardTabText}>All Time</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {leaderboard.map((user, index) => (
          <TouchableOpacity key={index} style={styles.leaderboardItem}>
            <View style={styles.leaderboardRank}>
              <Text
                style={[
                  styles.leaderboardRankText,
                  index === 0 && styles.goldRank,
                  index === 1 && styles.silverRank,
                  index === 2 && styles.bronzeRank,
                ]}
              >
                {user.rank}
              </Text>
            </View>
            <View style={styles.leaderboardUser}>
              <Text style={styles.leaderboardAvatar}>{user.avatar}</Text>
              <View>
                <Text style={styles.leaderboardUsername}>{user.username}</Text>
                <Text style={styles.leaderboardLevel}>Level {user.level}</Text>
              </View>
            </View>
            <Text style={styles.leaderboardXP}>{user.xp.toLocaleString()} XP</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

// Navigation
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Path"
        component={PathScreen}
        options={{
          tabBarLabel: 'Learn',
          tabBarIcon: ({ color, focused }) => (
            <View style={focused && styles.tabIconFocused}>
              <Ionicons name="code-slash" size={24} color={color} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Leaderboard"
        component={LeaderboardScreen}
        options={{
          tabBarLabel: 'Ranking',
          tabBarIcon: ({ color, focused }) => (
            <View style={focused && styles.tabIconFocused}>
              <Ionicons name="trophy" size={24} color={color} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <View style={focused && styles.tabIconFocused}>
              <Ionicons name="person" size={24} color={color} />
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// Add FadeInDown animation fallback for web
const FadeInDown = {
  duration: () => ({ duration: 300 }),
};

// Initialize Sentry for error tracking (optional)
if (!__DEV__ && process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    debug: false,
    tracesSampleRate: 0.2,
  });
}

function AppContent() {
  useEffect(() => {
    // Start analytics session
    analytics.startSession();

    // Track app launch
    analytics.track('app_launched', {
      version: '1.0.0',
      environment: __DEV__ ? 'development' : 'production',
    });

    // Clean up on unmount
    return () => {
      analytics.endSession();
    };
  }, []);

  return (
    <DevProvider>
      <NavigationContainer
        theme={DarkTheme}
        onStateChange={(state) => {
          const currentScreen = state?.routes[state.index]?.name;
          if (currentScreen) {
            analytics.trackScreen(currentScreen);
          }
        }}
      >
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen name="CodeChallenge" component={CodeChallengeScreen} />
          <Stack.Screen name="DailyChallenge" component={CodeChallengeScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </DevProvider>
  );
}

// Wrap with Sentry in production
const AppWithMonitoring = __DEV__ ? AppContent : Sentry.wrap(AppContent);

export default function App() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AppWithMonitoring />
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

// Styles
const styles = StyleSheet.create({
  // Base Container
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  contentWrapper: {
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },

  // Hero Section
  heroSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },
  heroGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 200,
  },

  // Terminal prompt line
  termLine: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  termPrompt: {
    fontFamily: fonts.mono,
    fontSize: 12,
    color: colors.accent,
  },
  termPath: {
    fontFamily: fonts.mono,
    fontSize: 12,
    color: colors.textSecondary,
  },
  termDollar: {
    fontFamily: fonts.mono,
    fontSize: 12,
    color: colors.textMuted,
    marginLeft: 4,
  },
  termCmd: {
    fontFamily: fonts.mono,
    fontSize: 12,
    color: colors.text,
    marginLeft: 6,
  },
  termCursor: {
    fontFamily: fonts.mono,
    fontSize: 12,
    color: colors.primary,
    marginLeft: 2,
  },

  // Profile Card
  profileCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  profileLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatarGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarEmoji: {
    fontSize: 28,
  },
  levelBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 2,
    borderColor: colors.background,
  },
  levelText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },
  profileInfo: {
    marginLeft: 12,
  },
  username: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  userRank: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  settingsButton: {
    padding: 8,
  },

  // XP Card
  xpCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
  xpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  xpTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  xpValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
  xpBarContainer: {
    marginBottom: 12,
  },
  xpBarBackground: {
    height: 12,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 6,
    overflow: 'hidden',
  },
  xpBarFill: {
    height: '100%',
    borderRadius: 6,
    overflow: 'hidden',
    position: 'relative',
  },
  xpGradientFill: {
    flex: 1,
  },
  xpShimmerOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: 60,
    opacity: 0.6,
  },
  xpFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  xpNext: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  xpRemaining: {
    fontSize: 13,
    color: colors.textMuted,
  },

  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  statCard: {
    flex: 1,
  },
  statCardGradient: {
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  statEmoji: {
    fontSize: 20,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  statLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 2,
  },

  // Daily Challenge
  dailyChallenge: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  dailyChallengeGradient: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.primary + '40',
    backgroundColor: colors.surface,
  },
  dailyChallengeContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dailyChallengeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dailyChallengeEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  dailyChallengeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  dailyChallengeDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  dailyChallengeReward: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rewardText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.accent,
    marginRight: 4,
  },

  // Path Section
  pathSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  sectionAction: {
    fontSize: 14,
    color: colors.primary,
  },

  // Lesson Cards
  lessonCard: {
    width: 160,
    marginLeft: 20,
  },
  lessonCardInner: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    height: 180,
    borderWidth: 2,
    borderColor: colors.border,
    position: 'relative',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  lessonCardCurrent: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceLight,
  },
  lessonCardCompleted: {
    borderColor: colors.success,
  },
  lessonCardLocked: {
    opacity: 0.5,
  },
  completedBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: colors.success,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lessonIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  lessonName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  lessonProgressContainer: {
    marginTop: 8,
  },
  lessonProgressBar: {
    height: 6,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  lessonProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  lessonProgressText: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  lessonDifficulty: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 4,
  },
  lessonFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 'auto',
  },
  lessonXP: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.primary,
  },
  lessonQuestions: {
    fontSize: 11,
    color: colors.textMuted,
  },
  lockedText: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 'auto',
    textAlign: 'center',
  },

  // Activity Section
  activitySection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  activityList: {
    marginTop: 12,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  activityIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 14,
    color: colors.text,
  },
  activityTime: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  activityXP: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.accent,
  },

  // Floating Button
  floatingButton: {
    position: 'absolute',
    bottom: 80,
    right: 20,
  },
  floatingButtonGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },

  // Gradient Card
  gradientCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },

  // Challenge Screen
  challengeContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  challengeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  challengeProgress: {
    flex: 1,
    marginHorizontal: 16,
  },
  challengeProgressBar: {
    height: 8,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 4,
    overflow: 'hidden',
  },
  challengeProgressFill: {
    height: '100%',
    borderRadius: 4,
  },
  energyContainer: {
    flexDirection: 'row',
    gap: 4,
  },

  // Question Content
  questionContent: {
    flex: 1,
    padding: 20,
  },
  questionCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  questionNumber: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  difficultyText: {
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  codeBlock: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  codeText: {
    fontSize: 13,
    fontFamily: fonts.mono,
    color: colors.string,
    lineHeight: 20,
  },
  questionText: {
    fontSize: 18,
    color: colors.text,
    lineHeight: 26,
  },

  // Options
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  optionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceLight,
  },
  optionCorrect: {
    borderColor: colors.success,
    backgroundColor: colors.success + '15',
  },
  optionWrong: {
    borderColor: colors.danger,
    backgroundColor: colors.danger + '15',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  optionIndex: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionIndexSelected: {
    backgroundColor: colors.primary + '20',
  },
  optionIndexCorrect: {
    backgroundColor: colors.success + '20',
  },
  optionIndexWrong: {
    backgroundColor: colors.danger + '20',
  },
  optionIndexText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.textSecondary,
  },
  optionText: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
  },
  optionTextSelected: {
    color: colors.primary,
  },
  optionTextCorrect: {
    color: colors.success,
  },
  optionTextWrong: {
    color: colors.danger,
  },

  // Explanation Card
  explanationCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  explanationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  explanationTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.warning,
    marginLeft: 8,
  },
  explanationText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },

  // Bottom Action
  bottomAction: {
    padding: 20,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  actionButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  actionButtonDisabled: {
    backgroundColor: colors.surfaceLight,
  },
  actionButtonReady: {
    backgroundColor: colors.primary,
  },
  actionButtonSuccess: {
    backgroundColor: colors.success,
  },
  actionButtonWarning: {
    backgroundColor: colors.warning,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 1,
  },

  // Result
  resultContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  resultCard: {
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
  },
  resultEmoji: {
    fontSize: 72,
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 24,
  },
  resultStats: {
    flexDirection: 'row',
    gap: 32,
    marginBottom: 24,
  },
  resultScore: {
    fontSize: 20,
    color: '#fff',
  },
  resultAccuracy: {
    fontSize: 20,
    color: '#fff',
  },
  resultXP: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    marginBottom: 32,
  },
  resultXPText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  resultButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 12,
  },
  resultButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },

  // Profile Screen
  profileHero: {
    paddingVertical: 32,
  },
  profileAvatarSection: {
    alignItems: 'center',
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileAvatarEmoji: {
    fontSize: 40,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  profileRank: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 24,
  },
  profileStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileStat: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  profileStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  profileStatLabel: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
  },
  profileStatDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.border,
  },
  profileContent: {
    padding: 20,
  },
  profileSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  skillItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  skillName: {
    width: 100,
    fontSize: 14,
    color: colors.textSecondary,
  },
  skillBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 4,
    overflow: 'hidden',
    marginHorizontal: 12,
  },
  skillBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  skillPercent: {
    width: 40,
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'right',
  },

  // Leaderboard
  leaderboardHeader: {
    padding: 20,
  },
  leaderboardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  leaderboardTabs: {
    flexDirection: 'row',
    gap: 12,
  },
  leaderboardTab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: colors.surface,
  },
  leaderboardTabActive: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: colors.primary,
  },
  leaderboardTabText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  leaderboardTabTextActive: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  leaderboardRank: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  leaderboardRankText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textSecondary,
  },
  goldRank: {
    color: '#ffd700',
  },
  silverRank: {
    color: '#c0c0c0',
  },
  bronzeRank: {
    color: '#cd7f32',
  },
  leaderboardUser: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  leaderboardAvatar: {
    fontSize: 24,
    marginRight: 12,
  },
  leaderboardUsername: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  leaderboardLevel: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  leaderboardXP: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.primary,
  },

  // Tab Bar
  tabBar: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    elevation: 0,
    shadowOpacity: 0,
    height: 60,
    paddingBottom: 8,
    paddingTop: 8,
  },
  tabIconFocused: {
    transform: [{ scale: 1.1 }],
  },
});
