import request from 'supertest';

beforeEach(() => {
  // Reset mocks before each test using global instances
  global.mockAuthService.mockReset();
  global.mockActorService.mockReset();
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
      global.mockAuthService.createUser.mockResolvedValue(mockUser);

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
      expect(global.mockAuthService.createUser).toHaveBeenCalledWith(
        'testuser',
        'password123',
        'test@example.com'
      );
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login a user', async () => {
      const mockToken = { token: 'mock-jwt-token' };
      global.mockAuthService.login.mockResolvedValue(mockToken);

      const response = await global
        .request(global.testApp)
        .post('/api/auth/login')
        .send({
          username: 'testuser',
          password: 'password123',
        })
        .expect(200);

      expect(response.body).toEqual(mockToken);
      expect(global.mockAuthService.login).toHaveBeenCalledWith(
        'testuser',
        'password123'
      );
    });
  });
});
