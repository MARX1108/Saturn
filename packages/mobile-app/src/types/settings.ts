/**
 * AppSettings Interface
 * Defines user-configurable settings for the application
 */
export interface AppSettings {
  // Theme preferences
  darkMode: boolean;

  // UI preferences
  fontSizeMultiplier: number; // 0.8 = smaller, 1 = default, 1.2 = larger, etc.

  // Notification preferences
  notificationPreferences: {
    newPosts: boolean;
    mentions: boolean;
    comments: boolean;
    likes: boolean;
    newFollowers: boolean;
    announcements: boolean;
  };

  // Privacy settings
  privacySettings: {
    publicProfile: boolean;
    showActivity: boolean;
  };

  // Content preferences
  contentSettings: {
    autoplayVideos: boolean;
    showSensitiveContent: boolean;
    dataUsage: 'low' | 'medium' | 'high';
  };

  // Accessibility settings
  accessibility: {
    reduceMotion: boolean;
    increaseContrast: boolean;
  };
}

/**
 * Default app settings
 */
export const defaultSettings: AppSettings = {
  darkMode: false,
  fontSizeMultiplier: 1,
  notificationPreferences: {
    newPosts: true,
    mentions: true,
    comments: true,
    likes: true,
    newFollowers: true,
    announcements: true,
  },
  privacySettings: {
    publicProfile: true,
    showActivity: true,
  },
  contentSettings: {
    autoplayVideos: true,
    showSensitiveContent: false,
    dataUsage: 'medium',
  },
  accessibility: {
    reduceMotion: false,
    increaseContrast: false,
  },
};
