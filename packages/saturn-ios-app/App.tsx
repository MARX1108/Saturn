import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, ActivityIndicator, Text } from 'react-native';
// import * as Sentry from '@sentry/react-native'; // Temporarily comment out Sentry
import { NavigationContainer } from '@react-navigation/native';
import { Provider, useDispatch } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { store } from './src/store/store';
import RootNavigator from './src/navigation/RootNavigator';
import { getToken, removeToken } from './src/services/tokenStorage';
import {
  setCredentials,
  setStatus,
  clearCredentials,
} from './src/store/slices/authSlice';
import { User } from './src/types/user';
import { AppThemeProvider } from './src/theme/ThemeProvider';
import { eventEmitter, EventType } from './src/services/eventEmitter';
import Toast from 'react-native-toast-message';

// --- Sentry Configuration ---
// IMPORTANT: Replace 'YOUR_SENTRY_DSN' with your actual Sentry DSN
// It's highly recommended to load this from environment variables or a config file
// instead of hardcoding it directly in the source code.
const SENTRY_DSN =
  process.env.EXPO_PUBLIC_SENTRY_DSN || 'YOUR_SENTRY_DSN_GOES_HERE';

console.log('[App] Starting initialization');

// Temporarily disable Sentry initialization
/*
Sentry.init({
  dsn: SENTRY_DSN,
  debug: __DEV__, // Enable debug logging in development
  environment: process.env.NODE_ENV || 'development', // Set environment
  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
});
*/

console.log('[App] Sentry initialization skipped');
// --- End Sentry Configuration ---

// Create a query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Configure default query options if needed
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false, // Disable window focus refetching for React Native
    },
  },
});

// Export the queryClient for testing purposes
export { queryClient };

// Add a function to test Sentry
export const testSentryLogger = (message: string): void => {
  // Temporarily disabled
  console.log('[Sentry] Test message (disabled):', message);
};

// Inner app component that has access to Redux dispatcher
function AppContent(): React.JSX.Element {
  const dispatch = useDispatch();

  console.log('[AppContent] Rendering component');

  // Listen for session expiration events
  useEffect(() => {
    console.log('[AppContent] Setting up session expiration listener');

    const unsubscribe = eventEmitter.on(EventType.SESSION_EXPIRED, () => {
      console.log('[App] Session expired, logging out user');

      // Clear user credentials from store
      dispatch(clearCredentials());

      // Show toast message to user
      Toast.show({
        type: 'error',
        text1: 'Session Expired',
        text2: 'Please log in again',
        position: 'bottom',
        visibilityTime: 4000,
      });
    });

    // Clean up event listener on unmount
    return () => {
      console.log('[AppContent] Cleaning up event listener');
      eventEmitter.off(EventType.SESSION_EXPIRED, unsubscribe);
    };
  }, [dispatch]);

  return (
    <>
      <StatusBar style="auto" />
      <RootNavigator />
      <Toast />
    </>
  );
}

function App(): React.JSX.Element | null {
  const [isInitializing, setIsInitializing] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    console.log('[App] Component mounted');

    const bootstrapAsync = async (): Promise<void> => {
      let userToken: string | null = null;
      let userData: Partial<User> | null = null;

      try {
        console.log('[App] Setting auth status to loading');
        store.dispatch(setStatus('loading')); // Set status to loading

        console.log('[App] Attempting to get token from storage');
        userToken = await getToken();

        if (userToken) {
          console.log(
            '[App] Token found in storage, length:',
            userToken.length
          );
          // Set up minimal user data for now
          userData = {
            _id: 'temp_id',
            id: 'temp_id_alt',
            username: 'loading...',
          };
          console.log('[App] Created minimal user data');
        } else {
          console.log('[App] No token found in storage.');
        }

        if (userToken && userData) {
          console.log('[App] Dispatching credentials to Redux');
          // Dispatch action to set credentials in Redux store
          store.dispatch(
            setCredentials({
              token: userToken,
              user: userData as User, // Safe assertion since we're providing all required fields
            })
          );
          console.log('[App] Credentials dispatched successfully');
        } else {
          console.log(
            '[App] No credentials to dispatch, setting status to idle'
          );
          // Ensure state is idle if no token/user found
          store.dispatch(setStatus('idle'));
        }
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : String(e);
        console.error('[App] Error during app bootstrap:', errorMessage);
        setInitError(`Bootstrap error: ${errorMessage}`);
        store.dispatch(setStatus('failed')); // Set status to failed on error
        // Optionally clear token if bootstrap fails catastrophically
        try {
          await removeToken();
        } catch (clearError) {
          console.error('[App] Error clearing token:', clearError);
        }
      } finally {
        console.log(
          '[App] Bootstrap complete, setting isInitializing to false'
        );
        setIsInitializing(false); // Signal that initialization is complete
        // Set status to idle if it was loading and didn't become authenticated
        const finalAuthState = store.getState().auth;
        console.log('[App] Final auth state:', finalAuthState.status);
        if (finalAuthState.status === 'loading') {
          console.log('[App] Auth status was still loading, setting to idle');
          store.dispatch(setStatus('idle'));
        }
      }
    };

    void bootstrapAsync(); // Use void operator to explicitly mark the promise as ignored
  }, []);

  useEffect(() => {
    return () => {
      console.log('[App] Component will unmount');
    };
  }, []);

  // Render loading indicator while initializing
  if (isInitializing) {
    console.log('[App] Rendering loading indicator');
    // Optional: Render a splash screen or loading indicator here
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // Show error if initialization failed
  if (initError) {
    console.log('[App] Rendering error screen:', initError);
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error: {initError}</Text>
      </View>
    );
  }

  console.log('[App] Rendering main component');

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <AppThemeProvider>
          <NavigationContainer>
            <AppContent />
          </NavigationContainer>
        </AppThemeProvider>
      </QueryClientProvider>
    </Provider>
  );
}

// Color constants to avoid color literals
const Colors = {
  WHITE: '#fff',
  INDICATOR: '#0000ff',
  ERROR: '#ff0000',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.WHITE,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  errorText: {
    color: Colors.ERROR,
    fontSize: 16,
    textAlign: 'center',
  },
});

export default App;
