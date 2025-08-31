/**
 * Modern UI Component Library for QuizMentor
 * Fully animated, accessible, and beautiful components
 */

import React, { useRef, useEffect, ReactNode } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  Platform,
  AccessibilityRole,
  GestureResponderEvent,
  Pressable,
  ScrollView,
} from 'react-native';
import { theme } from '../../design/theme';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

// Conditional import for BlurView (not supported on web)
let BlurView: any;
try {
  BlurView = require('expo-blur').BlurView;
} catch (e) {
  // BlurView not available on web
  BlurView = null;
}

// Types
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  onPress?: (event: GestureResponderEvent) => void;
  disabled?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  children: ReactNode;
  accessibilityLabel?: string;
  haptic?: boolean;
  animated?: boolean;
  style?: ViewStyle;
}

interface CardProps {
  variant?: 'default' | 'elevated' | 'outlined' | 'gradient';
  padding?: keyof typeof theme.spacing;
  onPress?: () => void;
  children: ReactNode;
  style?: ViewStyle;
  animated?: boolean;
  gradientColors?: string[];
}

interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  icon?: ReactNode;
  animated?: boolean;
  pulse?: boolean;
}

interface ProgressBarProps {
  value: number;
  max?: number;
  variant?: 'default' | 'gradient' | 'segmented';
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  showLabel?: boolean;
  gradientColors?: string[];
}

// Modern Button Component
export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  onPress,
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  children,
  accessibilityLabel,
  haptic = true,
  animated = true,
  style,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (animated && !disabled) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 0.96,
          useNativeDriver: true,
          speed: 50,
          bounciness: 0,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.8,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  const handlePressOut = () => {
    if (animated && !disabled) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          speed: 50,
          bounciness: 5,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  const handlePress = (event: GestureResponderEvent) => {
    if (haptic && Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress?.(event);
  };

  const variantStyles = {
    primary: {
      backgroundColor: theme.colors.primary[600],
      color: '#ffffff',
    },
    secondary: {
      backgroundColor: theme.colors.neutral[200],
      color: theme.colors.neutral[900],
    },
    ghost: {
      backgroundColor: 'transparent',
      color: theme.colors.neutral[700],
    },
    danger: {
      backgroundColor: theme.colors.semantic.error,
      color: '#ffffff',
    },
    success: {
      backgroundColor: theme.colors.semantic.success,
      color: '#ffffff',
    },
  };

  const sizeStyles = {
    sm: {
      height: theme.components.button.height.sm,
      paddingHorizontal: theme.components.button.padding.sm.x,
      fontSize: theme.components.button.fontSize.sm,
    },
    md: {
      height: theme.components.button.height.md,
      paddingHorizontal: theme.components.button.padding.md.x,
      fontSize: theme.components.button.fontSize.md,
    },
    lg: {
      height: theme.components.button.height.lg,
      paddingHorizontal: theme.components.button.padding.lg.x,
      fontSize: theme.components.button.fontSize.lg,
    },
    xl: {
      height: theme.components.button.height.xl,
      paddingHorizontal: theme.components.button.padding.xl.x,
      fontSize: theme.components.button.fontSize.xl,
    },
  };

  const currentVariant = variantStyles[variant];
  const currentSize = sizeStyles[size];

  return (
    <Animated.View
      style={[
        {
          transform: [{ scale: scaleAnim }],
          opacity: disabled ? 0.5 : opacityAnim,
        },
        fullWidth && { width: '100%' },
      ]}
    >
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        accessibilityRole="button"
        accessibilityLabel={
          accessibilityLabel || (typeof children === 'string' ? children : undefined)
        }
        accessibilityState={{ disabled: disabled || loading }}
        style={[
          {
            height: currentSize.height,
            paddingHorizontal: currentSize.paddingHorizontal,
            backgroundColor: currentVariant.backgroundColor,
            borderRadius: theme.borderRadius.base,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            ...theme.shadows.base,
          },
          style,
        ]}
      >
        {loading ? (
          <ActivityIndicator size="small" color={currentVariant.color} />
        ) : (
          <>
            {icon && iconPosition === 'left' && (
              <View style={{ marginRight: theme.spacing[2] }}>{icon}</View>
            )}
            <Text
              style={{
                color: currentVariant.color,
                fontSize: currentSize.fontSize,
                fontWeight: theme.typography.fontWeight.semibold,
              }}
            >
              {children}
            </Text>
            {icon && iconPosition === 'right' && (
              <View style={{ marginLeft: theme.spacing[2] }}>{icon}</View>
            )}
          </>
        )}
      </Pressable>
    </Animated.View>
  );
};

// Modern Card Component
export const Card: React.FC<CardProps> = ({
  variant = 'default',
  padding = 4,
  onPress,
  children,
  style,
  animated = true,
  gradientColors = [theme.colors.primary[400], theme.colors.primary[600]],
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const elevationAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animated) {
      Animated.timing(elevationAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, []);

  const handlePressIn = () => {
    if (animated && onPress) {
      Animated.spring(scaleAnim, {
        toValue: 0.98,
        useNativeDriver: true,
        speed: 50,
        bounciness: 0,
      }).start();
    }
  };

  const handlePressOut = () => {
    if (animated && onPress) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        speed: 50,
        bounciness: 5,
      }).start();
    }
  };

  const baseStyle: ViewStyle = {
    padding: theme.spacing[padding],
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.background.elevated,
  };

  const variantStyles: Record<string, ViewStyle> = {
    default: {
      ...baseStyle,
      ...theme.shadows.base,
    },
    elevated: {
      ...baseStyle,
      ...theme.shadows.lg,
    },
    outlined: {
      ...baseStyle,
      borderWidth: 1,
      borderColor: theme.colors.neutral[200],
      backgroundColor: 'transparent',
    },
    gradient: {
      ...baseStyle,
      overflow: 'hidden',
    },
  };

  const content = (
    <Animated.View
      style={[
        variantStyles[variant],
        {
          transform: [
            { scale: scaleAnim },
            {
              translateY: elevationAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [10, 0],
              }),
            },
          ],
          opacity: elevationAnim,
        },
        style,
      ]}
    >
      {variant === 'gradient' ? (
        <LinearGradient colors={gradientColors} style={StyleSheet.absoluteFillObject} />
      ) : null}
      {children}
    </Animated.View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={() => {
          if (Platform.OS !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
          onPress();
        }}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        {content}
      </Pressable>
    );
  }

  return content;
};

// Modern Badge Component
export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  size = 'md',
  children,
  icon,
  animated = true,
  pulse = false,
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (animated) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 3,
      }).start();
    }

    if (pulse) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    }
  }, []);

  const variantColors = {
    default: {
      backgroundColor: theme.colors.neutral[200],
      color: theme.colors.neutral[700],
    },
    success: {
      backgroundColor: theme.colors.accent.green + '20',
      color: theme.colors.accent.green,
    },
    warning: {
      backgroundColor: theme.colors.accent.yellow + '20',
      color: theme.colors.accent.yellow,
    },
    error: {
      backgroundColor: theme.colors.accent.red + '20',
      color: theme.colors.accent.red,
    },
    info: {
      backgroundColor: theme.colors.accent.blue + '20',
      color: theme.colors.accent.blue,
    },
  };

  const sizeStyles = {
    sm: {
      paddingHorizontal: theme.spacing[2],
      paddingVertical: theme.spacing[1],
      fontSize: theme.typography.fontSize.xs,
    },
    md: {
      paddingHorizontal: theme.spacing[3],
      paddingVertical: theme.spacing[1],
      fontSize: theme.typography.fontSize.sm,
    },
    lg: {
      paddingHorizontal: theme.spacing[4],
      paddingVertical: theme.spacing[2],
      fontSize: theme.typography.fontSize.base,
    },
  };

  const currentVariant = variantColors[variant];
  const currentSize = sizeStyles[size];

  return (
    <Animated.View
      style={{
        transform: [{ scale: animated ? scaleAnim : 1 }, { scale: pulse ? pulseAnim : 1 }],
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: currentVariant.backgroundColor,
          paddingHorizontal: currentSize.paddingHorizontal,
          paddingVertical: currentSize.paddingVertical,
          borderRadius: theme.borderRadius.full,
        }}
      >
        {icon && <View style={{ marginRight: theme.spacing[1] }}>{icon}</View>}
        <Text
          style={{
            color: currentVariant.color,
            fontSize: currentSize.fontSize,
            fontWeight: theme.typography.fontWeight.semibold,
          }}
        >
          {children}
        </Text>
      </View>
    </Animated.View>
  );
};

// Modern Progress Bar Component
export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  variant = 'default',
  size = 'md',
  animated = true,
  showLabel = false,
  gradientColors = [theme.colors.primary[400], theme.colors.primary[600]],
}) => {
  const widthAnim = useRef(new Animated.Value(0)).current;
  const percentage = Math.min(Math.max(0, (value / max) * 100), 100);

  useEffect(() => {
    if (animated) {
      Animated.timing(widthAnim, {
        toValue: percentage,
        duration: 500,
        useNativeDriver: false,
      }).start();
    } else {
      widthAnim.setValue(percentage);
    }
  }, [value, max]);

  const sizeStyles = {
    sm: { height: 4 },
    md: { height: 8 },
    lg: { height: 12 },
  };

  const currentSize = sizeStyles[size];

  return (
    <View>
      <View
        style={{
          height: currentSize.height,
          backgroundColor: theme.colors.neutral[200],
          borderRadius: theme.borderRadius.full,
          overflow: 'hidden',
        }}
      >
        <Animated.View
          style={{
            height: '100%',
            width: animated
              ? widthAnim.interpolate({
                  inputRange: [0, 100],
                  outputRange: ['0%', '100%'],
                })
              : `${percentage}%`,
            borderRadius: theme.borderRadius.full,
          }}
        >
          {variant === 'gradient' ? (
            <LinearGradient
              colors={gradientColors}
              style={StyleSheet.absoluteFillObject}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />
          ) : (
            <View
              style={{
                flex: 1,
                backgroundColor: theme.colors.primary[600],
              }}
            />
          )}
        </Animated.View>
      </View>
      {showLabel && (
        <Text
          style={{
            marginTop: theme.spacing[1],
            fontSize: theme.typography.fontSize.sm,
            color: theme.colors.neutral[600],
            textAlign: 'center',
          }}
        >
          {Math.round(percentage)}%
        </Text>
      )}
    </View>
  );
};

// Glass Morphism Container
export const GlassCard: React.FC<{
  children: ReactNode;
  intensity?: number;
  style?: ViewStyle;
}> = ({ children, intensity = 20, style }) => {
  if (Platform.OS === 'web' || !BlurView) {
    return (
      <View
        style={[
          {
            backgroundColor: 'rgba(255, 255, 255, 0.85)',
            borderRadius: theme.borderRadius.lg,
            padding: theme.spacing[4],
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.2)',
            ...theme.shadows.base,
          },
          style,
        ]}
      >
        {children}
      </View>
    );
  }

  return (
    <BlurView
      intensity={intensity}
      style={[
        {
          borderRadius: theme.borderRadius.lg,
          padding: theme.spacing[4],
          overflow: 'hidden',
        },
        style,
      ]}
    >
      {children}
    </BlurView>
  );
};

// Skeleton Loader
export const Skeleton: React.FC<{
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}> = ({ width = '100%', height = 20, borderRadius = theme.borderRadius.base, style }) => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }),
    ).start();
  }, []);

  return (
    <View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: theme.colors.neutral[200],
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <Animated.View
        style={{
          ...StyleSheet.absoluteFillObject,
          backgroundColor: theme.colors.neutral[100],
          opacity: shimmerAnim.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [0, 1, 0],
          }),
        }}
      />
    </View>
  );
};

// Floating Action Button
export const FAB: React.FC<{
  onPress: () => void;
  icon: ReactNode;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  style?: ViewStyle;
}> = ({ onPress, icon, position = 'bottom-right', style }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 40,
        friction: 3,
      }),
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const positionStyles = {
    'bottom-right': { bottom: theme.spacing[6], right: theme.spacing[6] },
    'bottom-left': { bottom: theme.spacing[6], left: theme.spacing[6] },
    'top-right': { top: theme.spacing[6], right: theme.spacing[6] },
    'top-left': { top: theme.spacing[6], left: theme.spacing[6] },
  };

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          width: 56,
          height: 56,
          transform: [
            { scale: scaleAnim },
            {
              rotate: rotateAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', '360deg'],
              }),
            },
          ],
          ...positionStyles[position],
        },
        style,
      ]}
    >
      <Pressable
        onPress={() => {
          if (Platform.OS !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          }
          onPress();
        }}
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: theme.colors.primary[600],
          borderRadius: 28,
          alignItems: 'center',
          justifyContent: 'center',
          ...theme.shadows.lg,
        }}
      >
        {icon}
      </Pressable>
    </Animated.View>
  );
};

export default {
  Button,
  Card,
  Badge,
  ProgressBar,
  GlassCard,
  Skeleton,
  FAB,
};
