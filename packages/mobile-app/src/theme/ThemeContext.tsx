import React, { createContext, useContext } from 'react';
import { theme, ThemeType } from './theme';

// Create the context with default theme
const ThemeContext = createContext<ThemeType>(theme);

// Create the provider component
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // We could later add theme switching logic here (dark/light mode)
  return (
    <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
  );
};

// Custom hook to use the theme
export const useTheme = (): ThemeType => {
  const context = useContext(ThemeContext);

  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
};

export default ThemeContext;
