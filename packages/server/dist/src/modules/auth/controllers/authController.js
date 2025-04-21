'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.AuthController = void 0;
/**
 * Controller for handling authentication operations
 */
class AuthController {
  constructor(actorService, authService) {
    this.actorService = actorService;
    this.authService = authService;
  }
  /**
   * Register a new user
   */
  async register(req, res) {
    const { username, password, email } = req.body;
    const result = await this.authService.createUser(username, password, email);
    return res.status(201).json(result);
  }
  /**
   * Login user
   */
  async login(req, res) {
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
  async getCurrentUser(req, res) {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    return res.json(req.user);
  }
}
exports.AuthController = AuthController;
