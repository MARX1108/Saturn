'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.AuthController = void 0;
const errors_1 = require('../../../utils/errors');
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
  async register(req, res, next) {
    try {
      const { username, password, email } = req.body;
      if (!username || !password) {
        throw new errors_1.AppError(
          'Username and password are required',
          400,
          errors_1.ErrorType.VALIDATION
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
  async login(req, res, next) {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        throw new errors_1.AppError(
          'Username and password are required',
          400,
          errors_1.ErrorType.VALIDATION
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
        throw new errors_1.AppError(
          'Invalid credentials',
          401,
          errors_1.ErrorType.AUTHENTICATION
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
  getCurrentUser(req, res, next) {
    try {
      if (!req.user) {
        throw new errors_1.AppError(
          'Authentication required',
          401,
          errors_1.ErrorType.AUTHENTICATION
        );
      }
      res.json(req.user);
    } catch (error) {
      next(error);
    }
  }
}
exports.AuthController = AuthController;
