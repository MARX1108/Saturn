// jest.setup.js
// Mock react-native modules that might not be available in the test environment
jest.mock('react-native', () => {
  // Return a merged object with both existing mock and our new mocks
  const rn = {
    // Add any RN components or APIs that are used in your tests
    Platform: {
      OS: 'ios',
      select: jest.fn((obj) => obj.ios || obj.default),
    },
    NativeModules: {},

    // Add StyleSheet mock
    StyleSheet: {
      create: (styles) => styles,
      hairlineWidth: 1,
      absoluteFill: {},
      flatten: jest.fn(),
    },

    // Mock Animated
    Animated: {
      View: 'Animated.View',
      Text: 'Animated.Text',
      Image: 'Animated.Image',
      ScrollView: 'Animated.ScrollView',
      createAnimatedComponent: (component) => component,
      timing: jest.fn(() => ({
        start: jest.fn(),
      })),
      spring: jest.fn(() => ({
        start: jest.fn(),
      })),
      Value: jest.fn(() => ({
        setValue: jest.fn(),
        interpolate: jest.fn(() => ({
          interpolate: jest.fn(),
        })),
      })),
    },

    // Mock other components
    ActivityIndicator: 'ActivityIndicator',
    Button: 'Button',
    FlatList: 'FlatList',
    Image: 'Image',
    Modal: 'Modal',
    Pressable: 'Pressable',
    RefreshControl: 'RefreshControl',
    SafeAreaView: 'SafeAreaView',
    ScrollView: 'ScrollView',
    SectionList: 'SectionList',
    StatusBar: 'StatusBar',
    Switch: 'Switch',
    Text: 'Text',
    TextInput: 'TextInput',
    TouchableOpacity: 'TouchableOpacity',
    TouchableWithoutFeedback: 'TouchableWithoutFeedback',
    View: 'View',
  };

  return rn;
});

// Mock tokenStorage to prevent circular dependencies
jest.mock('../services/tokenStorage', () => {
  return {
    getToken: jest.fn().mockResolvedValue(null),
    setToken: jest.fn().mockResolvedValue(undefined),
    clearToken: jest.fn().mockResolvedValue(undefined),
  };
});

// Mock React Navigation
jest.mock('@react-navigation/native', () => {
  return {
    useNavigation: () => ({
      navigate: jest.fn(),
      goBack: jest.fn(),
    }),
    useRoute: () => ({
      params: { username: 'testprofile' },
    }),
    useIsFocused: jest.fn(() => true),
  };
});

// Set up any global test configurations
global.console = {
  ...global.console,
  error: jest.fn(),
  warn: jest.fn(),
  log: jest.fn(),
};

// Silence specific expected warnings
jest.spyOn(console, 'warn').mockImplementation((...args) => {
  if (args[0]?.includes('Some expected warning')) {
    return;
  }
  console.warn(...args);
});

// Fix for Jest not exiting
afterEach(() => {
  // Clear all timers
  jest.clearAllTimers();
});

// Add a global afterAll hook to clean up any hanging async operations
afterAll(() => {
  // Ensure all timers are cleared
  jest.clearAllTimers();

  // Return a resolved promise to make sure Jest waits for it
  return new Promise((resolve) => {
    // Small timeout to ensure any pending microtasks are processed
    setTimeout(() => {
      resolve();
    }, 100);
  });
});
