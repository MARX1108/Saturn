import {
  mockActorService,
  mockUploadService,
  mockPostService,
} from '../helpers/testApp';
import { tmpdir } from 'os';
import { join } from 'path';
import { mkdir, rm } from 'fs/promises';
import { existsSync } from 'fs';

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

  describe('GET /api/actors/search', () => {
    it('should search actors', async () => {
      const mockActors = [
        { id: '1', name: 'Actor 1' },
        { id: '2', name: 'Actor 2' },
      ];
      mockActorService.searchActors.mockResolvedValue(mockActors);

      const response = await global
        .request(global.testApp)
        .get('/api/actors/search')
        .query({ q: 'test' })
        .expect(200);

      expect(response.body).toEqual(mockActors);
      expect(mockActorService.searchActors).toHaveBeenCalled();
    });
  });

  describe('GET /api/actors/:username', () => {
    it('should return an actor by username', async () => {
      const mockActor = { id: '1', username: 'testactor' };
      mockActorService.getActorByUsername.mockResolvedValue(mockActor);

      const response = await global
        .request(global.testApp)
        .get('/api/actors/testactor')
        .expect(200);

      expect(response.body).toEqual(mockActor);
      expect(mockActorService.getActorByUsername).toHaveBeenCalledWith(
        'testactor'
      );
    });

    it('should return 404 if actor not found', async () => {
      mockActorService.getActorByUsername.mockResolvedValue(null);

      await global
        .request(global.testApp)
        .get('/api/actors/nonexistent')
        .expect(404);
    });
  });
});
