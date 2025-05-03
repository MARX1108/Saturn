import { StatusBar } from 'expo-status-bar';
import { Button, StyleSheet } from 'react-native';
import * as Sentry from '@sentry/react-native';
import { NavigationContainer } from '@react-navigation/native';
import RootNavigator from './src/navigation/RootNavigator';

// Initialize Sentry
Sentry.init({
  dsn: 'https://2ad6e37b1605ca0b5ac800d53f652d91@o4509256617623552.ingest.us.sentry.io/4509256623915008', // Replace with your actual DSN
  debug: __DEV__, // Enable debug in development
  environment: __DEV__ ? 'development' : 'production',
});

const sendTestEvent = (): void => {
  try {
    // Send a test message
    Sentry.captureMessage('Testing Sentry Integration');
    Alert.alert('Success', 'Test event sent to Sentry');

    // Uncomment to test error capturing
    // throw new Error('Test Exception for Sentry');
  } catch (error) {
    Sentry.captureException(error);
    Alert.alert('Error Sent', 'Test exception captured by Sentry');
  }
};

export default Sentry.wrap(function App() {
  return (
    <NavigationContainer>
      <StatusBar style="auto" />

      <RootNavigator />

    </NavigationContainer>
  );
});

// Color constants to avoid color literals
const Colors = {
  WHITE: '#fff',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.WHITE,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
