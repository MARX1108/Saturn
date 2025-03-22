import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import "../styles/federation.css";

const FederationTest: React.FC = () => {
  const { user, token } = useAuth();
  const [remoteUsername, setRemoteUsername] = useState("");
  const [remoteDomain, setRemoteDomain] = useState("");
  const [actorUrl, setActorUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [testType, setTestType] = useState<"fetch" | "follow">("fetch");

  const handleFederationTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      if (testType === "fetch") {
        // Use either the actor URL or construct from username/domain
        const targetUrl =
          actorUrl ||
          (remoteUsername && remoteDomain
            ? `https://${remoteDomain}/users/${remoteUsername}`
            : "");

        if (!targetUrl) {
          throw new Error(
            "Please provide either an actor URL or username and domain"
          );
        }

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/federation/fetch-actor`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ actorUrl: targetUrl }),
          }
        );

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to fetch remote actor");
        }

        const data = await response.json();
        setResult(data);
      } else if (testType === "follow") {
        if (!user) {
          throw new Error("You must be logged in to follow a remote user");
        }

        const targetUrl =
          actorUrl ||
          (remoteUsername && remoteDomain
            ? `https://${remoteDomain}/users/${remoteUsername}`
            : "");

        if (!targetUrl) {
          throw new Error(
            "Please provide either an actor URL or username and domain"
          );
        }

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/federation/follow`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ targetActorUrl: targetUrl }),
          }
        );

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to send follow request");
        }

        const data = await response.json();
        setResult(data);
      }
    } catch (err) {
      console.error("Federation test error:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="federation-container">
      <h1>Federation Testing</h1>
      <p className="federation-info">
        Use this page to test federation with other ActivityPub servers. You can
        fetch a remote actor's profile or attempt to follow them.
      </p>

      <div className="test-type-selector">
        <button
          className={`test-type-btn ${testType === "fetch" ? "active" : ""}`}
          onClick={() => setTestType("fetch")}
        >
          Fetch Remote Profile
        </button>
        <button
          className={`test-type-btn ${testType === "follow" ? "active" : ""}`}
          onClick={() => setTestType("follow")}
        >
          Follow Remote User
        </button>
      </div>

      <form onSubmit={handleFederationTest} className="federation-form">
        <div className="form-section">
          <h2>Option 1: Enter Actor URL</h2>
          <div className="form-group">
            <label>Actor URL</label>
            <input
              type="url"
              value={actorUrl}
              onChange={(e) => setActorUrl(e.target.value)}
              placeholder="https://mastodon.social/users/someuser"
            />
          </div>
        </div>

        <div className="form-divider">OR</div>

        <div className="form-section">
          <h2>Option 2: Enter Username and Domain</h2>
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              value={remoteUsername}
              onChange={(e) => setRemoteUsername(e.target.value)}
              placeholder="username"
            />
          </div>

          <div className="form-group">
            <label>Domain</label>
            <input
              type="text"
              value={remoteDomain}
              onChange={(e) => setRemoteDomain(e.target.value)}
              placeholder="mastodon.social"
            />
          </div>
        </div>

        <button
          type="submit"
          className="federation-submit-btn"
          disabled={loading}
        >
          {loading
            ? "Testing..."
            : testType === "fetch"
            ? "Fetch Profile"
            : "Send Follow Request"}
        </button>
      </form>

      {error && (
        <div className="federation-error">
          <h3>Error</h3>
          <p>{error}</p>
        </div>
      )}

      {result && (
        <div className="federation-result">
          <h3>Result</h3>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default FederationTest;
