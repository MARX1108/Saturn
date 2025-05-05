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

// For tests, we use a simpler container since we don't need full navigation functionality
const MockNavigationContainer = ({
  children,
}: {
  children: React.ReactNode;
}) => <>{children}</>;

// Test wrapper with query client, redux store, and navigation container
interface TestWrapperProps {
  children: React.ReactNode;
}

// Define a proper type for the global object
interface ExtendedGlobal extends NodeJS.Global {
  queryClient?: QueryClient;
  resetQueryClient?: () => QueryClient;
}

export const TestWrapper: React.FC<TestWrapperProps> = ({ children }) => {
  // Use the global query client from jest.setup.js with proper type safety
  const globalObject = global as ExtendedGlobal;
  const queryClient =
    globalObject.queryClient ||
    (globalObject.resetQueryClient && globalObject.resetQueryClient());

  // If no queryClient is available, create a new one
  const clientToUse = queryClient || new QueryClient();

  return (
    <Provider store={mockStore}>
      <QueryClientProvider client={clientToUse}>
        <MockNavigationContainer>{children}</MockNavigationContainer>
      </QueryClientProvider>
    </Provider>
  );
};

export default TestWrapper;
