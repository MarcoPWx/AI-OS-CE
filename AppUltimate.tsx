import React, { useState, useContext, createContext, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Alert,
  Platform,
  Dimensions,
  StyleSheet,
  Animated,
  Image,
  Modal,
  Switch,
  TextInput,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

// Get screen dimensions
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';
const isTablet = screenWidth >= 768;

// Professional color palette
const colors = {
  primary: '#3b82f6',
  primaryLight: '#60a5fa',
  primaryDark: '#2563eb',
  secondary: '#8b5cf6',
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',

  // Grays
  gray50: '#f9fafb',
  gray100: '#f3f4f6',
  gray200: '#e5e7eb',
  gray300: '#d1d5db',
  gray400: '#9ca3af',
  gray500: '#6b7280',
  gray600: '#4b5563',
  gray700: '#374151',
  gray800: '#1f2937',
  gray900: '#111827',

  white: '#ffffff',
  black: '#000000',
};

// Quiz Context with full state management
interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  level: number;
  totalXP: number;
  streak: number;
  hearts: number;
  isPremium: boolean;
  achievements: string[];
  stats: {
    quizzesCompleted: number;
    correctAnswers: number;
    totalAnswers: number;
    bestStreak: number;
    categories: { [key: string]: number };
  };
}

const QuizContext = createContext<any>({});

function QuizProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile>({
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    level: 12,
    totalXP: 2450,
    streak: 7,
    hearts: 3,
    isPremium: false,
    achievements: ['first_quiz', 'week_streak', 'knowledge_master'],
    stats: {
      quizzesCompleted: 48,
      correctAnswers: 384,
      totalAnswers: 432,
      bestStreak: 14,
      categories: {
        geography: 12,
        science: 15,
        history: 8,
        art: 5,
        sports: 8,
      },
    },
  });

  return <QuizContext.Provider value={{ user, setUser }}>{children}</QuizContext.Provider>;
}

// Animated Components
const AnimatedCard = ({ children, delay = 0, style }: any) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};

const PulsingView = ({ children, style }: any) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  return (
    <Animated.View style={[style, { transform: [{ scale: scaleAnim }] }]}>{children}</Animated.View>
  );
};

const StreakFlame = ({ streak }: { streak: number }) => {
  const flameAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(flameAnim, {
          toValue: 1.2,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(flameAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  const getFlameColor = () => {
    if (streak >= 365) return '#FF00FF'; // Legendary
    if (streak >= 100) return '#FFD700'; // Gold
    if (streak >= 30) return '#FF4500'; // Red-orange
    if (streak >= 7) return '#FFA500'; // Orange
    return '#FF6347'; // Basic
  };

  return (
    <Animated.View style={{ transform: [{ scale: flameAnim }] }}>
      <Text style={{ fontSize: 32, color: getFlameColor() }}>🔥</Text>
    </Animated.View>
  );
};

// Home/Dashboard Screen
function HomeScreen({ navigation }: any) {
  const { user } = useContext(QuizContext);
  const scrollY = useRef(new Animated.Value(0)).current;

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
          useNativeDriver: true,
        })}
        scrollEventThrottle={16}
      >
        {/* Animated Header */}
        <Animated.View style={[styles.homeHeader, { opacity: headerOpacity }]}>
          <View>
            <Text style={styles.greeting}>Welcome back</Text>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userLevel}>Level {user.level} Scholar</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')} activeOpacity={0.8}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>
                {user.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </Text>
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* Animated Streak Section */}
        <AnimatedCard delay={100} style={styles.streakCard}>
          <View style={styles.streakContent}>
            <StreakFlame streak={user.streak} />
            <View style={styles.streakInfo}>
              <Text style={styles.streakTitle}>{user.streak} Day Streak!</Text>
              <Text style={styles.streakSubtitle}>Keep it going!</Text>
            </View>
            <View style={styles.streakStats}>
              <Text style={styles.streakBest}>Best: {user.stats.bestStreak}</Text>
            </View>
          </View>
        </AnimatedCard>

        {/* Stats Grid with Staggered Animation */}
        <View style={styles.statsGrid}>
          {[
            { label: 'Total XP', value: user.totalXP.toLocaleString(), icon: '⭐', delay: 200 },
            { label: 'Hearts', value: `${user.hearts}/5`, icon: '❤️', delay: 250 },
            {
              label: 'Accuracy',
              value: `${Math.round((user.stats.correctAnswers / user.stats.totalAnswers) * 100)}%`,
              icon: '🎯',
              delay: 300,
            },
            { label: 'Quizzes', value: user.stats.quizzesCompleted, icon: '📚', delay: 350 },
          ].map((stat, index) => (
            <AnimatedCard key={index} delay={stat.delay} style={styles.statCard}>
              <Text style={styles.statIcon}>{stat.icon}</Text>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </AnimatedCard>
          ))}
        </View>

        {/* Daily Challenge with Pulsing Animation */}
        <PulsingView style={styles.challengeCard}>
          <Text style={styles.challengeEmoji}>🎯</Text>
          <View style={styles.challengeContent}>
            <Text style={styles.challengeTitle}>Daily Challenge</Text>
            <Text style={styles.challengeDescription}>Complete 5 quizzes for double XP!</Text>
            <View style={styles.progressBar}>
              <Animated.View style={[styles.progressFill, { width: '60%' }]} />
            </View>
            <Text style={styles.progressText}>3/5 Completed</Text>
          </View>
        </PulsingView>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.primaryButton]}
            onPress={() => {
              if (!isWeb) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              navigation.navigate('Categories');
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>Start Learning 🚀</Text>
          </TouchableOpacity>

          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.actionButton, styles.secondaryButton]}
              onPress={() => navigation.navigate('Leaderboard')}
              activeOpacity={0.8}
            >
              <Text style={styles.actionEmoji}>🏆</Text>
              <Text style={styles.secondaryButtonText}>Leaderboard</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.premiumButton]}
              onPress={() => navigation.navigate('Premium')}
              activeOpacity={0.8}
            >
              <Text style={styles.actionEmoji}>👑</Text>
              <Text style={styles.premiumButtonText}>Go Premium</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.recentActivity}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          {[
            { category: 'Geography', score: '9/10', time: '2 hours ago', icon: '🌍' },
            { category: 'Science', score: '8/10', time: 'Yesterday', icon: '🔬' },
          ].map((activity, index) => (
            <AnimatedCard key={index} delay={400 + index * 50} style={styles.activityCard}>
              <Text style={styles.activityIcon}>{activity.icon}</Text>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>{activity.category}</Text>
                <Text style={styles.activityScore}>Score: {activity.score}</Text>
              </View>
              <Text style={styles.activityTime}>{activity.time}</Text>
            </AnimatedCard>
          ))}
        </View>
      </Animated.ScrollView>
    </View>
  );
}

// Profile Screen
function ProfileScreen({ navigation }: any) {
  const { user, setUser } = useContext(QuizContext);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(user.name);

  const achievements = [
    { id: 'first_quiz', name: 'First Steps', icon: '🎯', description: 'Complete your first quiz' },
    { id: 'week_streak', name: 'Week Warrior', icon: '🔥', description: '7 day streak' },
    {
      id: 'knowledge_master',
      name: 'Knowledge Master',
      icon: '🧠',
      description: '100 correct answers',
    },
    { id: 'speed_demon', name: 'Speed Demon', icon: '⚡', description: 'Perfect score under 30s' },
    {
      id: 'category_expert',
      name: 'Category Expert',
      icon: '🏅',
      description: 'Master a category',
    },
    {
      id: 'social_butterfly',
      name: 'Social Butterfly',
      icon: '🦋',
      description: 'Share 10 scores',
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.profileAvatarLarge}>
          <Text style={styles.profileAvatarText}>
            {user.name
              .split(' ')
              .map((n) => n[0])
              .join('')}
          </Text>
        </View>

        {isEditing ? (
          <View style={styles.editNameContainer}>
            <TextInput
              style={styles.nameInput}
              value={editedName}
              onChangeText={setEditedName}
              placeholder="Enter your name"
            />
            <TouchableOpacity
              onPress={() => {
                setUser({ ...user, name: editedName });
                setIsEditing(false);
              }}
              style={styles.saveButton}
            >
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity onPress={() => setIsEditing(true)}>
            <Text style={styles.profileName}>{user.name}</Text>
            <Text style={styles.editHint}>Tap to edit</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.profileEmail}>{user.email}</Text>

        <View style={styles.profileStats}>
          <View style={styles.profileStatItem}>
            <Text style={styles.profileStatValue}>Level {user.level}</Text>
            <Text style={styles.profileStatLabel}>Scholar</Text>
          </View>
          <View style={styles.profileStatDivider} />
          <View style={styles.profileStatItem}>
            <Text style={styles.profileStatValue}>{user.totalXP}</Text>
            <Text style={styles.profileStatLabel}>Total XP</Text>
          </View>
          <View style={styles.profileStatDivider} />
          <View style={styles.profileStatItem}>
            <Text style={styles.profileStatValue}>{user.streak}</Text>
            <Text style={styles.profileStatLabel}>Day Streak</Text>
          </View>
        </View>
      </View>

      {/* Premium Status */}
      {!user.isPremium && (
        <AnimatedCard delay={100} style={styles.premiumPrompt}>
          <Text style={styles.premiumPromptIcon}>👑</Text>
          <View style={styles.premiumPromptContent}>
            <Text style={styles.premiumPromptTitle}>Unlock Premium</Text>
            <Text style={styles.premiumPromptDescription}>
              Get unlimited hearts, exclusive content, and more!
            </Text>
          </View>
          <TouchableOpacity
            style={styles.premiumPromptButton}
            onPress={() => navigation.navigate('Premium')}
          >
            <Text style={styles.premiumPromptButtonText}>Upgrade</Text>
          </TouchableOpacity>
        </AnimatedCard>
      )}

      {/* Learning Stats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Learning Stats</Text>
        <View style={styles.learningStats}>
          <View style={styles.statRow}>
            <Text style={styles.statRowLabel}>Quizzes Completed</Text>
            <Text style={styles.statRowValue}>{user.stats.quizzesCompleted}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statRowLabel}>Correct Answers</Text>
            <Text style={styles.statRowValue}>{user.stats.correctAnswers}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statRowLabel}>Accuracy Rate</Text>
            <Text style={styles.statRowValue}>
              {Math.round((user.stats.correctAnswers / user.stats.totalAnswers) * 100)}%
            </Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statRowLabel}>Best Streak</Text>
            <Text style={styles.statRowValue}>{user.stats.bestStreak} days</Text>
          </View>
        </View>
      </View>

      {/* Category Progress */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Category Progress</Text>
        {Object.entries(user.stats.categories).map(([category, count]) => (
          <View key={category} style={styles.categoryProgress}>
            <Text style={styles.categoryName}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </Text>
            <View style={styles.categoryBar}>
              <View style={[styles.categoryBarFill, { width: `${Math.min(count * 5, 100)}%` }]} />
            </View>
            <Text style={styles.categoryCount}>{count} quizzes</Text>
          </View>
        ))}
      </View>

      {/* Achievements */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Achievements</Text>
        <View style={styles.achievementsGrid}>
          {achievements.map((achievement) => {
            const isUnlocked = user.achievements.includes(achievement.id);
            return (
              <AnimatedCard
                key={achievement.id}
                delay={100}
                style={[styles.achievementCard, !isUnlocked && styles.achievementLocked]}
              >
                <Text style={styles.achievementIcon}>{isUnlocked ? achievement.icon : '🔒'}</Text>
                <Text style={styles.achievementName}>{achievement.name}</Text>
                <Text style={styles.achievementDescription}>{achievement.description}</Text>
              </AnimatedCard>
            );
          })}
        </View>
      </View>

      {/* Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings</Text>
        <View style={styles.settingsContainer}>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Notifications</Text>
            <Switch
              value={true}
              onValueChange={() => {}}
              trackColor={{ false: colors.gray300, true: colors.primary }}
            />
          </View>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Sound Effects</Text>
            <Switch
              value={true}
              onValueChange={() => {}}
              trackColor={{ false: colors.gray300, true: colors.primary }}
            />
          </View>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Haptic Feedback</Text>
            <Switch
              value={true}
              onValueChange={() => {}}
              trackColor={{ false: colors.gray300, true: colors.primary }}
            />
          </View>
        </View>
      </View>

      {/* Sign Out */}
      <TouchableOpacity style={styles.signOutButton} activeOpacity={0.8}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

// Categories Screen with Beautiful Grid
function CategoriesScreen({ navigation }: any) {
  const categories = [
    { id: '1', name: 'Geography', icon: '🌍', color: '#3b82f6', questions: 150 },
    { id: '2', name: 'Science', icon: '🔬', color: '#10b981', questions: 200 },
    { id: '3', name: 'History', icon: '📚', color: '#f59e0b', questions: 180 },
    { id: '4', name: 'Art', icon: '🎨', color: '#ec4899', questions: 120 },
    { id: '5', name: 'Sports', icon: '🏀', color: '#f97316', questions: 100 },
    { id: '6', name: 'Movies', icon: '🎬', color: '#8b5cf6', questions: 150 },
    { id: '7', name: 'Music', icon: '🎵', color: '#06b6d4', questions: 130 },
    { id: '8', name: 'Technology', icon: '💻', color: '#6366f1', questions: 170 },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.pageTitle}>Choose Your Challenge</Text>
      <FlatList
        data={categories}
        numColumns={isTablet ? 4 : 2}
        contentContainerStyle={styles.categoriesGrid}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <AnimatedCard delay={index * 50} style={styles.categoryCardContainer}>
            <TouchableOpacity
              style={[
                styles.categoryCard,
                { backgroundColor: item.color + '10', borderColor: item.color },
              ]}
              onPress={() => {
                if (!isWeb) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                navigation.navigate('Quiz', { category: item });
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.categoryIcon}>{item.icon}</Text>
              <Text style={styles.categoryName}>{item.name}</Text>
              <Text style={styles.categoryQuestions}>{item.questions} questions</Text>
            </TouchableOpacity>
          </AnimatedCard>
        )}
      />
    </View>
  );
}

// Quiz Screen with Animations
function QuizScreen({ navigation, route }: any) {
  const { category } = route.params;
  const { user, setUser } = useContext(QuizContext);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const progressAnim = useRef(new Animated.Value(0)).current;

  const questions = [
    {
      question: 'What is the capital of France?',
      options: ['London', 'Berlin', 'Paris', 'Madrid'],
      correct: 2,
    },
    {
      question: 'Which planet is known as the Red Planet?',
      options: ['Venus', 'Mars', 'Jupiter', 'Saturn'],
      correct: 1,
    },
    {
      question: 'What is the largest ocean on Earth?',
      options: ['Atlantic', 'Indian', 'Arctic', 'Pacific'],
      correct: 3,
    },
  ];

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: ((currentQuestion + 1) / questions.length) * 100,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [currentQuestion]);

  const handleAnswer = (index: number) => {
    setSelectedAnswer(index);
    const isCorrect = index === questions[currentQuestion].correct;

    if (isCorrect) {
      setScore(score + 1);
      if (!isWeb) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      setUser({ ...user, hearts: Math.max(0, user.hearts - 1) });
      if (!isWeb) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }

    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
      } else {
        navigation.navigate('Results', {
          score: score + (isCorrect ? 1 : 0),
          total: questions.length,
          category,
        });
      }
    }, 1500);
  };

  return (
    <View style={styles.quizContainer}>
      {/* Progress Bar */}
      <View style={styles.quizProgressContainer}>
        <Animated.View
          style={[
            styles.quizProgressBar,
            {
              width: progressAnim.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>

      {/* Hearts Display */}
      <View style={styles.quizHeader}>
        <View style={styles.heartsContainer}>
          {[...Array(5)].map((_, i) => (
            <Animated.Text key={i} style={[styles.heart, i >= user.hearts && styles.heartEmpty]}>
              {i < user.hearts ? '❤️' : '💔'}
            </Animated.Text>
          ))}
        </View>
        <Text style={styles.questionCounter}>
          {currentQuestion + 1}/{questions.length}
        </Text>
      </View>

      {/* Question */}
      <AnimatedCard delay={0} style={styles.questionContainer}>
        <Text style={styles.questionText}>{questions[currentQuestion].question}</Text>
      </AnimatedCard>

      {/* Options */}
      <View style={styles.optionsContainer}>
        {questions[currentQuestion].options.map((option, index) => {
          const isSelected = selectedAnswer === index;
          const isCorrect = index === questions[currentQuestion].correct;
          const showResult = selectedAnswer !== null;

          return (
            <AnimatedCard key={index} delay={100 + index * 50}>
              <TouchableOpacity
                style={[
                  styles.optionButton,
                  isSelected && styles.optionSelected,
                  showResult && isCorrect && styles.optionCorrect,
                  showResult && isSelected && !isCorrect && styles.optionIncorrect,
                ]}
                onPress={() => !showResult && handleAnswer(index)}
                disabled={showResult}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.optionText,
                    showResult && isCorrect && styles.optionTextCorrect,
                    showResult && isSelected && !isCorrect && styles.optionTextIncorrect,
                  ]}
                >
                  {option}
                </Text>
                {showResult && isCorrect && <Text style={styles.optionCheck}>✓</Text>}
                {showResult && isSelected && !isCorrect && (
                  <Text style={styles.optionCross}>✗</Text>
                )}
              </TouchableOpacity>
            </AnimatedCard>
          );
        })}
      </View>
    </View>
  );
}

// Results Screen with Celebration
function ResultsScreen({ navigation, route }: any) {
  const { score, total, category } = route.params;
  const { user, setUser } = useContext(QuizContext);
  const percentage = Math.round((score / total) * 100);
  const earnedXP = score * 10;

  useEffect(() => {
    // Update user stats
    setUser({
      ...user,
      totalXP: user.totalXP + earnedXP,
      stats: {
        ...user.stats,
        quizzesCompleted: user.stats.quizzesCompleted + 1,
        correctAnswers: user.stats.correctAnswers + score,
        totalAnswers: user.stats.totalAnswers + total,
      },
    });

    // Celebration haptics
    if (percentage >= 80 && !isWeb) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, []);

  // Confetti animation (refactored to avoid hooks inside loops)
  const CONFETTI_COUNT = 20;
  const confettiTranslateY = useRef(
    Array.from({ length: CONFETTI_COUNT }, () => new Animated.Value(-100)),
  ).current;
  const confettiTranslateX = useRef(
    Array.from({ length: CONFETTI_COUNT }, () => new Animated.Value(Math.random() * screenWidth)),
  ).current;
  const confettiRotation = useRef(
    Array.from({ length: CONFETTI_COUNT }, () => new Animated.Value(0)),
  ).current;

  useEffect(() => {
    if (percentage >= 80) {
      confettiTranslateY.forEach((ty, i) => {
        Animated.parallel([
          Animated.timing(ty, {
            toValue: screenHeight,
            duration: 3000 + Math.random() * 2000,
            useNativeDriver: true,
          }),
          Animated.timing(confettiRotation[i], {
            toValue: 360,
            duration: 3000,
            useNativeDriver: true,
          }),
        ]).start();
      });
    }
  }, [percentage]);

  return (
    <View style={styles.resultsContainer}>
      {percentage >= 80 &&
        confettiTranslateY.map((_, i) => (
          <Animated.View
            key={i}
            style={[
              styles.confetti,
              {
                transform: [
                  { translateY: confettiTranslateY[i] },
                  { translateX: confettiTranslateX[i] },
                  {
                    rotate: confettiRotation[i].interpolate({
                      inputRange: [0, 360],
                      outputRange: ['0deg', '360deg'],
                    }),
                  },
                ],
                backgroundColor: ['#f59e0b', '#3b82f6', '#10b981', '#ec4899'][i % 4],
              },
            ]}
          />
        ))}

      <AnimatedCard delay={0} style={styles.resultCard}>
        <Text style={styles.resultEmoji}>
          {percentage >= 80 ? '🎉' : percentage >= 60 ? '👏' : '💪'}
        </Text>
        <Text style={styles.resultTitle}>
          {percentage >= 80 ? 'Outstanding!' : percentage >= 60 ? 'Well Done!' : 'Keep Going!'}
        </Text>
        <Text style={styles.resultCategory}>{category.name} Quiz Complete</Text>

        <View style={styles.scoreCircle}>
          <Text style={styles.scoreText}>
            {score}/{total}
          </Text>
          <Text style={styles.percentageText}>{percentage}%</Text>
        </View>

        <View style={styles.xpEarned}>
          <Text style={styles.xpText}>+{earnedXP} XP</Text>
        </View>
      </AnimatedCard>

      <View style={styles.resultActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.secondaryButton]}
          onPress={() => navigation.navigate('Home')}
          activeOpacity={0.8}
        >
          <Text style={styles.secondaryButtonText}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.primaryButton]}
          onPress={() => navigation.navigate('Categories')}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryButtonText}>Play Again</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Leaderboard Screen
function LeaderboardScreen() {
  const leaderboard = [
    { rank: 1, name: 'Sarah Chen', score: 4850, avatar: 'SC', trend: 'up' },
    { rank: 2, name: 'Mike Johnson', score: 4720, avatar: 'MJ', trend: 'same' },
    { rank: 3, name: 'Emma Wilson', score: 4650, avatar: 'EW', trend: 'up' },
    { rank: 4, name: 'Alex Kumar', score: 4500, avatar: 'AK', trend: 'down' },
    { rank: 5, name: 'You', score: 2450, avatar: 'JD', trend: 'up', isUser: true },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.pageTitle}>Weekly Rankings</Text>

      {/* Top 3 Podium */}
      <View style={styles.podium}>
        {leaderboard.slice(0, 3).map((player, index) => (
          <AnimatedCard
            key={player.rank}
            delay={index * 100}
            style={[styles.podiumPlayer, player.rank === 1 && styles.firstPlace]}
          >
            {player.rank === 1 && <Text style={styles.crown}>👑</Text>}
            <View style={styles.podiumAvatar}>
              <Text style={styles.podiumAvatarText}>{player.avatar}</Text>
            </View>
            <Text style={styles.podiumName}>{player.name}</Text>
            <Text style={styles.podiumScore}>{player.score}</Text>
            <Text style={styles.podiumRank}>#{player.rank}</Text>
          </AnimatedCard>
        ))}
      </View>

      {/* Full Leaderboard */}
      {leaderboard.map((player, index) => (
        <AnimatedCard
          key={player.rank}
          delay={300 + index * 50}
          style={[styles.leaderboardItem, player.isUser && styles.leaderboardItemUser]}
        >
          <Text style={styles.leaderboardRank}>#{player.rank}</Text>
          <View style={styles.leaderboardAvatar}>
            <Text style={styles.leaderboardAvatarText}>{player.avatar}</Text>
          </View>
          <View style={styles.leaderboardInfo}>
            <Text style={styles.leaderboardName}>
              {player.name} {player.isUser && '(You)'}
            </Text>
            <Text style={styles.leaderboardScore}>{player.score} XP</Text>
          </View>
          <Text
            style={[
              styles.trendIcon,
              player.trend === 'up' && styles.trendUp,
              player.trend === 'down' && styles.trendDown,
            ]}
          >
            {player.trend === 'up' ? '↑' : player.trend === 'down' ? '↓' : '−'}
          </Text>
        </AnimatedCard>
      ))}
    </ScrollView>
  );
}

// Premium Screen
function PremiumScreen({ navigation }: any) {
  const { user, setUser } = useContext(QuizContext);
  const [selectedPlan, setSelectedPlan] = useState('annual');

  const features = [
    { icon: '♾️', title: 'Unlimited Hearts', description: 'Never stop learning' },
    { icon: '🚫', title: 'No Ads', description: 'Distraction-free experience' },
    { icon: '⚡', title: 'Double XP', description: 'Level up faster' },
    { icon: '🎯', title: 'Exclusive Content', description: 'Premium questions' },
    { icon: '🔥', title: 'Streak Protection', description: 'Keep your streak safe' },
    { icon: '📊', title: 'Advanced Stats', description: 'Detailed analytics' },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.premiumHeader}>
        <PulsingView>
          <Text style={styles.premiumIcon}>👑</Text>
        </PulsingView>
        <Text style={styles.premiumTitle}>QuizMentor Premium</Text>
        <Text style={styles.premiumSubtitle}>Unlock your full learning potential</Text>
      </View>

      {/* Features Grid */}
      <View style={styles.featuresGrid}>
        {features.map((feature, index) => (
          <AnimatedCard key={index} delay={index * 50} style={styles.featureCard}>
            <Text style={styles.featureIcon}>{feature.icon}</Text>
            <Text style={styles.featureTitle}>{feature.title}</Text>
            <Text style={styles.featureDescription}>{feature.description}</Text>
          </AnimatedCard>
        ))}
      </View>

      {/* Pricing Plans */}
      <View style={styles.pricingSection}>
        <TouchableOpacity
          style={[styles.pricingCard, selectedPlan === 'annual' && styles.pricingCardSelected]}
          onPress={() => setSelectedPlan('annual')}
          activeOpacity={0.8}
        >
          <View style={styles.pricingBadge}>
            <Text style={styles.pricingBadgeText}>BEST VALUE</Text>
          </View>
          <Text style={styles.pricingTitle}>Annual</Text>
          <Text style={styles.pricingPrice}>$89.99/year</Text>
          <Text style={styles.pricingSavings}>Save 40%</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.pricingCard, selectedPlan === 'monthly' && styles.pricingCardSelected]}
          onPress={() => setSelectedPlan('monthly')}
          activeOpacity={0.8}
        >
          <Text style={styles.pricingTitle}>Monthly</Text>
          <Text style={styles.pricingPrice}>$12.99/month</Text>
          <Text style={styles.pricingSavings}>Cancel anytime</Text>
        </TouchableOpacity>
      </View>

      {/* CTA Button */}
      <TouchableOpacity
        style={styles.premiumCTA}
        onPress={() => {
          setUser({ ...user, isPremium: true });
          Alert.alert('Success!', 'Premium activated! (Demo)');
          navigation.goBack();
        }}
        activeOpacity={0.8}
      >
        <Text style={styles.premiumCTAText}>Start Free Trial</Text>
      </TouchableOpacity>

      <Text style={styles.premiumTerms}>7-day free trial • Cancel anytime • Terms apply</Text>
    </ScrollView>
  );
}

// Tab Navigator
const Tab = createBottomTabNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.gray500,
        tabBarStyle: styles.tabBar,
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color }) => <Text style={[styles.tabIcon, { color }]}>🏠</Text>,
        }}
      />
      <Tab.Screen
        name="Categories"
        component={CategoriesScreen}
        options={{
          tabBarIcon: ({ color }) => <Text style={[styles.tabIcon, { color }]}>📚</Text>,
        }}
      />
      <Tab.Screen
        name="Leaderboard"
        component={LeaderboardScreen}
        options={{
          tabBarIcon: ({ color }) => <Text style={[styles.tabIcon, { color }]}>🏆</Text>,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color }) => <Text style={[styles.tabIcon, { color }]}>👤</Text>,
        }}
      />
    </Tab.Navigator>
  );
}

// Stack Navigator
const Stack = createStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <QuizProvider>
        <NavigationContainer>
          <Stack.Navigator
            screenOptions={{
              headerStyle: {
                backgroundColor: colors.white,
                elevation: 0,
                shadowOpacity: 0,
                borderBottomWidth: 1,
                borderBottomColor: colors.gray200,
              },
              headerTintColor: colors.gray900,
              headerTitleStyle: {
                fontWeight: '600',
              },
            }}
          >
            <Stack.Screen name="Main" component={TabNavigator} options={{ headerShown: false }} />
            <Stack.Screen name="Quiz" component={QuizScreen} options={{ title: 'Quiz' }} />
            <Stack.Screen
              name="Results"
              component={ResultsScreen}
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="Premium"
              component={PremiumScreen}
              options={{
                title: 'Go Premium',
                presentation: 'modal' as any,
              }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </QuizProvider>
    </SafeAreaProvider>
  );
}

// Comprehensive StyleSheet
const styles = StyleSheet.create({
  // Base
  container: {
    flex: 1,
    backgroundColor: colors.gray50,
  },

  // Typography
  pageTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.gray900,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.gray900,
    marginBottom: 16,
  },

  // Home Screen
  homeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    backgroundColor: colors.white,
  },
  greeting: {
    fontSize: 14,
    color: colors.gray500,
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.gray900,
  },
  userLevel: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
    marginTop: 2,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '600',
  },

  // Streak Card
  streakCard: {
    backgroundColor: colors.white,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  streakContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  streakInfo: {
    flex: 1,
    marginLeft: 16,
  },
  streakTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.gray900,
  },
  streakSubtitle: {
    fontSize: 14,
    color: colors.gray500,
    marginTop: 4,
  },
  streakStats: {
    alignItems: 'flex-end',
  },
  streakBest: {
    fontSize: 12,
    color: colors.gray500,
  },

  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    marginTop: 16,
  },
  statCard: {
    flex: 1,
    minWidth: isTablet ? '23%' : '46%',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    margin: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.gray900,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.gray500,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Challenge Card
  challengeCard: {
    backgroundColor: colors.warning,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  challengeEmoji: {
    fontSize: 48,
    marginRight: 16,
  },
  challengeContent: {
    flex: 1,
  },
  challengeTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.white,
    marginBottom: 4,
  },
  challengeDescription: {
    fontSize: 14,
    color: colors.white,
    opacity: 0.9,
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.white,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: colors.white,
    marginTop: 8,
  },

  // Quick Actions
  quickActions: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  actionRow: {
    flexDirection: 'row',
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  secondaryButton: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  premiumButton: {
    backgroundColor: colors.secondary,
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: colors.gray700,
    fontSize: 14,
    fontWeight: '600',
  },
  premiumButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  actionEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },

  // Recent Activity
  recentActivity: {
    paddingHorizontal: 20,
    marginTop: 32,
    marginBottom: 32,
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  activityIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray900,
    marginBottom: 2,
  },
  activityScore: {
    fontSize: 14,
    color: colors.gray600,
  },
  activityTime: {
    fontSize: 12,
    color: colors.gray500,
  },

  // Profile Screen
  profileHeader: {
    backgroundColor: colors.white,
    paddingVertical: 32,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  profileAvatarLarge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  profileAvatarText: {
    color: colors.white,
    fontSize: 36,
    fontWeight: '700',
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.gray900,
    marginBottom: 4,
  },
  editHint: {
    fontSize: 12,
    color: colors.primary,
    marginBottom: 8,
  },
  editNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  nameInput: {
    borderWidth: 1,
    borderColor: colors.gray300,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    marginRight: 8,
    minWidth: 150,
  },
  saveButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  profileEmail: {
    fontSize: 14,
    color: colors.gray600,
    marginBottom: 24,
  },
  profileStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileStatItem: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  profileStatValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.gray900,
  },
  profileStatLabel: {
    fontSize: 12,
    color: colors.gray500,
    marginTop: 4,
  },
  profileStatDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.gray200,
  },

  // Premium Prompt
  premiumPrompt: {
    backgroundColor: colors.secondary,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  premiumPromptIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  premiumPromptContent: {
    flex: 1,
  },
  premiumPromptTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
    marginBottom: 2,
  },
  premiumPromptDescription: {
    fontSize: 12,
    color: colors.white,
    opacity: 0.9,
  },
  premiumPromptButton: {
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  premiumPromptButtonText: {
    color: colors.secondary,
    fontSize: 14,
    fontWeight: '600',
  },

  // Profile Sections
  section: {
    paddingHorizontal: 20,
    marginTop: 32,
  },
  learningStats: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  statRowLabel: {
    fontSize: 14,
    color: colors.gray600,
  },
  statRowValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray900,
  },

  // Category Progress
  categoryProgress: {
    marginBottom: 16,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray900,
    marginBottom: 8,
  },
  categoryBar: {
    height: 8,
    backgroundColor: colors.gray200,
    borderRadius: 4,
    overflow: 'hidden',
  },
  categoryBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  categoryCount: {
    fontSize: 12,
    color: colors.gray500,
    marginTop: 4,
  },

  // Achievements
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  achievementCard: {
    width: isTablet ? '31%' : '47%',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    margin: 6,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  achievementLocked: {
    opacity: 0.5,
  },
  achievementIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  achievementName: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.gray900,
    textAlign: 'center',
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 10,
    color: colors.gray500,
    textAlign: 'center',
  },

  // Settings
  settingsContainer: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingLabel: {
    fontSize: 14,
    color: colors.gray700,
  },

  // Sign Out
  signOutButton: {
    marginHorizontal: 20,
    marginTop: 32,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  signOutText: {
    color: colors.danger,
    fontSize: 16,
    fontWeight: '600',
  },

  // Categories Screen
  categoriesGrid: {
    padding: 16,
  },
  categoryCardContainer: {
    flex: 1,
    margin: 4,
  },
  categoryCard: {
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
  },
  categoryIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  categoryQuestions: {
    fontSize: 12,
    color: colors.gray600,
    marginTop: 4,
  },

  // Quiz Screen
  quizContainer: {
    flex: 1,
    backgroundColor: colors.white,
  },
  quizProgressContainer: {
    height: 4,
    backgroundColor: colors.gray200,
  },
  quizProgressBar: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  quizHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  heartsContainer: {
    flexDirection: 'row',
  },
  heart: {
    fontSize: 20,
    marginRight: 4,
  },
  heartEmpty: {
    opacity: 0.3,
  },
  questionCounter: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray700,
  },
  questionContainer: {
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  questionText: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.gray900,
    textAlign: 'center',
    lineHeight: 32,
  },
  optionsContainer: {
    paddingHorizontal: 20,
  },
  optionButton: {
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.gray200,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  optionCorrect: {
    borderColor: colors.success,
    backgroundColor: colors.success + '10',
  },
  optionIncorrect: {
    borderColor: colors.danger,
    backgroundColor: colors.danger + '10',
  },
  optionText: {
    fontSize: 16,
    color: colors.gray900,
    fontWeight: '500',
  },
  optionTextCorrect: {
    color: colors.success,
  },
  optionTextIncorrect: {
    color: colors.danger,
  },
  optionCheck: {
    fontSize: 20,
    color: colors.success,
    fontWeight: '700',
  },
  optionCross: {
    fontSize: 20,
    color: colors.danger,
    fontWeight: '700',
  },

  // Results Screen
  resultsContainer: {
    flex: 1,
    backgroundColor: colors.gray50,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  resultCard: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  resultEmoji: {
    fontSize: 72,
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.gray900,
    marginBottom: 8,
  },
  resultCategory: {
    fontSize: 16,
    color: colors.gray600,
    marginBottom: 32,
  },
  scoreCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: colors.primary + '10',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  scoreText: {
    fontSize: 48,
    fontWeight: '700',
    color: colors.primary,
  },
  percentageText: {
    fontSize: 20,
    color: colors.gray600,
  },
  xpEarned: {
    backgroundColor: colors.warning,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  xpText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.white,
  },
  resultActions: {
    flexDirection: 'row',
    marginTop: 32,
  },
  confetti: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
  },

  // Leaderboard
  podium: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  podiumPlayer: {
    alignItems: 'center',
    marginHorizontal: 12,
    paddingVertical: 20,
  },
  firstPlace: {
    transform: [{ scale: 1.1 }],
  },
  crown: {
    fontSize: 32,
    position: 'absolute',
    top: -20,
  },
  podiumAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  podiumAvatarText: {
    color: colors.white,
    fontSize: 24,
    fontWeight: '700',
  },
  podiumName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray900,
    marginBottom: 4,
  },
  podiumScore: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 4,
  },
  podiumRank: {
    fontSize: 12,
    color: colors.gray500,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  leaderboardItemUser: {
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: colors.primary + '05',
  },
  leaderboardRank: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.gray500,
    width: 40,
  },
  leaderboardAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.gray200,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  leaderboardAvatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray700,
  },
  leaderboardInfo: {
    flex: 1,
  },
  leaderboardName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray900,
  },
  leaderboardScore: {
    fontSize: 14,
    color: colors.gray600,
  },
  trendIcon: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.gray400,
  },
  trendUp: {
    color: colors.success,
  },
  trendDown: {
    color: colors.danger,
  },

  // Premium Screen
  premiumHeader: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  premiumIcon: {
    fontSize: 72,
  },
  premiumTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.gray900,
    marginTop: 16,
    marginBottom: 8,
  },
  premiumSubtitle: {
    fontSize: 16,
    color: colors.gray600,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  featureCard: {
    width: isTablet ? '31%' : '47%',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 20,
    margin: '1.5%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  featureIcon: {
    fontSize: 36,
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray900,
    marginBottom: 4,
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: 12,
    color: colors.gray600,
    textAlign: 'center',
  },
  pricingSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  pricingCard: {
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.gray200,
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    alignItems: 'center',
    position: 'relative',
  },
  pricingCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '05',
  },
  pricingBadge: {
    position: 'absolute',
    top: -10,
    backgroundColor: colors.warning,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pricingBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.white,
    textTransform: 'uppercase',
  },
  pricingTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.gray900,
    marginBottom: 8,
  },
  pricingPrice: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 4,
  },
  pricingSavings: {
    fontSize: 14,
    color: colors.gray600,
  },
  premiumCTA: {
    backgroundColor: colors.primary,
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  premiumCTAText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.white,
  },
  premiumTerms: {
    fontSize: 12,
    color: colors.gray500,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 32,
  },

  // Tab Bar
  tabBar: {
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 20 : 8,
    height: Platform.OS === 'ios' ? 80 : 60,
  },
  tabIcon: {
    fontSize: 24,
  },
});
