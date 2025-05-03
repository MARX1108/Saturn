import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';
import apiClient from '../../services/apiClient';
import { ApiEndpoints } from '../../config/api';

// Define navigation prop type for type safety
type LoginScreenNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'Login'
>;

// Login response shape for type casting
interface LoginResponseData {
  token: string;
  user: {
    id: string;
    username: string;
    // Add other user fields as needed
  };
}

export default function LoginScreen(): React.JSX.Element {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (): Promise<void> => {
    if (isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      console.log(`Attempting login for user: ${username}`);

      // Make the API call and type the response properly
      const data = await apiClient.post(ApiEndpoints.login, {
        username,
        password,
      });

      // --- Login Success ---
      console.log('Login successful:', data);

      // Use type guard to ensure safe access to token property
      const loginData = data as Partial<LoginResponseData>;

      // TODO: Dispatch action to update auth state (RTK)
      // TODO: Store token securely (tokenStorage.ts)
      // TODO: Navigate to MainFlow (handled by RootNavigator state change)

      if (loginData.token && typeof loginData.token === 'string') {
        Alert.alert(
          'Login Success',
          `Token: ${loginData.token.substring(0, 10)}...`
        );
      } else {
        Alert.alert('Login Success', 'Authenticated successfully');
      }
    } catch (error) {
      // --- Login Failure ---
      console.error('Login failed:', error);

      // Extract message from the error object
      let errorMessage = 'Login failed. Please check credentials.';

      if (error instanceof Error) {
        errorMessage = error.message || errorMessage;
      }

      setError(errorMessage);
      Alert.alert('Login Failed', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Wrap the navigation function to avoid Promise-related ESLint error
  const handleNavigateToRegister = (): void => {
    navigation.navigate('Register');
  };

  // Function wrapper for the login button to fix the Promise issue
  const onLoginPress = (): void => {
    void handleLogin();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        editable={!isLoading}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        editable={!isLoading}
      />

      {isLoading ? (
        <ActivityIndicator
          size="large"
          color={colors.indicator}
          style={styles.loader}
        />
      ) : (
        <Button title="Login" onPress={onLoginPress} disabled={isLoading} />
      )}

      <View style={styles.spacer} />

      <Button
        title="Don't have an account? Register"
        onPress={handleNavigateToRegister}
        disabled={isLoading}
      />
    </View>
  );
}

// Define colors as variables to avoid color literal warnings
const colors = {
  border: '#808080',
  error: '#FF0000',
  indicator: '#0000ff',
};

// Basic Styles - Refine later with Theme/Styled Components
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: colors.border,
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  errorText: {
    color: colors.error,
    marginBottom: 12,
    textAlign: 'center',
  },
  loader: {
    marginVertical: 10,
  },
  spacer: {
    height: 20,
  },
});
