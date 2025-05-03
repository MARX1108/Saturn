import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
// Import other reducers here later

export const store = configureStore({
  reducer: {
    auth: authReducer,
    // other reducers...
  },
  // Add middleware later if needed (e.g., for RTK Query, Sentry)
  // middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(apiSlice.middleware),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
