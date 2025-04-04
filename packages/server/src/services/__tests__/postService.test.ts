import { ObjectId } from 'mongodb';
import { PostService } from '../postService';
import { Post } from '../../types/post';
import { PostRepository } from '../../repositories/postRepository';

// Mock the postRepository
jest.mock('../../repositories/postRepository');
// Mock the plugins system
jest.mock('../../plugins', () => ({
  triggerHook: jest.fn()
}));

// Create a mock instance of PostRepository
const MockPostRepository = PostRepository as jest.MockedClass<typeof PostRepository>;

describe('PostService', () => {
  let postService: PostService;
  let mockRepository: jest.Mocked<PostRepository>;
  const mockDomain = 'example.com';

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Create a mock DB (it won't be used because we're mocking the repository)
    const mockDb: any = {};
    
    // Create an instance of the service with our mocked repository
    postService = new PostService(mockDb, mockDomain);
    
    // Get the mocked repository instance from the constructor
    mockRepository = MockPostRepository.mock.instances[0] as jest.Mocked<PostRepository>;
  });

  it('should create a post', async () => {
    // Arrange
    const actorId = new ObjectId().toString();
    const postData = {
      content: 'Test post content',
      username: 'testuser',
      sensitive: false,
      contentWarning: '',
      attachments: []
    };

    const expectedPost: Post = {
      _id: new ObjectId(),
      content: postData.content,
      actorId: new ObjectId(actorId),
      createdAt: expect.any(Date),
      sensitive: false,
      contentWarning: '',
      attachments: [],
      likes: 0,
      replies: 0,
      reposts: 0,
      type: 'Note',
      id: expect.stringContaining(`https://${mockDomain}/posts/`),
      attributedTo: `https://${mockDomain}/users/${postData.username}`,
    };

    // Mock the create method of our repository to return the expected post
    mockRepository.create.mockResolvedValue(expectedPost);

    // Act
    const result = await postService.createPost(postData, actorId);

    // Assert
    expect(mockRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        content: postData.content,
        actorId: expect.any(ObjectId),
        createdAt: expect.any(Date),
      })
    );
    expect(result).toEqual(expectedPost);
  });

  it('should get a post by ID', async () => {
    // Arrange
    const postId = new ObjectId().toString();
    const expectedPost: Post = {
      _id: new ObjectId(postId),
      content: 'Test post',
      actorId: new ObjectId(),
      createdAt: new Date(),
      sensitive: false,
      contentWarning: '',
      attachments: [],
      likes: 0,
      replies: 0,
      reposts: 0,
      type: 'Note',
      id: `https://${mockDomain}/posts/${postId}`,
      attributedTo: `https://${mockDomain}/users/testuser`,
    };

    // Mock the findById method
    mockRepository.findById.mockResolvedValue(expectedPost);

    // Act
    const result = await postService.getPostById(postId);

    // Assert
    expect(mockRepository.findById).toHaveBeenCalledWith(postId);
    expect(result).toEqual(expectedPost);
  });

  it('should update a post if user is the owner', async () => {
    // Arrange
    const postId = new ObjectId().toString();
    const actorId = new ObjectId().toString();
    const updates = {
      content: 'Updated content',
      sensitive: true,
      contentWarning: 'Warning',
    };

    const existingPost: Post = {
      _id: new ObjectId(postId),
      content: 'Original content',
      actorId: new ObjectId(actorId),
      createdAt: new Date(),
      sensitive: false,
      contentWarning: '',
      attachments: [],
      likes: 0,
      replies: 0,
      reposts: 0,
      type: 'Note',
      id: `https://${mockDomain}/posts/${postId}`,
      attributedTo: `https://${mockDomain}/users/testuser`,
    };

    const updatedPost: Post = {
      ...existingPost,
      content: updates.content,
      sensitive: updates.sensitive,
      contentWarning: updates.contentWarning,
    };

    // Mock repository methods
    mockRepository.isOwner.mockResolvedValue(true);
    mockRepository.update.mockResolvedValue(true);
    mockRepository.findById.mockResolvedValue(updatedPost);

    // Act
    const result = await postService.updatePost(postId, actorId, updates);

    // Assert
    expect(mockRepository.isOwner).toHaveBeenCalledWith(postId, actorId);
    expect(mockRepository.update).toHaveBeenCalledWith(
      postId,
      expect.objectContaining({
        content: updates.content,
        sensitive: updates.sensitive,
        contentWarning: updates.contentWarning,
      })
    );
    expect(result).toEqual(updatedPost);
  });

  it('should not update a post if user is not the owner', async () => {
    // Arrange
    const postId = new ObjectId().toString();
    const actorId = new ObjectId().toString();
    
    // Mock isOwner to return false (user is not the owner)
    mockRepository.isOwner.mockResolvedValue(false);

    // Act
    const result = await postService.updatePost(
      postId, 
      actorId, 
      { content: 'Unauthorized update' }
    );

    // Assert
    expect(mockRepository.isOwner).toHaveBeenCalledWith(postId, actorId);
    expect(mockRepository.update).not.toHaveBeenCalled();
    expect(result).toBeNull();
  });

  it('should delete a post if user is the owner', async () => {
    // Arrange
    const postId = new ObjectId().toString();
    const actorId = new ObjectId().toString();
    
    // Mock repository methods
    mockRepository.isOwner.mockResolvedValue(true);
    mockRepository.delete.mockResolvedValue(true);

    // Act
    const result = await postService.deletePost(postId, actorId);

    // Assert
    expect(mockRepository.isOwner).toHaveBeenCalledWith(postId, actorId);
    expect(mockRepository.delete).toHaveBeenCalledWith(postId);
    expect(result).toBe(true);
  });

  it('should not delete a post if user is not the owner', async () => {
    // Arrange
    const postId = new ObjectId().toString();
    const actorId = new ObjectId().toString();
    
    // Mock isOwner to return false (user is not the owner)
    mockRepository.isOwner.mockResolvedValue(false);

    // Act
    const result = await postService.deletePost(postId, actorId);

    // Assert
    expect(mockRepository.isOwner).toHaveBeenCalledWith(postId, actorId);
    expect(mockRepository.delete).not.toHaveBeenCalled();
    expect(result).toBe(false);
  });

  it('should like a post', async () => {
    // Arrange
    const postId = new ObjectId().toString();
    const actorId = new ObjectId().toString();
    
    // Mock repository methods
    mockRepository.likePost.mockResolvedValue(true);

    // Act
    const result = await postService.likePost(postId, actorId);

    // Assert
    expect(mockRepository.likePost).toHaveBeenCalledWith(postId);
    expect(result).toBe(true);
  });
});