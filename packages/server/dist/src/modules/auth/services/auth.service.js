'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.AuthService = void 0;
// Auth service implementation
const bcryptjs_1 = __importDefault(require('bcryptjs'));
const mongodb_1 = require('mongodb');
const jsonwebtoken_1 = __importDefault(require('jsonwebtoken'));
const logger_1 = __importDefault(require('../../../utils/logger'));
class AuthService {
  constructor(authRepository) {
    this.repository = authRepository;
  }
  /**
   * Generate a JWT token for a user
   */
  generateToken(user) {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET environment variable is not defined');
    }
    return jsonwebtoken_1.default.sign(
      { id: user._id, username: user.username },
      jwtSecret,
      {
        expiresIn: '24h',
        algorithm: 'HS256',
      }
    );
  }
  /**
   * Authenticate a user with username and password
   */
  async authenticateUser(username, password) {
    // Find user using repository
    const user = await this.repository.findByUsername(username);
    // Detailed logging to debug user retrieval
    logger_1.default.debug({ username, userFound: !!user }, 'Login attempt');
    if (!user) {
      logger_1.default.debug({ username }, 'User not found during login');
      return null;
    }
    // Password field verification logging
    logger_1.default.debug(
      {
        username,
        passwordExists: !!user.password,
        passwordType: typeof user.password,
        passwordLength: user.password ? user.password.length : 0,
      },
      'Password verification'
    );
    // Check password
    const isMatch = await bcryptjs_1.default.compare(password, user.password);
    if (!isMatch) {
      logger_1.default.debug({ username }, 'Invalid password during login');
      return null;
    }
    // Remove password from response
    const { password: _password, ...userWithoutPassword } = user;
    // Generate token
    const token = this.generateToken(user);
    return {
      actor: userWithoutPassword,
      token,
    };
  }
  async createUser(username, password, email) {
    const hashedPassword = await bcryptjs_1.default.hash(password, 10);
    const user = {
      _id: new mongodb_1.ObjectId().toString(),
      id: new mongodb_1.ObjectId().toString(),
      username,
      preferredUsername: username,
      password: hashedPassword,
      followers: [],
      following: [],
      email,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    // Save user to database
    await this.repository.create(user);
    // Remove password from response
    const { password: _password, ...userWithoutPassword } = user;
    // Generate token
    const token = this.generateToken(user);
    logger_1.default.info({ username }, 'User created successfully');
    return {
      actor: userWithoutPassword,
      token,
    };
  }
  async verifyToken(token) {
    try {
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        logger_1.default.error(
          'JWT_SECRET environment variable is not defined'
        );
        return null;
      }
      const decoded = jsonwebtoken_1.default.verify(token, jwtSecret, {
        algorithms: ['HS256'],
      });
      const user = await this.repository.findById(decoded.id);
      if (!user) {
        logger_1.default.debug(
          { userId: decoded.id },
          'User not found during token verification'
        );
        return null;
      }
      return user;
    } catch (error) {
      logger_1.default.error({ err: error }, 'Token verification failed');
      return null;
    }
  }
}
exports.AuthService = AuthService;
