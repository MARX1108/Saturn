import React, {
  useState,
  createContext,
  useContext,
  useMemo,
  useEffect,
  useCallback,
} from 'react';
import { useColorScheme, Appearance, StatusBar } from 'react-native';
import { ThemeProvider as StyledThemeProvider } from 'styled-components/native';
import { lightTheme, darkTheme } from './theme';

interface ThemeContextProps {
  mode: 'light' | 'dark';
  toggleTheme: () => void;
  theme: typeof lightTheme;
}

// Create context with a default value
const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const useThemeToggle = (): ThemeContextProps => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeToggle must be used within a AppThemeProvider');
  }
  return context;
};

// Export the theme hook for use in styled components
export const useTheme = (): typeof lightTheme => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a AppThemeProvider');
  }
  return context.theme;
};

interface AppThemeProviderProps {
  children: React.ReactNode;
}

export const AppThemeProvider = ({
  children,
}: AppThemeProviderProps): React.JSX.Element => {
  // Get system preference
  const systemColorScheme = useColorScheme();
  // Default to light if no system preference detected
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>(
    systemColorScheme || 'light'
  );

  // Update theme if system preference changes while app is running
  useEffect((): (() => void) => {
    const subscription = Appearance.addChangeListener(
      ({ colorScheme }): void => {
        console.log('System color scheme changed:', colorScheme);
        // You can add persistent storage here later to respect user override vs system preference
        setThemeMode(colorScheme || 'light');
      }
    );
    return (): void => subscription.remove();
  }, []);

  const toggleTheme = useCallback((): void => {
    setThemeMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  }, []);

  // Select the theme object based on the current mode
  const currentTheme = useMemo((): typeof lightTheme => {
    const theme = themeMode === 'light' ? lightTheme : darkTheme;
    // Set status bar style based on theme
    StatusBar.setBarStyle(
      themeMode === 'light' ? 'dark-content' : 'light-content'
    );
    return theme;
  }, [themeMode]);

  const contextValue = useMemo(
    (): ThemeContextProps => ({
      mode: themeMode,
      toggleTheme,
      theme: currentTheme,
    }),
    [themeMode, toggleTheme, currentTheme]
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      <StyledThemeProvider theme={currentTheme}>{children}</StyledThemeProvider>
    </ThemeContext.Provider>
  );
};
