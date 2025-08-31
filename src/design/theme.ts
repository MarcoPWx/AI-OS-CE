/**
 * Modern Design System for QuizMentor
 * Inspired by Linear, Vercel, and modern SaaS products
 */

import { Platform } from 'react-native';

// Color System
export const colors = {
  // Primary Colors
  primary: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9',
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
    950: '#082f49',
  },

  // Professional Accent Colors - Muted and Sophisticated
  accent: {
    purple: '#7c3aed', // Deeper, more professional purple
    teal: '#0d9488', // Professional teal instead of bright pink
    blue: '#1d4ed8', // Deeper blue
    emerald: '#059669', // Professional green
    slate: '#475569', // Professional gray-blue
    indigo: '#4f46e5', // Main brand indigo
  },

  // Neutral Colors
  neutral: {
    50: '#fafafa',
    100: '#f4f4f5',
    200: '#e4e4e7',
    300: '#d4d4d8',
    400: '#a1a1aa',
    500: '#71717a',
    600: '#52525b',
    700: '#3f3f46',
    800: '#27272a',
    900: '#18181b',
    950: '#09090b',
  },

  // Semantic Colors - Professional Tones
  semantic: {
    success: '#059669', // Deeper, more professional green
    warning: '#d97706', // More muted orange
    error: '#dc2626', // Professional red
    info: '#1d4ed8', // Deeper blue
  },

  // Professional Gradients
  gradients: {
    primary: ['#4f46e5', '#7c3aed'], // Indigo to deep purple
    secondary: ['#1e293b', '#334155'], // Dark professional
    accent: ['#1d4ed8', '#0d9488'], // Blue to teal
    success: ['#059669', '#047857'], // Success gradient
    surface: ['#f8fafc', '#f1f5f9'], // Light surface
    dark: ['#0f172a', '#1e293b'], // Dark surface
    subtle: ['#e2e8f0', '#cbd5e1'], // Very subtle
  },

  // Background Colors
  background: {
    primary: '#ffffff',
    secondary: '#fafafa',
    tertiary: '#f4f4f5',
    elevated: '#ffffff',
    overlay: 'rgba(0, 0, 0, 0.5)',
  },

  // Dark Mode Colors
  dark: {
    background: {
      primary: '#09090b',
      secondary: '#18181b',
      tertiary: '#27272a',
      elevated: '#27272a',
      overlay: 'rgba(255, 255, 255, 0.1)',
    },
    text: {
      primary: '#fafafa',
      secondary: '#a1a1aa',
      tertiary: '#71717a',
    },
  },
};

// Typography System
export const typography = {
  // Font Families
  fontFamily: {
    regular: Platform.select({
      ios: 'System',
      android: 'Roboto',
      default: 'System',
    }),
    medium: Platform.select({
      ios: 'System',
      android: 'Roboto-Medium',
      default: 'System',
    }),
    semibold: Platform.select({
      ios: 'System',
      android: 'Roboto-Medium',
      default: 'System',
    }),
    bold: Platform.select({
      ios: 'System',
      android: 'Roboto-Bold',
      default: 'System',
    }),
    mono: Platform.select({
      ios: 'Menlo',
      android: 'monospace',
      default: 'monospace',
    }),
  },

  // Font Sizes
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
    '6xl': 60,
  },

  // Line Heights
  lineHeight: {
    tight: 1.1,
    snug: 1.2,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },

  // Letter Spacing
  letterSpacing: {
    tighter: -0.05,
    tight: -0.025,
    normal: 0,
    wide: 0.025,
    wider: 0.05,
    widest: 0.1,
  },

  // Font Weights
  fontWeight: {
    thin: '100',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },
};

// Spacing System
export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  9: 36,
  10: 40,
  12: 48,
  14: 56,
  16: 64,
  20: 80,
  24: 96,
  28: 112,
  32: 128,
  36: 144,
  40: 160,
  44: 176,
  48: 192,
  52: 208,
  56: 224,
  60: 240,
  64: 256,
};

// Border Radius
export const borderRadius = {
  none: 0,
  sm: 4,
  base: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  full: 9999,
};

// Shadows
export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  base: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
  },
  '2xl': {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.3,
    shadowRadius: 32,
    elevation: 16,
  },
  inner: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: -1,
  },
};

// Animation Durations
export const animations = {
  duration: {
    instant: 0,
    fast: 150,
    base: 300,
    slow: 500,
    slower: 700,
    slowest: 1000,
  },

  easing: {
    linear: [0, 0, 1, 1],
    easeIn: [0.4, 0, 1, 1],
    easeOut: [0, 0, 0.2, 1],
    easeInOut: [0.4, 0, 0.2, 1],
    spring: [0.5, 1.5, 0.5, 1],
  },
};

// Z-Index Scale
export const zIndex = {
  hide: -1,
  auto: 'auto',
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  fixed: 1200,
  modalBackdrop: 1300,
  modal: 1400,
  popover: 1500,
  tooltip: 1600,
  toast: 1700,
};

// Breakpoints
export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

// Grid System
export const grid = {
  columns: 12,
  gap: spacing[4],
  maxWidth: 1280,
};

// Component Tokens
export const components = {
  button: {
    height: {
      sm: 32,
      md: 40,
      lg: 48,
      xl: 56,
    },
    padding: {
      sm: { x: spacing[3], y: spacing[2] },
      md: { x: spacing[4], y: spacing[2] },
      lg: { x: spacing[5], y: spacing[3] },
      xl: { x: spacing[6], y: spacing[4] },
    },
    fontSize: {
      sm: typography.fontSize.sm,
      md: typography.fontSize.base,
      lg: typography.fontSize.lg,
      xl: typography.fontSize.xl,
    },
  },

  input: {
    height: {
      sm: 32,
      md: 40,
      lg: 48,
    },
    padding: {
      x: spacing[3],
      y: spacing[2],
    },
    borderWidth: 1.5,
    borderRadius: borderRadius.base,
  },

  card: {
    padding: spacing[4],
    borderRadius: borderRadius.lg,
    shadow: shadows.base,
  },

  modal: {
    padding: spacing[6],
    borderRadius: borderRadius.xl,
    maxWidth: 480,
    shadow: shadows.xl,
  },

  badge: {
    padding: { x: spacing[2], y: spacing[1] },
    borderRadius: borderRadius.full,
    fontSize: typography.fontSize.xs,
  },
};

// Haptics Configuration
export const haptics = {
  impact: {
    light: 'impactLight',
    medium: 'impactMedium',
    heavy: 'impactHeavy',
  },
  notification: {
    success: 'notificationSuccess',
    warning: 'notificationWarning',
    error: 'notificationError',
  },
  selection: 'selection',
};

// Accessibility
export const a11y = {
  focusRing: {
    color: colors.primary[500],
    width: 2,
    offset: 2,
  },
  minimumTouchTarget: {
    width: 44,
    height: 44,
  },
  contrast: {
    AANormal: 4.5,
    AALarge: 3,
    AAANormal: 7,
    AAALarge: 4.5,
  },
};

// Export default theme object
export const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  animations,
  zIndex,
  breakpoints,
  grid,
  components,
  haptics,
  a11y,
};

export default theme;
