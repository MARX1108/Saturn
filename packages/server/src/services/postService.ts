import { Db, ObjectId, OptionalUnlessRequiredId } from 'mongodb';
import {
  Post,
  // CreatePostDto, // Removed - Type not exported from model
  // PostInputData, // Removed - Type not exported from model
} from '@/modules/posts/models/post';
import { PostRepository } from '@/modules/posts/repositories/postRepository';
import { executeHook } from '../plugins';
import { ActorService } from '@/modules/actors/services/actorService';
import { NotificationService } from '@/modules/notifications/services/notification.service';
import { AppError, ErrorType } from '@/utils/errors'; // Corrected import path

// Define Input type locally for createPost
interface PostInputData {
  username: string;
  content: string;
  visibility?: 'public' | 'followers' | 'unlisted' | 'direct';
  sensitive?: boolean;
  attachments?: {
    url: string;
    type: 'Image' | 'Video' | 'Document' | 'Audio';
    mediaType: string;
    name?: string;
    width?: number;
    height?: number;
    blurhash?: string;
  }[];
  // Add other fields that might come from the client if necessary
}

export class PostService {
  constructor(
    private repository: PostRepository,
    private actorService: ActorService,
    private domain: string,
    private notificationService?: NotificationService
  ) {}

  async createPost(postInputData: PostInputData): Promise<Post> {
    // 1. Find the actor by username to get their ObjectId
    const actor = await this.actorService.getActorByUsername(
      postInputData.username
    );
    if (!actor) {
      throw new AppError('Actor not found', 404, ErrorType.NOT_FOUND);
    }

    // 2. Prepare the data for repository create method
    // Using OptionalUnlessRequiredId allows omitting _id, createdAt, updatedAt
    const postData: OptionalUnlessRequiredId<Post> = {
      content: postInputData.content,
      actorId: actor._id, // Use the ObjectId from the fetched actor
      visibility: postInputData.visibility || 'public', // Default visibility
      sensitive: postInputData.sensitive || false,
      attachments: postInputData.attachments || [],
      // mentions: [], // Removed - not part of Post model
      tag: [], // Corrected property name: tag (singular)
      likes: [], // Likes array stores ObjectIds of liking actors
      shares: [], // Shares array stores ObjectIds of sharing actors
      replies: [], // Replies array stores ObjectIds of replying posts/comments
      // published will be set by the repository
      // url will be generated based on domain/actor/post id
      // type defaults to 'Create' activity wrapping a 'Note' - handle if needed
    };

    // 3. Create the post using the repository
    // The repository's create method should handle setting _id, createdAt, updatedAt, published, url
    const createdPost = await this.repository.create(postData);

    // TODO: Optionally send notifications, federate activity, etc.
    // Example: Trigger notification for mentions
    // if (this.notificationService && postData.mentions.length > 0) {
    //   // ... notification logic
    // }

    return createdPost; // Return the fully created post from the repository
  }

  async getPostById(postId: string): Promise<Post | null> {
    return this.repository.findById(postId);
  }

  async getPostsByUsername(
    username: string,
    page: number,
    limit: number
  ): Promise<Post[]> {
    // TODO: Add proper pagination, sorting, and potentially lookup actor ID first
    const actor = await this.actorService.getActorByUsername(username);
    if (!actor) return [];
    return this.repository.find(
      { actorId: actor._id }, // Filter by actorId ObjectId
      { sort: { createdAt: -1 }, skip: (page - 1) * limit, limit: limit }
    );
  }

  async getFeed(page: number, limit: number): Promise<Post[]> {
    // TODO: Implement actual feed logic (fetch followed actor IDs, then find posts from those IDs)
    // Placeholder: return latest posts from anyone
    return this.repository.find(
      {},
      { sort: { createdAt: -1 }, skip: (page - 1) * limit, limit: limit }
    );
  }

  async updatePost(
    postId: string,
    actorId: ObjectId,
    updates: Partial<any>
  ): Promise<Post | null> {
    // Verify ownership
    const isOwner = await this.repository.isOwner(postId, actorId);
    if (!isOwner) {
      return null;
    }

    // Update the post
    const updateData: Partial<Post> = {};
    if (updates.content) updateData.content = updates.content;
    if (updates.sensitive !== undefined)
      updateData.sensitive = updates.sensitive;

    const success = await this.repository.update(postId, updateData);
    if (!success) {
      return null;
    }

    return this.repository.findById(postId);
  }

  async deletePost(postId: string, actorId: string): Promise<boolean> {
    const post = await this.repository.findById(postId);
    if (!post) {
      throw new AppError('Post not found', 404, ErrorType.NOT_FOUND);
    }
    // Ensure the actor deleting the post is the author
    if (post.actorId?.toString() !== actorId) {
      throw new AppError(
        'User not authorized to delete this post',
        403, // Forbidden status code
        ErrorType.FORBIDDEN
      );
    }
    // Use deleteById from the repository
    return this.repository.deleteById(postId);
  }

  async likePost(postId: string, actorId: string): Promise<boolean> {
    // Basic implementation, might need more checks (e.g., already liked?)
    return this.repository.likePost(postId, actorId);
  }

  async unlikePost(postId: string, actorId: string): Promise<boolean> {
    return this.repository.unlikePost(postId, actorId);
  }
}
