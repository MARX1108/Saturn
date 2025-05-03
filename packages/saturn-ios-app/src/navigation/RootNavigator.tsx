import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import AuthNavigator from './AuthNavigator';
import MainTabNavigator from './MainTabNavigator';

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator = (): React.JSX.Element => {
  // Placeholder Auth State - replace with actual state later
  const { isAuthenticated } = usePlaceholderAuth();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <Stack.Screen name="MainFlow" component={MainTabNavigator} />
      ) : (
        <Stack.Screen name="AuthFlow" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
};

// Placeholder Auth Hook - remove and use actual state management later
const usePlaceholderAuth = (): { isAuthenticated: boolean } => {
  // Temporarily set to true for testing MainFlow
  const [isAuthenticated] = React.useState(true);
  return { isAuthenticated };
};

export default RootNavigator;