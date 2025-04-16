import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Post } from '../../types/post';
import { formatDistanceToNow } from 'date-fns';
import { PROFILE } from '../../navigation/routes';
import { useTheme } from '../../theme/ThemeContext';
import StyledText from '../ui/StyledText';

interface PostCardProps {
  post: Post;
  onLikePress?: (postId: string) => void;
  onCommentPress?: (postId: string) => void;
  onPostPress?: (postId: string) => void;
  onAuthorPress?: (username: string) => void;
}

const PostCard: React.FC<PostCardProps> = ({
  post,
  onLikePress,
  onCommentPress,
  onPostPress,
  onAuthorPress,
}) => {
  const navigation = useNavigation();
  const theme = useTheme();

  // Format the timestamp
  const formattedDate = post.createdAt
    ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })
    : '';

  // Handle interactions
  const handlePostPress = () => {
    if (onPostPress) {
      onPostPress(post.id);
    }
  };

  const handleLikePress = () => {
    if (onLikePress) {
      onLikePress(post.id);
    }
  };

  const handleCommentPress = () => {
    if (onCommentPress) {
      onCommentPress(post.id);
    }
  };

  const handleAuthorPress = () => {
    const username = post.author?.preferredUsername;
    if (username) {
      if (onAuthorPress) {
        onAuthorPress(username);
      } else {
        // Default navigation if no custom handler provided
        navigation.navigate(PROFILE as never, { username } as never);
      }
    }
  };

  // Check if post has a valid image attachment
  const hasImageAttachment =
    post.attachments?.length > 0 &&
    post.attachments[0].type === 'Image' &&
    post.attachments[0].url;

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      activeOpacity={0.9}
      onPress={handlePostPress}
    >
      {/* User Info Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleAuthorPress}>
          <Image
            source={
              post.author?.icon?.url
                ? { uri: post.author.icon.url }
                : require('../../../assets/icon.png') // Fallback image
            }
            style={styles.avatar}
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.userInfo} onPress={handleAuthorPress}>
          <StyledText
            weight="semibold"
            color={theme.colors.text}
            style={styles.userName}
          >
            {post.author?.name || post.author?.preferredUsername || 'Anonymous'}
          </StyledText>
          <StyledText
            weight="regular"
            color={theme.colors.textSecondary}
            style={styles.timestamp}
          >
            {formattedDate}
          </StyledText>
        </TouchableOpacity>
      </View>

      {/* Post Content */}
      <View style={styles.contentContainer}>
        <StyledText
          weight="regular"
          color={theme.colors.text}
          style={styles.content}
        >
          {post.content}
        </StyledText>
      </View>

      {/* Post Media (if exists) */}
      {hasImageAttachment && (
        <View style={styles.mediaContainer}>
          <Image
            source={{ uri: post.attachments[0].url }}
            style={styles.media}
            resizeMode="cover"
            accessibilityLabel="Post image"
            onError={e =>
              console.warn(
                'Failed to load post image:',
                post.attachments[0].url,
                e.nativeEvent.error
              )
            }
          />
        </View>
      )}

      {/* Engagement Bar */}
      <View
        style={[styles.engagementBar, { borderTopColor: theme.colors.border }]}
      >
        <TouchableOpacity
          style={styles.engagementButton}
          onPress={handleLikePress}
        >
          <StyledText
            weight="medium"
            color={
              post.likedByUser
                ? theme.colors.instagramLikeRed
                : theme.colors.textSecondary
            }
            style={styles.engagementText}
          >
            ♥ {post.likes || 0} Likes
          </StyledText>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.engagementButton}
          onPress={handleCommentPress}
        >
          <StyledText
            weight="medium"
            color={theme.colors.textSecondary}
            style={styles.engagementText}
          >
            💬 {post.shares || 0} Comments
          </StyledText>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 0,
    padding: 0,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#DBDBDB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
  },
  timestamp: {
    fontSize: 12,
    marginTop: 2,
  },
  contentContainer: {
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  content: {
    fontSize: 14,
    lineHeight: 20,
  },
  mediaContainer: {
    width: '100%',
    aspectRatio: 1,
  },
  media: {
    width: '100%',
    height: '100%',
  },
  engagementBar: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    borderTopWidth: 1,
    padding: 12,
  },
  engagementButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  engagementText: {
    fontSize: 14,
  },
});

export default PostCard;
