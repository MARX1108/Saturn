import { GPT4All } from "gpt4all";

class AIService {
  private gpt: GPT4All | null = null;
  private modelLoaded: boolean = false;
  private modelLoading: boolean = false;

  async initializeModel(
    modelName: string = "gpt4all-j-v1.3-groovy"
  ): Promise<boolean> {
    try {
      if (this.modelLoaded) return true;
      if (this.modelLoading) return false;

      this.modelLoading = true;

      // Initialize the model
      this.gpt = new GPT4All(modelName);

      // Open and load the model
      await this.gpt.open();

      this.modelLoaded = true;
      this.modelLoading = false;
      return true;
    } catch (error) {
      console.error("Failed to initialize GPT4All model:", error);
      this.modelLoading = false;
      return false;
    }
  }

  async generateResponse(prompt: string): Promise<string> {
    if (!this.modelLoaded) {
      throw new Error("Model not loaded. Please initialize the model first.");
    }

    try {
      const response = await this.gpt!.prompt(prompt);
      return response;
    } catch (error) {
      console.error("Error generating response:", error);
      throw new Error("Failed to generate AI response");
    }
  }

  isModelLoaded(): boolean {
    return this.modelLoaded;
  }

  isModelLoading(): boolean {
    return this.modelLoading;
  }
}

// Create a singleton instance
const aiService = new AIService();
export default aiService;
