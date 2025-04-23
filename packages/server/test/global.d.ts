// Global type definitions for tests
import { Db } from 'mongodb';
import { Express } from 'express';
import { SuperTest, Test } from 'supertest';

declare global {
  let testApp: Express;
  let mongoDb: Db;
  let request: (app: any) => SuperTest<Test>;
  let mockAuthService: any;
  let mockActorService: any;
  let mockPostService: any;
  let mockUploadService: any;
  let mockNotificationService: any;
  let mockCommentService: any;
  let mockMediaService: any;
  let mockActivityPubService: any;
  let mockWebfingerService: any;
  let mockPostsController: any;
  let mockCommentsController: any;
  let mockAuthController: any;
  let mockActorsController: any;
  let mockMediaController: any;
  let mockActivityPubController: any;
  let mockWebfingerController: any;
  let isPostLikedTestState: boolean;
}
