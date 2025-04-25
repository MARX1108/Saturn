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
      // Validation is now handled by middleware
      const { username, password, email } = req.body; // Use validated body

      const result = await this.authService.createUser(
        username, // Use directly from validated body
        password,
        email || '' // Handle optional email
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
      // Validation is now handled by middleware
      const { email, password } = req.body; // Use validated body (using email now)

      const result = await this.authService.authenticateUser(
        email, // Use email from validated body
        password
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
