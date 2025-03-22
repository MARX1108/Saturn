import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Navigation from "../../components/Navigation";
import { AuthProvider } from "../../context/AuthContext";
import {
  mockAuthContextValue,
  mockUnauthenticatedContextValue,
} from "../../test/mocks/authContext";

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock the useAuth hook
jest.mock("../../context/AuthContext", async () => {
  const actual = await jest.requireActual("../../context/AuthContext");
  return {
    ...actual,
    useAuth: () => mockAuthContextValue,
  };
});

describe("Navigation Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders login and signup links when not authenticated", () => {
    // Need to override the mock for this specific test
    jest
      .spyOn(require("../../context/AuthContext"), "useAuth")
      .mockReturnValue(mockUnauthenticatedContextValue);

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
    render(
      <BrowserRouter>
        <AuthProvider>
          <Navigation />
        </AuthProvider>
      </BrowserRouter>
    );

    expect(screen.queryByText("Log In")).not.toBeInTheDocument();
    expect(screen.queryByText("Sign Up")).not.toBeInTheDocument();
    expect(screen.getByText("Log Out")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Search")).toBeInTheDocument();
  });

  it("handles search submission", () => {
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
    const form = screen.getByRole("form");
    if (form) {
      fireEvent.submit(form);
    }

    // Check navigation to search results
    expect(mockNavigate).toHaveBeenCalledWith("/search?q=test%20query");
  });

  it("handles logout", () => {
    const mockLogout = jest.fn();
    jest
      .spyOn(require("../../context/AuthContext"), "useAuth")
      .mockReturnValue({
        ...mockAuthContextValue,
        logout: mockLogout,
      });

    render(
      <BrowserRouter>
        <AuthProvider>
          <Navigation />
        </AuthProvider>
      </BrowserRouter>
    );

    // Click logout
    fireEvent.click(screen.getByText("Log Out"));

    // Check logout called and navigation to login
    expect(mockLogout).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });

  it("renders navigation links when user is logged in", () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Navigation />
        </AuthProvider>
      </BrowserRouter>
    );

    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Profile")).toBeInTheDocument();
    expect(screen.getByText("Log Out")).toBeInTheDocument();
  });

  it("should call logout when Log Out is clicked", () => {
    const mockLogout = jest.fn();
    jest
      .spyOn(require("../../context/AuthContext"), "useAuth")
      .mockReturnValue({
        ...mockAuthContextValue,
        logout: mockLogout,
      });

    render(
      <BrowserRouter>
        <AuthProvider>
          <Navigation />
        </AuthProvider>
      </BrowserRouter>
    );

    fireEvent.click(screen.getByText("Log Out"));
    expect(mockLogout).toHaveBeenCalled();
  });
});
