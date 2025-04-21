'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.AIService = void 0;
class AIService {
  constructor(db) {
    this.contentCollection = db.collection('aiAnalysis');
    // Create indexes
    this.contentCollection.createIndex({ contentId: 1 }, { unique: true });
    this.contentCollection.createIndex({ createdAt: 1 });
  }
  /**
   * Analyze content using AI
   * @param content Text content to analyze
   * @param contentId Optional ID to reference the content
   * @returns Analysis results
   */
  async analyzeContent(content, contentId) {
    // In a real implementation, this would call an AI service API
    // For now, we'll use a simple mock implementation
    const result = {
      sentiment: this.mockSentimentAnalysis(content),
      topics: this.extractTopics(content),
      toxicity: this.calculateToxicity(content),
    };
    if (contentId) {
      // Store the analysis result
      await this.contentCollection.updateOne(
        { contentId },
        {
          $set: {
            ...result,
            contentId,
            content: content.substring(0, 200), // Store just a preview
            createdAt: new Date(),
          },
        },
        { upsert: true }
      );
    }
    return result;
  }
  /**
   * Get previous analysis for content
   * @param contentId Content identifier
   * @returns Previous analysis or null if not found
   */
  async getPreviousAnalysis(contentId) {
    const result = await this.contentCollection.findOne({ contentId });
    if (!result) return null;
    const {
      _id,
      content: _content,
      createdAt: _createdAt,
      ...analysisData
    } = result;
    return analysisData;
  }
  /**
   * Generate content recommendations based on user preferences
   * @param userPreferences User preference keywords
   * @param context Optional context information
   * @returns Generated recommendation
   */
  async generateRecommendation(userPreferences, _context) {
    // In a real implementation, this would call an AI model API
    // For demo purposes, we'll return a simple mock response
    return `Based on your interest in ${userPreferences.join(', ')}, we recommend exploring content related to ${userPreferences[0]}.`;
  }
  // Private helper methods for the mock implementation
  mockSentimentAnalysis(text) {
    const positiveWords = ['good', 'great', 'excellent', 'happy', 'positive'];
    const negativeWords = ['bad', 'poor', 'terrible', 'sad', 'negative'];
    const lowerText = text.toLowerCase();
    const positiveCount = positiveWords.filter(word =>
      lowerText.includes(word)
    ).length;
    const negativeCount = negativeWords.filter(word =>
      lowerText.includes(word)
    ).length;
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }
  extractTopics(text) {
    // Simple mock implementation to extract potential topics
    const topics = new Set();
    const words = text
      .toLowerCase()
      .split(/\W+/)
      .filter(w => w.length > 4);
    // Get unique words that might be topics (simple implementation)
    words.forEach(word => {
      if (
        !['about', 'these', 'their', 'there', 'where', 'which'].includes(word)
      ) {
        topics.add(word);
      }
    });
    return Array.from(topics).slice(0, 3); // Return up to 3 topics
  }
  calculateToxicity(text) {
    // Simple mock toxicity detection
    const toxicWords = ['hate', 'stupid', 'dumb', 'idiot', 'fool'];
    const lowerText = text.toLowerCase();
    const toxicCount = toxicWords.filter(word =>
      lowerText.includes(word)
    ).length;
    return Math.min(toxicCount / 5, 1); // Normalize between 0-1
  }
}
exports.AIService = AIService;
// Add a default export - export an instance creator function
exports.default = {
  createService: db => new AIService(db),
};
