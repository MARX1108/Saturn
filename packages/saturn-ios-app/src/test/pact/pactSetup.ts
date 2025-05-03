// src/test/pact/pactSetup.ts
import { Pact, LogLevel, InteractionObject } from '@pact-foundation/pact';
import path from 'path';

/**
 * Interface for the mock service
 */
interface MockService {
  baseUrl: string;
}

/**
 * A wrapper for the Pact instance with public methods
 */
class PactWrapper {
  private pact: Pact;

  /**
   * Creates an instance of the PactWrapper
   */
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

  /**
   * Sets up the Pact mock server
   */
  async setup(): Promise<void> {
    await this.pact.setup();
    return Promise.resolve();
  }

  /**
   * Adds an interaction to the Pact mock server
   * @param interaction The interaction object to add
   */
  async addInteraction(interaction: InteractionObject): Promise<void> {
    await this.pact.addInteraction(interaction);
    return Promise.resolve();
  }

  /**
   * Verifies all interactions have been exercised
   */
  async verify(): Promise<void> {
    await this.pact.verify();
    return Promise.resolve();
  }

  /**
   * Finalizes the Pact mock server and writes the contract file
   */
  async finalize(): Promise<void> {
    await this.pact.finalize();
    return Promise.resolve();
  }

  /**
   * Gets the mock service information
   * @returns The mock service with base URL
   */
  get mockService(): MockService {
    return {
      baseUrl: `http://localhost:1234`, // Match the port from the constructor
    };
  }
}

// Export a singleton instance
export const pactProvider = new PactWrapper();
