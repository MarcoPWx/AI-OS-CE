/**
 * Responsive UI utilities
 * Handles scaling, safe areas, and platform-specific UI differences
 */

import { Dimensions, Platform, PixelRatio, StatusBar } from 'react-native';
import { useSafeAreaInsets as useExpoSafeAreaInsets } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';

// Get device dimensions
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Design dimensions (based on iPhone 14 Pro)
const baseWidth = 393;
const baseHeight = 852;

// Scale factors
const widthScale = screenWidth / baseWidth;
const heightScale = screenHeight / baseHeight;
const scale = Math.min(widthScale, heightScale);

// Device type detection
export const DeviceInfo = {
  isIOS: Platform.OS === 'ios',
  isAndroid: Platform.OS === 'android',
  isWeb: Platform.OS === 'web',

  isPhone: screenWidth < 768,
  isTablet: screenWidth >= 768 && screenWidth < 1024,
  isDesktop: screenWidth >= 1024,

  isSmallDevice: screenWidth < 375,
  isMediumDevice: screenWidth >= 375 && screenWidth < 414,
  isLargeDevice: screenWidth >= 414,

  hasNotch: Platform.OS === 'ios' && screenHeight >= 812,

  screenWidth,
  screenHeight,
  pixelRatio: PixelRatio.get(),
  fontScale: PixelRatio.getFontScale(),
};

/**
 * Responsive width
 */
export const wp = (percentage: number): number => {
  const value = (percentage / 100) * screenWidth;
  return Math.round(value);
};

/**
 * Responsive height
 */
export const hp = (percentage: number): number => {
  const value = (percentage / 100) * screenHeight;
  return Math.round(value);
};

/**
 * Scale based on device width
 */
export const scaleWidth = (size: number): number => {
  return Math.round(size * widthScale);
};

/**
 * Scale based on device height
 */
export const scaleHeight = (size: number): number => {
  return Math.round(size * heightScale);
};

/**
 * Scale based on minimum dimension
 */
export const scaleSize = (size: number): number => {
  return Math.round(size * scale);
};

/**
 * Scale font size with optional max/min limits
 */
export const scaleFont = (
  size: number,
  options?: {
    min?: number;
    max?: number;
    factor?: number;
  },
): number => {
  const { min = 10, max = 50, factor = scale } = options || {};
  const scaled = size * factor;

  if (scaled < min) return min;
  if (scaled > max) return max;

  return Math.round(scaled);
};

/**
 * Moderate scale - less aggressive scaling
 */
export const moderateScale = (size: number, factor: number = 0.5): number => {
  return Math.round(size + (scaleWidth(size) - size) * factor);
};

/**
 * Get safe area insets with platform handling
 */
export const useSafeAreaInsets = () => {
  const insets = useExpoSafeAreaInsets();

  if (Platform.OS === 'web') {
    return {
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
    };
  }

  return {
    top: insets.top || (Platform.OS === 'ios' ? 20 : StatusBar.currentHeight || 0),
    bottom: insets.bottom,
    left: insets.left,
    right: insets.right,
  };
};

/**
 * Hook for responsive dimensions
 */
export const useDimensions = () => {
  const [dimensions, setDimensions] = useState({
    width: screenWidth,
    height: screenHeight,
    isLandscape: screenWidth > screenHeight,
  });

  useEffect(() => {
    const updateDimensions = ({ window }: any) => {
      setDimensions({
        width: window.width,
        height: window.height,
        isLandscape: window.width > window.height,
      });
    };

    const subscription = Dimensions.addEventListener('change', updateDimensions);
    return () => subscription?.remove();
  }, []);

  return dimensions;
};

/**
 * Platform-specific styles
 */
export const platformStyles = (styles: { ios?: any; android?: any; web?: any; default?: any }) => {
  const platformStyle = Platform.select({
    ios: styles.ios,
    android: styles.android,
    web: styles.web,
    default: styles.default,
  });

  return { ...styles.default, ...platformStyle };
};

/**
 * Shadow styles with platform handling
 */
export const shadowStyle = (options: {
  color?: string;
  offset?: { width: number; height: number };
  opacity?: number;
  radius?: number;
  elevation?: number;
}) => {
  const {
    color = '#000',
    offset = { width: 0, height: 2 },
    opacity = 0.25,
    radius = 3.84,
    elevation = 5,
  } = options;

  if (Platform.OS === 'android') {
    return {
      elevation,
    };
  }

  if (Platform.OS === 'ios') {
    return {
      shadowColor: color,
      shadowOffset: offset,
      shadowOpacity: opacity,
      shadowRadius: radius,
    };
  }

  // Web shadow
  return {
    boxShadow: `${offset.width}px ${offset.height}px ${radius}px rgba(0,0,0,${opacity})`,
  };
};

/**
 * Hit slop for better touch targets
 */
export const hitSlop = (value: number = 10) => ({
  top: value,
  bottom: value,
  left: value,
  right: value,
});

/**
 * Common spacing values
 */
export const spacing = {
  xs: scaleWidth(4),
  sm: scaleWidth(8),
  md: scaleWidth(16),
  lg: scaleWidth(24),
  xl: scaleWidth(32),
  xxl: scaleWidth(48),
} as const;

/**
 * Common border radius values
 */
export const borderRadius = {
  xs: scaleWidth(4),
  sm: scaleWidth(8),
  md: scaleWidth(12),
  lg: scaleWidth(16),
  xl: scaleWidth(24),
  full: 9999,
} as const;

/**
 * Typography scale
 */
export const typography = {
  // Headings
  h1: {
    fontSize: scaleFont(32, { max: 48 }),
    fontWeight: '700' as const,
    lineHeight: scaleFont(40, { max: 56 }),
  },
  h2: {
    fontSize: scaleFont(28, { max: 40 }),
    fontWeight: '700' as const,
    lineHeight: scaleFont(36, { max: 48 }),
  },
  h3: {
    fontSize: scaleFont(24, { max: 32 }),
    fontWeight: '600' as const,
    lineHeight: scaleFont(32, { max: 40 }),
  },
  h4: {
    fontSize: scaleFont(20, { max: 28 }),
    fontWeight: '600' as const,
    lineHeight: scaleFont(28, { max: 36 }),
  },
  h5: {
    fontSize: scaleFont(18, { max: 24 }),
    fontWeight: '600' as const,
    lineHeight: scaleFont(24, { max: 32 }),
  },
  h6: {
    fontSize: scaleFont(16, { max: 20 }),
    fontWeight: '600' as const,
    lineHeight: scaleFont(20, { max: 28 }),
  },

  // Body text
  body1: {
    fontSize: scaleFont(16),
    fontWeight: '400' as const,
    lineHeight: scaleFont(24),
  },
  body2: {
    fontSize: scaleFont(14),
    fontWeight: '400' as const,
    lineHeight: scaleFont(20),
  },

  // Small text
  caption: {
    fontSize: scaleFont(12, { min: 11 }),
    fontWeight: '400' as const,
    lineHeight: scaleFont(16),
  },
  overline: {
    fontSize: scaleFont(10, { min: 10 }),
    fontWeight: '500' as const,
    lineHeight: scaleFont(14),
    textTransform: 'uppercase' as const,
  },

  // Buttons
  button: {
    fontSize: scaleFont(14),
    fontWeight: '600' as const,
    lineHeight: scaleFont(20),
    textTransform: 'uppercase' as const,
  },
  buttonLarge: {
    fontSize: scaleFont(16),
    fontWeight: '600' as const,
    lineHeight: scaleFont(24),
    textTransform: 'uppercase' as const,
  },
} as const;

/**
 * Adaptive layout breakpoints
 */
export const breakpoints = {
  phone: 0,
  tablet: 768,
  desktop: 1024,
  wide: 1440,
} as const;

/**
 * Hook for adaptive layouts
 */
export const useBreakpoint = () => {
  const { width } = useDimensions();

  return {
    isPhone: width < breakpoints.tablet,
    isTablet: width >= breakpoints.tablet && width < breakpoints.desktop,
    isDesktop: width >= breakpoints.desktop,
    isWide: width >= breakpoints.wide,
    currentBreakpoint:
      width >= breakpoints.wide
        ? 'wide'
        : width >= breakpoints.desktop
          ? 'desktop'
          : width >= breakpoints.tablet
            ? 'tablet'
            : 'phone',
  };
};

/**
 * Grid system utilities
 */
export const grid = {
  columns: (count: number, gap: number = spacing.md) => {
    const totalGap = gap * (count - 1);
    const columnWidth = (screenWidth - spacing.md * 2 - totalGap) / count;
    return {
      columnWidth,
      gap,
      containerPadding: spacing.md,
    };
  },

  aspectRatio: (ratio: string) => {
    const [width, height] = ratio.split(':').map(Number);
    return width / height;
  },
};

/**
 * Platform-specific component props
 */
export const platformProps = <T extends Record<string, any>>(props: {
  ios?: T;
  android?: T;
  web?: T;
  default?: T;
}): T => {
  const platformProp = Platform.select({
    ios: props.ios,
    android: props.android,
    web: props.web,
    default: props.default,
  });

  return { ...props.default, ...platformProp } as T;
};

/**
 * Export all utilities
 */
export default {
  DeviceInfo,
  wp,
  hp,
  scaleWidth,
  scaleHeight,
  scale,
  scaleFont,
  moderateScale,
  useSafeAreaInsets,
  useDimensions,
  platformStyles,
  shadowStyle,
  hitSlop,
  spacing,
  borderRadius,
  typography,
  breakpoints,
  useBreakpoint,
  grid,
  platformProps,
};
