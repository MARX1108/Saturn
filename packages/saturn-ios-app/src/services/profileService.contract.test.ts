import { Pact } from '@pact-foundation/pact';
import path from 'path';
import { ApiEndpoints } from '../config/api';
import {
  fetchUserProfileByUsername,
  updateUserProfile,
} from './profileService';
import tokenStorage from '../test/mocks/tokenStorage';

// Mock the tokenStorage
jest.mock('./tokenStorage', () => {
  return jest.requireActual<typeof tokenStorage>('../test/mocks/tokenStorage');
});

// Mock the apiClient
jest.mock('./apiClient', () => {
  return {
    defaults: {
      baseURL: 'http://localhost:1238',
    },
    get: jest.fn(),
    put: jest.fn(),
    post: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: { use: jest.fn(), eject: jest.fn() },
      response: { use: jest.fn(), eject: jest.fn() },
    },
  };
});

// Import apiClient after mocking it
import apiClient from './apiClient';

// Test specific mocks
jest.mock('react-native-toast-message', () => ({
  show: jest.fn(),
  hide: jest.fn(),
}));

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

// Isolate these tests from UI component dependencies
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

      // Set token for authentication
      await tokenStorage.setToken('VALID_TOKEN_EXAMPLE');

      // Set the base URL for this test
      apiClient.defaults.baseURL = `http://localhost:${PACT_PORT_PROFILE}`;

      // Mock the API response
      (apiClient.get as jest.Mock).mockResolvedValueOnce({
        _id: 'userId123',
        id: 'userId123',
        username: 'testuser',
        displayName: 'Test User',
        bio: 'This is a test bio.',
        followersCount: 100,
        followingCount: 50,
        isFollowing: false,
      });

      try {
        const profile = await fetchUserProfileByUsername(username);

        // Verify the response
        expect(profile).toBeDefined();
        expect(profile.id).toBeDefined();
        expect(profile.username).toEqual('testuser');
        expect(profile.displayName).toEqual('Test User');
        expect(profile.bio).toEqual('This is a test bio.');
      } finally {
        // Reset mocks
        jest.restoreAllMocks();
        await tokenStorage.removeToken();
      }
    });
  });

  describe('updateUserProfile', () => {
    test('should update a user profile successfully', async () => {
      const username = 'testuserToUpdate';
      const updateEndpoint = ApiEndpoints.updateActorByUsername(username);
      const updateData = {
        displayName: 'Updated Test User',
        bio: 'This is my updated bio.',
      };

      // Setup the expected interaction
      await profileProvider.addInteraction({
        state: `User profile exists for username ${username}`,
        uponReceiving: `a request to update ${username}'s profile`,
        withRequest: {
          method: 'PUT',
          path: updateEndpoint,
          headers: {
            Authorization: 'Bearer VALID_TOKEN_EXAMPLE',
            'Content-Type': 'application/json',
            Accept: 'application/json, text/plain, */*',
          },
          body: {
            displayName: 'Updated Test User',
            bio: 'This is my updated bio.',
          },
        },
        willRespondWith: {
          status: 200,
          headers: { 'Content-Type': 'application/json; charset=utf-8' },
          body: {
            _id: 'userId123',
            id: 'userId123',
            username: 'testuserToUpdate',
            displayName: 'Updated Test User',
            bio: 'This is my updated bio.',
            followersCount: 100,
            followingCount: 50,
          },
        },
      });

      // Set token for authentication
      await tokenStorage.setToken('VALID_TOKEN_EXAMPLE');

      // Set the base URL for this test
      apiClient.defaults.baseURL = `http://localhost:${PACT_PORT_PROFILE}`;

      // Mock the API response
      (apiClient.put as jest.Mock).mockResolvedValueOnce({
        _id: 'userId123',
        id: 'userId123',
        username: 'testuserToUpdate',
        displayName: 'Updated Test User',
        bio: 'This is my updated bio.',
        followersCount: 100,
        followingCount: 50,
      });

      try {
        const updatedProfile = await updateUserProfile({
          username,
          data: updateData,
        });

        // Verify the response
        expect(updatedProfile).toBeDefined();
        expect(updatedProfile.id).toBeDefined();
        expect(updatedProfile.username).toEqual(username);
        expect(updatedProfile.displayName).toEqual(updateData.displayName);
        expect(updatedProfile.bio).toEqual(updateData.bio);
      } finally {
        // Reset mocks
        jest.restoreAllMocks();
        await tokenStorage.removeToken();
      }
    });
  });
});
