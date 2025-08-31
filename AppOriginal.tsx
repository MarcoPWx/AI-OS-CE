import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Screens
import HomeScreen from './screens/HomeScreen';
import CategoriesScreen from './screens/CategoriesScreen';
import QuizScreen from './screens/QuizScreen';
import ResultsScreen from './screens/ResultsScreen';
import LeaderboardScreen from './screens/LeaderboardScreen';
import PaywallScreen from './screens/PaywallScreen';

// Store
import { QuizProvider } from './store/QuizContext';

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
