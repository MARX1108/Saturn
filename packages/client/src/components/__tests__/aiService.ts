// Stub AI service for testing purposes
const aiService = {
  initializeModel: async () => true,
  generateResponse: async (prompt: string) => `Response to: ${prompt}`,
  analyzeContent: async (content: string) => ({
    sentiment: "positive",
    topics: ["test"],
  }),
};

export default aiService;
