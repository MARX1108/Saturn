import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from './types';
import FeedScreen from '../screens/main/FeedScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import SettingsScreen from '../screens/main/SettingsScreen';
// Import icons later (e.g., from react-native-vector-icons)
// import Icon from 'react-native-vector-icons/Ionicons';

const Tab = createBottomTabNavigator<MainTabParamList>();

// Placeholder component for the middle button action
const CreatePostPlaceholderComponent = () => null;

const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: true, // Show headers for tab screens for now
        // tabBarIcon: ({ focused, color, size }) => {
        //   let iconName = 'ellipse-outline'; // Default icon
        //   if (route.name === 'FeedTab') {
        //     iconName = focused ? 'home' : 'home-outline';
        //   } else if (route.name === 'ProfileTab') {
        //     iconName = focused ? 'person-circle' : 'person-circle-outline';
        //   } else if (route.name === 'SettingsTab') {
        //     iconName = focused ? 'settings' : 'settings-outline';
        //   } else if (route.name === 'CreatePostPlaceholder') {
        //     iconName = focused ? 'add-circle' : 'add-circle-outline';
        //     // Apply different styling for the middle button if needed
        //   }
        //   return <Icon name={iconName} size={size} color={color} />;
        // },
        tabBarActiveTintColor: 'tomato', // Replace with theme color later
        tabBarInactiveTintColor: 'gray', // Replace with theme color later
      })}
    >
      <Tab.Screen
        name="FeedTab"
        component={FeedScreen}
        options={{ title: 'Feed' }}
      />
      <Tab.Screen
        name="CreatePostPlaceholder"
        component={CreatePostPlaceholderComponent} // Placeholder component
        options={{ title: 'Create', tabBarLabel: '' }} // No label, maybe just icon
        listeners={({ navigation }) => ({
          tabPress: e => {
            // Prevent default action (going to an empty screen)
            e.preventDefault();
            // Navigate to the actual Create Post Modal/Screen
            // This assumes 'CreatePostModal' is defined in RootStackParamList
            // navigation.navigate('CreatePostModal');
            console.log('Navigate to Create Post Modal (Not Implemented)');
          },
        })}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{ title: 'Profile' }}
        // Example: Set initial params if needed, maybe fetch own username from state
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
