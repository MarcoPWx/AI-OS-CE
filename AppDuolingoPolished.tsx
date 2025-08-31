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
  Pressable,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import {
  quizData,
  getRandomQuestions,
  getDailyChallenge,
  Category,
  Question,
} from './services/quizData';

// Get screen dimensions
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';

// DevMentor-inspired color palette with Duolingo vibrancy
const colors = {
  // Primary colors - DevMentor blue theme
  primary: '#2563eb',
  primaryLight: '#60a5fa',
  primaryDark: '#1e40af',

  // Duolingo green accent
  accent: '#58cc02',
  accentLight: '#89e219',
  accentDark: '#58a700',

  // Status colors
  success: '#58cc02',
  warning: '#ff9600',
  danger: '#ff4b4b',
  info: '#1cb0f6',

  // Neutrals
  background: '#ffffff',
  surface: '#ffffff',
  text: '#3c3c3c',
  textLight: '#777777',
  textMuted: '#afafaf',
  border: '#e5e5e5',

  // Special colors
  gold: '#ffc800',
  purple: '#ce82ff',
  pink: '#ff4b82',

  // Gradients
  gradientPrimary: ['#2563eb', '#1e40af'],
  gradientAccent: ['#89e219', '#58cc02'],
  gradientGold: ['#ffd900', '#ffc800'],
};

// Quiz Context
const QuizContext = createContext<any>({});

function QuizProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState({
    name: 'Learner',
    level: 5,
    xp: 850,
    nextLevelXp: 1000,
    hearts: 5,
    maxHearts: 5,
    streak: 7,
    gems: 120,
    leagues: 'Silver',
  });

  return <QuizContext.Provider value={{ user, setUser }}>{children}</QuizContext.Provider>;
}

// Animated Components
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

// Custom Button Component
const DuoButton = ({ title, onPress, variant = 'primary', disabled = false, style = {} }: any) => {
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

  const getButtonColors = () => {
    if (disabled) return ['#e5e5e5', '#d0d0d0'];
    switch (variant) {
      case 'success':
        return colors.gradientAccent;
      case 'danger':
        return [colors.danger, '#ff2b2b'];
      case 'warning':
        return [colors.warning, '#ff7600'];
      default:
        return colors.gradientPrimary;
    }
  };

  return (
    <AnimatedTouchable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={[
        {
          transform: [{ scale: scaleAnim }],
        },
        style,
      ]}
    >
      <LinearGradient
        colors={getButtonColors()}
        style={styles.duoButton}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        <View style={styles.duoButtonInner}>
          <Text style={[styles.duoButtonText, disabled && styles.duoButtonTextDisabled]}>
            {title}
          </Text>
        </View>
      </LinearGradient>
    </AnimatedTouchable>
  );
};

// Lesson Button Component
const LessonButton = ({ lesson, onPress, index }: any) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(index * 100),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 100,
        useNativeDriver: true,
      }),
    ]).start();

    if (lesson.isCurrent) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnim, {
            toValue: -5,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(bounceAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    }
  }, []);

  const getButtonStyle = () => {
    if (lesson.isLocked) return styles.lessonButtonLocked;
    if (lesson.isCompleted) return styles.lessonButtonCompleted;
    if (lesson.isCurrent) return styles.lessonButtonCurrent;
    return styles.lessonButton;
  };

  return (
    <Animated.View
      style={[
        styles.lessonButtonContainer,
        {
          transform: [{ scale: scaleAnim }, { translateY: bounceAnim }],
        },
      ]}
    >
      <TouchableOpacity
        onPress={() => !lesson.isLocked && onPress(lesson)}
        disabled={lesson.isLocked}
        style={getButtonStyle()}
      >
        {lesson.isCompleted && (
          <View style={styles.lessonCrown}>
            <Text style={styles.lessonCrownIcon}>👑</Text>
          </View>
        )}

        <View style={styles.lessonIconContainer}>
          <Text style={styles.lessonIcon}>{lesson.isLocked ? '🔒' : lesson.icon}</Text>
        </View>

        <Text style={styles.lessonName}>{lesson.name}</Text>

        {lesson.isCurrent && (
          <View style={styles.lessonProgress}>
            <View style={[styles.lessonProgressFill, { width: `${lesson.progress * 100}%` }]} />
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

// Path Screen
function PathScreen({ navigation }: any) {
  const { user } = useContext(QuizContext);
  const scrollRef = useRef<ScrollView>(null);

  const lessons = quizData.map((category, index) => ({
    ...category,
    isCompleted: index < 2,
    isCurrent: index === 2,
    isLocked: index > 5,
    progress: index < 2 ? 1 : index === 2 ? 0.6 : 0,
  }));

  const handleLessonPress = (lesson: any) => {
    navigation.navigate('Lesson', { category: lesson });
    if (!isWeb) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.streakButton}>
          <Text style={styles.streakEmoji}>🔥</Text>
          <Text style={styles.streakText}>{user.streak}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.titleButton}>
          <Text style={styles.titleText}>General Knowledge</Text>
          <Ionicons name="chevron-down" size={16} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.gemsButton}>
            <Text style={styles.gemsEmoji}>💎</Text>
            <Text style={styles.gemsText}>{user.gems}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.heartsButton}>
            <Text style={styles.heartsEmoji}>❤️</Text>
            <Text style={styles.heartsText}>{user.hearts}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* XP Bar */}
      <View style={styles.xpContainer}>
        <View style={styles.xpBar}>
          <Animated.View
            style={[styles.xpFill, { width: `${(user.xp / user.nextLevelXp) * 100}%` }]}
          />
        </View>
        <Text style={styles.xpText}>
          Level {user.level} • {user.xp}/{user.nextLevelXp} XP
        </Text>
      </View>

      {/* Lesson Path */}
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.pathContent}
      >
        <View style={styles.pathContainer}>
          {lessons.map((lesson, index) => {
            // Create zigzag pattern
            const position = index % 3;
            const marginLeft =
              position === 0 ? 0 : position === 1 ? screenWidth * 0.3 : screenWidth * 0.15;

            return (
              <View key={lesson.id} style={[styles.lessonRow, { marginLeft }]}>
                <LessonButton lesson={lesson} onPress={handleLessonPress} index={index} />

                {index < lessons.length - 1 && <View style={styles.pathLine} />}
              </View>
            );
          })}
        </View>

        {/* Daily Challenge Card */}
        <TouchableOpacity
          style={styles.dailyCard}
          onPress={() => navigation.navigate('DailyChallenge')}
        >
          <LinearGradient
            colors={colors.gradientGold}
            style={styles.dailyGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.dailyIcon}>🎯</Text>
            <View style={styles.dailyContent}>
              <Text style={styles.dailyTitle}>Daily Challenge</Text>
              <Text style={styles.dailySubtitle}>Complete for bonus XP!</Text>
            </View>
            <View style={styles.dailyReward}>
              <Text style={styles.dailyRewardText}>+50 XP</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Continue Button */}
      <View style={styles.bottomContainer}>
        <DuoButton
          title="CONTINUE"
          variant="success"
          onPress={() => {
            const currentLesson = lessons.find((l) => l.isCurrent);
            if (currentLesson) {
              handleLessonPress(currentLesson);
            }
          }}
        />
      </View>
    </SafeAreaView>
  );
}

// Lesson Screen
function LessonScreen({ navigation, route }: any) {
  const category: Category = route.params?.category || quizData[0];
  const [questions] = useState<Question[]>(() => getRandomQuestions(category.id, 5));
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [hearts, setHearts] = useState(5);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  const shakeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(300)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

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
      setHearts(hearts - 1);
      if (!isWeb) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

      // Shake animation
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]).start();

      if (hearts <= 1) {
        setTimeout(() => setShowResult(true), 1500);
        return;
      }
    }

    setShowFeedback(true);
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setIsAnswerSubmitted(false);
      setShowFeedback(false);

      // Reset and animate slide
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
    const xpEarned = score * 10;

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.resultContainer}>
          <View style={styles.resultCard}>
            <Text style={styles.resultEmoji}>
              {accuracy >= 80 ? '🏆' : accuracy >= 60 ? '🎉' : '💪'}
            </Text>
            <Text style={styles.resultTitle}>
              {accuracy >= 80 ? 'Amazing!' : accuracy >= 60 ? 'Great job!' : 'Keep learning!'}
            </Text>
            <Text style={styles.resultSubtitle}>
              You got {score} out of {questions.length} correct!
            </Text>

            <View style={styles.resultXP}>
              <Text style={styles.resultXPText}>+{xpEarned} XP</Text>
            </View>

            <View style={styles.resultStats}>
              <View style={styles.resultStat}>
                <Text style={styles.resultStatValue}>{accuracy}%</Text>
                <Text style={styles.resultStatLabel}>Accuracy</Text>
              </View>
              <View style={styles.resultStatDivider} />
              <View style={styles.resultStat}>
                <Text style={styles.resultStatValue}>
                  {score}/{questions.length}
                </Text>
                <Text style={styles.resultStatLabel}>Correct</Text>
              </View>
            </View>

            <DuoButton
              title="CONTINUE"
              variant="success"
              onPress={() => navigation.navigate('Path')}
              style={{ marginTop: 20 }}
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.lessonContainer}>
      {/* Header */}
      <View style={styles.lessonHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={28} color={colors.textLight} />
        </TouchableOpacity>

        <View style={styles.progressBarContainer}>
          <View style={styles.progressBar}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 100],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            />
          </View>
        </View>

        <View style={styles.heartsContainer}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Text key={i} style={styles.heartIcon}>
              {i < hearts ? '❤️' : '💔'}
            </Text>
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
          <Text style={styles.questionPrompt}>Select the correct answer</Text>
          <Text style={styles.questionText}>{question.question}</Text>
        </View>

        <View style={styles.answersContainer}>
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
                  styles.answerButton,
                  isSelected && !isAnswerSubmitted && styles.answerButtonSelected,
                  showCorrect && styles.answerButtonCorrect,
                  showWrong && styles.answerButtonWrong,
                ]}
              >
                <Text
                  style={[
                    styles.answerText,
                    isSelected && !isAnswerSubmitted && styles.answerTextSelected,
                    showCorrect && styles.answerTextCorrect,
                    showWrong && styles.answerTextWrong,
                  ]}
                >
                  {option}
                </Text>
                {showCorrect && (
                  <Ionicons name="checkmark-circle" size={24} color={colors.success} />
                )}
                {showWrong && <Ionicons name="close-circle" size={24} color={colors.danger} />}
              </TouchableOpacity>
            );
          })}
        </View>

        {showFeedback && question.explanation && (
          <View
            style={[
              styles.feedbackCard,
              selectedAnswer === question.correct ? styles.feedbackSuccess : styles.feedbackError,
            ]}
          >
            <Text style={styles.feedbackTitle}>
              {selectedAnswer === question.correct ? '✅ Correct!' : '💡 Not quite!'}
            </Text>
            <Text style={styles.feedbackText}>{question.explanation}</Text>
          </View>
        )}
      </Animated.View>

      {/* Bottom Button */}
      <View style={styles.bottomContainer}>
        {!isAnswerSubmitted ? (
          <DuoButton
            title="CHECK"
            variant={selectedAnswer !== null ? 'success' : 'primary'}
            disabled={selectedAnswer === null}
            onPress={checkAnswer}
          />
        ) : (
          <DuoButton
            title="CONTINUE"
            variant={selectedAnswer === question.correct ? 'success' : 'warning'}
            onPress={nextQuestion}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

// Profile Screen
function ProfileScreen() {
  const { user } = useContext(QuizContext);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.profileHeader}>
          <View style={styles.profileAvatar}>
            <Text style={styles.profileAvatarText}>👤</Text>
          </View>
          <Text style={styles.profileName}>{user.name}</Text>
          <Text style={styles.profileLeague}>{user.leagues} League</Text>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statEmoji}>🔥</Text>
            <Text style={styles.statValue}>{user.streak}</Text>
            <Text style={styles.statLabel}>Day streak</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statEmoji}>⚡</Text>
            <Text style={styles.statValue}>{user.xp}</Text>
            <Text style={styles.statLabel}>Total XP</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statEmoji}>👑</Text>
            <Text style={styles.statValue}>{user.level}</Text>
            <Text style={styles.statLabel}>Level</Text>
          </View>
        </View>

        <View style={styles.achievementsSection}>
          <Text style={styles.sectionTitle}>Achievements</Text>
          <View style={styles.achievementsGrid}>
            {['Wildfire', 'Scholar', 'Champion', 'Sage'].map((achievement, i) => (
              <View key={i} style={styles.achievementBadge}>
                <Text style={styles.achievementIcon}>🏅</Text>
                <Text style={styles.achievementName}>{achievement}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Shop Screen
function ShopScreen() {
  const { user } = useContext(QuizContext);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.shopHeader}>
          <Text style={styles.shopTitle}>Shop</Text>
          <View style={styles.shopGems}>
            <Text style={styles.shopGemsIcon}>💎</Text>
            <Text style={styles.shopGemsValue}>{user.gems}</Text>
          </View>
        </View>

        <View style={styles.shopItems}>
          <TouchableOpacity style={styles.shopItem}>
            <View style={styles.shopItemIcon}>
              <Text style={styles.shopItemEmoji}>❤️</Text>
            </View>
            <View style={styles.shopItemInfo}>
              <Text style={styles.shopItemName}>Refill Hearts</Text>
              <Text style={styles.shopItemDesc}>Get full hearts instantly</Text>
            </View>
            <View style={styles.shopItemPrice}>
              <Text style={styles.shopItemPriceText}>350</Text>
              <Text style={styles.shopItemGem}>💎</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.shopItem}>
            <View style={styles.shopItemIcon}>
              <Text style={styles.shopItemEmoji}>🛡️</Text>
            </View>
            <View style={styles.shopItemInfo}>
              <Text style={styles.shopItemName}>Streak Freeze</Text>
              <Text style={styles.shopItemDesc}>Protect your streak for 1 day</Text>
            </View>
            <View style={styles.shopItemPrice}>
              <Text style={styles.shopItemPriceText}>200</Text>
              <Text style={styles.shopItemGem}>💎</Text>
            </View>
          </TouchableOpacity>
        </View>
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
        name="Learn"
        component={PathScreen}
        options={{
          tabBarIcon: ({ color }) => <Ionicons name="home" size={24} color={color} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color }) => <Ionicons name="person" size={24} color={color} />,
        }}
      />
      <Tab.Screen
        name="Shop"
        component={ShopScreen}
        options={{
          tabBarIcon: ({ color }) => <Ionicons name="cart" size={24} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <QuizProvider>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen name="Lesson" component={LessonScreen} />
            <Stack.Screen name="DailyChallenge" component={LessonScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </QuizProvider>
    </SafeAreaProvider>
  );
}

// Styles
const styles = StyleSheet.create({
  // Container
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: 2,
    borderBottomColor: colors.border,
  },
  streakButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  streakEmoji: {
    fontSize: 24,
  },
  streakText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.warning,
  },
  titleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  titleText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  gemsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  gemsEmoji: {
    fontSize: 20,
  },
  gemsText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
  heartsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  heartsEmoji: {
    fontSize: 20,
  },
  heartsText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.danger,
  },

  // XP Bar
  xpContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  xpBar: {
    height: 12,
    backgroundColor: colors.border,
    borderRadius: 6,
    overflow: 'hidden',
  },
  xpFill: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: 6,
  },
  xpText: {
    fontSize: 12,
    color: colors.textLight,
    textAlign: 'center',
    marginTop: 6,
  },

  // Path
  pathContent: {
    paddingTop: 30,
  },
  pathContainer: {
    paddingHorizontal: 40,
  },
  lessonRow: {
    marginVertical: 10,
  },
  lessonButtonContainer: {
    alignItems: 'center',
  },
  lessonButton: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: colors.surface,
    borderWidth: 4,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  lessonButtonCurrent: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: colors.accent + '15',
    borderWidth: 4,
    borderColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  lessonButtonCompleted: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: colors.gold + '15',
    borderWidth: 4,
    borderColor: colors.gold,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  lessonButtonLocked: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#f5f5f5',
    borderWidth: 4,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.5,
  },
  lessonCrown: {
    position: 'absolute',
    top: -15,
    zIndex: 1,
  },
  lessonCrownIcon: {
    fontSize: 24,
  },
  lessonIconContainer: {
    marginBottom: 4,
  },
  lessonIcon: {
    fontSize: 40,
  },
  lessonName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
  },
  lessonProgress: {
    position: 'absolute',
    bottom: -4,
    left: 10,
    right: 10,
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  lessonProgressFill: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: 3,
  },
  pathLine: {
    position: 'absolute',
    top: 110,
    left: '50%',
    width: 3,
    height: 40,
    backgroundColor: colors.border,
    marginLeft: -1.5,
  },

  // Daily Card
  dailyCard: {
    marginHorizontal: 20,
    marginTop: 40,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  dailyGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  dailyIcon: {
    fontSize: 40,
    marginRight: 16,
  },
  dailyContent: {
    flex: 1,
  },
  dailyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.surface,
  },
  dailySubtitle: {
    fontSize: 14,
    color: colors.surface,
    opacity: 0.9,
    marginTop: 2,
  },
  dailyReward: {
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  dailyRewardText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.gold,
  },

  // Bottom Container
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: colors.surface,
    borderTopWidth: 2,
    borderTopColor: colors.border,
  },

  // Duo Button
  duoButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  duoButtonInner: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  duoButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.surface,
    letterSpacing: 1,
  },
  duoButtonTextDisabled: {
    color: colors.textMuted,
  },

  // Lesson Screen
  lessonContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  lessonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: 2,
    borderBottomColor: colors.border,
  },
  progressBarContainer: {
    flex: 1,
    marginHorizontal: 16,
  },
  progressBar: {
    height: 16,
    backgroundColor: colors.border,
    borderRadius: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: 8,
  },
  heartsContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  heartIcon: {
    fontSize: 20,
  },

  // Question
  questionContent: {
    flex: 1,
    padding: 20,
  },
  questionCard: {
    marginBottom: 32,
  },
  questionPrompt: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  questionText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    lineHeight: 32,
  },
  answersContainer: {
    gap: 12,
  },
  answerButton: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  answerButtonSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  answerButtonCorrect: {
    borderColor: colors.success,
    backgroundColor: colors.success + '10',
  },
  answerButtonWrong: {
    borderColor: colors.danger,
    backgroundColor: colors.danger + '10',
  },
  answerText: {
    fontSize: 16,
    color: colors.text,
    flex: 1,
  },
  answerTextSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  answerTextCorrect: {
    color: colors.success,
    fontWeight: '600',
  },
  answerTextWrong: {
    color: colors.danger,
    fontWeight: '600',
  },

  // Feedback
  feedbackCard: {
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
  },
  feedbackSuccess: {
    backgroundColor: colors.success + '15',
  },
  feedbackError: {
    backgroundColor: colors.warning + '15',
  },
  feedbackTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  feedbackText: {
    fontSize: 14,
    color: colors.textLight,
    lineHeight: 20,
  },

  // Result
  resultContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  resultCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  resultEmoji: {
    fontSize: 72,
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  resultSubtitle: {
    fontSize: 18,
    color: colors.textLight,
    marginBottom: 24,
    textAlign: 'center',
  },
  resultXP: {
    backgroundColor: colors.accent + '20',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    marginBottom: 24,
  },
  resultXPText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.accent,
  },
  resultStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  resultStat: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  resultStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  resultStatLabel: {
    fontSize: 14,
    color: colors.textLight,
    marginTop: 4,
  },
  resultStatDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
  },

  // Profile
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  profileAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileAvatarText: {
    fontSize: 48,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  profileLeague: {
    fontSize: 16,
    color: colors.textLight,
  },

  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 32,
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
  },
  statEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textLight,
  },

  // Achievements
  achievementsSection: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  achievementBadge: {
    width: (screenWidth - 52) / 2,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
  },
  achievementIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  achievementName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },

  // Shop
  shopHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  shopTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
  },
  shopGems: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '10',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  shopGemsIcon: {
    fontSize: 18,
  },
  shopGemsValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
  shopItems: {
    paddingHorizontal: 20,
    gap: 12,
  },
  shopItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: colors.border,
  },
  shopItemIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  shopItemEmoji: {
    fontSize: 24,
  },
  shopItemInfo: {
    flex: 1,
  },
  shopItemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  shopItemDesc: {
    fontSize: 14,
    color: colors.textLight,
    marginTop: 2,
  },
  shopItemPrice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  shopItemPriceText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  shopItemGem: {
    fontSize: 16,
  },

  // Tab Bar
  tabBar: {
    backgroundColor: colors.surface,
    borderTopWidth: 2,
    borderTopColor: colors.border,
    height: 60,
    paddingBottom: 8,
    paddingTop: 8,
  },
});
