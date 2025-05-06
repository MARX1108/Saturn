/**
 * Mock for Pact Foundation to avoid import issues in tests
 */

// Mock the Pact class
export class Pact {
  constructor(config: any) {
    console.log('Mock Pact initialized with config', config);
  }

  setup() {
    console.log('Mock Pact setup called');
    return Promise.resolve();
  }

  addInteraction(interaction: any) {
    console.log('Mock Pact addInteraction called with', interaction);
    return Promise.resolve(interaction);
  }

  verify() {
    console.log('Mock Pact verify called');
    return Promise.resolve();
  }

  finalize() {
    console.log('Mock Pact finalize called');
    return Promise.resolve();
  }

  writePact() {
    console.log('Mock Pact writePact called');
    return Promise.resolve();
  }
}

// Export the mocked Pact class to be used in tests
export default { Pact };
