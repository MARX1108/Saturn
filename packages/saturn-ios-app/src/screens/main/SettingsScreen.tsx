import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function SettingsScreen(): React.JSX.Element {
  return (
    <View style={styles.container}>
      <Text>Settings Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
