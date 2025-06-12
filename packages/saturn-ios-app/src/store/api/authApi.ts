import { baseApi } from './baseApi';
import { ApiEndpoints } from '../../config/api';
import { setToken, storeCredentials } from '../../services/tokenStorage';

// Types for authentication
export interface User {
  id: string;
  _id: string;
  username: string;
  displayName?: string;
  preferredUsername?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginCredentials {
  username: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  username: string;
  password: string;
  email: string;
  displayName?: string;
  rememberMe?: boolean;
}

// Auth API slice
export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, LoginCredentials>({
      query: (credentials) => ({
        url: ApiEndpoints.login,
        method: 'POST',
        body: credentials,
      }),
      async onQueryStarted(credentials, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          
          // Store token
          await setToken(data.token);
          
          // Store credentials if rememberMe is true
          if (credentials.rememberMe) {
            await storeCredentials({
              username: credentials.username,
              password: credentials.password,
            });
          }
        } catch (error) {
          console.error('Login failed:', error);
        }
      },
      invalidatesTags: ['User'],
    }),
    
    register: builder.mutation<AuthResponse, RegisterData>({
      query: (userData) => ({
        url: ApiEndpoints.register,
        method: 'POST',
        body: userData,
      }),
      async onQueryStarted(userData, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          
          // Store token
          await setToken(data.token);
          
          // Store credentials if rememberMe is true
          if (userData.rememberMe) {
            await storeCredentials({
              username: userData.username,
              password: userData.password,
            });
          }
        } catch (error) {
          console.error('Registration failed:', error);
        }
      },
      invalidatesTags: ['User'],
    }),
    
    getMe: builder.query<User, void>({
      query: () => ApiEndpoints.me,
      providesTags: ['User'],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetMeQuery,
} = authApi;