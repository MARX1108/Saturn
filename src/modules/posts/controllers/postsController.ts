import { Post, PostResponse } from '../models/post';
import { Actor } from '@/modules/actors/models/actor';
import { ObjectId } from 'mongodb';

// ... existing code ...
    // Fetch the full author Actor object if necessary for more details
    let author: Actor | null = null;
    if (post.actorId) {
      author = await this.actorService.getActorById(post.actorId);
    }

    // Check if the requesting user (if available) has liked this post
    const safeUserId =
      userId instanceof ObjectId
        ? userId
        : userId
          ? new ObjectId(userId)
          : null;
    const likedByUser =
      safeUserId && post.likedBy?.some(id => id.equals(safeUserId)) ? true : false;
    // Check if the requesting user (if available) has shared this post
    const sharedByUser =
      safeUserId && post.sharedBy?.some(id => id.equals(safeUserId)) ? true : false;

    return {
      id: post.id,
      content: post.content,
      author: {
        id: post.attributedTo, // Use attributedTo for author's ActivityPub ID
        username: author?.username || 'unknown',
        preferredUsername: author?.preferredUsername || 'unknown',
        displayName: author?.displayName || author?.preferredUsername || 'unknown',
        iconUrl: author?.icon?.url, // Use iconUrl
      },
      published: post.published.toISOString(),
      sensitive: post.sensitive,
      contentWarning: post.contentWarning,
      attachments: post.attachments,
      likes: post.likes || 0, // Use the likes count field
      likedByUser: likedByUser,
      shares: post.shares || 0, // Use the shares count field
      sharedByUser: sharedByUser,
      replyCount: post.replyCount || 0,
      visibility: post.visibility,
      url: post.url,
    };
  }

// ... existing code ...
      throw new AppError('User not authenticated', ErrorType.Unauthorized);
    }

    const actor = req.user; // Actor is available from authentication middleware

    const createPostRequest: CreatePostRequest = {
      content: req.body.content,
      visibility: req.body.visibility || 'public',
      sensitive: req.body.sensitive || false,
      contentWarning: req.body.contentWarning,
      // attachments are handled separately
    };

    // Pass the authenticated actor's ObjectId to the service
    const newPost = await this.postService.createPost(
      createPostRequest,
      actor._id // Pass actor ObjectId
    );

    const response = await this.formatPostResponse(newPost, actor._id);
// ... existing code ... 