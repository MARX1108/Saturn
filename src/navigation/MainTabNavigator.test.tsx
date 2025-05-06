import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import MainTabNavigator from './MainTabNavigator';

// Mock the screens
jest.mock('../screens/main/SearchScreen', () => {
  const React = require('react');
  const { View, Text, TextInput } = require('react-native');

  return function MockSearchScreen() {
    const [query, setQuery] = React.useState('');
    return (
      <View testID="search-screen">
        <Text testID="search-header">User Search</Text>
        <TextInput
          testID="search-input"
          placeholder="Search users by username or display name..."
          value={query}
          onChangeText={setQuery}
        />
        <Text testID="search-placeholder">
          {query
            ? `Searching for "${query}"...`
            : 'Enter a query to search for users.'}
        </Text>
      </View>
    );
  };
});

jest.mock('../screens/main/FeedScreen', () => {
  const React = require('react');
  const { View, Text } = require('react-native');
  return function MockFeedScreen() {
    return (
      <View testID="feed-screen">
        <Text>Feed Screen</Text>
      </View>
    );
  };
});

jest.mock('../screens/main/ProfileScreen', () => {
  const React = require('react');
  const { View, Text } = require('react-native');
  return function MockProfileScreen() {
    return (
      <View testID="profile-screen">
        <Text>Profile Screen</Text>
      </View>
    );
  };
});

jest.mock('../screens/main/SettingsScreen', () => {
  const React = require('react');
  const { View, Text } = require('react-native');
  return function MockSettingsScreen() {
    return (
      <View testID="settings-screen">
        <Text>Settings Screen</Text>
      </View>
    );
  };
});

describe('MainTabNavigator', () => {
  it('renders with SearchTab as initial route', async () => {
    const { findByTestId, queryByTestId } = render(
      <NavigationContainer>
        <MainTabNavigator />
      </NavigationContainer>
    );

    // SearchScreen should be visible as the initial screen
    const searchScreen = await findByTestId('search-screen');
    expect(searchScreen).toBeTruthy();

    // Check that the search header and placeholder are shown
    const searchHeader = await findByTestId('search-header');
    const searchPlaceholder = await findByTestId('search-placeholder');

    expect(searchHeader).toBeTruthy();
    expect(searchPlaceholder).toBeTruthy();
    expect(searchPlaceholder.props.children).toBe(
      'Enter a query to search for users.'
    );

    // The other screens should not be visible initially
    expect(queryByTestId('feed-screen')).toBeNull();
    expect(queryByTestId('profile-screen')).toBeNull();
    expect(queryByTestId('settings-screen')).toBeNull();
  });
});
