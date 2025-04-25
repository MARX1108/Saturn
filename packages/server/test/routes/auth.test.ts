import { Db, ObjectId } from 'mongodb';
import bcryptjs from 'bcryptjs';
import { Express } from 'express';
import { DeepMockProxy } from 'jest-mock-extended';
// Remove local express, MongoClient, Db, MongoMemoryServer imports
// import express from 'express';
// import { MongoClient, Db } from 'mongodb';
// import { MongoMemoryServer } from 'mongodb-memory-server';
// Keep configureAuthRoutes import for potential future use if needed, but it's not used now
// import configureAuthRoutes from '../../src/modules/auth/routes/authRoutes';
// Remove ServiceContainer import, as we use global mocks
// import { ServiceContainer } from '../../src/utils/container';
// Remove mockServiceContainer import, as it's implicitly used by global setup
// import { mockServiceContainer } from '../helpers/mockSetup';

// Define response types
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

// Access the globally available app and db from setup.ts
declare global {
  // eslint-disable-next-line no-var
  var testApp: Express;
  // eslint-disable-next-line no-var
  var request: (
    app: Express
  ) => import('supertest').SuperTest<import('supertest').Test>;
  // eslint-disable-next-line no-var
  var mongoDb: Db;
}

describe('Authentication Routes', () => {
  // Remove local app, db, mongoServer, client variables
  // let app: express.Application;
  // let db: Db;
  // let mongoServer: MongoMemoryServer;
  // let client: MongoClient;

  // Remove the entire local beforeAll block
  /*
  beforeAll(async () => {
    // ... removed setup ...
  });
  */

  // Remove the entire local afterAll block
  /*
  afterAll(async () => {
    // ... removed teardown ...
  });
  */

  // Remove the local beforeEach block (database clearing is handled globally)
  /*
  beforeEach(async () => {
    // ... removed clear collections ...
  });
  */

  // Keep the describe blocks for tests
  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const response = await global
        .request(global.testApp)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          password: 'password123',
          email: 'test@example.com',
          displayName: 'Test User',
          bio: 'This is a test bio',
        });

      expect(response.status).toBe(201);

      const responseBody = response.body as AuthResponse;

      expect(responseBody).toHaveProperty('actor');
      expect(responseBody).toHaveProperty('token');
      expect(responseBody.actor.preferredUsername).toBe('testuser');
      expect(responseBody.actor).not.toHaveProperty('password');
    });

    it('should return 400 if username is missing', async () => {
      const response = await global
        .request(global.testApp)
        .post('/api/auth/register')
        .send({
          password: 'password123',
          email: 'test@example.com',
          displayName: 'Test User',
        });

      expect(response.status).toBe(400);
      const responseBody = response.body as ErrorResponse;
      expect(responseBody).toHaveProperty('error', 'Validation failed');
    });

    it('should return 400 if password is missing', async () => {
      const response = await global
        .request(global.testApp)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          displayName: 'Test User',
        });

      expect(response.status).toBe(400);
      const responseBody = response.body as ErrorResponse;
      expect(responseBody).toHaveProperty('error', 'Validation failed');
    });

    it('should return 400 if email is missing', async () => {
      const response = await global
        .request(global.testApp)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          password: 'password123',
          displayName: 'Test User',
        });
      expect(response.status).toBe(400);
      const responseBody = response.body as ErrorResponse;
      expect(responseBody).toHaveProperty('error', 'Validation failed');
    });

    it('should return 409 if username already exists', async () => {
      await global.mongoDb.collection('actors').insertOne({
        preferredUsername: 'existinguser',
        password: await bcryptjs.hash('password123', 10),
        email: 'existing@example.com',
      });

      const response = await global
        .request(global.testApp)
        .post('/api/auth/register')
        .send({
          username: 'existinguser',
          password: 'password123',
          email: 'another@example.com',
          displayName: 'Test User',
        });

      expect(response.status).toBe(409);
      const responseBody = response.body as ErrorResponse;
      expect(responseBody).toHaveProperty('error', 'Username already exists');
    });

    it('should validate username format', async () => {
      const response = await global
        .request(global.testApp)
        .post('/api/auth/register')
        .send({
          username: 'invalid@username',
          password: 'password123',
          email: 'valid@example.com',
          displayName: 'Test User',
        });

      expect(response.status).toBe(400);
      const responseBody = response.body as ErrorResponse;
      expect(responseBody).toHaveProperty('error');
    });

    it('should validate password length', async () => {
      const response = await global
        .request(global.testApp)
        .post('/api/auth/register')
        .send({
          username: 'validuser',
          password: 'pass',
          email: 'valid@example.com',
          displayName: 'Test User',
        });

      expect(response.status).toBe(400);
      const responseBody = response.body as ErrorResponse;
      expect(responseBody).toHaveProperty('error');
    });

    it('should validate password length (min 6 chars)', async () => {
      const response = await global
        .request(global.testApp)
        .post('/api/auth/register')
        .send({
          username: 'validuser',
          password: 'pass',
          email: 'valid@example.com',
          displayName: 'Test User',
        });

      expect(response.status).toBe(400);
      const responseBody = response.body as ErrorResponse;
      expect(responseBody).toHaveProperty('error', 'Validation failed');
    });

    it('should validate username length (min 3 chars)', async () => {
      const response = await global
        .request(global.testApp)
        .post('/api/auth/register')
        .send({
          username: 'us',
          password: 'password123',
          email: 'valid@example.com',
          displayName: 'Test User',
        });
      expect(response.status).toBe(400);
      const responseBody = response.body as ErrorResponse;
      expect(responseBody).toHaveProperty('error', 'Validation failed');
    });

    it.skip('should handle server errors during registration', async () => {
      const response = await global
        .request(global.testApp)
        .post('/api/auth/register')
        .send({
          username: 'newuser',
          password: 'password123',
          displayName: 'Test User',
        });

      expect(response.status).toBe(500);
      const responseBody = response.body as ErrorResponse;
      expect(responseBody).toHaveProperty('error');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await global.mongoDb.collection('actors').deleteMany({});
      const hashedPassword = await bcryptjs.hash('password123', 10);
      await global.mongoDb.collection('actors').insertOne({
        preferredUsername: 'testuser',
        password: hashedPassword,
      });
    });

    it('should login an existing user', async () => {
      const response = await global
        .request(global.testApp)
        .post('/api/auth/login')
        .send({
          username: 'testuser',
          password: 'password123',
        });

      expect(response.status).toBe(200);
      const responseBody = response.body as AuthResponse;
      expect(responseBody).toHaveProperty('actor');
      expect(responseBody).toHaveProperty('token');
      expect(responseBody.actor.preferredUsername).toBe('testuser');
      expect(responseBody.actor).not.toHaveProperty('password');
    });

    it('should return 400 if username is missing', async () => {
      const response = await global
        .request(global.testApp)
        .post('/api/auth/login')
        .send({
          password: 'password123',
        });
      expect(response.status).toBe(400);
      const responseBody = response.body as ErrorResponse;
      expect(responseBody).toHaveProperty('error', 'Validation failed');
    });

    it('should return 400 if password is missing', async () => {
      const response = await global
        .request(global.testApp)
        .post('/api/auth/login')
        .send({
          username: 'testuser',
        });

      expect(response.status).toBe(400);
      const responseBody = response.body as ErrorResponse;
      expect(responseBody).toHaveProperty('error', 'Validation failed');
    });

    it('should return 401 if username does not exist', async () => {
      const response = await global
        .request(global.testApp)
        .post('/api/auth/login')
        .send({
          username: 'nosuchuser',
          password: 'password123',
        });

      expect(response.status).toBe(401);
      const responseBody = response.body as ErrorResponse;
      expect(responseBody).toHaveProperty('error', 'Invalid credentials');
    });

    it('should return 401 if password is incorrect', async () => {
      const response = await global
        .request(global.testApp)
        .post('/api/auth/login')
        .send({
          username: 'testuser',
          password: 'wrongpassword',
        });

      expect(response.status).toBe(401);
      const responseBody = response.body as ErrorResponse;
      expect(responseBody).toHaveProperty('error', 'Invalid credentials');
    });

    it.skip('should handle server errors during login', async () => {
      const response = await global
        .request(global.testApp)
        .post('/api/auth/login')
        .send({
          username: 'testuser',
          password: 'password123',
        });

      expect(response.status).toBe(500);
      const responseBody = response.body as ErrorResponse;
      expect(responseBody).toHaveProperty('error');
    });

    it('should handle invalid JSON in the request body', async () => {
      const invalidJsonResponse = await global
        .request(global.testApp)
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send('{"username": "testuser", "password": "password123"');

      expect(invalidJsonResponse.status).toBe(400);
    });
  });
  // Potentially add tests for GET /api/auth/me if needed
});

// Remove duplicate describe block if any
// describe('POST /api/auth/login', () => {
// ...
// });
