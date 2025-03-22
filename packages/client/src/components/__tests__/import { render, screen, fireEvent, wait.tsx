import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Login from "../Login";
import { AuthProvider } from "../../context/AuthContext";
import { mockUnauthenticatedContextValue } from "../../test/mocks/authContext";

// Mock the useAuth hook
jest.mock("../../context/AuthContext", () => {
  const mockLogin = jest.fn().mockImplementation((username, password) => {
    if (!username || !password) {
      throw new Error("Missing credentials");
    }
    return Promise.resolve();
  });

  return {
    ...jest.requireActual("../../context/AuthContext"),
    useAuth: () => ({
      ...mockUnauthenticatedContextValue,
      login: mockLogin,
    }),
  };
});

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => {
  return {
    ...jest.requireActual("react-router-dom"),
    useNavigate: () => mockNavigate,
  };
});

describe("Login Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the login form", () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </BrowserRouter>
    );

    expect(screen.getByPlaceholderText("Username")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
    expect(screen.getByText("Log In")).toBeInTheDocument();
  });

  it("handles form submission with valid credentials", async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </BrowserRouter>
    );

    // Fill in form
    fireEvent.change(screen.getByPlaceholderText("Username"), {
      target: { value: "testuser" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "password123" },
    });

    // Submit form
    fireEvent.click(screen.getByText("Log In"));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/");
    });
  });
});
