/// <reference types="vite/client" />
import React, { useState } from "react";
import "./index.css";
import AITest from "./components/AITest";

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
    <div className="app">
      <div className="stars-container">
        {[...Array(200)].map((_, i) => (
          <div
            key={i}
            className="star"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`,
              width: `${Math.max(1, Math.random() * 2)}px`,
              height: `${Math.max(1, Math.random() * 2)}px`,
            }}
          />
        ))}
      </div>

      <header>
        <div className="logo-container">
          <span className="saturn-emoji">🪐</span>
          <h1 className="gradient-text">FYP Saturn</h1>
        </div>
        <p className="subtitle">A federated social platform</p>
      </header>

      <main>
        <section className="glass-card">
          <h2 className="section-title">Create Actor</h2>
          <div className="form-group">
            <label htmlFor="username">Username:</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              className="input-field"
            />
          </div>

          <div className="form-group">
            <label htmlFor="displayName">Display Name (optional):</label>
            <input
              type="text"
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              disabled={loading}
              className="input-field"
            />
          </div>

          <div style={styles.formGroup as React.CSSProperties}>
            <label style={styles.label as React.CSSProperties} htmlFor="bio">
              Bio (optional):
            </label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              disabled={loading}
              style={
                {
                  ...styles.inputField,
                  minHeight: "100px",
                } as React.CSSProperties
              }
              className="input-focus"
            />
          </div>

          <div style={styles.formGroup as React.CSSProperties}>
            <label style={styles.label as React.CSSProperties} htmlFor="avatar">
              Profile Picture (optional):
            </label>
            <input
              type="file"
              id="avatar"
              accept="image/*"
              onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
              disabled={loading}
              style={styles.inputField as React.CSSProperties}
              className="input-focus"
            />
          </div>

          <button
            onClick={createActor}
            disabled={loading}
            className="gradient-button"
          >
            {loading ? "Creating..." : "Create Actor"}
          </button>

          {error && <div className="error">{error}</div>}

          {result && (
            <div className="result">
              <h3>Actor Created:</h3>
              <pre>{JSON.stringify(result, null, 2)}</pre>
            </div>
          )}
        </section>

        {/* Add the AI Test Component */}
        <AITest />
      </main>
    </div>
  );
}

export default App;
