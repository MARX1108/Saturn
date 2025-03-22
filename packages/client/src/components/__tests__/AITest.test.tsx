import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import AITest from "../AITest";

// Mock the AI client
jest.mock("../../services/aiClient", () => ({
  default: {
    loadModel: jest.fn().mockResolvedValue(true),
    generateResponse: jest.fn().mockResolvedValue("Generated response"),
    analyzeContent: vi
      .fn()
      .mockResolvedValue({ sentiment: "positive", topics: ["test"] }),
  },
}));

describe("AITest Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders correctly with initial state", () => {
    render(<AITest />);

    expect(screen.getByText("AI Test Environment")).toBeInTheDocument();
    expect(screen.getByText(/Model Status:/)).toBeInTheDocument();
    expect(screen.getByText("Load Model")).toBeInTheDocument();
    expect(screen.getByLabelText("Test Prompt:")).toBeInTheDocument();
  });

  it("loads model when button is clicked", async () => {
    const { getByText } = render(<AITest />);

    const loadButton = getByText("Load Model");
    fireEvent.click(loadButton);

    // Status should change to loading
    expect(getByText(/loading/i)).toBeInTheDocument();

    // After loading finishes, status should change to loaded
    await vi.waitFor(() => {
      expect(getByText("Model Status:")).toBeInTheDocument();
      expect(getByText(/loaded/i)).toBeInTheDocument();
    });
  });

  it("generates a response when submitting a prompt", async () => {
    const { getByLabelText, getByText } = render(<AITest />);

    // Type in the prompt
    const promptInput = getByLabelText("Test Prompt:");
    fireEvent.change(promptInput, { target: { value: "Test prompt" } });

    // Click submit
    const submitButton = getByText("Generate");
    fireEvent.click(submitButton);

    // Expect to see the generated response after API call completes
    await vi.waitFor(() => {
      expect(getByText("Generated response")).toBeInTheDocument();
    });
  });

  it("analyzes content when analyze button is clicked", async () => {
    const { getByLabelText, getByText } = render(<AITest />);

    // Type in the content
    const contentInput = getByLabelText("Content to Analyze:");
    fireEvent.change(contentInput, { target: { value: "Test content" } });

    // Click analyze
    const analyzeButton = getByText("Analyze");
    fireEvent.click(analyzeButton);

    // Expect to see the analysis after API call completes
    await vi.waitFor(() => {
      expect(getByText(/sentiment: positive/i)).toBeInTheDocument();
    });
  });
});
