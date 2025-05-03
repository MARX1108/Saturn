// src/services/authService.contract.test.ts
import { pactProvider } from '../test/pact/pactSetup';
import { ApiEndpoints } from '../config/api';
import apiClient, { post } from './apiClient';
import { MatchersV3 } from '@pact-foundation/pact';

// Define the expected User type structure (subset needed for login response)
interface UserLoginResponse {
  _id: string;
  id: string;
  username: string;
  preferredUsername: string;
  email: string;
}

// Define the expected Login Response structure
interface LoginResponse {
  actor: UserLoginResponse;
  token: string;
}

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
    const loginResponseBody = {
      actor: {
        _id: MatchersV3.string('68153594506819fdf8585b72'),
        id: MatchersV3.string('68153594506819fdf8585b73'),
        username: 'testuser',
        preferredUsername: 'testuser',
        email: MatchersV3.email('test@example.com'),
      },
      token: MatchersV3.jwt('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'),
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
        },
        body: loginRequestBody,
      },
      willRespondWith: {
        status: 200,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
        body: loginResponseBody,
      },
    };

    it('should return user and token on successful login', async () => {
      // Add the interaction to the mock server
      await pactProvider.addInteraction(interaction);

      // Make the actual API call using your apiClient
      const originalBaseURL = apiClient.defaults.baseURL;
      apiClient.defaults.baseURL = pactProvider.mockService.baseUrl;

      try {
        const response = await post<LoginResponse>(ApiEndpoints.login, loginRequestBody);

        // Assertions on the response
        expect(response.actor.username).toBe('testuser');
        expect(response.token).toBeDefined();
      } finally {
        apiClient.defaults.baseURL = originalBaseURL;
      }
    });
  });
});
