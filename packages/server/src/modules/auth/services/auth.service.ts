// Auth service implementation
import bcryptjs from 'bcryptjs';
import { AuthRepository } from '../repositories/auth.repository';
import { DbUser } from '../models/user';
import { ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';

export class AuthService {
  private repository: AuthRepository;

  constructor(authRepository: AuthRepository) {
    this.repository = authRepository;
  }

  /**
   * Generate a JWT token for a user
   */
  private generateToken(user: DbUser): string {
    return jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );
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

    // Save user to database
    await this.repository.create(user);

    // Remove password from response

    const { password: _password, ...userWithoutPassword } = user;

    // Generate token
    const token = this.generateToken(user);

    return {
      actor: userWithoutPassword,
      token,
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

      return user;
    } catch {
      return null;
    }
  }
}
