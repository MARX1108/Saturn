import express from 'express';
import { ActorService } from '../../modules/actors/services/actorService';
import { Actor } from '../../modules/actors/models/actor';

export function configureTestActorRoutes(
  actorService: ActorService
): express.Router {
  const router = express.Router();

  const checkAuth = (
    req: express.Request & { user?: { username: string } },
    res: express.Response,
    next: express.NextFunction
  ): void | express.Response => {
    const user = req.user;
    if (!user?.username) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    if (user.username !== req.params.username) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };

  // GET /:username
  router.get('/:username', async (req, res) => {
    try {
      const actor = await actorService.getActorByUsername(req.params.username);
      if (!actor) {
        return res.status(404).json({ error: 'Actor not found' });
      }

      const formattedResponse = {
        ...actor,
        preferredUsername: actor.preferredUsername,
        name: actor.name,
        summary: actor.summary,
        icon: actor.icon
          ? {
              type: 'Image',
              mediaType: 'image/jpeg',
              url: actor.icon.url,
            }
          : undefined,
      };

      res.json(formattedResponse);
    } catch (_error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // PUT /:username
  router.put('/:username', checkAuth, async (req, res) => {
    try {
      const { name, bio, icon } = req.body;
      const updatedActor = await actorService.updateActor(req.params.username, {
        name,
        bio,
        icon,
      });

      if (!updatedActor) {
        return res.status(404).json({ error: 'Actor not found' });
      }

      const formattedResponse = {
        ...updatedActor,
        preferredUsername: updatedActor.preferredUsername,
        name: updatedActor.name,
        summary: updatedActor.summary,
        icon: updatedActor.icon
          ? {
              type: 'Image',
              mediaType: 'image/jpeg',
              url: updatedActor.icon.url,
            }
          : undefined,
      };

      res.json(formattedResponse);
    } catch (_error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  return router;
}
