import { vi } from "vitest";

export const mockAuthContextValue = {
  user: {
    id: "user-123",
    preferredUsername: "testuser",
    name: "Test User",
    summary: "Test bio",
    icon: { url: "https://example.com/avatar.jpg", mediaType: "image/jpeg" },
  },
  token: "fake-token",
  isAuthenticated: true,
  loading: false,
  error: null,
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
};

export const mockUnauthenticatedContextValue = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
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
