import React, { useState, useContext, createContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Alert,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Simple Quiz Context
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

// Categories Screen
function CategoriesScreen({ navigation }: any) {
  const categories = [
    { id: '1', name: '🌍 Geography', slug: 'geography' },
    { id: '2', name: '🔬 Science', slug: 'science' },
    { id: '3', name: '📚 History', slug: 'history' },
    { id: '4', name: '🎨 Art', slug: 'art' },
    { id: '5', name: '🏀 Sports', slug: 'sports' },
    { id: '6', name: '🎬 Movies', slug: 'movies' },
  ];

  return (
    <View style={styles.container}>
      <FlatList
        data={categories}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.categoryCard}
            onPress={() =>
              navigation.navigate('Quiz', {
                categorySlug: item.slug,
                categoryName: item.name,
              })
            }
          >
            <Text style={styles.categoryText}>{item.name}</Text>
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
    if (selectedIndex === questions[currentQuestion].correct) {
      setUserScore(userScore + 1);
    } else {
      setHearts(Math.max(0, hearts - 1));
    }

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      navigation.navigate('Results', {
        score: userScore + (selectedIndex === questions[currentQuestion].correct ? 1 : 0),
        total: questions.length,
        categoryName,
      });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.quizHeader}>
        <Text style={styles.hearts}>❤️ {hearts}</Text>
        <Text style={styles.progress}>
          {currentQuestion + 1} / {questions.length}
        </Text>
      </View>

      <View style={styles.questionContainer}>
        <Text style={styles.question}>{questions[currentQuestion].question}</Text>

        {questions[currentQuestion].options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={styles.optionButton}
            onPress={() => handleAnswer(index)}
          >
            <Text style={styles.optionText}>{option}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

// Results Screen
function ResultsScreen({ navigation, route }: any) {
  const { score, total, categoryName } = route.params;
  const percentage = Math.round((score / total) * 100);

  return (
    <View style={styles.resultsContainer}>
      <Text style={styles.resultsTitle}>Quiz Complete!</Text>
      <Text style={styles.resultsCategory}>{categoryName}</Text>
      <Text style={styles.resultsScore}>
        {score} / {total}
      </Text>
      <Text style={styles.resultsPercentage}>{percentage}%</Text>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Home')}>
        <Text style={styles.buttonText}>Back to Home</Text>
      </TouchableOpacity>
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
      <View style={styles.leaderboardHeader}>
        <Text style={styles.leaderboardTitle}>🏆 Top Players</Text>
      </View>

      {leaderboard.map((player) => (
        <View
          key={player.rank}
          style={[styles.leaderboardItem, player.name === 'You' && styles.currentPlayer]}
        >
          <Text style={styles.rank}>#{player.rank}</Text>
          <Text style={styles.playerAvatar}>{player.avatar}</Text>
          <Text style={styles.playerName}>{player.name}</Text>
          <Text style={styles.playerScore}>{player.score} pts</Text>
        </View>
      ))}
    </ScrollView>
  );
}

// Paywall Screen
function PaywallScreen({ navigation }: any) {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annual' | 'lifetime'>('annual');

  return (
    <ScrollView style={styles.container}>
      <View style={styles.paywallHeader}>
        <Text style={styles.paywallTitle}>🌟 Go Premium</Text>
        <Text style={styles.paywallSubtitle}>Unlock unlimited learning</Text>
      </View>

      <View style={styles.benefits}>
        <Text style={styles.benefitItem}>♾️ Unlimited hearts</Text>
        <Text style={styles.benefitItem}>🔥 Streak freezes</Text>
        <Text style={styles.benefitItem}>🎯 All categories</Text>
        <Text style={styles.benefitItem}>🚫 No ads</Text>
      </View>

      <View style={styles.plans}>
        <TouchableOpacity
          style={[styles.planCard, selectedPlan === 'monthly' && styles.selectedPlan]}
          onPress={() => setSelectedPlan('monthly')}
        >
          <Text style={styles.planName}>Monthly</Text>
          <Text style={styles.planPrice}>$12.99/mo</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.planCard,
            styles.recommendedPlan,
            selectedPlan === 'annual' && styles.selectedPlan,
          ]}
          onPress={() => setSelectedPlan('annual')}
        >
          <Text style={styles.badge}>BEST VALUE</Text>
          <Text style={styles.planName}>Annual</Text>
          <Text style={styles.planPrice}>$89.99/yr</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.planCard, selectedPlan === 'lifetime' && styles.selectedPlan]}
          onPress={() => setSelectedPlan('lifetime')}
        >
          <Text style={styles.planName}>Lifetime</Text>
          <Text style={styles.planPrice}>$199</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.purchaseButton}
        onPress={() => {
          Alert.alert('Premium Activated!', 'Enjoy your premium features! (Demo)', [
            { text: 'OK', onPress: () => navigation.goBack() },
          ]);
        }}
      >
        <Text style={styles.purchaseButtonText}>Start Free Trial</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.dismissText}>Maybe later</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// Home Screen
function HomeScreen({ navigation }: any) {
  const { hearts, streak } = useContext(QuizContext);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🎯 QuizMentor</Text>
        <Text style={styles.subtitle}>Learn & Compete</Text>
      </View>

      {/* Streak Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🔥 Current Streak</Text>
        <Text style={styles.streakNumber}>{streak} days</Text>
        <Text style={styles.cardText}>Keep learning every day!</Text>
      </View>

      {/* Hearts Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>❤️ Hearts</Text>
        <Text style={styles.heartsDisplay}>
          {Array(hearts).fill('❤️').join(' ')}{' '}
          {Array(5 - hearts)
            .fill('🖤')
            .join(' ')}
        </Text>
        <Text style={styles.cardText}>{hearts}/5 hearts remaining</Text>
      </View>

      {/* Daily Challenge */}
      <View style={[styles.card, styles.challengeCard]}>
        <Text style={styles.cardTitle}>🎯 Daily Challenge</Text>
        <Text style={styles.challengeText}>Complete 5 quizzes today!</Text>
        <Text style={styles.rewardText}>Reward: 2x XP + 3 Hearts</Text>
      </View>

      {/* Action Buttons */}
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Categories')}>
        <Text style={styles.buttonText}>Start Quiz</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.secondaryButton]}
        onPress={() => navigation.navigate('Leaderboard')}
      >
        <Text style={styles.buttonText}>Leaderboard 🏆</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.premiumButton]}
        onPress={() => navigation.navigate('Paywall')}
      >
        <Text style={styles.buttonText}>Go Premium 🌟</Text>
      </TouchableOpacity>
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
                backgroundColor: '#3b82f6',
              },
              headerTintColor: '#fff',
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            }}
          >
            <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'QuizMentor' }} />
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
              })}
            />
            <Stack.Screen name="Results" component={ResultsScreen} options={{ title: 'Results' }} />
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
    backgroundColor: '#f3f4f6',
  },
  header: {
    backgroundColor: '#3b82f6',
    padding: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#e0e7ff',
  },
  card: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  cardText: {
    fontSize: 14,
    color: '#6b7280',
  },
  streakNumber: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#f59e0b',
    marginVertical: 8,
  },
  heartsDisplay: {
    fontSize: 28,
    marginVertical: 8,
  },
  challengeCard: {
    backgroundColor: '#fef3c7',
    borderWidth: 2,
    borderColor: '#f59e0b',
  },
  challengeText: {
    fontSize: 16,
    color: '#92400e',
    marginBottom: 8,
  },
  rewardText: {
    fontSize: 14,
    color: '#78350f',
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#10b981',
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: '#6b7280',
  },
  premiumButton: {
    backgroundColor: '#8b5cf6',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  // Categories
  categoryCard: {
    backgroundColor: '#fff',
    margin: 8,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  // Quiz
  quizHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#fff',
  },
  hearts: {
    fontSize: 20,
    color: '#ef4444',
  },
  progress: {
    fontSize: 16,
    color: '#6b7280',
  },
  questionContainer: {
    padding: 20,
  },
  question: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 30,
    textAlign: 'center',
  },
  optionButton: {
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 12,
    marginVertical: 8,
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  optionText: {
    fontSize: 16,
    color: '#1f2937',
    textAlign: 'center',
  },
  // Results
  resultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  resultsTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 20,
  },
  resultsCategory: {
    fontSize: 18,
    color: '#6b7280',
    marginBottom: 20,
  },
  resultsScore: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#3b82f6',
    marginBottom: 10,
  },
  resultsPercentage: {
    fontSize: 24,
    color: '#10b981',
    marginBottom: 30,
  },
  // Leaderboard
  leaderboardHeader: {
    padding: 20,
    alignItems: 'center',
  },
  leaderboardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 12,
  },
  currentPlayer: {
    backgroundColor: '#eff6ff',
    borderWidth: 2,
    borderColor: '#3b82f6',
  },
  rank: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    width: 40,
  },
  playerAvatar: {
    fontSize: 24,
    marginHorizontal: 12,
  },
  playerName: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
  },
  playerScore: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  // Paywall
  paywallHeader: {
    padding: 24,
    alignItems: 'center',
  },
  paywallTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  paywallSubtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  benefits: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  benefitItem: {
    fontSize: 18,
    color: '#4b5563',
    marginBottom: 12,
  },
  plans: {
    paddingHorizontal: 24,
  },
  planCard: {
    backgroundColor: '#f3f4f6',
    padding: 20,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedPlan: {
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
  },
  recommendedPlan: {
    backgroundColor: '#fef3c7',
  },
  badge: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  planName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  planPrice: {
    fontSize: 24,
    color: '#3b82f6',
    fontWeight: 'bold',
  },
  purchaseButton: {
    backgroundColor: '#3b82f6',
    marginHorizontal: 24,
    marginVertical: 24,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  purchaseButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  dismissText: {
    textAlign: 'center',
    color: '#9ca3af',
    marginBottom: 24,
    textDecorationLine: 'underline',
  },
});
