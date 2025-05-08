import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import AuthNavigator from './AuthNavigator';
import MainTabNavigator from './MainTabNavigator';
import CreatePostScreen from '../screens/main/CreatePostScreen';
import ProfileEditScreen from '../screens/main/ProfileEditScreen';
import { useAppSelector } from '../store/hooks'; // Import typed selector
import { View, ActivityIndicator, StyleSheet } from 'react-native'; // For loading state

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator = (): React.JSX.Element => {
  // Get auth status from Redux store
  const authStatus = useAppSelector((state) => state.auth.status);
  const isAuthenticated = authStatus === 'authenticated';

  // Show loading indicator while checking token initially or during auth actions
  if (authStatus === 'loading') {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

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
});

export default RootNavigator;
