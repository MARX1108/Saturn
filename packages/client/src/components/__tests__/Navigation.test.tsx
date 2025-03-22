import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Navigation from "../Navigation";
import { AuthProvider } from "../../context/AuthContext";
import {
  mockAuthContextValue,
  mockUnauthenticatedContextValue,
} from "../../test/mocks/authContext";

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("Navigation Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders login and signup links when not authenticated", () => {
    // Mock unauthenticated state
    vi.mock("../../context/AuthContext", async () => {
      const actual = await vi.importActual("../../context/AuthContext");
      return {
        ...actual,
        useAuth: () => mockUnauthenticatedContextValue,
      };
    });

    render(
      <BrowserRouter>
        <AuthProvider>
          <Navigation />
        </AuthProvider>
      </BrowserRouter>
    );

    expect(screen.getByText("Log In")).toBeInTheDocument();
    expect(screen.getByText("Sign Up")).toBeInTheDocument();
    expect(screen.queryByText("Logout")).not.toBeInTheDocument();
  });

  it("renders user navigation when authenticated", () => {
    // Mock authenticated state
    vi.mock("../../context/AuthContext", async () => {
      const actual = await vi.importActual("../../context/AuthContext");
      return {
        ...actual,
        useAuth: () => mockAuthContextValue,
      };
    });

    render(
      <BrowserRouter>
        <AuthProvider>
          <Navigation />
        </AuthProvider>
      </BrowserRouter>
    );

    expect(screen.queryByText("Log In")).not.toBeInTheDocument();
    expect(screen.queryByText("Sign Up")).not.toBeInTheDocument();
    expect(screen.getByText("Logout")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Search")).toBeInTheDocument();
  });

  it("handles search submission", () => {
    // Mock authenticated state
    vi.mock("../../context/AuthContext", async () => {
      const actual = await vi.importActual("../../context/AuthContext");
      return {
        ...actual,
        useAuth: () => mockAuthContextValue,
      };
    });

    render(
      <BrowserRouter>
        <AuthProvider>
          <Navigation />
        </AuthProvider>
      </BrowserRouter>
    );

    // Type in search
    const searchInput = screen.getByPlaceholderText("Search");
    fireEvent.change(searchInput, { target: { value: "test query" } });

    // Submit search
    const form = searchInput.closest("form");
    fireEvent.submit(form);

    // Check navigation to search results
    expect(mockNavigate).toHaveBeenCalledWith("/search?q=test%20query");
  });

  it("handles logout", () => {
    // Mock authenticated state with logout function
    const mockLogout = vi.fn();
    vi.mock("../../context/AuthContext", async () => {
      const actual = await vi.importActual("../../context/AuthContext");
      return {
        ...actual,
        useAuth: () => ({
          ...mockAuthContextValue,
          logout: mockLogout,
        }),
      };
    });

    render(
      <BrowserRouter>
        <AuthProvider>
          <Navigation />
        </AuthProvider>
      </BrowserRouter>
    );

    // Click logout
    fireEvent.click(screen.getByText("Logout"));

    // Check logout called and navigation to login
    expect(mockLogout).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });
});
