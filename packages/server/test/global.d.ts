// Global type definitions for tests
import { Db } from 'mongodb';
import { Express } from 'express';
import { SuperTest, Test } from 'supertest';

declare global {
  var testApp: Express;
  var mongoDb: Db;
  var request: (app: any) => SuperTest<Test>;
  var mockAuthService: any;
  var mockActorService: any;
  var mockPostService: any;
  var mockUploadService: any;
  var mockNotificationService: any;
  var mockCommentService: any;
  var mockMediaService: any;
  var mockActivityPubService: any;
  var mockWebfingerService: any;
  var mockPostsController: any;
  var mockCommentsController: any;
  var mockAuthController: any;
  var mockActorsController: any;
  var mockMediaController: any;
  var mockActivityPubController: any;
  var mockWebfingerController: any;
  var isPostLikedTestState: boolean;
}
