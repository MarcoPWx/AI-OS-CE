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
  Animated,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

// Get screen dimensions for responsive design
const { width: screenWidth } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';
const isTablet = screenWidth >= 768;

// Professional color palette inspired by DevMentor
const colors = {
  // Primary blues
  blue50: '#eff6ff',
  blue100: '#dbeafe',
  blue200: '#bfdbfe',
  blue300: '#93c5fd',
  blue400: '#60a5fa',
  blue500: '#3b82f6',
  blue600: '#2563eb',
  blue700: '#1d4ed8',
  blue800: '#1e40af',
  blue900: '#1e3a8a',

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

  // Status colors
  green50: '#f0fdf4',
  green100: '#dcfce7',
  green500: '#22c55e',
  green600: '#16a34a',
  green800: '#166534',

  yellow50: '#fefce8',
  yellow100: '#fef9c3',
  yellow500: '#eab308',
  yellow800: '#854d0e',

  red50: '#fef2f2',
  red100: '#fee2e2',
  red500: '#ef4444',
  red600: '#dc2626',

  white: '#ffffff',
};

// Quiz Context
const QuizContext = createContext<any>({});

function QuizProvider({ children }: { children: React.ReactNode }) {
  const [score, setScore] = useState(0);
  const [hearts, setHearts] = useState(3);
  const [streak, setStreak] = useState(7);
  const [experience, setExperience] = useState(2450);

  return (
    <QuizContext.Provider
      value={{
        score,
        setScore,
        hearts,
        setHearts,
        streak,
        setStreak,
        experience,
        setExperience,
      }}
    >
      {children}
    </QuizContext.Provider>
  );
}

// Professional Card Component
const Card = ({ children, style, ...props }: any) => (
  <View style={[styles.card, style]} {...props}>
    {children}
  </View>
);

// Status Badge Component
const StatusBadge = ({ type, text }: { type: 'active' | 'pending' | 'inactive'; text: string }) => {
  const badgeStyles = {
    active: { backgroundColor: colors.green100, color: colors.green800 },
    pending: { backgroundColor: colors.yellow100, color: colors.yellow800 },
    inactive: { backgroundColor: colors.gray100, color: colors.gray800 },
  };

  return (
    <View style={[styles.statusBadge, { backgroundColor: badgeStyles[type].backgroundColor }]}>
      <Text style={[styles.statusBadgeText, { color: badgeStyles[type].color }]}>{text}</Text>
    </View>
  );
};

// Home Screen with professional design
function HomeScreen({ navigation }: any) {
  const { hearts, streak, experience } = useContext(QuizContext);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back</Text>
          <Text style={styles.userName}>John Doe</Text>
        </View>
        <TouchableOpacity style={styles.profileButton}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>JD</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <Card style={styles.statCard}>
          <Text style={styles.statLabel}>Current Streak</Text>
          <Text style={styles.statValue}>🔥 {streak} days</Text>
          <Text style={styles.statChange}>+2 from last week</Text>
        </Card>

        <Card style={styles.statCard}>
          <Text style={styles.statLabel}>Total XP</Text>
          <Text style={styles.statValue}>{experience.toLocaleString()}</Text>
          <Text style={styles.statChange}>Level 12</Text>
        </Card>

        <Card style={styles.statCard}>
          <Text style={styles.statLabel}>Hearts</Text>
          <View style={styles.heartsContainer}>
            {[...Array(5)].map((_, i) => (
              <Text key={i} style={styles.heartIcon}>
                {i < hearts ? '❤️' : '🤍'}
              </Text>
            ))}
          </View>
          <Text style={styles.statChange}>Full health</Text>
        </Card>

        <Card style={styles.statCard}>
          <Text style={styles.statLabel}>Accuracy</Text>
          <Text style={styles.statValue}>87%</Text>
          <Text style={[styles.statChange, { color: colors.green600 }]}>↑ 5% improvement</Text>
        </Card>
      </View>

      {/* Daily Challenge */}
      <Card style={styles.challengeCard}>
        <View style={styles.challengeHeader}>
          <View>
            <Text style={styles.challengeTitle}>Daily Challenge</Text>
            <Text style={styles.challengeDescription}>Complete 5 quizzes to earn bonus XP</Text>
          </View>
          <StatusBadge type="active" text="Active" />
        </View>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '60%' }]} />
          </View>
          <Text style={styles.progressText}>3 of 5 completed</Text>
        </View>
      </Card>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionGrid}>
          <TouchableOpacity
            style={[styles.actionButton, styles.primaryAction]}
            onPress={() => navigation.navigate('Categories')}
            activeOpacity={0.7}
          >
            <Text style={styles.actionIcon}>📚</Text>
            <Text style={styles.primaryActionText}>Start Learning</Text>
            <Text style={styles.actionDescription}>Choose a category</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Leaderboard')}
            activeOpacity={0.7}
          >
            <Text style={styles.actionIcon}>🏆</Text>
            <Text style={styles.actionText}>Leaderboard</Text>
            <Text style={styles.actionDescription}>Top performers</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Activity */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <TouchableOpacity>
            <Text style={styles.sectionLink}>View all →</Text>
          </TouchableOpacity>
        </View>

        <Card style={styles.activityItem}>
          <View style={styles.activityIcon}>
            <Text>🌍</Text>
          </View>
          <View style={styles.activityContent}>
            <Text style={styles.activityTitle}>Geography Master</Text>
            <Text style={styles.activityDescription}>Scored 9/10 in World Capitals quiz</Text>
            <Text style={styles.activityTime}>2 hours ago</Text>
          </View>
          <StatusBadge type="active" text="+50 XP" />
        </Card>

        <Card style={styles.activityItem}>
          <View style={styles.activityIcon}>
            <Text>🔬</Text>
          </View>
          <View style={styles.activityContent}>
            <Text style={styles.activityTitle}>Science Explorer</Text>
            <Text style={styles.activityDescription}>Completed Chemistry Basics module</Text>
            <Text style={styles.activityTime}>Yesterday</Text>
          </View>
          <StatusBadge type="active" text="+75 XP" />
        </Card>
      </View>

      {/* Premium CTA */}
      <Card style={styles.premiumCard}>
        <View style={styles.premiumContent}>
          <Text style={styles.premiumEmoji}>⭐</Text>
          <View style={styles.premiumTextContainer}>
            <Text style={styles.premiumTitle}>Upgrade to Premium</Text>
            <Text style={styles.premiumDescription}>
              Unlimited hearts, exclusive content, and no ads
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.premiumButton}
          onPress={() => navigation.navigate('Paywall')}
          activeOpacity={0.7}
        >
          <Text style={styles.premiumButtonText}>Learn More</Text>
        </TouchableOpacity>
      </Card>
    </ScrollView>
  );
}

// Categories Screen
function CategoriesScreen({ navigation }: any) {
  const categories = [
    { id: '1', name: 'Geography', emoji: '🌍', questions: 150, difficulty: 'Medium' },
    { id: '2', name: 'Science', emoji: '🔬', questions: 200, difficulty: 'Hard' },
    { id: '3', name: 'History', emoji: '📚', questions: 180, difficulty: 'Medium' },
    { id: '4', name: 'Art & Culture', emoji: '🎨', questions: 120, difficulty: 'Easy' },
    { id: '5', name: 'Sports', emoji: '🏀', questions: 100, difficulty: 'Easy' },
    { id: '6', name: 'Technology', emoji: '💻', questions: 220, difficulty: 'Hard' },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.pageHeader}>
        <Text style={styles.pageTitle}>Choose a Category</Text>
        <Text style={styles.pageSubtitle}>Test your knowledge across different subjects</Text>
      </View>

      <View style={styles.categoriesGrid}>
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={styles.categoryCard}
            onPress={() =>
              navigation.navigate('Quiz', {
                categorySlug: category.name.toLowerCase(),
                categoryName: category.name,
              })
            }
            activeOpacity={0.7}
          >
            <Card style={styles.categoryCardInner}>
              <Text style={styles.categoryEmoji}>{category.emoji}</Text>
              <Text style={styles.categoryName}>{category.name}</Text>
              <View style={styles.categoryMeta}>
                <Text style={styles.categoryQuestions}>{category.questions} questions</Text>
                <StatusBadge
                  type={
                    category.difficulty === 'Easy'
                      ? 'active'
                      : category.difficulty === 'Medium'
                        ? 'pending'
                        : 'inactive'
                  }
                  text={category.difficulty}
                />
              </View>
            </Card>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
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
      <View style={styles.quizProgress}>
        <View style={[styles.quizProgressFill, { width: `${progress}%` }]} />
      </View>

      {/* Quiz Header */}
      <View style={styles.quizHeader}>
        <View>
          <Text style={styles.quizCategory}>{categoryName}</Text>
          <Text style={styles.quizQuestionNumber}>
            Question {currentQuestion + 1} of {questions.length}
          </Text>
        </View>
        <View style={styles.quizHearts}>
          {[...Array(5)].map((_, i) => (
            <Text key={i} style={styles.quizHeart}>
              {i < hearts ? '❤️' : '🤍'}
            </Text>
          ))}
        </View>
      </View>

      {/* Question */}
      <Card style={styles.questionCard}>
        <Text style={styles.questionText}>{questions[currentQuestion].question}</Text>
      </Card>

      {/* Options */}
      <View style={styles.optionsContainer}>
        {questions[currentQuestion].options.map((option, index) => {
          const isSelected = selectedAnswer === index;
          const isCorrect = index === questions[currentQuestion].correct;
          const showResult = selectedAnswer !== null;

          const optionStyle = [styles.optionButton];
          const textStyle = [styles.optionText];

          if (showResult) {
            if (isCorrect) {
              optionStyle.push(styles.optionCorrect);
              textStyle.push(styles.optionTextCorrect);
            } else if (isSelected && !isCorrect) {
              optionStyle.push(styles.optionIncorrect);
              textStyle.push(styles.optionTextIncorrect);
            }
          } else if (isSelected) {
            optionStyle.push(styles.optionSelected);
            textStyle.push(styles.optionTextSelected);
          }

          return (
            <TouchableOpacity
              key={index}
              style={optionStyle}
              onPress={() => selectedAnswer === null && handleAnswer(index)}
              disabled={selectedAnswer !== null}
              activeOpacity={0.7}
            >
              <Text style={textStyle}>
                {option}
                {showResult && isCorrect && ' ✓'}
                {showResult && isSelected && !isCorrect && ' ✗'}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

// Results Screen
function ResultsScreen({ navigation, route }: any) {
  const { score, total, categoryName } = route.params;
  const percentage = Math.round((score / total) * 100);
  const { experience, setExperience } = useContext(QuizContext);

  const earnedXP = score * 10;

  React.useEffect(() => {
    setExperience(experience + earnedXP);
  }, []);

  let resultStatus = 'needs-practice';
  let resultMessage = 'Keep practicing!';
  let resultColor = colors.yellow500;

  if (percentage >= 80) {
    resultStatus = 'excellent';
    resultMessage = 'Excellent work!';
    resultColor = colors.green500;
  } else if (percentage >= 60) {
    resultStatus = 'good';
    resultMessage = 'Good job!';
    resultColor = colors.blue500;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.resultsContainer}>
        <Card style={styles.resultsCard}>
          <View style={[styles.resultIcon, { backgroundColor: resultColor + '20' }]}>
            <Text style={styles.resultEmoji}>
              {resultStatus === 'excellent' ? '🎉' : resultStatus === 'good' ? '👍' : '💪'}
            </Text>
          </View>

          <Text style={styles.resultMessage}>{resultMessage}</Text>
          <Text style={styles.resultCategory}>{categoryName} Quiz Complete</Text>

          <View style={styles.scoreDisplay}>
            <Text style={styles.scoreText}>
              {score}/{total}
            </Text>
            <Text style={styles.percentageText}>{percentage}%</Text>
          </View>

          <View style={styles.xpEarned}>
            <Text style={styles.xpLabel}>XP Earned</Text>
            <Text style={[styles.xpValue, { color: resultColor }]}>+{earnedXP} XP</Text>
          </View>
        </Card>

        <View style={styles.resultStats}>
          <Card style={styles.resultStatCard}>
            <Text style={styles.resultStatLabel}>Correct Answers</Text>
            <Text style={styles.resultStatValue}>{score}</Text>
          </Card>

          <Card style={styles.resultStatCard}>
            <Text style={styles.resultStatLabel}>Time Taken</Text>
            <Text style={styles.resultStatValue}>2:45</Text>
          </Card>

          <Card style={styles.resultStatCard}>
            <Text style={styles.resultStatLabel}>Accuracy Rate</Text>
            <Text style={styles.resultStatValue}>{percentage}%</Text>
          </Card>
        </View>

        <View style={styles.resultActions}>
          <TouchableOpacity
            style={[styles.button, styles.buttonSecondary]}
            onPress={() => navigation.navigate('Home')}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonSecondaryText}>Back to Home</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonPrimary]}
            onPress={() => navigation.navigate('Categories')}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonPrimaryText}>Try Another Quiz</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

// Leaderboard Screen
function LeaderboardScreen() {
  const leaderboard = [
    { rank: 1, name: 'Sarah Chen', score: 4850, avatar: 'SC', trend: 'up' },
    { rank: 2, name: 'Mike Johnson', score: 4720, avatar: 'MJ', trend: 'same' },
    { rank: 3, name: 'Emma Wilson', score: 4650, avatar: 'EW', trend: 'up' },
    { rank: 4, name: 'Alex Kumar', score: 4500, avatar: 'AK', trend: 'down' },
    { rank: 5, name: 'You', score: 2450, avatar: 'JD', trend: 'up' },
    { rank: 6, name: 'Lisa Park', score: 2400, avatar: 'LP', trend: 'same' },
    { rank: 7, name: 'Tom Brown', score: 2350, avatar: 'TB', trend: 'down' },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.pageHeader}>
        <Text style={styles.pageTitle}>Leaderboard</Text>
        <Text style={styles.pageSubtitle}>Weekly Rankings</Text>
      </View>

      {/* Top 3 */}
      <View style={styles.topThree}>
        {leaderboard.slice(0, 3).map((player) => (
          <Card
            key={player.rank}
            style={[styles.topPlayerCard, player.rank === 1 && styles.firstPlace]}
          >
            <View style={[styles.topPlayerAvatar, player.rank === 1 && styles.firstPlaceAvatar]}>
              <Text style={styles.topPlayerAvatarText}>{player.avatar}</Text>
            </View>
            <Text style={styles.topPlayerRank}>#{player.rank}</Text>
            <Text style={styles.topPlayerName}>{player.name}</Text>
            <Text style={styles.topPlayerScore}>{player.score.toLocaleString()}</Text>
            {player.rank === 1 && <Text style={styles.crown}>👑</Text>}
          </Card>
        ))}
      </View>

      {/* Full Leaderboard */}
      <View style={styles.leaderboardList}>
        {leaderboard.map((player) => (
          <Card
            key={player.rank}
            style={[
              styles.leaderboardItem,
              player.name === 'You' && styles.leaderboardItemHighlight,
            ]}
          >
            <View style={styles.leaderboardLeft}>
              <Text style={styles.leaderboardRank}>#{player.rank}</Text>
              <View style={styles.leaderboardAvatar}>
                <Text style={styles.leaderboardAvatarText}>{player.avatar}</Text>
              </View>
              <View>
                <Text style={styles.leaderboardName}>{player.name}</Text>
                <Text style={styles.leaderboardScore}>{player.score.toLocaleString()} XP</Text>
              </View>
            </View>
            <View style={styles.leaderboardTrend}>
              <Text
                style={[
                  styles.trendIcon,
                  player.trend === 'up' && { color: colors.green500 },
                  player.trend === 'down' && { color: colors.red500 },
                ]}
              >
                {player.trend === 'up' ? '↑' : player.trend === 'down' ? '↓' : '–'}
              </Text>
            </View>
          </Card>
        ))}
      </View>
    </ScrollView>
  );
}

// Paywall Screen
function PaywallScreen({ navigation }: any) {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annual'>('annual');

  const features = [
    { icon: '♾️', title: 'Unlimited Hearts', description: 'Never run out of lives' },
    { icon: '🚫', title: 'No Advertisements', description: 'Focus on learning' },
    { icon: '🎯', title: 'Exclusive Content', description: 'Premium quiz categories' },
    { icon: '📊', title: 'Advanced Analytics', description: 'Track your progress' },
    { icon: '🔥', title: 'Streak Protection', description: 'Keep your streak safe' },
    { icon: '💎', title: 'Double XP', description: 'Level up faster' },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.paywallHeader}>
        <View style={styles.paywallIcon}>
          <Text style={styles.paywallEmoji}>⭐</Text>
        </View>
        <Text style={styles.paywallTitle}>QuizMentor Premium</Text>
        <Text style={styles.paywallSubtitle}>Unlock your full learning potential</Text>
      </View>

      {/* Features */}
      <View style={styles.featuresGrid}>
        {features.map((feature, index) => (
          <Card key={index} style={styles.featureCard}>
            <Text style={styles.featureIcon}>{feature.icon}</Text>
            <Text style={styles.featureTitle}>{feature.title}</Text>
            <Text style={styles.featureDescription}>{feature.description}</Text>
          </Card>
        ))}
      </View>

      {/* Pricing Plans */}
      <View style={styles.pricingSection}>
        <Text style={styles.pricingSectionTitle}>Choose Your Plan</Text>

        <TouchableOpacity
          style={[styles.pricingCard, selectedPlan === 'annual' && styles.pricingCardSelected]}
          onPress={() => setSelectedPlan('annual')}
          activeOpacity={0.7}
        >
          <View style={styles.pricingHeader}>
            <View>
              <Text style={styles.pricingTitle}>Annual Plan</Text>
              <Text style={styles.pricingPrice}>$89.99/year</Text>
            </View>
            <StatusBadge type="active" text="Save 40%" />
          </View>
          <Text style={styles.pricingDescription}>Best value • Billed annually</Text>
          <View
            style={[styles.radioButton, selectedPlan === 'annual' && styles.radioButtonSelected]}
          >
            {selectedPlan === 'annual' && <View style={styles.radioDot} />}
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.pricingCard, selectedPlan === 'monthly' && styles.pricingCardSelected]}
          onPress={() => setSelectedPlan('monthly')}
          activeOpacity={0.7}
        >
          <View style={styles.pricingHeader}>
            <View>
              <Text style={styles.pricingTitle}>Monthly Plan</Text>
              <Text style={styles.pricingPrice}>$12.99/month</Text>
            </View>
          </View>
          <Text style={styles.pricingDescription}>Flexible • Billed monthly</Text>
          <View
            style={[styles.radioButton, selectedPlan === 'monthly' && styles.radioButtonSelected]}
          >
            {selectedPlan === 'monthly' && <View style={styles.radioDot} />}
          </View>
        </TouchableOpacity>
      </View>

      {/* CTA Buttons */}
      <View style={styles.paywallActions}>
        <TouchableOpacity
          style={[styles.button, styles.buttonPrimary, styles.buttonLarge]}
          onPress={() => {
            Alert.alert('Success!', 'Premium activated! (Demo)', [
              { text: 'Great!', onPress: () => navigation.goBack() },
            ]);
          }}
          activeOpacity={0.7}
        >
          <Text style={styles.buttonPrimaryText}>Start Free Trial</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Text style={styles.paywallSkip}>Maybe later</Text>
        </TouchableOpacity>

        <Text style={styles.paywallTerms}>Cancel anytime • Terms apply</Text>
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
                backgroundColor: colors.white,
                elevation: 0,
                shadowOpacity: 0,
                borderBottomWidth: 1,
                borderBottomColor: colors.gray200,
              },
              headerTintColor: colors.gray900,
              headerTitleStyle: {
                fontWeight: '600',
                fontSize: 18,
              },
            }}
          >
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{
                title: 'Dashboard',
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="Categories"
              component={CategoriesScreen}
              options={{ title: 'Categories' }}
            />
            <Stack.Screen
              name="Quiz"
              component={QuizScreen}
              options={{
                title: 'Quiz',
                headerBackTitle: 'Back',
              }}
            />
            <Stack.Screen
              name="Results"
              component={ResultsScreen}
              options={{
                title: 'Results',
                headerLeft: () => null,
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
                title: 'Premium',
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
  // Base containers
  container: {
    flex: 1,
    backgroundColor: colors.gray50,
  },

  // Cards
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gray200,
    padding: 16,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
      web: {
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
      },
    } as any),
  },

  // Typography
  greeting: {
    fontSize: 14,
    color: colors.gray500,
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.gray900,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  profileButton: {
    padding: 4,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.blue100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.blue600,
  },

  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    paddingTop: 20,
    marginHorizontal: -6,
  },
  statCard: {
    flex: 1,
    minWidth: isTablet ? '23%' : '47%',
    marginHorizontal: 6,
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 12,
    color: colors.gray500,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.gray900,
    marginBottom: 4,
  },
  statChange: {
    fontSize: 12,
    color: colors.gray500,
  },
  heartsContainer: {
    flexDirection: 'row',
    marginVertical: 4,
  },
  heartIcon: {
    fontSize: 20,
    marginRight: 2,
  },

  // Challenge Card
  challengeCard: {
    marginHorizontal: 20,
    backgroundColor: colors.blue50,
    borderColor: colors.blue200,
  },
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  challengeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.gray900,
    marginBottom: 4,
  },
  challengeDescription: {
    fontSize: 14,
    color: colors.gray600,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.blue100,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.blue500,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: colors.gray600,
  },

  // Status Badge
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '500',
  },

  // Sections
  section: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.gray900,
  },
  sectionLink: {
    fontSize: 14,
    color: colors.blue600,
    fontWeight: '500',
  },

  // Action Grid
  actionGrid: {
    flexDirection: 'row',
    marginHorizontal: -6,
  },
  actionButton: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gray200,
    padding: 20,
    marginHorizontal: 6,
    alignItems: 'center',
  },
  primaryAction: {
    backgroundColor: colors.blue600,
    borderColor: colors.blue600,
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray900,
    marginBottom: 4,
  },
  primaryActionText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 12,
    color: colors.gray500,
    textAlign: 'center',
  },

  // Activity Items
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
    marginRight: 12,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray900,
    marginBottom: 2,
  },
  activityDescription: {
    fontSize: 13,
    color: colors.gray600,
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 12,
    color: colors.gray500,
  },

  // Premium Card
  premiumCard: {
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 20,
    backgroundColor: colors.gray900,
  },
  premiumContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  premiumEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  premiumTextContainer: {
    flex: 1,
  },
  premiumTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
    marginBottom: 4,
  },
  premiumDescription: {
    fontSize: 13,
    color: colors.gray300,
  },
  premiumButton: {
    backgroundColor: colors.white,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  premiumButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray900,
  },

  // Page Headers
  pageHeader: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '600',
    color: colors.gray900,
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: 14,
    color: colors.gray600,
  },

  // Categories
  categoriesGrid: {
    padding: 20,
  },
  categoryCard: {
    marginBottom: 12,
  },
  categoryCardInner: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  categoryEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.gray900,
    marginBottom: 8,
  },
  categoryMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryQuestions: {
    fontSize: 13,
    color: colors.gray600,
    marginRight: 8,
  },

  // Quiz
  quizContainer: {
    flex: 1,
    backgroundColor: colors.white,
  },
  quizProgress: {
    height: 4,
    backgroundColor: colors.gray200,
  },
  quizProgressFill: {
    height: '100%',
    backgroundColor: colors.blue500,
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
  quizCategory: {
    fontSize: 12,
    color: colors.gray500,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  quizQuestionNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray900,
  },
  quizHearts: {
    flexDirection: 'row',
  },
  quizHeart: {
    fontSize: 18,
    marginLeft: 4,
  },
  questionCard: {
    margin: 20,
    padding: 24,
    backgroundColor: colors.gray50,
    borderColor: colors.gray200,
  },
  questionText: {
    fontSize: 20,
    fontWeight: '500',
    color: colors.gray900,
    lineHeight: 28,
    textAlign: 'center',
  },
  optionsContainer: {
    paddingHorizontal: 20,
  },
  optionButton: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.gray200,
    padding: 16,
    marginBottom: 12,
  },
  optionSelected: {
    borderColor: colors.blue500,
    backgroundColor: colors.blue50,
  },
  optionCorrect: {
    borderColor: colors.green500,
    backgroundColor: colors.green50,
  },
  optionIncorrect: {
    borderColor: colors.red500,
    backgroundColor: colors.red50,
  },
  optionText: {
    fontSize: 16,
    color: colors.gray900,
    textAlign: 'center',
    fontWeight: '500',
  },
  optionTextSelected: {
    color: colors.blue700,
  },
  optionTextCorrect: {
    color: colors.green700,
  },
  optionTextIncorrect: {
    color: colors.red700,
  },

  // Results
  resultsContainer: {
    padding: 20,
  },
  resultsCard: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  resultIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  resultEmoji: {
    fontSize: 40,
  },
  resultMessage: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.gray900,
    marginBottom: 8,
  },
  resultCategory: {
    fontSize: 14,
    color: colors.gray600,
    marginBottom: 24,
  },
  scoreDisplay: {
    alignItems: 'center',
    marginBottom: 20,
  },
  scoreText: {
    fontSize: 48,
    fontWeight: '700',
    color: colors.gray900,
  },
  percentageText: {
    fontSize: 20,
    color: colors.gray600,
    marginTop: 4,
  },
  xpEarned: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray50,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  xpLabel: {
    fontSize: 14,
    color: colors.gray600,
    marginRight: 8,
  },
  xpValue: {
    fontSize: 18,
    fontWeight: '600',
  },
  resultStats: {
    flexDirection: 'row',
    marginHorizontal: -6,
    marginTop: 20,
  },
  resultStatCard: {
    flex: 1,
    marginHorizontal: 6,
    alignItems: 'center',
  },
  resultStatLabel: {
    fontSize: 12,
    color: colors.gray500,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  resultStatValue: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.gray900,
  },
  resultActions: {
    marginTop: 32,
  },

  // Buttons
  button: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonPrimary: {
    backgroundColor: colors.blue600,
  },
  buttonSecondary: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray300,
  },
  buttonLarge: {
    paddingVertical: 16,
  },
  buttonPrimaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
  buttonSecondaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray700,
  },

  // Leaderboard
  topThree: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 24,
    justifyContent: 'center',
  },
  topPlayerCard: {
    flex: 1,
    marginHorizontal: 8,
    alignItems: 'center',
    paddingVertical: 20,
  },
  firstPlace: {
    transform: [{ scale: 1.1 }],
    backgroundColor: colors.yellow50,
    borderColor: colors.yellow500,
  },
  topPlayerAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  firstPlaceAvatar: {
    backgroundColor: colors.yellow100,
  },
  topPlayerAvatarText: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.gray700,
  },
  topPlayerRank: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray500,
    marginBottom: 4,
  },
  topPlayerName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray900,
    marginBottom: 4,
  },
  topPlayerScore: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.blue600,
  },
  crown: {
    fontSize: 24,
    position: 'absolute',
    top: -10,
  },
  leaderboardList: {
    paddingHorizontal: 20,
  },
  leaderboardItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  leaderboardItemHighlight: {
    backgroundColor: colors.blue50,
    borderColor: colors.blue500,
  },
  leaderboardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  leaderboardRank: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray500,
    width: 40,
  },
  leaderboardAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  leaderboardAvatarText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray700,
  },
  leaderboardName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray900,
    marginBottom: 2,
  },
  leaderboardScore: {
    fontSize: 13,
    color: colors.gray600,
  },
  leaderboardTrend: {
    alignItems: 'center',
  },
  trendIcon: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.gray400,
  },

  // Paywall
  paywallHeader: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
    backgroundColor: colors.white,
  },
  paywallIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.yellow50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  paywallEmoji: {
    fontSize: 40,
  },
  paywallTitle: {
    fontSize: 28,
    fontWeight: '600',
    color: colors.gray900,
    marginBottom: 8,
  },
  paywallSubtitle: {
    fontSize: 16,
    color: colors.gray600,
    textAlign: 'center',
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 14,
    marginBottom: 24,
  },
  featureCard: {
    width: isTablet ? '31%' : '47%',
    marginHorizontal: 6,
    marginBottom: 12,
    alignItems: 'center',
    paddingVertical: 20,
  },
  featureIcon: {
    fontSize: 32,
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
  },
  pricingSectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.gray900,
    marginBottom: 16,
  },
  pricingCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.gray200,
    padding: 20,
    marginBottom: 12,
    position: 'relative',
  },
  pricingCardSelected: {
    borderColor: colors.blue500,
    backgroundColor: colors.blue50,
  },
  pricingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  pricingTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.gray900,
    marginBottom: 4,
  },
  pricingPrice: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.blue600,
  },
  pricingDescription: {
    fontSize: 14,
    color: colors.gray600,
  },
  radioButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.gray400,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonSelected: {
    borderColor: colors.blue500,
    backgroundColor: colors.blue500,
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.white,
  },
  paywallActions: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  paywallSkip: {
    fontSize: 14,
    color: colors.gray600,
    textAlign: 'center',
    marginTop: 8,
  },
  paywallTerms: {
    fontSize: 12,
    color: colors.gray500,
    textAlign: 'center',
    marginTop: 20,
  },
});
