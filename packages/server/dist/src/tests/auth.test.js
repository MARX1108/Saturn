'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
const supertest_1 = __importDefault(require('supertest'));
const express_1 = __importDefault(require('express'));
const mongodb_1 = require('mongodb');
const mongodb_memory_server_1 = require('mongodb-memory-server');
const authRoutes_1 = __importDefault(
  require('../modules/auth/routes/authRoutes')
);
const bcryptjs_1 = __importDefault(require('bcryptjs')); // Replace bcrypt with bcryptjs
const jsonwebtoken_1 = __importDefault(require('jsonwebtoken'));
describe('Authentication Routes', () => {
  let app;
  let db;
  let mongoServer;
  let client;
  beforeAll(async () => {
    // Set up in-memory MongoDB for testing
    mongoServer = await mongodb_memory_server_1.MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    client = new mongodb_1.MongoClient(uri);
    await client.connect();
    db = client.db();
    // Set up Express app
    app = (0, express_1.default)();
    app.use(express_1.default.json());
    // Configure JWT secret for testing
    process.env.JWT_SECRET = 'test-secret-key';
    // Mock services
    const serviceContainer = {
      authService: {},
      actorService: {},
      postService: {},
      uploadService: {},
      commentService: {},
      notificationService: {},
      webfingerService: {},
    };
    // Configure routes
    app.use('/', (0, authRoutes_1.default)(serviceContainer));
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
      const response = await (0, supertest_1.default)(app)
        .post('/api/auth/register')
        .send({
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
      const response = await (0, supertest_1.default)(app)
        .post('/api/auth/register')
        .send({
          password: 'password123',
          displayName: 'Test User',
        });
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
    it('should return 400 if password is missing', async () => {
      const response = await (0, supertest_1.default)(app)
        .post('/api/auth/register')
        .send({
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
        password: await bcryptjs_1.default.hash('password123', 10),
        name: 'Existing User',
      });
      // Try to create another user with the same username
      const response = await (0, supertest_1.default)(app)
        .post('/api/auth/register')
        .send({
          username: 'existinguser',
          password: 'password123',
          displayName: 'Test User',
        });
      expect(response.status).toBe(409);
      expect(response.body).toHaveProperty('error');
    });
    it('should validate username format', async () => {
      const response = await (0, supertest_1.default)(app)
        .post('/api/auth/register')
        .send({
          username: 'invalid@username',
          password: 'password123',
          displayName: 'Test User',
        });
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Username can only contain');
    });
    it('should validate password length', async () => {
      const response = await (0, supertest_1.default)(app)
        .post('/api/auth/register')
        .send({
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
      const response = await (0, supertest_1.default)(app)
        .post('/api/auth/register')
        .send({
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
      const hashedPassword = await bcryptjs_1.default.hash('password123', 10);
      await db.collection('actors').insertOne({
        preferredUsername: 'testuser',
        password: hashedPassword,
        name: 'Test User',
        summary: 'Test bio',
      });
    });
    it('should login an existing user', async () => {
      const response = await (0, supertest_1.default)(app)
        .post('/api/auth/login')
        .send({
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
      const response = await (0, supertest_1.default)(app)
        .post('/api/auth/login')
        .send({
          password: 'password123',
        });
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
    it('should return 400 if password is missing', async () => {
      const response = await (0, supertest_1.default)(app)
        .post('/api/auth/login')
        .send({
          username: 'testuser',
        });
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
    it('should return 401 if username does not exist', async () => {
      const response = await (0, supertest_1.default)(app)
        .post('/api/auth/login')
        .send({
          username: 'nonexistentuser',
          password: 'password123',
        });
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });
    it('should return 401 if password is incorrect', async () => {
      const response = await (0, supertest_1.default)(app)
        .post('/api/auth/login')
        .send({
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
      const response = await (0, supertest_1.default)(app)
        .post('/api/auth/login')
        .send({
          username: 'testuser',
          password: 'password123',
        });
      // Restore original function
      db.collection('actors').findOne = originalFindOne;
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
    });
    it('should handle invalid JSON in the request body', async () => {
      const invalidJsonResponse = await (0, supertest_1.default)(app)
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send('{"username": "testuser", "password": "password123"'); // Malformed JSON
      expect(invalidJsonResponse.status).toBe(400);
    });
  });
  describe('GET /api/auth/me', () => {
    let token;
    beforeEach(async () => {
      // Create a test user
      const hashedPassword = await bcryptjs_1.default.hash('password123', 10);
      const user = await db.collection('actors').insertOne({
        preferredUsername: 'testuser',
        password: hashedPassword,
        name: 'Test User',
        summary: 'Test bio',
      });
      // Generate a token
      token = jsonwebtoken_1.default.sign(
        { id: user.insertedId.toString(), username: 'testuser' },
        process.env.JWT_SECRET
      );
    });
    it('should get the current user profile', async () => {
      const response = await (0, supertest_1.default)(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('preferredUsername', 'testuser');
      expect(response.body).toHaveProperty('name', 'Test User');
      expect(response.body).not.toHaveProperty('password');
    });
    it('should return 401 if no token is provided', async () => {
      const response = await (0, supertest_1.default)(app).get('/api/auth/me');
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });
    it('should return 401 if token is invalid', async () => {
      const response = await (0, supertest_1.default)(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalidtoken');
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });
    it('should handle malformed tokens', async () => {
      const response = await (0, supertest_1.default)(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer malformed.token.structure`);
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });
    it('should handle expired tokens', async () => {
      // Create an expired token (issued 2 hours ago, expires in 1 hour)
      const expiredToken = jsonwebtoken_1.default.sign(
        { id: 'someid', username: 'testuser' },
        process.env.JWT_SECRET,
        { expiresIn: '-1h' }
      );
      const response = await (0, supertest_1.default)(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${expiredToken}`);
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });
    it('should handle server errors during profile fetch', async () => {
      // Create a valid token
      const validToken = jsonwebtoken_1.default.sign(
        { id: 'validid', username: 'testuser' },
        process.env.JWT_SECRET
      );
      // Force an error in the findOne method
      const originalFindOne = db.collection('actors').findOne;
      db.collection('actors').findOne = jest.fn().mockImplementationOnce(() => {
        throw new Error('Database error');
      });
      const response = await (0, supertest_1.default)(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${validToken}`);
      // Restore original function
      db.collection('actors').findOne = originalFindOne;
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
    });
  });
});
