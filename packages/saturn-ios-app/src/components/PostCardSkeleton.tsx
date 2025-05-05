import React from 'react';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

const PostCardSkeleton = (): React.JSX.Element => {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          padding: theme.spacing.m,
          marginVertical: theme.spacing.s,
          marginHorizontal: theme.spacing.m,
          borderRadius: theme.borderRadius.medium,
        },
      ]}
      testID="post-card-skeleton"
    >
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
    </View>
  );
};

// Define styles using StyleSheet
const styles = StyleSheet.create({
  container: {
    // Styles that don't depend on theme can go here
  },
});

export default PostCardSkeleton;
