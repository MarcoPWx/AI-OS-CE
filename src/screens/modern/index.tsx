// Placeholder screens for modern app
import React from 'react';
import { View, Text, useColorScheme } from 'react-native';
import { theme } from '../../design/theme';

const PlaceholderScreen = ({ title }: { title: string }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: isDark
          ? theme.colors.dark.background.primary
          : theme.colors.background.primary,
      }}
    >
      <Text
        style={{
          fontSize: 24,
          fontWeight: 'bold',
          color: isDark ? theme.colors.dark.text.primary : theme.colors.neutral[900],
        }}
      >
        {title}
      </Text>
      <Text
        style={{
          fontSize: 16,
          marginTop: 8,
          color: isDark ? theme.colors.dark.text.secondary : theme.colors.neutral[500],
        }}
      >
        Coming Soon...
      </Text>
    </View>
  );
};

export const QuizScreenModern = () => <PlaceholderScreen title="Quiz" />;
export const ExploreScreenModern = () => <PlaceholderScreen title="Explore" />;
export const ProfileScreenModern = () => <PlaceholderScreen title="Profile" />;
export const SettingsScreenModern = () => <PlaceholderScreen title="Settings" />;
export const ResultsScreenModern = () => <PlaceholderScreen title="Results" />;
export const AchievementsScreenModern = () => <PlaceholderScreen title="Achievements" />;
export const LeaderboardScreenModern = () => <PlaceholderScreen title="Leaderboard" />;
