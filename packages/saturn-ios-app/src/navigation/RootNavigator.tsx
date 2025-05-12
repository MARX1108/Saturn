import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import AuthNavigator from './AuthNavigator';
import MainTabNavigator from './MainTabNavigator';
import CreatePostScreen from '../screens/main/CreatePostScreen';
import ProfileEditScreen from '../screens/main/ProfileEditScreen';
import { useAppSelector } from '../store/hooks'; // Import typed selector
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native'; // For loading state

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator = (): React.JSX.Element => {
  console.log('[RootNavigator] Initializing...');

  // TEMPORARY: Force showing the auth navigator for debugging
  // This bypasses auth state checks to see if we can render the basic UI
  const [forcedDebugMode, setForcedDebugMode] = useState(true);

  // Get auth status from Redux store
  const authStatus = useAppSelector((state) => state.auth.status);
  const isAuthenticated = authStatus === 'authenticated';

  console.log('[RootNavigator] Auth Status:', authStatus);
  console.log('[RootNavigator] isAuthenticated:', isAuthenticated);
  console.log('[RootNavigator] Auth Bypass Active:', forcedDebugMode);

  useEffect(() => {
    console.log('[RootNavigator] Mount - Auth Status:', authStatus);
    console.log('[RootNavigator] Mount - isAuthenticated:', isAuthenticated);

    // After 5 seconds, turn off forced debug mode if auth is working
    const timer = setTimeout(() => {
      console.log(
        '[RootNavigator] Debug timer expired, checking if we can disable forced mode'
      );
      if (authStatus !== 'loading') {
        console.log(
          '[RootNavigator] Auth determined, disabling forced debug mode'
        );
        setForcedDebugMode(false);
      }
    }, 5000);

    return () => {
      console.log('[RootNavigator] Unmounting, clearing timer');
      clearTimeout(timer);
    };
  }, [authStatus, isAuthenticated]);

  // Show loading indicator while checking token initially or during auth actions
  if (authStatus === 'loading' && !forcedDebugMode) {
    console.log('[RootNavigator] Rendering loading state');
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Checking auth status...</Text>
      </View>
    );
  }

  // If we're in debug mode, force the auth navigator
  if (forcedDebugMode) {
    console.log('[RootNavigator] FORCED DEBUG MODE: Rendering AuthNavigator');
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen
          name="Login"
          component={AuthNavigator}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    );
  }

  console.log(
    '[RootNavigator] Rendering navigator - Auth route:',
    isAuthenticated ? 'MainFlow' : 'Login'
  );

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      {isAuthenticated ? (
        <Stack.Screen
          name="MainFlow"
          component={MainTabNavigator}
          options={{ headerShown: false }}
        />
      ) : (
        <Stack.Screen
          name="Login"
          component={AuthNavigator}
          options={{ headerShown: false }}
        />
      )}
      <Stack.Screen
        name="CreatePostModal"
        component={CreatePostScreen}
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="ProfileEditModal"
        component={ProfileEditScreen}
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom',
          headerShown: true,
          title: 'Edit Profile',
        }}
      />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
});

export default RootNavigator;
