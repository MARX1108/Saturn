import { Request, Response } from 'express';
import _bcryptjs from 'bcryptjs';
import { ActorService } from '../../actors/services/actorService';
import { AuthService } from '../services/auth.service';
import { generateToken } from '../../../middleware/auth';
import { DbUser } from '../models/user';

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
  async register(req: Request, res: Response): Promise<Response> {
    const { username, password, email } = req.body;
    const result = await this.authService.createUser(username, password, email);
    return res.status(201).json(result);
  }

  /**
   * Login user
   */
  async login(req: Request, res: Response): Promise<Response> {
    const { username, password } = req.body;
    const result = await this.authService.authenticateUser(username, password);

    if (!result) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    return res.json(result);
  }

  /**
   * Get current authenticated user
   */
  async getCurrentUser(req: Request, res: Response): Promise<Response> {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    return res.json(req.user);
  }
}
