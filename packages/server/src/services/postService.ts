import { Db, ObjectId, Document } from "mongodb";
import { Post, CreatePostRequest } from "../types/post";

export class PostService {
  private db: Db;
  private domain: string;

  constructor(db: Db, domain: string) {
    this.db = db;
    this.domain = domain;
  }

  async createPost(
    postData: CreatePostRequest,
    actorId: string
  ): Promise<Post> {
    // Create a new post
    const post = {
      content: postData.content,
      actorId: new ObjectId(actorId),
      createdAt: new Date(),
      sensitive: postData.sensitive || false,
      contentWarning: postData.contentWarning || "",
      attachments: postData.attachments || [],
      likes: 0,
      replies: 0,
      reposts: 0,
      // Add ActivityPub fields for federation
      type: "Note",
      id: `https://${this.domain}/posts/${new ObjectId()}`,
      attributedTo: `https://${this.domain}/users/${postData.username}`,
    };

    const result = await this.db.collection("posts").insertOne(post);

    return {
      ...post,
      _id: result.insertedId,
    };
  }

  async getPostById(postId: string): Promise<Post | null> {
    try {
      const post = await this.db.collection("posts").findOne({
        _id: new ObjectId(postId),
      });

      // Cast the document to Post type
      return post as Post | null;
    } catch (error) {
      console.error("Error getting post by ID:", error);
      return null;
    }
  }

  async getPostsByUsername(
    username: string,
    page = 1,
    limit = 20
  ): Promise<{ posts: Post[]; hasMore: boolean }> {
    try {
      // First find the actor by username
      const actor = await this.db
        .collection("actors")
        .findOne({ preferredUsername: username });

      if (!actor) {
        return { posts: [], hasMore: false };
      }

      const skip = (page - 1) * limit;

      const posts = await this.db
        .collection("posts")
        .find({ actorId: actor._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit + 1) // Get one extra to check if there are more
        .toArray();

      const hasMore = posts.length > limit;

      if (hasMore) {
        posts.pop(); // Remove the extra post
      }

      // Cast the documents to Post[] type
      return { posts: posts as Post[], hasMore };
    } catch (error) {
      console.error("Error getting posts by username:", error);
      return { posts: [], hasMore: false };
    }
  }

  async getFeed(
    page = 1,
    limit = 20
  ): Promise<{ posts: Post[]; hasMore: boolean }> {
    try {
      const skip = (page - 1) * limit;

      const posts = await this.db
        .collection("posts")
        .find({})
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit + 1)
        .toArray();

      const hasMore = posts.length > limit;

      if (hasMore) {
        posts.pop();
      }

      // Cast the documents to Post[] type
      return { posts: posts as Post[], hasMore };
    } catch (error) {
      console.error("Error getting feed:", error);
      return { posts: [], hasMore: false };
    }
  }

  async updatePost(
    postId: string,
    actorId: string,
    updates: Partial<CreatePostRequest>
  ): Promise<Post | null> {
    try {
      const post = await this.db.collection("posts").findOne({
        _id: new ObjectId(postId),
        actorId: new ObjectId(actorId),
      });

      if (!post) {
        return null;
      }

      const updateFields: any = {};

      if (updates.content !== undefined) updateFields.content = updates.content;
      if (updates.sensitive !== undefined)
        updateFields.sensitive = updates.sensitive;
      if (updates.contentWarning !== undefined)
        updateFields.contentWarning = updates.contentWarning;

      await this.db
        .collection("posts")
        .updateOne({ _id: new ObjectId(postId) }, { $set: updateFields });

      return await this.getPostById(postId);
    } catch (error) {
      console.error("Error updating post:", error);
      return null;
    }
  }

  async deletePost(postId: string, actorId: string): Promise<boolean> {
    try {
      const result = await this.db.collection("posts").deleteOne({
        _id: new ObjectId(postId),
        actorId: new ObjectId(actorId),
      });

      return result.deletedCount === 1;
    } catch (error) {
      console.error("Error deleting post:", error);
      return false;
    }
  }

  async likePost(postId: string, actorId: string): Promise<boolean> {
    try {
      // Check if the user already liked this post
      const existingLike = await this.db.collection("likes").findOne({
        postId: new ObjectId(postId),
        actorId: new ObjectId(actorId),
      });

      if (existingLike) {
        return false; // Already liked
      }

      // Create a new like
      await this.db.collection("likes").insertOne({
        postId: new ObjectId(postId),
        actorId: new ObjectId(actorId),
        createdAt: new Date(),
      });

      // Increment the like count
      await this.db
        .collection("posts")
        .updateOne({ _id: new ObjectId(postId) }, { $inc: { likes: 1 } });

      return true;
    } catch (error) {
      console.error("Error liking post:", error);
      return false;
    }
  }

  async unlikePost(postId: string, actorId: string): Promise<boolean> {
    try {
      // Delete the like
      const result = await this.db.collection("likes").deleteOne({
        postId: new ObjectId(postId),
        actorId: new ObjectId(actorId),
      });

      if (result.deletedCount === 0) {
        return false; // Like didn't exist
      }

      // Decrement the like count
      await this.db
        .collection("posts")
        .updateOne({ _id: new ObjectId(postId) }, { $inc: { likes: -1 } });

      return true;
    } catch (error) {
      console.error("Error unliking post:", error);
      return false;
    }
  }
}
