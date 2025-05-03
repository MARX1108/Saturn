import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';
import apiClient from '../../services/apiClient';
import { ApiEndpoints } from '../../config/api';

type RegisterScreenNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'Register'
>;

export default function RegisterScreen(): React.JSX.Element {
  const navigation = useNavigation<RegisterScreenNavigationProp>();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (): Promise<void> => {
    if (isLoading) return;

    setIsLoading(true);
    setError(null);

    // Basic client-side validation
    if (!username || !email || !password || !displayName) {
      setError('All fields are required.');
      setIsLoading(false);
      return;
    }

    try {
      console.log(
        `Attempting registration for user: ${username}, email: ${email}`
      );
      const response = await apiClient.post(ApiEndpoints.register, {
        username,
        email,
        password,
        displayName,
      });

      // --- Registration Success ---
      console.log('Registration successful:', response);
      // TODO: Dispatch action to update auth state (RTK)
      // TODO: Store token securely (tokenStorage.ts)
      // TODO: Navigate to MainFlow (handled by RootNavigator state change)

      let successMessage = 'User created successfully';

      // Type guard to ensure safe access to the response properties
      if (typeof response === 'object' && response !== null) {
        // Handle token display
        if ('token' in response && typeof response.token === 'string') {
          const tokenPreview = response.token.substring(0, 10);
          successMessage = `User created. Token: ${tokenPreview}...`;
        }

        // If actor info is available
        if (
          'actor' in response &&
          response.actor &&
          typeof response.actor === 'object' &&
          'username' in response.actor &&
          typeof response.actor.username === 'string'
        ) {
          const username = response.actor.username;
          let tokenPart = '';

          if ('token' in response && typeof response.token === 'string') {
            tokenPart = `Token: ${response.token.substring(0, 10)}...`;
          }

          successMessage = `User ${username} created. ${tokenPart}`.trim();
        }
      }

      Alert.alert('Registration Success', successMessage);
    } catch (error) {
      // --- Registration Failure ---
      console.error('Registration failed:', error);

      let userMessage = 'Registration failed. Please try again.'; // Default message

      // Extract error message from Error object
      if (error instanceof Error) {
        const errorMsg = error.message || '';

        // Handle specific known errors defensively
        if (
          errorMsg.includes('E11000 duplicate key error') ||
          errorMsg.includes('duplicate')
        ) {
          userMessage = 'Username already exists. Please choose another.';
        } else if (
          errorMsg.includes('validation') ||
          errorMsg.includes('required')
        ) {
          // Handle validation errors
          userMessage = errorMsg;
        } else {
          // Use the message from the backend if available and not handled above
          userMessage = errorMsg || userMessage;
        }
      }

      setError(userMessage);
      Alert.alert('Registration Failed', userMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Wrap the navigation function to avoid Promise-related ESLint error
  const handleNavigateToLogin = (): void => {
    navigation.navigate('Login');
  };

  // Function wrapper for the register button to fix the Promise issue
  const onRegisterPress = (): void => {
    void handleRegister();
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Register</Text>

        {error && <Text style={styles.errorText}>{error}</Text>}

        <TextInput
          style={styles.input}
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          editable={!isLoading}
          textContentType="username"
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          textContentType="emailAddress"
          editable={!isLoading}
        />
        <TextInput
          style={styles.input}
          placeholder="Display Name"
          value={displayName}
          onChangeText={setDisplayName}
          autoCapitalize="words"
          textContentType="name"
          editable={!isLoading}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          textContentType="newPassword"
          editable={!isLoading}
        />

        {isLoading ? (
          <ActivityIndicator
            size="large"
            color={colors.indicator}
            style={styles.loader}
          />
        ) : (
          <Button
            title="Register"
            onPress={onRegisterPress}
            disabled={isLoading}
          />
        )}

        <View style={styles.spacer} />

        <Button
          title="Already have an account? Login"
          onPress={handleNavigateToLogin}
          disabled={isLoading}
        />
      </View>
    </ScrollView>
  );
}

// Define colors as variables to avoid color literal warnings
const colors = {
  border: '#808080',
  error: '#FF0000',
  indicator: '#0000ff',
  background: '#FFFFFF',
};

// Basic Styles - Consistent with LoginScreen
const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  container: {
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
    backgroundColor: colors.background,
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
