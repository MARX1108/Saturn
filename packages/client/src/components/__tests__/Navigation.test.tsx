import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Navigation from "../../components/Navigation";
import {
  mockAuthContextValue,
  mockUnauthenticatedContextValue,
} from "../../test/mocks/authContext";

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock the useAuth hook
jest.mock("../../context/AuthContext", () => {
  const ActualAuthContext = jest.requireActual("../../context/AuthContext");

  return {
    ...ActualAuthContext,
    useAuth: jest.fn().mockReturnValue(mockAuthContextValue),
    // Provide a simplified AuthProvider that just renders children
    AuthProvider: ({ children }) => children,
  };
});

describe("Navigation Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset the default mock
    require("../../context/AuthContext").useAuth.mockReturnValue(
      mockAuthContextValue
    );
  });

  it("renders login and signup links when not authenticated", () => {
    // Override the mock for this specific test
    require("../../context/AuthContext").useAuth.mockReturnValue(
      mockUnauthenticatedContextValue
    );

    render(
      <BrowserRouter>
        <Navigation />
      </BrowserRouter>
    );

    expect(screen.getByText("Log In")).toBeInTheDocument();
    expect(screen.getByText("Sign Up")).toBeInTheDocument();
    expect(screen.queryByText("Log Out")).not.toBeInTheDocument();
  });

  it("renders user navigation when authenticated", () => {
    render(
      <BrowserRouter>
        <Navigation />
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
        <Navigation />
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
    require("../../context/AuthContext").useAuth.mockReturnValue({
      ...mockAuthContextValue,
      logout: mockLogout,
    });

    render(
      <BrowserRouter>
        <Navigation />
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
        <Navigation />
      </BrowserRouter>
    );

    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Profile")).toBeInTheDocument();
    expect(screen.getByText("Log Out")).toBeInTheDocument();
  });

  it("should call logout when Log Out is clicked", () => {
    const mockLogout = jest.fn();
    require("../../context/AuthContext").useAuth.mockReturnValue({
      ...mockAuthContextValue,
      logout: mockLogout,
    });

    render(
      <BrowserRouter>
        <Navigation />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByText("Log Out"));
    expect(mockLogout).toHaveBeenCalled();
  });
});
