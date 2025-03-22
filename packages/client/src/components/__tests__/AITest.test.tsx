import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AITest from "../AITest";
import aiClient from "../../services/aiClient";

// Mock the AI client
jest.mock("../../services/aiClient");

describe("AITest Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders initial state correctly", () => {
    render(<AITest />);
    expect(screen.getByText(/AI Test/i)).toBeInTheDocument();
  });

  test("submits analysis request on button click", async () => {
    // Setup mock
    (aiClient.analyzeContent as jest.Mock).mockResolvedValue({
      sentiment: "positive",
      topics: ["test"],
      toxicity: 0,
    });

    render(<AITest />);

    // Enter text and click button
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "Test content" },
    });
    fireEvent.click(screen.getByText("Analyze"));

    // Wait for results
    await waitFor(() => {
      expect(aiClient.analyzeContent).toHaveBeenCalledWith("Test content");
      expect(screen.getByText(/sentiment: positive/i)).toBeInTheDocument();
    });
  });
});
