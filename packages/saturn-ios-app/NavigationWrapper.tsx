import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MinimalApp from './MinimalApp';

const Stack = createNativeStackNavigator();

// Simple wrapper that adds just NavigationContainer
const NavigationWrapper = (): React.JSX.Element => {
  console.log('[NavigationWrapper] Rendering with NavigationContainer');
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Home"
          component={MinimalApp}
          options={{ headerTitle: 'Saturn App' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default NavigationWrapper;
