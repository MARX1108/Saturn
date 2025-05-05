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

// Mock expo-secure-store to avoid the ESM import errors
jest.mock(
  'expo-secure-store',
  () => ({
    getItemAsync: jest.fn().mockResolvedValue(null),
    setItemAsync: jest.fn().mockResolvedValue(undefined),
    deleteItemAsync: jest.fn().mockResolvedValue(undefined),
  }),
  { virtual: true }
);

// Mock tokenStorage to prevent circular dependencies
jest.mock('../services/tokenStorage', () => {
  return {
    getToken: jest.fn().mockResolvedValue(null),
    setToken: jest.fn().mockResolvedValue(undefined),
    clearToken: jest.fn().mockResolvedValue(undefined),
  };
});

// Mock React Redux to prevent ESM issues
jest.mock(
  'react-redux',
  () => {
    return {
      useDispatch: jest.fn(() => jest.fn()),
      useSelector: jest.fn((selector) =>
        selector({
          auth: {
            user: {
              id: 'test-id',
              _id: 'test-id',
              username: 'testuser',
              displayName: 'Test User',
            },
            status: 'authenticated',
            token: 'test-token',
            profileComplete: true,
          },
        })
      ),
      Provider: ({ children }) => children,
    };
  },
  { virtual: true }
);

// Mock Redux Toolkit
jest.mock(
  '@reduxjs/toolkit',
  () => {
    return {
      configureStore: jest.fn(() => ({
        getState: jest.fn(),
        dispatch: jest.fn(),
        subscribe: jest.fn(),
      })),
      createSlice: jest.fn(() => ({
        reducer: jest.fn(),
        actions: {},
      })),
    };
  },
  { virtual: true }
);

// Mock React Navigation more completely
jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: jest.fn(),
      goBack: jest.fn(),
      setOptions: jest.fn(),
      dispatch: jest.fn(),
    }),
    useRoute: () => ({
      params: { username: 'testprofile' },
    }),
    useIsFocused: jest.fn(() => true),
    // Mock NavigationContainer to avoid getConstants errors
    NavigationContainer: ({ children }) => children,
    StackActions: {
      pop: jest.fn(() => ({ type: 'POP' })),
    },
    CommonActions: {
      navigate: jest.fn((name) => ({
        type: 'NAVIGATE',
        payload: { name },
      })),
    },
  };
});

// Mock @react-navigation/native-stack which is used in many components
jest.mock('@react-navigation/native-stack', () => {
  return {
    createNativeStackNavigator: jest.fn().mockReturnValue({
      Navigator: ({ children }) => children,
      Screen: ({ children }) => children,
    }),
  };
});

// Mock TanStack/React-Query
jest.mock(
  '@tanstack/react-query',
  () => {
    return {
      QueryClient: jest.fn().mockImplementation(() => ({
        invalidateQueries: jest.fn().mockResolvedValue(undefined),
        setQueryData: jest.fn(),
        getQueryData: jest.fn(),
        resetQueries: jest.fn(),
        clear: jest.fn(),
        unmount: jest.fn(),
      })),
      QueryClientProvider: ({ children }) => children,
      useQuery: jest.fn().mockReturnValue({
        data: null,
        isLoading: false,
        isError: false,
        error: null,
        refetch: jest.fn(),
      }),
      useMutation: jest.fn().mockReturnValue({
        mutate: jest.fn(),
        isPending: false,
        isError: false,
        error: null,
        isSuccess: false,
      }),
      useQueryClient: jest.fn().mockReturnValue({
        invalidateQueries: jest.fn(),
        setQueryData: jest.fn(),
        getQueryData: jest.fn(),
        clear: jest.fn(),
      }),
    };
  },
  { virtual: true }
);

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

  // Improved mocked classes that don't use timers
  const MockMutation = class extends originalModule.Mutation {
    scheduleGc() {
      // Override the scheduleGc method to not set timers that can hang
      return;
    }
  };

  const MockQuery = class extends originalModule.Query {
    scheduleGc() {
      // Override the scheduleGc method to not set timers that can hang
      return;
    }
  };

  return {
    ...originalModule,
    Mutation: MockMutation,
    Query: MockQuery,
  };
});

// Expose a function to reset the query client
global.resetQueryClient = () => {
  if (!global.queryClient) {
    const { QueryClient } = require('@tanstack/react-query');
    global.queryClient = {
      clear: jest.fn(),
      unmount: jest.fn(),
      resetQueries: jest.fn(),
      invalidateQueries: jest.fn(),
      setQueryData: jest.fn(),
      getQueryData: jest.fn(),
    };
  } else {
    // Reset the mock functions
    global.queryClient.clear.mockReset();
    global.queryClient.unmount.mockReset();
  }
  return global.queryClient;
};

// Create initial query client
global.resetQueryClient();

// Enhanced cleanup for TanStack Query
afterEach(() => {
  // Clear all timers
  jest.clearAllTimers();

  // Clear any pending promises to avoid "Jest did not exit one second after the test run has completed"
  jest.runAllTicks();

  // Reset the query client between tests
  if (global.queryClient) {
    global.queryClient.clear();
  }
});

// Add a global afterAll hook to clean up any hanging async operations
afterAll(() => {
  // Clear the query client
  if (global.queryClient) {
    global.queryClient.clear();
    global.queryClient.unmount();
  }

  // Ensure all timers are cleared
  jest.clearAllTimers();

  // Run all ticks to flush any pending promises
  jest.runAllTicks();
});

// Add a global afterAll hook to clean up any hanging async operations
afterAll(() => {
  // Ensure all timers are cleared
  jest.clearAllTimers();
  jest.runAllTicks();

  // Clear any remaining MutationObserver/QueryObserver instances
  if (global.gc) {
    global.gc();
  }

  // Return a resolved promise to make sure Jest waits for it
  return new Promise((resolve) => {
    // Small timeout to ensure any pending microtasks are processed
    setTimeout(() => {
      resolve();
    }, 100);
  });
});

// Add a global teardown function for handling Pact servers
global.cleanupPactServers = async () => {
  // This is a placeholder for any pact-specific cleanup
  // If there are any hanging Pact servers, they should be cleaned up here
  return Promise.resolve();
};

// Mock our custom Toast component
jest.mock('../components/Toast', () => ({
  Toast: {
    show: jest.fn(),
    hide: jest.fn(),
  },
  default: jest.fn().mockImplementation(() => null),
}));
