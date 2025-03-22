import React, { useState } from "react";
import aiService from "../../../server/src/services/aiService";

const AITest: React.FC = () => {
  const [prompt, setPrompt] = useState<string>("");
  const [response, setResponse] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [modelStatus, setModelStatus] = useState<
    "unloaded" | "loading" | "loaded"
  >("unloaded");
  const [error, setError] = useState<string | null>(null);

  const loadModel = async () => {
    try {
      setModelStatus("loading");
      setError(null);
      const success = await aiService.initializeModel();
      setModelStatus(success ? "loaded" : "unloaded");
      if (!success) {
        setError("Failed to load the model");
      }
    } catch (err) {
      setError(
        "Error loading model: " +
          (err instanceof Error ? err.message : String(err))
      );
      setModelStatus("unloaded");
    }
  };

  const handleSubmit = async () => {
    if (!prompt.trim()) return;

    try {
      setLoading(true);
      setError(null);
      const result = await aiService.generateResponse(prompt);
      setResponse(result);
    } catch (err) {
      setError(
        "Error generating response: " +
          (err instanceof Error ? err.message : String(err))
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-test glass-card">
      <h2 className="section-title">AI Test Environment</h2>

      <div className="model-status">
        <p>
          Model Status: <span>{modelStatus}</span>
        </p>
        <button
          onClick={loadModel}
          disabled={modelStatus === "loading" || modelStatus === "loaded"}
          className="gradient-button"
        >
          {modelStatus === "loading" ? "Loading..." : "Load Model"}
        </button>
      </div>

      <div className="form-group">
        <label htmlFor="prompt">Test Prompt:</label>
        <textarea
          id="prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={loading || modelStatus !== "loaded"}
          className="input-field"
          rows={3}
          placeholder="Enter a prompt to test the AI..."
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading || !prompt.trim() || modelStatus !== "loaded"}
        className="gradient-button"
      >
        {loading ? "Generating..." : "Generate Response"}
      </button>

      {error && <div className="error">{error}</div>}

      {response && (
        <div className="result">
          <h3>AI Response:</h3>
          <pre>{response}</pre>
        </div>
      )}
    </div>
  );
};

export default AITest;
