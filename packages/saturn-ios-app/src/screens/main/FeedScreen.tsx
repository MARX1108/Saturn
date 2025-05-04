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
import { useNavigation, CommonActions } from '@react-navigation/native'; // Import CommonActions
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
    refetch, // Function to refetch data
    isRefetching, // State for pull-to-refresh
  } = useFeedPosts();

  // Navigation handler for author profile
  const handleAuthorPress = (username: string): void => {
    console.log(`Navigating to profile: ${username}`);
    navigation.dispatch(
      CommonActions.navigate({
        name: 'ProfileTab',
        params: { username },
      })
    );
  };

  // Render item function for FlatList
  const renderItem = ({ item }: { item: Post }): React.JSX.Element => (
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
    // Use a static error message for simplicity
    const errorMessage = 'Error loading feed. Please try again.';

    return (
      <SafeAreaView style={[styles.safeArea, styles.centerContent]}>
        <Text style={styles.errorText}>Error loading feed:</Text>
        <Text style={styles.errorText}>{errorMessage}</Text>
        <Button title="Retry" onPress={handleRetry} />
      </SafeAreaView>
    );
  }

  // --- Render Feed List ---
  // Ensure posts is always an array with proper typing
  const postsData: Post[] = [];
  if (Array.isArray(posts)) {
    // Only add items that match the Post type
    posts.forEach((post) => {
      if (post && typeof post === 'object' && 'id' in post) {
        postsData.push(post);
      }
    });
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        testID="feed-flatlist"
        data={postsData}
        renderItem={renderItem}
        keyExtractor={(item): string => item.id}
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
