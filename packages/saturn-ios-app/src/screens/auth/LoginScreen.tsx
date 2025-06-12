import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';
import { useAppDispatch } from '../../store/hooks';
import { setCredentials } from '../../store/slices/authSlice';
import { useLoginMutation } from '../../store/api';
import { Ionicons } from '@expo/vector-icons';

// Define navigation prop type for type safety
type LoginScreenNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'Login'
>;


export default function LoginScreen(): React.JSX.Element {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const dispatch = useAppDispatch();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [login, { isLoading }] = useLoginMutation();

  const handleLogin = async (): Promise<void> => {
    if (isLoading) return;

    setError(null);

    try {
      console.log(`Attempting login for user: ${username}`);

      const result = await login({
        username,
        password,
        rememberMe,
      }).unwrap();

      console.log('Login successful:', result);

      // Dispatch RTK action with user data
      dispatch(
        setCredentials({
          user: result.user,
          token: result.token,
        })
      );
    } catch (err) {
      // --- Login Failure ---
      console.error('Login failed:', err);

      // Extract message from the error object
      let errorMessage = 'Login failed. Please check credentials.';

      if (err instanceof Error) {
        errorMessage = err.message || errorMessage;
      } else if (typeof err === 'object' && err !== null && 'data' in err) {
        const errorData = err.data as { message?: string };
        errorMessage = errorData.message || errorMessage;
      }

      setError(errorMessage);

      // Show Alert
      Alert.alert('Login Failed', errorMessage);
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

  // Toggle remember me checkbox
  const toggleRememberMe = (): void => {
    setRememberMe(!rememberMe);
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

      <TouchableOpacity
        style={styles.checkboxContainer}
        onPress={toggleRememberMe}
        disabled={isLoading}
      >
        <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
          {rememberMe && <Ionicons name="checkmark" size={16} color="#fff" />}
        </View>
        <Text style={styles.checkboxLabel}>
          Remember me to restore session if it expires
        </Text>
      </TouchableOpacity>

      {isLoading ? (
        <ActivityIndicator
          size="large"
          color={colors.indicator}
          style={styles.loader}
        />
      ) : (
        <Button 
          title="Login" 
          onPress={onLoginPress} 
          disabled={isLoading || !username || !password} 
        />
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
  checkboxBorder: '#808080',
  checkboxChecked: '#4285F4',
  checkboxText: '#333333',
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
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    alignSelf: 'flex-start',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: colors.checkboxBorder,
    marginRight: 8,
    borderRadius: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.checkboxChecked,
    borderColor: colors.checkboxChecked,
  },
  checkboxLabel: {
    fontSize: 14,
    color: colors.checkboxText,
    flex: 1,
  },
});
