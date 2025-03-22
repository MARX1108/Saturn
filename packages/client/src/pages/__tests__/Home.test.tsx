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

describe("Home Component", () => {
  it("renders welcome message and post list", () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Home />
        </AuthProvider>
      </BrowserRouter>
    );

    expect(screen.getByText(/welcome to saturn/i)).toBeInTheDocument();
    expect(screen.getByTestId("post-list")).toBeInTheDocument();
  });
});
