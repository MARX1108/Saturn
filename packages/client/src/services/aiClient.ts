import { AIAnalysisResult } from "../../../server/src/services/aiService";

class AIClient {
  private apiUrl: string;

  constructor(apiUrl: string = "/api") {
    this.apiUrl = apiUrl;
  }

  async analyzeContent(content: string): Promise<AIAnalysisResult> {
    const response = await fetch(`${this.apiUrl}/ai/analyze`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to analyze content");
    }

    return response.json();
  }

  async generateRecommendation(preferences: string[]): Promise<string> {
    const response = await fetch(`${this.apiUrl}/ai/recommend`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ preferences }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to generate recommendation");
    }

    const data = await response.json();
    return data.recommendation;
  }
}

const aiClient = new AIClient(import.meta.env.VITE_API_URL);
export default aiClient;
