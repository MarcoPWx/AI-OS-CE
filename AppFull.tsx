import React from 'react';
import { View, Text, StyleSheet, Button, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

// Screens
import HomeScreen from './screens/HomeScreen';
import CategoriesScreen from './screens/CategoriesScreen';
import QuizScreen from './screens/QuizScreen';
import ResultsScreen from './screens/ResultsScreen';

// Store
import { QuizProvider } from './store/QuizContext';

export type RootStackParamList = {
  Home: undefined;
  Categories: undefined;
  Quiz: { categorySlug: string; categoryName: string };
  Results: { score: number; total: number; categoryName: string };
};

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(true);

  // Initialize all manipulation systems
  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      console.log('🚀 Initializing QuizMentor manipulation systems...');

      // 1. Check network connectivity
      const netInfo = await NetInfo.fetch();
      setIsOnline(netInfo.isConnected ?? true);

      // 2. Initialize analytics first (to track everything)
      await analyticsService.initialize();
      analyticsService.track('app_opened', {
        timestamp: new Date().toISOString(),
        platform: Platform.OS,
      });

      // 3. Get or create user ID
      const storedUserId = await AsyncStorage.getItem('userId');
      const currentUserId =
        storedUserId || `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      if (!storedUserId) {
        await AsyncStorage.setItem('userId', currentUserId);
      }
      setUserId(currentUserId);

      // 4. Initialize remote configuration
      console.log('📡 Loading remote configuration...');
      await remoteConfigService.initialize(currentUserId);
      const config = remoteConfigService.getConfig();
      console.log('✅ Remote config loaded:', config?.version);

      // 5. Initialize subscription service (RevenueCat)
      console.log('💰 Initializing subscriptions...');
      await initializeSubscriptions();

      // 6. Initialize notification service
      console.log('🔔 Setting up notifications...');
      await notificationService.initialize();

      // 7. Initialize ad service
      console.log('📺 Configuring ads...');
      await adService.initialize();

      // 8. Initialize manipulation stores
      console.log('😈 Activating manipulation mechanics...');

      // Check and update streak
      const streakStore = useStreakStore.getState();
      streakStore.checkStreak();

      // Check heart regeneration
      const heartsStore = useHeartsStore.getState();
      heartsStore.checkRegeneration();

      // Initialize fake users and activity
      initializeLeaderboard();

      // Initialize daily challenges
      initializeDailyChallenge();

      // Initialize social features with fake friends
      initializeSocialFeatures();

      // 9. Track initialization success
      analyticsService.track('initialization_complete', {
        userId: currentUserId,
        configVersion: config?.version,
        isOnline,
      });

      // 10. Schedule initial manipulation triggers
      scheduleManipulationTriggers();

      console.log('✅ All systems initialized successfully!');
      setIsReady(true);
    } catch (error) {
      console.error('❌ Initialization failed:', error);
      analyticsService.track('initialization_failed', {
        error: (error as Error).message,
      });

      // Still allow app to run with cached data
      setIsReady(true);
    } finally {
      // Hide splash screen
      await SplashScreen.hideAsync();
    }
  };

  const scheduleManipulationTriggers = () => {
    // Schedule streak danger check
    const checkStreakDanger = () => {
      const streakStore = useStreakStore.getState();
      if (streakStore.isStreakInDanger()) {
        notificationService.scheduleOneTimeNotification(
          '🔥 Your streak is in danger!',
          `Don't lose your ${streakStore.currentStreak}-day streak!`,
          1,
          { type: 'streak_danger' },
        );
      }
    };

    // Check every hour
    setInterval(checkStreakDanger, 60 * 60 * 1000);

    // Schedule fake social activity
    const generateFakeActivity = () => {
      const leaderboardStore = useLeaderboardStore.getState();
      const socialStore = useSocialStore.getState();

      leaderboardStore.generateFakeActivity();
      socialStore.generateFakeFriendActivity();

      // Random social pressure notification
      if (Math.random() > 0.7) {
        socialStore.triggerPeerPressure();
      }
    };

    // Generate activity every 30 seconds
    setInterval(generateFakeActivity, 30 * 1000);

    // Check for ad opportunities
    const checkAdTriggers = () => {
      const heartsStore = useHeartsStore.getState();
      if (heartsStore.hearts === 0 && !heartsStore.isPremium) {
        adService.promptRewardedAdForHearts();
      }
    };

    // Check every 5 minutes
    setInterval(checkAdTriggers, 5 * 60 * 1000);

    // Track manipulation effectiveness
    const trackManipulation = () => {
      const metrics = analyticsService.exportMetrics();
      const recommendations = analyticsService.getManipulationRecommendations();

      console.log('📊 Manipulation Metrics:', metrics);
      console.log('💡 Recommendations:', recommendations);

      // Adjust tactics based on effectiveness
      if (metrics.frustrationScore > 80) {
        console.warn('⚠️ User frustration critical - reducing pressure');
        // Reduce notification frequency temporarily
      }

      if (metrics.premiumConversionLikelihood > 0.7) {
        console.log('🎯 High conversion potential - showing special offer');
        // Trigger special offer
      }
    };

    // Track every 2 minutes
    setInterval(trackManipulation, 2 * 60 * 1000);
  };

  // Listen for notification interactions
  useEffect(() => {
    const notificationListener = Notifications.addNotificationReceivedListener((notification) => {
      console.log('📬 Notification received:', notification);
      analyticsService.track('notification_received', {
        type: notification.request.content.data?.type,
      });
    });

    const responseListener = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log('👆 Notification tapped:', response);
      analyticsService.track('notification_opened', {
        type: response.notification.request.content.data?.type,
      });

      // Handle deep linking based on notification type
      const { type } = response.notification.request.content.data || {};
      switch (type) {
        case 'streak_danger':
          // Navigate to quiz
          break;
        case 'challenge_received':
          // Navigate to challenges
          break;
        case 'premium_offer':
          // Navigate to paywall
          break;
      }
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener);
      Notifications.removeNotificationSubscription(responseListener);
    };
  }, []);

  // Monitor network connectivity
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(state.isConnected ?? true);

      if (state.isConnected && !isOnline) {
        // Connection restored - sync data
        console.log('📶 Connection restored - syncing data...');
        remoteConfigService.forceRefresh();
      }
    });

    return unsubscribe;
  }, [isOnline]);

  // Monitor app state for background/foreground
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        // App came to foreground
        analyticsService.track('app_foregrounded');

        // Check for updates
        remoteConfigService.forceRefresh();

        // Update streak/hearts
        useStreakStore.getState().checkStreak();
        useHeartsStore.getState().checkRegeneration();
      } else if (nextAppState === 'background') {
        // App went to background
        analyticsService.track('app_backgrounded');
      }
    });

    return () => subscription.remove();
  }, []);

  if (!isReady) {
    // Could show a custom loading screen here
    return null;
  }

  return (
    <SafeAreaProvider>
      <QuizProvider>
        <NavigationContainer>
          {/* Offline banner */}
          {!isOnline && (
            <View style={styles.offlineBanner}>
              <Text style={styles.offlineText}>📡 Offline Mode - Some features may be limited</Text>
            </View>
          )}

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
              animation: 'slide_from_right',
            }}
          >
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={({ navigation }) => ({
                title: 'QuizMentor',
                headerRight: () => (
                  <TouchableOpacity
                    onPress={() => navigation.navigate('Leaderboard')}
                    style={{ marginRight: 16 }}
                  >
                    <Text style={{ color: '#fff', fontSize: 24 }}>🏆</Text>
                  </TouchableOpacity>
                ),
              })}
            />
            <Stack.Screen
              name="Categories"
              component={CategoriesScreen}
              options={{ title: 'Choose Category' }}
            />
            <Stack.Screen
              name="Quiz"
              component={QuizScreen}
              options={({ route }) => ({
                title: route.params.categoryName,
                headerBackVisible: false, // Prevent quitting mid-quiz
              })}
            />
            <Stack.Screen
              name="Results"
              component={ResultsScreen}
              options={{
                title: 'Quiz Results',
                headerBackVisible: false, // Force user through flow
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
                title: 'Unlock Premium',
                presentation: 'modal',
              }}
            />
          </Stack.Navigator>
          <StatusBar style="light" />
        </NavigationContainer>
      </QuizProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  offlineBanner: {
    backgroundColor: '#f59e0b',
    padding: 8,
    alignItems: 'center',
  },
  offlineText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});
