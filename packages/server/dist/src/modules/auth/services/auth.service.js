'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require('bcryptjs'));
const mongodb_1 = require('mongodb');
const jsonwebtoken_1 = __importDefault(require('jsonwebtoken'));
class AuthService {
  constructor(authRepository) {
    this.repository = authRepository;
  }
  /**
   * Generate a JWT token for a user
   */
  generateToken(user) {
    return jsonwebtoken_1.default.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );
  }
  /**
   * Authenticate a user with username and password
   */
  async authenticateUser(username, password) {
    // Find user using repository
    const user = await this.repository.findByUsername(username);
    // Detailed logging to debug user retrieval
    console.log('AUTH DEBUG - Login attempt for username:', username);
    console.log(
      'AUTH DEBUG - User object found:',
      user ? 'User found' : 'User NOT found'
    );
    console.dir(user, { depth: 3, colors: true });
    if (!user) {
      return null;
    }
    // Password field verification logging
    console.log('AUTH DEBUG - Password verification:');
    console.log('AUTH DEBUG - typeof user.password:', typeof user.password);
    console.log(
      'AUTH DEBUG - user.password exists:',
      user.password ? 'Yes' : 'No'
    );
    console.log(
      'AUTH DEBUG - user.password length:',
      user.password ? user.password.length : 0
    );
    // Only log first few chars of hash for security reasons if it exists
    if (user.password) {
      console.log(
        'AUTH DEBUG - password hash preview:',
        `${user.password.substring(0, 10)}...`
      );
    }
    // Check password
    const isMatch = await bcryptjs_1.default.compare(password, user.password);
    if (!isMatch) {
      return null;
    }
    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;
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
    const { password: _, ...userWithoutPassword } = user;
    // Generate token
    const token = this.generateToken(user);
    return {
      actor: userWithoutPassword,
      token,
    };
  }
  async verifyToken(token) {
    try {
      const decoded = jsonwebtoken_1.default.verify(
        token,
        process.env.JWT_SECRET || 'your-secret-key'
      );
      const user = await this.repository.findById(decoded.id);
      if (!user) return null;
      return user;
    } catch (error) {
      return null;
    }
  }
}
exports.AuthService = AuthService;
