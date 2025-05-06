import { NavigatorScreenParams } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

// Define Param lists for each navigator

// Auth Stack (Login, Register)
export type AuthStackParamList = {
  Login: undefined; // No params expected for Login screen
  Register: undefined; // No params expected for Register screen
};

// Main Tab Navigator (Feed, Profile, Settings)
export type MainTabParamList = {
  FeedTab: undefined; // Renamed to avoid conflict with Feed screen potentially in a stack
  SearchTab: undefined; // Added SearchTab
  CreatePostPlaceholder: undefined; // Placeholder for the middle button
  ProfileTab: { username: string }; // Profile needs username, maybe optional if viewing own?
  SettingsTab: undefined;
};

// Root Stack (Includes Auth flow, Main App flow, and Modals)
export type RootStackParamList = {
  AuthFlow: NavigatorScreenParams<AuthStackParamList>; // Nested Auth Stack
  MainFlow: NavigatorScreenParams<MainTabParamList>; // Nested Main Tab Navigator
  // Add other root-level screens or modals here if needed later
  // e.g., PostDetails: { postId: string };
  // e.g., CreatePostModal: undefined;
};

// --- Type checking for screen props ---

// Props for screens within the Root Stack
export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

// Props for screens within the Auth Stack
export type AuthStackScreenProps<T extends keyof AuthStackParamList> =
  NativeStackScreenProps<AuthStackParamList, T>;

// Props for screens within the Main Tab Navigator
// Note: These are technically nested within the RootStack's MainFlow
export type MainTabScreenProps<T extends keyof MainTabParamList> =
  BottomTabScreenProps<MainTabParamList, T>;

// --- Augment ReactNavigation types ---
// Make sure RootStackParamList is available globally for type checking `useNavigation`
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
