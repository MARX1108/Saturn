// Global type definitions for tests
import { Db } from 'mongodb';
import { Express } from 'express';
import { SuperTest, Test } from 'supertest';

// Use 'var' or namespace augmentation for true global properties
declare global {
  // eslint-disable-next-line no-var
  var testApp: Express;
  // eslint-disable-next-line no-var
  var mongoDb: Db;
  // eslint-disable-next-line no-var
  var request: (app: any) => SuperTest<Test>; // Still 'any' here, target later
  // eslint-disable-next-line no-var
  var mockAuthService: any; // Target later
  // eslint-disable-next-line no-var
  var mockActorService: any; // Target later
  // eslint-disable-next-line no-var
  var mockPostService: any; // Target later
  // eslint-disable-next-line no-var
  var mockUploadService: any; // Target later
  // eslint-disable-next-line no-var
  var mockNotificationService: any; // Target later
  // eslint-disable-next-line no-var
  var mockCommentService: any; // Target later
  // eslint-disable-next-line no-var
  var mockMediaService: any; // Target later
  // eslint-disable-next-line no-var
  var mockActivityPubService: any; // Target later
  // eslint-disable-next-line no-var
  var mockWebfingerService: any; // Target later
  // eslint-disable-next-line no-var
  var mockPostsController: any; // Target later
  // eslint-disable-next-line no-var
  var mockCommentsController: any; // Target later
  // eslint-disable-next-line no-var
  var mockAuthController: any; // Target later
  // eslint-disable-next-line no-var
  var mockActorsController: any; // Target later
  // eslint-disable-next-line no-var
  var mockMediaController: any; // Target later
  // eslint-disable-next-line no-var
  var mockActivityPubController: any; // Target later
  // eslint-disable-next-line no-var
  var mockWebfingerController: any; // Target later
  // eslint-disable-next-line no-var
  var isPostLikedTestState: boolean;
}
