// src/screens/HomeScreenAnimated.tsx
import React, { useState, useEffect, useRef, useMemo } from 'react';
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

const { width, height } = Dimensions.get('window');

// Portfolio-inspired floating particles system
const FloatingParticles: React.FC = () => {
  const particles = useMemo(() => {
    return [...Array(25)].map((_, i) => ({
      id: `particle-${i}`,
      initialX: Math.random() * width,
      initialY: Math.random() * height,
      targetX: Math.random() * width,
      targetY: Math.random() * height,
      duration: Math.random() * 15000 + 10000, // 10-25 seconds
      size: Math.random() * 4 + 2, // 2-6px
      opacity: Math.random() * 0.6 + 0.2, // 0.2-0.8
    }));
  }, []);

  const blobs = useMemo(() => {
    return [...Array(6)].map((_, i) => ({
      id: `blob-${i}`,
      initialX: Math.random() * width - 100,
      initialY: Math.random() * height - 100,
      targetX: Math.random() * width - 100,
      targetY: Math.random() * height - 100,
      duration: Math.random() * 25000 + 20000, // 20-45 seconds
      size: Math.random() * 150 + 100, // 100-250px
    }));
  }, []);

  const particleAnims = useRef(
    particles.map(() => ({
      x: new Animated.Value(0),
      y: new Animated.Value(0),
      opacity: new Animated.Value(0),
    })),
  ).current;

  const blobAnims = useRef(
    blobs.map(() => ({
      x: new Animated.Value(0),
      y: new Animated.Value(0),
      scale: new Animated.Value(0.8),
    })),
  ).current;

  useEffect(() => {
    // Animate particles
    particles.forEach((particle, index) => {
      const anim = particleAnims[index];

      // Set initial position
      anim.x.setValue(particle.initialX);
      anim.y.setValue(particle.initialY);

      // Start continuous animation
      const animateParticle = () => {
        Animated.parallel([
          Animated.timing(anim.x, {
            toValue: particle.targetX,
            duration: particle.duration,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(anim.y, {
            toValue: particle.targetY,
            duration: particle.duration,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(anim.opacity, {
              toValue: particle.opacity,
              duration: particle.duration * 0.1,
              useNativeDriver: true,
            }),
            Animated.timing(anim.opacity, {
              toValue: particle.opacity * 0.3,
              duration: particle.duration * 0.8,
              useNativeDriver: true,
            }),
            Animated.timing(anim.opacity, {
              toValue: 0,
              duration: particle.duration * 0.1,
              useNativeDriver: true,
            }),
          ]),
        ]).start(() => {
          // Reset to new random positions and repeat
          particle.targetX = Math.random() * width;
          particle.targetY = Math.random() * height;
          anim.x.setValue(particle.initialX);
          anim.y.setValue(particle.initialY);
          animateParticle();
        });
      };

      // Start with random delay
      setTimeout(animateParticle, Math.random() * 5000);
    });

    // Animate blobs
    blobs.forEach((blob, index) => {
      const anim = blobAnims[index];

      anim.x.setValue(blob.initialX);
      anim.y.setValue(blob.initialY);

      const animateBlob = () => {
        Animated.parallel([
          Animated.timing(anim.x, {
            toValue: blob.targetX,
            duration: blob.duration,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(anim.y, {
            toValue: blob.targetY,
            duration: blob.duration,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.loop(
            Animated.sequence([
              Animated.timing(anim.scale, {
                toValue: 1.1,
                duration: blob.duration * 0.3,
                easing: Easing.inOut(Easing.sin),
                useNativeDriver: true,
              }),
              Animated.timing(anim.scale, {
                toValue: 0.9,
                duration: blob.duration * 0.4,
                easing: Easing.inOut(Easing.sin),
                useNativeDriver: true,
              }),
              Animated.timing(anim.scale, {
                toValue: 1.0,
                duration: blob.duration * 0.3,
                easing: Easing.inOut(Easing.sin),
                useNativeDriver: true,
              }),
            ]),
          ),
        ]).start(() => {
          // Reset to new positions
          blob.targetX = Math.random() * width - 100;
          blob.targetY = Math.random() * height - 100;
          anim.x.setValue(blob.initialX);
          anim.y.setValue(blob.initialY);
          animateBlob();
        });
      };

      setTimeout(animateBlob, Math.random() * 3000);
    });
  }, []);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* Blue gradient background */}
      <LinearGradient
        colors={[
          'rgba(102, 126, 234, 0.05)',
          'rgba(118, 75, 162, 0.03)',
          'rgba(102, 126, 234, 0.05)',
        ]}
        style={StyleSheet.absoluteFill}
      />

      {/* Small blue particles */}
      {particles.map((particle, index) => (
        <Animated.View
          key={particle.id}
          style={[
            styles.particle,
            {
              width: particle.size,
              height: particle.size,
              borderRadius: particle.size / 2,
              transform: [
                { translateX: particleAnims[index].x },
                { translateY: particleAnims[index].y },
              ],
              opacity: particleAnims[index].opacity,
            },
          ]}
        />
      ))}

      {/* Large blue blobs */}
      {blobs.map((blob, index) => (
        <Animated.View
          key={blob.id}
          style={[
            styles.blob,
            {
              width: blob.size,
              height: blob.size,
              borderRadius: blob.size / 2,
              transform: [
                { translateX: blobAnims[index].x },
                { translateY: blobAnims[index].y },
                { scale: blobAnims[index].scale },
              ],
            },
          ]}
        />
      ))}
    </View>
  );
};

// Enhanced category card with better animations
const CategoryCard: React.FC<{
  category: any;
  index: number;
  onPress: () => void;
  isSelected: boolean;
}> = ({ category, index, onPress, isSelected }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Staggered entrance animation
    Animated.sequence([
      Animated.delay(index * 150),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Continuous glow animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000 + index * 200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2000 + index * 200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  const handlePress = () => {
    // Press animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1.05,
        tension: 100,
        friction: 3,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    onPress();
  };

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  return (
    <Animated.View
      style={[
        styles.categoryCardContainer,
        {
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <TouchableOpacity
        style={[styles.categoryCard, isSelected && styles.categoryCardSelected]}
        onPress={handlePress}
        activeOpacity={0.9}
      >
        {/* Glow effect */}
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            styles.categoryGlow,
            {
              opacity: glowOpacity,
              backgroundColor: category.color + '20',
            },
          ]}
        />

        {/* Icon with floating animation */}
        <Animated.View style={[styles.categoryIconContainer]}>
          <View style={[styles.categoryIcon, { backgroundColor: category.color + '20' }]}>
            <Text style={styles.categoryEmoji}>{category.icon}</Text>
          </View>
        </Animated.View>

        <View style={styles.categoryInfo}>
          <Text style={styles.categoryName}>{category.name}</Text>
          <Text style={styles.categoryQuestions}>{category.questions} questions</Text>

          {/* Animated progress bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <Animated.View
                style={[
                  styles.progressFill,
                  {
                    width: `${category.completionRate || 0}%`,
                    backgroundColor: category.color,
                  },
                ]}
              />
            </View>
            <Text style={styles.progressText}>{category.completionRate || 0}% avg</Text>
          </View>
        </View>

        {/* Trending indicator */}
        {category.trending && (
          <View style={styles.trendingBadge}>
            <MaterialCommunityIcons name="trending-up" size={12} color="#FF6B6B" />
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

// Main component
export default function HomeScreenAnimated() {
  const navigation = useNavigation();
  const auth = useAuth();
  const [showMockLogin, setShowMockLogin] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Enhanced animations
  const headerScale = useRef(new Animated.Value(0.8)).current;
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const contentSlide = useRef(new Animated.Value(50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Categories with enhanced data
  const categories = [
    {
      id: 'javascript',
      name: 'JavaScript',
      icon: '🟨',
      color: '#F7DF1E',
      questions: 150,
      completionRate: 78,
      trending: true,
    },
    {
      id: 'react',
      name: 'React',
      icon: '⚛️',
      color: '#61DAFB',
      questions: 120,
      completionRate: 85,
      trending: true,
    },
    {
      id: 'nodejs',
      name: 'Node.js',
      icon: '🟢',
      color: '#339933',
      questions: 90,
      completionRate: 72,
      trending: false,
    },
    {
      id: 'typescript',
      name: 'TypeScript',
      icon: '🔷',
      color: '#3178C6',
      questions: 80,
      completionRate: 68,
      trending: true,
    },
    {
      id: 'python',
      name: 'Python',
      icon: '🐍',
      color: '#3776AB',
      questions: 110,
      completionRate: 81,
      trending: false,
    },
    {
      id: 'css',
      name: 'CSS',
      icon: '🎨',
      color: '#1572B6',
      questions: 75,
      completionRate: 89,
      trending: false,
    },
  ];

  useEffect(() => {
    // Entrance animation sequence
    Animated.sequence([
      Animated.parallel([
        Animated.spring(headerScale, {
          toValue: 1,
          tension: 20,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(headerOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
      Animated.spring(contentSlide, {
        toValue: 0,
        tension: 20,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Continuous pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.02,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  const handleCategoryPress = (category: any) => {
    if (!auth.isAuthenticated) {
      setShowMockLogin(true);
      return;
    }

    setSelectedCategory(category.id);
    navigation.navigate('Quiz' as never, { category: category.name } as never);
  };

  const handleMultiplayerPress = () => {
    if (!auth.isAuthenticated) {
      setShowMockLogin(true);
      return;
    }
    navigation.navigate('MultiplayerLobby' as never);
  };

  return (
    <SafeAreaView style={styles.container}>
      <FloatingParticles />

      <Animated.View style={[styles.content, { transform: [{ scale: pulseAnim }] }]}>
        {/* Enhanced Header */}
        <Animated.View
          style={[
            styles.header,
            {
              opacity: headerOpacity,
              transform: [{ scale: headerScale }],
            },
          ]}
        >
          <LinearGradient
            colors={['#667eea', '#764ba2', '#667eea']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerGradient}
          >
            <View style={styles.headerContent}>
              <View>
                <Text style={styles.headerTitle}>QuizMentor</Text>
                <Text style={styles.headerSubtitle}>
                  {auth.isAuthenticated
                    ? `Welcome back, ${auth.user?.profile?.display_name || 'Developer'}! 🚀`
                    : 'Master Programming Skills with AI-Powered Learning'}
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
                <TouchableOpacity style={styles.loginButton} onPress={() => setShowMockLogin(true)}>
                  <MaterialCommunityIcons name="rocket-launch" size={20} color="#fff" />
                  <Text style={styles.loginText}>Get Started</Text>
                </TouchableOpacity>
              )}
            </View>
          </LinearGradient>
        </Animated.View>

        <ScrollView
          style={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContainer}
        >
          <Animated.View
            style={[styles.mainContent, { transform: [{ translateY: contentSlide }] }]}
          >
            {/* Quick Actions */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🎯 Quick Start</Text>
              <View style={styles.quickActions}>
                <TouchableOpacity
                  style={styles.quickAction}
                  onPress={handleMultiplayerPress}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#FF6B6B', '#FF8E53', '#FFB74D']}
                    style={styles.quickActionGradient}
                  >
                    <MaterialCommunityIcons name="sword-cross" size={32} color="#fff" />
                    <Text style={styles.quickActionTitle}>Battle Mode</Text>
                    <Text style={styles.quickActionSubtitle}>Real-time multiplayer</Text>
                    <View style={styles.quickActionBadge}>
                      <Text style={styles.badgeText}>HOT</Text>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.quickAction}
                  onPress={() => handleCategoryPress(categories[0])}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#4ECDC4', '#44A08D', '#2E8B57']}
                    style={styles.quickActionGradient}
                  >
                    <MaterialCommunityIcons name="brain" size={32} color="#fff" />
                    <Text style={styles.quickActionTitle}>Solo Quest</Text>
                    <Text style={styles.quickActionSubtitle}>Personal growth</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>

            {/* Categories Grid */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🚀 Choose Your Path</Text>
              <View style={styles.categoriesGrid}>
                {categories.map((category, index) => (
                  <CategoryCard
                    key={category.id}
                    category={category}
                    index={index}
                    onPress={() => handleCategoryPress(category)}
                    isSelected={selectedCategory === category.id}
                  />
                ))}
              </View>
            </View>

            {/* Spacer for ecosystem widget */}
            <View style={{ height: 120 }} />
          </Animated.View>
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
    backgroundColor: '#0a0a0f',
  },
  content: {
    flex: 1,
  },
  header: {
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  headerGradient: {
    padding: 24,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
    fontWeight: '500',
  },
  profileButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  profileInitial: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  loginText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  scrollContent: {
    flex: 1,
  },
  scrollContainer: {
    paddingBottom: 40,
  },
  mainContent: {
    flex: 1,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 16,
  },
  quickAction: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  quickActionGradient: {
    padding: 24,
    alignItems: 'center',
    position: 'relative',
    minHeight: 140,
    justifyContent: 'center',
  },
  quickActionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 12,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  quickActionSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
    fontWeight: '500',
  },
  quickActionBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'space-between',
  },
  categoryCardContainer: {
    width: (width - 52) / 2,
  },
  categoryCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    minHeight: 160,
  },
  categoryCardSelected: {
    borderColor: '#667eea',
    borderWidth: 2,
  },
  categoryGlow: {
    borderRadius: 20,
  },
  categoryIconContainer: {
    marginBottom: 16,
  },
  categoryIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryEmoji: {
    fontSize: 32,
  },
  categoryInfo: {
    alignItems: 'center',
    flex: 1,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
    textAlign: 'center',
  },
  categoryQuestions: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 12,
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 3,
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '500',
  },
  trendingBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(255, 107, 107, 0.2)',
    padding: 4,
    borderRadius: 8,
  },
  // Particle styles
  particle: {
    position: 'absolute',
    backgroundColor: '#667eea',
  },
  blob: {
    position: 'absolute',
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
  },
});
