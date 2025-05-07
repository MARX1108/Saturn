import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TextInput,
  Platform,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from '../../navigation/types';
import { useUserSearch } from '../../hooks/useUserSearch';
import UserSearchResultItem from '../../components/UserSearchResultItem';
import { User } from '../../types/user';

type SearchScreenNavigationProp = BottomTabNavigationProp<
  MainTabParamList,
  'SearchTab'
>;

export default function SearchScreen(): React.JSX.Element {
  const [searchQuery, setSearchQuery] = useState('');
  const navigation = useNavigation<SearchScreenNavigationProp>();

  // Use the search hook
  const { data: users, isLoading, isError, error } = useUserSearch(searchQuery);

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    // API call is now handled by useUserSearch hook via debouncedQuery
  };

  const handleProfilePress = (username: string) => {
    navigation.navigate('ProfileTab', { username });
  };

  // Log results for now
  useEffect(() => {
    if (isLoading) {
      console.log('[SearchScreen] Searching for users...');
    }
    if (isError) {
      console.error('[SearchScreen] Error searching users:', error?.message);
    }
    if (users) {
      console.log(
        '[SearchScreen] Search results:',
        users.length > 0 ? users : 'No users found.'
      );
    }
  }, [users, isLoading, isError, error]);

  const renderResultItem = ({ item }: { item: User }) => (
    <UserSearchResultItem user={item} onPress={handleProfilePress} />
  );

  const renderContent = () => {
    if (isLoading) {
      return (
        <View
          style={styles.centerContainer}
          testID="search-loading-indicator-container"
        >
          <ActivityIndicator
            size="large"
            color="#0000ff"
            testID="search-loading-indicator"
          />
        </View>
      );
    }

    if (isError) {
      return (
        <View style={styles.centerContainer} testID="search-error-container">
          <Text style={styles.errorText} testID="search-error-text">
            Error: {error?.message || 'Could not fetch results'}
          </Text>
        </View>
      );
    }

    if (searchQuery.length < 2) {
      return (
        <View
          style={styles.centerContainer}
          testID="search-minimum-chars-container"
        >
          <Text
            style={styles.placeholderText}
            testID="search-results-placeholder"
          >
            Enter at least 2 characters to search.
          </Text>
        </View>
      );
    }

    if (!users || users.length === 0) {
      return (
        <View
          style={styles.centerContainer}
          testID="search-no-results-container"
        >
          <Text
            style={styles.placeholderText}
            testID="search-results-placeholder"
          >
            No users found for &quot;{searchQuery}&quot;.
          </Text>
        </View>
      );
    }

    return (
      <FlatList
        data={users}
        renderItem={renderResultItem}
        keyExtractor={(item) => item.id}
        testID="search-results-list"
        contentContainerStyle={styles.listContainer}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container} testID="search-screen-container">
      <Text style={styles.headerText} testID="search-screen-header">
        User Search
      </Text>
      <View style={styles.inputContainer} testID="search-input-container">
        <TextInput
          style={styles.textInput}
          placeholder="Search users by username or display name..."
          placeholderTextColor="#666666"
          value={searchQuery}
          onChangeText={handleSearchChange}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          testID="search-input-field"
        />
      </View>
      <View style={styles.resultsContainer} testID="search-results-container">
        {renderContent()}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerText: {
    fontSize: 24,
    color: '#121212',
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 16,
  },
  inputContainer: {
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
  },
  textInput: {
    fontSize: 16,
    padding: Platform.OS === 'ios' ? 12 : 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    color: '#121212',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  resultsContainer: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  listContainer: {
    paddingVertical: 8,
  },
  placeholderText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#ff0000',
    textAlign: 'center',
    marginBottom: 16,
  },
});
