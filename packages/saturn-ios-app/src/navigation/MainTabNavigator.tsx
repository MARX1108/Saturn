import React, { useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  useNavigation,
  CompositeNavigationProp,
  CommonActions,
} from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainTabParamList, RootStackParamList } from './types';
import FeedScreen from '../screens/main/FeedScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import SettingsScreen from '../screens/main/SettingsScreen';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { Alert } from 'react-native';

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

  const handleCreatePostPress = () => {
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
      screenOptions={() => ({
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
