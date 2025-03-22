/// <reference types="vite/client" />
import React, { useState } from "react";
import "./index.css";
import AITest from "./components/AITest";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";

// Import components
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Navigation from "./components/Navigation";

// Protected route component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

function App() {
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Enhanced form fields for actor creation
  const [bio, setBio] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const styles = {
    formGroup: {
      marginBottom: "1rem",
    },
    label: {
      display: "block",
      marginBottom: "0.5rem",
    },
    inputField: {
      padding: "0.5rem",
      border: "1px solid #ccc",
      borderRadius: "4px",
    },
  };

  const createActor = async () => {
    if (!username) {
      setError("Username is required");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create form data to handle file upload
      const formData = new FormData();
      formData.append("username", username);
      if (displayName) formData.append("displayName", displayName);
      if (bio) formData.append("bio", bio);
      if (avatarFile) formData.append("avatarFile", avatarFile);

      const response = await fetch(
        import.meta.env.VITE_API_URL + "/create-actor",
        {
          method: "POST",
          body: formData, // Use FormData instead of JSON for file upload
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create actor");
      }

      setResult(data);
      setUsername("");
      setDisplayName("");
      setBio("");
      setAvatarFile(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <Navigation />
          <main className="main-content">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Home />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile/:username"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-profile"
                element={
                  <ProtectedRoute>
                    <Profile isCurrentUser={true} />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
