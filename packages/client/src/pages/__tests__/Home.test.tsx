import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Home from "../../pages/Home";
import { AuthProvider } from "../../context/AuthContext";

// Mock the auth context
jest.mock("../../context/AuthContext", () => {
  const AuthContext = jest.requireActual("../../context/AuthContext");
  return {
    ...AuthContext,
    useAuth: () => ({
      isAuthenticated: true,
      user: { id: "123", username: "testuser" },
    }),
    AuthProvider: ({ children }) => children,
  };
});

// Mock PostList component
jest.mock("../../components/PostList", () => ({
  __esModule: true,
  default: () => <div data-testid="post-list">Mocked PostList</div>,
}));

// Mock fetch
global.fetch = jest.fn().mockImplementation(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve([]),
  })
);

describe("Home Component", () => {
  it("renders the home page with post list", async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Home />
        </AuthProvider>
      </BrowserRouter>
    );

    // Wait for any async operations to complete
    await waitFor(() => {
      // Check for post list element
      expect(screen.getByTestId("post-list")).toBeInTheDocument();
    });

    // Check for timeline headings or other stable elements
    expect(screen.getByText(/create/i)).toBeInTheDocument();
  });
});
