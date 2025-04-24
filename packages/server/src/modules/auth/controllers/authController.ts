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
      const { username, password, email } = req.body as RegisterRequest;
      if (!username || !password) {
        throw new AppError(
          'Username and password are required',
          400,
          ErrorType.VALIDATION
        );
      }

      // Type validation for inputs
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
      next(error);
    }
  }

  /**
   * Login user
   */
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { username, password } = req.body as LoginRequest;
      if (!username || !password) {
        throw new AppError(
          'Username and password are required',
          400,
          ErrorType.VALIDATION
        );
      }

      // Type validation for inputs
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
      res.json(req.user);
    } catch (error) {
      next(error);
    }
  }
}
