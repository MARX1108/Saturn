import React from 'react';
import { render, act } from '@testing-library/react-native';
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

describe('SearchScreen Snapshots', () => {
  it('renders correctly with empty search', () => {
    const { toJSON } = render(<SearchScreen />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('renders correctly with search text', () => {
    const { toJSON, getByTestId } = render(<SearchScreen />);

    // Use act to properly handle state updates
    act(() => {
      const searchInput = getByTestId('search-input-field');
      searchInput.props.onChangeText('test query');
    });

    expect(toJSON()).toMatchSnapshot();
  });
});
