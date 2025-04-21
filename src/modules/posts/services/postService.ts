import { PostRepository } from '../repositories/postRepository';
import { ActorService } from '@/modules/actors/services/actorService';
import { Post, CreatePostRequest } from '../models/post'; // Correct: Removed UpdatePostRequest
import { AppError, ErrorType } from '@/utils/errors';
import { NotificationService } from '@/modules/notifications/services/notification.service';
import { Actor } from '@/modules/actors/models/actor';
import { ObjectId } from 'mongodb';

export class PostService {
  private postRepository: PostRepository;
  private actorService: ActorService;
  private notificationService: NotificationService;
  private domain: string;

  constructor(
    postRepository: PostRepository,
    actorService: ActorService,
    notificationService: NotificationService,
    domain: string
  ) {
    this.postRepository = postRepository;
    this.actorService = actorService;
    this.notificationService = notificationService;
    this.domain = domain;
  }

  async createPost(
    request: CreatePostRequest,
    actorObjectId: ObjectId // Correct: Use actorObjectId
  ): Promise<Post> {
    // Get the actor from the provided ObjectId
    const actor = await this.actorService.getActorById(actorObjectId); // Correct: Use actorObjectId
    if (!actor) {
      throw new AppError('Actor not found', ErrorType.NotFound);
    }

    const now = new Date();
    const postId = `${actor.id}/posts/${Date.now()}`;
    const postUrl = `${this.domain}/posts/${new ObjectId().toHexString()}`; // Example URL, adjust as needed

    const newPostData: Omit<Post, '_id'> = {
      id: postId,
      type: 'Note',
      actorId: actor._id, // Use the actor's ObjectId
      content: request.content,
      visibility: request.visibility || 'public',
      sensitive: request.sensitive || false,
      contentWarning: request.contentWarning,
      attachments: request.attachments || [],
      published: now,
      createdAt: now,
      updatedAt: now,
      attributedTo: actor.id,
      to: ['https://www.w3.org/ns/activitystreams#Public'], // Default audience
      cc: [],
      url: postUrl,
      replyCount: 0,
      likes: 0, // Correct: Initialize count to 0
      likedBy: [], // Initialize array
      shares: 0, // Initialize count
      sharedBy: [], // Initialize array
      // actor: actor, // Optionally embed actor - let repository handle joins if needed
    };

    const createdPost = await this.postRepository.create(newPostData);

    // Send notification to followers (potential ActivityPub logic)
    // this.notificationService.notifyFollowers(actor, createdPost);

    // Fetch the post again to potentially get populated fields if needed
    // Or return the direct result if sufficient
    return createdPost; // Assuming create returns the full post object
  }

  async getPostById(postId: string): Promise<Post | null> {
    const post = await this.postRepository.findById(postId);
    // Repository findById should ideally populate actor, or we do it here
    if (post && !post.actor) {
      post.actor = await this.actorService.getActorById(post.actorId); // Correct: Use actorId
    }
    return post;
  }

  // ... other methods like getFeed, deletePost ...

  async likePost(postId: string, actorIdStr: string): Promise<void> {
    const post = await this.getPostById(postId);
    if (!post) {
      throw new AppError('Post not found', ErrorType.NotFound);
    }
    const actor = await this.actorService.getActorById(actorIdStr); // Use string ID from request
    if (!actor) {
      throw new AppError('Actor not found', ErrorType.NotFound);
    }

    // Check if already liked using the likedBy array
    if (post.likedBy?.some(id => id.equals(actor._id))) {
      // Correct: Check likedBy array
      console.log('Post already liked by this actor');
      return; // Or throw an error? Decide policy
    }

    await this.postRepository.likePost(post._id, actor._id); // Pass ObjectIds to repository

    // Notify post author (if different from liker)
    if (!post.actorId.equals(actor._id)) {
      // Correct: Compare ObjectIds using .equals()
      await this.notificationService.createNotification({
        type: 'like',
        recipientUserId: post.actorId.toString(), // Correct: Convert ObjectId to string
        actorId: actor._id.toString(), // Correct: Convert ObjectId to string
        postId: post.id,
      });
    }
  }

  async unlikePost(postId: string, actorIdStr: string): Promise<void> {
    const post = await this.getPostById(postId);
    if (!post) {
      throw new AppError('Post not found', ErrorType.NotFound);
    }
    const actor = await this.actorService.getActorById(actorIdStr); // Use string ID from request
    if (!actor) {
      throw new AppError('Actor not found', ErrorType.NotFound);
    }

    // Check if post is actually liked by this actor using likedBy array
    if (!post.likedBy?.some(id => id.equals(actor._id))) {
      // Correct: Check likedBy array
      console.log('Post not liked by this actor');
      return; // Or throw an error?
    }

    await this.postRepository.unlikePost(post._id, actor._id); // Pass ObjectIds to repository

    // Note: Typically, you don't notify on unlike actions.
  }
}
