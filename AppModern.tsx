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
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { styled } from 'nativewind';

// Styled components with NativeWind
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledScrollView = styled(ScrollView);
const StyledSafeAreaView = styled(SafeAreaView);

// Get screen dimensions for responsive design
const { width: screenWidth } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';
const isTablet = screenWidth >= 768;

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

  const containerClass = isWeb ? 'flex-1 bg-gray-50' : 'flex-1 bg-gray-50';

  const heroClass = isWeb
    ? 'bg-blue-600 pb-8 pt-12 px-6 shadow-xl'
    : 'bg-blue-600 pb-8 pt-12 px-6 rounded-b-3xl shadow-xl';

  return (
    <StyledScrollView className={containerClass}>
      {/* Hero Section with Gradient */}
      <StyledView className={heroClass}>
        <StyledText className="text-4xl font-bold text-white mb-2">🎯 QuizMentor</StyledText>
        <StyledText className="text-lg text-blue-100">Challenge yourself, learn more</StyledText>

        {/* Stats Cards */}
        <StyledView className="flex-row mt-6 -mx-2">
          <StyledView className="flex-1 mx-2 bg-white/20 backdrop-blur-lg rounded-2xl p-4">
            <StyledText className="text-white/80 text-sm">Streak</StyledText>
            <StyledText className="text-2xl font-bold text-white">🔥 {streak}</StyledText>
          </StyledView>
          <StyledView className="flex-1 mx-2 bg-white/20 backdrop-blur-lg rounded-2xl p-4">
            <StyledText className="text-white/80 text-sm">Hearts</StyledText>
            <StyledText className="text-2xl font-bold text-white">
              {'❤️'.repeat(hearts)}
              {'🖤'.repeat(5 - hearts)}
            </StyledText>
          </StyledView>
        </StyledView>
      </StyledView>

      {/* Daily Challenge Card */}
      <StyledView className="mx-6 -mt-4 bg-yellow-500 rounded-2xl p-5 shadow-lg">
        <StyledView className="flex-row items-center">
          <StyledText className="text-3xl mr-3">🎯</StyledText>
          <StyledView className="flex-1">
            <StyledText className="text-white font-semibold text-lg">Daily Challenge</StyledText>
            <StyledText className="text-white/90 text-sm mt-1">
              Complete 5 quizzes for 2x XP!
            </StyledText>
          </StyledView>
        </StyledView>
        <StyledView className="bg-white/20 rounded-full mt-3 h-2">
          <StyledView className="bg-white rounded-full h-2 w-3/5" />
        </StyledView>
      </StyledView>

      {/* Quick Actions */}
      <StyledView className="px-6 mt-8">
        <StyledText className="text-xl font-bold text-gray-800 mb-4">Quick Start</StyledText>

        <StyledTouchableOpacity
          onPress={() => navigation.navigate('Categories')}
          className="bg-green-500 rounded-2xl p-5 shadow-md mb-3 active:scale-95"
        >
          <StyledView className="flex-row items-center justify-between">
            <StyledView>
              <StyledText className="text-white font-bold text-lg">Start Quiz</StyledText>
              <StyledText className="text-green-100 text-sm mt-1">Test your knowledge</StyledText>
            </StyledView>
            <StyledText className="text-white text-2xl">▶️</StyledText>
          </StyledView>
        </StyledTouchableOpacity>

        <StyledView className="flex-row -mx-1.5">
          <StyledTouchableOpacity
            onPress={() => navigation.navigate('Leaderboard')}
            className="flex-1 mx-1.5 bg-white rounded-2xl p-4 shadow-md active:scale-95"
          >
            <StyledText className="text-2xl mb-2 text-center">🏆</StyledText>
            <StyledText className="text-gray-700 font-semibold text-center">Leaderboard</StyledText>
          </StyledTouchableOpacity>

          <StyledTouchableOpacity
            onPress={() => navigation.navigate('Paywall')}
            className="flex-1 mx-1.5 bg-purple-600 rounded-2xl p-4 shadow-md active:scale-95"
          >
            <StyledText className="text-2xl mb-2 text-center">⭐</StyledText>
            <StyledText className="text-white font-semibold text-center">Go Premium</StyledText>
          </StyledTouchableOpacity>
        </StyledView>
      </StyledView>

      {/* Recent Activity */}
      <StyledView className="px-6 mt-8 mb-6">
        <StyledText className="text-xl font-bold text-gray-800 mb-4">Recent Activity</StyledText>
        <StyledView className="bg-white rounded-2xl p-4 shadow-sm">
          <StyledView className="flex-row items-center mb-3">
            <StyledView className="bg-blue-100 rounded-full p-2 mr-3">
              <StyledText>🌍</StyledText>
            </StyledView>
            <StyledView className="flex-1">
              <StyledText className="text-gray-800 font-semibold">Geography Quiz</StyledText>
              <StyledText className="text-gray-500 text-sm">Score: 8/10 • 2 hours ago</StyledText>
            </StyledView>
          </StyledView>
        </StyledView>
      </StyledView>
    </StyledScrollView>
  );
}

// Categories Screen
function CategoriesScreen({ navigation }: any) {
  const categories = [
    { id: '1', name: 'Geography', emoji: '🌍', color: 'bg-blue-500' },
    { id: '2', name: 'Science', emoji: '🔬', color: 'bg-green-500' },
    { id: '3', name: 'History', emoji: '📚', color: 'bg-amber-500' },
    { id: '4', name: 'Art', emoji: '🎨', color: 'bg-pink-500' },
    { id: '5', name: 'Sports', emoji: '🏀', color: 'bg-orange-500' },
    { id: '6', name: 'Movies', emoji: '🎬', color: 'bg-purple-500' },
  ];

  return (
    <StyledView className="flex-1 bg-gray-50">
      <FlatList
        data={categories}
        numColumns={isTablet ? 3 : 2}
        contentContainerStyle={{ padding: 16 }}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <StyledTouchableOpacity
            className={`${item.color} rounded-2xl p-6 mb-4 shadow-lg active:scale-95`}
            style={{ width: isTablet ? '31%' : '47%' }}
            onPress={() =>
              navigation.navigate('Quiz', {
                categorySlug: item.name.toLowerCase(),
                categoryName: `${item.emoji} ${item.name}`,
              })
            }
          >
            <StyledText className="text-4xl text-center mb-2">{item.emoji}</StyledText>
            <StyledText className="text-white font-bold text-center">{item.name}</StyledText>
          </StyledTouchableOpacity>
        )}
      />
    </StyledView>
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
    <StyledView className="flex-1 bg-gray-50">
      {/* Progress Bar */}
      <StyledView className="bg-gray-200 h-2">
        <StyledView className="bg-blue-500 h-2" style={{ width: `${progress}%` }} />
      </StyledView>

      {/* Hearts and Progress */}
      <StyledView className="flex-row justify-between items-center px-6 py-4 bg-white shadow-sm">
        <StyledText className="text-lg text-red-500 font-bold">{'❤️'.repeat(hearts)}</StyledText>
        <StyledText className="text-gray-600 font-semibold">
          {currentQuestion + 1} / {questions.length}
        </StyledText>
      </StyledView>

      {/* Question */}
      <StyledView className="flex-1 px-6 py-8">
        <StyledText className="text-2xl font-bold text-gray-800 text-center mb-8">
          {questions[currentQuestion].question}
        </StyledText>

        {/* Options */}
        <StyledView className="space-y-3">
          {questions[currentQuestion].options.map((option, index) => {
            const isSelected = selectedAnswer === index;
            const isCorrect = index === questions[currentQuestion].correct;
            const showResult = selectedAnswer !== null;

            let bgColor = 'bg-white';
            if (showResult && isSelected) {
              bgColor = isCorrect ? 'bg-green-100' : 'bg-red-100';
            } else if (showResult && isCorrect) {
              bgColor = 'bg-green-100';
            }

            return (
              <StyledTouchableOpacity
                key={index}
                className={`${bgColor} rounded-2xl p-5 shadow-md border-2 ${
                  isSelected ? 'border-blue-500' : 'border-transparent'
                } ${selectedAnswer === null ? 'active:scale-95' : ''}`}
                onPress={() => selectedAnswer === null && handleAnswer(index)}
                disabled={selectedAnswer !== null}
              >
                <StyledText
                  className={`text-center text-lg font-semibold ${
                    showResult && isCorrect
                      ? 'text-green-700'
                      : showResult && isSelected && !isCorrect
                        ? 'text-red-700'
                        : 'text-gray-700'
                  }`}
                >
                  {option}
                  {showResult && isCorrect && ' ✓'}
                  {showResult && isSelected && !isCorrect && ' ✗'}
                </StyledText>
              </StyledTouchableOpacity>
            );
          })}
        </StyledView>
      </StyledView>
    </StyledView>
  );
}

// Results Screen
function ResultsScreen({ navigation, route }: any) {
  const { score, total, categoryName } = route.params;
  const percentage = Math.round((score / total) * 100);

  let emoji = '😢';
  let message = 'Keep practicing!';
  let bgColor = 'from-danger-400 to-danger-600';

  if (percentage >= 80) {
    emoji = '🎉';
    message = 'Excellent work!';
    bgColor = 'from-success-400 to-success-600';
  } else if (percentage >= 60) {
    emoji = '😊';
    message = 'Good job!';
    bgColor = 'from-warning-400 to-warning-600';
  }

  return (
    <StyledView className="flex-1 bg-gray-50">
      <StyledView
        className={`bg-gradient-to-br ${bgColor} flex-1 items-center justify-center px-8`}
      >
        <StyledText className="text-6xl mb-4">{emoji}</StyledText>
        <StyledText className="text-white text-3xl font-bold mb-2">{message}</StyledText>
        <StyledText className="text-white/90 text-lg mb-8">{categoryName}</StyledText>

        <StyledView className="bg-white/20 backdrop-blur-lg rounded-3xl p-8 items-center">
          <StyledText className="text-white text-6xl font-bold">
            {score}/{total}
          </StyledText>
          <StyledText className="text-white text-2xl mt-2">{percentage}%</StyledText>
        </StyledView>

        <StyledView className="flex-row mt-8 -mx-2">
          <StyledTouchableOpacity
            className="flex-1 mx-2 bg-white/20 backdrop-blur-lg rounded-2xl p-4 active:scale-95"
            onPress={() => navigation.navigate('Home')}
          >
            <StyledText className="text-white font-bold text-center">Home</StyledText>
          </StyledTouchableOpacity>

          <StyledTouchableOpacity
            className="flex-1 mx-2 bg-white rounded-2xl p-4 active:scale-95"
            onPress={() => navigation.navigate('Categories')}
          >
            <StyledText className="text-gray-800 font-bold text-center">Play Again</StyledText>
          </StyledTouchableOpacity>
        </StyledView>
      </StyledView>
    </StyledView>
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
    <StyledView className="flex-1 bg-gray-50">
      <StyledScrollView className="flex-1 px-6 py-4">
        {/* Top 3 Podium */}
        <StyledView className="flex-row justify-center items-end mb-8 px-4">
          {/* 2nd Place */}
          <StyledView className="items-center mx-2">
            <StyledText className="text-2xl mb-1">👩</StyledText>
            <StyledView className="bg-gray-300 rounded-t-2xl px-6 py-4">
              <StyledText className="text-white font-bold text-lg">2</StyledText>
            </StyledView>
          </StyledView>

          {/* 1st Place */}
          <StyledView className="items-center mx-2">
            <StyledText className="text-3xl mb-1">👤</StyledText>
            <StyledView className="bg-warning-400 rounded-t-2xl px-8 py-6">
              <StyledText className="text-white font-bold text-xl">1</StyledText>
            </StyledView>
          </StyledView>

          {/* 3rd Place */}
          <StyledView className="items-center mx-2">
            <StyledText className="text-2xl mb-1">👨</StyledText>
            <StyledView className="bg-amber-600 rounded-t-2xl px-6 py-3">
              <StyledText className="text-white font-bold text-lg">3</StyledText>
            </StyledView>
          </StyledView>
        </StyledView>

        {/* Full Leaderboard */}
        {leaderboard.map((player) => (
          <StyledView
            key={player.rank}
            className={`bg-white rounded-2xl p-4 mb-3 shadow-sm flex-row items-center ${
              player.name === 'You' ? 'border-2 border-primary-500 bg-primary-50' : ''
            }`}
          >
            <StyledText className="text-2xl font-bold text-gray-600 w-12">{player.rank}</StyledText>
            <StyledText className="text-2xl mx-3">{player.avatar}</StyledText>
            <StyledText className="flex-1 text-lg font-semibold text-gray-800">
              {player.name}
            </StyledText>
            <StyledText className="text-lg font-bold text-primary-600">{player.score}</StyledText>
          </StyledView>
        ))}
      </StyledScrollView>
    </StyledView>
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

  return (
    <StyledScrollView className="flex-1 bg-gray-50">
      {/* Hero */}
      <StyledView className="bg-gradient-to-br from-purple-500 to-purple-700 px-6 py-12 items-center">
        <StyledText className="text-5xl mb-4">⭐</StyledText>
        <StyledText className="text-white text-3xl font-bold text-center mb-2">
          Unlock Premium
        </StyledText>
        <StyledText className="text-purple-100 text-center">
          Get unlimited access to all features
        </StyledText>
      </StyledView>

      {/* Benefits */}
      <StyledView className="px-6 py-8">
        <StyledView className="bg-white rounded-2xl p-6 shadow-lg">
          {[
            { icon: '♾️', text: 'Unlimited hearts' },
            { icon: '🔥', text: 'Streak protection' },
            { icon: '🎯', text: 'All categories unlocked' },
            { icon: '🚫', text: 'No ads, ever' },
            { icon: '📊', text: 'Advanced statistics' },
            { icon: '💎', text: 'Exclusive badges' },
          ].map((benefit, index) => (
            <StyledView key={index} className="flex-row items-center mb-4">
              <StyledText className="text-2xl mr-4">{benefit.icon}</StyledText>
              <StyledText className="text-gray-700 text-lg flex-1">{benefit.text}</StyledText>
              <StyledText className="text-success-500 text-xl">✓</StyledText>
            </StyledView>
          ))}
        </StyledView>
      </StyledView>

      {/* Plans */}
      <StyledView className="px-6 pb-8">
        {plans.map((plan) => (
          <StyledTouchableOpacity
            key={plan.id}
            className={`rounded-2xl p-5 mb-3 border-2 ${
              selectedPlan === plan.id
                ? 'bg-purple-50 border-purple-500'
                : 'bg-white border-gray-200'
            }`}
            onPress={() => setSelectedPlan(plan.id as any)}
          >
            <StyledView className="flex-row items-center justify-between">
              <StyledView>
                <StyledView className="flex-row items-center">
                  <StyledText className="text-xl font-bold text-gray-800">{plan.name}</StyledText>
                  {plan.save && (
                    <StyledView className="ml-2 bg-success-500 px-2 py-1 rounded-lg">
                      <StyledText className="text-white text-xs font-bold">{plan.save}</StyledText>
                    </StyledView>
                  )}
                </StyledView>
                <StyledView className="flex-row items-baseline mt-1">
                  <StyledText className="text-2xl font-bold text-primary-600">
                    {plan.price}
                  </StyledText>
                  <StyledText className="text-gray-600 ml-1">{plan.period}</StyledText>
                </StyledView>
              </StyledView>
              <StyledView
                className={`w-6 h-6 rounded-full border-2 ${
                  selectedPlan === plan.id ? 'bg-purple-500 border-purple-500' : 'border-gray-400'
                }`}
              >
                {selectedPlan === plan.id && (
                  <StyledView className="w-2 h-2 bg-white rounded-full m-auto" />
                )}
              </StyledView>
            </StyledView>
          </StyledTouchableOpacity>
        ))}

        <StyledTouchableOpacity
          className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-5 mt-4 shadow-lg active:scale-95"
          onPress={() => {
            Alert.alert('Success!', 'Premium activated! (Demo)', [
              { text: 'Awesome!', onPress: () => navigation.goBack() },
            ]);
          }}
        >
          <StyledText className="text-white text-center font-bold text-lg">
            Start Free Trial
          </StyledText>
        </StyledTouchableOpacity>

        <StyledTouchableOpacity className="mt-4 p-3" onPress={() => navigation.goBack()}>
          <StyledText className="text-gray-500 text-center underline">Maybe later</StyledText>
        </StyledTouchableOpacity>
      </StyledView>
    </StyledScrollView>
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
                elevation: 0,
                shadowOpacity: 0,
              },
              headerTintColor: '#fff',
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
