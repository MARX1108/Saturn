import React, { useEffect, useRef } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  useNavigation,
  CompositeNavigationProp,
  CommonActions,
  useIsFocused,
} from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainTabParamList, RootStackParamList } from './types';
import FeedScreen from '../screens/main/FeedScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import SettingsScreen from '../screens/main/SettingsScreen';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { Alert } from 'react-native';
import { useAppSelector } from '../store/hooks';

const Tab = createBottomTabNavigator<MainTabParamList>();

// Placeholder component for the middle button action
const CreatePostPlaceholderComponent = (): null => null;

// Define composite navigation prop type
type MainTabNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'CreatePostPlaceholder'>,
  NativeStackNavigationProp<RootStackParamList>
>;

const MainTabNavigator = (): React.JSX.Element => {
  const { isLoading, error, data: currentUser } = useCurrentUser();
  const navigation = useNavigation<MainTabNavigationProp>();
  const isFocused = useIsFocused();
  const profileCheckPerformed = useRef(false);
  const profileComplete = useAppSelector((state) => state.auth.profileComplete);

  useEffect(() => {
    if (isLoading) {
      console.log('[MainTabNavigator] Loading current user...');
    }
    if (error) {
      console.log(
        '[MainTabNavigator] Error loading current user:',
        error?.message
      );
    }
    if (currentUser) {
      console.log(
        '[MainTabNavigator] Current user data available:',
        currentUser.username
      );
    }
  }, [isLoading, error, currentUser]);

  // Profile completeness check and navigation
  useEffect(() => {
    if (
      isFocused &&
      !isLoading &&
      currentUser &&
      !profileCheckPerformed.current
    ) {
      console.log(
        `[MainTabNavigator] Profile completeness check for ${currentUser.username}: ${profileComplete}`
      );

      if (!profileComplete) {
        console.log(
          `[MainTabNavigator] Navigating to ProfileTab for ${currentUser.username} to complete profile.`
        );
        profileCheckPerformed.current = true; // Mark check performed

        // Use try-catch for navigation robustness
        try {
          // Use CommonActions to navigate between tabs
          navigation.dispatch(
            CommonActions.navigate({
              name: 'ProfileTab',
              params: { username: currentUser.username },
            })
          );
        } catch (navError) {
          console.error(
            '[MainTabNavigator] Error navigating to profile tab:',
            navError
          );
          // Allow retry if navigation fails
          profileCheckPerformed.current = false;
        }
      } else {
        profileCheckPerformed.current = true; // Mark check performed
      }
    }
  }, [isFocused, currentUser, isLoading, navigation, profileComplete]);

  // Reset the check when the component unmounts
  useEffect(() => {
    return () => {
      profileCheckPerformed.current = false;
    };
  }, []);

  const handleCreatePostPress = (): void => {
    console.log('DEBUG - Attempting to navigate to CreatePostModal');
    // Use multiple approaches to ensure the navigation works
    try {
      // Try the standard navigate method
      navigation.navigate('CreatePostModal');
    } catch (error) {
      console.error('Error navigating to CreatePostModal:', error);
      // Try using CommonActions as a fallback
      try {
        navigation.dispatch(
          CommonActions.navigate({
            name: 'CreatePostModal',
          })
        );
      } catch (dispatchError) {
        console.error('Error with CommonActions dispatch:', dispatchError);
        Alert.alert('Navigation Error', 'Could not open create post screen');
      }
    }
  };

  return (
    <Tab.Navigator
      screenOptions={(): {
        headerShown: boolean;
        tabBarActiveTintColor: string;
        tabBarInactiveTintColor: string;
      } => ({
        headerShown: true, // Show headers for tab screens for now
        tabBarActiveTintColor: 'tomato',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen
        name="FeedTab"
        component={FeedScreen}
        options={{ title: 'Feed' }}
      />
      <Tab.Screen
        name="CreatePostPlaceholder"
        component={CreatePostPlaceholderComponent}
        options={{ title: 'Create', tabBarLabel: '' }}
        listeners={{
          tabPress: (e): void => {
            e.preventDefault();
            handleCreatePostPress();
            console.log('Navigating to Create Post Modal');
          },
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{ title: 'Profile' }}
        initialParams={{
          // Use the current user's username if available, otherwise use a test value
          username: currentUser?.username || 'testuser',
        }}
      />
      <Tab.Screen
        name="SettingsTab"
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;
