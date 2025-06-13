// Jest setup file for React Native testing
require('@testing-library/jest-native/extend-expect');

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  
  // Provide additional mocks for missing components
  Reanimated.default.View = require('react-native').View;
  Reanimated.default.Text = require('react-native').Text;
  Reanimated.default.Image = require('react-native').Image;
  Reanimated.default.ScrollView = require('react-native').ScrollView;
  
  return {
    ...Reanimated,
    default: {
      ...Reanimated.default,
      createAnimatedComponent: (component) => component,
    },
  };
});

// Mock react-native-gesture-handler
jest.mock('react-native-gesture-handler', () => {
  const View = require('react-native').View;
  const Text = require('react-native').Text;
  const TouchableOpacity = require('react-native').TouchableOpacity;
  
  return {
    Swipeable: View,
    DrawerLayout: View,
    State: {},
    ScrollView: View,
    Slider: View,
    Switch: View,
    TextInput: View,
    ToolbarAndroid: View,
    ViewPagerAndroid: View,
    DrawerLayoutAndroid: View,
    WebView: View,
    NativeViewGestureHandler: View,
    TapGestureHandler: View,
    FlingGestureHandler: View,
    ForceTouchGestureHandler: View,
    LongPressGestureHandler: View,
    PanGestureHandler: View,
    PinchGestureHandler: View,
    RotationGestureHandler: View,
    RawButton: TouchableOpacity,
    BaseButton: TouchableOpacity,
    RectButton: TouchableOpacity,
    BorderlessButton: TouchableOpacity,
    FlatList: View,
    gestureHandlerRootHOC: (component) => component,
    Directions: {},
  };
});

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }) => children,
  SafeAreaView: require('react-native').View,
  useSafeAreaInsets: () => ({ top: 0, left: 0, right: 0, bottom: 0 }),
  useSafeAreaFrame: () => ({ x: 0, y: 0, width: 0, height: 0 }),
}));

// Mock expo-image
jest.mock('expo-image', () => ({
  Image: require('react-native').Image,
}));

// Mock expo vector icons
jest.mock('@expo/vector-icons/Ionicons', () => 'Ionicons');
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
  MaterialIcons: 'MaterialIcons',
  FontAwesome: 'FontAwesome',
  AntDesign: 'AntDesign',
}));

// Mock lottie-react-native
jest.mock('lottie-react-native', () => 'LottieView');

// Mock react-native-linear-gradient
jest.mock('react-native-linear-gradient', () => 'LinearGradient');

// Mock react-native-blur
jest.mock('@react-native-community/blur', () => ({
  BlurView: require('react-native').View,
}));

// Mock react-native-svg
jest.mock('react-native-svg', () => ({
  Svg: 'Svg',
  Circle: 'Circle',
  Ellipse: 'Ellipse',
  G: 'G',
  Text: 'Text',
  TSpan: 'TSpan',
  TextPath: 'TextPath',
  Path: 'Path',
  Polygon: 'Polygon',
  Polyline: 'Polyline',
  Line: 'Line',
  Rect: 'Rect',
  Use: 'Use',
  Image: 'Image',
  Symbol: 'Symbol',
  Defs: 'Defs',
  LinearGradient: 'LinearGradient',
  RadialGradient: 'RadialGradient',
  Stop: 'Stop',
  ClipPath: 'ClipPath',
  Pattern: 'Pattern',
  Mask: 'Mask',
}));

// Mock react-native-paper
jest.mock('react-native-paper', () => ({
  Button: require('react-native').TouchableOpacity,
  Text: require('react-native').Text,
  Surface: require('react-native').View,
  Card: require('react-native').View,
  Title: require('react-native').Text,
  Paragraph: require('react-native').Text,
  List: {
    Item: require('react-native').View,
    Section: require('react-native').View,
  },
  Portal: ({ children }) => children,
  Provider: ({ children }) => children,
}));

// Mock react-native-screens
jest.mock('react-native-screens', () => ({
  enableScreens: jest.fn(),
  Screen: require('react-native').View,
  ScreenContainer: require('react-native').View,
  NativeScreen: require('react-native').View,
  NativeScreenContainer: require('react-native').View,
}));

// Mock Expo modules
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  selectionAsync: jest.fn(),
  notificationAsync: jest.fn(),
}));

jest.mock('expo-status-bar', () => ({
  StatusBar: require('react-native').View,
}));

// Mock react-native-mmkv
jest.mock('react-native-mmkv', () => ({
  MMKV: jest.fn(() => ({
    set: jest.fn(),
    getString: jest.fn(),
    getNumber: jest.fn(),
    getBoolean: jest.fn(),
    delete: jest.fn(),
    getAllKeys: jest.fn(() => []),
    clearAll: jest.fn(),
  })),
}));

// Global test utilities
global.__DEV__ = true;