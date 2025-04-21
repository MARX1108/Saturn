import request from 'supertest';
import { jest } from '@jest/globals'; // Import jest for clearAllMocks
import { mockActorService } from '../helpers/mockSetup'; // Import mock service

beforeEach(() => {
  // Clear all mocks defined using jest.fn() or jest.spyOn()
  jest.clearAllMocks();
  // Reset mocks created with jest-mock-extended manually if needed
  // mockActorService.mockClear(); // Example if needed
});

describe('Auth Routes', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const mockUser = {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
      };
      global.mockAuthService.createUser.mockResolvedValue(mockUser);

      const response = await request((global as any).testApp)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123',
        })
        .expect(201);

      expect(response.body).toEqual(mockUser);
      expect(global.mockAuthService.createUser).toHaveBeenCalledWith(
        'testuser',
        'password123',
        'test@example.com'
      );
    });

    it('should handle server errors during registration', async () => {
      mockActorService.createActor.mockRejectedValue(
        new Error('Database error')
      );

      const response = await request((global as any).testApp)
        .post('/api/auth/register')
        .send({
          username: 'erroruser',
          email: 'test@example.com',
          password: 'password123',
        })
        .expect(500);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login an existing user', async () => {
      const mockLoggedInActor = {
        id: 'existingUserId',
        preferredUsername: 'testuser' /* ... other fields */,
      };
      const mockLoginToken = 'mock-login-token';
      mockActorService.getActorByUsername.mockResolvedValue(
        mockLoggedInActor as any
      );

      const response = await request((global as any).testApp)
        .post('/api/auth/login')
        .send({ username: 'testuser', password: 'password123' });

      expect(response.status).toBe(200);
    });

    it('should handle server errors during login', async () => {
      mockActorService.getActorByUsername.mockRejectedValue(
        new Error('Database error')
      );

      const response = await request((global as any).testApp)
        .post('/api/auth/login')
        .send({ username: 'testuser', password: 'password123' });

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
    });
  });
});
