import { PluginManifest, PluginLoadResult } from '../types/plugin';

// Example plugin manifest - in a real app, this would be loaded from a file
const examplePluginManifest: PluginManifest = {
  id: 'example-plugin',
  name: 'Example Plugin',
  version: '1.0.0',
  description: 'An example plugin demonstrating the plugin system',
  author: 'Example Author',
  contributions: {
    settingsMenuItems: [
      {
        id: 'example-settings-item',
        label: 'Example Settings',
        icon: 'settings-outline',
        targetRoute: 'EXAMPLE_SETTINGS',
      },
    ],
  },
};

/**
 * Plugin Service
 * Handles loading and managing plugins
 */
const pluginService = {
  /**
   * Loads all available plugin manifests
   * For MVP, this loads from static sources
   * In the future, this could load from:
   * - Local storage
   * - Remote server
   * - Plugin registry
   */
  loadPluginManifests: async (): Promise<PluginManifest[]> => {
    try {
      // For MVP, return the static example plugin
      // In the future, this would load from actual files/sources
      return [examplePluginManifest];
    } catch (error) {
      console.error('Error loading plugin manifests:', error);
      throw new Error('Failed to load plugin manifests');
    }
  },

  /**
   * Validates a plugin manifest
   * @param manifest The manifest to validate
   * @returns A PluginLoadResult indicating success or failure
   */
  validateManifest: (manifest: PluginManifest): PluginLoadResult => {
    try {
      // Basic validation
      if (!manifest.id || !manifest.name || !manifest.version) {
        return {
          manifest,
          error: 'Missing required fields in plugin manifest',
        };
      }

      // Validate version format (semantic versioning)
      const versionRegex = /^\d+\.\d+\.\d+$/;
      if (!versionRegex.test(manifest.version)) {
        return {
          manifest,
          error: 'Invalid version format in plugin manifest',
        };
      }

      // Validate contributions if present
      if (manifest.contributions?.settingsMenuItems) {
        for (const item of manifest.contributions.settingsMenuItems) {
          if (!item.id || !item.label) {
            return {
              manifest,
              error: 'Invalid settings menu item in plugin manifest',
            };
          }
        }
      }

      return { manifest };
    } catch (error) {
      return {
        manifest,
        error: 'Error validating plugin manifest',
      };
    }
  },
};

export default pluginService;
