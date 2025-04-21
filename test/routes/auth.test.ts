import request from 'supertest';
import { jest } from '@jest/globals'; // Import jest for clearAllMocks
import { mockActorService, mockAuthService } from '../helpers/mockSetup'; // Import mock services
import { Actor } from '@/modules/actors/models/actor'; // Import Actor if needed
import { ObjectId } from 'mongodb'; // Import ObjectId

describe('Auth Routes', () => {
  const mockDate = new Date();
  const mockObjectId = new ObjectId(); // Correct: Generate ObjectId
  const mockActor: Actor = {
    _id: mockObjectId, // Correct: Use ObjectId
    id: `https://test.domain/users/${mockObjectId.toHexString()}`,
    type: 'Person',
    username: 'mockUser@test.domain',
    preferredUsername: 'mockUser',
    email: 'mock@example.com', // Add email
    displayName: 'Mock User',
    summary: '', // Use summary
    inbox: `https://test.domain/users/${mockObjectId.toHexString()}/inbox`,
    outbox: `https://test.domain/users/${mockObjectId.toHexString()}/outbox`,
    followers: `https://test.domain/users/${mockObjectId.toHexString()}/followers`,
    following: [],
    publicKey: { id: '', owner: '', publicKeyPem: '' },
    isAdmin: false,
    isVerified: true,
    createdAt: mockDate,
    updatedAt: mockDate,
  };
  const mockToken = 'mock-jwt-token';
  const mockAuthResult = { actor: mockActor, token: mockToken };

  // ... existing code ...
});
