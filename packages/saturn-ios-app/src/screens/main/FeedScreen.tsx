import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  FlatList,
  SafeAreaView,
  View,
  Text,
  ActivityIndicator,
  RefreshControl,
  Button,
  Alert,
} from 'react-native';
import { useNavigation, CommonActions } from '@react-navigation/native'; // Import CommonActions
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs'; // Import navigation prop type
import { MainTabParamList } from '../../navigation/types'; // Import MainTabParamList
import PostCard from '../../components/PostCard';
import PostCardSkeleton from '../../components/PostCardSkeleton';
import { Post } from '../../types/post';
import { useGetFeedQuery } from '../../store/api';
import * as Haptics from 'expo-haptics'; // Add Haptics import

// Define colors to avoid inline literals
const COLORS = {
  LIGHT_GRAY: '#f0f0f0',
  RED: 'red',
  ORANGE: '#ff8c00',
};

// Define the specific navigation prop type for this screen
type FeedScreenNavigationProp = BottomTabNavigationProp<
  MainTabParamList,
  'FeedTab'
>;

export default function FeedScreen(): React.JSX.Element {
  const navigation = useNavigation<FeedScreenNavigationProp>(); // Use typed navigation hook
  const [errorVisible, setErrorVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const {
    data: posts, // Rename data to posts for clarity
    isLoading, // Initial load state
    isError,
    error,
    refetch, // Function to refetch data
    isFetching, // State for pull-to-refresh
  } = useGetFeedQuery();

  // Handle errors and set messages
  useEffect(() => {
    if (isError && error) {
      let message = 'Error loading feed. Please try again.';
      if (error.message) {
        message = error.message;
      }
      setErrorMessage(message);
      setErrorVisible(true);
    } else {
      setErrorVisible(false);
    }
  }, [isError, error]);

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
    setErrorVisible(false);
    refetch();
  };

  // Enhanced refresh handler with haptic feedback
  const handleRefresh = useCallback((): void => {
    // Trigger light impact haptic feedback when pull-to-refresh is initiated
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    setErrorVisible(false);
    refetch();
  }, [refetch]);

  // --- Conditional Rendering based on query state ---
  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <PostCardSkeleton />
        <PostCardSkeleton />
        <PostCardSkeleton />
        <PostCardSkeleton />
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
      {errorVisible && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{errorMessage}</Text>
          <Button title="Retry" onPress={handleRetry} />
        </View>
      )}

      <FlatList
        testID="feed-flatlist"
        data={postsData}
        renderItem={renderItem}
        keyExtractor={(item): string => item.id || Math.random().toString()}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.centerContent}>
            <Text>No posts yet. Follow some users!</Text>
            <Button title="Refresh" onPress={handleRetry} />
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={isFetching && !isLoading} // Use isFetching for pull-to-refresh indicator
            onRefresh={handleRefresh} // Call enhanced refresh handler with haptics
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.LIGHT_GRAY,
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
    color: 'white',
    textAlign: 'center',
    marginBottom: 10,
  },
  errorBanner: {
    backgroundColor: COLORS.ORANGE,
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
});
