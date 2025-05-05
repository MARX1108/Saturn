import React from 'react';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import { View, StyleSheet } from 'react-native';
import styled from 'styled-components/native';
import { Theme } from '../theme/theme';

// Match PostCard's container style for consistent spacing/layout
const SkeletonCardContainer = styled(View)`
  background-color: ${(props: { theme: Theme }) => props.theme.colors.surface};
  padding: ${(props: { theme: Theme }) => props.theme.spacing.m}px;
  margin-vertical: ${(props: { theme: Theme }) => props.theme.spacing.s}px;
  margin-horizontal: ${(props: { theme: Theme }) => props.theme.spacing.m}px;
  border-radius: ${(props: { theme: Theme }) =>
    props.theme.borderRadius.medium}px;
`;

const PostCardSkeleton = (): React.JSX.Element => {
  return (
    <SkeletonCardContainer testID="post-card-skeleton">
      <SkeletonPlaceholder borderRadius={4}>
        <SkeletonPlaceholder.Item flexDirection="row" alignItems="center">
          {/* Avatar Placeholder */}
          <SkeletonPlaceholder.Item width={40} height={40} borderRadius={20} />
          <SkeletonPlaceholder.Item marginLeft={10}>
            {/* Author Name Placeholder */}
            <SkeletonPlaceholder.Item
              width={120}
              height={16}
              marginBottom={6}
            />
            {/* Username Placeholder */}
            <SkeletonPlaceholder.Item width={80} height={12} />
          </SkeletonPlaceholder.Item>
        </SkeletonPlaceholder.Item>
        {/* Content Placeholder */}
        <SkeletonPlaceholder.Item marginTop={12} width="100%" height={15} />
        <SkeletonPlaceholder.Item marginTop={6} width="80%" height={15} />
        <SkeletonPlaceholder.Item marginTop={6} width="90%" height={15} />
        {/* Action Bar Placeholder */}
        <SkeletonPlaceholder.Item
          marginTop={16}
          flexDirection="row"
          justifyContent="space-around"
        >
          <SkeletonPlaceholder.Item width={60} height={20} />
          <SkeletonPlaceholder.Item width={80} height={20} />
        </SkeletonPlaceholder.Item>
      </SkeletonPlaceholder>
    </SkeletonCardContainer>
  );
};

export default PostCardSkeleton;
