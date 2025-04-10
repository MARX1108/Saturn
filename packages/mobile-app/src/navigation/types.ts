// Navigation types for the application

// Auth stack parameter list
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

// Main tab navigation parameter list
export type MainTabParamList = {
  Feed: undefined;
  Create: undefined; // Added for create post tab
  Profile: { username?: string };
  Settings: undefined;
};

// Main app stack parameter list
export type MainStackParamList = {
  Home: undefined;
  Profile: { username?: string }; // Optional username param to view other profiles
  Settings: undefined;
  PostDetails: { postId: string };
  CreatePost: undefined;
  EditProfile: undefined;
};

// Root stack combining auth and main app stacks
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  MainTabNavigator: undefined;
  CreatePost: undefined; // Added to root stack for modal presentation
};
