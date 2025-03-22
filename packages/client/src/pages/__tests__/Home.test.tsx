import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Home from "../../pages/Home";
import { AuthProvider } from "../../context/AuthContext";
import { mockAuthContextValue } from "../../test/mocks/authContext";

// Mock the useAuth hook
jest.mock("../../context/AuthContext", () => ({
  ...jest.requireActual("../../context/AuthContext"),
  useAuth: () => mockAuthContextValue,
}));

// Mock PostList component
jest.mock("../../components/PostList", () => ({
  __esModule: true,
  default: () => <div data-testid="post-list">Mocked PostList</div>,
}));

// Mock fetch
global.fetch = jest.fn().mockImplementation(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ posts: [] }),
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

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText("Loading posts...")).not.toBeInTheDocument();
    });

    // Check for post list element
    expect(screen.getByTestId("post-list")).toBeInTheDocument();

    // Check for timeline headings or other stable elements
    expect(screen.getByText(/create/i)).toBeInTheDocument();
  });
});
