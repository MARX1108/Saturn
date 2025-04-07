/**
 * Auth Module
 * 
 * This module handles user authentication, registration, and authorization.
 */

// Export controllers
export * from './controllers/authController';

// Export routes configuration
export { default as configureAuthRoutes } from './routes/auth';

// Export models
export * from './models/auth';

// Export services when they exist
// export * from './services/authService';

// Export repositories when they exist
// export * from './repositories/authRepository';