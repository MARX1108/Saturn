import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

// Temporarily replace SkeletonPlaceholder with ActivityIndicator
const PostCardSkeleton = (): React.JSX.Element => {
  console.log('[PostCardSkeleton] Rendering...');
  const theme = useTheme();

  // Simple fallback instead of using SkeletonPlaceholder
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
          height: 200, // Approximate height of a post card
          justifyContent: 'center',
          alignItems: 'center',
        },
      ]}
      testID="post-card-skeleton"
    >
      <ActivityIndicator size="large" color={theme.colors.primary} />
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
