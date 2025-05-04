import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  status: 'unauthenticated' | 'authenticated' | 'loading';
  token: string | null;
  profileComplete: boolean;
  error: string | null;
}

const initialState: AuthState = {
  status: 'unauthenticated',
  token: null,
  profileComplete: false,
  error: null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.status = 'loading';
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<{ token: string }>) => {
      state.status = 'authenticated';
      state.token = action.payload.token;
      state.error = null;
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.status = 'unauthenticated';
      state.error = action.payload;
    },
    logout: (state) => {
      state.status = 'unauthenticated';
      state.token = null;
      state.error = null;
    },
    setProfileComplete: (state, action: PayloadAction<boolean>) => {
      state.profileComplete = action.payload;
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  setProfileComplete,
} = authSlice.actions;
export const authReducer = authSlice.reducer;

export default authSlice;
