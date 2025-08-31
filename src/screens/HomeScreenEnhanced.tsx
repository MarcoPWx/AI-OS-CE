// src/screens/HomeScreenEnhanced.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
  Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../hooks/useAuth';
import { EcosystemWidget } from '../components/EcosystemWidget';
import { MockLoginPanel } from '../components/MockLoginPanel';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');

// Trust-building stats (inspired by Harvest.ai patterns)
const trustStats = {
  questionsAnswered: '2.3M+',
  learningHours: '45K+',
  skillsImproved: '89%',
  returningUsers: '92%',
};

// Categories with enhanced data
const categories = [
  {
    id: 'javascript',
    name: 'JavaScript',
    icon: '🟨',
    color: '#F7DF1E',
    questions: 150,
    difficulty: 'Beginner to Advanced',
    completionRate: 78,
    trending: true,
  },
  {
    id: 'react',
    name: 'React',
    icon: '⚛️',
    color: '#61DAFB',
    questions: 120,
    difficulty: 'Intermediate',
    completionRate: 85,
    trending: true,
  },
  {
    id: 'nodejs',
    name: 'Node.js',
    icon: '🟢',
    color: '#339933',
    questions: 90,
    difficulty: 'Intermediate',
    completionRate: 72,
    trending: false,
  },
  {
    id: 'typescript',
    name: 'TypeScript',
    icon: '🔷',
    color: '#3178C6',
    questions: 80,
    difficulty: 'Advanced',
    completionRate: 68,
    trending: true,
  },
  {
    id: 'python',
    name: 'Python',
    icon: '🐍',
    color: '#3776AB',
    questions: 110,
    difficulty: 'Beginner to Advanced',
    completionRate: 81,
    trending: false,
  },
  {
    id: 'css',
    name: 'CSS',
    icon: '🎨',
    color: '#1572B6',
    questions: 75,
    difficulty: 'Beginner',
    completionRate: 89,
    trending: false,
  },
];

// Particle system for background
const ParticleBackground: React.FC = () => {
  const particles = useRef<Animated.Value[]>([]);
  const particleOpacities = useRef<Animated.Value[]>([]);

  useEffect(() => {
    // Initialize 12 particles
    for (let i = 0; i < 12; i++) {
      particles.current[i] = new Animated.Value(Math.random() * width);
      particleOpacities.current[i] = new Animated.Value(Math.random() * 0.3);

      // Start floating animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(particles.current[i], {
            toValue: Math.random() * width,
            duration: 8000 + Math.random() * 4000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(particles.current[i], {
            toValue: Math.random() * width,
            duration: 8000 + Math.random() * 4000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
      ).start();

      // Opacity animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(particleOpacities.current[i], {
            toValue: 0.6,
            duration: 3000 + Math.random() * 2000,
            useNativeDriver: true,
          }),
          Animated.timing(particleOpacities.current[i], {
            toValue: 0.1,
            duration: 3000 + Math.random() * 2000,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    }
  }, []);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {particles.current.map((particle, index) => (
        <Animated.View
          key={index}
          style={[
            styles.particle,
            {
              opacity: particleOpacities.current[index],
              transform: [{ translateX: particle }, { translateY: (index * 60) % height }],
            },
          ]}
        />
      ))}
    </View>
  );
};

export default function HomeScreenEnhanced() {
  const navigation = useNavigation();
  const auth = useAuth();
  const [showMockLogin, setShowMockLogin] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Enhanced Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const headerScale = useRef(new Animated.Value(0.9)).current;
  const statsOpacity = useRef(new Animated.Value(0)).current;
  const cardStagger = useRef(categories.map(() => new Animated.Value(0))).current;
  const breatheAnim = useRef(new Animated.Value(1)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance animation sequence
    Animated.sequence([
      // Header entrance
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(headerScale, {
          toValue: 1,
          tension: 20,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 20,
          friction: 7,
          useNativeDriver: true,
        }),
      ]),
      // Stats fade in
      Animated.timing(statsOpacity, {
        toValue: 1,
        duration: 600,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();

    // Staggered card animations
    cardStagger.forEach((anim, index) => {
      Animated.timing(anim, {
        toValue: 1,
        duration: 500,
        delay: 400 + index * 100,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    });

    // Continuous animations
    startContinuousAnimations();
  }, []);

  const startContinuousAnimations = () => {
    // Breathing effect
    Animated.loop(
      Animated.sequence([
        Animated.timing(breatheAnim, {
          toValue: 1.02,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(breatheAnim, {
          toValue: 1,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    ).start();

    // Shimmer effect
    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();
  };

  const handleCategoryPress = (category: any) => {
    if (!auth.isAuthenticated) {
      setShowMockLogin(true);
      return;
    }

    setSelectedCategory(category.id);

    // Selection animation
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0.7,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      navigation.navigate('Quiz' as never, { category: category.name } as never);
    });
  };

  const handleMultiplayerPress = () => {
    if (!auth.isAuthenticated) {
      setShowMockLogin(true);
      return;
    }
    navigation.navigate('MultiplayerLobby' as never);
  };

  const shimmerTranslate = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-100, 100],
  });

  return (
    <SafeAreaView style={styles.container}>
      <ParticleBackground />

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }, { scale: breatheAnim }],
          },
        ]}
      >
        {/* Enhanced Header */}
        <Animated.View style={[styles.header, { transform: [{ scale: headerScale }] }]}>
          <LinearGradient colors={['#667eea', '#764ba2']} style={styles.headerGradient}>
            <BlurView intensity={20} style={styles.headerBlur}>
              <View style={styles.headerContent}>
                <View>
                  <Text style={styles.headerTitle}>QuizMentor</Text>
                  <Text style={styles.headerSubtitle}>
                    {auth.isAuthenticated
                      ? `Welcome back, ${auth.user?.profile?.display_name || 'Developer'}!`
                      : 'Master Programming Skills with Confidence'}
                  </Text>
                </View>
                {auth.isAuthenticated ? (
                  <TouchableOpacity
                    style={styles.profileButton}
                    onPress={() => navigation.navigate('Profile' as never)}
                  >
                    <Text style={styles.profileInitial}>
                      {auth.user?.profile?.display_name?.charAt(0) || 'U'}
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={styles.loginButton}
                    onPress={() => setShowMockLogin(true)}
                  >
                    <MaterialCommunityIcons name="account-circle" size={20} color="#fff" />
                    <Text style={styles.loginText}>Login</Text>
                  </TouchableOpacity>
                )}
              </View>
            </BlurView>
          </LinearGradient>
        </Animated.View>

        <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Trust Stats */}
          <Animated.View style={[styles.trustStats, { opacity: statsOpacity }]}>
            <Text style={styles.trustTitle}>Trusted by Developers Worldwide</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{trustStats.questionsAnswered}</Text>
                <Text style={styles.statLabel}>Questions Answered</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{trustStats.learningHours}</Text>
                <Text style={styles.statLabel}>Learning Hours</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{trustStats.skillsImproved}</Text>
                <Text style={styles.statLabel}>Skills Improved</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{trustStats.returningUsers}</Text>
                <Text style={styles.statLabel}>Return Rate</Text>
              </View>
            </View>
          </Animated.View>

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Start</Text>
            <View style={styles.quickActions}>
              <TouchableOpacity
                style={[styles.quickAction, styles.multiplayerAction]}
                onPress={handleMultiplayerPress}
                activeOpacity={0.8}
              >
                <LinearGradient colors={['#FF6B6B', '#FF8E53']} style={styles.quickActionGradient}>
                  <MaterialCommunityIcons name="account-multiple" size={32} color="#fff" />
                  <Text style={styles.quickActionTitle}>Multiplayer</Text>
                  <Text style={styles.quickActionSubtitle}>Compete in real-time</Text>
                  <View style={styles.quickActionBadge}>
                    <Text style={styles.badgeText}>NEW</Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.quickAction, styles.practiceAction]}
                onPress={() => handleCategoryPress(categories[0])}
                activeOpacity={0.8}
              >
                <LinearGradient colors={['#4ECDC4', '#44A08D']} style={styles.quickActionGradient}>
                  <MaterialCommunityIcons name="brain" size={32} color="#fff" />
                  <Text style={styles.quickActionTitle}>Practice</Text>
                  <Text style={styles.quickActionSubtitle}>Solo learning</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>

          {/* Enhanced Categories */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Categories</Text>
            <View style={styles.categoriesGrid}>
              {categories.map((category, index) => {
                const cardTransform = cardStagger[index].interpolate({
                  inputRange: [0, 1],
                  outputRange: [50, 0],
                });

                return (
                  <Animated.View
                    key={category.id}
                    style={[
                      styles.categoryCardContainer,
                      {
                        opacity: cardStagger[index],
                        transform: [{ translateY: cardTransform }],
                      },
                    ]}
                  >
                    <TouchableOpacity
                      style={[
                        styles.categoryCard,
                        selectedCategory === category.id && styles.categoryCardSelected,
                      ]}
                      onPress={() => handleCategoryPress(category)}
                      activeOpacity={0.8}
                    >
                      {/* Shimmer overlay */}
                      <Animated.View
                        style={[
                          styles.shimmerOverlay,
                          { transform: [{ translateX: shimmerTranslate }] },
                        ]}
                        pointerEvents="none"
                      >
                        <LinearGradient
                          colors={['transparent', 'rgba(255,255,255,0.3)', 'transparent']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={StyleSheet.absoluteFill}
                        />
                      </Animated.View>

                      <View
                        style={[styles.categoryIcon, { backgroundColor: category.color + '20' }]}
                      >
                        <Text style={styles.categoryEmoji}>{category.icon}</Text>
                      </View>

                      <View style={styles.categoryInfo}>
                        <View style={styles.categoryHeader}>
                          <Text style={styles.categoryName}>{category.name}</Text>
                          {category.trending && (
                            <View style={styles.trendingBadge}>
                              <MaterialCommunityIcons
                                name="trending-up"
                                size={12}
                                color="#FF6B6B"
                              />
                            </View>
                          )}
                        </View>

                        <Text style={styles.categoryQuestions}>{category.questions} questions</Text>
                        <Text style={styles.categoryDifficulty}>{category.difficulty}</Text>

                        {/* Progress bar */}
                        <View style={styles.progressContainer}>
                          <View style={styles.progressBar}>
                            <View
                              style={[
                                styles.progressFill,
                                {
                                  width: `${category.completionRate}%`,
                                  backgroundColor: category.color,
                                },
                              ]}
                            />
                          </View>
                          <Text style={styles.progressText}>{category.completionRate}% avg</Text>
                        </View>
                      </View>

                      <View style={[styles.categoryAccent, { backgroundColor: category.color }]} />
                    </TouchableOpacity>
                  </Animated.View>
                );
              })}
            </View>
          </View>

          {/* Features with trust elements */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Why Developers Trust QuizMentor</Text>
            <View style={styles.featuresContainer}>
              <View style={styles.featureCard}>
                <MaterialCommunityIcons name="shield-check" size={24} color="#4ECDC4" />
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>Privacy First</Text>
                  <Text style={styles.featureDescription}>
                    Your learning data stays yours. No tracking, no ads, no data selling.
                  </Text>
                </View>
              </View>

              <View style={styles.featureCard}>
                <MaterialCommunityIcons name="lightning-bolt" size={24} color="#FFD700" />
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>Adaptive Learning</Text>
                  <Text style={styles.featureDescription}>
                    Questions adapt to your skill level. No time wasted on what you already know.
                  </Text>
                </View>
              </View>

              <View style={styles.featureCard}>
                <MaterialCommunityIcons name="trophy" size={24} color="#FF6B6B" />
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>Real Progress</Text>
                  <Text style={styles.featureDescription}>
                    Track genuine skill improvement, not just engagement metrics.
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Spacer for ecosystem widget */}
          <View style={{ height: 120 }} />
        </ScrollView>
      </Animated.View>

      {/* Enhanced Ecosystem Widget */}
      <EcosystemWidget currentProduct="quizmentor" position="bottom-right" theme="dark" />

      {/* Mock Login Panel */}
      {showMockLogin && <MockLoginPanel onClose={() => setShowMockLogin(false)} />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
  },
  header: {
    overflow: 'hidden',
  },
  headerGradient: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  headerBlur: {
    paddingHorizontal: 4,
    paddingVertical: 4,
    borderRadius: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInitial: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  loginText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  scrollContent: {
    flex: 1,
  },
  trustStats: {
    margin: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  trustTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  statItem: {
    width: '50%',
    alignItems: 'center',
    marginBottom: 12,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#667eea',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  quickAction: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  quickActionGradient: {
    padding: 20,
    alignItems: 'center',
    position: 'relative',
  },
  quickActionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 8,
  },
  quickActionSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  quickActionBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCardContainer: {
    width: (width - 52) / 2,
  },
  categoryCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
    overflow: 'hidden',
  },
  categoryCardSelected: {
    borderWidth: 2,
    borderColor: '#667eea',
  },
  shimmerOverlay: {
    position: 'absolute',
    top: 0,
    left: -100,
    right: -100,
    bottom: 0,
  },
  categoryIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    alignSelf: 'center',
  },
  categoryEmoji: {
    fontSize: 28,
  },
  categoryInfo: {
    alignItems: 'center',
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  trendingBadge: {
    marginLeft: 4,
    padding: 2,
  },
  categoryQuestions: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  categoryDifficulty: {
    fontSize: 11,
    color: '#888',
    marginBottom: 8,
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: '#f0f0f0',
    borderRadius: 2,
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 10,
    color: '#888',
  },
  categoryAccent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
  },
  featuresContainer: {
    gap: 12,
  },
  featureCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  featureContent: {
    flex: 1,
    marginLeft: 12,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  featureDescription: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  // Particle styles
  particle: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#667eea',
  },
});
