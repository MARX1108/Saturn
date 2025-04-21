/**
 * Actors Module
 *
 * This module handles the creation, retrieval, updating, and deletion of actors (users).
 */

import { Router } from 'express';
import { ActorService } from './services/actorService';
import { ActorRepository } from './repositories/actorRepository';
import configureActorRoutes from './routes/actorRoutes';

// Export controllers
export * from './controllers/actorsController';

// Export services and repositories
export { ActorService };
export { ActorRepository };

// Export routes
export { configureActorRoutes };
