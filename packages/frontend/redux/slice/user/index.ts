import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { IUSerData } from "../../../types/api";

export interface UserState {
  data: IUSerData | null;
  error: any;
  token: string | null;
  loading: boolean;
}
const user = createSlice({
  name: "user",
  initialState: {
    data: null,
    error: null,
    loading: false,
    token: null,
  } as UserState,
  reducers: {
    loginSuccess: (state, action: PayloadAction<{ token: string; data: IUSerData }>) => {
      state.token = action.payload.token;
      state.data = action.payload.data;
      state.error = null;
      state.loading = false;
    },
    signOut: (state) => {
      state.error = null;
      state.loading = false;
      state.token = null;
      state.data = null;
      // Socket disconnect will be handled by middleware
    },
    clearUserData: (state) => {
      state.data = null;
      state.error = null;
      state.loading = false;
      state.token = null;
    },
  },
  // Note: Extra reducers moved to avoid circular dependencies
  // API state management will be handled directly by RTK Query
});

export default user.reducer;

export const { loginSuccess, signOut, clearUserData } = user.actions;
