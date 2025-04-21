import { Router, Request, Response } from 'express';
import { mockActorService } from './mockSetup'; // Adjust path as needed
import { Actor } from '@/modules/actors/models/actor'; // Import canonical Actor

// This function configures routes using the mock service
export function configureTestActorRoutes(): Router {
  const router = Router();

  // Get actor by username
  router.get('/:username', async (req: Request, res: Response) => {
    const { username } = req.params;
    const actor = await mockActorService.getActorByUsername(username);
    if (actor) {
      // Format response to match expected client structure if necessary
      const actorResponse = {
        id: actor.id,
        username: actor.username,
        preferredUsername: actor.preferredUsername,
        displayName: actor.displayName,
        summary: actor.summary,
        iconUrl: actor.icon?.url,
        isAdmin: actor.isAdmin,
        isVerified: actor.isVerified,
        createdAt: actor.createdAt.toISOString(),
        updatedAt: actor.updatedAt.toISOString(),
        // Add follower/following counts if mock service provides them
      };
      res.json(actorResponse);
    } else {
      res.status(404).json({ message: 'Actor not found' });
    }
  });

  // Update actor profile
  router.put('/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const { displayName, summary } = req.body;
    try {
      const updatedActor = await mockActorService.updateActor(id, {
        displayName,
        summary,
      });
      if (updatedActor) {
        // Format response
        const actorResponse = {
          id: updatedActor.id,
          username: updatedActor.username,
          preferredUsername: updatedActor.preferredUsername,
          displayName: updatedActor.displayName,
          summary: updatedActor.summary,
          iconUrl: updatedActor.icon?.url,
          isAdmin: updatedActor.isAdmin,
          isVerified: updatedActor.isVerified,
          createdAt: updatedActor.createdAt.toISOString(),
          updatedAt: updatedActor.updatedAt.toISOString(),
          // Add counts if available
        };
        res.json(actorResponse);
      } else {
        res.status(404).json({ message: 'Actor not found for update' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Failed to update actor' });
    }
  });

  return router;
}
