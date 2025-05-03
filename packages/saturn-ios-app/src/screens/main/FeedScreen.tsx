import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function FeedScreen(): React.JSX.Element {
  return (
    <View style={styles.container}>
      <Text>Feed Screen</Text>
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
