import { Collection, Db } from 'mongodb';

export interface AIAnalysisResult {
  sentiment: string;
  topics: string[];
  toxicity: number;
  recommendation?: string;
}

export class AIService {
  private contentCollection: Collection;

  constructor(db: Db) {
    this.contentCollection = db.collection('aiAnalysis');

    // Create indexes
    void this.contentCollection.createIndex({ contentId: 1 }, { unique: true });
    void this.contentCollection.createIndex({ createdAt: 1 });
  }

  /**
   * Analyze content using AI
   * @param content Text content to analyze
   * @param contentId Optional ID to reference the content
   * @returns Analysis results
   */
  async analyzeContent(
    content: string,
    contentId?: string
  ): Promise<AIAnalysisResult> {
    // In a real implementation, this would call an AI service API
    // For now, we'll use a simple mock implementation

    const result: AIAnalysisResult = {
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
  async getPreviousAnalysis(
    contentId: string
  ): Promise<AIAnalysisResult | null> {
    const result = await this.contentCollection.findOne({ contentId });
    if (!result) return null;

    const {
      _id,
      content: _content,
      createdAt: _createdAt,
      ...analysisData
    } = result;
    return analysisData as AIAnalysisResult;
  }

  /**
   * Generate content recommendations based on user preferences
   * @param userPreferences User preference keywords
   * @param context Optional context information
   * @returns Generated recommendation
   */
  generateRecommendation(
    userPreferences: string[],
    _context?: string
  ): Promise<string> {
    // In a real implementation, this would call an AI model API
    // For demo purposes, we'll return a simple mock response
    return Promise.resolve(
      `Based on your interest in ${userPreferences.join(
        ', '
      )}, we recommend exploring content related to ${userPreferences[0]}.`
    );
  }

  // Private helper methods for the mock implementation
  private mockSentimentAnalysis(text: string): string {
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

  private extractTopics(text: string): string[] {
    // Simple mock implementation to extract potential topics
    const topics = new Set<string>();
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

  private calculateToxicity(text: string): number {
    // Simple mock toxicity detection
    const toxicWords = ['hate', 'stupid', 'dumb', 'idiot', 'fool'];
    const lowerText = text.toLowerCase();

    const toxicCount = toxicWords.filter(word =>
      lowerText.includes(word)
    ).length;
    return Math.min(toxicCount / 5, 1); // Normalize between 0-1
  }
}

// Add a default export - export an instance creator function
export default {
  createService: (db: Db): AIService => new AIService(db),
};
