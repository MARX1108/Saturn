import React, {
  useState,
  createContext,
  useContext,
  useMemo,
  useEffect,
} from 'react';
import { ThemeProvider as SCThemeProvider } from 'styled-components/native';
import { useColorScheme, Appearance } from 'react-native';
import { lightTheme, darkTheme } from './theme';

interface ThemeContextProps {
  mode: 'light' | 'dark';
  toggleTheme: () => void;
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
        setThemeMode(colorScheme || 'light');
      }
    );
    return (): void => subscription.remove();
  }, []);

  const toggleTheme = (): void => {
    setThemeMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  // Select the theme object based on the current mode
  const currentTheme = useMemo(
    (): typeof lightTheme => (themeMode === 'light' ? lightTheme : darkTheme),
    [themeMode]
  );

  const contextValue = useMemo(
    (): ThemeContextProps => ({ mode: themeMode, toggleTheme }),
    [themeMode]
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      <SCThemeProvider theme={currentTheme}>{children}</SCThemeProvider>
    </ThemeContext.Provider>
  );
};
