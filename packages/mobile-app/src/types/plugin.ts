/**
 * Plugin System Types
 * Defines the basic structure for plugin manifests and contributions
 */

/**
 * Represents a single settings menu item contribution from a plugin
 */
export interface SettingsMenuItemContribution {
  id: string; // Unique identifier for the menu item
  label: string; // Display text for the menu item
  icon?: string; // Optional icon name (e.g., from Ionicons)
  targetRoute?: string; // Optional route key from ROUTES to navigate to
}

/**
 * Represents the contributions a plugin can make to the app
 */
export interface PluginContributions {
  settingsMenuItems?: SettingsMenuItemContribution[];
  // Future extension points:
  // customScreens?: CustomScreenContribution[];
  // themeOverrides?: ThemeOverrideContribution[];
  // customActions?: CustomActionContribution[];
}

/**
 * Represents the manifest file for a plugin
 */
export interface PluginManifest {
  id: string; // Unique identifier for the plugin
  name: string; // Display name of the plugin
  version: string; // Semantic version (e.g., "1.0.0")
  description?: string; // Optional description of the plugin
  author?: string; // Optional author information
  contributions?: PluginContributions; // Plugin's contributions to the app
}

/**
 * Represents the result of loading a plugin
 */
export interface PluginLoadResult {
  manifest: PluginManifest;
  error?: string; // Error message if loading failed
}

/**
 * Represents the state of the plugin system
 */
export interface PluginSystemState {
  plugins: PluginManifest[];
  isLoading: boolean;
  error?: string;
}
