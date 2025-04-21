import request from 'supertest';
import { jest } from '@jest/globals';
import { mockActorService } from '../helpers/mockSetup';
import { Actor } from '@/modules/actors/models/actor';
import { ObjectId } from 'mongodb';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Actor Routes', () => {
  const mockDate = new Date();
  const fullMockActor: Actor = {
    _id: new ObjectId('60a0f3f1e1b8f1a1a8b4c1c1'),
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
    icon: undefined,
    image: undefined,
    publicKey: { id: '', owner: '', publicKeyPem: '' },
    followingCount: 0,
    followersCount: 0,
    postsCount: 0,
  };

  describe('GET /api/actors/search (was GET /api/actors)', () => {
    it('should return actors via search endpoint (empty query)', async () => {
      mockActorService.searchActors.mockResolvedValue({
        actors: [fullMockActor],
        hasMore: false,
      });

      const response = await request((global as any).testApp)
        .get('/api/actors/search?q=')
        .set('Authorization', 'Bearer mock-test-token');

      expect(response.status).toBe(200);
      expect(response.body.actors).toBeDefined();
      expect(Array.isArray(response.body.actors)).toBe(true);
      expect(mockActorService.searchActors).toHaveBeenCalledWith('');
    });
  });

  describe('GET /api/actors/search', () => {
    it('should search actors with a query', async () => {
      const mockActorsResult = {
        actors: [
          {
            ...fullMockActor,
            _id: new ObjectId(),
            id: '1',
            preferredUsername: 'Actor 1',
          },
          {
            ...fullMockActor,
            _id: new ObjectId(),
            id: '2',
            preferredUsername: 'Actor 2',
          },
        ],
        hasMore: false,
      };
      mockActorService.searchActors.mockResolvedValue(mockActorsResult);

      const response = await request((global as any).testApp)
        .get('/api/actors/search')
        .query({ q: 'test' })
        .expect(200);

      // Expect the structure returned by the service, matching JSON serialization
      const expectedActor1 = {
        ...fullMockActor,
        _id: mockActorsResult.actors[0]._id.toString(), // Expect string ID
        createdAt: mockActorsResult.actors[0].createdAt.toISOString(), // Expect ISO string date
        updatedAt: mockActorsResult.actors[0].updatedAt.toISOString(), // Expect ISO string date
        icon: undefined, // Keep undefined if you expect it, or remove if omitted
        image: undefined,
      };
      delete expectedActor1.icon; // Remove if omitted by API
      delete expectedActor1.image; // Remove if omitted by API

      const expectedActor2 = {
        ...fullMockActor,
        _id: mockActorsResult.actors[1]._id.toString(), // Expect string ID
        createdAt: mockActorsResult.actors[1].createdAt.toISOString(), // Expect ISO string date
        updatedAt: mockActorsResult.actors[1].updatedAt.toISOString(), // Expect ISO string date
        icon: undefined,
        image: undefined,
      };
      delete expectedActor2.icon;
      delete expectedActor2.image;

      const expectedResult = {
        actors: [expectedActor1, expectedActor2],
        hasMore: false,
      };

      expect(response.body).toEqual(expectedResult);
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

      // Adjust expectation for JSON serialization
      const expectedSerializedActor = {
        ...specificMockActor,
        _id: specificMockActor._id.toString(),
        createdAt: specificMockActor.createdAt.toISOString(),
        updatedAt: specificMockActor.updatedAt.toISOString(),
      };
      delete expectedSerializedActor.icon; // Assuming omitted
      delete expectedSerializedActor.image; // Assuming omitted

      expect(response.body).toEqual(expectedSerializedActor);
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
