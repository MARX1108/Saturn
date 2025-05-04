import React from 'react';
import { View, Text, Button, StyleSheet, Alert, Switch } from 'react-native';
import { useAppDispatch } from '../../store/hooks'; // Import typed dispatch
import { clearCredentials } from '../../store/slices/authSlice'; // Import action
import { removeToken } from '../../services/tokenStorage'; // Import removeToken
import { useQueryClient } from '@tanstack/react-query'; // Import query client hook
import { useThemeToggle } from '../../theme/ThemeProvider';

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
      queryClient.clear(); // Clears all query caches

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
    <View style={styles.container}>
      <Text style={styles.title}>Settings Screen</Text>

      {/* Theme Toggle */}
      <View style={styles.settingRow}>
        <Text style={styles.settingLabel}>Dark Mode</Text>
        <Switch
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={mode === 'dark' ? '#f5dd4b' : '#f4f3f4'}
          ios_backgroundColor="#3e3e3e"
          onValueChange={toggleTheme}
          value={mode === 'dark'}
        />
      </View>

      <View style={styles.logoutButtonContainer}>
        <Button
          title="Logout"
          onPress={() => void handleLogout()}
          color="red"
        />
      </View>
    </View>
  );
}

// Add basic styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
  },
  settingLabel: {
    fontSize: 16,
  },
  logoutButtonContainer: {
    marginTop: 40,
  },
});
