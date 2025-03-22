import React from "react";

interface Post {
  id: string;
  content: string;
  author: {
    username: string;
    displayName?: string;
    avatarUrl?: string;
  };
  createdAt: string;
  likes: number;
  comments: number;
}

interface PostListProps {
  posts: Post[];
  loading?: boolean;
}

const PostList: React.FC<PostListProps> = ({ posts, loading = false }) => {
  if (loading) {
    return <div className="loading-indicator">Loading posts...</div>;
  }

  if (posts.length === 0) {
    return <div className="no-posts">No posts yet!</div>;
  }

  return (
    <div className="post-list">
      {posts.map((post) => (
        <div key={post.id} className="post-item">
          <div className="post-header">
            <div className="post-author">
              {post.author.avatarUrl && (
                <img
                  src={post.author.avatarUrl}
                  alt={post.author.displayName || post.author.username}
                  className="author-avatar"
                />
              )}
              <span>{post.author.displayName || post.author.username}</span>
            </div>
            <span className="post-date">
              {new Date(post.createdAt).toLocaleString()}
            </span>
          </div>
          <div className="post-content">{post.content}</div>
          <div className="post-actions">
            <button className="like-button">Like ({post.likes})</button>
            <button className="comment-button">
              Comment ({post.comments})
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PostList;
