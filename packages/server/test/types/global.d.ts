import { DeepMockProxy } from 'jest-mock-extended';
import { AuthService } from '@/modules/auth/services/auth.service';
import { ActorService } from '@/modules/actors/services/actorService';
import { PostService } from '@/modules/posts/services/postService';
import { UploadService } from '@/modules/media/services/upload.service';
import { NotificationService } from '@/modules/notifications/services/notification.service';
import { CommentService } from '@/modules/comments/services/comment.service';
import { Express } from 'express';

declare global {
  var testApp: Express;
  var mockAuthService: DeepMockProxy<AuthService>;
  var mockActorService: DeepMockProxy<ActorService>;
  var mockPostService: DeepMockProxy<PostService>;
  var mockUploadService: DeepMockProxy<UploadService>;
  var mockNotificationService: DeepMockProxy<NotificationService>;
  var mockCommentService: DeepMockProxy<CommentService>;

  namespace NodeJS {
    interface Global {
      testApp: Express;
      mockAuthService: DeepMockProxy<AuthService>;
      mockActorService: DeepMockProxy<ActorService>;
      mockPostService: DeepMockProxy<PostService>;
      mockUploadService: DeepMockProxy<UploadService>;
      mockNotificationService: DeepMockProxy<NotificationService>;
      mockCommentService: DeepMockProxy<CommentService>;
    }
  }
}

// Export something to make it a module
export {};
