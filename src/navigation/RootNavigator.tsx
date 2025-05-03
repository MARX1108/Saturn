import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import AuthNavigator from './AuthNavigator';
import MainTabNavigator from './MainTabNavigator';
// Import a hook/context to get auth state later
// import { useAuth } from '../context/AuthContext'; // Example

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator = () => {
  // --- Placeholder Auth State ---
  // Replace this with actual state from Redux Toolkit later
  const { isAuthenticated } = usePlaceholderAuth();
  // --- End Placeholder ---

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <Stack.Screen name="MainFlow" component={MainTabNavigator} />
      ) : (
        <Stack.Screen name="AuthFlow" component={AuthNavigator} />
      )}
      {/* Add Modals or other root-level screens here later */}
      {/* Example:
      <Stack.Group screenOptions={{ presentation: 'modal' }}>
         <Stack.Screen name="CreatePostModal" component={CreatePostScreen} />
         <Stack.Screen name="PostDetails" component={PostDetailsScreen} />
       </Stack.Group>
      */}
    </Stack.Navigator>
  );
};

// --- Placeholder Auth Hook ---
// Remove this and use actual state management later
const usePlaceholderAuth = () => {
  // Simulate being logged out initially
  // Change this to true to test the MainFlow
  const [isAuthenticated] = React.useState(false);
  return { isAuthenticated };
};
// --- End Placeholder ---

export default RootNavigator;
