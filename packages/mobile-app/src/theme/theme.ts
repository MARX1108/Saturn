/**
 * Main theme configuration for the app
 * Defines colors, spacing, typography, and other style constants
 * Follows a modern, minimalist aesthetic inspired by Obsidian and Instagram
 */

// Light and dark theme variants
const lightColors = {
  // Primary colors (more muted and sophisticated)
  primary: '#5D5FEF', // Refined purple-blue
  secondary: '#7879F1', // Lighter secondary
  accent: '#A5A6F6', // Soft accent

  // Neutral colors - subtle gradations
  background: '#FFFFFF',
  surface: '#F8F9FA',
  surfaceVariant: '#F0F1F5',

  // Text colors - improved contrast
  text: '#222222', // Deeper black for primary text
  textSecondary: '#636978', // Balanced secondary text
  textTertiary: '#989DB3', // Soft muted text

  // Status colors - slightly muted
  success: '#4BB543',
  error: '#E53935',
  warning: '#FFA726',
  info: '#2196F3',

  // Borders & Dividers - subtle
  border: '#E8E9EC',
  divider: '#EEEEF2',

  // Misc
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',

  // Instagram-inspired elements
  instagramGradientStart: '#405DE6',
  instagramGradientEnd: '#E1306C',

  // Obsidian-inspired elements
  obsidianPurple: '#7C71DA',
  obsidianBackground: '#262626',
};

const darkColors = {
  // Primary colors
  primary: '#7879F1',
  secondary: '#5D5FEF',
  accent: '#A5A6F6',

  // Neutral colors - Obsidian inspired
  background: '#121212',
  surface: '#1E1E1E',
  surfaceVariant: '#2D2D2D',

  // Text colors
  text: '#E8E8E8', // Off-white for better readability
  textSecondary: '#B0B3BC',
  textTertiary: '#8A8D98',

  // Status colors - adjusted for dark theme
  success: '#4BB543',
  error: '#E53935',
  warning: '#FFA726',
  info: '#2196F3',

  // Borders & Dividers
  border: '#3A3A3A',
  divider: '#323232',

  // Misc
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',

  // Instagram-inspired elements
  instagramGradientStart: '#405DE6',
  instagramGradientEnd: '#E1306C',

  // Obsidian-inspired elements
  obsidianPurple: '#7C71DA',
  obsidianBackground: '#262626',
};

export const theme = {
  colors: {
    ...lightColors,

    // Add dark theme colors for later implementation
    dark: darkColors,
  },

  // More generous spacing for modern, airy feel
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
    // Using system fonts for now, but could be replaced with custom fonts
    // fontFamily: 'Inter' would be a modern alternative
    fontFamily: 'System',

    // Font sizes - slightly adjusted for better readability
    fontSizeXxs: 10,
    fontSizeXs: 12,
    fontSizeSm: 14,
    fontSizeMd: 16,
    fontSizeLg: 18,
    fontSizeXl: 22,
    fontSizeXxl: 26,
    fontSizeTitle: 32,

    // Font weights - standard values
    fontWeightLight: '300',
    fontWeightRegular: '400',
    fontWeightMedium: '500',
    fontWeightSemibold: '600',
    fontWeightBold: '700',

    // Line heights for better readability
    lineHeightTight: 1.2,
    lineHeightNormal: 1.5,
    lineHeightRelaxed: 1.75,
  },

  // Enhanced border radius options for modern, rounded aesthetics
  borderRadius: {
    none: 0,
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    pill: 500, // For pill-shaped buttons
    circle: 999, // For circular elements like avatar
  },

  // Refined shadows with softer appearance
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

  // Animation durations
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
