import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, ScrollView } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '../../navigation/types';
import { Post } from '../../types/post';
import postService from '../../services/postService';
import ScreenWrapper from '../../components/ui/ScreenWrapper';
import PostCard from '../../components/feed/PostCard';
import StyledText from '../../components/ui/StyledText';
import { COLOR_PALETTE } from '../../theme/colors';
import ErrorMessage from '../../components/ui/ErrorMessage';
import BackButton from '../../components/ui/BackButton';

type PostDetailsRouteProp = RouteProp<MainStackParamList, 'PostDetails'>;
type PostDetailsNavigationProp = NativeStackNavigationProp<MainStackParamList>;

const PostDetailsScreen: React.FC = () => {
  const navigation = useNavigation<PostDetailsNavigationProp>();
  const route = useRoute<PostDetailsRouteProp>();

  // Get postId from route params
  const { postId } = route.params;

  // State management
  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch post data on component mount
  useEffect(() => {
    const fetchPostDetails = async () => {
      if (!postId) {
        setError('Post ID is missing');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const postData = await postService.getPostById(postId);
        setPost(postData);
      } catch (err) {
        console.error('Error fetching post details:', err);
        setError('Failed to load post details. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPostDetails();
  }, [postId]);

  // Navigation handler for back button
  const handleGoBack = () => {
    navigation.goBack();
  };

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <BackButton onPress={handleGoBack} />
        <StyledText style={styles.headerTitle}>Post</StyledText>
      </View>

      <ScrollView style={styles.container}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLOR_PALETTE.primary} />
          </View>
        ) : error ? (
          <ErrorMessage message={error} />
        ) : post ? (
          <View style={styles.contentContainer}>
            <PostCard post={post} detailed />

            {/* Comments section placeholder */}
            <View style={styles.commentsSection}>
              <StyledText style={styles.commentsTitle}>Comments</StyledText>
              <View style={styles.commentsList}>
                <StyledText style={styles.commentsPlaceholder}>
                  Comments functionality coming soon
                </StyledText>
              </View>
            </View>
          </View>
        ) : (
          <ErrorMessage message="Post not found" />
        )}
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLOR_PALETTE.borderLight,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  contentContainer: {
    flex: 1,
  },
  commentsSection: {
    padding: 16,
    backgroundColor: COLOR_PALETTE.backgroundSecondary,
  },
  commentsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  commentsList: {
    marginTop: 8,
  },
  commentsPlaceholder: {
    color: COLOR_PALETTE.textSecondary,
    fontStyle: 'italic',
  },
});

export default PostDetailsScreen;
