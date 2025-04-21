import { Request, Response, NextFunction } from 'express';
import _bcryptjs from 'bcryptjs';
import { ActorService } from '../../actors/services/actorService';
import { AuthService } from '../services/auth.service';
import { generateToken } from '../../../middleware/auth';
import { DbUser } from '../models/user';
import { AppError, ErrorType } from '../../../utils/errors';

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
      const { username, password, email } = req.body;
      if (!username || !password) {
        throw new AppError(
          'Username and password are required',
          ErrorType.BadRequest
        );
      }
      const result = await this.authService.createUser(
        username,
        password,
        email
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
      const { username, password } = req.body;
      if (!username || !password) {
        throw new AppError(
          'Username and password are required',
          ErrorType.BadRequest
        );
      }
      const result = await this.authService.authenticateUser(
        username,
        password
      );

      if (!result) {
        throw new AppError('Invalid credentials', ErrorType.Unauthorized);
      }
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get current authenticated user
   */
  async getCurrentUser(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', ErrorType.Unauthorized);
      }
      res.json(req.user);
    } catch (error) {
      next(error);
    }
  }
}
