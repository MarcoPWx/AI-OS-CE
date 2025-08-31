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

// Home Screen with Dashboard
function HomeScreen({ navigation }: any) {
  const { user } = useContext(QuizContext);
  const dailyQuestions = getDailyChallenge();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.userName}>{user.name}!</Text>
          </View>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => navigation.navigate('Profile')}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{user.name[0]}</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>🔥</Text>
            <Text style={styles.statValue}>{user.streak}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>⭐</Text>
            <Text style={styles.statValue}>{user.totalXP}</Text>
            <Text style={styles.statLabel}>Total XP</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>❤️</Text>
            <Text style={styles.statValue}>{user.hearts}</Text>
            <Text style={styles.statLabel}>Hearts</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.dailyChallengeCard}
          onPress={() => navigation.navigate('DailyChallenge')}
        >
          <View style={styles.dailyChallengeHeader}>
            <Text style={styles.dailyChallengeTitle}>Daily Challenge</Text>
            <Text style={styles.dailyChallengeQuestions}>{dailyQuestions.length} questions</Text>
          </View>
          <Text style={styles.dailyChallengeDescription}>
            Complete today's challenge to maintain your streak!
          </Text>
          <View style={styles.dailyChallengeProgress}>
            <View style={[styles.progressBar, { width: '0%' }]} />
          </View>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Categories</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesScroll}
        >
          {quizData.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[styles.categoryCard, { borderColor: category.color }]}
              onPress={() => navigation.navigate('Quiz', { category })}
            >
              <Text style={styles.categoryIcon}>{category.icon}</Text>
              <Text style={styles.categoryName}>{category.name}</Text>
              <Text style={styles.categoryCount}>{category.questions.length} Q's</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {!user.isPremium && (
          <TouchableOpacity
            style={styles.premiumBanner}
            onPress={() => navigation.navigate('Premium')}
          >
            <Text style={styles.premiumTitle}>🌟 Go Premium</Text>
            <Text style={styles.premiumSubtitle}>
              Unlock unlimited hearts, ad-free experience & more!
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// Categories Screen
function CategoriesScreen({ navigation }: any) {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.screenTitle}>Choose a Category</Text>
        <View style={styles.categoriesGrid}>
          {quizData.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryGridCard,
                { backgroundColor: category.color + '15', borderColor: category.color },
              ]}
              onPress={() => navigation.navigate('Quiz', { category })}
            >
              <Text style={styles.categoryGridIcon}>{category.icon}</Text>
              <Text style={styles.categoryGridName}>{category.name}</Text>
              <Text style={styles.categoryGridDescription}>{category.description}</Text>
              <View style={styles.categoryGridFooter}>
                <Text style={styles.categoryGridQuestions}>
                  {category.questions.length} questions
                </Text>
                <View style={[styles.difficultyIndicator, { backgroundColor: category.color }]} />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Quiz Screen
function QuizScreen({ navigation, route }: any) {
  const category: Category = route.params?.category || quizData[0];
  const [questions] = useState<Question[]>(() => getRandomQuestions(category.id, 5));
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [hearts, setHearts] = useState(3);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const { user, setUser } = useContext(QuizContext);

  const question = questions[currentQuestion];

  const handleAnswer = () => {
    if (selectedAnswer === null) return;

    setIsAnswerSubmitted(true);
    setShowExplanation(true);
    const isCorrect = selectedAnswer === question.correct;

    if (isCorrect) {
      setScore(score + 1);
      if (!isWeb) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      setHearts(hearts - 1);
      if (!isWeb) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

      if (hearts <= 1) {
        setTimeout(() => setShowResult(true), 1000);
        return;
      }
    }

    setTimeout(
      () => {
        if (currentQuestion < questions.length - 1) {
          setCurrentQuestion(currentQuestion + 1);
          setSelectedAnswer(null);
          setIsAnswerSubmitted(false);
          setShowExplanation(false);
        } else {
          setShowResult(true);
        }
      },
      showExplanation && question.explanation ? 3000 : 1500,
    );
  };

  const handleRestart = () => {
    const newQuestions = getRandomQuestions(category.id, 5);
    navigation.replace('Quiz', { category, questions: newQuestions });
  };

  if (showResult) {
    const accuracy = Math.round((score / questions.length) * 100);
    const xpEarned = score * 20;

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.resultContainer}>
          <View style={styles.resultCard}>
            <Text style={styles.resultEmoji}>
              {accuracy >= 80 ? '🏆' : accuracy >= 60 ? '🎉' : '💪'}
            </Text>
            <Text style={styles.resultTitle}>
              {accuracy >= 80 ? 'Excellent!' : accuracy >= 60 ? 'Good Job!' : 'Keep Practicing!'}
            </Text>
            <Text style={styles.resultScore}>
              {score}/{questions.length} Correct
            </Text>
            <Text style={styles.resultAccuracy}>{accuracy}% Accuracy</Text>
            <View style={styles.resultXP}>
              <Text style={styles.resultXPText}>+{xpEarned} XP</Text>
            </View>

            <View style={styles.resultActions}>
              <TouchableOpacity style={styles.primaryButton} onPress={handleRestart}>
                <Text style={styles.primaryButtonText}>Try Again</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => navigation.navigate('Home')}
              >
                <Text style={styles.secondaryButtonText}>Home</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.quizHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.quizCategory}>{category.name}</Text>
        <View style={styles.heartsContainer}>
          {Array.from({ length: 3 }).map((_, i) => (
            <Text key={i} style={styles.heart}>
              {i < hearts ? '❤️' : '🤍'}
            </Text>
          ))}
        </View>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBarBg}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${((currentQuestion + (isAnswerSubmitted ? 1 : 0)) / questions.length) * 100}%`,
                backgroundColor: category.color,
              },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          Question {currentQuestion + 1} of {questions.length}
        </Text>
      </View>

      <ScrollView style={styles.quizContent}>
        <View style={styles.questionCard}>
          {question.difficulty && (
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
                {question.difficulty.toUpperCase()}
              </Text>
            </View>
          )}
          <Text style={styles.questionText}>{question.question}</Text>
        </View>

        <View style={styles.answersContainer}>
          {question.options.map((option, index) => {
            const isCorrect = index === question.correct;
            const isSelected = index === selectedAnswer;
            const showFeedback = isAnswerSubmitted;

            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.answerButton,
                  isSelected && !showFeedback && styles.answerButtonSelected,
                  showFeedback && isCorrect && styles.answerButtonCorrect,
                  showFeedback && isSelected && !isCorrect && styles.answerButtonWrong,
                ]}
                onPress={() => !isAnswerSubmitted && setSelectedAnswer(index)}
                disabled={isAnswerSubmitted}
              >
                <View style={styles.answerContent}>
                  <Text
                    style={[
                      styles.answerLetter,
                      isSelected && !showFeedback && styles.answerTextSelected,
                      showFeedback && isCorrect && styles.answerTextCorrect,
                      showFeedback && isSelected && !isCorrect && styles.answerTextWrong,
                    ]}
                  >
                    {String.fromCharCode(65 + index)}
                  </Text>
                  <Text
                    style={[
                      styles.answerText,
                      isSelected && !showFeedback && styles.answerTextSelected,
                      showFeedback && isCorrect && styles.answerTextCorrect,
                      showFeedback && isSelected && !isCorrect && styles.answerTextWrong,
                    ]}
                  >
                    {option}
                  </Text>
                </View>
                {showFeedback && isCorrect && <Text style={styles.feedbackIcon}>✓</Text>}
                {showFeedback && isSelected && !isCorrect && (
                  <Text style={styles.feedbackIcon}>✗</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {showExplanation && question.explanation && (
          <View style={styles.explanationCard}>
            <Text style={styles.explanationTitle}>💡 Explanation</Text>
            <Text style={styles.explanationText}>{question.explanation}</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.quizFooter}>
        <TouchableOpacity
          style={[
            styles.submitButton,
            !selectedAnswer && selectedAnswer !== 0 && styles.submitButtonDisabled,
          ]}
          onPress={handleAnswer}
          disabled={isAnswerSubmitted || (!selectedAnswer && selectedAnswer !== 0)}
        >
          <Text style={styles.submitButtonText}>{isAnswerSubmitted ? 'Next' : 'Submit'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// Daily Challenge Screen
function DailyChallengeScreen({ navigation }: any) {
  const [questions] = useState<Question[]>(() => getDailyChallenge());

  return (
    <QuizScreen
      navigation={navigation}
      route={{
        params: {
          category: {
            id: 'daily',
            name: 'Daily Challenge',
            icon: '🎯',
            color: '#8b5cf6',
            description: "Complete today's challenge!",
            questions: questions,
          },
        },
      }}
    />
  );
}

// Profile Screen
function ProfileScreen({ navigation }: any) {
  const { user } = useContext(QuizContext);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.profileHeader}>
          <View style={styles.profileAvatar}>
            <Text style={styles.profileAvatarText}>{user.name[0]}</Text>
          </View>
          <Text style={styles.profileName}>{user.name}</Text>
          <Text style={styles.profileEmail}>{user.email}</Text>
          <View style={styles.profileLevel}>
            <Text style={styles.profileLevelText}>Level {user.level}</Text>
            <View style={styles.profileXPBar}>
              <View style={[styles.profileXPFill, { width: '65%' }]} />
            </View>
            <Text style={styles.profileXP}>{user.totalXP} XP</Text>
          </View>
        </View>

        <View style={styles.profileStats}>
          <Text style={styles.sectionTitle}>Statistics</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statItemValue}>{user.stats.quizzesCompleted}</Text>
              <Text style={styles.statItemLabel}>Quizzes</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statItemValue}>
                {Math.round((user.stats.correctAnswers / user.stats.totalAnswers) * 100)}%
              </Text>
              <Text style={styles.statItemLabel}>Accuracy</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statItemValue}>{user.stats.bestStreak}</Text>
              <Text style={styles.statItemLabel}>Best Streak</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statItemValue}>{user.achievements.length}</Text>
              <Text style={styles.statItemLabel}>Achievements</Text>
            </View>
          </View>
        </View>

        <View style={styles.profileSection}>
          <Text style={styles.sectionTitle}>Category Performance</Text>
          {Object.entries(user.stats.categories).map(([category, count]) => (
            <View key={category} style={styles.categoryPerformance}>
              <Text style={styles.categoryPerformanceName}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Text>
              <View style={styles.categoryPerformanceBar}>
                <View
                  style={[styles.categoryPerformanceFill, { width: `${(count / 20) * 100}%` }]}
                />
              </View>
              <Text style={styles.categoryPerformanceCount}>{count}</Text>
            </View>
          ))}
        </View>

        {!user.isPremium && (
          <TouchableOpacity
            style={styles.premiumUpgradeButton}
            onPress={() => navigation.navigate('Premium')}
          >
            <Text style={styles.premiumUpgradeText}>Upgrade to Premium</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// Premium Screen
function PremiumScreen({ navigation }: any) {
  const { user, setUser } = useContext(QuizContext);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.premiumHeader}>
          <Text style={styles.premiumIcon}>👑</Text>
          <Text style={styles.premiumScreenTitle}>QuizMentor Premium</Text>
          <Text style={styles.premiumScreenSubtitle}>Unlock your full learning potential</Text>
        </View>

        <View style={styles.premiumFeatures}>
          {[
            { icon: '❤️', title: 'Unlimited Hearts', description: 'Never run out of lives' },
            { icon: '🚫', title: 'No Ads', description: 'Focus on learning without interruptions' },
            { icon: '📊', title: 'Advanced Analytics', description: 'Detailed progress tracking' },
            { icon: '🎯', title: 'Custom Quizzes', description: 'Create your own quiz sets' },
            { icon: '🌟', title: 'Exclusive Content', description: 'Access premium questions' },
            { icon: '🏆', title: 'Special Badges', description: 'Show off your premium status' },
          ].map((feature, index) => (
            <View key={index} style={styles.premiumFeature}>
              <Text style={styles.premiumFeatureIcon}>{feature.icon}</Text>
              <View style={styles.premiumFeatureContent}>
                <Text style={styles.premiumFeatureTitle}>{feature.title}</Text>
                <Text style={styles.premiumFeatureDescription}>{feature.description}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.premiumPricing}>
          <TouchableOpacity style={styles.pricingOption}>
            <Text style={styles.pricingPeriod}>Monthly</Text>
            <Text style={styles.pricingAmount}>$4.99</Text>
            <Text style={styles.pricingPer}>per month</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.pricingOption, styles.pricingOptionPopular]}>
            <View style={styles.popularBadge}>
              <Text style={styles.popularBadgeText}>BEST VALUE</Text>
            </View>
            <Text style={styles.pricingPeriod}>Yearly</Text>
            <Text style={styles.pricingAmount}>$39.99</Text>
            <Text style={styles.pricingPer}>per year</Text>
            <Text style={styles.pricingSave}>Save 33%</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.purchaseButton}>
          <Text style={styles.purchaseButtonText}>Start Free Trial</Text>
        </TouchableOpacity>

        <Text style={styles.trialInfo}>7-day free trial, then $39.99/year</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

// Navigation Setup
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.gray400,
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 24 }}>🏠</Text>,
        }}
      />
      <Tab.Screen
        name="Categories"
        component={CategoriesScreen}
        options={{
          tabBarLabel: 'Categories',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 24 }}>📚</Text>,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 24 }}>👤</Text>,
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
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen name="Quiz" component={QuizScreen} />
            <Stack.Screen name="DailyChallenge" component={DailyChallengeScreen} />
            <Stack.Screen name="Premium" component={PremiumScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </QuizProvider>
    </SafeAreaProvider>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  greeting: {
    fontSize: 16,
    color: colors.gray600,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.gray900,
  },
  profileButton: {
    padding: 4,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.gray900,
  },
  statLabel: {
    fontSize: 12,
    color: colors.gray600,
    marginTop: 4,
  },
  dailyChallengeCard: {
    backgroundColor: colors.primary,
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  dailyChallengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dailyChallengeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.white,
  },
  dailyChallengeQuestions: {
    color: colors.white,
    opacity: 0.9,
  },
  dailyChallengeDescription: {
    color: colors.white,
    opacity: 0.9,
    marginBottom: 12,
  },
  dailyChallengeProgress: {
    height: 8,
    backgroundColor: colors.primaryDark,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.white,
    borderRadius: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.gray900,
    marginHorizontal: 20,
    marginBottom: 12,
  },
  categoriesScroll: {
    paddingLeft: 20,
    marginBottom: 20,
  },
  categoryCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    width: 120,
    alignItems: 'center',
    borderWidth: 2,
  },
  categoryIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray900,
    textAlign: 'center',
  },
  categoryCount: {
    fontSize: 12,
    color: colors.gray600,
    marginTop: 4,
  },
  premiumBanner: {
    backgroundColor: colors.secondary,
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  premiumTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 4,
  },
  premiumSubtitle: {
    fontSize: 14,
    color: colors.white,
    opacity: 0.9,
  },

  // Categories Screen Styles
  screenTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.gray900,
    margin: 20,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
  },
  categoryGridCard: {
    width: (screenWidth - 48) / 2,
    margin: 8,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
  },
  categoryGridIcon: {
    fontSize: 40,
    marginBottom: 12,
    textAlign: 'center',
  },
  categoryGridName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.gray900,
    marginBottom: 4,
  },
  categoryGridDescription: {
    fontSize: 12,
    color: colors.gray600,
    marginBottom: 12,
  },
  categoryGridFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryGridQuestions: {
    fontSize: 12,
    color: colors.gray500,
  },
  difficultyIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  // Quiz Screen Styles
  quizHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  backButton: {
    fontSize: 24,
    color: colors.gray700,
  },
  quizCategory: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.gray900,
  },
  heartsContainer: {
    flexDirection: 'row',
  },
  heart: {
    fontSize: 20,
    marginLeft: 4,
  },
  progressContainer: {
    padding: 20,
    backgroundColor: colors.white,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: colors.gray200,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: colors.gray600,
    marginTop: 8,
    textAlign: 'center',
  },
  quizContent: {
    flex: 1,
    padding: 20,
  },
  questionCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  difficultyBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '600',
  },
  questionText: {
    fontSize: 18,
    color: colors.gray900,
    lineHeight: 26,
  },
  answersContainer: {
    marginBottom: 20,
  },
  answerButton: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: colors.gray200,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  answerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  answerLetter: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.gray600,
    marginRight: 12,
    width: 24,
  },
  answerText: {
    fontSize: 16,
    color: colors.gray900,
    flex: 1,
  },
  answerTextSelected: {
    color: colors.primary,
  },
  answerTextCorrect: {
    color: colors.success,
  },
  answerTextWrong: {
    color: colors.danger,
  },
  feedbackIcon: {
    fontSize: 24,
    marginLeft: 12,
  },
  explanationCard: {
    backgroundColor: colors.primaryLight + '20',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
  },
  explanationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 8,
  },
  explanationText: {
    fontSize: 14,
    color: colors.gray700,
    lineHeight: 20,
  },
  quizFooter: {
    padding: 20,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: colors.gray300,
  },
  submitButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Result Screen Styles
  resultContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  resultCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  resultEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.gray900,
    marginBottom: 8,
  },
  resultScore: {
    fontSize: 20,
    color: colors.gray700,
    marginBottom: 4,
  },
  resultAccuracy: {
    fontSize: 16,
    color: colors.gray600,
    marginBottom: 20,
  },
  resultXP: {
    backgroundColor: colors.success + '20',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 32,
  },
  resultXPText: {
    color: colors.success,
    fontWeight: 'bold',
    fontSize: 18,
  },
  resultActions: {
    width: '100%',
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: colors.gray200,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: colors.gray700,
    fontSize: 16,
    fontWeight: '600',
  },

  // Profile Screen Styles
  profileHeader: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.white,
    marginBottom: 20,
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileAvatarText: {
    color: colors.white,
    fontSize: 32,
    fontWeight: 'bold',
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.gray900,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: colors.gray600,
    marginBottom: 20,
  },
  profileLevel: {
    alignItems: 'center',
    width: '100%',
  },
  profileLevelText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray700,
    marginBottom: 8,
  },
  profileXPBar: {
    width: '80%',
    height: 8,
    backgroundColor: colors.gray200,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  profileXPFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  profileXP: {
    fontSize: 12,
    color: colors.gray600,
  },
  profileStats: {
    backgroundColor: colors.white,
    padding: 20,
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
  },
  statItem: {
    width: '50%',
    padding: 12,
    alignItems: 'center',
  },
  statItemValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.gray900,
    marginBottom: 4,
  },
  statItemLabel: {
    fontSize: 12,
    color: colors.gray600,
  },
  profileSection: {
    backgroundColor: colors.white,
    padding: 20,
    marginBottom: 20,
  },
  categoryPerformance: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryPerformanceName: {
    flex: 1,
    fontSize: 14,
    color: colors.gray700,
  },
  categoryPerformanceBar: {
    flex: 2,
    height: 8,
    backgroundColor: colors.gray200,
    borderRadius: 4,
    overflow: 'hidden',
    marginHorizontal: 12,
  },
  categoryPerformanceFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  categoryPerformanceCount: {
    fontSize: 14,
    color: colors.gray600,
    width: 30,
    textAlign: 'right',
  },
  premiumUpgradeButton: {
    backgroundColor: colors.secondary,
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  premiumUpgradeText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Premium Screen Styles
  premiumHeader: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: colors.white,
    marginBottom: 20,
  },
  premiumIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  premiumScreenTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.gray900,
    marginBottom: 8,
  },
  premiumScreenSubtitle: {
    fontSize: 16,
    color: colors.gray600,
    textAlign: 'center',
  },
  premiumFeatures: {
    backgroundColor: colors.white,
    padding: 20,
    marginBottom: 20,
  },
  premiumFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  premiumFeatureIcon: {
    fontSize: 32,
    marginRight: 16,
    width: 40,
    textAlign: 'center',
  },
  premiumFeatureContent: {
    flex: 1,
  },
  premiumFeatureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray900,
    marginBottom: 4,
  },
  premiumFeatureDescription: {
    fontSize: 14,
    color: colors.gray600,
  },
  premiumPricing: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  pricingOption: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 6,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.gray200,
  },
  pricingOptionPopular: {
    borderColor: colors.primary,
    position: 'relative',
  },
  popularBadge: {
    position: 'absolute',
    top: -12,
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularBadgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  pricingPeriod: {
    fontSize: 14,
    color: colors.gray600,
    marginBottom: 8,
  },
  pricingAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.gray900,
    marginBottom: 4,
  },
  pricingPer: {
    fontSize: 12,
    color: colors.gray600,
  },
  pricingSave: {
    fontSize: 12,
    color: colors.success,
    fontWeight: '600',
    marginTop: 8,
  },
  purchaseButton: {
    backgroundColor: colors.primary,
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  purchaseButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  trialInfo: {
    fontSize: 12,
    color: colors.gray600,
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 20,
  },

  // Tab Bar Styles
  tabBar: {
    backgroundColor: colors.white,
    borderTopColor: colors.gray200,
    height: isTablet ? 70 : 60,
    paddingBottom: isTablet ? 10 : 5,
  },
});
