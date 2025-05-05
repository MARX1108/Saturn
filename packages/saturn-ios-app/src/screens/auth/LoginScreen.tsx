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
import { useAppDispatch } from '../../store/hooks';
import { setCredentials } from '../../store/slices/authSlice';
import { setToken } from '../../services/tokenStorage';
import { User } from '../../types/user';

// Define navigation prop type for type safety
type LoginScreenNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'Login'
>;

// Define login response type
interface LoginResponse {
  token: string;
  actor: User;
}

export default function LoginScreen(): React.JSX.Element {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const dispatch = useAppDispatch();
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

      // Use proper typing: apiClient.post<ResponseType, ResponseType>
      // The second type parameter tells TypeScript that the return is already the response data
      const data = await apiClient.post<LoginResponse, LoginResponse>(
        ApiEndpoints.login,
        {
          username,
          password,
        }
      );

      console.log('Login successful:', data);

      // --- Dispatch RTK action and save token ---
      if (data.actor && data.token) {
        await setToken(data.token);
        dispatch(
          setCredentials({
            user: data.actor,
            token: data.token,
          })
        );
      } else {
        throw new Error('Invalid login response structure');
      }
    } catch (err) {
      // --- Login Failure ---
      console.error('Login failed:', err);

      // Extract message from the error object
      let errorMessage = 'Login failed. Please check credentials.';

      if (err instanceof Error) {
        errorMessage = err.message || errorMessage;
      }

      setError(errorMessage);

      // Show Alert
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
