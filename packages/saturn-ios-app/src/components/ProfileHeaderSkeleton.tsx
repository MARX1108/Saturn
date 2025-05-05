import React from 'react';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import { View, StyleSheet } from 'react-native';
import styled from 'styled-components/native';
import { Theme } from '../theme/theme';

// Match ProfileScreen header layout
const SkeletonHeaderContainer = styled(View)`
  flex-direction: row;
  align-items: flex-start;
  padding: ${(props: { theme: Theme }) => props.theme.spacing.m}px;
  border-bottom-width: ${StyleSheet.hairlineWidth}px;
  border-bottom-color: ${(props: { theme: Theme }) =>
    props.theme.colors.border};
  background-color: ${(props: { theme: Theme }) => props.theme.colors.surface};
`;

const ProfileHeaderSkeleton = (): React.JSX.Element => {
  return (
    <SkeletonHeaderContainer testID="profile-header-skeleton">
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
    </SkeletonHeaderContainer>
    // Optional: Add skeleton for Bio section if needed
  );
};

export default ProfileHeaderSkeleton;
