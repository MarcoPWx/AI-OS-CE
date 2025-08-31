import React, { useState, useContext, createContext } from 'react';
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
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

// Get screen dimensions for responsive design
const { width: screenWidth } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';
const isTablet = screenWidth >= 768;

// Color palette inspired by Tailwind
const colors = {
  primary: '#3b82f6',
  primaryLight: '#60a5fa',
  primaryDark: '#1d4ed8',
  success: '#22c55e',
  warning: '#eab308',
  danger: '#ef4444',
  gray50: '#f9fafb',
  gray100: '#f3f4f6',
  gray200: '#e5e7eb',
  gray300: '#d1d5db',
  gray500: '#6b7280',
  gray600: '#4b5563',
  gray700: '#374151',
  gray800: '#1f2937',
  white: '#ffffff',
  purple: '#8b5cf6',
  yellow: '#facc15',
  green: '#10b981',
  blue: '#3b82f6',
  red: '#ef4444',
};

// Quiz Context
const QuizContext = createContext<any>({});

function QuizProvider({ children }: { children: React.ReactNode }) {
  const [score, setScore] = useState(0);
  const [hearts, setHearts] = useState(3);
  const [streak, setStreak] = useState(7);

  return (
    <QuizContext.Provider value={{ score, setScore, hearts, setHearts, streak, setStreak }}>
      {children}
    </QuizContext.Provider>
  );
}

// Home Screen with modern design
function HomeScreen({ navigation }: any) {
  const { hearts, streak } = useContext(QuizContext);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hero Section */}
      <View style={[styles.heroSection, isWeb && styles.heroSectionWeb]}>
        <Text style={styles.heroTitle}>🎯 QuizMentor</Text>
        <Text style={styles.heroSubtitle}>Challenge yourself, learn more</Text>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Streak</Text>
            <Text style={styles.statValue}>🔥 {streak}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Hearts</Text>
            <Text style={styles.statValue}>
              {'❤️'.repeat(hearts)}
              {'🖤'.repeat(5 - hearts)}
            </Text>
          </View>
        </View>
      </View>

      {/* Daily Challenge Card */}
      <View style={styles.challengeCard}>
        <View style={styles.challengeContent}>
          <Text style={styles.challengeEmoji}>🎯</Text>
          <View style={styles.challengeTextContainer}>
            <Text style={styles.challengeTitle}>Daily Challenge</Text>
            <Text style={styles.challengeDescription}>Complete 5 quizzes for 2x XP!</Text>
          </View>
        </View>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: '60%' }]} />
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Quick Start</Text>

        <TouchableOpacity
          onPress={() => navigation.navigate('Categories')}
          style={styles.primaryButton}
          activeOpacity={0.8}
        >
          <View style={styles.buttonContent}>
            <View>
              <Text style={styles.primaryButtonText}>Start Quiz</Text>
              <Text style={styles.primaryButtonSubtext}>Test your knowledge</Text>
            </View>
            <Text style={styles.buttonIcon}>▶️</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.actionRow}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Leaderboard')}
            style={[styles.actionCard, { marginRight: 8 }]}
            activeOpacity={0.8}
          >
            <Text style={styles.actionEmoji}>🏆</Text>
            <Text style={styles.actionText}>Leaderboard</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('Paywall')}
            style={[styles.actionCard, styles.premiumCard, { marginLeft: 8 }]}
            activeOpacity={0.8}
          >
            <Text style={styles.actionEmoji}>⭐</Text>
            <Text style={[styles.actionText, { color: colors.white }]}>Go Premium</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Activity */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.activityCard}>
          <View style={styles.activityIcon}>
            <Text>🌍</Text>
          </View>
          <View style={styles.activityContent}>
            <Text style={styles.activityTitle}>Geography Quiz</Text>
            <Text style={styles.activityDescription}>Score: 8/10 • 2 hours ago</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

// Categories Screen
function CategoriesScreen({ navigation }: any) {
  const categories = [
    { id: '1', name: 'Geography', emoji: '🌍', color: colors.blue },
    { id: '2', name: 'Science', emoji: '🔬', color: colors.green },
    { id: '3', name: 'History', emoji: '📚', color: '#f59e0b' },
    { id: '4', name: 'Art', emoji: '🎨', color: '#ec4899' },
    { id: '5', name: 'Sports', emoji: '🏀', color: '#f97316' },
    { id: '6', name: 'Movies', emoji: '🎬', color: colors.purple },
  ];

  return (
    <View style={styles.container}>
      <FlatList
        data={categories}
        numColumns={isTablet ? 3 : 2}
        contentContainerStyle={styles.categoriesContainer}
        columnWrapperStyle={styles.categoryRow}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.categoryCard,
              { backgroundColor: item.color },
              isTablet && styles.categoryCardTablet,
            ]}
            onPress={() =>
              navigation.navigate('Quiz', {
                categorySlug: item.name.toLowerCase(),
                categoryName: `${item.emoji} ${item.name}`,
              })
            }
            activeOpacity={0.8}
          >
            <Text style={styles.categoryEmoji}>{item.emoji}</Text>
            <Text style={styles.categoryName}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

// Quiz Screen
function QuizScreen({ navigation, route }: any) {
  const { categoryName } = route.params;
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userScore, setUserScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const { hearts, setHearts } = useContext(QuizContext);

  const questions = [
    {
      question: 'What is the capital of France?',
      options: ['London', 'Berlin', 'Paris', 'Madrid'],
      correct: 2,
    },
    {
      question: 'What is 2 + 2?',
      options: ['3', '4', '5', '6'],
      correct: 1,
    },
    {
      question: 'What color is the sky?',
      options: ['Red', 'Green', 'Blue', 'Yellow'],
      correct: 2,
    },
  ];

  const handleAnswer = (selectedIndex: number) => {
    setSelectedAnswer(selectedIndex);
    const isCorrect = selectedIndex === questions[currentQuestion].correct;

    if (isCorrect) {
      setUserScore(userScore + 1);
    } else {
      setHearts(Math.max(0, hearts - 1));
    }

    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
      } else {
        navigation.navigate('Results', {
          score: userScore + (isCorrect ? 1 : 0),
          total: questions.length,
          categoryName,
        });
      }
    }, 1000);
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <View style={styles.quizContainer}>
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>

      {/* Hearts and Progress */}
      <View style={styles.quizHeader}>
        <Text style={styles.hearts}>{'❤️'.repeat(hearts)}</Text>
        <Text style={styles.questionCounter}>
          {currentQuestion + 1} / {questions.length}
        </Text>
      </View>

      {/* Question */}
      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>{questions[currentQuestion].question}</Text>

        {/* Options */}
        <View style={styles.optionsContainer}>
          {questions[currentQuestion].options.map((option, index) => {
            const isSelected = selectedAnswer === index;
            const isCorrect = index === questions[currentQuestion].correct;
            const showResult = selectedAnswer !== null;

            let bgColor = colors.white;
            let borderColor = 'transparent';
            let textColor = colors.gray700;

            if (showResult && isSelected) {
              bgColor = isCorrect ? '#dcfce7' : '#fee2e2';
              borderColor = isCorrect ? colors.green : colors.red;
              textColor = isCorrect ? '#166534' : '#991b1b';
            } else if (showResult && isCorrect) {
              bgColor = '#dcfce7';
              borderColor = colors.green;
              textColor = '#166534';
            } else if (isSelected) {
              borderColor = colors.primary;
            }

            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionButton,
                  {
                    backgroundColor: bgColor,
                    borderColor: borderColor,
                    borderWidth: 2,
                  },
                ]}
                onPress={() => selectedAnswer === null && handleAnswer(index)}
                disabled={selectedAnswer !== null}
                activeOpacity={0.8}
              >
                <Text style={[styles.optionText, { color: textColor }]}>
                  {option}
                  {showResult && isCorrect && ' ✓'}
                  {showResult && isSelected && !isCorrect && ' ✗'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
}

// Results Screen
function ResultsScreen({ navigation, route }: any) {
  const { score, total, categoryName } = route.params;
  const percentage = Math.round((score / total) * 100);

  let emoji = '😢';
  let message = 'Keep practicing!';
  let bgColor = colors.danger;

  if (percentage >= 80) {
    emoji = '🎉';
    message = 'Excellent work!';
    bgColor = colors.success;
  } else if (percentage >= 60) {
    emoji = '😊';
    message = 'Good job!';
    bgColor = colors.warning;
  }

  return (
    <View style={[styles.resultsContainer, { backgroundColor: bgColor }]}>
      <Text style={styles.resultEmoji}>{emoji}</Text>
      <Text style={styles.resultMessage}>{message}</Text>
      <Text style={styles.resultCategory}>{categoryName}</Text>

      <View style={styles.scoreCard}>
        <Text style={styles.scoreText}>
          {score}/{total}
        </Text>
        <Text style={styles.percentageText}>{percentage}%</Text>
      </View>

      <View style={styles.resultActions}>
        <TouchableOpacity
          style={styles.resultButton}
          onPress={() => navigation.navigate('Home')}
          activeOpacity={0.8}
        >
          <Text style={styles.resultButtonText}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.resultButton, styles.resultButtonPrimary]}
          onPress={() => navigation.navigate('Categories')}
          activeOpacity={0.8}
        >
          <Text style={[styles.resultButtonText, { color: colors.gray800 }]}>Play Again</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Leaderboard Screen
function LeaderboardScreen() {
  const leaderboard = [
    { rank: 1, name: 'John', score: 2450, avatar: '👤' },
    { rank: 2, name: 'Sarah', score: 2380, avatar: '👩' },
    { rank: 3, name: 'Mike', score: 2320, avatar: '👨' },
    { rank: 4, name: 'Emma', score: 2150, avatar: '👱‍♀️' },
    { rank: 5, name: 'You', score: 1980, avatar: '🎯' },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Top 3 Podium */}
      <View style={styles.podium}>
        {/* 2nd Place */}
        <View style={styles.podiumPlace}>
          <Text style={styles.podiumEmoji}>👩</Text>
          <View style={[styles.podiumBlock, styles.podiumSecond]}>
            <Text style={styles.podiumRank}>2</Text>
          </View>
        </View>

        {/* 1st Place */}
        <View style={styles.podiumPlace}>
          <Text style={[styles.podiumEmoji, { fontSize: 32 }]}>👤</Text>
          <View style={[styles.podiumBlock, styles.podiumFirst]}>
            <Text style={styles.podiumRank}>1</Text>
          </View>
        </View>

        {/* 3rd Place */}
        <View style={styles.podiumPlace}>
          <Text style={styles.podiumEmoji}>👨</Text>
          <View style={[styles.podiumBlock, styles.podiumThird]}>
            <Text style={styles.podiumRank}>3</Text>
          </View>
        </View>
      </View>

      {/* Full Leaderboard */}
      <View style={styles.leaderboardList}>
        {leaderboard.map((player) => (
          <View
            key={player.rank}
            style={[
              styles.leaderboardItem,
              player.name === 'You' && styles.leaderboardItemHighlight,
            ]}
          >
            <Text style={styles.leaderboardRank}>{player.rank}</Text>
            <Text style={styles.leaderboardAvatar}>{player.avatar}</Text>
            <Text style={styles.leaderboardName}>{player.name}</Text>
            <Text style={styles.leaderboardScore}>{player.score}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

// Paywall Screen
function PaywallScreen({ navigation }: any) {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annual' | 'lifetime'>('annual');

  const plans = [
    { id: 'monthly', name: 'Monthly', price: '$12.99', period: '/month', save: null },
    { id: 'annual', name: 'Annual', price: '$89.99', period: '/year', save: 'Save 40%' },
    { id: 'lifetime', name: 'Lifetime', price: '$199', period: 'one time', save: 'Best Value' },
  ];

  const benefits = [
    { icon: '♾️', text: 'Unlimited hearts' },
    { icon: '🔥', text: 'Streak protection' },
    { icon: '🎯', text: 'All categories unlocked' },
    { icon: '🚫', text: 'No ads, ever' },
    { icon: '📊', text: 'Advanced statistics' },
    { icon: '💎', text: 'Exclusive badges' },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Hero */}
      <View style={styles.paywallHero}>
        <Text style={styles.paywallEmoji}>⭐</Text>
        <Text style={styles.paywallTitle}>Unlock Premium</Text>
        <Text style={styles.paywallSubtitle}>Get unlimited access to all features</Text>
      </View>

      {/* Benefits */}
      <View style={styles.benefitsContainer}>
        <View style={styles.benefitsCard}>
          {benefits.map((benefit, index) => (
            <View key={index} style={styles.benefitRow}>
              <Text style={styles.benefitIcon}>{benefit.icon}</Text>
              <Text style={styles.benefitText}>{benefit.text}</Text>
              <Text style={styles.benefitCheck}>✓</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Plans */}
      <View style={styles.plansContainer}>
        {plans.map((plan) => (
          <TouchableOpacity
            key={plan.id}
            style={[styles.planCard, selectedPlan === plan.id && styles.planCardSelected]}
            onPress={() => setSelectedPlan(plan.id as any)}
            activeOpacity={0.8}
          >
            <View style={styles.planContent}>
              <View>
                <View style={styles.planHeader}>
                  <Text style={styles.planName}>{plan.name}</Text>
                  {plan.save && (
                    <View style={styles.planBadge}>
                      <Text style={styles.planBadgeText}>{plan.save}</Text>
                    </View>
                  )}
                </View>
                <View style={styles.planPricing}>
                  <Text style={styles.planPrice}>{plan.price}</Text>
                  <Text style={styles.planPeriod}>{plan.period}</Text>
                </View>
              </View>
              <View
                style={[styles.planRadio, selectedPlan === plan.id && styles.planRadioSelected]}
              >
                {selectedPlan === plan.id && <View style={styles.planRadioDot} />}
              </View>
            </View>
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={styles.subscribeButton}
          onPress={() => {
            Alert.alert('Success!', 'Premium activated! (Demo)', [
              { text: 'Awesome!', onPress: () => navigation.goBack() },
            ]);
          }}
          activeOpacity={0.8}
        >
          <Text style={styles.subscribeButtonText}>Start Free Trial</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.skipButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Text style={styles.skipButtonText}>Maybe later</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const Stack = createStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <QuizProvider>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="Home"
            screenOptions={{
              headerStyle: {
                backgroundColor: colors.primary,
                elevation: 0,
                shadowOpacity: 0,
              },
              headerTintColor: colors.white,
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            }}
          >
            <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
            <Stack.Screen
              name="Categories"
              component={CategoriesScreen}
              options={{ title: 'Choose Category' }}
            />
            <Stack.Screen
              name="Quiz"
              component={QuizScreen}
              options={({ route }) => ({
                title: (route.params as any)?.categoryName || 'Quiz',
                headerBackTitle: 'Back',
              })}
            />
            <Stack.Screen
              name="Results"
              component={ResultsScreen}
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="Leaderboard"
              component={LeaderboardScreen}
              options={{ title: 'Leaderboard' }}
            />
            <Stack.Screen
              name="Paywall"
              component={PaywallScreen}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray50,
  },
  heroSection: {
    backgroundColor: colors.primary,
    paddingTop: 48,
    paddingBottom: 32,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  heroSectionWeb: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 18,
    color: '#bfdbfe',
  },
  statsContainer: {
    flexDirection: 'row',
    marginTop: 24,
    marginHorizontal: -8,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 8,
  },
  statLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.white,
  },
  challengeCard: {
    marginHorizontal: 24,
    marginTop: -16,
    backgroundColor: colors.yellow,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  challengeContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  challengeEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  challengeTextContainer: {
    flex: 1,
  },
  challengeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.white,
  },
  challengeDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 4,
  },
  progressBarContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 10,
    height: 8,
    marginTop: 12,
    overflow: 'hidden',
  },
  progressBar: {
    backgroundColor: colors.white,
    height: '100%',
    borderRadius: 10,
  },
  sectionContainer: {
    paddingHorizontal: 24,
    marginTop: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.gray800,
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: colors.success,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 12,
  },
  buttonContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.white,
  },
  primaryButtonSubtext: {
    fontSize: 14,
    color: '#bbf7d0',
    marginTop: 4,
  },
  buttonIcon: {
    fontSize: 24,
    color: colors.white,
  },
  actionRow: {
    flexDirection: 'row',
    marginHorizontal: -8,
  },
  actionCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  premiumCard: {
    backgroundColor: colors.purple,
  },
  actionEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray700,
  },
  activityCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  activityIcon: {
    backgroundColor: '#dbeafe',
    borderRadius: 999,
    padding: 8,
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray800,
  },
  activityDescription: {
    fontSize: 14,
    color: colors.gray500,
    marginTop: 2,
  },

  // Categories
  categoriesContainer: {
    padding: 16,
  },
  categoryRow: {
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: '47%',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryCardTablet: {
    width: '31%',
  },
  categoryEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.white,
  },

  // Quiz
  quizContainer: {
    flex: 1,
    backgroundColor: colors.gray50,
  },
  progressContainer: {
    backgroundColor: colors.gray200,
    height: 8,
  },
  progressFill: {
    backgroundColor: colors.primary,
    height: '100%',
  },
  quizHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  hearts: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  questionCounter: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray600,
  },
  questionContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  questionText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.gray800,
    textAlign: 'center',
    marginBottom: 32,
  },
  optionsContainer: {
    marginTop: 16,
  },
  optionButton: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  optionText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },

  // Results
  resultsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  resultEmoji: {
    fontSize: 72,
    marginBottom: 16,
  },
  resultMessage: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 8,
  },
  resultCategory: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 32,
  },
  scoreCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 60,
    fontWeight: 'bold',
    color: colors.white,
  },
  percentageText: {
    fontSize: 24,
    color: colors.white,
    marginTop: 8,
  },
  resultActions: {
    flexDirection: 'row',
    marginTop: 32,
  },
  resultButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginHorizontal: 8,
  },
  resultButtonPrimary: {
    backgroundColor: colors.white,
  },
  resultButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.white,
  },

  // Leaderboard
  podium: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginTop: 32,
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  podiumPlace: {
    alignItems: 'center',
    marginHorizontal: 8,
  },
  podiumEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  podiumBlock: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  podiumFirst: {
    backgroundColor: colors.warning,
    paddingVertical: 24,
    paddingHorizontal: 32,
  },
  podiumSecond: {
    backgroundColor: colors.gray300,
  },
  podiumThird: {
    backgroundColor: '#d97706',
    paddingVertical: 12,
  },
  podiumRank: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.white,
  },
  leaderboardList: {
    paddingHorizontal: 24,
  },
  leaderboardItem: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  leaderboardItemHighlight: {
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: '#eff6ff',
  },
  leaderboardRank: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.gray600,
    width: 48,
  },
  leaderboardAvatar: {
    fontSize: 24,
    marginHorizontal: 12,
  },
  leaderboardName: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: colors.gray800,
  },
  leaderboardScore: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },

  // Paywall
  paywallHero: {
    backgroundColor: colors.purple,
    paddingHorizontal: 24,
    paddingVertical: 48,
    alignItems: 'center',
  },
  paywallEmoji: {
    fontSize: 60,
    marginBottom: 16,
  },
  paywallTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.white,
    textAlign: 'center',
    marginBottom: 8,
  },
  paywallSubtitle: {
    fontSize: 16,
    color: '#e9d5ff',
    textAlign: 'center',
  },
  benefitsContainer: {
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  benefitsCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  benefitIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  benefitText: {
    flex: 1,
    fontSize: 18,
    color: colors.gray700,
  },
  benefitCheck: {
    fontSize: 20,
    color: colors.success,
  },
  plansContainer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  planCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: colors.gray200,
  },
  planCardSelected: {
    backgroundColor: '#faf5ff',
    borderColor: colors.purple,
  },
  planContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  planName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.gray800,
  },
  planBadge: {
    marginLeft: 8,
    backgroundColor: colors.success,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  planBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.white,
  },
  planPricing: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 4,
  },
  planPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
  },
  planPeriod: {
    fontSize: 16,
    color: colors.gray600,
    marginLeft: 4,
  },
  planRadio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.gray400,
    alignItems: 'center',
    justifyContent: 'center',
  },
  planRadioSelected: {
    backgroundColor: colors.purple,
    borderColor: colors.purple,
  },
  planRadioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.white,
  },
  subscribeButton: {
    backgroundColor: colors.purple,
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  subscribeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.white,
    textAlign: 'center',
  },
  skipButton: {
    marginTop: 16,
    padding: 12,
  },
  skipButtonText: {
    fontSize: 16,
    color: colors.gray500,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
});
