import { Request, Response, NextFunction } from 'express';
import { ActorService } from '../services/actorService';
import { UploadService } from '@/modules/media/services/upload.service';
import { PostService } from '@/modules/posts/services/postService';
import { AppError, ErrorType } from '@/utils/errors';
import { ObjectId } from 'mongodb';

// Define DTO for controller input
interface CreateActorControllerDTO {
  username: string;
  email: string;
  password?: string;
  displayName?: string;
  summary?: string;
}

// Define an interface for actor profile updates
interface ActorProfileUpdate {
  displayName?: string;
  summary?: string;
  icon?: {
    type: 'Image';
    mediaType: string;
    url: string;
  };
}

export class ActorsController {
  private actorService: ActorService;
  private uploadService: UploadService;
  private postService: PostService;
  private domain: string;

  constructor(
    actorService: ActorService,
    uploadService: UploadService,
    postService: PostService,
    domain: string
  ) {
    this.actorService = actorService;
    this.uploadService = uploadService;
    this.postService = postService;
    this.domain = domain;
  }

  /**
   * Search actors by query
   */
  async searchActors(req: Request, res: Response): Promise<Response> {
    const { q } = req.query;
    const searchQuery = (q as string) || '';
    const actors = await this.actorService.searchActors(searchQuery);
    return res.json(actors);
  }

  /**
   * Create a new actor
   */
  async createActor(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const controllerData = req.body as CreateActorControllerDTO;
      // Map controller DTO to service DTO
      const actorData = { ...controllerData };

      // Add validation here using the DTO
      if (!actorData.username || !actorData.email || !actorData.password) {
        throw new AppError(
          'Missing required fields (username, email, password)',
          400,
          ErrorType.BAD_REQUEST
        );
      }

      const actor = await this.actorService.createLocalActor(actorData);
      res.status(201).json({ id: actor.id, username: actor.preferredUsername });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get actor by username
   */
  async getActorByUsername(req: Request, res: Response): Promise<Response> {
    const { username } = req.params;
    const actor = await this.actorService.getActorByUsername(username);
    if (!actor) {
      return res.status(404).json({ error: 'Actor not found' });
    }
    return res.json(actor);
  }

  /**
   * Update actor
   */
  async updateActor(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const actorId = req.params.id; // Assuming this ID is the internal ObjectId
      const updates = req.body as ActorProfileUpdate;

      // TODO: Add validation
      // TODO: Verify user performing update is authorized (owns the actor or is admin)

      const updatedActor = await this.actorService.updateActorProfile(
        actorId,
        updates
      );

      if (!updatedActor) {
        throw new AppError(
          'Actor not found or update failed',
          404,
          ErrorType.NOT_FOUND
        );
      }
      // TODO: Format response
      res.status(200).json({
        id: updatedActor.id,
        username: updatedActor.preferredUsername,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete actor
   */
  async deleteActor(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const actorId = req.params.id; // Assuming internal ObjectId

      // TODO: Verify authorization

      // Try to use the service method first
      try {
        const success = await this.actorService.deleteActor(actorId);
        if (success) {
          res.status(204).send();
          return;
        }
      } catch {
        // If service method fails, try repository access as fallback
        const objectId = new ObjectId(actorId);
        const actorRepository = this.actorService['actorRepository'];
        const success = await actorRepository.deleteById(objectId);

        if (!success) {
          throw new AppError('Actor not found', 404, ErrorType.NOT_FOUND);
        }
        res.status(204).send();
      }
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get posts authored by a specific actor
   */
  getActorPosts(req: Request, res: Response, next: NextFunction): void {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = parseInt(req.query.offset as string) || 0;

      // Need a method in PostService like getPostsByActorUsername
      // const { posts, total } = await this.postService.getPostsByActorUsername(req.params.username, { limit, offset });
      // Placeholder response
      console.warn('getPostsByActorUsername not implemented in PostService');
      res.json({ posts: [], total: 0, limit, offset });
    } catch (error) {
      next(error);
    }
  }
}
