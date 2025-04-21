import request from 'supertest';
import express from 'express';
import { MongoClient, Db, ObjectId, WithId } from 'mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server';
import path from 'path';
import fs from 'fs';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { ActorService } from '@/modules/actors/services/actorService';
import { ActorRepository } from '@/modules/actors/repositories/actorRepository';
import { Actor } from '@/modules/actors/models/actor';
import { configureTestActorRoutes } from '@test/helpers/configureTestActorRoutes';

declare global {
  namespace Express {
    interface Request {
      actorService?: ActorService;
      user?: WithId<Actor> | undefined;
    }
  }
}

const jwtSecret = process.env.JWT_SECRET || 'test-secret-key';

describe('Actors Routes', () => {
  let app: express.Application;
  let db: Db;
  let mongoServer: MongoMemoryServer;
  let client: MongoClient;
  let testUserToken: string;
  let testUser: WithId<Actor>;
  let actorService: ActorService;
  let actorRepository: ActorRepository;
  const testDomain = 'test.domain';

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    client = new MongoClient(uri);
    await client.connect();
    db = client.db();

    app = express();
    app.use(express.json());

    app.locals.db = db;
    app.locals.domain = testDomain;

    const uploadsDir = path.join(process.cwd(), 'uploads');
    const publicAvatarsDir = path.join(process.cwd(), 'public', 'avatars');
    fs.mkdirSync(uploadsDir, { recursive: true });
    fs.mkdirSync(publicAvatarsDir, { recursive: true });

    process.env.JWT_SECRET = jwtSecret;

    actorRepository = new ActorRepository(db);
    actorService = new ActorService(actorRepository, testDomain);

    app.use((req, res, next) => {
      req.actorService = actorService;
      const authHeader = req.headers.authorization;
      if (authHeader) {
        const token = authHeader.split(' ')[1];
        try {
          const decoded = jwt.verify(token, jwtSecret) as JwtPayload;
          if (decoded && typeof decoded === 'object' && decoded.id) {
            actorRepository
              .findById(decoded.id)
              .then(user => {
                req.user = user || undefined;
                next();
              })
              .catch(() => {
                req.user = undefined;
                next();
              });
            return;
          } else {
            req.user = undefined;
          }
        } catch (_error) {
          req.user = undefined;
        }
      }
      next();
    });

    app.use('/api/actors', configureTestActorRoutes(actorService));

    app.get('/api/test-auth', (req, res) => {
      if (req.user) {
        res.json({ userId: req.user._id });
      } else {
        res.status(401).json({ error: 'Unauthorized' });
      }
    });
  });

  afterAll(async () => {
    await client.close();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await db.collection('actors').deleteMany({});

    testUser = await actorService.createLocalActor({
      username: 'testuser@test.domain',
      preferredUsername: 'testuser',
      name: 'Test User',
      summary: 'Test summary',
      publicKey: 'test-public-key',
      privateKey: 'test-private-key',
    });

    testUserToken = jwt.sign(
      { id: testUser._id.toString(), username: testUser.username },
      jwtSecret
    );
  });

  describe('GET /api/actors/:username', () => {
    it('should return actor profile for existing user', async () => {
      const response = await request(app).get(
        `/api/actors/${testUser.preferredUsername}`
      );
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty(
        'preferredUsername',
        testUser.preferredUsername
      );
      expect(response.body).toHaveProperty('name', testUser.name);
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app).get('/api/actors/nonexistent');
      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/actors/:username', () => {
    it('should update actor profile if authenticated', async () => {
      const updates = { name: 'Updated Test User', summary: 'Updated summary' };
      const response = await request(app)
        .put(`/api/actors/${testUser.preferredUsername}`)
        .set('Authorization', `Bearer ${testUserToken}`)
        .send(updates);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('name', updates.name);
      expect(response.body).toHaveProperty('summary', updates.summary);

      const dbActor = await actorRepository.findById(testUser._id);
      expect(dbActor?.name).toBe(updates.name);
    });

    it('should return 401 if not authenticated', async () => {
      const updates = { name: 'Updated Test User' };
      const response = await request(app)
        .put(`/api/actors/${testUser.preferredUsername}`)
        .send(updates);
      expect(response.status).toBe(401);
    });

    it('should return 403 if trying to update another user', async () => {
      const otherUser = await actorService.createLocalActor({
        username: 'otheruser@test.domain',
        preferredUsername: 'otheruser',
        name: 'Other User',
        publicKey: 'key',
        privateKey: 'key',
      });

      const updates = { name: 'Malicious Update' };
      const response = await request(app)
        .put(`/api/actors/${otherUser.preferredUsername}`)
        .set('Authorization', `Bearer ${testUserToken}`)
        .send(updates);
      expect(response.status).toBe(403);
    });

    it('should handle file upload for icon update', async () => {
      const imageBuffer = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
        'base64'
      );
      const imagePath = path.join(process.cwd(), 'test-update-image.png');
      fs.writeFileSync(imagePath, imageBuffer);

      const response = await request(app)
        .put(`/api/actors/${testUser.preferredUsername}`)
        .set('Authorization', `Bearer ${testUserToken}`)
        .field('name', 'User With New Icon')
        .attach('icon', imagePath);

      fs.unlinkSync(imagePath);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('icon');
      expect(response.body.icon).toHaveProperty('url');
      expect(response.body.icon.url).toContain(
        `avatars/${testUser.preferredUsername}-`
      );

      const dbActor = await actorRepository.findById(testUser._id);
      expect(dbActor?.icon).toBeDefined();
      expect(dbActor?.icon?.url).toContain(
        `avatars/${testUser.preferredUsername}-`
      );
    });
  });
});
