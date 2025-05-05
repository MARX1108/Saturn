/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */

// @ts-nocheck
import React from 'react';
import { StyleSheet, Switch, Alert, Button } from 'react-native';
import styled from 'styled-components/native';
import { DefaultTheme } from 'styled-components/native';
import { useAppDispatch } from '../../store/hooks'; // Import typed dispatch
import { clearCredentials } from '../../store/slices/authSlice'; // Import action
import { removeToken } from '../../services/tokenStorage'; // Import removeToken
import { useQueryClient } from '@tanstack/react-query'; // Import query client hook
import { useThemeToggle, useTheme } from '../../theme/ThemeProvider';

// Define a StyledComponentProps type to properly type the theme
interface StyledComponentProps {
  theme: DefaultTheme;
}

// Styled Components
const ScreenContainer = styled.SafeAreaView<StyledComponentProps>`
  flex: 1;
  background-color: ${(props) => props.theme.colors.background};
`;

const ContentContainer = styled.View<StyledComponentProps>`
  flex: 1;
  align-items: center;
  padding: ${(props) => props.theme.spacing.m}px;
`;

const Title = styled.Text<StyledComponentProps>`
  font-size: ${(props) => props.theme.typography.h2}px;
  font-weight: bold;
  color: ${(props) => props.theme.colors.textPrimary};
  margin-bottom: ${(props) => props.theme.spacing.xl}px;
  font-family: ${(props) => props.theme.typography.primary};
`;

const SettingRow = styled.View<StyledComponentProps>`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding-vertical: ${(props) => props.theme.spacing.m}px;
  border-bottom-width: ${StyleSheet.hairlineWidth}px;
  border-bottom-color: ${(props) => props.theme.colors.border};
`;

const SettingLabel = styled.Text<StyledComponentProps>`
  font-size: ${(props) => props.theme.typography.body1}px;
  color: ${(props) => props.theme.colors.textPrimary};
  font-family: ${(props) => props.theme.typography.secondary};
`;

const LogoutButtonContainer = styled.View<StyledComponentProps>`
  margin-top: ${(props) => props.theme.spacing.xl}px;
`;

export default function SettingsScreen(): React.JSX.Element {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient(); // Get query client instance
  const { mode, toggleTheme } = useThemeToggle();

  const handleLogout = async (): Promise<void> => {
    console.log('Attempting logout...');
    try {
      // 1. Clear RTK state
      dispatch(clearCredentials());
      // 2. Remove token from secure storage
      await removeToken();
      // 3. Clear TanStack Query cache (optional but good practice)
      void queryClient.resetQueries(); // Use void to mark promise as intentionally ignored

      console.log(
        'Logout successful: State cleared, token removed, query cache cleared.'
      );
      // Navigation back to AuthFlow is handled automatically by RootNavigator watching RTK state
    } catch (error) {
      console.error('Logout failed:', error);
      // Show error to user if needed, though client-side logout is unlikely to fail critically
      Alert.alert(
        'Logout Error',
        'Could not log out completely. Please restart the app.'
      );
    }
  };

  return (
    <ScreenContainer>
      <ContentContainer>
        <Title>Settings</Title>

        <SettingRow>
          <SettingLabel>Dark Mode</SettingLabel>
          <Switch
            trackColor={{
              false: '#767577',
              true: '#81b0ff',
            }}
            thumbColor={mode === 'dark' ? '#f5dd4b' : '#f4f3f4'}
            ios_backgroundColor="#3e3e3e"
            onValueChange={toggleTheme}
            value={mode === 'dark'}
          />
        </SettingRow>

        <LogoutButtonContainer>
          <Button
            title="Logout"
            onPress={() => {
              void handleLogout(); // Mark promise as intentionally ignored
            }}
            color="red"
          />
        </LogoutButtonContainer>
      </ContentContainer>
    </ScreenContainer>
  );
}
