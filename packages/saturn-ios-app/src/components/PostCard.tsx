import React from 'react';
import {
  StyleSheet,
  ImageErrorEventData,
  NativeSyntheticEvent,
  View,
  TouchableOpacity,
  Image,
  Text,
} from 'react-native';
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

// Define colors to avoid literals
const COLORS = {
  SURFACE: '#ffffff',
  BORDER: '#e6e6e6',
  TEXT_PRIMARY: '#000000',
  TEXT_SECONDARY: '#666666',
  ERROR: '#ff3b30',
  BACKGROUND: '#f5f5f5',
};

// Define spacing and typography sizes
const SPACING = {
  XS: 4,
  S: 8,
  M: 16,
};

const TYPOGRAPHY = {
  CAPTION: 12,
  BODY1: 16,
  BODY2: 14,
};

const BORDER_RADIUS = {
  MEDIUM: 8,
};

const PostCard = ({
  post,
  onAuthorPress,
}: PostCardProps): React.JSX.Element => {
  // Placeholder state/logic for interaction - replace later
  const [isLiked, setIsLiked] = React.useState(post.isLiked || false);
  const [likeCount, setLikeCount] = React.useState(post.likeCount || 0);

  // Check if this post has author information
  const hasAuthor = React.useMemo(
    (): boolean => !!(post.author && post.author.username),
    [post.author]
  );

  const handleLike = (): void => {
    // Placeholder toggle logic
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
    // Call onLikePress prop later
    console.log(`Toggled like for post ${post.id}`);
  };

  const handleComment = (): void => {
    // Call onCommentPress prop later
    console.log(`Navigate to comments for post ${post.id}`);
  };

  const handleAuthor = (): void => {
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
    <View style={styles.cardContainer}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.authorInfoTouchable}
          onPress={hasAuthor ? handleAuthor : undefined}
          activeOpacity={0.7}
          disabled={!hasAuthor}
        >
          <Image
            style={styles.avatar}
            source={{ uri: post.author?.avatarUrl || PLACEHOLDER_AVATAR }}
            onError={(e: NativeSyntheticEvent<ImageErrorEventData>): void =>
              console.log('Failed to load avatar:', e.nativeEvent.error)
            }
          />
          <View style={styles.authorTextContainer}>
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

      <Text style={styles.content}>{post.content}</Text>

      <View style={styles.actionBar}>
        <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
          <Text style={[styles.actionText, isLiked && styles.actionTextLiked]}>
            {isLiked ? '[Liked]' : '[Like]'} ({likeCount})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={handleComment}>
          <Text style={styles.actionText}>
            [Comment] ({post.commentCount || 0})
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: COLORS.SURFACE,
    padding: SPACING.M,
    marginVertical: SPACING.S,
    borderRadius: BORDER_RADIUS.MEDIUM,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.BORDER,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.S,
  },
  authorInfoTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: SPACING.M,
    backgroundColor: COLORS.BACKGROUND,
  },
  authorTextContainer: {
    flexShrink: 1,
  },
  displayName: {
    fontWeight: 'bold',
    fontSize: TYPOGRAPHY.BODY1,
    color: COLORS.TEXT_PRIMARY,
  },
  username: {
    fontSize: TYPOGRAPHY.BODY2,
    color: COLORS.TEXT_SECONDARY,
  },
  timestamp: {
    fontSize: TYPOGRAPHY.CAPTION,
    color: COLORS.TEXT_SECONDARY,
    marginLeft: SPACING.S,
  },
  content: {
    fontSize: TYPOGRAPHY.BODY1,
    lineHeight: TYPOGRAPHY.BODY1 * 1.4,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.M,
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: SPACING.M,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.BORDER,
  },
  actionButton: {
    padding: SPACING.XS,
  },
  actionText: {
    fontSize: TYPOGRAPHY.BODY2,
    color: COLORS.TEXT_SECONDARY,
  },
  actionTextLiked: {
    color: COLORS.ERROR,
    fontWeight: 'bold',
  },
});

export default PostCard;
