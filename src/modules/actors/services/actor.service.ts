import { NotificationService } from '@/modules/notifications/services/notification.service';
import { Actor } from '../models/actor';
import { ActorRepository } from '../repositories/actor.repository';

export class ActorService {
  private notificationService!: NotificationService; // Added ! for definite assignment

  constructor(
    private readonly actorRepository: ActorRepository,
    // Removed notificationService from constructor
    private readonly domain: string
  ) {}

  // Setter for NotificationService
  setNotificationService(notificationService: NotificationService) {
    this.notificationService = notificationService;
  }
  // ... existing code ...
}
