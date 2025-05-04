import 'styled-components/native';

// Define the structure of the theme
declare module 'styled-components/native' {
  export interface DefaultTheme {
    mode: 'light' | 'dark';
    colors: {
      primary: string;
      secondary: string;
      background: string;
      surface: string;
      textPrimary: string;
      textSecondary: string;
      textDisabled: string;
      border: string;
      error: string;
      success: string;
    };
    spacing: {
      xs: number;
      s: number;
      m: number;
      l: number;
      xl: number;
    };
    typography: {
      h1: number;
      h2: number;
      h3: number;
      body1: number;
      body2: number;
      caption: number;
      primary: string;
      secondary: string;
    };
    borderRadius: {
      small: number;
      medium: number;
      large: number;
      round: number;
    };
  }
}
