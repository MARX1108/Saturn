import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import "../styles/home.css";

const Home: React.FC = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [postContent, setPostContent] = useState("");
  const [posting, setPosting] = useState(false);

  // Fetch posts on component mount
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        // In a real app, this would fetch posts from API
        // For now, we'll simulate with a timeout and mock data
        setTimeout(() => {
          // Generate some mock posts
          const mockPosts = Array(5)
            .fill(null)
            .map((_, i) => ({
              id: `post-${i}`,
              content: `This is a sample post number ${
                i + 1
              } in your timeline.`,
              author: {
                username: i % 2 === 0 ? "sampleuser" : "otheruser",
                displayName: i % 2 === 0 ? "Sample User" : "Other User",
                avatarUrl: `https://picsum.photos/id/${i + 10}/200/200`,
              },
              createdAt: new Date(Date.now() - i * 3600000).toISOString(),
              likes: Math.floor(Math.random() * 100),
              comments: Math.floor(Math.random() * 20),
            }));
          setPosts(mockPosts);
          setLoading(false);
        }, 800);
      } catch (err) {
        setError("Failed to load posts");
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!postContent.trim()) return;

    setPosting(true);

    try {
      // In a real app, this would send the post to an API
      // Simulate API call with a timeout
      setTimeout(() => {
        const newPost = {
          id: `post-new-${Date.now()}`,
          content: postContent,
          author: {
            username: user?.preferredUsername || "currentuser",
            displayName: user?.name || "Current User",
            avatarUrl: user?.icon?.url || `https://picsum.photos/id/1/200/200`,
          },
          createdAt: new Date().toISOString(),
          likes: 0,
          comments: 0,
        };

        setPosts([newPost, ...posts]);
        setPostContent("");
        setPosting(false);
      }, 500);
    } catch (err) {
      setError("Failed to create post");
      setPosting(false);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (loading) return <div className="home-loading">Loading posts...</div>;

  return (
    <div className="home-container">
      <div className="timeline">
        {/* Create post form */}
        <div className="create-post">
          <form onSubmit={handlePostSubmit}>
            <textarea
              placeholder="What's happening?"
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              disabled={posting}
            />
            <button type="submit" disabled={posting || !postContent.trim()}>
              {posting ? "Posting..." : "Post"}
            </button>
          </form>
        </div>

        {/* Error message */}
        {error && <div className="error-message">{error}</div>}

        {/* Posts feed */}
        <div className="posts-feed">
          {posts.map((post) => (
            <div className="post-item" key={post.id}>
              <div className="post-author">
                <img
                  src={post.author.avatarUrl}
                  alt={post.author.displayName}
                  className="author-avatar"
                />
                <div className="author-info">
                  <span className="author-name">{post.author.displayName}</span>
                  <span className="author-username">
                    @{post.author.username}
                  </span>
                </div>
                <span className="post-date">{formatDate(post.createdAt)}</span>
              </div>
              <div className="post-content">{post.content}</div>
              <div className="post-actions">
                <button className="action-button like-button">
                  ❤️ {post.likes}
                </button>
                <button className="action-button comment-button">
                  💬 {post.comments}
                </button>
                <button className="action-button share-button">🔄 Share</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="sidebar">
        <div className="sidebar-section">
          <h3>Who to follow</h3>
          <div className="suggested-users">
            {Array(3)
              .fill(null)
              .map((_, i) => (
                <div className="suggested-user" key={i}>
                  <img
                    src={`https://picsum.photos/id/${i + 20}/50/50`}
                    alt={`Suggested user ${i}`}
                    className="suggested-avatar"
                  />
                  <div className="suggested-info">
                    <span className="suggested-name">
                      Suggested User {i + 1}
                    </span>
                    <span className="suggested-username">
                      @suggested{i + 1}
                    </span>
                  </div>
                  <button className="follow-button">Follow</button>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
