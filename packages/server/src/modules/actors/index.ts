/**
 * Actors Module
 *
 * This module handles the creation, retrieval, updating, and deletion of actors (users).
 */

// Export controllers
export * from './controllers/actorsController';

// Export routes
export { default as configureActorRoutes } from './routes/actorRoutes';

// Export models
export { Actor } from './models/actor';

// Export services
export * from './services/actorService';

// Export repositories
export * from './repositories/actorRepository';

// Export types
export { CreateActorRequest, UpdateActorRequest } from './types/actor';
