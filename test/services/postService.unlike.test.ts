// Test setup for PostService unlike method
import { PostRepository } from '@/modules/posts/repositories/postRepository';
import { PostService } from '@/modules/posts/services/postService';
import { Db, ObjectId } from 'mongodb';
import { ActorService } from '@/modules/actors/services/actorService';
import { NotificationService } from '@/modules/notifications/services/notification.service';
import { Actor } from '@/modules/actors/models/actor'; // <<< Correct Actor import path
// Mocks (using jest-mock-extended or similar)
import { mock, MockProxy } from 'jest-mock-extended';

// Mock dependencies
let mockPostRepository: MockProxy<PostRepository>;
let mockActorService: MockProxy<ActorService>;
let mockNotificationService: MockProxy<NotificationService>;
let postService: PostService;
let mockDb: MockProxy<Db>; // If needed

// Sample data
const postId = new ObjectId().toHexString();
const actorId = new ObjectId().toHexString();
const nonExistentPostId = new ObjectId().toHexString();

beforeEach(() => {
  // Reset mocks before each test
  mockPostRepository = mock<PostRepository>();
  mockActorService = mock<ActorService>();
  mockNotificationService = mock<NotificationService>();
  mockDb = mock<Db>(); // If Db is directly used, else remove
  const domain = 'test.com'; // Provide a dummy domain

  // Instantiate the service with mocked dependencies
  postService = new PostService(
    mockPostRepository,
    mockActorService,
    domain
    // Pass mockNotificationService if required by constructor
  );
});

describe('PostService - unlikePost', () => {
  it('should successfully unlike a post and return true', async () => {
    // Arrange: Mock repository to successfully unlike
    mockPostRepository.unlikePost.mockResolvedValue(true);

    // Act: Call the unlikePost method
    const result = await postService.unlikePost(postId, actorId);

    // Assert: Check if the repository method was called and result is true
    expect(result).toBe(true);
    expect(mockPostRepository.unlikePost).toHaveBeenCalledWith(postId, actorId);
    // Optionally, assert that no notification was created
    expect(mockNotificationService.createNotification).not.toHaveBeenCalled();
  });

  it('should return false if the post was not found or already unliked', async () => {
    // Arrange: Mock repository to indicate failure (e.g., post not found or not liked by user)
    mockPostRepository.unlikePost.mockResolvedValue(false);

    // Act: Call the unlikePost method
    const result = await postService.unlikePost(nonExistentPostId, actorId);

    // Assert: Check if the repository method was called and result is false
    expect(result).toBe(false);
    expect(mockPostRepository.unlikePost).toHaveBeenCalledWith(
      nonExistentPostId,
      actorId
    );
  });

  it('should handle errors from the repository', async () => {
    // Arrange: Mock repository to throw an error
    const expectedError = new Error('Database error during unlike');
    mockPostRepository.unlikePost.mockRejectedValue(expectedError);

    // Act & Assert: Expect the service method to reject with the same error
    await expect(postService.unlikePost(postId, actorId)).rejects.toThrow(
      expectedError
    );
    expect(mockPostRepository.unlikePost).toHaveBeenCalledWith(postId, actorId);
  });

  // Add more tests as needed (e.g., interaction with NotificationService if applicable)
});
