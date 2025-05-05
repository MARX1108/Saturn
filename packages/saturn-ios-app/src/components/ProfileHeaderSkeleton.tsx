import React from 'react';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

const ProfileHeaderSkeleton = (): React.JSX.Element => {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: theme.colors.border,
          backgroundColor: theme.colors.surface,
        },
      ]}
      testID="profile-header-skeleton"
    >
      <SkeletonPlaceholder borderRadius={4}>
        {/* Avatar Placeholder */}
        <SkeletonPlaceholder.Item width={80} height={80} borderRadius={40} />
      </SkeletonPlaceholder>
      <View style={{ flex: 1, marginLeft: 16, marginRight: 16 }}>
        <SkeletonPlaceholder borderRadius={4}>
          {/* Display Name */}
          <SkeletonPlaceholder.Item width="60%" height={20} marginBottom={6} />
          {/* Username */}
          <SkeletonPlaceholder.Item width="40%" height={15} marginBottom={10} />
          {/* Stats */}
          <SkeletonPlaceholder.Item flexDirection="row">
            <SkeletonPlaceholder.Item
              width="30%"
              height={14}
              marginRight={16}
            />
            <SkeletonPlaceholder.Item width="30%" height={14} />
          </SkeletonPlaceholder.Item>
        </SkeletonPlaceholder>
      </View>
      <SkeletonPlaceholder borderRadius={4}>
        {/* Button Placeholder */}
        <SkeletonPlaceholder.Item width={80} height={35} borderRadius={15} />
      </SkeletonPlaceholder>
    </View>
    // Optional: Add skeleton for Bio section if needed
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
  },
});

export default ProfileHeaderSkeleton;
