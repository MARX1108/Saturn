export const mockAuthContextValue = {
  user: {
    id: "user123",
    preferredUsername: "testuser",
    name: "Test User",
    summary: "This is a test bio",
    icon: {
      url: "https://example.com/avatar.jpg",
      mediaType: "image/jpeg",
    },
  },
  isAuthenticated: true,
  loading: false,
  error: null,
  login: jest.fn(),
  register: jest.fn(),
  logout: jest.fn(),
  token: "fake-token",
};

export const mockUnauthenticatedContextValue = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  login: jest.fn(),
  register: jest.fn(),
  logout: jest.fn(),
  token: null,
};
