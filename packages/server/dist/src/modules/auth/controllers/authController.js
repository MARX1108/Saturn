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
      // Validation now handled by middleware
      // Use original types and casting logic expected by service
      const { username, password, email } = req.body;
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
        next(
          new errors_1.AppError(error.message, 409, errors_1.ErrorType.CONFLICT)
        );
      } else {
        next(error);
      }
    }
  }
  /**
   * Login user
   */
  async login(req, res, next) {
    try {
      // Validation now handled by middleware
      // Use original types and casting logic expected by service
      const { username, password } = req.body;
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
      // Remove password from response using destructuring and rest operator
      const { password: _password, ...userWithoutPassword } = req.user;
      res.json(userWithoutPassword);
    } catch (error) {
      next(error);
    }
  }
}
exports.AuthController = AuthController;
