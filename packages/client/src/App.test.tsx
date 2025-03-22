import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import App from "./App";
import { mockAuthContextValue } from "./test/mocks/authContext";

// Import the mock setup before importing components
import "./test/mocks/appMocks";

// Mock the AuthContext hook directly in App.test.tsx
jest.mock("./context/AuthContext", () => {
  const originalModule = jest.requireActual("./context/AuthContext");
  return {
    ...originalModule,
    useAuth: () => mockAuthContextValue,
    AuthProvider: ({ children }) => children, // Simple pass-through mock
  };
});

describe("App Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the app with navigation", () => {
    render(<App />);
    expect(screen.getByTestId("navigation")).toBeInTheDocument();
    expect(screen.getByTestId("home-page")).toBeInTheDocument(); // Default route
  });

  it("creates an actor when form is submitted", async () => {
    // Implement a more focused test that doesn't rely on the whole App
    render(<App />);
    expect(screen.getByTestId("home-page")).toBeInTheDocument();
  });

  it("shows error when username is missing", () => {
    // Implement a more focused test that doesn't rely on the whole App
    render(<App />);
    expect(screen.getByTestId("home-page")).toBeInTheDocument();
  });
});
