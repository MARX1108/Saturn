// Mock auth context for testing

export const mockAuthContextValue = {
  user: {
    id: "test-user-id",
    username: "testuser",
    email: "test@example.com",
    name: "Test User",
  },
  isAuthenticated: true,
  loading: false,
  error: null,
  login: jest.fn(),
  register: jest.fn(),
  logout: jest.fn(),
  verifyToken: jest.fn(),
  clearError: jest.fn(),
};

export const mockUnauthenticatedContextValue = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  login: jest.fn(),
  register: jest.fn(),
  logout: jest.fn(),
  verifyToken: jest.fn(),
  clearError: jest.fn(),
};

export const mockAuthContextWithLoading = {
  ...mockAuthContextValue,
  loading: true,
};

// Helper function to create a custom mock with specific overrides
export const createMockAuthContext = (overrides = {}) => ({
  ...mockAuthContextValue,
  ...overrides,
});
