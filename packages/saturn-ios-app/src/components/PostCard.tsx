import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Post } from '../types/post'; // Import the Post type

// Props now take a single 'post' object
interface PostCardProps {
  post: Post;
  // Add onAuthorPress prop
  onAuthorPress?: (username: string) => void;
  // Add other onPress handlers later, e.g.:
  // onLikePress?: (postId: string) => void;
  // onCommentPress?: (postId: string) => void;
}

// Placeholder image URL
const PLACEHOLDER_AVATAR = 'https://placehold.co/50x50/EFEFEF/AAAAAA&text=PFP';

const PostCard = ({
  post,
  onAuthorPress,
}: PostCardProps): React.JSX.Element => {
  // Placeholder state/logic for interaction - replace later
  const [isLiked, setIsLiked] = React.useState(post.isLiked || false);
  const [likeCount, setLikeCount] = React.useState(post.likeCount || 0);

  // Check if this post has author information
  const hasAuthor = React.useMemo(
    () => !!(post.author && post.author.username),
    [post.author?.username]
  );

  const handleLike = () => {
    // Placeholder toggle logic
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
    // Call onLikePress prop later
    console.log(`Toggled like for post ${post.id}`);
  };

  const handleComment = () => {
    // Call onCommentPress prop later
    console.log(`Navigate to comments for post ${post.id}`);
  };

  const handleAuthor = () => {
    if (onAuthorPress && hasAuthor && post.author?.username) {
      onAuthorPress(post.author.username);
    } else if (hasAuthor) {
      console.log(
        `Navigate to profile for author ${post.author?.username || 'unknown'}`
      );
    } else {
      console.warn('Cannot navigate to author profile: author data missing');
    }
  };

  // Format timestamp later using date-fns or similar
  const formattedTimestamp = post.createdAt; // Use raw for now

  return (
    <View style={styles.card}>
      {/* Header: Avatar, Name, Timestamp */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={hasAuthor ? handleAuthor : undefined}
          style={styles.authorInfo}
          activeOpacity={0.7}
          disabled={!hasAuthor}
        >
          <Image
            source={{ uri: post.author?.avatarUrl || PLACEHOLDER_AVATAR }}
            style={styles.avatar}
            onError={(e) =>
              console.log('Failed to load avatar:', e.nativeEvent.error)
            } // Basic error handling
          />
          <View>
            <Text style={styles.displayName}>
              {post.author?.displayName ||
                post.author?.username ||
                'Unknown Author'}
            </Text>
            <Text style={styles.username}>
              @{post.author?.username || 'unknown'}
            </Text>
          </View>
        </TouchableOpacity>
        <Text style={styles.timestamp}>{formattedTimestamp}</Text>
      </View>

      {/* Content */}
      <Text style={styles.content}>{post.content}</Text>

      {/* TODO: Add Attachment rendering (Image, Video) later */}

      {/* Action Bar */}
      <View style={styles.actionBar}>
        <TouchableOpacity onPress={handleLike} style={styles.actionButton}>
          {/* Replace with Icon later */}
          <Text style={isLiked ? styles.likedText : styles.actionText}>
            {isLiked ? '[Liked]' : '[Like]'} ({likeCount})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleComment} style={styles.actionButton}>
          {/* Replace with Icon later */}
          <Text style={styles.actionText}>
            [Comment] ({post.commentCount || 0})
          </Text>
        </TouchableOpacity>
        {/* Add Share/More buttons later */}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    paddingVertical: 12, // Adjusted padding
    paddingHorizontal: 16,
    marginVertical: 8,
    // marginHorizontal: 16, // Remove horizontal margin if list container handles it
    borderRadius: 8,
    // Removed shadow for now, can be added back via theme/platform specifics
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start', // Align items to the top
    marginBottom: 8,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1, // Allow text to shrink if needed
  },
  avatar: {
    width: 40, // Slightly smaller avatar
    height: 40,
    borderRadius: 20, // Circular avatar
    marginRight: 10,
    backgroundColor: '#eee', // Placeholder background
  },
  displayName: {
    fontWeight: 'bold',
    fontSize: 15,
  },
  username: {
    fontSize: 13,
    color: '#666',
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8, // Add space between author/timestamp
  },
  content: {
    fontSize: 15, // Slightly larger content font
    lineHeight: 21, // Improve readability
    marginBottom: 12, // Add space below content
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-around', // Distribute actions
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e0e0e0',
  },
  actionButton: {
    padding: 5, // Add padding for easier tapping
  },
  actionText: {
    fontSize: 13,
    color: 'gray',
  },
  likedText: {
    fontSize: 13,
    color: 'red', // Example liked color
    fontWeight: 'bold',
  },
});

export default PostCard;
