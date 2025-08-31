/**
 * QuizMentor - Modern Redesign
 * A beautiful, modern quiz application with delightful interactions
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Platform,
  StatusBar,
  Animated,
  SafeAreaView,
  useColorScheme,
} from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

// Import theme and components
import { theme } from './src/design/theme';

// Import redesigned screens
import HomeScreenModern from './src/screens/modern/HomeScreenModern';
import {
  QuizScreenModern,
  ExploreScreenModern,
  ProfileScreenModern,
  SettingsScreenModern,
  ResultsScreenModern,
  AchievementsScreenModern,
  LeaderboardScreenModern,
} from './src/screens/modern';

// Navigation types
const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Custom Tab Bar Component
const CustomTabBar = ({ state, descriptors, navigation }: any) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const animatedValues = useRef(state.routes.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const focusedIndex = state.index;
    animatedValues.forEach((anim, index) => {
      Animated.spring(anim, {
        toValue: index === focusedIndex ? 1 : 0,
        useNativeDriver: true,
        tension: 65,
        friction: 10,
      }).start();
    });
  }, [state.index]);

  const getIcon = (routeName: string, focused: boolean) => {
    const icons: Record<string, string> = {
      Home: '🏠',
      Explore: '🧭',
      Quiz: '🎯',
      Profile: '👤',
      Settings: '⚙️',
    };
    return icons[routeName] || '📱';
  };

  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: isDark
          ? theme.colors.dark.background.elevated
          : theme.colors.background.elevated,
        borderTopWidth: 0,
        paddingBottom: Platform.OS === 'ios' ? 20 : 10,
        paddingTop: 10,
        paddingHorizontal: theme.spacing[4],
        ...theme.shadows.lg,
      }}
    >
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const label = options.tabBarLabel || options.title || route.name;
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            if (Platform.OS !== 'web') {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
            navigation.navigate(route.name);
          }
        };

        return (
          <Animated.View
            key={route.key}
            style={{
              flex: 1,
              transform: [
                {
                  scale: animatedValues[index].interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 1.1],
                  }),
                },
              ],
            }}
          >
            <Pressable
              onPress={onPress}
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: theme.spacing[2],
              }}
            >
              <Animated.View
                style={{
                  transform: [
                    {
                      translateY: animatedValues[index].interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -4],
                      }),
                    },
                  ],
                }}
              >
                <Text
                  style={{
                    fontSize: 24,
                    marginBottom: 4,
                  }}
                >
                  {getIcon(route.name, isFocused)}
                </Text>
              </Animated.View>

              <Animated.Text
                style={{
                  fontSize: 11,
                  fontWeight: isFocused ? '600' : '400',
                  color: animatedValues[index].interpolate({
                    inputRange: [0, 1],
                    outputRange: [
                      isDark ? theme.colors.dark.text.secondary : theme.colors.neutral[500],
                      isDark ? theme.colors.primary[400] : theme.colors.primary[600],
                    ],
                  }),
                  opacity: animatedValues[index].interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.7, 1],
                  }),
                }}
              >
                {label}
              </Animated.Text>

              {isFocused && (
                <Animated.View
                  style={{
                    position: 'absolute',
                    bottom: -8,
                    width: 4,
                    height: 4,
                    borderRadius: 2,
                    backgroundColor: isDark ? theme.colors.primary[400] : theme.colors.primary[600],
                    opacity: animatedValues[index],
                  }}
                />
              )}
            </Pressable>
          </Animated.View>
        );
      })}
    </View>
  );
};

// Tab Navigator
const TabNavigator = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Home" component={HomeScreenModern} />
      <Tab.Screen name="Explore" component={ExploreScreenModern} />
      <Tab.Screen name="Profile" component={ProfileScreenModern} />
      <Tab.Screen name="Settings" component={SettingsScreenModern} />
    </Tab.Navigator>
  );
};

// Main App Component
export default function AppModernRedesign() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [isReady, setIsReady] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Simulate app initialization
    setTimeout(() => {
      setIsReady(true);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }, 500);
  }, []);

  const navigationTheme = isDark ? DarkTheme : DefaultTheme;

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <LinearGradient
          colors={[theme.colors.primary[400], theme.colors.primary[600]]}
          style={{ flex: 1, width: '100%', justifyContent: 'center', alignItems: 'center' }}
        >
          <Animated.Text
            style={{
              fontSize: 48,
              fontWeight: 'bold',
              color: '#ffffff',
            }}
          >
            QuizMentor
          </Animated.Text>
          <Text style={{ color: '#ffffff', opacity: 0.8, marginTop: 8 }}>Learn. Play. Master.</Text>
        </LinearGradient>
      </View>
    );
  }

  return (
    <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={
          isDark ? theme.colors.dark.background.primary : theme.colors.background.primary
        }
      />
      <NavigationContainer theme={navigationTheme}>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            animation: 'fade_from_bottom',
            presentation: 'card',
          }}
        >
          <Stack.Screen name="Main" component={TabNavigator} />
          <Stack.Screen
            name="Quiz"
            component={QuizScreenModern}
            options={{
              animation: 'slide_from_right',
              gestureEnabled: false,
            }}
          />
          <Stack.Screen
            name="Results"
            component={ResultsScreenModern}
            options={{
              animation: 'fade',
              presentation: 'modal',
            }}
          />
          <Stack.Screen
            name="Achievements"
            component={AchievementsScreenModern}
            options={{
              animation: 'slide_from_bottom',
              presentation: 'modal',
            }}
          />
          <Stack.Screen
            name="Leaderboard"
            component={LeaderboardScreenModern}
            options={{
              animation: 'slide_from_bottom',
              presentation: 'modal',
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </Animated.View>
  );
}

// Fix for Pressable import
const Pressable =
  Platform.OS === 'web'
    ? require('react-native').TouchableOpacity
    : require('react-native').Pressable;
