import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import * as Sentry from '@sentry/react-native';
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

// Initialize Sentry with minimal configuration to avoid type issues
Sentry.init({
  dsn: 'https://2ad6e37b1605ca0b5ac800d53f652d91@o4509256617623552.ingest.us.sentry.io/4509256623915008',
  debug: __DEV__,
  environment: __DEV__ ? 'development' : 'production',
  enableAutoSessionTracking: true,
  // Disable problematic features
  enableNativeNagger: false,
});

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
  // Safe way to capture a message with info level severity
  try {
    // Explicitly specify severity as a string which is always safe
    Sentry.captureMessage(message, 'info');
    console.log('[Sentry] Test message sent:', message);
  } catch (error) {
    // Handle any errors that might occur during logging
    console.error('[Sentry] Failed to log message:', error);
  }
};

// Inner app component that has access to Redux dispatcher
function AppContent(): React.JSX.Element {
  const dispatch = useDispatch();

  // Listen for session expiration events
  useEffect(() => {
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

  useEffect(() => {
    const bootstrapAsync = async (): Promise<void> => {
      let userToken: string | null = null;
      let userData: Partial<User> | null = null;

      try {
        store.dispatch(setStatus('loading')); // Set status to loading
        userToken = await getToken();

        if (userToken) {
          console.log('[App] Token found in storage.');
          // Optional: Verify token validity with backend /me endpoint
          // try {
          //   // You might want an API call here that uses the token
          //   // userData = await fetchUserDetails(userToken); // Example API call
          //   // If user data fetch fails (e.g., token expired), catch below
          // } catch (verifyError) {
          //   console.warn('[App] Token verification failed:', verifyError);
          //   await removeToken(); // Clear invalid token
          //   userToken = null;
          //   userData = null;
          // }

          // For now, assume token implies logged in, fetch user data later
          // Placeholder user data - fetch actual user details later
          userData = {
            _id: 'temp_id',
            id: 'temp_id_alt',
            username: 'loading...',
          };
        } else {
          console.log('[App] No token found in storage.');
        }

        if (userToken && userData) {
          // Dispatch action to set credentials in Redux store
          store.dispatch(
            setCredentials({
              token: userToken,
              user: userData as User, // Safe assertion since we're providing all required fields
            })
          );
        } else {
          // Ensure state is idle if no token/user found
          store.dispatch(setStatus('idle'));
        }
      } catch (e) {
        console.error('[App] Error during app bootstrap:', e);
        store.dispatch(setStatus('failed')); // Set status to failed on error
        // Optionally clear token if bootstrap fails catastrophically
        try {
          await removeToken();
        } catch (clearError) {
          console.error('[App] Error clearing token:', clearError);
        }
      } finally {
        setIsInitializing(false); // Signal that initialization is complete
        // Set status to idle if it was loading and didn't become authenticated
        const finalAuthState = store.getState().auth;
        if (finalAuthState.status === 'loading') {
          store.dispatch(setStatus('idle'));
        }
      }
    };

    void bootstrapAsync(); // Use void operator to explicitly mark the promise as ignored
  }, []);

  // Render loading indicator or null while initializing
  if (isInitializing) {
    // Optional: Render a splash screen or loading indicator here
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

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
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.WHITE,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Sentry.wrap(App);
