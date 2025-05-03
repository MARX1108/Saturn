import { NavigatorScreenParams } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

// Auth Stack (Login, Register)
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

// Main Tab Navigator
export type MainTabParamList = {
  FeedTab: undefined;
  CreatePostPlaceholder: undefined;
  ProfileTab: { username: string };
  SettingsTab: undefined;
};

// Root Stack
export type RootStackParamList = {
  AuthFlow: NavigatorScreenParams<AuthStackParamList>;
  MainFlow: NavigatorScreenParams<MainTabParamList>;
  // Modal screens
  CreatePostModal: undefined;
};

// Props for screens within the Root Stack
export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

// Props for screens within the Auth Stack
export type AuthStackScreenProps<T extends keyof AuthStackParamList> =
  NativeStackScreenProps<AuthStackParamList, T>;

// Props for screens within the Main Tab Navigator
export type MainTabScreenProps<T extends keyof MainTabParamList> =
  BottomTabScreenProps<MainTabParamList, T>;
