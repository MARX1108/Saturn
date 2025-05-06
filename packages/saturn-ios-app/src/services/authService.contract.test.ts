import { Pact } from '@pact-foundation/pact';
import path from 'path';
import { ApiEndpoints } from '../config/api';
import { login, register } from './authService';
import mockApiClient from '../test/mockApiClient';
import tokenStorage from '../test/mocks/tokenStorage';
import { User } from '../services/authService';

// Mock the tokenStorage
jest.mock('./tokenStorage', () => {
  return jest.requireActual<typeof tokenStorage>('../test/mocks/tokenStorage');
});

// Mock the apiClient import in authService
jest.mock('./apiClient', () => ({
  __esModule: true,
  ...jest.requireActual<typeof mockApiClient>('../test/mockApiClient'),
  defaults: {
    baseURL: 'http://localhost:1240',
  },
}));

// Use a unique port for each test to avoid conflicts
const PACT_PORT_LOGIN = 1240;
const PACT_PORT_REGISTER = 1241;

// Define providers for each test
const loginProvider = new Pact({
  consumer: 'SaturnIOSApp',
  provider: 'SaturnAPI',
  port: PACT_PORT_LOGIN,
  log: path.resolve(process.cwd(), 'logs', 'pact.log'),
  dir: path.resolve(process.cwd(), 'pacts'),
  logLevel: 'warn',
  pactfileWriteMode: 'update',
});

const registerProvider = new Pact({
  consumer: 'SaturnIOSApp',
  provider: 'SaturnAPI',
  port: PACT_PORT_REGISTER,
  log: path.resolve(process.cwd(), 'logs', 'pact.log'),
  dir: path.resolve(process.cwd(), 'pacts'),
  logLevel: 'warn',
  pactfileWriteMode: 'update',
});

// Global teardown to ensure providers are finalized
afterAll(async () => {
  await Promise.all([loginProvider.finalize(), registerProvider.finalize()]);
});

describe('AuthService Contract Tests', (): void => {
  describe('login', () => {
    beforeAll(() => loginProvider.setup());
    afterEach(() => loginProvider.verify());

    test('should login a user successfully', async () => {
      // Setup the expected interaction
      await loginProvider.addInteraction({
        state: 'User credentials are valid',
        uponReceiving: 'a request to login',
        withRequest: {
          method: 'POST',
          path: ApiEndpoints.login,
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json, text/plain, */*',
          },
          body: {
            username: 'testuser',
            password: 'password123',
          },
        },
        willRespondWith: {
          status: 200,
          headers: { 'Content-Type': 'application/json; charset=utf-8' },
          body: {
            token: 'valid-auth-token',
            user: {
              _id: 'userId123',
              id: 'userId123',
              username: 'testuser',
              displayName: 'Test User',
            },
          },
        },
      });

      // Set the base URL for this test
      mockApiClient.defaults.baseURL = `http://localhost:${PACT_PORT_LOGIN}`;

      try {
        const credentials = { username: 'testuser', password: 'password123' };
        const result = await login(credentials);

        // Verify the response
        expect(result).toBeDefined();
        expect(result.token).toEqual('valid-auth-token');
        expect(result.user).toBeDefined();
        expect(result.user.username).toEqual('testuser');
      } finally {
        // Reset mocks
        jest.restoreAllMocks();
      }
    });
  });

  describe('register', () => {
    beforeAll(() => registerProvider.setup());
    afterEach(() => registerProvider.verify());

    test('should register a new user successfully', async () => {
      // Setup the expected interaction
      await registerProvider.addInteraction({
        state: 'Registration is enabled',
        uponReceiving: 'a request to register a new user',
        withRequest: {
          method: 'POST',
          path: ApiEndpoints.register,
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json, text/plain, */*',
          },
          body: {
            username: 'newuser',
            password: 'newpassword123',
            email: 'newuser@example.com',
          },
        },
        willRespondWith: {
          status: 201,
          headers: { 'Content-Type': 'application/json; charset=utf-8' },
          body: {
            token: 'new-user-auth-token',
            user: {
              _id: 'newUserId123',
              id: 'newUserId123',
              username: 'newuser',
              displayName: 'New User',
            },
          },
        },
      });

      // Set the base URL for this test
      mockApiClient.defaults.baseURL = `http://localhost:${PACT_PORT_REGISTER}`;

      try {
        const userData = {
          username: 'newuser',
          password: 'newpassword123',
          email: 'newuser@example.com',
        };
        const result = await register(userData);

        // Verify the response
        expect(result).toBeDefined();
        expect(result.token).toEqual('new-user-auth-token');
        expect(result.user).toBeDefined();
        expect(result.user.username).toEqual('newuser');
      } finally {
        // Reset mocks
        jest.restoreAllMocks();
      }
    });
  });
});
