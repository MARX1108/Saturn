import React from 'react';
import {
  StyleSheet,
  FlatList,
  SafeAreaView,
  View,
  Text,
  ActivityIndicator,
  RefreshControl,
  Button,
} from 'react-native';
import { useNavigation } from '@react-navigation/native'; // Import useNavigation
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs'; // Import navigation prop type
import { MainTabParamList } from '../../navigation/types'; // Import MainTabParamList
import PostCard from '../../components/PostCard';
import { Post } from '../../types/post';
import { useFeedPosts } from '../../hooks/useFeedPosts'; // Import the hook

// Define the specific navigation prop type for this screen
type FeedScreenNavigationProp = BottomTabNavigationProp<
  MainTabParamList,
  'FeedTab'
>;

export default function FeedScreen(): React.JSX.Element {
  const navigation = useNavigation<FeedScreenNavigationProp>(); // Use typed navigation hook
  const {
    data: posts, // Rename data to posts for clarity
    isLoading, // Initial load state
    isError,
    error,
    isRefetching, // State for pull-to-refresh
    refetch, // Function to refetch data
  } = useFeedPosts();

  // Navigation handler for author profile
  const handleAuthorPress = (username: string): void => {
    console.log(`Navigating to profile: ${username}`);
    navigation.navigate('ProfileTab', { username });
  };

  // Render item function for FlatList
  const renderItem = ({ item }: { item: Post }) => (
    <PostCard post={item} onAuthorPress={handleAuthorPress} />
  );

  // Function to handle retry button press
  const handleRetry = (): void => {
    void refetch();
  };

  // Handle refresh for RefreshControl (no async needed)
  const handleRefresh = (): void => {
    void refetch();
  };

  // --- Conditional Rendering based on query state ---

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.centerContent]}>
        <ActivityIndicator size="large" />
        <Text>Loading Feed...</Text>
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.centerContent]}>
        <Text style={styles.errorText}>Error loading feed:</Text>
        <Text style={styles.errorText}>
          {error?.message || 'Unknown error'}
        </Text>
        <Button title="Retry" onPress={handleRetry} />
      </SafeAreaView>
    );
  }

  // --- Render Feed List ---
  // Ensure posts is always an array
  const postsData = Array.isArray(posts) ? posts : [];

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={postsData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.centerContent}>
            <Text>No posts yet. Follow some users!</Text>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={isRefetching} // Use isRefetching for pull-to-refresh indicator
            onRefresh={handleRefresh} // Call refetch on pull
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexGrow: 1, // Ensure ListEmptyComponent can center if list is short
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
  },
});
