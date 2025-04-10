import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../context/AuthContext';
import TextInputWrapper from '../../components/ui/TextInputWrapper';
import { AuthStackParamList } from '../../navigation/types';

type RegisterScreenNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'Register'
>;

const RegisterScreen: React.FC = () => {
  const { register, isLoading, error, clearError } = useAuth();
  const navigation = useNavigation<RegisterScreenNavigationProp>();

  // Form state
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [formErrors, setFormErrors] = useState({
    username: '',
    displayName: '',
    password: '',
    passwordConfirmation: '',
  });

  // Validate form
  const validateForm = (): boolean => {
    let isValid = true;
    const errors = {
      username: '',
      displayName: '',
      password: '',
      passwordConfirmation: '',
    };

    // Validate username
    if (!username.trim()) {
      errors.username = 'Username is required';
      isValid = false;
    } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      errors.username =
        'Username can only contain letters, numbers, and underscores';
      isValid = false;
    }

    // Validate display name (optional)
    if (displayName && displayName.length > 50) {
      errors.displayName = 'Display name must be less than 50 characters';
      isValid = false;
    }

    // Validate password
    if (!password) {
      errors.password = 'Password is required';
      isValid = false;
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
      isValid = false;
    }

    // Validate password confirmation
    if (!passwordConfirmation) {
      errors.passwordConfirmation = 'Please confirm your password';
      isValid = false;
    } else if (password !== passwordConfirmation) {
      errors.passwordConfirmation = 'Passwords do not match';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  // Handle registration submission
  const handleRegister = async () => {
    clearError();

    if (!validateForm()) {
      return;
    }

    try {
      // Only send fields expected by the backend
      await register({
        username,
        displayName: displayName || undefined,
        password,
        // passwordConfirmation is removed as it's not needed by the backend
      });
      // Navigation will be handled by the AppNavigator based on isAuthenticated state
    } catch (e) {
      // Error is already handled in the Auth Context
      console.log('Registration error:', e);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Sign up to get started</Text>
          </View>

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.form}>
            <TextInputWrapper
              label="Username"
              placeholder="Choose a username (letters, numbers, underscores only)"
              autoComplete="username"
              value={username}
              onChangeText={setUsername}
              error={formErrors.username}
            />

            <TextInputWrapper
              label="Display Name (optional)"
              placeholder="Enter your display name"
              autoComplete="name"
              value={displayName}
              onChangeText={setDisplayName}
              error={formErrors.displayName}
            />

            <TextInputWrapper
              label="Password"
              placeholder="Create a password"
              secureTextEntry
              autoComplete="password-new"
              value={password}
              onChangeText={setPassword}
              error={formErrors.password}
            />

            <TextInputWrapper
              label="Confirm Password"
              placeholder="Confirm your password"
              secureTextEntry
              value={passwordConfirmation}
              onChangeText={setPasswordConfirmation}
              error={formErrors.passwordConfirmation}
            />

            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Create Account</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.linkText}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  form: {
    width: '100%',
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#3498db',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  buttonDisabled: {
    backgroundColor: '#94c6e7',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    color: '#666',
    fontSize: 14,
  },
  linkText: {
    color: '#3498db',
    fontSize: 14,
    fontWeight: '600',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#e53935',
    fontSize: 14,
  },
});

export default RegisterScreen;
