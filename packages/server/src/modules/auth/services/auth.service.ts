// Auth service implementation
import { Db as _Db } from 'mongodb';
import bcryptjs from 'bcryptjs';
import { AuthRepository } from '../repositories/auth.repository';
import { DbUser } from '../models/user';
import { AppError, ErrorType } from '../../../utils/errors';
import { ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';

export class AuthService {
  private repository: AuthRepository;

  constructor(authRepository: AuthRepository) {
    this.repository = authRepository;
  }

  /**
   * Authenticate a user with username and password
   * @param username The user's username
   * @param password The user's password
   * @returns User object without password if authentication is successful, null otherwise
   */
  async authenticateUser(
    username: string,
    password: string
  ): Promise<Record<string, any> | null> {
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
    const isMatch = await bcryptjs.compare(password, user.password);

    if (!isMatch) {
      return null;
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return userWithoutPassword;
  }

  async createUser(
    username: string,
    password: string,
    email: string
  ): Promise<DbUser> {
    const hashedPassword = await bcryptjs.hash(password, 10);
    return {
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
  }

  async verifyToken(token: string): Promise<DbUser | null> {
    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'your-secret-key'
      ) as {
        id: string;
        username: string;
      };

      const user = await this.repository.findById(decoded.id);
      if (!user) return null;

      return {
        _id: user._id,
        id: user.id,
        username: user.username,
        preferredUsername: user.preferredUsername,
        password: user.password,
        followers: user.followers,
        following: user.following,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
    } catch (error) {
      return null;
    }
  }
}
