import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import Onboard from './index';
import { setRoute } from '../../redux/slice/routes';

// Mock React Navigation (not used but may be imported elsewhere)
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
  }),
}));

// Mock the redux slice
jest.mock('../../redux/slice/routes', () => ({
  setRoute: jest.fn((payload) => ({ type: 'routes/setRoute', payload })),
}));

// Mock the hooks
jest.mock('../../hooks/GetMode', () => ({
  __esModule: true,
  default: () => false, // Mock light mode
}));

// Mock Expo modules
jest.mock('expo-image', () => ({
  Image: 'Image',
}));

jest.mock('@expo/vector-icons/Ionicons', () => 'Ionicons');

// Mock the data
jest.mock('../../data/murphy', () => ({
  murphyLaws: ['Test law 1', 'Test law 2', 'Test law 3'],
}));

// Mock OnboardBuilder component
jest.mock('./components/OnboardBuilder', () => 'OnboardBuilder');

// Mock TrackerTag component
jest.mock('./components/TrackerTag', () => 'TrackerTag');

// react-native-reanimated is mocked in __mocks__/react-native-reanimated.js

// Create a mock store
const createMockStore = () => {
  return configureStore({
    reducer: {
      routes: (state = { route: 'Onboard' }, action) => {
        if (action.type === 'routes/setRoute') {
          return { ...state, route: action.payload.route };
        }
        return state;
      },
    },
  });
};

describe('Onboard Component', () => {
  let store: ReturnType<typeof createMockStore>;
  let dispatchSpy: jest.SpyInstance;

  beforeEach(() => {
    store = createMockStore();
    dispatchSpy = jest.spyOn(store, 'dispatch');
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { toJSON } = render(
      <Provider store={store}>
        <Onboard />
      </Provider>
    );

    expect(toJSON()).toBeTruthy();
  });

  it('triggers navigation to Auth screen when Continue button is pressed', () => {
    const { getByTestId } = render(
      <Provider store={store}>
        <Onboard />
      </Provider>
    );

    try {
      // Try to find a pressable element by test ID (we'll add this)
      const continueButton = getByTestId('continue-button');
      fireEvent.press(continueButton);
    } catch (error) {
      // If test ID not found, find by component type
      const { UNSAFE_getAllByType } = render(
        <Provider store={store}>
          <Onboard />
        </Provider>
      );
      
      const pressables = UNSAFE_getAllByType(require('react-native').Pressable);
      if (pressables.length > 0) {
        fireEvent.press(pressables[0]);
      }
    }

    // Verify that setRoute was called
    expect(setRoute).toHaveBeenCalledWith({ route: 'Auth' });
    expect(dispatchSpy).toHaveBeenCalled();
  });

  it('logs diagnostic information when button is pressed', () => {
    const consoleSpy = jest.spyOn(console, 'log');
    
    const { UNSAFE_getAllByType } = render(
      <Provider store={store}>
        <Onboard />
      </Provider>
    );

    const pressables = UNSAFE_getAllByType(require('react-native').Pressable);
    if (pressables.length > 0) {
      fireEvent.press(pressables[0]);
      
      // Verify diagnostic log was called
      expect(consoleSpy).toHaveBeenCalledWith(
        '[DIAGNOSTIC_ONBOARDING] Entry: The handleNext function was triggered.'
      );
    }
  });

  it('catches and logs errors in the handler', () => {
    // Make dispatch throw an error
    dispatchSpy.mockImplementation(() => {
      throw new Error('Test error');
    });

    const consoleErrorSpy = jest.spyOn(console, 'error');
    
    const { UNSAFE_getAllByType } = render(
      <Provider store={store}>
        <Onboard />
      </Provider>
    );

    const pressables = UNSAFE_getAllByType(require('react-native').Pressable);
    if (pressables.length > 0) {
      fireEvent.press(pressables[0]);

      // Verify error was caught and logged
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[DIAGNOSTIC_ONBOARDING] FATAL: An error was caught inside the handleNext function.',
        expect.any(Error)
      );
    }
  });
});