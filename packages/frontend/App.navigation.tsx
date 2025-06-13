import 'react-native-get-random-values';
import React from 'react';
import { View, Text } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { persistStore, persistReducer } from 'redux-persist';
import { configureStore } from '@reduxjs/toolkit';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Simple in-memory storage for Expo Go testing
const memoryStorage = {
  data: {} as Record<string, string>,
  setItem: (key: string, value: string) => {
    memoryStorage.data[key] = value;
    return Promise.resolve();
  },
  getItem: (key: string) => {
    return Promise.resolve(memoryStorage.data[key] || null);
  },
  removeItem: (key: string) => {
    delete memoryStorage.data[key];
    return Promise.resolve();
  },
};

// Simple test reducer
const testReducer = (state = { test: 'working' }, action: any) => {
  return state;
};

const persistConfig = {
  key: 'root',
  storage: memoryStorage,
};

const persistedReducer = persistReducer(persistConfig, testReducer);

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

// Simple test screen
function TestScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
      <Text style={{ fontSize: 24, color: 'black' }}>Navigation Test - Working</Text>
    </View>
  );
}

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <PersistGate persistor={persistor}>
          <NavigationContainer>
            <Stack.Navigator>
              <Stack.Screen name="Test" component={TestScreen} />
            </Stack.Navigator>
          </NavigationContainer>
        </PersistGate>
      </Provider>
    </GestureHandlerRootView>
  );
}