// Use a minimal metro config without Sentry or polyfills
const { getDefaultConfig } = require('expo/metro-config');

// Get the default config
const config = getDefaultConfig(__dirname);

// Set the entry file to our minimal app
config.resolver = {
  ...config.resolver,
  sourceExts: ['js', 'jsx', 'ts', 'tsx', 'json'], // Default extensions
};

console.log('Using minimal Metro config without Sentry or polyfills');

module.exports = config;
