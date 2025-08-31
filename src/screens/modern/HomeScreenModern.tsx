import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Animated,
  Dimensions,
  Platform,
  useColorScheme,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../design/theme';
import { Button, Card, Badge, ProgressBar } from '../../components/ui';
import { localProgress } from '../../services/localProgress';
import { unifiedQuizData } from '../../../services/unifiedQuizData';

const { width, height } = Dimensions.get('window');

const HomeScreenModern = ({ navigation }: any) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [progress] = useState(localProgress.getProgress());
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 20,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const categories = [
    { name: 'JavaScript', icon: '🟨', color: theme.colors.accent.yellow, questions: 150 },
    { name: 'React', icon: '⚛️', color: theme.colors.accent.blue, questions: 120 },
    { name: 'TypeScript', icon: '🔷', color: theme.colors.accent.indigo, questions: 90 },
    { name: 'Node.js', icon: '🟢', color: theme.colors.accent.green, questions: 80 },
  ];

  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: isDark
          ? theme.colors.dark.background.primary
          : theme.colors.background.secondary,
      }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header Section */}
      <LinearGradient
        colors={
          isDark
            ? [theme.colors.primary[900], theme.colors.primary[800]]
            : [theme.colors.primary[500], theme.colors.primary[600]]
        }
        style={{
          paddingTop: Platform.OS === 'ios' ? 60 : 40,
          paddingBottom: 40,
          paddingHorizontal: theme.spacing[5],
          borderBottomLeftRadius: theme.borderRadius['3xl'],
          borderBottomRightRadius: theme.borderRadius['3xl'],
        }}
      >
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          <Text
            style={{
              fontSize: theme.typography.fontSize.sm,
              color: 'rgba(255,255,255,0.9)',
              marginBottom: theme.spacing[2],
            }}
          >
            Welcome back! 👋
          </Text>
          <Text
            style={{
              fontSize: theme.typography.fontSize['3xl'],
              fontWeight: theme.typography.fontWeight.bold,
              color: '#ffffff',
              marginBottom: theme.spacing[4],
            }}
          >
            Ready to learn?
          </Text>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View>
              <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>Current Streak</Text>
              <Text style={{ color: '#ffffff', fontSize: 24, fontWeight: 'bold' }}>
                🔥 {progress.currentStreak} days
              </Text>
            </View>
            <View>
              <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>Total XP</Text>
              <Text style={{ color: '#ffffff', fontSize: 24, fontWeight: 'bold' }}>
                ⭐ {progress.xp}
              </Text>
            </View>
          </View>
        </Animated.View>
      </LinearGradient>

      <View style={{ padding: theme.spacing[5] }}>
        {/* Quick Start Section */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
            marginBottom: theme.spacing[6],
          }}
        >
          <Text
            style={{
              fontSize: theme.typography.fontSize.xl,
              fontWeight: theme.typography.fontWeight.semibold,
              color: isDark ? theme.colors.dark.text.primary : theme.colors.neutral[900],
              marginBottom: theme.spacing[4],
            }}
          >
            Quick Start
          </Text>

          <Card
            variant="gradient"
            gradientColors={[theme.colors.accent.purple, theme.colors.accent.pink]}
            onPress={() => navigation.navigate('Quiz', { category: 'Random' })}
          >
            <View style={{ padding: theme.spacing[2] }}>
              <Text
                style={{
                  fontSize: theme.typography.fontSize['2xl'],
                  fontWeight: theme.typography.fontWeight.bold,
                  color: '#ffffff',
                  marginBottom: theme.spacing[2],
                }}
              >
                Daily Challenge 🎯
              </Text>
              <Text
                style={{
                  fontSize: theme.typography.fontSize.base,
                  color: 'rgba(255,255,255,0.9)',
                  marginBottom: theme.spacing[3],
                }}
              >
                Test your skills with today's curated quiz
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Badge variant="default" size="md">
                  10 Questions
                </Badge>
                <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '600' }}>Start →</Text>
              </View>
            </View>
          </Card>
        </Animated.View>

        {/* Categories Section */}
        <Text
          style={{
            fontSize: theme.typography.fontSize.xl,
            fontWeight: theme.typography.fontWeight.semibold,
            color: isDark ? theme.colors.dark.text.primary : theme.colors.neutral[900],
            marginBottom: theme.spacing[4],
          }}
        >
          Categories
        </Text>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          {categories.map((category, index) => (
            <Animated.View
              key={category.name}
              style={{
                width: '48%',
                marginBottom: theme.spacing[4],
                opacity: fadeAnim,
                transform: [
                  {
                    translateY: slideAnim,
                    scale: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.9, 1],
                    }),
                  },
                ],
              }}
            >
              <Card
                variant="elevated"
                onPress={() => navigation.navigate('Quiz', { category: category.name })}
              >
                <View style={{ alignItems: 'center', paddingVertical: theme.spacing[4] }}>
                  <Text style={{ fontSize: 40, marginBottom: theme.spacing[2] }}>
                    {category.icon}
                  </Text>
                  <Text
                    style={{
                      fontSize: theme.typography.fontSize.base,
                      fontWeight: theme.typography.fontWeight.semibold,
                      color: isDark ? theme.colors.dark.text.primary : theme.colors.neutral[900],
                      marginBottom: theme.spacing[1],
                    }}
                  >
                    {category.name}
                  </Text>
                  <Text
                    style={{
                      fontSize: theme.typography.fontSize.sm,
                      color: isDark ? theme.colors.dark.text.secondary : theme.colors.neutral[500],
                    }}
                  >
                    {category.questions} questions
                  </Text>
                </View>
              </Card>
            </Animated.View>
          ))}
        </View>

        {/* Progress Section */}
        <Text
          style={{
            fontSize: theme.typography.fontSize.xl,
            fontWeight: theme.typography.fontWeight.semibold,
            color: isDark ? theme.colors.dark.text.primary : theme.colors.neutral[900],
            marginBottom: theme.spacing[4],
          }}
        >
          Your Progress
        </Text>

        <Card variant="default">
          <View>
            <View style={{ marginBottom: theme.spacing[4] }}>
              <Text
                style={{
                  fontSize: theme.typography.fontSize.base,
                  color: isDark ? theme.colors.dark.text.secondary : theme.colors.neutral[600],
                  marginBottom: theme.spacing[2],
                }}
              >
                Level Progress
              </Text>
              <ProgressBar
                value={progress.xp % 100}
                max={100}
                variant="gradient"
                showLabel
                animated
              />
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
              <View style={{ alignItems: 'center' }}>
                <Text
                  style={{
                    fontSize: theme.typography.fontSize['2xl'],
                    fontWeight: theme.typography.fontWeight.bold,
                    color: isDark ? theme.colors.dark.text.primary : theme.colors.neutral[900],
                  }}
                >
                  {progress.level}
                </Text>
                <Text
                  style={{
                    fontSize: theme.typography.fontSize.sm,
                    color: isDark ? theme.colors.dark.text.secondary : theme.colors.neutral[500],
                  }}
                >
                  Level
                </Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text
                  style={{
                    fontSize: theme.typography.fontSize['2xl'],
                    fontWeight: theme.typography.fontWeight.bold,
                    color: isDark ? theme.colors.dark.text.primary : theme.colors.neutral[900],
                  }}
                >
                  {progress.totalQuestions}
                </Text>
                <Text
                  style={{
                    fontSize: theme.typography.fontSize.sm,
                    color: isDark ? theme.colors.dark.text.secondary : theme.colors.neutral[500],
                  }}
                >
                  Questions
                </Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text
                  style={{
                    fontSize: theme.typography.fontSize['2xl'],
                    fontWeight: theme.typography.fontWeight.bold,
                    color: isDark ? theme.colors.dark.text.primary : theme.colors.neutral[900],
                  }}
                >
                  {progress.totalQuestions > 0
                    ? Math.round((progress.correctAnswers / progress.totalQuestions) * 100)
                    : 0}
                  %
                </Text>
                <Text
                  style={{
                    fontSize: theme.typography.fontSize.sm,
                    color: isDark ? theme.colors.dark.text.secondary : theme.colors.neutral[500],
                  }}
                >
                  Accuracy
                </Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Action Buttons */}
        <View style={{ marginTop: theme.spacing[6], marginBottom: theme.spacing[10] }}>
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onPress={() => navigation.navigate('Leaderboard')}
          >
            View Leaderboard 🏆
          </Button>
          <View style={{ height: theme.spacing[3] }} />
          <Button
            variant="secondary"
            size="lg"
            fullWidth
            onPress={() => navigation.navigate('Achievements')}
          >
            My Achievements 🎖️
          </Button>
        </View>
      </View>
    </ScrollView>
  );
};

export default HomeScreenModern;
