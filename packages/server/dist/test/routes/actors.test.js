'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
const supertest_1 = __importDefault(require('supertest'));
const globals_1 = require('@jest/globals');
const mockSetup_1 = require('../helpers/mockSetup');
const mongodb_1 = require('mongodb');
// Remove SearchActorsResult type if searchActors returns Actor[]
// type SearchActorsResult = { actors: Actor[]; hasMore: boolean };
// Use a valid ObjectId string for mocks
const mockObjectIdString = new mongodb_1.ObjectId().toHexString();
beforeEach(() => {
  globals_1.jest.clearAllMocks();
});
describe('Actor Routes', () => {
  const mockDate = new Date();
  const fullMockActor = {
    _id: new mongodb_1.ObjectId(mockObjectIdString),
    id: 'https://test.domain/users/testuser',
    username: 'testuser@test.domain',
    preferredUsername: 'testuser',
    displayName: 'Test User Display',
    name: 'Test User',
    summary: 'Update summary',
    type: 'Person',
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
      mockSetup_1.mockActorService.searchActors.mockResolvedValue([
        fullMockActor,
      ]); // Resolve with Actor[]
      const response = await (0, supertest_1.default)(global.testApp)
        .get('/api/actors/search?q=')
        .set('Authorization', 'Bearer mock-test-token');
      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
      expect(Array.isArray(response.body)).toBe(true);
      // Fix unbound method issue by getting mockActorService.searchActors.mock
      expect(mockSetup_1.mockActorService.searchActors.mock.calls.length).toBe(
        1
      );
    });
  });
  describe('GET /api/actors/search', () => {
    it('should search actors with a query', async () => {
      const mockSearchResult = {
        actors: [
          {
            ...fullMockActor,
            _id: new mongodb_1.ObjectId(),
            id: 'https://test.domain/users/actor1',
            preferredUsername: 'Actor 1',
          },
          {
            ...fullMockActor,
            _id: new mongodb_1.ObjectId(),
            id: 'https://test.domain/users/actor2',
            preferredUsername: 'Actor 2',
          },
        ],
        hasMore: false,
      };
      // Correct mock signature for searchActors
      mockSetup_1.mockActorService.searchActors.mockResolvedValue(
        mockSearchResult.actors
      ); // Assuming signature is (query: string, limit?: number)
      const response = await (0, supertest_1.default)(global.testApp)
        .get('/api/actors/search')
        .query({ q: 'test' })
        .expect(200);
      const expectedActor1 = {
        ...mockSearchResult.actors[0],
        _id: mockSearchResult.actors[0]._id.toHexString(),
        createdAt: mockSearchResult.actors[0].createdAt.toISOString(),
        updatedAt: mockSearchResult.actors[0].updatedAt.toISOString(),
        publicKey: mockSearchResult.actors[0].publicKey,
      };
      const expectedActor2 = {
        ...mockSearchResult.actors[1],
        _id: mockSearchResult.actors[1]._id.toHexString(),
        createdAt: mockSearchResult.actors[1].createdAt.toISOString(),
        updatedAt: mockSearchResult.actors[1].updatedAt.toISOString(),
        publicKey: mockSearchResult.actors[1].publicKey,
      };
      // Expecting an array of actors now
      expect(response.body).toEqual([expectedActor1, expectedActor2]);
      // Fix unbound method issue by getting mockActorService.searchActors.mock
      expect(mockSetup_1.mockActorService.searchActors.mock.calls.length).toBe(
        1
      );
    });
  });
  describe('GET /api/actors/:username', () => {
    it('should return an actor by username', async () => {
      const specificMockActor = {
        ...fullMockActor,
        _id: new mongodb_1.ObjectId(),
        preferredUsername: 'testactor',
      };
      mockSetup_1.mockActorService.getActorByUsername.mockResolvedValue(
        specificMockActor
      );
      const response = await (0, supertest_1.default)(global.testApp)
        .get('/api/actors/testactor')
        .expect(200);
      const expectedSerializedActor = {
        ...specificMockActor,
        _id: specificMockActor._id.toHexString(),
        createdAt: specificMockActor.createdAt.toISOString(),
        updatedAt: specificMockActor.updatedAt.toISOString(),
      };
      expect(response.body).toMatchObject(expectedSerializedActor);
      // Fix unbound method issue by getting mockActorService.getActorByUsername.mock
      expect(
        mockSetup_1.mockActorService.getActorByUsername.mock.calls.length
      ).toBe(1);
    });
    it('should return 404 if actor not found', async () => {
      mockSetup_1.mockActorService.getActorByUsername.mockResolvedValue(null);
      await (0, supertest_1.default)(global.testApp)
        .get('/api/actors/nonexistent')
        .expect(404);
    });
  });
});
