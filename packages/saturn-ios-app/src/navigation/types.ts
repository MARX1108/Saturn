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
  SearchTab: undefined;
  CreatePostPlaceholder: undefined;
  NotificationsTab: undefined;
  ProfileTab: { username: string } | undefined;
  SettingsTab: undefined;
};

// Root Stack
export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Register: undefined;
  OnboardingFlow: undefined;
  MainFlow: { screen?: string; params?: object };
  CreatePostModal: undefined;
  ProfileEditModal: undefined;
  CommentModal: { postId: string };
  ProfileSettings: undefined;
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
