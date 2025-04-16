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
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../context/AuthContext';
import TextInputWrapper from '../../components/ui/TextInputWrapper';
import { AuthStackParamList } from '../../navigation/types';
import { useTheme } from '../../theme/ThemeContext';
import StyledText from '../../components/ui/StyledText';

type LoginScreenNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'Login'
>;

const LoginScreen: React.FC = () => {
  const { login, isLoading, error, clearError } = useAuth();
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const theme = useTheme();

  // Form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [formErrors, setFormErrors] = useState({
    username: '',
    password: '',
  });

  // Validate form
  const validateForm = (): boolean => {
    let isValid = true;
    const errors = {
      username: '',
      password: '',
    };

    // Validate username
    if (!username.trim()) {
      errors.username = 'Username is required';
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

    setFormErrors(errors);
    return isValid;
  };

  // Handle login submission
  const handleLogin = async () => {
    clearError();

    if (!validateForm()) {
      return;
    }

    try {
      await login({ username, password });
      // Navigation will be handled by the AppNavigator based on isAuthenticated state
    } catch (e) {
      // Error is already handled in the Auth Context
      console.log('Login error:', e);
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
            <StyledText
              weight="bold"
              style={[styles.title, { color: theme.colors.text }]}
            >
              Welcome Back
            </StyledText>
            <StyledText
              style={[styles.subtitle, { color: theme.colors.textSecondary }]}
            >
              Sign in to your account
            </StyledText>
          </View>

          {error && (
            <View
              style={[
                styles.errorContainer,
                { backgroundColor: theme.colors.error + '15' },
              ]}
            >
              <StyledText
                style={[styles.errorText, { color: theme.colors.error }]}
              >
                {error}
              </StyledText>
            </View>
          )}

          <View style={styles.form}>
            <TextInputWrapper
              label="Username"
              placeholder="Enter your username"
              autoComplete="username"
              value={username}
              onChangeText={setUsername}
              error={formErrors.username}
            />

            <TextInputWrapper
              label="Password"
              placeholder="Enter your password"
              secureTextEntry
              autoComplete="password"
              value={password}
              onChangeText={setPassword}
              error={formErrors.password}
            />

            <TouchableOpacity
              style={styles.forgotPassword}
              onPress={() =>
                Alert.alert(
                  'Feature coming soon',
                  'Password reset functionality will be available in a future update.'
                )
              }
            >
              <StyledText
                style={[
                  styles.forgotPasswordText,
                  { color: theme.colors.primary },
                ]}
              >
                Forgot Password?
              </StyledText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                { backgroundColor: theme.colors.primary },
                isLoading && [
                  styles.buttonDisabled,
                  { backgroundColor: theme.colors.primary + '80' },
                ],
              ]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={theme.colors.white} />
              ) : (
                <StyledText
                  weight="bold"
                  style={[styles.buttonText, { color: theme.colors.white }]}
                >
                  Sign In
                </StyledText>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <StyledText
              style={[styles.footerText, { color: theme.colors.textSecondary }]}
            >
              Don't have an account?{' '}
            </StyledText>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <StyledText
                weight="bold"
                style={[styles.linkText, { color: theme.colors.primary }]}
              >
                Sign Up
              </StyledText>
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
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  form: {
    width: '100%',
    marginBottom: 24,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
  },
  button: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.8,
  },
  buttonText: {
    fontSize: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
  },
  linkText: {
    fontSize: 14,
  },
  errorContainer: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
  },
});

export default LoginScreen;
