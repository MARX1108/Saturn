'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.configureTestActorRoutes = configureTestActorRoutes;
const express_1 = __importDefault(require('express'));
function configureTestActorRoutes(actorService) {
  const router = express_1.default.Router();
  const checkAuth = (req, res, next) => {
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
