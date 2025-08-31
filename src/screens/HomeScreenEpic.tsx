import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Dimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors as themeColors } from '../design/theme';

const { width, height } = Dimensions.get('window');

interface User {
  id: string;
  name: string;
  email: string;
  level: number;
  xp: number;
  streak: number;
  interests: string[];
  skillLevel: 'beginner' | 'intermediate' | 'expert';
}

import { useAuth } from '../contexts/AuthContext';

interface HomeScreenEpicProps {
  user?: User; // optional: will fallback to AuthContext if not provided
  onCategorySelect?: (category: string) => void;
  onStartLearning?: () => void;
}

export default function HomeScreenEpic({
  user,
  onCategorySelect,
  onStartLearning,
}: HomeScreenEpicProps) {
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const particleAnim = useRef(new Animated.Value(0)).current;

  // Categories with professional gradients
  const categories = [
    {
      id: 'javascript',
      name: 'JavaScript',
      icon: '⚡',
      gradient: [themeColors.primary[600], themeColors.primary[700]], // Unified brand gradient
      questions: 150,
      difficulty: 'Beginner',
      color: '#1d4ed8',
    },
    {
      id: 'react',
      name: 'React',
      icon: '⚛️',
      gradient: [themeColors.primary[600], themeColors.primary[700]], // Unified brand gradient
      questions: 200,
      difficulty: 'Intermediate',
      color: '#0d9488',
    },
    {
      id: 'typescript',
      name: 'TypeScript',
      icon: '🔷',
      gradient: [themeColors.primary[600], themeColors.primary[700]], // Unified brand gradient
      questions: 180,
      difficulty: 'Advanced',
      color: '#7c3aed',
    },
    {
      id: 'nodejs',
      name: 'Node.js',
      icon: '🟢',
      gradient: [themeColors.primary[600], themeColors.primary[700]], // Unified brand gradient
      questions: 120,
      difficulty: 'Intermediate',
      color: '#059669',
    },
  ];

  const { user: authUser, signInWithGitHub } = useAuth();

  // Map context user to local User shape if prop not provided
  const derivedUser: User =
    user ||
    ({
      id: authUser?.id || 'guest',
      name: authUser?.name || authUser?.email?.split('@')[0] || 'Guest',
      email: authUser?.email || 'guest@quizmentor.local',
      level: Number(authUser?.metadata?.level ?? 1),
      xp: Number(authUser?.metadata?.xp ?? 0),
      streak: Number(authUser?.metadata?.streak ?? 0),
      interests: [],
      skillLevel: 'intermediate',
    } as User);

  // Start animations
  useEffect(() => {
    const animations = [
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ];

    Animated.parallel(animations).start();

    // Start particle animation
    Animated.loop(
      Animated.timing(particleAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      }),
    ).start();

    // Start pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  const handleCategoryPress = (categoryId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onCategorySelect?.(categoryId);
  };

  const handleStartLearning = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onStartLearning?.();
  };

  return (
    <View style={styles.container}>
      {/* Professional Animated Background */}
      <LinearGradient
        colors={themeColors.gradients.dark}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Floating Particles */}
      <Animated.View style={[styles.particlesContainer, { opacity: particleAnim }]}>
        {[...Array(20)].map((_, i) => (
          <Animated.View
            key={i}
            style={[
              styles.particle,
              {
                left: Math.random() * width,
                top: Math.random() * height,
                backgroundColor: ['#ffffff40', '#4f46e520', '#7c3aed30', '#1d4ed820'][i % 4], // Subtle professional particles
                animationDelay: `${Math.random() * 3}s`,
              },
            ]}
          />
        ))}
      </Animated.View>

      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header */}
          <Animated.View
            style={[
              styles.header,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.userInfo}>
              <Animated.View
                style={[styles.avatarContainer, { transform: [{ scale: pulseAnim }] }]}
              >
                <LinearGradient
                  colors={[themeColors.primary[600], themeColors.primary[700]]}
                  style={styles.avatar}
                >
                  <MaterialCommunityIcons name="brain" size={40} color="#FFFFFF" />
                </LinearGradient>
              </Animated.View>
              <View style={styles.userText}>
                <Text style={styles.welcomeText}>Welcome back!</Text>
                <Text style={styles.userName}>{derivedUser.name}</Text>
                <View style={styles.statsRow}>
                  <View style={styles.stat}>
                    <Text style={styles.statValue}>Level {derivedUser.level}</Text>
                    <Text style={styles.statLabel}>Level</Text>
                  </View>
                  <View style={styles.stat}>
                    <Text style={styles.statValue}>{derivedUser.xp} XP</Text>
                    <Text style={styles.statLabel}>Experience</Text>
                  </View>
                  <View style={styles.stat}>
                    <Text style={styles.statValue}>🔥 {derivedUser.streak}</Text>
                    <Text style={styles.statLabel}>Streak</Text>
                  </View>
                </View>
              </View>
            </View>
          </Animated.View>

          {/* Main Content */}
          <Animated.View
            style={[
              styles.mainContent,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
              },
            ]}
          >
            {/* Auth CTA if not signed in */}
            {!authUser && (
              <View style={styles.authCta}>
                <Text style={styles.authCtaText}>
                  Sign in to sync your progress and unlock achievements
                </Text>
                <TouchableOpacity onPress={() => signInWithGitHub()} style={styles.authCtaButton}>
                  <LinearGradient
                    colors={[themeColors.primary[500], themeColors.primary[700]]}
                    style={styles.authCtaGradient}
                  >
                    <Text style={styles.authCtaButtonText}>Sign in with GitHub</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}

            {/* Hero Section */}
            <View style={styles.heroSection}>
              <Text style={styles.heroTitle}>Level Up Your Skills</Text>
              <Text style={styles.heroSubtitle}>
                Master programming with interactive quizzes and challenges
              </Text>

              <TouchableOpacity
                style={styles.startButton}
                onPress={handleStartLearning}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={[themeColors.primary[500], themeColors.primary[700]]}
                  style={styles.startButtonGradient}
                >
                  <Text style={styles.startButtonText}>🚀 Start Learning</Text>
                  <MaterialCommunityIcons name="rocket-launch" size={24} color="#FFFFFF" />
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Categories */}
            <View style={styles.categoriesSection}>
              <Text style={styles.sectionTitle}>Choose Your Path</Text>
              <View style={styles.categoriesGrid}>
                {categories.map((category, index) => (
                  <Animated.View
                    key={category.id}
                    style={[
                      styles.categoryCard,
                      {
                        opacity: fadeAnim,
                        transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
                      },
                    ]}
                  >
                    <TouchableOpacity
                      style={styles.categoryButton}
                      onPress={() => handleCategoryPress(category.id)}
                      activeOpacity={0.8}
                    >
                      <LinearGradient colors={category.gradient} style={styles.categoryGradient}>
                        <Text style={styles.categoryIcon}>{category.icon}</Text>
                        <Text style={styles.categoryName}>{category.name}</Text>
                        <Text style={styles.categoryQuestions}>{category.questions} questions</Text>
                        <View style={styles.difficultyBadge}>
                          <Text style={styles.difficultyText}>{category.difficulty}</Text>
                        </View>
                      </LinearGradient>
                    </TouchableOpacity>
                  </Animated.View>
                ))}
              </View>
            </View>

            {/* Quick Actions */}
            <View style={styles.quickActionsSection}>
              <Text style={styles.sectionTitle}>Quick Actions</Text>
              <View style={styles.quickActionsGrid}>
                <TouchableOpacity style={styles.quickActionButton}>
                  <LinearGradient
                    colors={[themeColors.primary[600], themeColors.primary[700]]}
                    style={styles.quickActionGradient}
                  >
                    <MaterialCommunityIcons name="trophy" size={24} color="#FFFFFF" />
                    <Text style={styles.quickActionText}>Leaderboard</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity style={styles.quickActionButton}>
                  <LinearGradient
                    colors={[themeColors.primary[600], themeColors.primary[700]]}
                    style={styles.quickActionGradient}
                  >
                    <MaterialCommunityIcons name="star" size={24} color="#FFFFFF" />
                    <Text style={styles.quickActionText}>Achievements</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity style={styles.quickActionButton}>
                  <LinearGradient
                    colors={[themeColors.primary[600], themeColors.primary[700]]}
                    style={styles.quickActionGradient}
                  >
                    <MaterialCommunityIcons name="cog" size={24} color="#FFFFFF" />
                    <Text style={styles.quickActionText}>Settings</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  particlesContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
  particle: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    opacity: 0.6,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: 15,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  userText: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  mainContent: {
    paddingHorizontal: 20,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  startButton: {
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  startButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginRight: 8,
  },
  categoriesSection: {
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: '48%',
    marginBottom: 16,
  },
  categoryButton: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  categoryGradient: {
    padding: 20,
    alignItems: 'center',
    minHeight: 140,
  },
  categoryIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  categoryQuestions: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 12,
  },
  difficultyBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  quickActionsSection: {
    marginBottom: 20,
  },
  authCta: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  authCtaText: {
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 12,
    fontSize: 14,
    textAlign: 'center',
  },
  authCtaButton: {
    borderRadius: 12,
    overflow: 'hidden',
    alignSelf: 'center',
  },
  authCtaGradient: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  authCtaButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickActionButton: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  quickActionGradient: {
    padding: 16,
    alignItems: 'center',
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 8,
  },
});
