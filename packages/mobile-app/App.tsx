import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { View, Text, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

// Theme provider
import { ThemeProvider } from './src/theme/ThemeContext';

// Auth provider
import { AuthProvider } from './src/context/AuthContext';

// Navigation
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <StatusBar style="auto" />
          <AppNavigator />
          <Toast
            position="top"
            topOffset={60}
            config={{
              error: ({ text1, text2 }) => (
                <View style={styles.errorToast}>
                  <Ionicons name="alert-circle" size={24} color="#fff" />
                  <View style={styles.toastContent}>
                    <Text style={styles.toastTitle}>{text1}</Text>
                    {text2 && <Text style={styles.toastMessage}>{text2}</Text>}
                  </View>
                </View>
              ),
            }}
          />
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  errorToast: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e74c3c',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 16,
    marginTop: 8,
  },
  toastContent: {
    marginLeft: 12,
    flex: 1,
  },
  toastTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  toastMessage: {
    color: '#fff',
    fontSize: 14,
    marginTop: 4,
  },
});
