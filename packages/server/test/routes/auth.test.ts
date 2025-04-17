import { AuthService } from '../../src/modules/auth/services/authService';
import { ActorService } from '../../src/modules/actors/services/actorService';
import { mock } from 'jest-mock-extended';

// Mock the services
const mockAuthService = mock<AuthService>();
const mockActorService = mock<ActorService>();

// Setup and cleanup
beforeAll(() => {
  // Configure the test app with the mock services
  global.testApp.use((req, res, next) => {
    req.services = {
      authService: mockAuthService,
      actorService: mockActorService,
    };
    next();
  });
});

beforeEach(() => {
  // Reset mocks before each test
  mockAuthService.mockReset();
  mockActorService.mockReset();
});

describe('Auth Routes', () => {
  describe('TEMP DEBUG: Basic Ping Test', () => {
    it('should reach basic ping route', async () => {
      const response = await global
        .request(global.testApp)
        .get('/test-ping')
        .expect(200);
      expect(response.text).toBe('pong');
    });
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const mockUser = {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
      };
      mockAuthService.register.mockResolvedValue(mockUser);

      const response = await global
        .request(global.testApp)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123',
        })
        .expect(201);

      expect(response.body).toEqual(mockUser);
      expect(mockAuthService.register).toHaveBeenCalledWith({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login a user', async () => {
      const mockToken = 'mock-jwt-token';
      mockAuthService.login.mockResolvedValue(mockToken);

      const response = await global
        .request(global.testApp)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        })
        .expect(200);

      expect(response.body).toEqual({ token: mockToken });
      expect(mockAuthService.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });
});
