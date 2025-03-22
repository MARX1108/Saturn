import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { vi, describe, test, expect, beforeEach } from "vitest";
import App from "./App";
import AITest from "./components/AITest";

// Mock the AITest component
vi.mock("./components/AITest", () => {
  return vi.fn(() => (
    <div data-testid="ai-test-component">AI Test Component</div>
  ));
});

// Mock fetch
global.fetch = vi.fn();

describe("App Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as any).mockClear();
    // Mock environment variable
    vi.stubEnv("VITE_API_URL", "http://localhost:3000");
  });

  test("renders App component with AITest", () => {
    render(<App />);

    // Check main elements are rendered
    expect(screen.getByText("FYP Saturn")).toBeInTheDocument();
    expect(screen.getByText("Create Actor")).toBeInTheDocument();

    // Check AITest component is rendered
    expect(screen.getByTestId("ai-test-component")).toBeInTheDocument();
    expect(AITest).toHaveBeenCalled();
  });

  test("creates an actor successfully", async () => {
    const mockResponse = {
      id: "123",
      username: "testuser",
      displayName: "Test User",
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    render(<App />);

    // Fill form
    fireEvent.change(screen.getByLabelText(/Username:/i), {
      target: { value: "testuser" },
    });
    fireEvent.change(screen.getByLabelText(/Display Name/i), {
      target: { value: "Test User" },
    });

    // Submit form
    fireEvent.click(screen.getByText("Create Actor"));

    // Check that AITest remains in the document during API call
    expect(screen.getByTestId("ai-test-component")).toBeInTheDocument();

    // Verify result
    await waitFor(() => {
      expect(screen.getByText("Actor Created:")).toBeInTheDocument();
    });
  });

  test("displays error when username is missing", async () => {
    render(<App />);
    fireEvent.click(screen.getByText("Create Actor"));

    expect(screen.getByText("Username is required")).toBeInTheDocument();
    expect(screen.getByTestId("ai-test-component")).toBeInTheDocument();
  });
});
