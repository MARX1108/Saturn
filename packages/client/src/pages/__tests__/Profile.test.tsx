import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Profile from "../../pages/Profile";
import { AuthProvider } from "../../context/AuthContext";
import { mockAuthContextValue } from "../../test/mocks/authContext";

// Mock fetch API for profile data
global.fetch = jest.fn((url) => {
  if (url.includes("/actors/testuser")) {
    return Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve({
          id: "user123",
          username: "testuser",
          displayName: "Test User",
          bio: "This is a test bio",
          avatarUrl: "https://example.com/avatar.jpg",
          icon: {
            url: "https://example.com/avatar.jpg",
            mediaType: "image/jpeg",
          },
          followersCount: 10,
          followingCount: 20,
        }),
    });
  }
  return Promise.reject(new Error("Not found"));
}) as jest.Mock;

// Mock useParams
jest.mock("react-router-dom", async () => {
  const actual = await jest.requireActual("react-router-dom");
  return {
    ...actual,
    useParams: () => ({ username: "testuser" }),
    useNavigate: () => jest.fn(),
  };
});

// Fix MockFileReader class
class MockFileReader {
  onloadend: () => void = () => {};
  readAsDataURL: jest.Mock = jest.fn();
  result: string = ""; // Initialize the property

  constructor() {
    this.readAsDataURL = jest.fn(() => {
      setTimeout(() => {
        this.result = "data:image/png;base64,mockbase64data";
        this.onloadend();
      }, 0);
    });
  }
}

// Replace global FileReader with mock
global.FileReader = MockFileReader as any;

describe("Profile Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("shows loading state initially", () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Profile />
        </AuthProvider>
      </BrowserRouter>
    );

    expect(screen.getByText("Loading profile...")).toBeInTheDocument();
  });

  it("renders profile data when loaded", async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Profile />
        </AuthProvider>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.queryByText("Loading profile...")).not.toBeInTheDocument();
    });

    expect(screen.getByText("testuser")).toBeInTheDocument();
    expect(screen.getByText("Test User")).toBeInTheDocument();
    expect(screen.getByText("This is a test bio")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument(); // Followers count
    expect(screen.getByText("20")).toBeInTheDocument(); // Following count
  });

  it("shows edit button for current user's profile", async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Profile isCurrentUser={true} />
        </AuthProvider>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.queryByText("Loading profile...")).not.toBeInTheDocument();
    });

    expect(screen.getByText("Edit Profile")).toBeInTheDocument();
  });

  it("switches to edit mode when edit button is clicked", async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Profile isCurrentUser={true} />
        </AuthProvider>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.queryByText("Loading profile...")).not.toBeInTheDocument();
    });

    // Click edit button
    fireEvent.click(screen.getByText("Edit Profile"));

    // Check edit form is visible
    expect(
      screen.getByText("Edit Profile", { selector: "h1" })
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Display Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Bio")).toBeInTheDocument();
    expect(screen.getByText("Save Changes")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
  });

  it("handles profile update submission", async () => {
    // Mock the fetch API for PUT request
    global.fetch = jest.fn().mockImplementation((url, options) => {
      if (url.includes("/api/actors/") && options.method === "PUT") {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              id: "https://example.com/users/testuser",
              preferredUsername: "testuser",
              name: "Updated User",
              summary: "Updated bio",
              icon: {
                url: "https://example.com/new-avatar.jpg",
                mediaType: "image/jpeg",
              },
            }),
        });
      }
      if (url.includes("/api/actors/")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              id: "https://example.com/users/testuser",
              preferredUsername: "testuser",
              name: "Test User",
              summary: "This is a test bio",
              icon: {
                url: "https://example.com/avatar.jpg",
                mediaType: "image/jpeg",
              },
            }),
        });
      }
      return Promise.reject(new Error("Not found"));
    });

    render(
      <BrowserRouter>
        <AuthProvider>
          <Profile isCurrentUser={true} />
        </AuthProvider>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.queryByText("Loading profile...")).not.toBeInTheDocument();
    });

    // Click edit button
    fireEvent.click(screen.getByText("Edit Profile"));

    // Edit form fields
    fireEvent.change(screen.getByLabelText("Display Name"), {
      target: { value: "Updated User" },
    });

    fireEvent.change(screen.getByLabelText("Bio"), {
      target: { value: "Updated bio" },
    });

    // Create a mock file
    const file = new File(["mock content"], "avatar.png", {
      type: "image/png",
    });
    const fileInput =
      screen.getByLabelText("Profile Picture").nextElementSibling;

    // Mock file input change
    fireEvent.change(fileInput, { target: { files: [file] } });

    // Wait for FileReader to process (via our mock)
    await waitFor(() => {});

    // Submit form
    fireEvent.click(screen.getByText("Save Changes"));

    // Check PUT request was made
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/actors/testuser"),
      expect.objectContaining({
        method: "PUT",
        body: expect.any(FormData),
      })
    );

    // After submission, should return to view mode
    await waitFor(() => {
      expect(screen.queryByLabelText("Display Name")).not.toBeInTheDocument();
      expect(screen.getByText("Edit Profile")).toBeInTheDocument();
    });
  });
});
