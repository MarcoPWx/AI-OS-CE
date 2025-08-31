import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QuizProvider } from './store/QuizContext';

// Import all screens
import CategoriesScreen from './screens/CategoriesScreen';
import QuizScreen from './screens/QuizScreen';
import ResultsScreen from './screens/ResultsScreen';
import LeaderboardScreen from './screens/LeaderboardScreen';
import PaywallScreen from './screens/PaywallScreen';

// Custom Home Screen with all features displayed
function HomeScreen({ navigation }: any) {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🎯 QuizMentor</Text>
        <Text style={styles.subtitle}>Educational Quiz App</Text>
      </View>

      {/* Streak Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🔥 Current Streak</Text>
        <Text style={styles.streakNumber}>7 days</Text>
        <Text style={styles.cardText}>Keep it up! Don't break your streak!</Text>
      </View>

      {/* Hearts Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>❤️ Hearts</Text>
        <Text style={styles.heartsDisplay}>❤️ ❤️ ❤️ 🖤 🖤</Text>
        <Text style={styles.cardText}>3/5 hearts remaining</Text>
      </View>

      {/* Daily Challenge Card */}
      <View style={[styles.card, styles.challengeCard]}>
        <Text style={styles.cardTitle}>🎯 Daily Challenge</Text>
        <Text style={styles.challengeText}>Complete 5 quizzes today!</Text>
        <Text style={styles.rewardText}>Reward: 2x XP + 3 Hearts</Text>
      </View>

      {/* Navigation Buttons */}
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Categories')}>
        <Text style={styles.buttonText}>Start Quiz</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.secondaryButton]}
        onPress={() => navigation.navigate('Leaderboard')}
      >
        <Text style={styles.buttonText}>View Leaderboard 🏆</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.premiumButton]}
        onPress={() => navigation.navigate('Paywall', { source: 'home' })}
      >
        <Text style={styles.buttonText}>🌟 Go Premium</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

export type RootStackParamList = {
  Home: undefined;
  Categories: undefined;
  Quiz: { categorySlug: string; categoryName: string };
  Results: { score: number; total: number; categoryName: string };
  Leaderboard: undefined;
  Paywall: { source: string };
};

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  console.log('Complete App is rendering!');

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
              options={({ route }) => ({ title: route.params.categoryName })}
            />
            <Stack.Screen
              name="Results"
              component={ResultsScreen}
              options={{ title: 'Quiz Results' }}
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
});
