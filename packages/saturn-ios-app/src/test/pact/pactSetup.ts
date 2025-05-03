// src/test/pact/pactSetup.ts
import { PactV3, LogLevel, SpecificationVersion } from '@pact-foundation/pact';
import path from 'path';

// Configure the Pact mock provider
export const pactProvider = new PactV3({
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
  spec: SpecificationVersion.SPECIFICATION_VERSION_V2, // Pact specification version (v2 is common)
});
