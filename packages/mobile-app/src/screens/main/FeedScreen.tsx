import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Components
import PostCard from '../../components/feed/PostCard';

// Services
import { postService } from '../../services/postService';

// Types
import { Post } from '../../types/post';
import { ApiError } from '../../types/api';

/**
 * FeedScreen Component
 * Displays a feed of posts with pull-to-refresh and error handling
 */
const FeedScreen: React.FC = () => {
  const navigation = useNavigation();

  // State
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch feed posts
  const fetchFeedPosts = useCallback(async () => {
    try {
      const fetchedPosts = await postService.fetchFeedPosts();
      setPosts(fetchedPosts);
      setError(null);
    } catch (error) {
      const apiError = error as ApiError;
      setError(apiError.message || 'Failed to load posts. Please try again.');
      console.error('Error fetching feed posts:', error);
    }
  }, []);

  // Initial load
  useEffect(() => {
    setIsLoading(true);
    fetchFeedPosts().finally(() => setIsLoading(false));
  }, [fetchFeedPosts]);

  // Refresh feed when screen comes into focus (e.g., after creating a post)
  useFocusEffect(
    useCallback(() => {
      // Only refresh if we've already loaded posts once (avoid double loading on initial render)
      if (!isLoading && posts.length > 0) {
        fetchFeedPosts();
      }
    }, [fetchFeedPosts, isLoading, posts.length])
  );

  // Handle pull-to-refresh
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await fetchFeedPosts();
    } catch (error) {
      console.error('Error refreshing feed:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchFeedPosts]);

  // Handle post interactions
  const handlePostPress = useCallback(
    (postId: string) => {
      navigation.navigate('PostDetails', { postId });
    },
    [navigation]
  );

  const handleLikePress = useCallback(
    async (postId: string) => {
      try {
        // Find the post in the current state
        const postIndex = posts.findIndex(post => post.id === postId);
        if (postIndex === -1) return;

        const post = posts[postIndex];
        const updatedPosts = [...posts];

        // Toggle like status optimistically
        if (post.liked) {
          // Unlike the post
          updatedPosts[postIndex] = {
            ...post,
            liked: false,
            likeCount: (post.likeCount || 0) - 1,
          };
          setPosts(updatedPosts);

          // Call API
          await postService.unlikePost(postId);
        } else {
          // Like the post
          updatedPosts[postIndex] = {
            ...post,
            liked: true,
            likeCount: (post.likeCount || 0) + 1,
          };
          setPosts(updatedPosts);

          // Call API
          await postService.likePost(postId);
        }
      } catch (error) {
        console.error('Error toggling like:', error);
        // Revert the optimistic update by fetching fresh data
        fetchFeedPosts();
      }
    },
    [posts, fetchFeedPosts]
  );

  const handleCommentPress = useCallback(
    (postId: string) => {
      navigation.navigate('PostDetails', { postId, focusComment: true });
    },
    [navigation]
  );

  // Render post item
  const renderPostItem = ({ item }: { item: Post }) => (
    <PostCard
      post={item}
      onPostPress={handlePostPress}
      onLikePress={handleLikePress}
      onCommentPress={handleCommentPress}
    />
  );

  // Render empty state
  const renderEmptyComponent = () => {
    if (isLoading) return null;

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No posts yet.</Text>
        <Text style={styles.emptySubtext}>
          Follow more users or check back later.
        </Text>
      </View>
    );
  };

  // Render error state
  const renderErrorComponent = () => {
    if (!error) return null;

    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => {
            setIsLoading(true);
            fetchFeedPosts().finally(() => setIsLoading(false));
          }}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Loading State */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3498db" />
        </View>
      ) : (
        <>
          {error ? (
            renderErrorComponent()
          ) : (
            <FlatList
              data={posts}
              renderItem={renderPostItem}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.listContainer}
              ListEmptyComponent={renderEmptyComponent}
              refreshControl={
                <RefreshControl
                  refreshing={isRefreshing}
                  onRefresh={handleRefresh}
                  colors={['#3498db']}
                  tintColor="#3498db"
                />
              }
            />
          )}
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 100, // Extra padding at bottom for better UX
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#555',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#777',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#e74c3c',
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#3498db',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default FeedScreen;
