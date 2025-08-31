// src/screens/HomeScreenGameified.tsx
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
import soundEffectsService from '../services/soundEffects';
import { ParticleExplosion, useParticleExplosion } from '../components/ParticleExplosion';

const { width, height } = Dimensions.get('window');

// Pokemon Go style floating coins and power-ups
const FloatingGameElements: React.FC = () => {
  const coins = useMemo(() => {
    return [...Array(15)].map((_, i) => ({
      id: `coin-${i}`,
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 20 + 15, // 15-35px
      rotation: Math.random() * 360,
      duration: Math.random() * 8000 + 6000, // 6-14 seconds
    }));
  }, []);

  const powerUps = useMemo(() => {
    return [...Array(8)].map((_, i) => ({
      id: `powerup-${i}`,
      x: Math.random() * width,
      y: Math.random() * height,
      emoji: ['⚡', '🔥', '💎', '🌟', '🚀', '💫', '✨', '🎯'][i],
      duration: Math.random() * 12000 + 8000,
    }));
  }, []);

  const coinAnims = useRef(
    coins.map(() => ({
      translateY: new Animated.Value(0),
      rotate: new Animated.Value(0),
      scale: new Animated.Value(0),
      opacity: new Animated.Value(0),
    })),
  ).current;

  const powerUpAnims = useRef(
    powerUps.map(() => ({
      translateY: new Animated.Value(0),
      scale: new Animated.Value(0),
      rotate: new Animated.Value(0),
      opacity: new Animated.Value(0),
    })),
  ).current;

  useEffect(() => {
    // Animate coins (Mario-style)
    coins.forEach((coin, index) => {
      const anim = coinAnims[index];

      const animateCoin = () => {
        // Reset position
        anim.translateY.setValue(-50);
        anim.scale.setValue(0);
        anim.opacity.setValue(0);

        Animated.sequence([
          // Appear with bounce
          Animated.parallel([
            Animated.spring(anim.scale, {
              toValue: 1,
              tension: 100,
              friction: 3,
              useNativeDriver: true,
            }),
            Animated.timing(anim.opacity, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            }),
          ]),
          // Float down slowly
          Animated.timing(anim.translateY, {
            toValue: height + 100,
            duration: coin.duration,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
        ]).start(() => {
          // Wait random time before next coin
          setTimeout(animateCoin, Math.random() * 5000 + 2000);
        });
      };

      // Continuous rotation
      Animated.loop(
        Animated.timing(anim.rotate, {
          toValue: 1,
          duration: 2000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ).start();

      // Start with random delay
      setTimeout(animateCoin, Math.random() * 3000);
    });

    // Animate power-ups (Sonic-style)
    powerUps.forEach((powerUp, index) => {
      const anim = powerUpAnims[index];

      const animatePowerUp = () => {
        anim.translateY.setValue(-50);
        anim.scale.setValue(0);
        anim.opacity.setValue(0);

        Animated.sequence([
          // Dramatic entrance
          Animated.parallel([
            Animated.spring(anim.scale, {
              toValue: 1.2,
              tension: 80,
              friction: 4,
              useNativeDriver: true,
            }),
            Animated.timing(anim.opacity, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }),
          ]),
          // Pulse while floating
          Animated.parallel([
            Animated.timing(anim.translateY, {
              toValue: height + 100,
              duration: powerUp.duration,
              easing: Easing.out(Easing.quad),
              useNativeDriver: true,
            }),
            Animated.loop(
              Animated.sequence([
                Animated.timing(anim.scale, {
                  toValue: 1.4,
                  duration: 800,
                  easing: Easing.inOut(Easing.sin),
                  useNativeDriver: true,
                }),
                Animated.timing(anim.scale, {
                  toValue: 1.2,
                  duration: 800,
                  easing: Easing.inOut(Easing.sin),
                  useNativeDriver: true,
                }),
              ]),
            ),
          ]),
        ]).start(() => {
          setTimeout(animatePowerUp, Math.random() * 8000 + 5000);
        });
      };

      // Rotation animation
      Animated.loop(
        Animated.timing(anim.rotate, {
          toValue: 1,
          duration: 3000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ).start();

      setTimeout(animatePowerUp, Math.random() * 5000);
    });
  }, []);

  const coinRotation = (index: number) =>
    coinAnims[index].rotate.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });

  const powerUpRotation = (index: number) =>
    powerUpAnims[index].rotate.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* Retro gaming gradient background */}
      <LinearGradient colors={['#1a1a2e', '#16213e', '#0f3460']} style={StyleSheet.absoluteFill} />

      {/* Floating coins */}
      {coins.map((coin, index) => (
        <Animated.View
          key={coin.id}
          style={[
            styles.coin,
            {
              left: coin.x,
              top: coin.y,
              width: coin.size,
              height: coin.size,
              transform: [
                { translateY: coinAnims[index].translateY },
                { scale: coinAnims[index].scale },
                { rotate: coinRotation(index) },
              ],
              opacity: coinAnims[index].opacity,
            },
          ]}
        >
          <Text style={[styles.coinText, { fontSize: coin.size * 0.6 }]}>💰</Text>
        </Animated.View>
      ))}

      {/* Power-ups */}
      {powerUps.map((powerUp, index) => (
        <Animated.View
          key={powerUp.id}
          style={[
            styles.powerUp,
            {
              left: powerUp.x,
              top: powerUp.y,
              transform: [
                { translateY: powerUpAnims[index].translateY },
                { scale: powerUpAnims[index].scale },
                { rotate: powerUpRotation(index) },
              ],
              opacity: powerUpAnims[index].opacity,
            },
          ]}
        >
          <Text style={styles.powerUpText}>{powerUp.emoji}</Text>
        </Animated.View>
      ))}
    </View>
  );
};

// Duolingo-style animated mascot
const DevMascot: React.FC<{ mood: 'happy' | 'excited' | 'thinking' }> = ({ mood }) => {
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const blinkAnim = useRef(new Animated.Value(1)).current;
  const wiggleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Continuous bounce
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: -10,
          duration: 1000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 1000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    ).start();

    // Random blinks
    const blink = () => {
      Animated.sequence([
        Animated.timing(blinkAnim, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(blinkAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setTimeout(blink, Math.random() * 3000 + 2000);
      });
    };
    setTimeout(blink, 2000);

    // Wiggle when excited
    if (mood === 'excited') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(wiggleAnim, {
            toValue: 5,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(wiggleAnim, {
            toValue: -5,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(wiggleAnim, {
            toValue: 0,
            duration: 100,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    }
  }, [mood]);

  const getMascotEmoji = () => {
    switch (mood) {
      case 'excited':
        return '🤖';
      case 'thinking':
        return '🧠';
      default:
        return '👨‍💻';
    }
  };

  return (
    <Animated.View
      style={[
        styles.mascot,
        {
          transform: [
            { translateY: bounceAnim },
            { translateX: wiggleAnim },
            { scaleY: blinkAnim },
          ],
        },
      ]}
    >
      <Text style={styles.mascotEmoji}>{getMascotEmoji()}</Text>
    </Animated.View>
  );
};

// Pokemon Go style category cards with catch animations
const GameCategoryCard: React.FC<{
  category: any;
  index: number;
  onPress: () => void;
  isSelected: boolean;
}> = ({ category, index, onPress, isSelected }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const sparkleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Pokemon Go entrance animation
    Animated.sequence([
      Animated.delay(index * 200),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 6,
        useNativeDriver: true,
      }),
    ]).start();

    // Continuous glow pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000 + index * 300,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2000 + index * 300,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    ).start();

    // Sparkle animation
    Animated.loop(
      Animated.timing(sparkleAnim, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();
  }, []);

  const handlePress = () => {
    // Play coin collect sound for category selection
    soundEffectsService.playEffect('coin_collect');

    // Pokemon catch animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1.1,
        tension: 100,
        friction: 3,
        useNativeDriver: true,
      }),
      // Shake effect
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: -5, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 5, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -5, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]),
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
    outputRange: [0.2, 0.8],
  });

  const sparkleRotation = sparkleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      style={[
        styles.gameCardContainer,
        {
          transform: [{ scale: scaleAnim }, { translateX: shakeAnim }],
        },
      ]}
    >
      <TouchableOpacity
        style={[styles.gameCard, isSelected && styles.gameCardSelected]}
        onPress={handlePress}
        activeOpacity={0.9}
      >
        {/* Glow effect */}
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            styles.cardGlow,
            {
              opacity: glowOpacity,
              backgroundColor: category.color + '30',
            },
          ]}
        />

        {/* Sparkle overlay */}
        <Animated.View
          style={[styles.sparkleOverlay, { transform: [{ rotate: sparkleRotation }] }]}
        >
          <Text style={styles.sparkle}>✨</Text>
        </Animated.View>

        {/* Main content */}
        <LinearGradient
          colors={[category.color + '20', category.color + '40', category.color + '20']}
          style={styles.cardGradient}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.gameCardEmoji}>{category.icon}</Text>
            {category.trending && (
              <View style={styles.trendingBadge}>
                <Text style={styles.trendingText}>🔥 HOT</Text>
              </View>
            )}
          </View>

          <Text style={styles.gameCardTitle}>{category.name}</Text>
          <Text style={styles.gameCardQuestions}>{category.questions} challenges</Text>

          {/* XP Bar (like Pokemon Go) */}
          <View style={styles.xpBarContainer}>
            <View style={styles.xpBar}>
              <Animated.View
                style={[
                  styles.xpBarFill,
                  {
                    width: `${category.completionRate || 0}%`,
                    backgroundColor: category.color,
                  },
                ]}
              />
            </View>
            <Text style={styles.xpText}>
              Level {Math.floor((category.completionRate || 0) / 10)}
            </Text>
          </View>

          {/* Power level indicator */}
          <View style={styles.powerLevel}>
            <MaterialCommunityIcons name="lightning-bolt" size={16} color="#FFD700" />
            <Text style={styles.powerText}>{category.completionRate || 0}% Mastery</Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Main component
export default function HomeScreenGameified() {
  const navigation = useNavigation();
  const auth = useAuth();
  const [showMockLogin, setShowMockLogin] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [mascotMood, setMascotMood] = useState<'happy' | 'excited' | 'thinking'>('happy');
  const { explosion, triggerExplosion, hideExplosion } = useParticleExplosion();

  // Game-style animations
  const logoAnim = useRef(new Animated.Value(0)).current;
  const titleAnim = useRef(new Animated.Value(0)).current;
  const contentAnim = useRef(new Animated.Value(50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Gaming categories with power levels
  const categories = [
    {
      id: 'javascript',
      name: 'JavaScript',
      icon: '⚡',
      color: '#F7DF1E',
      questions: 150,
      completionRate: 78,
      trending: true,
      difficulty: 'Beginner',
    },
    {
      id: 'react',
      name: 'React',
      icon: '⚛️',
      color: '#61DAFB',
      questions: 120,
      completionRate: 85,
      trending: true,
      difficulty: 'Intermediate',
    },
    {
      id: 'nodejs',
      name: 'Node.js',
      icon: '🚀',
      color: '#339933',
      questions: 90,
      completionRate: 72,
      trending: false,
      difficulty: 'Advanced',
    },
    {
      id: 'typescript',
      name: 'TypeScript',
      icon: '🛡️',
      color: '#3178C6',
      questions: 80,
      completionRate: 68,
      trending: true,
      difficulty: 'Expert',
    },
    {
      id: 'python',
      name: 'Python',
      icon: '🐍',
      color: '#3776AB',
      questions: 110,
      completionRate: 81,
      trending: false,
      difficulty: 'Intermediate',
    },
    {
      id: 'css',
      name: 'CSS',
      icon: '🎨',
      color: '#1572B6',
      questions: 75,
      completionRate: 89,
      trending: false,
      difficulty: 'Beginner',
    },
  ];

  useEffect(() => {
    // Initialize sound effects
    soundEffectsService.initialize();

    // Epic game startup sequence
    Animated.sequence([
      // Logo bounce in
      Animated.spring(logoAnim, {
        toValue: 1,
        tension: 40,
        friction: 6,
        useNativeDriver: true,
      }),
      // Title slide in
      Animated.spring(titleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      // Content reveal
      Animated.spring(contentAnim, {
        toValue: 0,
        tension: 30,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Play welcome sound after animations complete
      soundEffectsService.playEffect('power_up');

      // Trigger celebration particles at center of screen
      setTimeout(() => {
        triggerExplosion(width / 2, height / 3, 'celebration');
      }, 500);
    });

    // Continuous pulse for excitement
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.02,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    ).start();

    // Change mascot mood periodically
    const moodInterval = setInterval(() => {
      const moods: ('happy' | 'excited' | 'thinking')[] = ['happy', 'excited', 'thinking'];
      const newMood = moods[Math.floor(Math.random() * moods.length)];
      setMascotMood(newMood);

      // Play mascot interaction sound
      soundEffectsService.playMascotInteraction(newMood);
    }, 5000);

    return () => clearInterval(moodInterval);
  }, []);

  const handleCategoryPress = (category: any) => {
    if (!auth.isAuthenticated) {
      setShowMockLogin(true);
      soundEffectsService.playEffect('button_tap');
      return;
    }

    setSelectedCategory(category.id);
    setMascotMood('excited');

    // Play category selection sound
    soundEffectsService.playEffect('power_up');

    navigation.navigate('Quiz' as never, { category: category.name } as never);
  };

  const handleMultiplayerPress = () => {
    if (!auth.isAuthenticated) {
      setShowMockLogin(true);
      soundEffectsService.playEffect('button_tap');
      return;
    }
    setMascotMood('excited');

    // Play battle sound for multiplayer
    soundEffectsService.playEffect('achievement_unlock');

    navigation.navigate('MultiplayerLobby' as never);
  };

  const logoScale = logoAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 1],
  });

  const titleTranslateY = titleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [30, 0],
  });

  return (
    <SafeAreaView style={styles.container}>
      <FloatingGameElements />

      <Animated.View style={[styles.content, { transform: [{ scale: pulseAnim }] }]}>
        {/* Epic Gaming Header */}
        <View style={styles.header}>
          <LinearGradient
            colors={['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerGradient}
          >
            <View style={styles.headerContent}>
              <View style={styles.titleSection}>
                <Animated.View
                  style={[styles.logoContainer, { transform: [{ scale: logoScale }] }]}
                >
                  <Text style={styles.logo}>🎮</Text>
                </Animated.View>
                <Animated.View
                  style={[styles.titleContainer, { transform: [{ translateY: titleTranslateY }] }]}
                >
                  <Text style={styles.gameTitle}>QuizMentor</Text>
                  <Text style={styles.gameSubtitle}>
                    {auth.isAuthenticated
                      ? `Level up, ${auth.user?.profile?.display_name || 'Player'}! 🚀`
                      : 'Ready Player One? 🎯'}
                  </Text>
                </Animated.View>
              </View>

              <View style={styles.headerActions}>
                <DevMascot mood={mascotMood} />
                {auth.isAuthenticated ? (
                  <TouchableOpacity
                    style={styles.profileButton}
                    onPress={() => navigation.navigate('Profile' as never)}
                  >
                    <LinearGradient colors={['#FFD700', '#FFA500']} style={styles.profileGradient}>
                      <Text style={styles.profileInitial}>
                        {auth.user?.profile?.display_name?.charAt(0) || 'P'}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={styles.startButton}
                    onPress={() => setShowMockLogin(true)}
                  >
                    <LinearGradient colors={['#FF6B6B', '#FF8E53']} style={styles.startGradient}>
                      <MaterialCommunityIcons name="rocket-launch" size={24} color="#fff" />
                      <Text style={styles.startText}>START!</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </LinearGradient>
        </View>

        <ScrollView
          style={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContainer}
        >
          <Animated.View style={[styles.mainContent, { transform: [{ translateY: contentAnim }] }]}>
            {/* Battle Mode Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>⚔️ BATTLE ARENA</Text>
              <View style={styles.battleSection}>
                <TouchableOpacity
                  style={styles.battleCard}
                  onPress={handleMultiplayerPress}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#FF416C', '#FF4B2B', '#FF6B35']}
                    style={styles.battleGradient}
                  >
                    <View style={styles.battleHeader}>
                      <Text style={styles.battleEmoji}>⚔️</Text>
                      <View style={styles.battleBadge}>
                        <Text style={styles.battleBadgeText}>LIVE</Text>
                      </View>
                    </View>
                    <Text style={styles.battleTitle}>MULTIPLAYER DUEL</Text>
                    <Text style={styles.battleSubtitle}>Challenge developers worldwide!</Text>
                    <View style={styles.battleStats}>
                      <Text style={styles.battleStat}>👥 1,247 online</Text>
                      <Text style={styles.battleStat}>🏆 Win streak: 0</Text>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>

            {/* Quest Categories */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🗺️ CHOOSE YOUR QUEST</Text>
              <View style={styles.categoriesGrid}>
                {categories.map((category, index) => (
                  <GameCategoryCard
                    key={category.id}
                    category={category}
                    index={index}
                    onPress={() => handleCategoryPress(category)}
                    isSelected={selectedCategory === category.id}
                  />
                ))}
              </View>
            </View>

            {/* Daily Challenges */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📅 DAILY CHALLENGES</Text>
              <View style={styles.dailyChallenge}>
                <LinearGradient colors={['#667eea', '#764ba2']} style={styles.challengeGradient}>
                  <View style={styles.challengeContent}>
                    <Text style={styles.challengeEmoji}>🎯</Text>
                    <View style={styles.challengeInfo}>
                      <Text style={styles.challengeTitle}>Master 10 React Questions</Text>
                      <Text style={styles.challengeReward}>Reward: 500 XP + 🏆 Achievement</Text>
                      <View style={styles.challengeProgress}>
                        <View style={styles.challengeProgressBar}>
                          <View style={[styles.challengeProgressFill, { width: '30%' }]} />
                        </View>
                        <Text style={styles.challengeProgressText}>3/10</Text>
                      </View>
                    </View>
                  </View>
                </LinearGradient>
              </View>
            </View>

            {/* Ecosystem Widget Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🌟 ECOSYSTEM</Text>
              <View style={styles.ecosystemContainer}>
                <EcosystemWidget currentProduct="quizmentor" position="embedded" theme="dark" />
              </View>
            </View>

            {/* Spacer for bottom navigation */}
            <View style={{ height: 40 }} />
          </Animated.View>
        </ScrollView>
      </Animated.View>

      {/* Mock Login Panel */}
      {showMockLogin && <MockLoginPanel onClose={() => setShowMockLogin(false)} />}

      {/* Particle Explosion Effects */}
      <ParticleExplosion
        visible={explosion.visible}
        centerX={explosion.centerX}
        centerY={explosion.centerY}
        type={explosion.type}
        onComplete={hideExplosion}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f23',
  },
  content: {
    flex: 1,
  },
  header: {
    margin: 16,
    borderRadius: 25,
    overflow: 'hidden',
    elevation: 12,
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
  },
  headerGradient: {
    padding: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logoContainer: {
    marginRight: 16,
  },
  logo: {
    fontSize: 48,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  titleContainer: {
    flex: 1,
  },
  gameTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  gameSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  mascot: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mascotEmoji: {
    fontSize: 40,
  },
  profileButton: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  profileGradient: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInitial: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  startButton: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  startGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  startText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
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
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  battleSection: {
    alignItems: 'center',
  },
  battleCard: {
    width: '100%',
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#FF416C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  battleGradient: {
    padding: 24,
    alignItems: 'center',
  },
  battleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 12,
  },
  battleEmoji: {
    fontSize: 40,
  },
  battleBadge: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  battleBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  battleTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  battleSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 16,
  },
  battleStats: {
    flexDirection: 'row',
    gap: 20,
  },
  battleStat: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'space-between',
  },
  gameCardContainer: {
    width: (width - 52) / 2,
  },
  gameCard: {
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    position: 'relative',
  },
  gameCardSelected: {
    elevation: 12,
    shadowOpacity: 0.5,
  },
  cardGlow: {
    borderRadius: 20,
  },
  sparkleOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 2,
  },
  sparkle: {
    fontSize: 16,
  },
  cardGradient: {
    padding: 16,
    minHeight: 180,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  gameCardEmoji: {
    fontSize: 36,
  },
  trendingBadge: {
    backgroundColor: 'rgba(255, 107, 107, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  trendingText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: 'bold',
  },
  gameCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  gameCardQuestions: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 12,
  },
  xpBarContainer: {
    marginBottom: 8,
  },
  xpBar: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 4,
    marginBottom: 4,
  },
  xpBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  xpText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
  },
  powerLevel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  powerText: {
    fontSize: 11,
    color: '#FFD700',
    fontWeight: 'bold',
  },
  dailyChallenge: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  challengeGradient: {
    padding: 20,
  },
  challengeContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  challengeEmoji: {
    fontSize: 40,
    marginRight: 16,
  },
  challengeInfo: {
    flex: 1,
  },
  challengeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  challengeReward: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 12,
  },
  challengeProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  challengeProgressBar: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 3,
  },
  challengeProgressFill: {
    height: '100%',
    backgroundColor: '#FFD700',
    borderRadius: 3,
  },
  challengeProgressText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
  },
  ecosystemContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  // Floating elements
  coin: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coinText: {
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  powerUp: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: 30,
    height: 30,
  },
  powerUpText: {
    fontSize: 24,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});
