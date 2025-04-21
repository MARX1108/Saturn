import request from 'supertest';
import express from 'express';
import { MongoClient, Db } from 'mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server';
import configureAuthRoutes from '../modules/auth/routes/authRoutes';
import bcryptjs from 'bcryptjs'; // Replace bcrypt with bcryptjs
import jwt from 'jsonwebtoken';
import { ServiceContainer } from '../utils/container';
import { mockServiceContainer } from '../../test/helpers/mockSetup';

describe('Authentication Routes', () => {
  let app: express.Application;
  let db: Db;
  let mongoServer: MongoMemoryServer;
  let client: MongoClient;

  beforeAll(async () => {
    // Set up in-memory MongoDB for testing
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    client = new MongoClient(uri);
    await client.connect();
    db = client.db();

    // Set up Express app
    app = express();
    app.use(express.json());

    // Configure JWT secret for testing
    process.env.JWT_SECRET = 'test-secret-key';
    const jwtSecret = process.env.JWT_SECRET!; // Define for use in tests

    // Use the imported mockServiceContainer directly
    // const serviceContainer: ServiceContainer = {
    //   authService: {} as any,
    //   actorService: {} as any,
    //   postService: {} as any,
    //   uploadService: {} as any,
    //   commentService: {} as any,
    //   notificationService: {} as any,
    //   webfingerService: {} as any,
    // };

    // Configure routes, passing the full mock container
    app.use('/', configureAuthRoutes(mockServiceContainer));
  });

  afterAll(async () => {
    await client.close();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    // Clear collections before each test
    await db.collection('actors').deleteMany({});
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const response = await request(app).post('/api/auth/register').send({
        username: 'testuser',
        password: 'password123',
        displayName: 'Test User',
        bio: 'This is a test bio',
      });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('actor');
      expect(response.body).toHaveProperty('token');
      expect(response.body.actor.preferredUsername).toBe('testuser');
      expect(response.body.actor.name).toBe('Test User');
      expect(response.body.actor.summary).toBe('This is a test bio');
      expect(response.body.actor).not.toHaveProperty('password');
    });

    it('should return 400 if username is missing', async () => {
      const response = await request(app).post('/api/auth/register').send({
        password: 'password123',
        displayName: 'Test User',
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 if password is missing', async () => {
      const response = await request(app).post('/api/auth/register').send({
        username: 'testuser',
        displayName: 'Test User',
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 409 if username already exists', async () => {
      // First create a user
      await db.collection('actors').insertOne({
        preferredUsername: 'existinguser',
        password: await bcryptjs.hash('password123', 10),
        name: 'Existing User',
      });

      // Try to create another user with the same username
      const response = await request(app).post('/api/auth/register').send({
        username: 'existinguser',
        password: 'password123',
        displayName: 'Test User',
      });

      expect(response.status).toBe(409);
      expect(response.body).toHaveProperty('error');
    });

    it('should validate username format', async () => {
      const response = await request(app).post('/api/auth/register').send({
        username: 'invalid@username',
        password: 'password123',
        displayName: 'Test User',
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Username can only contain');
    });

    it('should validate password length', async () => {
      const response = await request(app).post('/api/auth/register').send({
        username: 'validuser',
        password: 'pass', // Too short
        displayName: 'Test User',
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Password must be');
    });

    it('should handle server errors during registration', async () => {
      // Temporarily force an error by messing with the db reference
      const originalCollection = db.collection;
      db.collection = jest.fn().mockImplementationOnce(() => {
        throw new Error('Database error');
      });

      const response = await request(app).post('/api/auth/register').send({
        username: 'newuser',
        password: 'password123',
        displayName: 'Test User',
      });

      // Restore original function
      db.collection = originalCollection;

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create a test user for login tests
      const hashedPassword = await bcryptjs.hash('password123', 10);
      await db.collection('actors').insertOne({
        preferredUsername: 'testuser',
        password: hashedPassword,
        name: 'Test User',
        summary: 'Test bio',
      });
    });

    it('should login an existing user', async () => {
      const response = await request(app).post('/api/auth/login').send({
        username: 'testuser',
        password: 'password123',
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('actor');
      expect(response.body).toHaveProperty('token');
      expect(response.body.actor.preferredUsername).toBe('testuser');
      expect(response.body.actor).not.toHaveProperty('password');
    });

    it('should return 400 if username is missing', async () => {
      const response = await request(app).post('/api/auth/login').send({
        password: 'password123',
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 if password is missing', async () => {
      const response = await request(app).post('/api/auth/login').send({
        username: 'testuser',
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 401 if username does not exist', async () => {
      const response = await request(app).post('/api/auth/login').send({
        username: 'nonexistentuser',
        password: 'password123',
      });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 401 if password is incorrect', async () => {
      const response = await request(app).post('/api/auth/login').send({
        username: 'testuser',
        password: 'wrongpassword',
      });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('should handle server errors during login', async () => {
      // Temporarily force an error
      const originalFindOne = db.collection('actors').findOne;
      db.collection('actors').findOne = jest.fn().mockImplementationOnce(() => {
        throw new Error('Database error');
      });

      const response = await request(app).post('/api/auth/login').send({
        username: 'testuser',
        password: 'password123',
      });

      // Restore original function
      db.collection('actors').findOne = originalFindOne;

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
    });

    it('should handle invalid JSON in the request body', async () => {
      const invalidJsonResponse = await request(app)
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send('{"username": "testuser", "password": "password123"'); // Malformed JSON

      expect(invalidJsonResponse.status).toBe(400);
    });
  });

  describe('GET /api/auth/me', () => {
    let testUserId: string;
    let testUserToken: string;

    beforeEach(async () => {
      // Create a user to get a token for
      const user = await db.collection('actors').insertOne({
        preferredUsername: 'metestuser',
        password: await bcryptjs.hash('password123', 10),
        name: 'Me User',
      });
      testUserId = user.insertedId.toString();
      const jwtSecret = process.env.JWT_SECRET!;
      testUserToken = jwt.sign(
        { id: testUserId, username: 'metestuser' },
        jwtSecret
      );
    });

    it('should return the current user if authenticated', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${testUserToken}`);

      // Add middleware mock for req.user as configureAuthRoutes doesn't add it
      // This is a bit hacky, ideally middleware testing is separate
      app.use((req: any, res, next) => {
        if (req.headers.authorization)
          req.user = { id: testUserId, username: 'metestuser' };
        next();
      });

      expect(response.status).toBe(200);
      // The actual response depends on what AuthController.getCurrentUser sends
      // Assuming it sends req.user directly based on previous files
      expect(response.body).toHaveProperty('id', testUserId);
      expect(response.body).toHaveProperty('username', 'metestuser');
    });

    it('should return 401 if not authenticated', async () => {
      const response = await request(app).get('/api/auth/me');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 401 if token is invalid', async () => {
      const invalidToken = jwt.sign({ id: testUserId }, 'invalid-secret');
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${invalidToken}`);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 401 if token is expired', async () => {
      const jwtSecret = process.env.JWT_SECRET!;
      const expiredToken = jwt.sign(
        { id: testUserId, username: 'metestuser' },
        jwtSecret,
        { expiresIn: '-1s' } // Expired 1 second ago
      );
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${expiredToken}`);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });
  });
});
