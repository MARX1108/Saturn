import request from 'supertest';
import { jest } from '@jest/globals';
import { mockActorService, mockPostService } from '../helpers/mockSetup';
import { Actor } from '@/modules/actors/models/actor';
import { Post, PostResponse } from '@/modules/posts/models/post';
import { ObjectId } from 'mongodb';

describe('Post Routes', () => {
  const mockDate = new Date();
  const mockActorId = new ObjectId('60a0f3f1e1b8f1a1a8b4c1c1');
  const mockPostId = new ObjectId('60a0f3f1e1b8f1a1a8b4c1c2');

  const mockActor: Actor = {
    _id: mockActorId,
    id: `https://test.domain/users/${mockActorId.toHexString()}`,
    type: 'Person',
    username: 'testuser@test.domain',
    preferredUsername: 'testuser',
    email: 'testuser@test.domain',
    displayName: 'Test User',
    summary: 'Test Summary',
    inbox: `https://test.domain/users/${mockActorId.toHexString()}/inbox`,
    outbox: `https://test.domain/users/${mockActorId.toHexString()}/outbox`,
    followers: `https://test.domain/users/${mockActorId.toHexString()}/followers`,
    following: [],
    publicKey: {
      id: 'key-id',
      owner: mockActorId.toString(),
      publicKeyPem: '---',
    },
    isAdmin: false,
    isVerified: true,
    createdAt: mockDate,
    updatedAt: mockDate,
  };

  const fullMockPost: Post = {
    _id: mockPostId,
    id: `https://test.domain/posts/${mockPostId.toHexString()}`,
    type: 'Note',
    actorId: mockActorId,
    content: 'Test post content',
    visibility: 'public',
    sensitive: false,
    attachments: [],
    published: mockDate,
    createdAt: mockDate,
    updatedAt: mockDate,
    attributedTo: mockActor.id,
    to: ['https://www.w3.org/ns/activitystreams#Public'],
    cc: [],
    url: `https://test.domain/posts/${mockPostId.toHexString()}`,
    replyCount: 0,
    likes: 0,
    likedBy: [],
    shares: 0,
    sharedBy: [],
    actor: mockActor,
  };

  beforeEach(() => {
    mockPostService.getPostById.mockResolvedValue(fullMockPost);
    mockActorService.getActorById.mockResolvedValue(mockActor);
  });

  it('should return a post by ID', async () => {
    const response = await request((global as any).testApp)
      .get(`/api/posts/${fullMockPost.id}`)
      .set('Authorization', 'Bearer mock-test-token')
      .expect(200);

    const expectedResponse: PostResponse = {
      id: fullMockPost.id,
      content: fullMockPost.content,
      author: {
        id: mockActor.id,
        username: mockActor.username,
        preferredUsername: mockActor.preferredUsername,
        displayName: mockActor.displayName,
        iconUrl: mockActor.icon?.url,
      },
      published: fullMockPost.published.toISOString(),
      sensitive: fullMockPost.sensitive,
      contentWarning: fullMockPost.contentWarning,
      attachments: fullMockPost.attachments,
      likes: fullMockPost.likes,
      likedByUser: false,
      shares: fullMockPost.shares,
      sharedByUser: false,
      replyCount: fullMockPost.replyCount,
      visibility: fullMockPost.visibility,
      url: fullMockPost.url,
    };
    expect(response.body).toEqual(expectedResponse);
  });

  it('should like a post', async () => {
    const response = await request((global as any).testApp)
      .post(`/api/posts/${fullMockPost.id}/like`)
      .set('Authorization', 'Bearer mock-test-token')
      .expect(200);

    expect(mockPostService.likePost).toHaveBeenCalledWith(
      fullMockPost.id,
      'mockUserId'
    );
    expect(response.body).toEqual({ message: 'Post liked' });
  });

  it('should unlike a post', async () => {
    const response = await request((global as any).testApp)
      .post(`/api/posts/${fullMockPost.id}/unlike`)
      .set('Authorization', 'Bearer mock-test-token')
      .expect(200);

    expect(mockPostService.unlikePost).toHaveBeenCalledWith(
      fullMockPost.id,
      'mockUserId'
    );
    expect(response.body).toEqual({ message: 'Post unliked' });
  });

  it('should create a new post', async () => {
    mockActorService.getActorById.mockResolvedValue(mockActor);
    const createdPostMock = {
      ...fullMockPost,
      _id: new ObjectId(),
      actor: mockActor,
    };
    mockPostService.createPost.mockResolvedValue(createdPostMock);

    const response = await request((global as any).testApp)
      .post('/api/posts')
      .set('Authorization', 'Bearer mock-test-token')
      .send({ content: 'New post content' })
      .expect(201);

    const expectedResponse: PostResponse = {
      id: createdPostMock.id,
      content: createdPostMock.content,
      author: {
        id: mockActor.id,
        username: mockActor.username,
        preferredUsername: mockActor.preferredUsername,
        displayName: mockActor.displayName,
        iconUrl: mockActor.icon?.url,
      },
      published: createdPostMock.published.toISOString(),
      sensitive: createdPostMock.sensitive,
      contentWarning: createdPostMock.contentWarning,
      attachments: createdPostMock.attachments,
      likes: createdPostMock.likes,
      likedByUser: false,
      shares: createdPostMock.shares,
      sharedByUser: false,
      replyCount: createdPostMock.replyCount,
      visibility: createdPostMock.visibility,
      url: createdPostMock.url,
    };

    expect(response.body).toEqual(expectedResponse);
    expect(mockPostService.createPost).toHaveBeenCalledWith(
      {
        content: 'New post content',
        visibility: 'public',
        sensitive: false,
        contentWarning: undefined,
      },
      mockActorId
    );
  });
});
