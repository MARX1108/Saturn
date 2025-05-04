import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { authReducer } from '../store/authSlice';

// Define the correct auth state type
type AuthState = {
  status: 'unauthenticated' | 'authenticated' | 'loading';
  token: string | null;
  profileComplete: boolean;
  error: string | null;
};

// Create a mock redux store
const mockStore = configureStore({
  reducer: {
    auth: authReducer,
    // Add other reducers as needed
  },
  preloadedState: {
    auth: {
      status: 'authenticated' as const,
      token: 'test-token',
      profileComplete: true,
      error: null,
    },
    // Add other state slices as needed
  },
});

// Create a mock query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});

// Test wrapper with query client and redux store
interface TestWrapperProps {
  children: React.ReactNode;
}

export const TestWrapper: React.FC<TestWrapperProps> = ({ children }) => {
  return (
    <Provider store={mockStore}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </Provider>
  );
};

export default TestWrapper;
