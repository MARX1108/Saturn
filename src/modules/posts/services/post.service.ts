import { NotificationService } from '@/modules/notifications/services/notification.service';
import { PostRepository } from '../repositories/post.repository';
import { ActorService } from '@/modules/actors/services/actor.service';

export class PostService {
  private notificationService!: NotificationService; // Added ! for definite assignment

  constructor(
    private readonly postRepository: PostRepository,
    private readonly actorService: ActorService,
    // Removed notificationService from constructor
    private readonly domain: string
  ) {}

  // Setter for NotificationService
  setNotificationService(notificationService: NotificationService) {
    this.notificationService = notificationService;
  }

  // ... existing code ...
}
