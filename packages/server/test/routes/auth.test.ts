import request from 'supertest';
import { jest } from '@jest/globals'; // Import jest for clearAllMocks
import { mockActorService, mockAuthService } from '../helpers/mockSetup'; // Import mock services
import { Actor } from '@/modules/actors/models/actor'; // Import Actor if needed
import { ObjectId } from 'mongodb'; // Import ObjectId

// Use a valid ObjectId string for mocks
const mockObjectIdString = new ObjectId().toHexString();

beforeEach(() => {
  // Clear all mocks defined using jest.fn() or jest.spyOn()
  jest.clearAllMocks();
  // Reset mocks created with jest-mock-extended manually if needed
  // mockActorService.mockClear(); // Example if needed
});

describe('Auth Routes', () => {
  const mockDate = new Date();
  const mockActor: Actor = {
    _id: new ObjectId(mockObjectIdString), // Use ObjectId
    id: 'https://test.domain/users/mockUser',
    username: 'mockUser@test.domain',
    preferredUsername: 'mockUser',
    displayName: 'Mock User',
    summary: '',
    type: 'Person',
    inbox: '',
    outbox: '',
    followers: '',
    createdAt: mockDate,
    updatedAt: mockDate,
    publicKey: { id: '', owner: '', publicKeyPem: '' },
  };
  const mockToken = 'mock-jwt-token';
  const mockAuthResult = { actor: mockActor, token: mockToken };

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      // Controller calls authService.createUser
      mockAuthService.createUser.mockResolvedValue(mockAuthResult);

      const response = await request((global as any).testApp)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123',
        })
        .expect(201);

      // Adjust expectation for date serialization
      const expectedBody = {
        ...mockAuthResult,
        actor: {
          ...mockAuthResult.actor,
          _id: mockAuthResult.actor._id.toHexString(), // Serialize ObjectId
          createdAt: mockAuthResult.actor.createdAt?.toISOString(),
          updatedAt: mockAuthResult.actor.updatedAt?.toISOString(),
        },
      };

      expect(response.body).toEqual(expectedBody);
      expect(mockAuthService.createUser).toHaveBeenCalledWith(
        'testuser',
        'password123',
        'test@example.com' // Ensure email is passed if service expects it
      );
    });

    it('should handle server errors during registration', async () => {
      const expectedErrorMessage = 'Create user failed';
      mockAuthService.createUser.mockRejectedValue(
        new Error(expectedErrorMessage)
      );

      const response = await request((global as any).testApp)
        .post('/api/auth/register')
        .send({
          username: 'erroruser',
          email: 'test@example.com',
          password: 'password123',
        })
        .expect(500);

      // Expect specific error message from the AppError/generic handler
      expect(response.body).toHaveProperty('error', expectedErrorMessage);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login an existing user', async () => {
      // Controller calls authService.authenticateUser
      mockAuthService.authenticateUser.mockResolvedValue(mockAuthResult);

      const response = await request((global as any).testApp)
        .post('/api/auth/login')
        .send({ username: 'mockUser', password: 'password123' })
        .expect(200); // Expect 200 for successful login

      // Adjust expectation for date serialization
      const expectedBody = {
        ...mockAuthResult,
        actor: {
          ...mockAuthResult.actor,
          _id: mockAuthResult.actor._id.toHexString(), // Serialize ObjectId
          createdAt: mockAuthResult.actor.createdAt?.toISOString(),
          updatedAt: mockAuthResult.actor.updatedAt?.toISOString(),
        },
      };

      expect(response.body).toEqual(expectedBody);
      expect(mockAuthService.authenticateUser).toHaveBeenCalledWith(
        'mockUser',
        'password123'
      );
    });

    it('should handle server errors during login', async () => {
      const expectedErrorMessage = 'Auth failed';
      mockAuthService.authenticateUser.mockRejectedValue(
        new Error(expectedErrorMessage)
      );

      const response = await request((global as any).testApp)
        .post('/api/auth/login')
        .send({ username: 'testuser', password: 'password123' })
        .expect(500); // Expect 500 because authenticateUser failed

      // Expect specific error message
      expect(response.body).toHaveProperty('error', expectedErrorMessage);
    });

    it('should return 401 for invalid credentials', async () => {
      // Mock returning null simulates failed auth check before AppError was thrown
      // Now, controller throws AppError directly
      const expectedErrorMessage = 'Invalid credentials';
      mockAuthService.authenticateUser.mockResolvedValue(null);
      // OR mock it to throw the specific AppError if that's the implementation:
      // mockAuthService.authenticateUser.mockRejectedValue(new AppError(expectedErrorMessage, ErrorType.Unauthorized));

      const response = await request((global as any).testApp)
        .post('/api/auth/login')
        .send({ username: 'testuser', password: 'wrongpassword' })
        .expect(401); // Expect 401 because controller throws AppError(..., Unauthorized)

      // Expect specific error message from AppError
      expect(response.body).toHaveProperty('error', expectedErrorMessage);
    });
  });
});
