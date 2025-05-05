/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */

// @ts-nocheck
import React from 'react';
import {
  StyleSheet,
  ImageErrorEventData,
  NativeSyntheticEvent,
} from 'react-native';
import styled from 'styled-components/native';
import { DefaultTheme } from 'styled-components/native';
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

// Define a StyledComponentProps type to properly type the theme
interface StyledComponentProps {
  theme: DefaultTheme;
}

// Styled Components
const CardContainer = styled.View<StyledComponentProps>`
  background-color: ${(props) => props.theme.colors.surface};
  padding: ${(props) => props.theme.spacing.m}px;
  margin-vertical: ${(props) => props.theme.spacing.s}px;
  border-radius: ${(props) => props.theme.borderRadius.medium}px;
  border-bottom-width: ${StyleSheet.hairlineWidth}px;
  border-bottom-color: ${(props) => props.theme.colors.border};
`;

const Header = styled.View<StyledComponentProps>`
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${(props) => props.theme.spacing.s}px;
`;

const AuthorInfoTouchable = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  flex-shrink: 1;
`;

const Avatar = styled.Image<StyledComponentProps>`
  width: 40px;
  height: 40px;
  border-radius: 20px;
  margin-right: ${(props) => props.theme.spacing.m}px;
  background-color: ${(props) => props.theme.colors.background};
`;

const AuthorTextContainer = styled.View`
  flex-shrink: 1;
`;

const DisplayName = styled.Text<StyledComponentProps>`
  font-weight: bold;
  font-size: ${(props) => props.theme.typography.body1}px;
  color: ${(props) => props.theme.colors.textPrimary};
  font-family: ${(props) => props.theme.typography.primary};
`;

const Username = styled.Text<StyledComponentProps>`
  font-size: ${(props) => props.theme.typography.body2}px;
  color: ${(props) => props.theme.colors.textSecondary};
  font-family: ${(props) => props.theme.typography.secondary};
`;

const Timestamp = styled.Text<StyledComponentProps>`
  font-size: ${(props) => props.theme.typography.caption}px;
  color: ${(props) => props.theme.colors.textSecondary};
  margin-left: ${(props) => props.theme.spacing.s}px;
  font-family: ${(props) => props.theme.typography.secondary};
`;

const Content = styled.Text<StyledComponentProps>`
  font-size: ${(props) => props.theme.typography.body1}px;
  line-height: ${(props) => props.theme.typography.body1 * 1.4}px;
  color: ${(props) => props.theme.colors.textPrimary};
  margin-bottom: ${(props) => props.theme.spacing.m}px;
  font-family: ${(props) => props.theme.typography.secondary};
`;

const ActionBar = styled.View<StyledComponentProps>`
  flex-direction: row;
  justify-content: space-around;
  padding-top: ${(props) => props.theme.spacing.m}px;
  border-top-width: ${StyleSheet.hairlineWidth}px;
  border-top-color: ${(props) => props.theme.colors.border};
`;

const ActionButton = styled.TouchableOpacity`
  padding: ${(props) => props.theme.spacing.xs}px;
`;

// Define a type for ActionText props
interface ActionTextProps extends StyledComponentProps {
  isLiked?: boolean;
}

const ActionText = styled.Text<ActionTextProps>`
  font-size: ${(props) => props.theme.typography.body2}px;
  color: ${(props) =>
    props.isLiked
      ? props.theme.colors.likeIconActive
      : props.theme.colors.textSecondary};
  font-weight: ${(props) => (props.isLiked ? 'bold' : 'normal')};
  font-family: ${(props) => props.theme.typography.secondary};
`;

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
    <CardContainer>
      <Header>
        <AuthorInfoTouchable
          onPress={hasAuthor ? handleAuthor : undefined}
          activeOpacity={0.7}
          disabled={!hasAuthor}
        >
          <Avatar
            source={{ uri: post.author?.avatarUrl || PLACEHOLDER_AVATAR }}
            onError={(e: NativeSyntheticEvent<ImageErrorEventData>): void =>
              console.log('Failed to load avatar:', e.nativeEvent.error)
            }
          />
          <AuthorTextContainer>
            <DisplayName>
              {post.author?.displayName ||
                post.author?.username ||
                'Unknown Author'}
            </DisplayName>
            <Username>@{post.author?.username || 'unknown'}</Username>
          </AuthorTextContainer>
        </AuthorInfoTouchable>
        <Timestamp>{formattedTimestamp}</Timestamp>
      </Header>

      <Content>{post.content}</Content>

      <ActionBar>
        <ActionButton onPress={handleLike}>
          <ActionText isLiked={isLiked}>
            {isLiked ? '[Liked]' : '[Like]'} ({likeCount})
          </ActionText>
        </ActionButton>
        <ActionButton onPress={handleComment}>
          <ActionText>{`[Comment] (${post.commentCount || 0})`}</ActionText>
        </ActionButton>
      </ActionBar>
    </CardContainer>
  );
};

export default PostCard;
