import { CreateNotificationDto } from '@/modules/notifications/models/notification';
import { NotificationService } from '@/modules/notifications/services/notification.service';
import { ObjectId } from 'mongodb';
import { Actor } from '@/modules/actors/models/actor'; // Use canonical Actor
import { ActorService } from '@/modules/actors/services/actorService';
import { PostService } from '@/modules/posts/services/postService';
import { Post } from '@/modules/posts/models/post';
import { AppError, ErrorType } from '@/utils/errors';
import { CommentRepository } from '../repositories/comment.repository';
import { Comment, CommentResponse } from '../models/comment.model';

// ... existing code ...
      throw new AppError('Post not found', ErrorType.NotFound);
    }

    // Check if the author of the post is the same as the commenter
    const postAuthorId = post.actorId; // Get the ObjectId directly
    if (postAuthorId && postAuthorId.equals(authorId)) {
      // Don't notify if the author is commenting on their own post
    } else if (postAuthorId) {
      // Send notification to the post author
      this.notificationService.createNotification({
        type: 'comment',
        recipientUserId: postAuthorId.toString(), // Convert ObjectId to string
        actorId: authorId.toString(), // Convert ObjectId to string
        postId: postId,
        commentId: newComment._id.toString(), // Convert ObjectId to string
      });
    }

    // Handle mentions
    if (comment.content.includes('@')) {
      // Perform mention handling asynchronously without awaiting
      // This avoids blocking the comment creation response
      this.handleMentions(
        comment.content,
        author,
        post
      ).catch(err => {
        console.error('Error handling mentions:', err);
      });
    }

    return comment;
  }

  private async formatCommentResponse(
    comment: Comment,
    author: Actor
  ): Promise<CommentResponse> {
    return {
      id: comment.id,
      content: comment.content,
      author: {
        id: author.id,
        username: author.username,
        displayName: author.displayName || author.preferredUsername, // Correct: Use displayName
        iconUrl: author.icon?.url,
      },
      postId: comment.postId,
      createdAt: comment.createdAt.toISOString(),
    };
  }

  private async handleMentions(
    commentContent: string,
    author: Actor,
    post: Post
  ) {
    const mentionRegex = /@([a-zA-Z0-9_]+(?:@[a-zA-Z0-9.-]+)?)/g;
    let match;
    const mentionedUsernames = new Set<string>();

    while ((match = mentionRegex.exec(commentContent)) !== null) {
      mentionedUsernames.add(match[1]);
    }

    const authorId = author._id; // Get author ObjectId

    for (const username of mentionedUsernames) {
      const mentionedActor = await this.actorService.resolveActor(username);
      // Check if mentioned actor exists and is not the author of the comment
      if (mentionedActor && !mentionedActor._id.equals(authorId)) {
        // Send notification for mention
        await this.notificationService.createNotification({
          type: 'mention',
          recipientUserId: mentionedActor._id.toString(), // Correct: Convert ObjectId to string
          actorId: authorId.toString(), // Correct: Convert ObjectId to string
          postId: post.id,
          commentId: undefined, // Adjust if comment ID needed for mention context
        });
      }
    }
  }
} 