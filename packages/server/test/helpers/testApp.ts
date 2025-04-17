import express from 'express';
import { Db } from 'mongodb';
import { mock } from 'jest-mock-extended';
import { AuthService } from '../../src/modules/auth/services/authService';
import { ActorService } from '../../src/modules/actors/services/actorService';
import configureAuthRoutes from '../../src/modules/auth/routes/authRoutes';

// Export mock services for tests
export const mockAuthService = mock<AuthService>();
export const mockActorService = mock<ActorService>();

export async function createTestApp(db: Db, domain: string) {
  const app = express();

  // Add test ping route for debugging
  app.get('/test-ping', (req, res) => {
    console.log('!!! DEBUG: /test-ping endpoint reached !!!');
    res.status(200).send('pong');
  });

  // Add JSON body parser
  app.use(express.json());

  // Create service container
  const serviceContainer = {
    authService: mockAuthService,
    actorService: mockActorService,
  };

  // Add service container middleware
  app.use((req, res, next) => {
    req.services = serviceContainer;
    next();
  });

  // Mount auth routes
  console.log('!!! DEBUG: Attempting to mount auth routes at /api/auth !!!');
  app.use('/api/auth', configureAuthRoutes(serviceContainer));

  return app;
}
