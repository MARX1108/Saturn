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
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';
import { useAppDispatch } from '../../store/hooks';
import { setCredentials } from '../../store/slices/authSlice';
import { useRegisterMutation } from '../../store/api';
import { Ionicons } from '@expo/vector-icons';

type RegisterScreenNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'Register'
>;


export default function RegisterScreen(): React.JSX.Element {
  const navigation = useNavigation<RegisterScreenNavigationProp>();
  const dispatch = useAppDispatch();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [register, { isLoading }] = useRegisterMutation();

  const handleRegister = async (): Promise<void> => {
    if (isLoading) return;

    setError(null);

    if (!username || !email || !password || !displayName) {
      setError('All required fields must be filled.');
      Alert.alert('Registration Failed', 'All required fields must be filled.');
      return;
    }

    try {
      console.log(
        `Attempting registration for user: ${username}, email: ${email}, displayName: ${displayName}`
      );
      
      const result = await register({
        username,
        email,
        password,
        displayName,
        rememberMe,
      }).unwrap();

      console.log('Registration successful:', result);

      dispatch(
        setCredentials({
          user: result.user,
          token: result.token,
        })
      );
    } catch (error) {
      console.error('Registration failed:', error);

      let userMessage = 'Registration failed. Please try again.';

      if (error instanceof Error) {
        const errorMsg = error.message || '';
        userMessage = errorMsg || userMessage;
      } else if (typeof error === 'object' && error !== null && 'data' in error) {
        const errorData = error.data as { message?: string };
        userMessage = errorData.message || userMessage;
      }

      if (userMessage.includes('duplicate') || userMessage.includes('E11000')) {
        userMessage = 'Username already exists. Please choose another.';
      }

      setError(userMessage);
      Alert.alert('Registration Failed', userMessage);
    }
  };

  const handleNavigateToLogin = (): void => {
    navigation.navigate('Login');
  };

  const onRegisterPress = (): void => {
    void handleRegister();
  };

  // Toggle remember me checkbox
  const toggleRememberMe = (): void => {
    setRememberMe(!rememberMe);
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
          placeholder="Display Name (Required)"
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
        <TextInput
          style={[styles.input, styles.bioInput]}
          placeholder="Bio (Optional)"
          value={bio}
          onChangeText={setBio}
          multiline
          numberOfLines={3}
          editable={!isLoading}
          textAlignVertical="top"
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

const colors = {
  border: '#808080',
  error: '#FF0000',
  indicator: '#0000ff',
  background: '#FFFFFF',
  checkboxBorder: '#808080',
  checkboxChecked: '#4285F4',
  checkboxText: '#333333',
};

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
  bioInput: {
    height: 80,
    paddingTop: 10,
    textAlignVertical: 'top',
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
