import { ActorService } from '../../src/modules/actors/services/actorService';
import configureActorRoutes from '../../src/modules/actors/routes/actorRoutes';
import { mock } from 'jest-mock-extended';
import { tmpdir } from 'os';
import { join } from 'path';
import { mkdir, rm } from 'fs/promises';
import { existsSync } from 'fs';
import { UploadService } from '../../src/modules/media/services/uploadService';
import { PostService } from '../../src/modules/posts/services/postService';

// Mock the services
const mockActorService = mock<ActorService>();
const mockUploadService = mock<UploadService>();
const mockPostService = mock<PostService>();

// Create temporary directories for uploads
const uploadsDir = join(tmpdir(), 'saturn-test-uploads');
const avatarsDir = join(uploadsDir, 'avatars');
const headersDir = join(uploadsDir, 'headers');

// Setup and cleanup
beforeAll(async () => {
  // Create upload directories if they don't exist
  if (!existsSync(uploadsDir)) {
    await mkdir(uploadsDir, { recursive: true });
  }
  if (!existsSync(avatarsDir)) {
    await mkdir(avatarsDir, { recursive: true });
  }
  if (!existsSync(headersDir)) {
    await mkdir(headersDir, { recursive: true });
  }

  // Configure the test app with the mock services
  global.testApp.use((req, res, next) => {
    req.services = {
      actorService: mockActorService,
      uploadService: mockUploadService,
      postService: mockPostService,
    };
    next();
  });

  // Configure routes with mock services
  const serviceContainer = {
    actorService: mockActorService,
    uploadService: mockUploadService,
    postService: mockPostService,
  };
  global.testApp.use('/api/actors', configureActorRoutes(serviceContainer));
});

afterAll(async () => {
  // Clean up upload directories
  await rm(uploadsDir, { recursive: true, force: true });
});

// Tests
describe('Actor Routes', () => {
  beforeEach(() => {
    // Reset mocks before each test
    mockActorService.mockReset();
    mockUploadService.mockReset();
    mockPostService.mockReset();
  });

  describe('GET /api/actors', () => {
    it('should return a list of actors', async () => {
      const mockActors = [
        { id: '1', name: 'Actor 1' },
        { id: '2', name: 'Actor 2' },
      ];
      mockActorService.listActors.mockResolvedValue(mockActors);

      const response = await global
        .request(global.testApp)
        .get('/api/actors')
        .expect(200);

      expect(response.body).toEqual(mockActors);
      expect(mockActorService.listActors).toHaveBeenCalled();
    });
  });

  describe('GET /api/actors/:id', () => {
    it('should return an actor by id', async () => {
      const mockActor = { id: '1', name: 'Test Actor' };
      mockActorService.getActorById.mockResolvedValue(mockActor);

      const response = await global
        .request(global.testApp)
        .get('/api/actors/1')
        .expect(200);

      expect(response.body).toEqual(mockActor);
      expect(mockActorService.getActorById).toHaveBeenCalledWith('1');
    });

    it('should return 404 if actor not found', async () => {
      mockActorService.getActorById.mockResolvedValue(null);

      await global
        .request(global.testApp)
        .get('/api/actors/nonexistent')
        .expect(404);
    });
  });

  // ... rest of the test cases ...
});
