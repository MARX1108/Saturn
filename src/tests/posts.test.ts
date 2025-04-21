import { configurePostRoutes } from '@/modules/posts/routes/postRoutes';
import { PostsController } from '@/modules/posts/controllers/postsController';
import { CommentsController } from '@/modules/comments/controllers/comments.controller';

// Setup Express app with mocked services
const app = express();
app.use(express.json());

// Mock the dependencies needed by configurePostRoutes
const mockPostsController = mock<PostsController>();
const mockCommentsController = mock<CommentsController>();
const mockActorService = mock<ActorService>();
const mockUploadService = mock<UploadService>();
const mockServiceContainer = {
  postsController: mockPostsController,
  commentsController: mockCommentsController,
  actorService: mockActorService,
  uploadService: mockUploadService,
};

// Apply the routes with all necessary mock controllers/services
app.use('/', configurePostRoutes(mockServiceContainer as any));

// ... rest of the test file ...
