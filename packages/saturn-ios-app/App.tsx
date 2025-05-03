import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button, Alert } from 'react-native';
import * as Sentry from '@sentry/react-native';

// Initialize Sentry
Sentry.init({
  dsn: 'foryoupageorg', // Replace with your actual DSN
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
    <View style={styles.container}>
      <Text>Open up App.tsx to start working on your app!</Text>
      <StatusBar style="auto" />
      <Button title="Send Test Event to Sentry" onPress={sendTestEvent} />
    </View>
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
