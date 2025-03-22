import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Navigation from "./Navigation";
import { AuthProvider } from "../context/AuthContext";

// Mock the useAuth hook
jest.mock("../context/AuthContext", async () => {
  const actual = await vi.importActual("../context/AuthContext");
  return {
    ...actual,
    useAuth: () => ({
      user: null,
      isAuthenticated: false,
      loading: false,
      error: null,
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
    }),
  };
});

describe("Navigation Component", () => {
  it("renders login and signup links when not authenticated", () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Navigation />
        </AuthProvider>
      </BrowserRouter>
    );

    expect(screen.getByText("Log In")).toBeInTheDocument();
    expect(screen.getByText("Sign Up")).toBeInTheDocument();
  });
});
