import { Comment, CreateCommentDto, FormattedComment } from '../models/comment';
import { CommentRepository } from '../repositories/comment.repository';
import { PostService } from '../../posts/services/postService';
import { ActorService } from '../../actors/services/actorService';
import { NotificationService } from '../../notifications/services/notification.service';
import { NotificationType } from '../../notifications/models/notification';
import { AppError, ErrorType } from '../../../utils/errors';

export class CommentService {
  private repository: CommentRepository;
  private postService: PostService;
  private actorService: ActorService;
  private notificationService: NotificationService;

  constructor(
    repository: CommentRepository,
    postService: PostService,
    actorService: ActorService,
    notificationService: NotificationService
  ) {
    this.repository = repository;
    this.postService = postService;
    this.actorService = actorService;
    this.notificationService = notificationService;
  }

  /**
   * Create a new comment on a post
   * @param postId - The ID of the post
   * @param authorId - The ID of the comment author
   * @param content - The comment text content
   */
  async createComment(
    postId: string,
    authorId: string,
    content: string
  ): Promise<FormattedComment> {
    // Validate content
    if (!content || content.trim().length === 0) {
      throw new AppError(
        'Comment content cannot be empty',
        400,
        ErrorType.VALIDATION
      );
    }

    // Check if post exists
    const post = await this.postService.getPostById(postId);
    if (!post) {
      throw new AppError(
        `Post with ID ${postId} not found`,
        404,
        ErrorType.NOT_FOUND
      );
    }

    // Get author information for notification
    const author = await this.actorService.getActorById(authorId);
    if (!author) {
      throw new AppError(
        `Actor with ID ${authorId} not found`,
        404,
        ErrorType.NOT_FOUND
      );
    }

    // Create the comment
    const commentData: CreateCommentDto = {
      postId,
      authorId,
      content: content.trim(),
    };

    const newComment = await this.repository.create(commentData);

    // Send notification to post author (if different from comment author)
    if (post.actor.id !== authorId) {
      await this.notificationService.createNotification({
        recipientUserId: post.actor.id,
        actorUserId: authorId,
        type: NotificationType.COMMENT,
        postId: postId,
        commentId: newComment._id?.toString(),
      });
    }

    // Process mentions in content to send notifications
    await this.processMentions(
      content,
      authorId,
      postId,
      newComment._id?.toString()
    );

    // Format and return the comment
    return this.formatComment(newComment, author);
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
    author: any | null
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
    authorId: string,
    postId: string,
    commentId?: string
  ): Promise<void> {
    // Regular expression to match @username mentions
    const mentionRegex = /@([a-zA-Z0-9_]+)/g;
    const mentions = content.match(mentionRegex);

    if (!mentions) return;

    // Process each unique mention
    const uniqueMentions = [...new Set(mentions.map(m => m.substring(1)))];

    for (const username of uniqueMentions) {
      // Find the mentioned actor
      const mentionedActor =
        await this.actorService.getActorByUsername(username);

      if (mentionedActor && mentionedActor._id !== authorId) {
        // Ensure mentionedActor._id is defined before using it
        if (mentionedActor._id) {
          // Send notification to the mentioned user
          await this.notificationService.createNotification({
            recipientUserId: mentionedActor._id,
            actorUserId: authorId,
            type: NotificationType.MENTION,
            postId,
            commentId,
          });
        } else {
          console.error(
            `Actor found for username ${username} but _id is undefined`
          );
        }
      }
    }
  }

  async getComments(postId: string): Promise<Comment[]> {
    // Implementation
    return [];
  }
}
