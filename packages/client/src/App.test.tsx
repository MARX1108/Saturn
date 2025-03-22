import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import App from "./App";

// Mock the child components
vi.mock("./components/AITest", () => ({
  default: () => <div data-testid="ai-test-component">Mocked AITest</div>,
}));

vi.mock("./pages/Home", () => ({
  default: () => <div data-testid="home-page">Mocked Home</div>,
}));

vi.mock("./pages/Login", () => ({
  default: () => <div data-testid="login-page">Mocked Login</div>,
}));

vi.mock("./pages/Register", () => ({
  default: () => <div data-testid="register-page">Mocked Register</div>,
}));

vi.mock("./pages/Profile", () => ({
  default: () => <div data-testid="profile-page">Mocked Profile</div>,
}));

vi.mock("./components/Navigation", () => ({
  default: () => <div data-testid="navigation">Mocked Navigation</div>,
}));

// Mock the auth context
vi.mock("./context/AuthContext", async () => {
  const actual = await vi.importActual("./context/AuthContext");
  return {
    ...actual,
    useAuth: () => ({
      user: { preferredUsername: "testuser" },
      isAuthenticated: true,
      loading: false,
      login: vi.fn(),
      logout: vi.fn(),
      register: vi.fn(),
      error: null,
      token: "fake-token",
    }),
  };
});

// Mock fetch API
vi.stubGlobal(
  "fetch",
  vi.fn(() =>
    Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve({ success: true, user: { username: "testuser" } }),
    })
  )
);

describe("App Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the app with navigation", () => {
    render(<App />);
    expect(screen.getByTestId("navigation")).toBeInTheDocument();
    expect(screen.getByTestId("home-page")).toBeInTheDocument(); // Default route
  });

  it("creates an actor when form is submitted", async () => {
    render(<App />);

    const mockCreateActor = vi.spyOn(global, "fetch");

    // Fill in form values
    const usernameInput = screen.getByLabelText(/Username:/i);
    fireEvent.change(usernameInput, { target: { value: "testuser" } });

    const displayNameInput = screen.getByLabelText(/Display Name:/i);
    fireEvent.change(displayNameInput, { target: { value: "Test User" } });

    // Submit the form
    const submitButton = screen.getByText("Create Actor");
    fireEvent.click(submitButton);

    expect(mockCreateActor).toHaveBeenCalled();

    await waitFor(() => {
      expect(screen.getByText(/success/i)).toBeInTheDocument();
    });
  });

  it("shows error when username is missing", () => {
    render(<App />);

    // Attempt to submit without username
    const submitButton = screen.getByText("Create Actor");
    fireEvent.click(submitButton);

    expect(screen.getByText("Username is required")).toBeInTheDocument();
  });
});
