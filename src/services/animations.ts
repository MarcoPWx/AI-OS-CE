// src/services/animations.ts
import { Animated, Easing, Dimensions } from 'react-native';
import LottieView from 'lottie-react-native';
import { Haptics } from 'expo-haptics';

const { width, height } = Dimensions.get('window');

// Animation Presets
export const AnimationPresets = {
  // Entrance animations
  fadeInUp: {
    from: { opacity: 0, translateY: 20 },
    to: { opacity: 1, translateY: 0 },
    duration: 400,
    easing: Easing.out(Easing.cubic),
  },

  slideInRight: {
    from: { translateX: width },
    to: { translateX: 0 },
    duration: 350,
    easing: Easing.out(Easing.cubic),
  },

  bounceIn: {
    from: { scale: 0.3, opacity: 0 },
    to: { scale: 1, opacity: 1 },
    duration: 600,
    easing: Easing.out(Easing.back(1.7)),
  },

  // Feedback animations
  shake: {
    sequence: [
      { translateX: -10, duration: 50 },
      { translateX: 10, duration: 50 },
      { translateX: -10, duration: 50 },
      { translateX: 10, duration: 50 },
      { translateX: 0, duration: 50 },
    ],
  },

  pulse: {
    sequence: [
      { scale: 1, duration: 200 },
      { scale: 1.1, duration: 200 },
      { scale: 1, duration: 200 },
    ],
  },

  // Reward animations
  coinFlip: {
    from: { rotateY: '0deg' },
    to: { rotateY: '360deg' },
    duration: 800,
    easing: Easing.inOut(Easing.cubic),
  },

  starBurst: {
    from: { scale: 0, opacity: 0, rotate: '0deg' },
    to: { scale: 1.5, opacity: 0, rotate: '180deg' },
    duration: 1000,
    easing: Easing.out(Easing.cubic),
  },
};

// Lottie Animation Assets
export const LottieAnimations = {
  levelUp: require('../../assets/lottie/level-up.json'),
  achievement: require('../../assets/lottie/achievement.json'),
  streak: require('../../assets/lottie/fire-streak.json'),
  coins: require('../../assets/lottie/coins.json'),
  confetti: require('../../assets/lottie/confetti.json'),
  trophy: require('../../assets/lottie/trophy.json'),
  star: require('../../assets/lottie/star.json'),
  explosion: require('../../assets/lottie/explosion.json'),
  checkmark: require('../../assets/lottie/checkmark.json'),
  error: require('../../assets/lottie/error.json'),
};

class AnimationService {
  private static instance: AnimationService;
  private activeAnimations: Map<string, Animated.Value> = new Map();

  static getInstance(): AnimationService {
    if (!AnimationService.instance) {
      AnimationService.instance = new AnimationService();
    }
    return AnimationService.instance;
  }

  // Create and manage animation values
  createAnimationValue(key: string, initialValue: number = 0): Animated.Value {
    if (!this.activeAnimations.has(key)) {
      this.activeAnimations.set(key, new Animated.Value(initialValue));
    }
    return this.activeAnimations.get(key)!;
  }

  // XP Counter Animation
  animateXPCounter(
    animatedValue: Animated.Value,
    fromValue: number,
    toValue: number,
    duration: number = 1500,
    onUpdate?: (value: number) => void,
  ): Animated.CompositeAnimation {
    return Animated.timing(animatedValue, {
      toValue,
      duration,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start(() => {
      if (onUpdate) {
        animatedValue.addListener(({ value }) => onUpdate(value));
      }
    });
  }

  // Level Up Animation Sequence
  createLevelUpAnimation(): {
    scaleAnim: Animated.Value;
    rotateAnim: Animated.Value;
    glowAnim: Animated.Value;
    start: () => void;
  } {
    const scaleAnim = new Animated.Value(0);
    const rotateAnim = new Animated.Value(0);
    const glowAnim = new Animated.Value(0);

    const start = () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      Animated.parallel([
        // Scale animation
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.3,
            duration: 400,
            easing: Easing.out(Easing.back(2)),
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]),

        // Rotation animation
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),

        // Glow pulse
        Animated.loop(
          Animated.sequence([
            Animated.timing(glowAnim, {
              toValue: 1,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(glowAnim, {
              toValue: 0,
              duration: 1000,
              useNativeDriver: true,
            }),
          ]),
          { iterations: 3 },
        ),
      ]).start();
    };

    return { scaleAnim, rotateAnim, glowAnim, start };
  }

  // Combo Animation
  createComboAnimation(multiplier: number): {
    scaleAnim: Animated.Value;
    opacityAnim: Animated.Value;
    translateYAnim: Animated.Value;
    start: () => void;
  } {
    const scaleAnim = new Animated.Value(0.5);
    const opacityAnim = new Animated.Value(0);
    const translateYAnim = new Animated.Value(20);

    const start = () => {
      // Haptic intensity based on combo
      const impactStyle =
        multiplier > 3 ? Haptics.ImpactFeedbackStyle.Heavy : Haptics.ImpactFeedbackStyle.Medium;

      Haptics.impactAsync(impactStyle);

      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1 + multiplier * 0.1,
          tension: 40,
          friction: 3,
          useNativeDriver: true,
        }),

        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),

        Animated.spring(translateYAnim, {
          toValue: 0,
          tension: 40,
          friction: 6,
          useNativeDriver: true,
        }),
      ]).start();

      // Fade out after display
      setTimeout(() => {
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 300,
          delay: 1000,
          useNativeDriver: true,
        }).start();
      }, 1500);
    };

    return { scaleAnim, opacityAnim, translateYAnim, start };
  }

  // Streak Fire Animation
  createStreakAnimation(streakCount: number): {
    fireScale: Animated.Value;
    fireIntensity: Animated.Value;
    numberScale: Animated.Value;
    start: () => void;
  } {
    const fireScale = new Animated.Value(0.8);
    const fireIntensity = new Animated.Value(0.5);
    const numberScale = new Animated.Value(0);

    const start = () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      Animated.parallel([
        // Fire grows with streak
        Animated.spring(fireScale, {
          toValue: Math.min(1 + streakCount * 0.02, 2),
          tension: 20,
          friction: 4,
          useNativeDriver: true,
        }),

        // Fire intensity
        Animated.loop(
          Animated.sequence([
            Animated.timing(fireIntensity, {
              toValue: 1,
              duration: 500 - streakCount * 2, // Faster with higher streak
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
            Animated.timing(fireIntensity, {
              toValue: 0.5,
              duration: 500 - streakCount * 2,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
          ]),
        ),

        // Number pop
        Animated.spring(numberScale, {
          toValue: 1,
          tension: 50,
          friction: 3,
          useNativeDriver: true,
        }),
      ]).start();
    };

    return { fireScale, fireIntensity, numberScale, start };
  }

  // Achievement Unlock Animation
  createAchievementAnimation(): {
    containerScale: Animated.Value;
    badgeRotate: Animated.Value;
    shimmer: Animated.Value;
    particles: Animated.Value[];
    start: () => void;
  } {
    const containerScale = new Animated.Value(0);
    const badgeRotate = new Animated.Value(0);
    const shimmer = new Animated.Value(0);
    const particles = Array(8)
      .fill(0)
      .map(() => ({
        x: new Animated.Value(0),
        y: new Animated.Value(0),
        opacity: new Animated.Value(1),
      }));

    const start = () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Main badge animation
      Animated.sequence([
        Animated.spring(containerScale, {
          toValue: 1.2,
          tension: 20,
          friction: 4,
          useNativeDriver: true,
        }),
        Animated.spring(containerScale, {
          toValue: 1,
          tension: 40,
          friction: 6,
          useNativeDriver: true,
        }),
      ]).start();

      // Badge rotation
      Animated.timing(badgeRotate, {
        toValue: 1,
        duration: 1000,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();

      // Shimmer effect
      Animated.loop(
        Animated.timing(shimmer, {
          toValue: 1,
          duration: 2000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ).start();

      // Particle explosion
      particles.forEach((particle, index) => {
        const angle = (index / particles.length) * Math.PI * 2;
        const distance = 100 + Math.random() * 50;

        Animated.parallel([
          Animated.timing(particle.x, {
            toValue: Math.cos(angle) * distance,
            duration: 1000,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(particle.y, {
            toValue: Math.sin(angle) * distance,
            duration: 1000,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(particle.opacity, {
            toValue: 0,
            duration: 1000,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]).start();
      });
    };

    return {
      containerScale,
      badgeRotate,
      shimmer,
      particles: particles.map((p) => p as any),
      start,
    };
  }

  // Coin Collection Animation
  createCoinAnimation(coinCount: number): {
    coins: Array<{
      translateY: Animated.Value;
      translateX: Animated.Value;
      opacity: Animated.Value;
      scale: Animated.Value;
    }>;
    start: (onComplete?: () => void) => void;
  } {
    const coins = Array(coinCount)
      .fill(0)
      .map(() => ({
        translateY: new Animated.Value(0),
        translateX: new Animated.Value((Math.random() - 0.5) * 100),
        opacity: new Animated.Value(0),
        scale: new Animated.Value(0),
      }));

    const start = (onComplete?: () => void) => {
      const animations = coins.map((coin, index) => {
        return Animated.sequence([
          Animated.delay(index * 50),
          Animated.parallel([
            // Appear
            Animated.timing(coin.opacity, {
              toValue: 1,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.spring(coin.scale, {
              toValue: 1,
              tension: 40,
              friction: 4,
              useNativeDriver: true,
            }),
          ]),
          // Float up
          Animated.parallel([
            Animated.timing(coin.translateY, {
              toValue: -200,
              duration: 800,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            }),
            Animated.timing(coin.translateX, {
              toValue: 0,
              duration: 800,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
            Animated.timing(coin.opacity, {
              toValue: 0,
              duration: 800,
              delay: 400,
              useNativeDriver: true,
            }),
          ]),
        ]);
      });

      Animated.parallel(animations).start(() => {
        if (onComplete) onComplete();
      });

      // Haptic feedback for each coin
      coins.forEach((_, index) => {
        setTimeout(() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }, index * 50);
      });
    };

    return { coins, start };
  }

  // Progress Bar Fill Animation
  createProgressAnimation(
    progress: Animated.Value,
    toValue: number,
    duration: number = 1000,
  ): Animated.CompositeAnimation {
    return Animated.timing(progress, {
      toValue,
      duration,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    });
  }

  // Wrong Answer Shake
  createShakeAnimation(translateX: Animated.Value): Animated.CompositeAnimation {
    return Animated.sequence([
      Animated.timing(translateX, {
        toValue: -10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(translateX, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(translateX, {
        toValue: -10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(translateX, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(translateX, {
        toValue: 0,
        duration: 50,
        useNativeDriver: true,
      }),
    ]);
  }

  // Correct Answer Bounce
  createBounceAnimation(scale: Animated.Value): Animated.CompositeAnimation {
    return Animated.sequence([
      Animated.spring(scale, {
        toValue: 1.2,
        tension: 20,
        friction: 3,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        tension: 40,
        friction: 4,
        useNativeDriver: true,
      }),
    ]);
  }

  // Power-Up Activation
  createPowerUpAnimation(): {
    scale: Animated.Value;
    rotate: Animated.Value;
    glow: Animated.Value;
    start: () => void;
  } {
    const scale = new Animated.Value(1);
    const rotate = new Animated.Value(0);
    const glow = new Animated.Value(0);

    const start = () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

      Animated.parallel([
        // Pulse scale
        Animated.sequence([
          Animated.timing(scale, {
            toValue: 1.5,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),

        // Spin
        Animated.timing(rotate, {
          toValue: 1,
          duration: 600,
          easing: Easing.linear,
          useNativeDriver: true,
        }),

        // Glow effect
        Animated.sequence([
          Animated.timing(glow, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(glow, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    };

    return { scale, rotate, glow, start };
  }

  // Daily Reward Claim
  createDailyRewardAnimation(dayNumber: number): {
    containerScale: Animated.Value;
    giftOpen: Animated.Value;
    rewards: Animated.Value[];
    confetti: Animated.Value;
    start: () => void;
  } {
    const containerScale = new Animated.Value(0.8);
    const giftOpen = new Animated.Value(0);
    const rewards = Array(3)
      .fill(0)
      .map(() => new Animated.Value(0));
    const confetti = new Animated.Value(0);

    const start = () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      Animated.sequence([
        // Container appear
        Animated.spring(containerScale, {
          toValue: 1,
          tension: 20,
          friction: 4,
          useNativeDriver: true,
        }),

        // Gift opens
        Animated.timing(giftOpen, {
          toValue: 1,
          duration: 500,
          easing: Easing.out(Easing.back(1.5)),
          useNativeDriver: true,
        }),

        // Rewards fly out
        Animated.stagger(
          100,
          rewards.map((reward) =>
            Animated.spring(reward, {
              toValue: 1,
              tension: 30,
              friction: 5,
              useNativeDriver: true,
            }),
          ),
        ),

        // Confetti explosion
        Animated.timing(confetti, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ]).start();
    };

    return { containerScale, giftOpen, rewards, confetti, start };
  }

  // Leaderboard Rank Change
  createRankChangeAnimation(direction: 'up' | 'down'): {
    translateY: Animated.Value;
    color: Animated.Value;
    scale: Animated.Value;
    start: () => void;
  } {
    const translateY = new Animated.Value(0);
    const color = new Animated.Value(0);
    const scale = new Animated.Value(1);

    const start = () => {
      const isUp = direction === 'up';

      Haptics.impactAsync(
        isUp ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light,
      );

      Animated.parallel([
        Animated.timing(translateY, {
          toValue: isUp ? -20 : 20,
          duration: 300,
          useNativeDriver: true,
        }),

        Animated.timing(color, {
          toValue: isUp ? 1 : -1,
          duration: 300,
          useNativeDriver: false,
        }),

        Animated.sequence([
          Animated.timing(scale, {
            toValue: 1.2,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 1,
            duration: 150,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    };

    return { translateY, color, scale, start };
  }

  // Question Timer Warning
  createTimerWarningAnimation(): {
    scale: Animated.Value;
    color: Animated.Value;
    start: () => void;
  } {
    const scale = new Animated.Value(1);
    const color = new Animated.Value(0);

    const start = () => {
      Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(scale, {
              toValue: 1.1,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.timing(color, {
              toValue: 1,
              duration: 500,
              useNativeDriver: false,
            }),
          ]),
          Animated.parallel([
            Animated.timing(scale, {
              toValue: 1,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.timing(color, {
              toValue: 0,
              duration: 500,
              useNativeDriver: false,
            }),
          ]),
        ]),
      ).start();

      // Haptic pulse
      const interval = setInterval(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }, 1000);

      return () => clearInterval(interval);
    };

    return { scale, color, start };
  }

  // Cleanup
  cleanup() {
    this.activeAnimations.forEach((anim) => {
      anim.stopAnimation();
      anim.removeAllListeners();
    });
    this.activeAnimations.clear();
  }
}

export default AnimationService.getInstance();

// Export types
export type { AnimationService };
