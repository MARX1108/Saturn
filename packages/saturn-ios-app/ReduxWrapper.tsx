import React from 'react';
import { Provider } from 'react-redux';
import { store } from './src/store/store';
import MinimalApp from './MinimalApp';

// Simple wrapper that adds Redux Provider
const ReduxWrapper = (): React.JSX.Element => {
  console.log('[ReduxWrapper] Rendering with Redux Provider');
  return (
    <Provider store={store}>
      <MinimalApp />
    </Provider>
  );
};

export default ReduxWrapper;
