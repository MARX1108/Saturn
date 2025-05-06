import React, { useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { MainTabParamList } from './types';
import FeedScreen from '../screens/main/FeedScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import SettingsScreen from '../screens/main/SettingsScreen';
import SearchScreen from '../screens/main/SearchScreen';
// Import icons later (e.g., from react-native-vector-icons)
// import Icon from 'react-native-vector-icons/Ionicons';

const Tab = createBottomTabNavigator<MainTabParamList>();

// Placeholder component for the middle button action
const CreatePostPlaceholderComponent = () => null;

const MainTabNavigator = () => {
  const navigation = useNavigation();

  // Log when component mounts to verify tabs are being initialized
  useEffect(() => {
    console.log(
      'MainTabNavigator mounted - Setting initial route to SearchTab'
    );
    // After a short delay, log that tabs should be ready
    setTimeout(() => {
      console.log('SearchTab should now be visible');
    }, 1000);
  }, []);

  return (
    <Tab.Navigator
      initialRouteName="SearchTab"
      screenOptions={({ route }) => ({
        headerShown: true,
        tabBarActiveTintColor: 'tomato',
        tabBarInactiveTintColor: 'gray',
        // tabBarIcon: ({ focused, color, size }) => {
        //   let iconName = 'ellipse-outline'; // Default icon
        //   if (route.name === 'FeedTab') {
        //     iconName = focused ? 'home' : 'home-outline';
        //   } else if (route.name === 'SearchTab') {
        //     iconName = focused ? 'search' : 'search-outline';
        //   } else if (route.name === 'ProfileTab') {
        //     iconName = focused ? 'person-circle' : 'person-circle-outline';
        //   } else if (route.name === 'SettingsTab') {
        //     iconName = focused ? 'settings' : 'settings-outline';
        //   } else if (route.name === 'CreatePostPlaceholder') {
        //     iconName = focused ? 'add-circle' : 'add-circle-outline';
        //   }
        //   return <Icon name={iconName} size={size} color={color} />;
        // },
      })}
    >
      <Tab.Screen
        name="FeedTab"
        component={FeedScreen}
        options={{ title: 'Feed' }}
      />
      <Tab.Screen
        name="SearchTab"
        component={SearchScreen}
        options={{
          title: 'Search',
          headerTitle: 'User Search',
        }}
      />
      <Tab.Screen
        name="CreatePostPlaceholder"
        component={CreatePostPlaceholderComponent}
        options={{ title: 'Create', tabBarLabel: '' }}
        listeners={({ navigation }) => ({
          tabPress: e => {
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
