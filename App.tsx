import React from 'react';
import { SafeAreaView, StyleSheet, Text, Button, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as Sentry from '@sentry/react-native';

// --- Sentry Configuration ---
// IMPORTANT: Replace 'YOUR_SENTRY_DSN' with your actual Sentry DSN
// It's highly recommended to load this from environment variables or a config file
// instead of hardcoding it directly in the source code.
const SENTRY_DSN =
  process.env.EXPO_PUBLIC_SENTRY_DSN || 'YOUR_SENTRY_DSN_GOES_HERE';

Sentry.init({
  dsn: SENTRY_DSN,
  debug: __DEV__, // Enable debug logging in development
  environment: process.env.NODE_ENV || 'development', // Set environment
  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
  // --- Performance Monitoring Setup (React Navigation Integration) ---
  // Uncomment and configure if using React Navigation v6+
  // integrations: [
  //   new Sentry.ReactNativeTracing({
  //     routingInstrumentation: new Sentry.ReactNavigationV5Instrumentation(
  //       // Pass navigation ref obtained via useNavigationContainerRef()
  //       // navigationRef, // You'll need to set this up later
  //     ),
  //     // Add other options as needed
  //   }),
  // ],
});
// --- End Sentry Configuration ---

export default function App(): React.JSX.Element {
  // --- Sentry Test Function ---
  const sendTestEvent = () => {
    console.log('Sending Sentry test event...');
    try {
      // Capture a message
      Sentry.captureMessage('Sentry Test Message from Saturn App!', 'info');

      // Or capture an exception
      // throw new Error('Sentry Test Error from Saturn App!'); // Uncomment to test exceptions

      console.log('Sentry test event sent/captured.');
      // You should see this event appear in your Sentry dashboard shortly.
    } catch (error) {
      console.error('Failed to send Sentry test event:', error);
      Sentry.captureException(error); // Capture the error itself if sending fails
    }
  };
  // --- End Sentry Test Function ---

  return (
    // <Provider store={store}> {/* Add Redux Provider later */}
    //   <QueryClientProvider client={queryClient}> {/* Add TanStack Query Provider later */}
    //     <NavigationContainer ref={navigationRef}> {/* Add Navigation later */}
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <Text style={styles.title}>Saturn App</Text>
        <Text>Welcome! Basic setup complete.</Text>
        {/* Temporary Button for Sentry Test */}
        <Button title="Send Sentry Test Event" onPress={sendTestEvent} />
        <StatusBar style="auto" />
      </SafeAreaView>
    </View>
    //     </NavigationContainer>
    //   </QueryClientProvider>
    // </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  safeArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
});
