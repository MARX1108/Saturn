import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import SearchScreen from './SearchScreen';

// Mock the navigation
jest.mock('@react-navigation/native', () => {
  return {
    ...jest.requireActual('@react-navigation/native'),
    useNavigation: () => ({
      navigate: jest.fn(),
    }),
  };
});

// Mock console.log to track search queries
const originalConsoleLog = console.log;
const mockConsoleLog = jest.fn();

describe('SearchScreen', () => {
  beforeAll(() => {
    console.log = mockConsoleLog;
  });

  afterAll(() => {
    console.log = originalConsoleLog;
  });

  beforeEach(() => {
    mockConsoleLog.mockClear();
  });

  it('renders correctly with all UI components', () => {
    const { getByTestId, getByPlaceholderText, getByText } = render(
      <SearchScreen />
    );

    // Verify all components are rendered using testIDs
    expect(getByTestId('search-screen-container')).toBeTruthy();
    expect(getByTestId('search-screen-header')).toBeTruthy();
    expect(getByTestId('search-input-container')).toBeTruthy();
    expect(getByTestId('search-input-field')).toBeTruthy();
    expect(getByTestId('search-results-container')).toBeTruthy();
    expect(getByTestId('search-results-placeholder')).toBeTruthy();
    expect(getByTestId('search-debug-container')).toBeTruthy();
    expect(getByTestId('search-debug-text')).toBeTruthy();

    // Also check the text content
    expect(getByText('User Search')).toBeTruthy();
    expect(
      getByPlaceholderText('Search users by username or display name...')
    ).toBeTruthy();
    expect(getByText('Enter a query to search for users.')).toBeTruthy();
    expect(getByText('Debug info: SearchScreen is rendering')).toBeTruthy();
  });

  it('updates search query when text is entered', () => {
    const { getByTestId, getByText } = render(<SearchScreen />);

    const searchInput = getByTestId('search-input-field');

    // Type a search query
    fireEvent.changeText(searchInput, 'test user');

    // Verify the placeholder text changes
    expect(getByText('Searching for "test user"...')).toBeTruthy();

    // Check if console.log was called with the search query
    expect(mockConsoleLog).toHaveBeenCalledWith('Search query:', 'test user');
  });

  it('displays initial placeholder when search query is empty', () => {
    const { getByTestId, getByText } = render(<SearchScreen />);

    const searchInput = getByTestId('search-input-field');

    // First add text
    fireEvent.changeText(searchInput, 'test user');

    // Then clear it
    fireEvent.changeText(searchInput, '');

    // Verify the placeholder changes back
    expect(getByText('Enter a query to search for users.')).toBeTruthy();
  });
});
