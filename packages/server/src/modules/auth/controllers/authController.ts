import { Request, Response, NextFunction } from 'express';
import { ActorService } from '@/modules/actors/services/actorService';
import { AuthService } from '../services/auth.service';
import { AppError, ErrorType } from '../../../utils/errors';
import { RegisterRequest, LoginRequest } from '../types/auth';

/**
 * Controller for handling authentication operations
 */
export class AuthController {
  private actorService: ActorService;
  private authService: AuthService;

  constructor(actorService: ActorService, authService: AuthService) {
    this.actorService = actorService;
    this.authService = authService;
  }

  /**
   * Register a new user
   */
  async register(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      // Validation now handled by middleware
      // Use original types and casting logic expected by service
      const { username, password, email } = req.body as RegisterRequest;
      const usernameStr = String(username);
      const passwordStr = String(password);
      const emailStr = email ? String(email) : '';

      const result = await this.authService.createUser(
        usernameStr,
        passwordStr,
        emailStr
      );
      res.status(201).json(result);
    } catch (error) {
      // Handle specific duplicate user error
      if (
        error instanceof Error &&
        error.message === 'Username or email already exists'
      ) {
        next(new AppError(error.message, 409, ErrorType.CONFLICT));
      } else {
        next(error);
      }
    }
  }

  /**
   * Login user
   */
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Validation now handled by middleware
      // Use original types and casting logic expected by service
      const { username, password } = req.body as LoginRequest;
      const usernameStr = String(username);
      const passwordStr = String(password);

      const result = await this.authService.authenticateUser(
        usernameStr,
        passwordStr
      );

      if (!result) {
        throw new AppError(
          'Invalid credentials',
          401,
          ErrorType.AUTHENTICATION
        );
      }
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get current authenticated user
   */
  getCurrentUser(req: Request, res: Response, next: NextFunction): void {
    try {
      if (!req.user) {
        throw new AppError(
          'Authentication required',
          401,
          ErrorType.AUTHENTICATION
        );
      }

      // Remove password from response using destructuring and rest operator
      const { password: _password, ...userWithoutPassword } = req.user;

      res.json(userWithoutPassword);
    } catch (error) {
      next(error);
    }
  }
}
