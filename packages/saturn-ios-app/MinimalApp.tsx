import React from 'react';
import {
  AppRegistry,
  View,
  Text,
  StyleSheet,
  SafeAreaView,
} from 'react-native';

// Simple component with no external dependencies
const MinimalApp = (): React.JSX.Element => {
  console.log('Rendering MinimalApp');
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Saturn App - Diagnostic Mode</Text>
        <Text style={styles.subtitle}>Basic React Native components only</Text>
        <Text style={styles.info}>
          If you can see this text, basic rendering is working
        </Text>
      </View>
    </SafeAreaView>
  );
};

// Basic styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 12,
    textAlign: 'center',
  },
  info: {
    fontSize: 16,
    color: '#666',
    marginTop: 20,
    textAlign: 'center',
  },
});

export default MinimalApp;
