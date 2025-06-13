import 'react-native-get-random-values';
import React from 'react';
import { View, Text } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
        <Text style={{ fontSize: 24, color: 'black' }}>Simple iOS Test - Working</Text>
      </View>
    </GestureHandlerRootView>
  );
}