import request from 'supertest';
import { jest } from '@jest/globals';
import { mockActorService } from '../helpers/mockSetup';
import { Actor } from '@/modules/actors/models/actor';

// Remove SearchActorsResult type if searchActors returns Actor[]
// type SearchActorsResult = { actors: Actor[]; hasMore: boolean };

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Actor Routes', () => {
  const mockDate = new Date();
  const fullMockActor: Actor = {
    _id: '60a0f3f1e1b8f1a1a8b4c1c1',
    id: 'https://test.domain/users/testuser',
    username: 'testuser@test.domain',
    preferredUsername: 'testuser',
    displayName: 'Test User',
    name: 'Test User',
    bio: 'Test bio',
    summary: 'Test summary',
    type: 'Person' as const,
    inbox: 'https://test.domain/users/testuser/inbox',
    outbox: 'https://test.domain/users/testuser/outbox',
    followers: 'https://test.domain/users/testuser/followers',
    createdAt: mockDate,
    updatedAt: mockDate,
    publicKey: {
      id: 'key-id',
      owner: 'https://test.domain/users/testuser',
      publicKeyPem: '---PUBLIC KEY---',
    },
  };

  describe('GET /api/actors/search (was GET /api/actors)', () => {
    it('should return actors via search endpoint (empty query)', async () => {
      // Assuming searchActors returns Actor[]
      (
        mockActorService.searchActors as jest.MockedFunction<
          typeof mockActorService.searchActors
        >
      ).mockResolvedValue([fullMockActor]); // Resolve with Actor[]

      const response = await request((global as any).testApp)
        .get('/api/actors/search?q=')
        .set('Authorization', 'Bearer mock-test-token');

      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
      expect(Array.isArray(response.body)).toBe(true);
      expect(mockActorService.searchActors).toHaveBeenCalledWith('');
    });
  });

  describe('GET /api/actors/search', () => {
    it('should search actors with a query', async () => {
      const mockSearchResult = {
        actors: [
          {
            ...fullMockActor,
            _id: 'actor1',
            id: 'https://test.domain/users/actor1',
            preferredUsername: 'Actor 1',
          },
          {
            ...fullMockActor,
            _id: 'actor2',
            id: 'https://test.domain/users/actor2',
            preferredUsername: 'Actor 2',
          },
        ],
        hasMore: false,
      };
      // Assuming searchActors returns Actor[]
      (
        mockActorService.searchActors as jest.MockedFunction<
          typeof mockActorService.searchActors
        >
      ).mockResolvedValue(mockSearchResult.actors); // Resolve with Actor[]

      const response = await request((global as any).testApp)
        .get('/api/actors/search')
        .query({ q: 'test' })
        .expect(200);

      const expectedActor1 = {
        ...mockSearchResult.actors[0],
        createdAt: mockSearchResult.actors[0].createdAt.toISOString(),
        updatedAt: mockSearchResult.actors[0].updatedAt.toISOString(),
        publicKey: mockSearchResult.actors[0].publicKey,
      };

      const expectedActor2 = {
        ...mockSearchResult.actors[1],
        createdAt: mockSearchResult.actors[1].createdAt.toISOString(),
        updatedAt: mockSearchResult.actors[1].updatedAt.toISOString(),
        publicKey: mockSearchResult.actors[1].publicKey,
      };

      // Expecting an array of actors now
      expect(response.body).toEqual([expectedActor1, expectedActor2]);
      expect(mockActorService.searchActors).toHaveBeenCalledWith('test');
    });
  });

  describe('GET /api/actors/:username', () => {
    it('should return an actor by username', async () => {
      const specificMockActor = {
        ...fullMockActor,
        preferredUsername: 'testactor',
      };
      mockActorService.getActorByUsername.mockResolvedValue(specificMockActor);

      const response = await request((global as any).testApp)
        .get('/api/actors/testactor')
        .expect(200);

      const expectedSerializedActor = {
        ...specificMockActor,
        createdAt: specificMockActor.createdAt.toISOString(),
        updatedAt: specificMockActor.updatedAt.toISOString(),
      };

      expect(response.body).toMatchObject(expectedSerializedActor);
      expect(mockActorService.getActorByUsername).toHaveBeenCalledWith(
        'testactor'
      );
    });

    it('should return 404 if actor not found', async () => {
      mockActorService.getActorByUsername.mockResolvedValue(null);

      await request((global as any).testApp)
        .get('/api/actors/nonexistent')
        .expect(404);
    });
  });
});
