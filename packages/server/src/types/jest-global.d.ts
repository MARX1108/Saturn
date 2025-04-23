// This file provides better typing support for Jest globals

import '@jest/globals';

declare global {
  // Add any additional Jest types you might need
  namespace jest {
    // Extend Jest's Mock type if needed
  }
}

// Export empty object to make this a module
export {};
