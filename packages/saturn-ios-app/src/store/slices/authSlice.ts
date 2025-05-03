import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '../../types/user';

/**
 * Auth state interface
 */
interface AuthState {
  user: User | null;
  token: string | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed' | 'authenticated';
}

/**
 * Initial auth state
 */
const initialState: AuthState = {
  user: null,
  token: null,
  status: 'idle', // Initial status before checking storage
};

/**
 * Auth slice for Redux
 */
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Action to set credentials after login/register or loading from storage
    setCredentials(
      state,
      action: PayloadAction<{ user: User; token: string }>
    ) {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.status = 'authenticated';
    },
    // Action to clear credentials on logout or token expiry
    clearCredentials(state) {
      state.user = null;
      state.token = null;
      state.status = 'idle';
    },
    // Action to update status during async operations (e.g., checking token)
    setStatus(state, action: PayloadAction<AuthState['status']>) {
      // Prevent overriding 'authenticated' status unless explicitly logging out
      if (state.status !== 'authenticated' || action.payload === 'idle') {
        state.status = action.payload;
      } else if (
        action.payload === 'loading' &&
        state.status === 'authenticated'
      ) {
        // Allow setting loading even if authenticated (e.g. refreshing user data)
        state.status = action.payload;
      }
    },
    // Optional: Action to update user info if fetched separately
    setUser(state, action: PayloadAction<User | null>) {
      state.user = action.payload;
    },
  },
  // TODO: Add extraReducers later for handling async thunks (login, register, fetchUser)
  // extraReducers: (builder) => {
  //   builder
  //     .addCase(loginUser.pending, (state) => { state.status = 'loading'; })
  //     .addCase(loginUser.fulfilled, (state, action) => { /* handled by setCredentials */ })
  //     .addCase(loginUser.rejected, (state) => { state.status = 'failed'; });
  // }
});

export const { setCredentials, clearCredentials, setStatus, setUser } =
  authSlice.actions;

export default authSlice.reducer;
