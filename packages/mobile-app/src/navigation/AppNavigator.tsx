import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, View, StyleSheet } from 'react-native';

// Auth Context
import { useAuth } from '../context/AuthContext';

// Route constants
import * as Routes from './routes';
import {
  AuthStackParamList,
  MainTabParamList,
  RootStackParamList,
} from './types';

// Auth screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

// Main screens
import FeedScreen from '../screens/main/FeedScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import SettingsScreen from '../screens/main/SettingsScreen';
import CreatePostScreen from '../screens/post/CreatePostScreen';
import PostDetailsScreen from '../screens/post/PostDetailsScreen';

// Create the navigators
const Stack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// Auth Navigator
const AuthNavigator = (): React.JSX.Element => {
  return (
    <AuthStack.Navigator>
      <AuthStack.Screen name={Routes.LOGIN} component={LoginScreen} />
      <AuthStack.Screen name={Routes.REGISTER} component={RegisterScreen} />
    </AuthStack.Navigator>
  );
};

// Bottom Tab Navigator
const MainTabNavigator = (): React.JSX.Element => {
  return (
    <Tab.Navigator>
      <Tab.Screen
        name={Routes.FEED}
        component={FeedScreen}
        options={{
          tabBarLabel: 'Feed',
          // We'll add icons later
        }}
      />
      <Tab.Screen
        name="Create"
        component={EmptyComponent}
        options={{
          tabBarLabel: 'Create',
          // We'll add icons later
        }}
        listeners={({ navigation }) => ({
          tabPress: e => {
            // Prevent default navigation
            e.preventDefault();
            // Navigate to CreatePost screen as modal
            navigation.navigate(Routes.CREATE_POST);
          },
        })}
      />
      <Tab.Screen
        name={Routes.PROFILE}
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          // We'll add icons later
        }}
      />
      <Tab.Screen
        name={Routes.SETTINGS}
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Settings',
          // We'll add icons later
        }}
      />
    </Tab.Navigator>
  );
};

// Empty component for the Create tab (we never actually navigate to this)
const EmptyComponent = () => <View />;

// Loading Screen component
const LoadingScreen = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#3498db" />
  </View>
);

// Main App Navigator
const AppNavigator = (): React.JSX.Element => {
  const { isAuthenticated, isLoading, loadUserFromToken } = useAuth();

  // Load user data from token if it exists
  React.useEffect(() => {
    loadUserFromToken();
  }, []);

  return (
    <NavigationContainer>
      {isLoading ? (
        <LoadingScreen />
      ) : (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {isAuthenticated ? (
            <>
              <Stack.Screen
                name={Routes.MAIN_TAB_NAVIGATOR}
                component={MainTabNavigator}
              />
              <Stack.Screen
                name={Routes.CREATE_POST}
                component={CreatePostScreen}
                options={{
                  presentation: 'modal',
                  headerShown: false,
                  animation: 'slide_from_bottom',
                }}
              />
              <Stack.Screen
                name={Routes.POST_DETAILS}
                component={PostDetailsScreen}
                options={{
                  headerShown: false,
                  animation: 'slide_from_right',
                }}
              />
            </>
          ) : (
            <Stack.Screen name={Routes.AUTH_STACK} component={AuthNavigator} />
          )}
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});

export default AppNavigator;
