import { Pact } from '@pact-foundation/pact';
import path from 'path';
import { searchActors } from './actorService';
import mockApiClient from '../test/mockApiClient';
import tokenStorage from '../test/mocks/tokenStorage';

// Mock the tokenStorage
jest.mock('./tokenStorage', () => {
  return jest.requireActual<typeof tokenStorage>('../test/mocks/tokenStorage');
});

// Mock the apiClient import in actorService
jest.mock('./apiClient', () => ({
  __esModule: true,
  ...jest.requireActual<typeof mockApiClient>('../test/mockApiClient'),
  defaults: {
    baseURL: 'http://localhost:1243',
  },
}));

// Use different port to avoid conflicts
const PACT_PORT_ACTOR_SEARCH = 1243;

// Define a simple mock provider
const actorSearchProvider = new Pact({
  consumer: 'SaturnIOSApp',
  provider: 'SaturnAPI',
  port: PACT_PORT_ACTOR_SEARCH,
  log: path.resolve(process.cwd(), 'logs', 'pact.log'),
  dir: path.resolve(process.cwd(), 'pacts'),
  logLevel: 'warn',
  pactfileWriteMode: 'update',
});

// Global teardown to ensure provider is finalized
afterAll(async () => {
  await actorSearchProvider.finalize();
});

describe('ActorService Contract Tests', (): void => {
  beforeAll(() => actorSearchProvider.setup());
  afterEach(() => actorSearchProvider.verify());

  describe('searchActors', () => {
    test('should search for actors by query', async () => {
      const searchQuery = 'test';

      // Setup the expected interaction
      await actorSearchProvider.addInteraction({
        state: 'Users exist in the system',
        uponReceiving: 'a request to search for users',
        withRequest: {
          method: 'GET',
          path: '/api/actors/search',
          query: { q: searchQuery },
          headers: {
            Accept: 'application/json, text/plain, */*',
          },
        },
        willRespondWith: {
          status: 200,
          headers: { 'Content-Type': 'application/json; charset=utf-8' },
          body: {
            actors: [
              {
                _id: 'userId123',
                id: 'userId123',
                username: 'testuser',
                preferredUsername: 'testuser',
                displayName: 'Test User',
                bio: 'This is a test bio.',
                followersCount: 100,
                followingCount: 50,
              },
            ],
          },
        },
      });

      // Set token for authentication
      await tokenStorage.setToken('VALID_TOKEN_EXAMPLE');

      // Set the base URL for this test
      mockApiClient.defaults.baseURL = `http://localhost:${PACT_PORT_ACTOR_SEARCH}`;

      try {
        const results = await searchActors(searchQuery);

        // Verify the response
        expect(results).toBeDefined();
        expect(Array.isArray(results)).toBe(true);
        expect(results.length).toBeGreaterThan(0);

        if (results.length > 0) {
          const firstUser = results[0];
          expect(firstUser._id).toBeDefined();
          expect(firstUser.username).toBe('testuser');
          expect(firstUser.displayName).toBe('Test User');
        }
      } finally {
        // Reset mocks
        jest.restoreAllMocks();
        await tokenStorage.removeToken();
      }
    });
  });
});
