import React, { useRef, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withDelay,
  interpolate,
  Extrapolate,
  runOnJS,
  FadeIn,
  FadeOut,
  SlideInRight,
  SlideOutLeft,
  ZoomIn,
  BounceIn,
  useAnimatedGestureHandler,
  useAnimatedScrollHandler,
} from 'react-native-reanimated';
import { PanGestureHandler, TapGestureHandler, State } from 'react-native-gesture-handler';
import LinearGradient from 'react-native-linear-gradient';
import Haptics from 'react-native-haptic-feedback';
import { BlurView } from '@react-native-community/blur';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Premium Color Palette
export const Colors = {
  primary: '#667EEA',
  secondary: '#764BA2',
  success: '#84FAB0',
  error: '#EF4444',
  warning: '#F59E0B',
  dark: '#0A0A0B',
  light: '#FFFFFF',
  glass: 'rgba(255, 255, 255, 0.1)',
};

// Animation configs
const springConfig = {
  damping: 15,
  stiffness: 150,
  mass: 1,
};

const hapticOptions = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
};

// ============= PREMIUM BUTTON COMPONENT =============
interface PremiumButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'small' | 'medium' | 'large';
}

export const PremiumButton: React.FC<PremiumButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
}) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = () => {
    'worklet';
    scale.value = withSpring(0.96, springConfig);
    opacity.value = withTiming(0.8, { duration: 100 });
    runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
  };

  const handlePressOut = () => {
    'worklet';
    scale.value = withSpring(1, springConfig);
    opacity.value = withTiming(1, { duration: 100 });
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return { paddingHorizontal: 16, paddingVertical: 8, fontSize: 14 };
      case 'large':
        return { paddingHorizontal: 32, paddingVertical: 16, fontSize: 18 };
      default:
        return { paddingHorizontal: 24, paddingVertical: 12, fontSize: 16 };
    }
  };

  const sizeStyles = getSizeStyles();

  if (variant === 'primary') {
    return (
      <TapGestureHandler
        onHandlerStateChange={({ nativeEvent }) => {
          if (nativeEvent.state === State.BEGAN) handlePressIn();
          if (nativeEvent.state === State.END) {
            handlePressOut();
            runOnJS(onPress)();
          }
        }}
      >
        <Animated.View style={[animatedStyle, styles.buttonShadow]}>
          <LinearGradient
            colors={[Colors.primary, Colors.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              styles.button,
              {
                paddingHorizontal: sizeStyles.paddingHorizontal,
                paddingVertical: sizeStyles.paddingVertical,
              },
            ]}
          >
            <Text style={[styles.buttonText, { fontSize: sizeStyles.fontSize }]}>{title}</Text>
          </LinearGradient>
        </Animated.View>
      </TapGestureHandler>
    );
  }

  return (
    <TouchableOpacity
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Animated.View style={[styles.ghostButton, animatedStyle, sizeStyles]}>
        <Text style={[styles.ghostButtonText, { fontSize: sizeStyles.fontSize }]}>{title}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

// ============= GLASS CARD COMPONENT =============
interface GlassCardProps {
  children: React.ReactNode;
  style?: any;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, style }) => {
  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: translateY.value }],
  }));

  React.useEffect(() => {
    scale.value = withSpring(1, springConfig);
    translateY.value = withSpring(0, springConfig);
  }, []);

  return (
    <Animated.View
      entering={FadeIn.duration(300).springify()}
      style={[styles.glassCard, animatedStyle, style]}
    >
      {Platform.OS === 'ios' && (
        <BlurView
          style={StyleSheet.absoluteFillObject}
          blurType="light"
          blurAmount={20}
          reducedTransparencyFallbackColor="white"
        />
      )}
      <View style={styles.glassCardContent}>{children}</View>
    </Animated.View>
  );
};

// ============= LIQUID PROGRESS BAR =============
interface LiquidProgressProps {
  progress: number; // 0-100
  height?: number;
  colors?: string[];
}

export const LiquidProgress: React.FC<LiquidProgressProps> = ({
  progress,
  height = 8,
  colors = [Colors.primary, Colors.secondary],
}) => {
  const width = useSharedValue(0);
  const wave = useSharedValue(0);

  useEffect(() => {
    width.value = withSpring((progress / 100) * SCREEN_WIDTH * 0.9, springConfig);
    wave.value = withSequence(withTiming(1, { duration: 300 }), withTiming(0, { duration: 300 }));
  }, [progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: width.value,
    transform: [
      {
        scaleY: interpolate(wave.value, [0, 0.5, 1], [1, 1.2, 1], Extrapolate.CLAMP),
      },
    ],
  }));

  return (
    <View style={[styles.progressContainer, { height }]}>
      <Animated.View style={[styles.progressBar, animatedStyle]}>
        <LinearGradient
          colors={colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFillObject}
        />
      </Animated.View>
    </View>
  );
};

// ============= FLOATING ACTION BUTTON =============
interface FABProps {
  icon: string;
  onPress: () => void;
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
}

export const FloatingActionButton: React.FC<FABProps> = ({
  icon,
  onPress,
  position = 'bottom-right',
}) => {
  const scale = useSharedValue(0);
  const rotation = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(1, { ...springConfig, damping: 10 });
    rotation.value = withSequence(
      withTiming(360, { duration: 500 }),
      withTiming(0, { duration: 0 }),
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { rotate: `${rotation.value}deg` }],
  }));

  const getPosition = () => {
    switch (position) {
      case 'bottom-left':
        return { bottom: 20, left: 20 };
      case 'bottom-center':
        return { bottom: 20, alignSelf: 'center' };
      default:
        return { bottom: 20, right: 20 };
    }
  };

  return (
    <Animated.View
      style={[styles.fab, getPosition(), animatedStyle]}
      entering={BounceIn.duration(600)}
    >
      <TouchableOpacity
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          scale.value = withSequence(
            withTiming(0.9, { duration: 100 }),
            withSpring(1, springConfig),
          );
          onPress();
        }}
        style={styles.fabTouchable}
      >
        <LinearGradient
          colors={['#FA709A', '#FEE140']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fabGradient}
        >
          <Text style={styles.fabIcon}>{icon}</Text>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ============= SWIPEABLE CARD =============
interface SwipeableCardProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
}

export const SwipeableCard: React.FC<SwipeableCardProps> = ({
  children,
  onSwipeLeft,
  onSwipeRight,
}) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const rotation = useSharedValue(0);
  const opacity = useSharedValue(1);

  const gestureHandler = useAnimatedGestureHandler({
    onStart: () => {
      runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
    },
    onActive: (event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
      rotation.value = interpolate(
        translateX.value,
        [-SCREEN_WIDTH / 2, SCREEN_WIDTH / 2],
        [-15, 15],
        Extrapolate.CLAMP,
      );
    },
    onEnd: () => {
      const shouldDismiss = Math.abs(translateX.value) > SCREEN_WIDTH * 0.3;

      if (shouldDismiss) {
        const direction = translateX.value > 0 ? 1 : -1;
        translateX.value = withSpring(direction * SCREEN_WIDTH);
        opacity.value = withTiming(0, { duration: 300 });

        if (direction > 0 && onSwipeRight) {
          runOnJS(onSwipeRight)();
        } else if (direction < 0 && onSwipeLeft) {
          runOnJS(onSwipeLeft)();
        }
      } else {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        rotation.value = withSpring(0);
      }
    },
  });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotation.value}deg` },
    ],
    opacity: opacity.value,
  }));

  return (
    <PanGestureHandler onGestureEvent={gestureHandler}>
      <Animated.View style={[styles.swipeableCard, animatedStyle]}>{children}</Animated.View>
    </PanGestureHandler>
  );
};

// ============= SHIMMER PLACEHOLDER =============
export const ShimmerPlaceholder: React.FC<{ width?: number; height?: number }> = ({
  width = SCREEN_WIDTH * 0.9,
  height = 20,
}) => {
  const shimmer = useSharedValue(0);

  useEffect(() => {
    shimmer.value = withRepeat(withTiming(1, { duration: 1500 }), -1, false);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(shimmer.value, [0, 1], [-width, width], Extrapolate.CLAMP),
      },
    ],
  }));

  return (
    <View style={[styles.shimmerContainer, { width, height }]}>
      <Animated.View style={[styles.shimmer, animatedStyle]}>
        <LinearGradient
          colors={['transparent', 'rgba(255,255,255,0.3)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFillObject}
        />
      </Animated.View>
    </View>
  );
};

// ============= STYLES =============
const styles = StyleSheet.create({
  // Button styles
  button: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: Colors.light,
    fontWeight: '600',
  },
  buttonShadow: {
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  ghostButton: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    backgroundColor: Colors.glass,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghostButtonText: {
    color: Colors.light,
    fontWeight: '500',
  },

  // Glass Card
  glassCard: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: Colors.glass,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  glassCardContent: {
    padding: 20,
  },

  // Progress Bar
  progressContainer: {
    width: SCREEN_WIDTH * 0.9,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },

  // FAB
  fab: {
    position: 'absolute',
    zIndex: 1000,
  },
  fabTouchable: {
    width: 56,
    height: 56,
    borderRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  fabGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabIcon: {
    fontSize: 24,
    color: Colors.light,
  },

  // Swipeable Card
  swipeableCard: {
    width: SCREEN_WIDTH * 0.9,
    alignSelf: 'center',
  },

  // Shimmer
  shimmerContainer: {
    backgroundColor: '#E0E0E0',
    overflow: 'hidden',
    borderRadius: 4,
  },
  shimmer: {
    width: '100%',
    height: '100%',
  },
});

export default {
  PremiumButton,
  GlassCard,
  LiquidProgress,
  FloatingActionButton,
  SwipeableCard,
  ShimmerPlaceholder,
};
