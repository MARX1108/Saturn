import { DeepMockProxy } from 'jest-mock-extended';
import { AuthService } from '@/modules/auth/services/auth.service';
import { ActorService } from '@/modules/actors/services/actorService';
import { PostService } from '@/modules/posts/services/postService';
import { UploadService } from '@/modules/media/services/upload.service';
import { NotificationService } from '@/modules/notifications/services/notification.service';
import { CommentService } from '@/modules/comments/services/comment.service';
import { Express } from 'express';
import { Db } from 'mongodb';
import { _Application } from 'express';
import { _SuperAgentTest } from 'supertest';
import { _ServiceContainer } from '@/utils/container';

declare global {
  let testApp: Express;
  let mockAuthService: DeepMockProxy<AuthService>;
  let mockActorService: DeepMockProxy<ActorService>;
  let mockPostService: DeepMockProxy<PostService>;
  let mockUploadService: DeepMockProxy<UploadService>;
  let mockNotificationService: DeepMockProxy<NotificationService>;
  let mockCommentService: DeepMockProxy<CommentService>;
  let request: typeof request;
  let mongoDb: Db;

  namespace NodeJS {
    interface Global {
      testApp: Express;
      mockAuthService: DeepMockProxy<AuthService>;
      mockActorService: DeepMockProxy<ActorService>;
      mockPostService: DeepMockProxy<PostService>;
      mockUploadService: DeepMockProxy<UploadService>;
      mockNotificationService: DeepMockProxy<NotificationService>;
      mockCommentService: DeepMockProxy<CommentService>;
      request: typeof request;
      mongoDb: Db;
    }
  }
}

// Export something to make it a module
export {};
