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
import { useTheme } from '../../theme/ThemeContext';

type RegisterScreenNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'Register'
>;

const RegisterScreen: React.FC = () => {
  const { register, isLoading, error, clearError } = useAuth();
  const navigation = useNavigation<RegisterScreenNavigationProp>();
  const theme = useTheme();

  // Form state
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [formErrors, setFormErrors] = useState({
    username: '',
    email: '',
    displayName: '',
    password: '',
    passwordConfirmation: '',
  });

  // Validate form
  const validateForm = (): boolean => {
    let isValid = true;
    const errors = {
      username: '',
      email: '',
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

    // Validate email
    if (!email.trim()) {
      errors.email = 'Email is required';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Please enter a valid email address';
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
      await register({
        username,
        email,
        displayName: displayName || undefined,
        password,
      });
    } catch (e) {
      console.log('Registration error:', e);
    }
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.colors.background }]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              Create Account
            </Text>
            <Text
              style={[styles.subtitle, { color: theme.colors.textSecondary }]}
            >
              Sign up to get started
            </Text>
          </View>

          {error && (
            <View
              style={[
                styles.errorContainer,
                { backgroundColor: theme.colors.error },
              ]}
            >
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
              label="Email"
              placeholder="Enter your email address"
              autoComplete="email"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              error={formErrors.email}
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
              style={[
                styles.button,
                { backgroundColor: theme.colors.primary },
                isLoading && styles.buttonDisabled,
              ]}
              onPress={handleRegister}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={theme.colors.white} />
              ) : (
                <Text
                  style={[styles.buttonText, { color: theme.colors.white }]}
                >
                  Create Account
                </Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text
              style={[styles.footerText, { color: theme.colors.textSecondary }]}
            >
              Already have an account?
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={[styles.linkText, { color: theme.colors.primary }]}>
                Sign In
              </Text>
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
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  errorContainer: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#fff',
    fontSize: 14,
  },
  form: {
    gap: 16,
  },
  button: {
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    fontSize: 14,
  },
  linkText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default RegisterScreen;
