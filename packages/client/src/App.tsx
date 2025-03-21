import React, { useState } from "react";
import "./index.css";
import AITest from "./components/AITest";

function App() {
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createActor = async () => {
    if (!username) {
      setError("Username is required");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        import.meta.env.VITE_API_URL + "/create-actor",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, displayName }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create actor");
      }

      setResult(data);
      setUsername("");
      setDisplayName("");
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
