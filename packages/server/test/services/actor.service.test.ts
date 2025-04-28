import { jest } from '@jest/globals';
import { DeepMockProxy, mock } from 'jest-mock-extended';
import { ObjectId } from 'mongodb';
import { ActorService } from '../../src/modules/actors/services/actorService';
import { ActorRepository } from '../../src/modules/actors/repositories/actorRepository';
import { Actor } from '../../src/modules/actors/models/actor';
import { NotificationService } from '../../src/modules/notifications/services/notification.service';
import { AppError, ErrorType } from '../../src/utils/errors';

// Mock data
const mockDomain = 'example.com';
const mockObjectId = new ObjectId();
const mockActorId = mockObjectId.toHexString();

const mockActor: Actor = {
  _id: mockObjectId,
  id: `https://${mockDomain}/users/testuser`,
  type: 'Person',
  username: `testuser@${mockDomain}`,
  preferredUsername: 'testuser',
  email: 'test@example.com',
  password: 'hashedpassword',
  displayName: 'Test User',
  summary: 'Test summary',
  inbox: `https://${mockDomain}/users/testuser/inbox`,
  outbox: `https://${mockDomain}/users/testuser/outbox`,
  followers: `https://${mockDomain}/users/testuser/followers`,
  following: [],
  publicKey: {
    id: `https://${mockDomain}/users/testuser#main-key`,
    owner: `https://${mockDomain}/users/testuser`,
    publicKeyPem: 'mock-public-key',
  },
  privateKey: 'mock-private-key',
  isAdmin: false,
  isVerified: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('ActorService', () => {
  let actorService: ActorService;
  let mockActorRepository: DeepMockProxy<ActorRepository>;
  let mockNotificationService: DeepMockProxy<NotificationService>;

  beforeEach(() => {
    // Create mock repository
    mockActorRepository = mock<ActorRepository>();

    // Initialize service with mocked dependencies
    actorService = new ActorService(mockActorRepository, mockDomain);

    // Create and set mock notification service
    mockNotificationService = mock<NotificationService>();
    actorService.setNotificationService(mockNotificationService);

    // Clear all mocks between tests
    jest.clearAllMocks();
  });

  describe('createLocalActor', () => {
    it('should create a local actor successfully', async () => {
      // Arrange
      const createData = {
        username: 'newuser',
        email: 'newuser@example.com',
        password: 'password123',
        displayName: 'New User',
        summary: 'New user summary',
      };

      mockActorRepository.findOne.mockResolvedValueOnce(null); // Username check
      mockActorRepository.findOne.mockResolvedValueOnce(null); // Email check
      mockActorRepository.create.mockResolvedValueOnce({
        ...mockActor,
        _id: new ObjectId(),
        preferredUsername: createData.username,
        username: `${createData.username}@${mockDomain}`,
        email: createData.email,
        displayName: createData.displayName,
        summary: createData.summary,
      });

      // Act
      const result = await actorService.createLocalActor(createData);

      // Assert
      expect(mockActorRepository.findOne).toHaveBeenCalledTimes(2);
      expect(mockActorRepository.create).toHaveBeenCalledTimes(1);
      expect(result).toHaveProperty('preferredUsername', createData.username);
      expect(result).toHaveProperty('email', createData.email);
      expect(result).toHaveProperty('displayName', createData.displayName);
    });

    it('should throw an error when password is missing', async () => {
      // Arrange
      const createData = {
        username: 'newuser',
        email: 'newuser@example.com',
      };

      // Act & Assert
      await expect(actorService.createLocalActor(createData)).rejects.toThrow(
        new AppError(
          'Password is required for local actor creation',
          400,
          ErrorType.BAD_REQUEST
        )
      );
      expect(mockActorRepository.findOne).not.toHaveBeenCalled();
      expect(mockActorRepository.create).not.toHaveBeenCalled();
    });

    it('should throw an error when username already exists', async () => {
      // Arrange
      const createData = {
        username: 'existinguser',
        email: 'newuser@example.com',
        password: 'password123',
      };

      mockActorRepository.findOne.mockResolvedValueOnce(mockActor); // Username exists

      // Act & Assert
      await expect(actorService.createLocalActor(createData)).rejects.toThrow(
        new AppError('Username already taken', 409, ErrorType.CONFLICT)
      );
      expect(mockActorRepository.findOne).toHaveBeenCalledTimes(1);
      expect(mockActorRepository.create).not.toHaveBeenCalled();
    });

    it('should throw an error when email already exists', async () => {
      // Arrange
      const createData = {
        username: 'newuser',
        email: 'existing@example.com',
        password: 'password123',
      };

      mockActorRepository.findOne.mockResolvedValueOnce(null); // Username doesn't exist
      mockActorRepository.findOne.mockResolvedValueOnce(mockActor); // Email exists

      // Act & Assert
      await expect(actorService.createLocalActor(createData)).rejects.toThrow(
        new AppError('Email already registered', 409, ErrorType.CONFLICT)
      );
      expect(mockActorRepository.findOne).toHaveBeenCalledTimes(2);
      expect(mockActorRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('getActorById', () => {
    it('should return an actor when found by ID', async () => {
      // Arrange
      mockActorRepository.findById.mockResolvedValueOnce(mockActor);

      // Act
      const result = await actorService.getActorById(mockActorId);

      // Assert
      expect(mockActorRepository.findById).toHaveBeenCalledWith(
        expect.any(ObjectId)
      );
      expect(result).toEqual(mockActor);
    });

    it('should return null when actor not found by ID', async () => {
      // Arrange
      const validNonExistentId = new ObjectId().toHexString(); // Use a valid ObjectId format
      mockActorRepository.findById.mockResolvedValueOnce(null);

      // Act
      const result = await actorService.getActorById(validNonExistentId);

      // Assert
      expect(mockActorRepository.findById).toHaveBeenCalledWith(
        expect.any(ObjectId)
      );
      expect(result).toBeNull();
    });
  });

  describe('getActorByApId', () => {
    it('should return an actor when found by AP ID', async () => {
      // Arrange
      const apId = `https://${mockDomain}/users/testuser`;
      mockActorRepository.findOne.mockResolvedValueOnce(mockActor);

      // Act
      const result = await actorService.getActorByApId(apId);

      // Assert
      expect(mockActorRepository.findOne).toHaveBeenCalledWith({ id: apId });
      expect(result).toEqual(mockActor);
    });

    it('should return null when actor not found by AP ID', async () => {
      // Arrange
      const apId = `https://${mockDomain}/users/nonexistent`;
      mockActorRepository.findOne.mockResolvedValueOnce(null);

      // Act
      const result = await actorService.getActorByApId(apId);

      // Assert
      expect(mockActorRepository.findOne).toHaveBeenCalledWith({ id: apId });
      expect(result).toBeNull();
    });
  });

  describe('getActorByUsername', () => {
    it('should return an actor when found by username', async () => {
      // Arrange
      const username = 'testuser';
      mockActorRepository.findByPreferredUsername.mockResolvedValueOnce(
        mockActor
      );

      // Act
      const result = await actorService.getActorByUsername(username);

      // Assert
      expect(mockActorRepository.findByPreferredUsername).toHaveBeenCalledWith(
        username
      );
      expect(result).toEqual(mockActor);
    });

    it('should return null when actor not found by username', async () => {
      // Arrange
      const username = 'nonexistent';
      mockActorRepository.findByPreferredUsername.mockResolvedValueOnce(null);

      // Act
      const result = await actorService.getActorByUsername(username);

      // Assert
      expect(mockActorRepository.findByPreferredUsername).toHaveBeenCalledWith(
        username
      );
      expect(result).toBeNull();
    });
  });

  describe('getActorByFullUsername', () => {
    it('should return an actor when found by full username', async () => {
      // Arrange
      const fullUsername = `testuser@${mockDomain}`;
      mockActorRepository.findOne.mockResolvedValueOnce(mockActor);

      // Act
      const result = await actorService.getActorByFullUsername(fullUsername);

      // Assert
      expect(mockActorRepository.findOne).toHaveBeenCalledWith({
        username: fullUsername,
      });
      expect(result).toEqual(mockActor);
    });

    it('should return null when actor not found by full username', async () => {
      // Arrange
      const fullUsername = `nonexistent@${mockDomain}`;
      mockActorRepository.findOne.mockResolvedValueOnce(null);

      // Act
      const result = await actorService.getActorByFullUsername(fullUsername);

      // Assert
      expect(mockActorRepository.findOne).toHaveBeenCalledWith({
        username: fullUsername,
      });
      expect(result).toBeNull();
    });
  });

  describe('searchActors', () => {
    it('should return matching actors', async () => {
      // Arrange
      const query = 'test';
      const mockActors = [mockActor];
      mockActorRepository.search.mockResolvedValueOnce(mockActors);

      // Act
      const result = await actorService.searchActors(query);

      // Assert
      expect(mockActorRepository.search).toHaveBeenCalledWith(query, 10);
      expect(result).toEqual(mockActors);
    });

    it('should respect custom limit parameter', async () => {
      // Arrange
      const query = 'test';
      const limit = 5;
      const mockActors = [mockActor];
      mockActorRepository.search.mockResolvedValueOnce(mockActors);

      // Act
      const result = await actorService.searchActors(query, limit);

      // Assert
      expect(mockActorRepository.search).toHaveBeenCalledWith(query, limit);
      expect(result).toEqual(mockActors);
    });
  });

  describe('updateActorProfile', () => {
    it('should update actor profile successfully', async () => {
      // Arrange
      const updates = {
        displayName: 'Updated Name',
        summary: 'Updated summary',
      };

      const updatedActor = {
        ...mockActor,
        ...updates,
      };

      mockActorRepository.updateProfile.mockResolvedValueOnce(updatedActor);

      // Act
      const result = await actorService.updateActorProfile(
        mockActorId,
        updates
      );

      // Assert
      expect(mockActorRepository.updateProfile).toHaveBeenCalledWith(
        mockActorId,
        updates
      );
      expect(result).toEqual(updatedActor);
    });

    it('should return null when actor not found for update', async () => {
      // Arrange
      const updates = {
        displayName: 'Updated Name',
      };

      mockActorRepository.updateProfile.mockResolvedValueOnce(null);

      // Act
      const result = await actorService.updateActorProfile(
        'nonexistentid',
        updates
      );

      // Assert
      expect(mockActorRepository.updateProfile).toHaveBeenCalledWith(
        'nonexistentid',
        updates
      );
      expect(result).toBeNull();
    });
  });

  describe('updateActor', () => {
    it('should update actor by username successfully', async () => {
      // Arrange
      const username = 'testuser';
      const updates = {
        displayName: 'Updated Name',
        summary: 'Updated summary',
      };

      const updatedActor = {
        ...mockActor,
        ...updates,
      };

      mockActorRepository.updateProfileByUsername.mockResolvedValueOnce(
        updatedActor
      );

      // Act
      const result = await actorService.updateActor(username, updates);

      // Assert
      expect(mockActorRepository.updateProfileByUsername).toHaveBeenCalledWith(
        username,
        updates
      );
      expect(result).toEqual(updatedActor);
    });

    it('should return null when actor not found for update by username', async () => {
      // Arrange
      const username = 'nonexistent';
      const updates = {
        displayName: 'Updated Name',
      };

      mockActorRepository.updateProfileByUsername.mockResolvedValueOnce(null);

      // Act
      const result = await actorService.updateActor(username, updates);

      // Assert
      expect(mockActorRepository.updateProfileByUsername).toHaveBeenCalledWith(
        username,
        updates
      );
      expect(result).toBeNull();
    });
  });

  describe('deleteActor', () => {
    it('should delete actor by username successfully', async () => {
      // Arrange
      const username = 'testuser';
      mockActorRepository.deleteByUsername.mockResolvedValueOnce(true);

      // Act
      const result = await actorService.deleteActor(username);

      // Assert
      expect(mockActorRepository.deleteByUsername).toHaveBeenCalledWith(
        username
      );
      expect(result).toBe(true);
    });

    it('should return false when actor not found for deletion', async () => {
      // Arrange
      const username = 'nonexistent';
      mockActorRepository.deleteByUsername.mockResolvedValueOnce(false);

      // Act
      const result = await actorService.deleteActor(username);

      // Assert
      expect(mockActorRepository.deleteByUsername).toHaveBeenCalledWith(
        username
      );
      expect(result).toBe(false);
    });
  });

  describe('follow', () => {
    it('should allow an actor to follow another actor', async () => {
      // Arrange
      const followerId = mockActorId;
      const followeeApId = `https://${mockDomain}/users/followee`;

      const followee = {
        ...mockActor,
        _id: new ObjectId(),
        id: followeeApId,
        preferredUsername: 'followee',
      };

      mockActorRepository.findById.mockResolvedValueOnce(mockActor);
      mockActorRepository.findOne.mockResolvedValueOnce(followee);
      mockActorRepository.addFollowing.mockResolvedValueOnce(true);

      // Act
      const result = await actorService.follow(followerId, followeeApId);

      // Assert
      expect(mockActorRepository.findById).toHaveBeenCalledWith(
        expect.any(ObjectId)
      );
      expect(mockActorRepository.findOne).toHaveBeenCalledWith({
        id: followeeApId,
      });
      expect(mockActorRepository.addFollowing).toHaveBeenCalledWith(
        mockActor._id,
        followeeApId
      );
      expect(result).toBe(true);
    });

    it('should throw error when follower not found', async () => {
      // Arrange
      const followerId = new ObjectId().toHexString(); // Use a valid ObjectId format
      const followeeApId = `https://${mockDomain}/users/followee`;

      mockActorRepository.findById.mockResolvedValueOnce(null);

      // Act & Assert
      await expect(
        actorService.follow(followerId, followeeApId)
      ).rejects.toThrow(
        new AppError('Follower not found', 404, ErrorType.NOT_FOUND)
      );
      expect(mockActorRepository.findById).toHaveBeenCalledWith(
        expect.any(ObjectId)
      );
      expect(mockActorRepository.findOne).not.toHaveBeenCalled();
      expect(mockActorRepository.addFollowing).not.toHaveBeenCalled();
    });

    it('should throw error when followee not found', async () => {
      // Arrange
      const followerId = mockActorId;
      const followeeApId = `https://${mockDomain}/users/nonexistent`;

      mockActorRepository.findById.mockResolvedValueOnce(mockActor);
      mockActorRepository.findOne.mockResolvedValueOnce(null);

      // Act & Assert
      await expect(
        actorService.follow(followerId, followeeApId)
      ).rejects.toThrow(
        new AppError('Followee not found', 404, ErrorType.NOT_FOUND)
      );
      expect(mockActorRepository.findById).toHaveBeenCalledWith(
        expect.any(ObjectId)
      );
      expect(mockActorRepository.findOne).toHaveBeenCalledWith({
        id: followeeApId,
      });
      expect(mockActorRepository.addFollowing).not.toHaveBeenCalled();
    });
  });

  describe('unfollow', () => {
    it('should allow an actor to unfollow another actor', async () => {
      // Arrange
      const followerId = mockActorId;
      const followeeApId = `https://${mockDomain}/users/followee`;

      mockActorRepository.findById.mockResolvedValueOnce(mockActor);
      mockActorRepository.removeFollowing.mockResolvedValueOnce(true);

      // Act
      const result = await actorService.unfollow(followerId, followeeApId);

      // Assert
      expect(mockActorRepository.findById).toHaveBeenCalledWith(
        expect.any(ObjectId)
      );
      expect(mockActorRepository.removeFollowing).toHaveBeenCalledWith(
        mockActor._id,
        followeeApId
      );
      expect(result).toBe(true);
    });

    it('should throw error when follower not found', async () => {
      // Arrange
      const followerId = new ObjectId().toHexString(); // Use a valid ObjectId format
      const followeeApId = `https://${mockDomain}/users/followee`;

      mockActorRepository.findById.mockResolvedValueOnce(null);

      // Act & Assert
      await expect(
        actorService.unfollow(followerId, followeeApId)
      ).rejects.toThrow(
        new AppError('Follower not found', 404, ErrorType.NOT_FOUND)
      );
      expect(mockActorRepository.findById).toHaveBeenCalledWith(
        expect.any(ObjectId)
      );
      expect(mockActorRepository.removeFollowing).not.toHaveBeenCalled();
    });
  });

  describe('getFollowers', () => {
    it('should return followers for an actor', async () => {
      // Arrange
      const actorApId = mockActor.id;
      const followers = [
        { ...mockActor, _id: new ObjectId(), preferredUsername: 'follower1' },
        { ...mockActor, _id: new ObjectId(), preferredUsername: 'follower2' },
      ];

      mockActorRepository.findFollowers.mockResolvedValueOnce(followers);

      // Act
      const result = await actorService.getFollowers(actorApId);

      // Assert
      expect(mockActorRepository.findFollowers).toHaveBeenCalledWith(
        actorApId,
        1,
        20
      );
      expect(result).toEqual(followers);
      expect(result.length).toBe(2);
    });

    it('should handle pagination parameters', async () => {
      // Arrange
      const actorApId = mockActor.id;
      const page = 2;
      const limit = 10;
      const followers = [
        { ...mockActor, _id: new ObjectId(), preferredUsername: 'follower3' },
      ];

      mockActorRepository.findFollowers.mockResolvedValueOnce(followers);

      // Act
      const result = await actorService.getFollowers(actorApId, page, limit);

      // Assert
      expect(mockActorRepository.findFollowers).toHaveBeenCalledWith(
        actorApId,
        page,
        limit
      );
      expect(result).toEqual(followers);
    });
  });

  describe('getFollowing', () => {
    it('should return following actors for an actor', async () => {
      // Arrange
      const actorId = mockActorId;
      const following = [
        { ...mockActor, _id: new ObjectId(), preferredUsername: 'following1' },
        { ...mockActor, _id: new ObjectId(), preferredUsername: 'following2' },
      ];

      mockActorRepository.findFollowing.mockResolvedValueOnce(following);

      // Act
      const result = await actorService.getFollowing(actorId);

      // Assert
      expect(mockActorRepository.findFollowing).toHaveBeenCalledWith(
        actorId,
        1,
        20
      );
      expect(result).toEqual(following);
      expect(result.length).toBe(2);
    });

    it('should handle pagination parameters', async () => {
      // Arrange
      const actorId = mockActorId;
      const page = 2;
      const limit = 10;
      const following = [
        { ...mockActor, _id: new ObjectId(), preferredUsername: 'following3' },
      ];

      mockActorRepository.findFollowing.mockResolvedValueOnce(following);

      // Act
      const result = await actorService.getFollowing(actorId, page, limit);

      // Assert
      expect(mockActorRepository.findFollowing).toHaveBeenCalledWith(
        actorId,
        page,
        limit
      );
      expect(result).toEqual(following);
    });
  });

  describe('fetchRemoteActor', () => {
    it('should handle fetching remote actors (placeholder implementation)', async () => {
      // Arrange
      const actorUrl = 'https://remote.domain/users/remote';
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      // Act
      const result = await actorService.fetchRemoteActor(actorUrl);

      // Assert
      expect(consoleSpy).toHaveBeenCalledWith(
        `Fetching remote actor ${actorUrl} not implemented`
      );
      expect(result).toBeNull();

      // Cleanup
      consoleSpy.mockRestore();
    });
  });

  describe('usernameExists', () => {
    it('should return true when username exists', async () => {
      // Arrange
      const username = 'existinguser';
      mockActorRepository.usernameExists.mockResolvedValueOnce(true);

      // Act
      const result = await actorService.usernameExists(username);

      // Assert
      expect(mockActorRepository.usernameExists).toHaveBeenCalledWith(username);
      expect(result).toBe(true);
    });

    it('should return false when username does not exist', async () => {
      // Arrange
      const username = 'newuser';
      mockActorRepository.usernameExists.mockResolvedValueOnce(false);

      // Act
      const result = await actorService.usernameExists(username);

      // Assert
      expect(mockActorRepository.usernameExists).toHaveBeenCalledWith(username);
      expect(result).toBe(false);
    });
  });
});
