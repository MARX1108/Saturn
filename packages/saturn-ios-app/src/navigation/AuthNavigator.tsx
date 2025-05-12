import React, { useEffect } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthStackParamList } from './types';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

const Stack = createNativeStackNavigator<AuthStackParamList>();

// Create a simple fallback component for testing rendering
const SimpleFallbackScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Auth Screen Loaded</Text>
      <Text style={styles.subText}>
        If you can see this, navigation is working!
      </Text>
    </View>
  );
};

const AuthNavigator = (): React.JSX.Element => {
  console.log('[AuthNavigator] Initializing...');

  useEffect(() => {
    console.log('[AuthNavigator] Mount - Auth navigator mounted');

    return () => {
      console.log('[AuthNavigator] Unmounting');
    };
  }, []);

  console.log(
    '[AuthNavigator] Rendering auth stack with Login as initial screen'
  );

  // Use the fallback screen first to test if navigation works without loading complex screens
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={SimpleFallbackScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    padding: 20,
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  subText: {
    fontSize: 16,
    textAlign: 'center',
  },
});

export default AuthNavigator;
