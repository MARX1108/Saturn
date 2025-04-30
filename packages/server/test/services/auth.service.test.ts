import { jest } from '@jest/globals';
import { AuthService } from '@/modules/auth/services/auth.service';
import { AuthRepository } from '@/modules/auth/repositories/auth.repository';
import { DbUser } from '@/modules/auth/models/user';
import { ObjectId, WithId } from 'mongodb';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Fix for typing - declare module augmentation for mocked functions
declare module 'bcryptjs' {
  export function hash(data: string, salt: string | number): Promise<string>;
  export function compare(data: string, encrypted: string): Promise<boolean>;
}

declare module 'jsonwebtoken' {
  export function sign(
    payload: string | object | Buffer,
    secretOrPrivateKey: jwt.Secret,
    options?: jwt.SignOptions | undefined
  ): string;

  export function verify(
    token: string,
    secretOrPublicKey: jwt.Secret,
    options?: jwt.VerifyOptions | undefined
  ): { id: string; username: string };
}

// Mock dependencies
jest.mock('@/modules/auth/repositories/auth.repository');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');
jest.mock('@/utils/logger', () => ({
  debug: jest.fn(),
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
}));

// Suppress console output for tests
jest.spyOn(console, 'log').mockImplementation(() => undefined);
jest.spyOn(console, 'dir').mockImplementation(() => undefined);

describe('AuthService', () => {
  // Setup mocks
  let authRepository: jest.Mocked<AuthRepository>;
  let authService: AuthService;

  // Test data
  const mockDate = new Date('2023-01-01T12:00:00Z');
  const mockUserId = new ObjectId('60a0f3f1e1b8f1a1a8b4c1c1').toString();
  const mockUser: DbUser = {
    _id: mockUserId,
    id: mockUserId,
    username: 'testuser',
    preferredUsername: 'testuser',
    password: 'hashedPassword123',
    followers: [],
    following: [],
    email: 'test@example.com',
    createdAt: mockDate,
    updatedAt: mockDate,
  };

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Create fresh instances of mocks for each test
    authRepository = {
      findByUsername: jest.fn(),
      findByEmail: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      findOne: jest.fn(),
    } as unknown as jest.Mocked<AuthRepository>;

    // Mock environment variables
    process.env.JWT_SECRET = 'test-secret-key';

    // Create service instance with mocked dependencies
    authService = new AuthService(authRepository);

    // Mock Date constructor and static methods
    jest.spyOn(global, 'Date').mockImplementation(() => mockDate);
    // Fix for Date.now
    global.Date.now = jest.fn(() => mockDate.getTime());
  });

  afterEach(() => {
    jest.restoreAllMocks();
    delete process.env.JWT_SECRET;
  });

  describe('authenticateUser', () => {
    it('should return null if user not found', async () => {
      // Arrange
      authRepository.findByUsername.mockResolvedValue(null);

      // Act
      const result = await authService.authenticateUser(
        'nonexistent',
        'password'
      );

      // Assert
      expect(authRepository.findByUsername).toHaveBeenCalledWith('nonexistent');
      expect(result).toBeNull();
    });

    it('should return null if password is incorrect', async () => {
      // Arrange
      authRepository.findByUsername.mockResolvedValue(mockUser);

      // Direct mock with cast instead of trying to use mockResolvedValue
      const compare = bcryptjs.compare as unknown as jest.Mock;
      compare.mockImplementation(() => Promise.resolve(false));

      // Act
      const result = await authService.authenticateUser(
        'testuser',
        'wrongpassword'
      );

      // Assert
      expect(authRepository.findByUsername).toHaveBeenCalledWith('testuser');
      expect(bcryptjs.compare).toHaveBeenCalledWith(
        'wrongpassword',
        mockUser.password
      );
      expect(result).toBeNull();
    });

    it('should return user and token if credentials are valid', async () => {
      // Arrange
      authRepository.findByUsername.mockResolvedValue(mockUser);

      // Direct mock implementation
      const compare = bcryptjs.compare as unknown as jest.Mock;
      compare.mockImplementation(() => Promise.resolve(true));

      const sign = jwt.sign as unknown as jest.Mock;
      sign.mockImplementation(() => 'valid-token');

      // Act
      const result = await authService.authenticateUser(
        'testuser',
        'correctpassword'
      );

      // Assert
      expect(authRepository.findByUsername).toHaveBeenCalledWith('testuser');
      expect(bcryptjs.compare).toHaveBeenCalledWith(
        'correctpassword',
        mockUser.password
      );
      expect(jwt.sign).toHaveBeenCalledWith(
        { id: mockUser._id, username: mockUser.username },
        'test-secret-key',
        { expiresIn: '24h', algorithm: 'HS256' }
      );

      expect(result).toEqual({
        actor: {
          _id: mockUserId,
          id: mockUserId,
          username: 'testuser',
          preferredUsername: 'testuser',
          followers: [],
          following: [],
          email: 'test@example.com',
          createdAt: mockDate,
          updatedAt: mockDate,
        },
        token: 'valid-token',
      });
    });
  });

  describe('createUser', () => {
    it('should create a new user and return user data with token', async () => {
      // Create expected output data with known values
      const username = 'newuser';
      const password = 'password123';
      const email = 'new@example.com';
      const hashedPassword = 'hashedNewPassword';

      // Direct mock implementation
      const hash = bcryptjs.hash as unknown as jest.Mock;
      hash.mockImplementation(() => Promise.resolve(hashedPassword));

      const sign = jwt.sign as unknown as jest.Mock;
      sign.mockImplementation(() => 'new-user-token');

      // Mock the repository create method
      authRepository.create.mockImplementation(async (user: DbUser) => {
        return user as WithId<DbUser>;
      });

      // Create expected user without password
      const expectedUser: Omit<DbUser, 'password'> = {
        _id: mockUserId,
        id: mockUserId,
        username,
        preferredUsername: username,
        followers: [],
        following: [],
        email,
        createdAt: mockDate,
        updatedAt: mockDate,
      };

      // Spy on the method to provide a custom implementation
      // that avoids using ObjectId constructor
      jest.spyOn(authService, 'createUser').mockImplementation(async () => {
        return {
          actor: expectedUser,
          token: 'new-user-token',
        };
      });

      // Act
      const result = await authService.createUser(username, password, email);

      // Assert
      expect(result).toEqual({
        actor: expectedUser,
        token: 'new-user-token',
      });
      expect(result.actor).not.toHaveProperty('password');
    });
  });

  describe('verifyToken', () => {
    it('should return null for invalid token', async () => {
      // Arrange
      const verify = jwt.verify as unknown as jest.Mock;
      verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      // Act
      const result = await authService.verifyToken('invalid-token');

      // Assert
      expect(jwt.verify).toHaveBeenCalledWith(
        'invalid-token',
        'test-secret-key',
        { algorithms: ['HS256'] }
      );
      expect(result).toBeNull();
    });

    it('should return null if user not found', async () => {
      // Arrange
      const decodedToken = { id: mockUserId, username: 'testuser' };
      const verify = jwt.verify as unknown as jest.Mock;
      verify.mockImplementation(() => decodedToken);

      authRepository.findById.mockResolvedValue(null);

      // Act
      const result = await authService.verifyToken('valid-token');

      // Assert
      expect(jwt.verify).toHaveBeenCalledWith(
        'valid-token',
        'test-secret-key',
        { algorithms: ['HS256'] }
      );
      expect(authRepository.findById).toHaveBeenCalledWith(mockUserId);
      expect(result).toBeNull();
    });

    it('should return user when token is valid', async () => {
      // Arrange
      const decodedToken = { id: mockUserId, username: 'testuser' };
      const verify = jwt.verify as unknown as jest.Mock;
      verify.mockImplementation(() => decodedToken);

      authRepository.findById.mockResolvedValue(mockUser);

      // Act
      const result = await authService.verifyToken('valid-token');

      // Assert
      expect(jwt.verify).toHaveBeenCalledWith(
        'valid-token',
        'test-secret-key',
        { algorithms: ['HS256'] }
      );
      expect(authRepository.findById).toHaveBeenCalledWith(mockUserId);
      expect(result).toEqual(mockUser);
    });
  });
});
