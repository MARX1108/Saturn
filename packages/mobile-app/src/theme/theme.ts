/**
 * Main theme configuration for the app
 * Defines colors, spacing, typography, and other style constants
 * Follows a modern, minimalist aesthetic inspired by Instagram
 */

// Light and dark theme variants
const lightColors = {
  // Primary colors (Instagram-inspired)
  primary: '#0095F6', // Instagram blue
  secondary: '#8E8E93', // Instagram secondary
  accent: '#A5A6F6', // Soft accent

  // Neutral colors - Instagram-inspired grays
  background: '#FFFFFF',
  surface: '#FAFAFA', // Instagram's background
  surfaceVariant: '#F2F2F2',

  // Text colors - Instagram-inspired
  text: '#262626', // Instagram's primary text
  textSecondary: '#8E8E93', // Instagram's secondary text
  textTertiary: '#C7C7CC', // Instagram's tertiary text

  // Status colors - Instagram-inspired
  success: '#4BB543',
  error: '#ED4956', // Instagram's error/like red
  warning: '#FFA726',
  info: '#0095F6', // Same as primary

  // Borders & Dividers - Instagram-inspired
  border: '#DBDBDB', // Instagram's border color
  divider: '#EFEFEF', // Instagram's divider color

  // Misc
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',

  // Instagram-specific colors
  instagramGradientStart: '#405DE6',
  instagramGradientEnd: '#E1306C',
  instagramLikeRed: '#ED4956',
  instagramStoryBorder: '#C7C7CC',
};

const darkColors = {
  // Primary colors
  primary: '#0095F6',
  secondary: '#8E8E93',
  accent: '#A5A6F6',

  // Neutral colors - Dark mode Instagram-inspired
  background: '#000000',
  surface: '#121212',
  surfaceVariant: '#1C1C1E',

  // Text colors
  text: '#F5F5F5',
  textSecondary: '#8E8E93',
  textTertiary: '#636366',

  // Status colors
  success: '#4BB543',
  error: '#ED4956',
  warning: '#FFA726',
  info: '#0095F6',

  // Borders & Dividers
  border: '#2C2C2E',
  divider: '#1C1C1E',

  // Misc
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',

  // Instagram-specific colors
  instagramGradientStart: '#405DE6',
  instagramGradientEnd: '#E1306C',
  instagramLikeRed: '#ED4956',
  instagramStoryBorder: '#2C2C2E',
};

export const theme = {
  colors: {
    ...lightColors,
    dark: darkColors,
  },

  spacing: {
    xxs: 2,
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
    xxxl: 64,
  },

  typography: {
    // Instagram's font stack
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",

    fontSizeXxs: 10,
    fontSizeXs: 12,
    fontSizeSm: 14,
    fontSizeMd: 16,
    fontSizeLg: 18,
    fontSizeXl: 22,
    fontSizeXxl: 26,
    fontSizeTitle: 32,

    // Instagram's font weights
    fontWeightLight: '300',
    fontWeightRegular: '400',
    fontWeightMedium: '500',
    fontWeightSemibold: '600',
    fontWeightBold: '700',

    lineHeightTight: 1.2,
    lineHeightNormal: 1.5,
    lineHeightRelaxed: 1.75,
  },

  borderRadius: {
    none: 0,
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    pill: 500,
    circle: 999,
    story: 100, // Instagram story border radius
  },

  shadows: {
    none: {
      shadowColor: 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
    xs: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 1.0,
      elevation: 1,
    },
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 2.0,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.1,
      shadowRadius: 4.0,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 6.0,
      elevation: 8,
    },
  },

  animation: {
    fast: 200,
    normal: 300,
    slow: 500,
  },
};

// Export theme type for TypeScript
export type ThemeType = typeof theme;

// Helper functions
export const getColor = (color: keyof typeof theme.colors): string =>
  theme.colors[color];
export const getSpacing = (space: keyof typeof theme.spacing): number =>
  theme.spacing[space];

// Dark mode type-safe helper (to be used with theme switching later)
export const getDarkColor = (color: keyof typeof darkColors): string =>
  theme.colors.dark[color];
