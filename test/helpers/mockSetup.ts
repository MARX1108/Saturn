import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { AuthService } from '@/modules/auth/services/auth.service';
import { ActorService } from '@/modules/actors/services/actorService';
import { PostService } from '@/modules/posts/services/postService';
import { UploadService } from '@/modules/media/services/upload.service';
import { NotificationService } from '@/modules/notifications/services/notification.service';
import { CommentService } from '@/modules/comments/services/comment.service';
import { ServiceContainer } from '@/utils/container';
import { auth } from '@/middleware/auth';
import { Actor } from '@/types/actor';
import { Post } from '@/modules/posts/models/post';
import { DbUser } from '@/modules/auth/models/user';
import { Request, Response, NextFunction } from 'express';
// Mock the dependencies
