import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Post } from '../../types/post';
import { formatDistanceToNow } from 'date-fns';
import { PROFILE } from '../../navigation/routes';
import { useTheme } from '../../theme/ThemeContext';

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
          <Text style={[styles.userName, { color: theme.colors.text }]}>
            {post.author?.name || post.author?.preferredUsername || 'Anonymous'}
          </Text>
          <Text
            style={[styles.timestamp, { color: theme.colors.textSecondary }]}
          >
            {formattedDate}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Post Content */}
      <View style={styles.contentContainer}>
        <Text style={[styles.content, { color: theme.colors.text }]}>
          {post.content}
        </Text>
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
          <Text
            style={[
              styles.engagementText,
              { color: theme.colors.textSecondary },
              post.likedByUser && { color: theme.colors.primary },
            ]}
          >
            ♥ {post.likes || 0} Likes
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.engagementButton}
          onPress={handleCommentPress}
        >
          <Text
            style={[
              styles.engagementText,
              { color: theme.colors.textSecondary },
            ]}
          >
            💬 {post.shares || 0} Comments
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontWeight: '600',
    fontSize: 16,
  },
  timestamp: {
    fontSize: 12,
    marginTop: 2,
  },
  contentContainer: {
    marginBottom: 12,
  },
  content: {
    fontSize: 16,
    lineHeight: 22,
  },
  mediaContainer: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  media: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 12,
  },
  engagementBar: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    borderTopWidth: 1,
    paddingTop: 12,
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
