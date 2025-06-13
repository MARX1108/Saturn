import 'react-native-get-random-values';
import React from 'react';
import { View, Text } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { persistStore, persistReducer } from 'redux-persist';
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { reduxStorage } from './redux/storage.expoGo';

// Import a few basic reducers to test
import routes from './redux/slice/routes';
import prefs from './redux/slice/prefs';
import user from './redux/slice/user';

// Simple persist config using Expo Go compatible storage
const persistConfig = {
  key: 'root',
  storage: reduxStorage,
  whitelist: ['routes', 'prefs', 'user'],
};

const reducer = combineReducers({
  routes,
  prefs, 
  user,
});

const persistedReducer = persistReducer(persistConfig, reducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

const persistor = persistStore(store);

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <PersistGate persistor={persistor}>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
            <Text style={{ fontSize: 24, color: 'black' }}>Expo Go Compatible Store - Working</Text>
            <Text style={{ fontSize: 16, color: 'gray', marginTop: 20 }}>
              Redux with fallback storage
            </Text>
          </View>
        </PersistGate>
      </Provider>
    </GestureHandlerRootView>
  );
}