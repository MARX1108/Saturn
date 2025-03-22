import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Register from "../Register";
import { AuthProvider } from "../../context/AuthContext";
import { mockUnauthenticatedContextValue } from "../../test/mocks/authContext";

// Mock the useAuth hook
jest.mock("../../context/AuthContext", async () => {
  const actual = await vi.importActual("../../context/AuthContext");
  return {
    ...actual,
    useAuth: () => ({
      ...mockUnauthenticatedContextValue,
      register: jest.fn().mockImplementation((userData) => {
        if (!userData.username || !userData.password) {
          throw new Error("Missing required fields");
        }
        return Promise.resolve();
      }),
    }),
  };
});

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("Register Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the registration form", () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Register />
        </AuthProvider>
      </BrowserRouter>
    );

    expect(screen.getByPlaceholderText("Username *")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Display Name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Password *")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Confirm Password *")
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Bio")).toBeInTheDocument();
    expect(screen.getByText("Sign Up")).toBeInTheDocument();
    expect(screen.getByText("Have an account?")).toBeInTheDocument();
    expect(screen.getByText("Log in")).toBeInTheDocument();
  });

  it("handles form submission with valid data", async () => {
    const { useAuth } = await import("../../context/AuthContext");
    const mockRegister = useAuth().register;

    render(
      <BrowserRouter>
        <AuthProvider>
          <Register />
        </AuthProvider>
      </BrowserRouter>
    );

    // Fill in form
    fireEvent.change(screen.getByPlaceholderText("Username *"), {
      target: { value: "testuser" },
    });
    fireEvent.change(screen.getByPlaceholderText("Display Name"), {
      target: { value: "Test User" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password *"), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByPlaceholderText("Confirm Password *"), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByPlaceholderText("Bio"), {
      target: { value: "This is a test bio" },
    });

    // Submit form
    fireEvent.click(screen.getByText("Sign Up"));

    expect(mockRegister).toHaveBeenCalledWith({
      username: "testuser",
      displayName: "Test User",
      password: "password123",
      bio: "This is a test bio",
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/");
    });
  });

  it("shows error when passwords don't match", async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Register />
        </AuthProvider>
      </BrowserRouter>
    );

    // Fill in form with mismatched passwords
    fireEvent.change(screen.getByPlaceholderText("Username *"), {
      target: { value: "testuser" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password *"), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByPlaceholderText("Confirm Password *"), {
      target: { value: "password456" },
    });

    // Submit form
    fireEvent.click(screen.getByText("Sign Up"));

    await waitFor(() => {
      expect(screen.getByText("Passwords do not match")).toBeInTheDocument();
    });
  });

  it("shows error when password is too short", async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Register />
        </AuthProvider>
      </BrowserRouter>
    );

    // Fill in form with short password
    fireEvent.change(screen.getByPlaceholderText("Username *"), {
      target: { value: "testuser" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password *"), {
      target: { value: "12345" },
    });
    fireEvent.change(screen.getByPlaceholderText("Confirm Password *"), {
      target: { value: "12345" },
    });

    // Submit form
    fireEvent.click(screen.getByText("Sign Up"));

    await waitFor(() => {
      expect(
        screen.getByText("Password must be at least 6 characters long")
      ).toBeInTheDocument();
    });
  });
});
