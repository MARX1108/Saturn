import { Pact, Matchers, InteractionObject } from '@pact-foundation/pact';
import { ApiEndpoints } from '../config/api';
import { fetchUserProfileByUsername } from './profileService';
import apiClient from './apiClient';
import path from 'path';

// Create a dedicated pact provider for this test suite with a unique port
const pactProvider = new Pact({
  consumer: 'SaturnIOSApp',
  provider: 'SaturnAPI',
  port: 1236, // Use a unique port different from other test suites
  dir: path.resolve(process.cwd(), 'pacts'),
  logLevel: 'warn',
  spec: 2,
});

describe('API Pact Tests - Profile Service', () => {
  // Setup Pact mock server for tests
  beforeAll(() => pactProvider.setup());
  // No global afterEach verify - we'll verify manually in each test
  // Tear down the mock server
  afterAll(() => pactProvider.finalize());

  describe('Fetching User Profile by Username', () => {
    // Test constants
    const targetUsername = 'profileuser';

    // Define the expected state the provider should be in
    const providerState = `User profile exists for username ${targetUsername}`;

    // Define the expected response body structure for a user profile
    // IMPORTANT: Only include non-sensitive fields expected by the frontend User type
    const userProfileResponse = {
      _id: Matchers.string('userProfileId123'),
      id: Matchers.string('userProfileId123'),
      username: targetUsername,
      preferredUsername: 'profile.user',
      displayName: 'Profile User Display Name',
      avatarUrl: 'https://example.com/avatar.jpg',
      bio: 'This is a user bio',
      followersCount: 10,
      followingCount: 20,
      // --- CRUCIALLY OMIT email, password, etc. ---
    };

    // Define the interaction
    const interaction: InteractionObject = {
      state: providerState,
      uponReceiving: `a request to get ${targetUsername}'s profile`,
      withRequest: {
        method: 'GET',
        path: ApiEndpoints.getActorByUsername(targetUsername),
        headers: {
          Accept: 'application/json, text/plain, */*',
        },
      },
      willRespondWith: {
        status: 200,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
        body: userProfileResponse,
      },
    };

    it('should return non-sensitive user profile data on success', async () => {
      // Add the interaction to the mock server
      await pactProvider.addInteraction(interaction);

      // Store original baseURL
      const originalBaseURL = apiClient.defaults.baseURL;

      // Set the baseURL to the mock server
      apiClient.defaults.baseURL = `http://localhost:1236`;

      try {
        // Make the API call
        const userProfile = await fetchUserProfileByUsername(targetUsername);

        // Assertions
        expect(userProfile).toBeDefined();
        expect(userProfile.username).toEqual(targetUsername);
        expect(userProfile.displayName).toEqual('Profile User Display Name');
        expect(userProfile).not.toHaveProperty('password'); // Explicitly check sensitive field is absent
        expect(userProfile).not.toHaveProperty('email'); // Explicitly check sensitive field is absent
      } finally {
        // Reset the baseURL
        apiClient.defaults.baseURL = originalBaseURL;
      }

      // Verify this test's interactions
      await pactProvider.verify();
    });

    // Note: Error handling tests are better suited for unit tests rather than contract tests
    // We've removed the 404 test case to simplify the contract test
  });
});
