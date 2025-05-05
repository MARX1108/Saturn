import { Pact } from '@pact-foundation/pact';
import path from 'path';
import { ApiEndpoints } from '../config/api';
import { fetchUserProfileByUsername } from './profileService';
import apiClient from './apiClient';
import * as tokenStorage from './tokenStorage';

// Use different port to avoid conflicts
const PACT_PORT_PROFILE = 1238;

// Define a simple mock provider
const profileProvider = new Pact({
  consumer: 'SaturnIOSApp',
  provider: 'SaturnAPI',
  port: PACT_PORT_PROFILE,
  log: path.resolve(process.cwd(), 'logs', 'pact.log'),
  dir: path.resolve(process.cwd(), 'pacts'),
  logLevel: 'warn',
  pactfileWriteMode: 'update',
});

// Global teardown to ensure provider is finalized
afterAll(async () => {
  await profileProvider.finalize();
});

describe('ProfileService Contract Tests', (): void => {
  beforeAll(() => profileProvider.setup());
  afterEach(() => profileProvider.verify());

  describe('fetchUserProfileByUsername', () => {
    test('should fetch a user profile successfully', async () => {
      const username = 'testuser';
      const userEndpoint = ApiEndpoints.getActorByUsername(username);

      // Setup the expected interaction
      await profileProvider.addInteraction({
        state: 'User profile exists',
        uponReceiving: 'a request to fetch a user profile',
        withRequest: {
          method: 'GET',
          path: userEndpoint,
          headers: {
            Authorization: 'Bearer VALID_TOKEN_EXAMPLE',
            Accept: 'application/json, text/plain, */*',
          },
        },
        willRespondWith: {
          status: 200,
          headers: { 'Content-Type': 'application/json; charset=utf-8' },
          body: {
            _id: 'userId123',
            id: 'userId123',
            username: 'testuser',
            displayName: 'Test User',
            bio: 'This is a test bio.',
            followersCount: 100,
            followingCount: 50,
            isFollowing: false,
          },
        },
      });

      // Mock the token storage
      jest
        .spyOn(tokenStorage, 'getToken')
        .mockResolvedValue('VALID_TOKEN_EXAMPLE');

      // Make request to Pact mock server
      const originalBaseURL = apiClient.defaults.baseURL;
      apiClient.defaults.baseURL = `http://localhost:${PACT_PORT_PROFILE}`;

      try {
        const profile = await fetchUserProfileByUsername(username);

        // Verify the response
        expect(profile).toBeDefined();
        expect(profile.id).toBeDefined();
        expect(profile.username).toEqual('testuser');
        expect(profile.displayName).toEqual('Test User');
        expect(profile.bio).toEqual('This is a test bio.');
      } finally {
        // Reset
        apiClient.defaults.baseURL = originalBaseURL;
        jest.restoreAllMocks();
      }
    });
  });

  // Skip updateProfile test since it's not implemented yet
  // We'll implement this later when the endpoint is available
});
