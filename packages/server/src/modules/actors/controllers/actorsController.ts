import { Request, Response, NextFunction } from 'express';
import { ActorService } from '../services/actorService';
import { UploadService } from '@/modules/media/services/upload.service';
import { PostService } from '@/modules/posts/services/postService';
import { AppError, ErrorType } from '@/utils/errors';
import { ObjectId } from 'mongodb';
import { Actor } from '../models/actor';

// Define DTO for controller input
interface CreateActorControllerDTO {
  username: string;
  email: string;
  password?: string;
  displayName?: string;
  summary?: string;
}

// Define an extension of DbUser to include isAdmin property
interface UserWithAdminStatus {
  preferredUsername?: string;
  isAdmin?: boolean;
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

    // Remove sensitive information from the response
    const {
      password: _password,
      email: _email,
      ...actorWithoutSensitiveInfo
    } = actor;

    return res.json(actorWithoutSensitiveInfo);
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

  /**
   * Update actor by username
   */
  async updateActorByUsername(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const username = req.params.username;
      const updates = req.body as ActorProfileUpdate;

      console.log(
        `[ActorsController] Attempting to update actor with username: ${username}`
      );
      console.log(
        `[ActorsController] Update payload:`,
        JSON.stringify(updates)
      );
      console.log(
        `[ActorsController] Current user:`,
        req.user?.preferredUsername
      );

      // Authorization check: Only allow users to update their own profiles (or admin users)
      // Cast req.user to our interface that includes isAdmin
      const user = req.user as UserWithAdminStatus | undefined;
      if (user?.preferredUsername !== username && !(user?.isAdmin === true)) {
        console.error(
          `[ActorsController] Authorization failed - user ${user?.preferredUsername} attempted to update ${username}`
        );
        throw new AppError(
          'Not authorized to update this actor',
          403,
          ErrorType.FORBIDDEN
        );
      }

      // Find the actor first to verify it exists
      const actor = await this.actorService.getActorByUsername(username);

      if (!actor) {
        throw new AppError(
          'Actor not found with username: ' + username,
          404,
          ErrorType.NOT_FOUND
        );
      }

      console.log(`Updating actor with username ${username}, ID: ${actor._id}`);

      // Create clean update object
      const cleanUpdates: Partial<
        Pick<Actor, 'displayName' | 'summary' | 'icon'>
      > = {};

      // Only include fields that are actually provided
      if (updates.displayName !== undefined)
        cleanUpdates.displayName = updates.displayName;
      if (updates.summary !== undefined) cleanUpdates.summary = updates.summary;
      if (updates.icon !== undefined) cleanUpdates.icon = updates.icon;

      console.log(
        `[ActorsController] Cleaned update object:`,
        JSON.stringify(cleanUpdates)
      );

      // CHANGE: Use updateActor method which updates by username rather than ID
      // since we're having issues with the ObjectId lookups
      try {
        const updatedActor = await this.actorService.updateActor(
          username,
          cleanUpdates
        );

        if (!updatedActor) {
          console.error(
            `[ActorsController] Actor update failed, returned null for username: ${username}`
          );
          throw new AppError(
            'Actor update failed',
            500,
            ErrorType.INTERNAL_SERVER_ERROR
          );
        }

        console.log(
          `[ActorsController] Successfully updated actor: ${updatedActor.preferredUsername}`
        );

        res.status(200).json({
          id: updatedActor.id,
          username: updatedActor.preferredUsername,
          displayName: updatedActor.displayName,
        });
      } catch (updateError) {
        console.error(
          `[ActorsController] Error updating actor with username ${username}:`,
          updateError
        );
        // Handle error with proper type casting
        const errorMessage =
          updateError instanceof Error ? updateError.message : 'Unknown error';

        throw new AppError(
          `Actor update failed: ${errorMessage}`,
          500,
          ErrorType.INTERNAL_SERVER_ERROR
        );
      }
    } catch (error) {
      console.error(
        `[ActorsController] Error in updateActorByUsername:`,
        error
      );
      next(error);
    }
  }
}
