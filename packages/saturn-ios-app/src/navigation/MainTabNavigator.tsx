import React, { useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from './types';
import FeedScreen from '../screens/main/FeedScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import SettingsScreen from '../screens/main/SettingsScreen';
import { useCurrentUser } from '../hooks/useCurrentUser';

const Tab = createBottomTabNavigator<MainTabParamList>();

// Placeholder component for the middle button action
const CreatePostPlaceholderComponent = (): null => null;

const MainTabNavigator = (): React.JSX.Element => {
  const { isLoading, error, data } = useCurrentUser();

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
    if (data) {
      console.log(
        '[MainTabNavigator] Current user data available:',
        data.username
      );
    }
  }, [isLoading, error, data]);

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
        listeners={() => ({
          tabPress: (e): void => {
            e.preventDefault();
            console.log('Navigate to Create Post Modal (Not Implemented)');
          },
        })}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{ title: 'Profile' }}
        initialParams={{ username: 'myUsername' }}
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
