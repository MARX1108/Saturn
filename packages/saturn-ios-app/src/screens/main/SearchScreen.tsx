import React, { useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TextInput,
  Platform,
} from 'react-native';

export default function SearchScreen(): React.JSX.Element {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    if (query.length > 0) {
      console.log('Search query:', query);
    }
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
        {searchQuery.length > 0 ? (
          <Text
            style={styles.placeholderText}
            testID="search-results-placeholder"
          >
            {`Searching for "${searchQuery}"...`}
          </Text>
        ) : (
          <Text
            style={styles.placeholderText}
            testID="search-results-placeholder"
          >
            Enter a query to search for users.
          </Text>
        )}
        <View style={styles.debugContainer} testID="search-debug-container">
          <Text testID="search-debug-text">
            Debug info: SearchScreen is rendering
          </Text>
        </View>
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  placeholderText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 16,
  },
  debugContainer: {
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
});
