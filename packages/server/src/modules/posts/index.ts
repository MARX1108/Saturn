/**
 * Posts Module
 *
 * This module handles the creation, retrieval, updating, and deletion of posts.
 */

// Export controllers
export * from './controllers/postsController';

// Export routes
export { default as postsRoutes } from './routes/postRoutes';

// Export models
export * from './models/post';

// Export services
export * from './services/postService';

// Export repositories
export * from './repositories/postRepository';
