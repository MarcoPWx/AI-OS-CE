import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { localProgress } from './src/services/localProgress';

// Import frictionless screens
import HomeScreenFrictionless from './src/screens/HomeScreenFrictionless';
import QuizScreenFrictionless from './src/screens/QuizScreenFrictionless';
import CategoriesScreen from './src/screens/CategoriesScreen';
import LeaderboardScreen from './src/screens/LeaderboardScreen';

const Stack = createNativeStackNavigator();

export default function AppFrictionless() {
  useEffect(() => {
    // Initialize local progress tracking
    console.log('🚀 QuizMentor: Frictionless experience initialized');
    const progress = localProgress.getProgress();
    console.log(
      `📊 User progress: Level ${progress.level}, ${progress.totalQuestions} questions answered`,
    );

    // Set up achievement listener
    localProgress.onAchievementUnlocked = (achievementId: string) => {
      console.log(`🏆 Achievement unlocked: ${achievementId}`);
      // In production, show achievement toast/modal
    };
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: '#f8f9fa' },
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreenFrictionless}
          options={{
            animation: 'fade',
          }}
        />
        <Stack.Screen
          name="Quiz"
          component={QuizScreenFrictionless}
          options={{
            animation: 'slide_from_right',
            gestureEnabled: false, // Prevent accidental back during quiz
          }}
        />
        <Stack.Screen
          name="Categories"
          component={CategoriesScreen}
          options={{
            headerShown: true,
            title: 'All Categories',
            headerStyle: { backgroundColor: '#0969da' },
            headerTintColor: '#fff',
          }}
        />
        <Stack.Screen
          name="Leaderboard"
          component={LeaderboardScreen}
          options={{
            headerShown: true,
            title: 'Leaderboard',
            headerStyle: { backgroundColor: '#0969da' },
            headerTintColor: '#fff',
          }}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsPlaceholder}
          options={{
            headerShown: true,
            title: 'Settings',
            headerStyle: { backgroundColor: '#0969da' },
            headerTintColor: '#fff',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// Temporary settings placeholder (will be replaced with full settings screen)
function SettingsPlaceholder() {
  const progress = localProgress.getProgress();

  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: '#f8f9fa' }}>
      <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>Your Data</Text>
        <Text style={{ color: '#666', marginBottom: 8 }}>
          Total Questions: {progress.totalQuestions}
        </Text>
        <Text style={{ color: '#666', marginBottom: 8 }}>
          Accuracy:{' '}
          {progress.totalQuestions > 0
            ? Math.round((progress.correctAnswers / progress.totalQuestions) * 100)
            : 0}
          %
        </Text>
        <Text style={{ color: '#666', marginBottom: 8 }}>
          Current Streak: {progress.currentStreak} days
        </Text>
      </View>

      <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>Privacy</Text>
        <Text style={{ color: '#666', lineHeight: 20 }}>
          • All data stored locally on device{'\n'}• No account required{'\n'}• No personal data
          collected{'\n'}• Export or delete anytime
        </Text>
      </View>

      <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>About</Text>
        <Text style={{ color: '#666', lineHeight: 20 }}>
          QuizMentor v1.0.0{'\n'}
          Frictionless learning for developers{'\n'}
          {'\n'}
          Made with ❤️ for the dev community
        </Text>
      </View>
    </View>
  );
}
