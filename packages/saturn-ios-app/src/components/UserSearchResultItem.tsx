/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import React from 'react';
import { TouchableOpacity, View, Image, Text } from 'react-native';
import styled from 'styled-components/native';
import { DefaultTheme } from 'styled-components/native';
import { User } from '../types/user';

const PLACEHOLDER_AVATAR = 'https://placehold.co/60x60/EFEFEF/AAAAAA&text=PFP';

interface UserSearchResultItemProps {
  user: User;
  onPress: (username: string) => void;
}

// Define a StyledComponentProps type to properly type the theme
interface StyledComponentProps {
  theme: DefaultTheme;
}

const ItemContainer = styled(TouchableOpacity)<StyledComponentProps>`
  flex-direction: row;
  align-items: center;
  padding: ${(props: StyledComponentProps) => props.theme.spacing.s}px
    ${(props: StyledComponentProps) => props.theme.spacing.m}px;
`;

const Avatar = styled(Image)<StyledComponentProps>`
  width: 50px;
  height: 50px;
  border-radius: 25px;
  margin-right: ${(props: StyledComponentProps) => props.theme.spacing.m}px;
  background-color: ${(props: StyledComponentProps) =>
    props.theme.colors.border};
`;

const UserInfoContainer = styled(View)<StyledComponentProps>`
  flex: 1;
  justify-content: center;
`;

const UsernameText = styled(Text)<StyledComponentProps>`
  font-size: ${(props: StyledComponentProps) => props.theme.typography.body1}px;
  font-weight: bold;
  color: ${(props: StyledComponentProps) => props.theme.colors.textPrimary};
  font-family: ${(props: StyledComponentProps) =>
    props.theme.typography.primary};
`;

const DisplayNameText = styled(Text)<StyledComponentProps>`
  font-size: ${(props: StyledComponentProps) => props.theme.typography.body2}px;
  color: ${(props: StyledComponentProps) => props.theme.colors.textSecondary};
  font-family: ${(props: StyledComponentProps) =>
    props.theme.typography.secondary};
`;

const UserSearchResultItem = ({
  user,
  onPress,
}: UserSearchResultItemProps): React.JSX.Element => {
  return (
    <ItemContainer
      onPress={() => onPress(user.username)}
      activeOpacity={0.7}
      testID="user-search-result-item"
    >
      <Avatar
        source={{
          uri:
            user.avatarUrl ||
            user.icon?.url ||
            user.iconUrl ||
            PLACEHOLDER_AVATAR,
        }}
        testID="user-search-result-avatar"
      />
      <UserInfoContainer>
        <UsernameText numberOfLines={1} testID="user-search-result-username">
          {user.username}
        </UsernameText>
        {user.displayName && (
          <DisplayNameText
            numberOfLines={1}
            testID="user-search-result-displayname"
          >
            {user.displayName}
          </DisplayNameText>
        )}
      </UserInfoContainer>
    </ItemContainer>
  );
};

export default UserSearchResultItem;
