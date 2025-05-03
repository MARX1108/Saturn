import React from 'react';
import { StatusBar } from 'expo-status-bar';
import * as Sentry from '@sentry/react-native';
import { NavigationContainer } from '@react-navigation/native';
import RootNavigator from './src/navigation/RootNavigator';

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

function App(): React.JSX.Element {
  return (
    // Add Providers here later, e.g.:
    // <Provider store={store}>
    //   <QueryClientProvider client={queryClient}>
    //     <ThemeProvider theme={theme}>
    <NavigationContainer>
      <RootNavigator />
      <StatusBar style="auto" />
    </NavigationContainer>
    //     </ThemeProvider>
    //   </QueryClientProvider>
    // </Provider>
  );
}

// export default Sentry.wrap(App); // Consider re-enabling Sentry wrap later
export default App;
