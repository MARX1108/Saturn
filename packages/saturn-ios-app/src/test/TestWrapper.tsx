import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../store/slices/authSlice';

// Define the correct auth state type based on the real state in authSlice.ts
type AuthState = {
  user: null | {
    id: string;
    _id: string;
    username: string;
    displayName?: string;
  };
  token: string | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed' | 'authenticated';
  profileComplete: boolean;
};

// Create a mock redux store
const mockStore = configureStore({
  reducer: {
    auth: authReducer,
    // Add other reducers as needed
  },
  preloadedState: {
    auth: {
      user: {
        id: 'test-id',
        _id: 'test-id',
        username: 'testuser',
        displayName: 'Test User',
      },
      status: 'authenticated' as const,
      token: 'test-token',
      profileComplete: true,
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
