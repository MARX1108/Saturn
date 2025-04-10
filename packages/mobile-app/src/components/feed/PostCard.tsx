import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Post } from '../../types/post';
import { formatDistanceToNow } from 'date-fns';
import { PROFILE } from '../../navigation/routes';

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

  return (
    <TouchableOpacity
      style={styles.container}
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
          <Text style={styles.userName}>
            {post.author?.name || post.author?.preferredUsername || 'Anonymous'}
          </Text>
          <Text style={styles.timestamp}>{formattedDate}</Text>
        </TouchableOpacity>
      </View>

      {/* Post Content */}
      <View style={styles.contentContainer}>
        <Text style={styles.content}>{post.content}</Text>
      </View>

      {/* Post Media (if exists) */}
      {post.mediaUrl && (
        <Image
          source={{ uri: post.mediaUrl }}
          style={styles.media}
          resizeMode="cover"
        />
      )}

      {/* Engagement Bar */}
      <View style={styles.engagementBar}>
        <TouchableOpacity
          style={styles.engagementButton}
          onPress={handleLikePress}
        >
          <Text style={[styles.engagementText, post.liked && styles.likedText]}>
            ♥ {post.likeCount || 0} Likes
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.engagementButton}
          onPress={handleCommentPress}
        >
          <Text style={styles.engagementText}>
            💬 {post.commentCount || 0} Comments
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
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
    backgroundColor: '#f0f0f0', // Placeholder background
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontWeight: '600',
    fontSize: 16,
    color: '#333',
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  contentContainer: {
    marginBottom: 12,
  },
  content: {
    fontSize: 16,
    lineHeight: 22,
    color: '#333',
  },
  media: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  engagementBar: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  engagementButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  engagementText: {
    fontSize: 14,
    color: '#666',
  },
  likedText: {
    color: '#e74c3c',
  },
});

export default PostCard;
