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
const path_1 = __importDefault(require('path'));
const fs_1 = __importDefault(require('fs'));
const jsonwebtoken_1 = __importDefault(require('jsonwebtoken'));
const actorService_1 = require('../services/actorService');
const configureTestActorRoutes_1 = require('./helpers/configureTestActorRoutes');
describe('Actors Routes', () => {
  let app;
  let db;
  let mongoServer;
  let client;
  let testUserToken;
  let actorService;
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
    // Set app locals
    app.locals.db = db;
    app.locals.domain = 'test.domain';
    // Create uploads directory for tests
    const uploadsDir = path_1.default.join(process.cwd(), 'uploads');
    const publicAvatarsDir = path_1.default.join(
      process.cwd(),
      'public',
      'avatars'
    );
    fs_1.default.mkdirSync(uploadsDir, { recursive: true });
    fs_1.default.mkdirSync(publicAvatarsDir, { recursive: true });
    // Configure JWT secret for testing
    process.env.JWT_SECRET = 'test-secret-key';
    // Create actor service
    actorService = new actorService_1.ActorService(db, 'test.domain');
    // Setup authentication middleware
    app.use((req, res, next) => {
      req.actorService = actorService;
      const authHeader = req.headers.authorization;
      if (authHeader) {
        const token = authHeader.split(' ')[1];
        try {
          const decoded = jsonwebtoken_1.default.verify(
            token,
            process.env.JWT_SECRET
          );
          req.user = decoded;
        } catch (_error) {
          // Just continue without setting user
        }
      }
      next();
    });
    // Use our corrected test routes
    app.use(
      '/api',
      (0, configureTestActorRoutes_1.configureTestActorRoutes)(
        db,
        'test.domain'
      )
    );
  });
  afterAll(async () => {
    await client.close();
    await mongoServer.stop();
  });
  beforeEach(async () => {
    // Clear collections before each test
    await db.collection('actors').deleteMany({});
    // Create a test user
    const user = await db.collection('actors').insertOne({
      preferredUsername: 'testuser',
      name: 'Test User',
      summary: 'Test bio',
      type: 'Person',
      inbox: 'https://test.domain/users/testuser/inbox',
      outbox: 'https://test.domain/users/testuser/outbox',
    });
    // Generate a token for secured endpoints
    testUserToken = jsonwebtoken_1.default.sign(
      { id: user.insertedId.toString(), username: 'testuser' },
      process.env.JWT_SECRET
    );
  });
  describe('POST /api/actors', () => {
    it('should create a new actor', async () => {
      const response = await (0, supertest_1.default)(app)
        .post('/api/actors')
        .field('username', 'newuser')
        .field('displayName', 'New User')
        .field('bio', 'This is a new user');
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('preferredUsername', 'newuser');
      expect(response.body).toHaveProperty('name', 'New User');
      expect(response.body).toHaveProperty('summary', 'This is a new user');
    });
    it('should return 400 if username is missing', async () => {
      const response = await (0, supertest_1.default)(app)
        .post('/api/actors')
        .field('displayName', 'New User')
        .field('bio', 'This is a new user');
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
    it('should return 409 if username already exists', async () => {
      const response = await (0, supertest_1.default)(app)
        .post('/api/actors')
        .field('username', 'testuser')
        .field('displayName', 'Duplicate User')
        .field('bio', 'This should fail');
      expect(response.status).toBe(409);
      expect(response.body).toHaveProperty('error');
    });
    it('should validate username format', async () => {
      const response = await (0, supertest_1.default)(app)
        .post('/api/actors')
        .field('username', 'invalid@username')
        .field('displayName', 'Invalid User')
        .field('bio', 'This should fail due to invalid username');
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Username can only contain');
    });
    it('should handle file upload with valid image', async () => {
      // Create a test image
      const imageBuffer = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
        'base64'
      );
      const imagePath = path_1.default.join(process.cwd(), 'test-image.png');
      fs_1.default.writeFileSync(imagePath, imageBuffer);
      const response = await (0, supertest_1.default)(app)
        .post('/api/actors')
        .field('username', 'imageuser')
        .field('displayName', 'User With Image')
        .field('bio', 'This user has an avatar')
        .attach('avatarFile', imagePath);
      // Clean up
      fs_1.default.unlinkSync(imagePath);
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('icon');
      expect(response.body.icon).toHaveProperty('url');
      expect(response.body.icon.url).toContain('avatars/imageuser-');
    });
    it('should reject non-image file uploads', async () => {
      // Create a test text file
      const textPath = path_1.default.join(process.cwd(), 'test-file.txt');
      fs_1.default.writeFileSync(textPath, 'This is not an image');
      const response = await (0, supertest_1.default)(app)
        .post('/api/actors')
        .field('username', 'fileuser')
        .field('displayName', 'User With File')
        .field('bio', 'This should fail')
        .attach('avatarFile', textPath);
      // Clean up
      fs_1.default.unlinkSync(textPath);
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Only image files');
    });
    it('should handle server errors during actor creation', async () => {
      // Temporarily mock actorService to throw an error
      const originalInsertOne = db.collection('actors').insertOne;
      db.collection('actors').insertOne = jest
        .fn()
        .mockImplementationOnce(() => {
          throw new Error('Database error');
        });
      const response = await (0, supertest_1.default)(app)
        .post('/api/actors')
        .field('username', 'erroruser')
        .field('displayName', 'Error User')
        .field('bio', 'This should cause a server error');
      // Restore original function
      db.collection('actors').insertOne = originalInsertOne;
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
    });
  });
  describe('GET /api/actors/:username', () => {
    it('should get actor by username', async () => {
      const response = await (0, supertest_1.default)(app).get(
        '/api/actors/testuser'
      );
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('preferredUsername', 'testuser');
      expect(response.body).toHaveProperty('name', 'Test User');
      expect(response.body).toHaveProperty('summary', 'Test bio');
    });
    it('should return 404 if actor not found', async () => {
      const response = await (0, supertest_1.default)(app).get(
        '/api/actors/nonexistentuser'
      );
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });
    it('should handle server errors during actor retrieval', async () => {
      // Force an error
      const originalFindOne = db.collection('actors').findOne;
      db.collection('actors').findOne = jest.fn().mockImplementationOnce(() => {
        throw new Error('Database error');
      });
      const response = await (0, supertest_1.default)(app).get(
        '/api/actors/testuser'
      );
      // Restore original function
      db.collection('actors').findOne = originalFindOne;
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
    });
  });
  describe('PUT /api/actors/:username', () => {
    it('should update an existing actor', async () => {
      const response = await (0, supertest_1.default)(app)
        .put('/api/actors/testuser')
        .set('Authorization', `Bearer ${testUserToken}`)
        .field('displayName', 'Updated User')
        .field('bio', 'This is an updated bio');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('name', 'Updated User');
      expect(response.body).toHaveProperty('summary', 'This is an updated bio');
    });
    it('should return 401 if not authenticated', async () => {
      const response = await (0, supertest_1.default)(app)
        .put('/api/actors/testuser')
        .field('displayName', 'Unauthorized Update')
        .field('bio', 'This should fail');
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });
    it('should return 404 if actor not found', async () => {
      const response = await (0, supertest_1.default)(app)
        .put('/api/actors/nonexistentuser')
        .set('Authorization', `Bearer ${testUserToken}`)
        .field('displayName', 'Not Found User')
        .field('bio', 'This should fail');
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });
    it('should handle file upload during update', async () => {
      // Create a test image
      const imageBuffer = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
        'base64'
      );
      const imagePath = path_1.default.join(process.cwd(), 'update-image.png');
      fs_1.default.writeFileSync(imagePath, imageBuffer);
      const response = await (0, supertest_1.default)(app)
        .put('/api/actors/testuser')
        .set('Authorization', `Bearer ${testUserToken}`)
        .field('displayName', 'Updated With Image')
        .field('bio', 'Updated bio with new avatar')
        .attach('avatarFile', imagePath);
      // Clean up
      fs_1.default.unlinkSync(imagePath);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('icon');
      expect(response.body.icon).toHaveProperty('url');
      expect(response.body.icon.url).toContain('avatars/testuser-');
    });
    it('should handle attempted update by another user', async () => {
      // Create another user
      await db.collection('actors').insertOne({
        preferredUsername: 'anotheruser',
        name: 'Another User',
        type: 'Person',
      });
      // Create token for this new user
      const anotherUserToken = jsonwebtoken_1.default.sign(
        { id: 'wrongid', username: 'anotheruser' },
        process.env.JWT_SECRET
      );
      // Try to update first user's profile with second user's token
      const response = await (0, supertest_1.default)(app)
        .put('/api/actors/testuser')
        .set('Authorization', `Bearer ${anotherUserToken}`)
        .field('displayName', 'Unauthorized Update')
        .field('bio', 'This should fail with 403');
      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('not authorized');
    });
    it('should handle server errors during update', async () => {
      // Force an error
      const originalUpdateOne = db.collection('actors').updateOne;
      db.collection('actors').updateOne = jest
        .fn()
        .mockImplementationOnce(() => {
          throw new Error('Database error');
        });
      const response = await (0, supertest_1.default)(app)
        .put('/api/actors/testuser')
        .set('Authorization', `Bearer ${testUserToken}`)
        .field('displayName', 'Error User')
        .field('bio', 'This should trigger a server error');
      // Restore original function
      db.collection('actors').updateOne = originalUpdateOne;
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
    });
  });
  describe('DELETE /api/actors/:username', () => {
    it('should delete an existing actor', async () => {
      const response = await (0, supertest_1.default)(app)
        .delete('/api/actors/testuser')
        .set('Authorization', `Bearer ${testUserToken}`);
      expect(response.status).toBe(204);
      // Verify actor is deleted
      const getResponse = await (0, supertest_1.default)(app).get(
        '/api/actors/testuser'
      );
      expect(getResponse.status).toBe(404);
    });
    it('should return 401 if not authenticated', async () => {
      const response = await (0, supertest_1.default)(app).delete(
        '/api/actors/testuser'
      );
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });
    it('should return 404 if actor not found', async () => {
      const response = await (0, supertest_1.default)(app)
        .delete('/api/actors/nonexistentuser')
        .set('Authorization', `Bearer ${testUserToken}`);
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });
    it('should handle attempted deletion by another user', async () => {
      // Create another user
      await db.collection('actors').insertOne({
        preferredUsername: 'anotheruser',
        name: 'Another User',
        type: 'Person',
      });
      // Create token for this new user
      const anotherUserToken = jsonwebtoken_1.default.sign(
        { id: 'wrongid', username: 'anotheruser' },
        process.env.JWT_SECRET
      );
      // Try to delete first user with second user's token
      const response = await (0, supertest_1.default)(app)
        .delete('/api/actors/testuser')
        .set('Authorization', `Bearer ${anotherUserToken}`);
      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('not authorized');
    });
    it('should handle server errors during deletion', async () => {
      // Force an error
      const originalDeleteOne = db.collection('actors').deleteOne;
      db.collection('actors').deleteOne = jest
        .fn()
        .mockImplementationOnce(() => {
          throw new Error('Database error');
        });
      const response = await (0, supertest_1.default)(app)
        .delete('/api/actors/testuser')
        .set('Authorization', `Bearer ${testUserToken}`);
      // Restore original function
      db.collection('actors').deleteOne = originalDeleteOne;
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
    });
  });
  describe('GET /api/search/actors', () => {
    it('should search for actors by username', async () => {
      // Add more test users
      await db.collection('actors').insertMany([
        {
          preferredUsername: 'testuser1',
          name: 'Test User One',
          summary: 'First test user',
        },
        {
          preferredUsername: 'testuser2',
          name: 'Test User Two',
          summary: 'Second test user',
        },
        {
          preferredUsername: 'otheruser',
          name: 'Other User',
          summary: 'Different user',
        },
      ]);
      const response = await (0, supertest_1.default)(app).get(
        '/api/search/actors?q=test'
      );
      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBeGreaterThanOrEqual(3); // testuser, testuser1, testuser2
      expect(
        response.body.some(u => u.preferredUsername === 'testuser')
      ).toBeTruthy();
      expect(
        response.body.some(u => u.preferredUsername === 'testuser1')
      ).toBeTruthy();
      expect(
        response.body.some(u => u.preferredUsername === 'testuser2')
      ).toBeTruthy();
    });
    it('should return empty array for no matches', async () => {
      const response = await (0, supertest_1.default)(app).get(
        '/api/search/actors?q=nonexistent'
      );
      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBe(0);
    });
    it('should handle server errors during search', async () => {
      // Force an error
      const originalFind = db.collection('actors').find;
      db.collection('actors').find = jest.fn().mockImplementationOnce(() => {
        throw new Error('Database error');
      });
      const response = await (0, supertest_1.default)(app).get(
        '/api/search/actors?q=test'
      );
      // Restore original function
      db.collection('actors').find = originalFind;
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
    });
  });
});
