import { Platform } from 'react-native';
import { DefaultTheme } from 'styled-components/native';

// Define base values (adjust according to UI/UX Spec v1.2)
const spacing = {
  xs: 4,
  s: 8,
  m: 16,
  l: 24,
  xl: 32,
};

const typography = {
  // Example sizes - adjust based on spec
  h1: 28,
  h2: 24,
  h3: 20,
  body1: 16,
  body2: 14,
  caption: 12,
  // Example font families - ensure fonts are linked/loaded
  primary: Platform.OS === 'ios' ? 'System' : 'sans-serif', // Replace with Satoshi/Manrope if loaded
  secondary: Platform.OS === 'ios' ? 'System' : 'sans-serif', // Replace with Inter if loaded
};

const borderRadius = {
  small: 4,
  medium: 8,
  large: 16,
  round: 999,
};

// Define Light Theme Colors (Use examples from UI/UX Spec v1.2)
export const lightTheme: DefaultTheme = {
  mode: 'light',
  colors: {
    primary: '#00A0B0', // Cosmic Teal Example
    secondary: '#FF7F50', // Solar Flare Orange Example
    background: '#F5F5F5', // Lunar Grey Example
    surface: '#FFFFFF', // Card backgrounds, etc.
    textPrimary: '#121212', // Void Black Example (or near black)
    textSecondary: '#666666', // Mid-grey
    textDisabled: '#AAAAAA',
    border: '#e0e0e0',
    error: '#B00020',
    success: '#388E3C',
    // Add other specific colors as needed
  },
  spacing,
  typography,
  borderRadius,
};

// Define Dark Theme Colors (Inverted/adjusted colors)
export const darkTheme: DefaultTheme = {
  mode: 'dark',
  colors: {
    primary: '#00A0B0', // Keep primary vibrant
    secondary: '#FF7F50',
    background: '#121212', // Void Black Example
    surface: '#1E1E1E', // Darker surface
    textPrimary: '#FFFFFF', // White text
    textSecondary: '#AAAAAA', // Lighter grey
    textDisabled: '#666666',
    border: '#333333', // Darker border
    error: '#CF6679',
    success: '#66BB6A',
  },
  spacing,
  typography,
  borderRadius,
};
