// Auth service implementation
import bcryptjs from 'bcryptjs';
import { AuthRepository } from '../repositories/auth.repository';
import { DbUser } from '../models/user';
import { ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';
import logger from '../../../utils/logger';

export class AuthService {
  private repository: AuthRepository;

  constructor(authRepository: AuthRepository) {
    this.repository = authRepository;
  }

  /**
   * Generate a JWT token for a user
   */
  private generateToken(user: DbUser): string {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET environment variable is not defined');
    }

    return jwt.sign({ id: user._id, username: user.username }, jwtSecret, {
      expiresIn: '24h',
      algorithm: 'HS256',
    });
  }

  /**
   * Authenticate a user with username and password
   */
  async authenticateUser(
    username: string,
    password: string
  ): Promise<{ actor: Omit<DbUser, 'password'>; token: string } | null> {
    // Find user using repository
    const user = await this.repository.findByUsername(username);

    // Detailed logging to debug user retrieval
    logger.debug({ username, userFound: !!user }, 'Login attempt');

    if (!user) {
      logger.debug({ username }, 'User not found during login');
      return null;
    }

    // Password field verification logging
    logger.debug(
      {
        username,
        passwordExists: !!user.password,
        passwordType: typeof user.password,
        passwordLength: user.password ? user.password.length : 0,
      },
      'Password verification'
    );

    // Check password
    const isMatch = await bcryptjs.compare(password, user.password);

    if (!isMatch) {
      logger.debug({ username }, 'Invalid password during login');
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

  async createUser(
    username: string,
    password: string,
    email: string
  ): Promise<{ actor: Omit<DbUser, 'password'>; token: string }> {
    // Check if username already exists before attempting to create
    const existingUser = await this.repository.findByUsername(username);
    if (existingUser) {
      throw new Error('Username or email already exists');
    }

    // Check if email already exists
    const existingEmail = await this.repository.findByEmail(email);
    if (existingEmail) {
      throw new Error('Username or email already exists');
    }

    const hashedPassword = await bcryptjs.hash(password, 10);
    const user: DbUser = {
      _id: new ObjectId().toString(),
      id: new ObjectId().toString(),
      username,
      preferredUsername: username,
      password: hashedPassword,
      followers: [],
      following: [],
      email,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    try {
      // Save user to database
      await this.repository.create(user);

      // Remove password from response
      const { password: _password, ...userWithoutPassword } = user;

      // Generate token
      const token = this.generateToken(user);

      logger.info({ username }, 'User created successfully');

      return {
        actor: userWithoutPassword,
        token,
      };
    } catch (error) {
      // Handle MongoDB duplicate key error
      if (
        error instanceof Error &&
        (error.message.includes('duplicate key') ||
          error.message.includes('E11000'))
      ) {
        throw new Error('Username or email already exists');
      }
      // Re-throw other errors
      throw error;
    }
  }

  async verifyToken(token: string): Promise<DbUser | null> {
    try {
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        logger.error('JWT_SECRET environment variable is not defined');
        return null;
      }

      const decoded = jwt.verify(token, jwtSecret, {
        algorithms: ['HS256'],
      }) as {
        id: string;
        username: string;
      };

      const user = await this.repository.findById(decoded.id);
      if (!user) {
        logger.debug(
          { userId: decoded.id },
          'User not found during token verification'
        );
        return null;
      }

      return user;
    } catch (error) {
      logger.error({ err: error }, 'Token verification failed');
      return null;
    }
  }
}
