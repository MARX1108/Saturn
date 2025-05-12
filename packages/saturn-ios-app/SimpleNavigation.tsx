import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import MinimalApp from './MinimalApp';

// A simpler wrapper that only uses NavigationContainer without stack navigator
const SimpleNavigation = (): React.JSX.Element => {
  console.log(
    '[SimpleNavigation] Rendering with basic NavigationContainer only'
  );
  return (
    <NavigationContainer>
      <MinimalApp />
    </NavigationContainer>
  );
};

export default SimpleNavigation;
