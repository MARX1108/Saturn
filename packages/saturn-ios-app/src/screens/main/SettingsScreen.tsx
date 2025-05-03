import React from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import { useAppDispatch } from '../../store/hooks'; // Import typed dispatch
import { clearCredentials } from '../../store/slices/authSlice'; // Import action
import { removeToken } from '../../services/tokenStorage'; // Import removeToken
import { useQueryClient } from '@tanstack/react-query'; // Import query client hook

export default function SettingsScreen(): React.JSX.Element {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient(); // Get query client instance

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
      <Button title="Logout" onPress={() => void handleLogout()} color="red" />
    </View>
  );
}

// Add basic styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});
