// src/test/pact/pactSetup.ts
import { Pact, LogLevel } from '@pact-foundation/pact';
import path from 'path';

// Create a wrapper for the Pact instance with public methods
class PactWrapper {
  private pact: Pact;

  constructor() {
    this.pact = new Pact({
      // Consumer name (Frontend App)
      consumer: 'SaturnIOSApp',
      // Provider name (Backend API)
      provider: 'SaturnAPI',
      // Port for the mock server
      port: 1234, // Ensure this port is free
      // Directory to output pact files
      dir: path.resolve(process.cwd(), 'pacts'), // Adjust path as needed
      // Log level for Pact debugging
      logLevel: (process.env.PACT_LOG_LEVEL || 'warn') as LogLevel, // 'info' or 'debug' for more logs
      // Default specification version
      spec: 2, // Pact specification version (v2 is common)
    });
  }

  // Public methods to expose the functionality we need
  async setup(): Promise<void> {
    await this.pact.setup();
    return Promise.resolve();
  }

  async addInteraction(interaction: any): Promise<void> {
    await this.pact.addInteraction(interaction);
    return Promise.resolve();
  }

  async verify(): Promise<void> {
    await this.pact.verify();
    return Promise.resolve();
  }

  async finalize(): Promise<void> {
    await this.pact.finalize();
    return Promise.resolve();
  }

  // Expose the mockService for setting the base URL
  get mockService() {
    return {
      baseUrl: `http://localhost:1234`, // Match the port from the constructor
    };
  }
}

// Export a singleton instance
export const pactProvider = new PactWrapper();
