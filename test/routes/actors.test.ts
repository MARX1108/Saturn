import request from 'supertest';
import { jest } from '@jest/globals';
import { mockActorService } from '../helpers/mockSetup';
import { Actor } from '@/modules/actors/models/actor';
import { ObjectId } from 'mongodb';

describe('Actor Routes', () => {
  const mockDate = new Date();
  const mockObjectId = new ObjectId('60a0f3f1e1b8f1a1a8b4c1c1');
  const fullMockActor: Actor = {
    _id: mockObjectId,
    id: 'https://test.domain/users/testuser',
    type: 'Person',
    username: 'testuser@test.domain',
    preferredUsername: 'testuser',
    email: 'testuser@test.domain',
    displayName: 'Test User',
    summary: 'Test summary',
    inbox: 'https://test.domain/users/testuser/inbox',
    outbox: 'https://test.domain/users/testuser/outbox',
    followers: 'https://test.domain/users/testuser/followers',
    following: [],
    publicKey: {
      id: 'key-id',
      owner: 'https://test.domain/users/testuser',
      publicKeyPem: '---PUBLIC KEY---',
    },
    isAdmin: false,
    isVerified: true,
    createdAt: mockDate,
    updatedAt: mockDate,
  };

  describe('GET /api/actors/search (was GET /api/actors)', () => {
    describe('GET /api/actors/search', () => {
      it('should search actors with a query', async () => {
        const mockSearchResultActors: Actor[] = [
          {
            ...fullMockActor,
            _id: new ObjectId(),
            id: 'https://test.domain/users/actor1',
            preferredUsername: 'Actor 1',
            displayName: 'Actor One',
          },
          {
            ...fullMockActor,
            _id: new ObjectId(),
            id: 'https://test.domain/users/actor2',
            preferredUsername: 'Actor 2',
            displayName: 'Actor Two',
          },
        ];

        (
          mockActorService.searchActors as jest.MockedFunction<
            typeof mockActorService.searchActors
          >
        ).mockResolvedValue(mockSearchResultActors);
      });
    });
  });

  const mockSearchResultActors: Actor[] = [
    {
      ...fullMockActor,
      _id: new ObjectId(),
      id: 'https://test.domain/users/actor1',
      preferredUsername: 'Actor 1',
      displayName: 'Actor One',
    },
    {
      ...fullMockActor,
      _id: new ObjectId(),
      id: 'https://test.domain/users/actor2',
      preferredUsername: 'Actor 2',
      displayName: 'Actor Two',
    },
  ];

  (
    mockActorService.searchActors as jest.MockedFunction<
      typeof mockActorService.searchActors
    >
  ).mockResolvedValue(mockSearchResultActors);

  const response = await request((global as any).testApp);

  const specificMockActor = {
    ...fullMockActor,
    _id: new ObjectId(),
    preferredUsername: 'testactor',
    username: 'testactor@test.domain',
    email: 'testactor@test.domain',
    id: 'https://test.domain/users/testactor',
  };
  mockActorService.getActorByUsername.mockResolvedValue(specificMockActor);
});
