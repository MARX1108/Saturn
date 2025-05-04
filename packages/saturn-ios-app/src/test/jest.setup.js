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
  // Completely disable console.warn for tests
  warn: jest.fn(),
  log: jest.fn(),
};

// Mock TanStack Query's gc timers to prevent hanging tests
jest.mock('@tanstack/query-core', () => {
  const originalModule = jest.requireActual('@tanstack/query-core');
  return {
    ...originalModule,
    Mutation: class extends originalModule.Mutation {
      scheduleGc() {
        // Override the scheduleGc method to not set timers that can hang
        return;
      }
    },
    Query: class extends originalModule.Query {
      scheduleGc() {
        // Override the scheduleGc method to not set timers that can hang
        return;
      }
    },
  };
});

// Clear all timers and pending handles after each test
afterEach(() => {
  // Clear all timers
  jest.clearAllTimers();

  // Clear any pending promises to avoid "Jest did not exit one second after the test run has completed"
  jest.runAllTicks();
});

// Add a global afterAll hook to clean up any hanging async operations
afterAll(() => {
  // Ensure all timers are cleared
  jest.clearAllTimers();
  jest.runAllTicks();

  // Return a resolved promise to make sure Jest waits for it
  return new Promise((resolve) => {
    // Small timeout to ensure any pending microtasks are processed
    setTimeout(() => {
      resolve();
    }, 100);
  });
});
