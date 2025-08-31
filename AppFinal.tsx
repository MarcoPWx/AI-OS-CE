import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QuizProvider } from './store/QuizContext';

// Import screens
import CategoriesScreen from './screens/CategoriesScreen';
import QuizScreen from './screens/QuizScreen';
import ResultsScreen from './screens/ResultsScreen';
import LeaderboardScreen from './screens/LeaderboardScreen';

// Simple Paywall Screen (inline to avoid import issues)
function PaywallScreen({ navigation }: any) {
  const [selectedPlan, setSelectedPlan] = React.useState<'monthly' | 'annual' | 'lifetime'>(
    'annual',
  );

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
          alert('Premium activated! (Demo)');
          navigation.goBack();
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

// Home Screen with manipulation features
function HomeScreen({ navigation }: any) {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🎯 QuizMentor</Text>
        <Text style={styles.subtitle}>Learn & Compete</Text>
      </View>

      {/* Streak Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🔥 Current Streak</Text>
        <Text style={styles.streakNumber}>7 days</Text>
        <Text style={styles.cardText}>Keep learning every day!</Text>
      </View>

      {/* Hearts Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>❤️ Hearts</Text>
        <Text style={styles.heartsDisplay}>❤️ ❤️ ❤️ 🖤 🖤</Text>
        <Text style={styles.cardText}>3/5 hearts remaining</Text>
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
  // Paywall styles
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
