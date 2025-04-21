import { DeepMockProxy } from 'jest-mock-extended';
import { AuthService } from '@/modules/auth/services/authService';
import { ActorService } from '@/modules/actors/services/actorService';
import { PostService } from '@/modules/posts/services/postService';
import { UploadService } from '@/modules/uploads/services/uploadService';
import { NotificationService } from '@/modules/notifications/services/notificationService';
import { CommentService } from '@/modules/comments/services/commentService';

declare global {
  var mockAuthService: DeepMockProxy<AuthService>;
  var mockActorService: DeepMockProxy<ActorService>;
  var mockPostService: DeepMockProxy<PostService>;
  var mockUploadService: DeepMockProxy<UploadService>;
  var mockNotificationService: DeepMockProxy<NotificationService>;
  var mockCommentService: DeepMockProxy<CommentService>;
}

// This file needs to be a module
export {};
