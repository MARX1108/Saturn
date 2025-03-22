import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Home from "../Home";
import { mockAuthContextValue } from "../../test/mocks/authContext";

// Mock the useAuth hook
vi.mock("../../context/AuthContext", async () => {
  const actual = await vi.importActual("../../context/AuthContext");
  return {
    ...actual,
    useAuth: () => mockAuthContextValue,
  };
});

// Mock setTimeout to make tests faster
vi.useFakeTimers();

describe("Home Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows loading state initially", () => {
    render(<Home />);
    expect(screen.getByText("Loading posts...")).toBeInTheDocument();
  });

  it("renders posts after loading", async () => {
    render(<Home />);

    // Advance all timers to complete loading
    vi.runAllTimers();

    await waitFor(() => {
      expect(screen.queryByText("Loading posts...")).not.toBeInTheDocument();
    });

    // Check that post creation form is shown
    expect(
      screen.getByPlaceholderText("What's happening?")
    ).toBeInTheDocument();

    // Check that posts are rendered
    expect(screen.getAllByText(/This is a sample post number/)).toHaveLength(5);
  });

  it("allows creating a new post", async () => {
    render(<Home />);

    // Advance all timers to complete loading
    vi.runAllTimers();

    await waitFor(() => {
      expect(screen.queryByText("Loading posts...")).not.toBeInTheDocument();
    });

    // Fill in post content
    const postInput = screen.getByPlaceholderText("What's happening?");
    fireEvent.change(postInput, {
      target: { value: "This is a new test post" },
    });

    // Submit the post
    const postButton = screen.getByText("Post");
    fireEvent.click(postButton);

    // Advance timers to complete post creation
    vi.runAllTimers();

    // Check that the new post appears
    await waitFor(() => {
      expect(screen.getByText("This is a new test post")).toBeInTheDocument();
    });

    // Post input should be cleared
    expect(postInput).toHaveValue("");
  });

  it("renders suggested users in sidebar", async () => {
    render(<Home />);

    // Advance all timers to complete loading
    vi.runAllTimers();

    await waitFor(() => {
      expect(screen.queryByText("Loading posts...")).not.toBeInTheDocument();
    });

    // Check sidebar header
    expect(screen.getByText("Who to follow")).toBeInTheDocument();

    // Check suggested users are shown
    expect(screen.getAllByText(/Suggested User/)).toHaveLength(3);
    expect(screen.getAllByText(/Follow/)).toHaveLength(3);
  });
});
