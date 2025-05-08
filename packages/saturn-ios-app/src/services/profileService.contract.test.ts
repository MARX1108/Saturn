import { Pact } from '@pact-foundation/pact';
import path from 'path';
import { ApiEndpoints } from '../config/api';
import {
  fetchUserProfileByUsername,
  updateUserProfile,
} from './profileService';
import mockApiClient from '../test/mockApiClient';
import tokenStorage from '../test/mocks/tokenStorage';

// Mock the tokenStorage
jest.mock('./tokenStorage', () => {
  return jest.requireActual<typeof tokenStorage>('../test/mocks/tokenStorage');
});

// Mock the apiClient import in profileService
jest.mock('./apiClient', () => ({
  __esModule: true,
  ...jest.requireActual<typeof mockApiClient>('../test/mockApiClient'),
  defaults: {
    baseURL: 'http://localhost:1238',
  },
}));

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
      mockApiClient.defaults.baseURL = `http://localhost:${PACT_PORT_PROFILE}`;

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

  // Skip updateProfile test since it's not implemented yet
  // We'll implement this later when the endpoint is available

  it('updates a user profile', async () => {
    // Mock the API client to intercept the PUT request
    const mockAPIResponse = {
      _id: 'userId123',
      id: 'userId123',
      username: 'testuser',
      displayName: 'Updated Test User',
      bio: 'This is my updated bio.',
      followersCount: 100,
      followingCount: 50,
    };

    // Setup the mock function
    const mockPut = jest.fn().mockResolvedValue(mockAPIResponse);
    mockApiClient.put = mockPut;

    // Make the API call
    const result = await updateUserProfile({
      username: 'testuser',
      data: {
        displayName: 'Updated Test User',
        bio: 'This is my updated bio.',
      },
    });

    // Verify the mock was called with correct arguments
    expect(mockPut).toHaveBeenCalledWith('/api/actors/username/testuser', {
      displayName: 'Updated Test User',
      bio: 'This is my updated bio.',
    });

    // Verify the response
    expect(result).toEqual(mockAPIResponse);
  });
});
