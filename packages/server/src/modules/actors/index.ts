/**
 * Actors Module
 * 
 * This module handles the creation, retrieval, updating, and deletion of actors (users).
 */

// Export controllers
export * from './controllers/actorsController';

// Export routes
export { default as configureActorRoutes } from './routes/actors';

// Export models
export * from './models/actor';

// Export services
export * from './services/actorService';

// Export repositories
export * from './repositories/actorRepository';

// Export types
export * from './types/actor';