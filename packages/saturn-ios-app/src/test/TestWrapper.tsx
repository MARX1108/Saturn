import React from 'react';
import { Provider } from 'react-redux';
import { ThemeProvider } from 'styled-components/native';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { store } from '../store/store';
import { lightTheme } from '../theme/theme';

// Create a new mock for NavigationContainer since it might not be properly imported
const MockNavigationContainer = ({
  children,
}: {
  children: React.ReactNode;
}) => <>{children}</>;

// Create a fresh QueryClient for each test
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

interface TestWrapperProps {
  children: React.ReactNode;
}

// A wrapper component that provides all necessary context providers for tests
export const TestWrapper: React.FC<TestWrapperProps> = ({ children }) => {
  const queryClient = createTestQueryClient();

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={lightTheme}>
          <MockNavigationContainer>{children}</MockNavigationContainer>
        </ThemeProvider>
      </QueryClientProvider>
    </Provider>
  );
};

export default TestWrapper;
