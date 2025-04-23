import { Comment, CreateCommentDto, FormattedComment } from '../models/comment';
import { CommentRepository } from '../repositories/comment.repository';
import { PostService } from '../../posts/services/postService';
import { ActorService } from '../../actors/services/actorService';
import { NotificationService } from '../../notifications/services/notification.service';
import { NotificationType } from '../../notifications/models/notification';
import { AppError, ErrorType } from '@/utils/errors';
import { Actor } from '@/modules/actors/models/actor';
import { Post } from '@/modules/posts/models/post';
import { ObjectId } from 'mongodb';
import { OptionalId } from 'mongodb';
import { CreateNotificationDto } from '../../notifications/models/notification';

export class CommentService {
  private repository: CommentRepository;
  private postService!: PostService;
  private actorService!: ActorService;
  private notificationService!: NotificationService;

  constructor(repository: CommentRepository) {
    this.repository = repository;
  }

  public setPostService(postService: PostService): void {
    this.postService = postService;
  }

  public setActorService(actorService: ActorService): void {
    this.actorService = actorService;
  }

  public setNotificationService(
    notificationService: NotificationService
  ): void {
    this.notificationService = notificationService;
  }

  /**
   * Create a new comment on a post
   * @param postId - The ID of the post
   * @param authorId - The ID of the comment author
   * @param content - The comment text content
   */
  async createComment(
    postId: string | ObjectId,
    authorId: string | ObjectId,
    data: CreateCommentDto
  ): Promise<Comment> {
    const post = await this.postService.getPostById(postId.toString());
    if (!post) {
      throw new AppError('Post not found', 404, ErrorType.NOT_FOUND);
    }

    const actor = await this.actorService.getActorById(authorId);
    if (!actor) {
      throw new AppError('Author not found', 404, ErrorType.NOT_FOUND);
    }

    const now = new Date();
    const commentData: OptionalId<Comment> = {
      ...data,
      actorId: actor._id,
      postId: post._id.toHexString(),
      createdAt: now,
      updatedAt: now,
      likesCount: 0,
      likedBy: [],
    };

    const createdComment = await this.repository.create(commentData);

    // Send notification to post author (if different from comment author)
    if (post.actorId.toHexString() !== actor._id.toHexString()) {
      const commentIdForNotification =
        createdComment._id instanceof ObjectId
          ? createdComment._id.toHexString()
          : createdComment._id; // Assume it's string if not ObjectId

      await this.notificationService.createNotification({
        recipientUserId: post.actorId.toHexString(),
        actorUserId: actor._id.toHexString(),
        type: NotificationType.COMMENT,
        postId: post._id.toHexString(),
        commentId: commentIdForNotification, // <<< Use checked variable
      });
    }

    // Process mentions in content to send notifications
    await this.processMentions(
      data.content,
      authorId,
      postId,
      createdComment._id // Pass original id here
    );

    return createdComment;
  }

  /**
   * Get comments for a specific post
   * @param postId - The ID of the post
   * @param paginationOptions - Pagination options (limit, offset)
   */
  async getCommentsForPost(
    postId: string,
    paginationOptions: { limit: number; offset: number }
  ): Promise<{
    comments: FormattedComment[];
    total: number;
    limit: number;
    offset: number;
  }> {
    // Check if post exists (optional)
    const post = await this.postService.getPostById(postId);
    if (!post) {
      throw new AppError(
        `Post with ID ${postId} not found`,
        404,
        ErrorType.NOT_FOUND
      );
    }

    // Get comments with pagination
    const { comments, total } = await this.repository.findCommentsByPostId(
      postId,
      paginationOptions
    );

    // Format comments with author details
    const formattedComments = await Promise.all(
      comments.map(async comment => {
        const author = await this.actorService.getActorById(comment.authorId);
        return this.formatComment(comment, author);
      })
    );

    return {
      comments: formattedComments,
      total,
      limit: paginationOptions.limit,
      offset: paginationOptions.offset,
    };
  }

  /**
   * Delete a comment
   * @param commentId - The ID of the comment to delete
   * @param requestingUserId - The ID of the user making the delete request
   */
  async deleteComment(
    commentId: string,
    requestingUserId: string
  ): Promise<boolean> {
    const result = await this.repository.deleteByIdAndAuthorId(
      commentId,
      requestingUserId
    );

    if (result.deletedCount === 0) {
      throw new AppError(
        "Comment not found or you don't have permission to delete it",
        404,
        ErrorType.NOT_FOUND
      );
    }

    return true;
  }

  /**
   * Helper method to format a comment with author details
   * @private
   */
  private formatComment(
    comment: Comment,
    author: Actor | null
  ): FormattedComment {
    return {
      ...comment,
      author: {
        id: comment.authorId,
        username: author?.preferredUsername || 'unknown',
        displayName:
          author?.name || author?.preferredUsername || 'Unknown User',
        avatarUrl: author?.icon?.url,
      },
    };
  }

  /**
   * Process mentions in comment content to send notifications
   * @private
   */
  private async processMentions(
    content: string,
    authorId: string | ObjectId,
    postId: string | ObjectId,
    commentId?: string | ObjectId
  ): Promise<void> {
    const mentions = content.match(/@([a-zA-Z0-9_]+)/g);
    if (!mentions) return;

    for (const mention of mentions) {
      const username = mention.substring(1);
      const mentionedUser =
        await this.actorService.getActorByUsername(username);

      if (
        mentionedUser &&
        mentionedUser._id.toHexString() !==
          (typeof authorId === 'string' ? authorId : authorId.toHexString())
      ) {
        const commentIdForNotification =
          commentId instanceof ObjectId ? commentId.toHexString() : commentId; // Assume string if not ObjectId

        const notificationDto: CreateNotificationDto = {
          type: NotificationType.MENTION,
          recipientUserId: mentionedUser._id.toHexString(),
          actorUserId:
            typeof authorId === 'string' ? authorId : authorId.toHexString(),
          content: `mentioned you in a comment: ${content.substring(0, 50)}...`,
          postId: typeof postId === 'string' ? postId : postId.toHexString(),
          commentId: commentIdForNotification, // <<< Use checked variable
        };
        await this.notificationService.createNotification(notificationDto);
      }
    }
  }

  async getComments(postId: string): Promise<Comment[]> {
    // Implementation
    return [];
  }
}
