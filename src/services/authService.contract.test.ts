import { pactProvider } from '../test/pact/pactSetup';
import { ApiEndpoints } from '../config/api';
import apiClient, { post } from './apiClient'; // Use the actual apiClient wrapper
import { MatchersV3 } from '@pact-foundation/pact';

// Define the expected User type structure (subset needed for login response)
// Ideally, import this from your main types if possible and stable
interface UserLoginResponse {
  _id: string;
  id: string; // Assuming this is also returned based on previous eval
  username: string;
  preferredUsername: string; // Assuming this is also returned
  email: string; // Assuming this is returned
  // Add other fields expected in the login response's 'actor' object
}

// Define the expected Login Response structure
interface LoginResponse {
  actor: UserLoginResponse;
  token: string;
}

// Increase Jest timeout specifically for Pact tests if not done globally
// jest.setTimeout(30000); // Or use jest.config.js

describe('API Pact Tests - Auth Service', () => {
  // Setup Pact mock server for tests
  beforeAll(() => pactProvider.setup());
  // Verify interactions and write pact file
  afterEach(() => pactProvider.verify());
  // Tear down the mock server
  afterAll(() => pactProvider.finalize());

  describe('Login User', () => {
    // Define the expected state the provider should be in
    const providerState = 'A user with username testuser exists';

    // Define the expected request body
    const loginRequestBody = {
      username: 'testuser',
      password: 'password123',
    };

    // Define the expected response body structure using Pact Matchers
    const loginResponseBody: LoginResponse = {
      actor: {
        _id: MatchersV3.string('68153594506819fdf8585b72'), // Example ID, match string format
        id: MatchersV3.string('68153594506819fdf8585b73'), // Example ID, match string format
        username: 'testuser',
        preferredUsername: 'testuser',
        email: MatchersV3.email('test@example.com'), // Match email format
      },
      token: MatchersV3.jwt('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'), // Match JWT format
    };

    // Define the interaction
    const interaction = {
      state: providerState,
      uponReceiving: 'a login request for an existing user',
      withRequest: {
        method: 'POST',
        path: ApiEndpoints.login,
        headers: {
          'Content-Type': 'application/json',
          // Authorization header should NOT be sent for login
        },
        body: loginRequestBody,
      },
      willRespondWith: {
        status: 200,
        headers: {
          'Content-Type': 'application/json; charset=utf-8', // Be precise
        },
        body: loginResponseBody,
      },
    };

    it('should return user and token on successful login', async () => {
      // Add the interaction to the mock server
      await pactProvider.addInteraction(interaction);

      // Make the actual API call using your apiClient
      // NOTE: Ensure apiClient base URL is temporarily pointed to the Pact mock server
      const originalBaseURL = apiClient.defaults.baseURL; // Store original
      apiClient.defaults.baseURL = pactProvider.mockService.baseUrl; // Point to mock

      try {
        const response = await post<LoginResponse>(
          ApiEndpoints.login,
          loginRequestBody
        );

        // Assertions on the response (optional, Pact verification is key)
        expect(response.actor.username).toBe('testuser');
        expect(response.token).toBeDefined();
        // Add more specific checks if needed based on MatchersV3 structure
      } finally {
        apiClient.defaults.baseURL = originalBaseURL; // Restore original baseURL
      }
    });
  });

  // --- Add more contract tests here for other endpoints (register, me, etc.) ---
});
