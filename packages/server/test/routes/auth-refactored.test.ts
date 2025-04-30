import { Express } from 'express';
import { DeepMockProxy, mock } from 'jest-mock-extended';
import request from 'supertest';
import { ObjectId } from 'mongodb';
import bcryptjs from 'bcryptjs';
import { AuthRepository } from '@/modules/auth/repositories/auth.repository';
import { AuthService } from '@/modules/auth/services/auth.service';
import { AuthController } from '@/modules/auth/controllers/authController';
import { ActorService } from '@/modules/actors/services/actorService';
import { ActorRepository } from '@/modules/actors/repositories/actorRepository';
import { DbUser } from '@/modules/auth/models/user';
import { Actor } from '@/modules/actors/models/actor';

// Import a modified version of createTestApp to accept services directly
import { createApp } from '../../src/app';

// Helper interfaces for response types
interface AuthResponse {
  actor: {
    preferredUsername: string;
    displayName?: string;
    name?: string;
    summary?: string;
    password?: string;
  };
  token: string;
}

interface ErrorResponse {
  error: string;
}

describe('Auth Routes (Refactored)', () => {
  let app: Express;
  let authRepositoryMock: DeepMockProxy<AuthRepository>;
  let actorRepositoryMock: DeepMockProxy<ActorRepository>;
  let authService: AuthService;
  let actorService: ActorService;
  let authController: AuthController;

  // Test user data
  const testUserId = new ObjectId().toString();
  const testUserName = 'testuser';
  const testUserEmail = 'test@example.com';
  const testUserPassword = 'password123';
  const testUserHashedPassword =
    '$2a$10$XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'; // Simulated hash

  // Setup test user
  const testUser: DbUser = {
    _id: testUserId,
    id: testUserId,
    username: testUserName,
    preferredUsername: testUserName,
    email: testUserEmail,
    password: testUserHashedPassword,
    followers: [],
    following: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    // Create repository mocks
    authRepositoryMock = mock<AuthRepository>();
    actorRepositoryMock = mock<ActorRepository>();

    // Create real services with mocked repositories
    authService = new AuthService(authRepositoryMock);
    actorService = new ActorService(actorRepositoryMock);

    // Create real controller with real services
    authController = new AuthController(actorService, authService);

    // Create test app with real controller
    app = createApp({
      authService,
      actorService,
      authController,
      // Other services could still be mocked if needed
    });

    // Setup bcryptjs mock - more precise than at the module level
    jest
      .spyOn(bcryptjs, 'compare')
      .mockImplementation(async (password, hash) => {
        return password === testUserPassword; // Simple password check for tests
      });

    jest.spyOn(bcryptjs, 'hash').mockResolvedValue(testUserHashedPassword);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      // Setup repository mock behavior
      authRepositoryMock.findByUsername.mockResolvedValue(null);
      authRepositoryMock.findByEmail.mockResolvedValue(null);
      authRepositoryMock.create.mockImplementation(async user => {
        return { ...user, _id: testUserId };
      });

      // Test the endpoint
      const response = await request(app).post('/api/auth/register').send({
        username: testUserName,
        password: testUserPassword,
        email: testUserEmail,
        displayName: 'Test User',
      });

      // Verify response
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');
      expect(response.body.actor.preferredUsername).toBe(testUserName);
      expect(response.body.actor).not.toHaveProperty('password');

      // Verify repository was called correctly
      expect(authRepositoryMock.create).toHaveBeenCalledWith(
        expect.objectContaining({
          preferredUsername: testUserName,
          email: testUserEmail,
        })
      );
    });

    it('should return 400 if username is missing', async () => {
      const response = await request(app).post('/api/auth/register').send({
        password: testUserPassword,
        email: testUserEmail,
      });

      expect(response.status).toBe(400);
      const responseBody = response.body as ErrorResponse;
      expect(responseBody).toHaveProperty('error');
    });

    it('should return 400 if password is missing', async () => {
      const response = await request(app).post('/api/auth/register').send({
        username: testUserName,
        email: testUserEmail,
      });

      expect(response.status).toBe(400);
      const responseBody = response.body as ErrorResponse;
      expect(responseBody).toHaveProperty('error');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login a user with valid credentials', async () => {
      // Setup repository mock behavior
      authRepositoryMock.findByUsername.mockResolvedValue(testUser);

      // Test the endpoint
      const response = await request(app).post('/api/auth/login').send({
        username: testUserName,
        password: testUserPassword,
      });

      // Verify response
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body.actor.preferredUsername).toBe(testUserName);
      expect(response.body.actor).not.toHaveProperty('password');

      // Verify repository was called correctly
      expect(authRepositoryMock.findByUsername).toHaveBeenCalledWith(
        testUserName
      );
    });

    it('should return 401 for invalid credentials', async () => {
      // Setup repository mock behavior
      authRepositoryMock.findByUsername.mockResolvedValue(testUser);

      // Override bcrypt compare for this test
      jest.spyOn(bcryptjs, 'compare').mockResolvedValueOnce(false);

      // Test the endpoint with wrong password
      const response = await request(app).post('/api/auth/login').send({
        username: testUserName,
        password: 'wrongpassword',
      });

      // Verify response
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Invalid credentials');
    });

    it('should return 401 for non-existent user', async () => {
      // Setup repository mock behavior
      authRepositoryMock.findByUsername.mockResolvedValue(null);

      // Test the endpoint with non-existent user
      const response = await request(app).post('/api/auth/login').send({
        username: 'nonexistentuser',
        password: 'anypassword',
      });

      // Verify response
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Invalid credentials');
    });
  });
});
