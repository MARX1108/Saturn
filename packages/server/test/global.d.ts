// Global type definitions for tests
import { Db } from 'mongodb';
import { Express } from 'express';
import { SuperTest, Test } from 'supertest';
import { DeepMockProxy } from 'jest-mock-extended';
import { PostService } from '@/modules/posts/services/postService';
import { AuthService } from '@/modules/auth/services/auth.service';
import { ActorService } from '@/modules/actors/services/actorService';
import { UploadService } from '@/modules/media/services/upload.service';
import { NotificationService } from '@/modules/notifications/services/notification.service';
import { CommentService } from '@/modules/comments/services/comment.service';
import { MediaService } from '@/modules/media/services/media.service';
import { ActivityPubService } from '@/modules/activitypub/services/activitypub.service';
import { WebfingerService } from '@/modules/webfinger/services/webfinger.service';
import { PostsController } from '@/modules/posts/controllers/postsController';
import { CommentsController } from '@/modules/comments/controllers/commentsController';
import { AuthController } from '@/modules/auth/controllers/authController';
import { ActorsController } from '@/modules/actors/controllers/actorsController';
import { MediaController } from '@/modules/media/controllers/mediaController';
import { ActivityPubController } from '@/modules/activitypub/controllers/activitypubController';
import { WebFingerController } from '@/modules/webfinger/controllers/webfingerController';

// Use 'var' or namespace augmentation for true global properties
declare global {
  // eslint-disable-next-line no-var
  var testApp: Express;
  // eslint-disable-next-line no-var
  var mongoDb: Db;
  // eslint-disable-next-line no-var
  var request: (app: Express) => SuperTest<Test>;
  // eslint-disable-next-line no-var
  var mockAuthService: DeepMockProxy<AuthService>;
  // eslint-disable-next-line no-var
  var mockActorService: DeepMockProxy<ActorService>;
  // eslint-disable-next-line no-var
  var mockPostService: DeepMockProxy<PostService>;
  // eslint-disable-next-line no-var
  var mockUploadService: DeepMockProxy<UploadService>;
  // eslint-disable-next-line no-var
  var mockNotificationService: DeepMockProxy<NotificationService>;
  // eslint-disable-next-line no-var
  var mockCommentService: DeepMockProxy<CommentService>;
  // eslint-disable-next-line no-var
  var mockMediaService: DeepMockProxy<MediaService>;
  // eslint-disable-next-line no-var
  var mockActivityPubService: DeepMockProxy<ActivityPubService>;
  // eslint-disable-next-line no-var
  var mockWebfingerService: DeepMockProxy<WebfingerService>;
  // eslint-disable-next-line no-var
  var mockPostsController: DeepMockProxy<PostsController>;
  // eslint-disable-next-line no-var
  var mockCommentsController: DeepMockProxy<CommentsController>;
  // eslint-disable-next-line no-var
  var mockAuthController: DeepMockProxy<AuthController>;
  // eslint-disable-next-line no-var
  var mockActorsController: DeepMockProxy<ActorsController>;
  // eslint-disable-next-line no-var
  var mockMediaController: DeepMockProxy<MediaController>;
  // eslint-disable-next-line no-var
  var mockActivityPubController: DeepMockProxy<ActivityPubController>;
  // eslint-disable-next-line no-var
  var mockWebfingerController: DeepMockProxy<WebFingerController>;
  // eslint-disable-next-line no-var
  var isPostLikedTestState: boolean;
}
