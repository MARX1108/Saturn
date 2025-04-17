// Root Jest configuration
module.exports = {
  // Tells Jest to look for Jest configurations within these package directories
  projects: [
    '<rootDir>/packages/server',
    // If you have other packages with tests, add their paths here too:
    // e.g., '<rootDir>/packages/client',
  ],

  // Optional: Define global options here if needed, like coverage reporters
  // coverageReporters: ['json', 'lcov', 'text', 'clover'],
  // collectCoverageFrom: [ ... ], // Can define common patterns here
};
