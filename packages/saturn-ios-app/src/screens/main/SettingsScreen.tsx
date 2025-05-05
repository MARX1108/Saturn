import React from 'react';
import { StyleSheet, Switch, Alert, Button } from 'react-native';
import styled from 'styled-components/native';
import { DefaultTheme } from 'styled-components/native';
import { useAppDispatch } from '../../store/hooks'; // Import typed dispatch
import { clearCredentials } from '../../store/slices/authSlice'; // Import action
import { removeToken } from '../../services/tokenStorage'; // Import removeToken
import { useQueryClient } from '@tanstack/react-query'; // Import query client hook
import { useThemeToggle, useTheme } from '../../theme/ThemeProvider';

// Styled Components
const ScreenContainer = styled.SafeAreaView`
  flex: 1;
  background-color: ${({ theme }: { theme: DefaultTheme }) =>
    theme.colors.background};
`;

const ContentContainer = styled.View`
  flex: 1;
  align-items: center;
  padding: ${({ theme }: { theme: DefaultTheme }) => theme.spacing.m}px;
`;

const Title = styled.Text`
  font-size: ${({ theme }: { theme: DefaultTheme }) => theme.typography.h2}px;
  font-weight: bold;
  color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.textPrimary};
  margin-bottom: ${({ theme }: { theme: DefaultTheme }) => theme.spacing.xl}px;
  font-family: ${({ theme }: { theme: DefaultTheme }) =>
    theme.typography.primary};
`;

const SettingRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding-vertical: ${({ theme }: { theme: DefaultTheme }) =>
    theme.spacing.m}px;
  border-bottom-width: ${StyleSheet.hairlineWidth}px;
  border-bottom-color: ${({ theme }: { theme: DefaultTheme }) =>
    theme.colors.border};
`;

const SettingLabel = styled.Text`
  font-size: ${({ theme }: { theme: DefaultTheme }) =>
    theme.typography.body1}px;
  color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.textPrimary};
  font-family: ${({ theme }: { theme: DefaultTheme }) =>
    theme.typography.secondary};
`;

const LogoutButtonContainer = styled.View`
  margin-top: ${({ theme }: { theme: DefaultTheme }) => theme.spacing.xl}px;
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
