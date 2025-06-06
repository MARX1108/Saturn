import { Db } from "@/modules/database/db";
import { ActorService } from "@/modules/actors/services/actor.service";
import { PostService } from "@/modules/posts/services/post.service";
import { CommentService } from "@/modules/comments/services/comment.service";
import { NotificationType } from "../models/notification";

export class NotificationService {
  private postService!: PostService;
  private commentService!: CommentService;

  constructor(
    private readonly db: Db,
    private readonly actorService: ActorService
  ) {}

  setPostService(postService: PostService) {
    this.postService = postService;
  }

  setCommentService(commentService: CommentService) {
    this.commentService = commentService;
  }

  let actorName = 'Someone';
  let actorHandle = '';
  if (dto.actorId) {
    try {
      // actorId in DTO is now ObjectId | string, convert to string for lookup if needed
      const actorIdStr = typeof dto.actorId === 'string' ? dto.actorId : dto.actorId.toString();
      const actor = await this.actorService?.getActorById(actorIdStr);
      if (actor) {
        actorName = actor.displayName || actor.preferredUsername;
        actorHandle = actor.username;
      }
    } catch (error) {
      console.error(`Failed to fetch actor ${dto.actorId}:`, error);
    }
  }

  private async formatNotificationResponse(
    notification: Notification
  ): Promise<NotificationResponse> {
    let actorInfo: ActorSummary | undefined;
    if (notification.actorId) {
      try {
        const actor = await this.actorService?.getActorById(
          notification.actorId.toString() // Convert ObjectId to string
        );
        if (actor) {
          actorInfo = {
            id: actor._id.toString(), // Correct: Convert ObjectId to string
            username: actor.username,
            displayName: actor.displayName, // Correct: Use displayName
            iconUrl: actor.icon?.url,
          };
        }
      } catch (error) {
        console.error(
          `Failed to fetch actor ${notification.actorId} for notification ${notification._id}:`,
          error
        );
      }
    }
  }
} 