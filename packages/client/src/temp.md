## Step 3: Setting Up ActivityPub Routes

Now, let's implement the core ActivityPub routes to make our server federate properly:

```typescript
// server/routes/activitypub.ts
import express from 'express';
import crypto from 'crypto';

const router = express.Router();

// Get Actor profile (for remote servers)
router.get('/users/:username', async (req, res) => {
  try {
    const { username } = req.params;
    
    // Check Accept header for ActivityPub requests
    const acceptHeader = req.get('Accept');
    if (!acceptHeader || !acceptHeader.includes('application/activity+json')) {
      // Redirect to user profile page for browsers
      return res.redirect(`/profile/${username}`);
    }
    
    // Retrieve actor from database
    // ... your database retrieval code here
    
    // Return ActivityPub actor representation
    res.json(actor);
  } catch (error) {
    console.error('Error fetching actor:', error);
    res.status(404).json({ error: 'Actor not found' });
  }
});

// Actor inbox - where activities from other servers arrive
router.post('/users/:username/inbox', async (req, res) => {
  try {
    const { username } = req.params;
    const activity = req.body;
    
    // Verify HTTP signature
    // ... signature verification code here
    
    // Process the activity
    switch (activity.type) {
      case 'Follow':
        // Handle follow request
        break;
      case 'Like':
        // Handle like
        break;
      case 'Create':
        // Handle new content (e.g., Note)
        break;
      case 'Announce':
        // Handle repost/boost
        break;
      // etc.
    }
    
    res.status(202).json({ status: 'Accepted' });
  } catch (error) {
    console.error('Error processing inbox activity:', error);
    res.status(500).json({ error: 'Failed to process activity' });
  }
});

// Actor outbox - where this server publishes activities
router.get('/users/:username/outbox', async (req, res) => {
  try {
    const { username } = req.params;
    
    // Retrieve recent activities for this user
    // ... your database retrieval code here
    
    // Return as an OrderedCollection
    res.json({
      "@context": "https://www.w3.org/ns/activitystreams",
      type: "OrderedCollection",
      totalItems: activities.length,
      orderedItems: activities
    });
  } catch (error) {
    console.error('Error fetching outbox:', error);
    res.status(500).json({ error: 'Failed to retrieve outbox' });
  }
});

export default router;
```

## Step 4: Create User Profile Page

Let's create a component to display and edit user profiles:

```typescript
// src/pages/Profile.tsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

interface ProfileProps {
  isCurrentUser?: boolean;
}

const Profile: React.FC<ProfileProps> = ({ isCurrentUser = false }) => {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Form states for editing
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/users/${username}`);
        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }
        
        const data = await response.json();
        setProfile(data);
        setDisplayName(data.displayName || '');
        setBio(data.bio || '');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [username]);

  // Handle profile update
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('displayName', displayName);
      formData.append('bio', bio);
      if (avatarFile) {
        formData.append('avatarFile', avatarFile);
      }
      
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/users/${username}/update`,
        {
          method: 'POST',
          body: formData,
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to update profile');
      }
      
      const updatedProfile = await response.json();
      setProfile(updatedProfile);
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading profile...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!profile) return <div>Profile not found</div>;

  return (
    <div className="profile-container">
      {isEditing && isCurrentUser ? (
        <form onSubmit={handleUpdateProfile}>
          <div className="form-group">
            <label>Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>
          
          <div className="form-group">
            <label>Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
            />
          </div>
          
          <div className="form-group">
            <label>Profile Picture</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
            />
          </div>
          
          <div className="button-group">
            <button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <button type="button" onClick={() => setIsEditing(false)}>
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="profile-info">
          <div className="profile-header">
            {profile.avatarUrl && (
              <img src={profile.avatarUrl} alt={profile.displayName} className="avatar" />
            )}
            <h1>{profile.displayName || profile.username}</h1>
            <div className="username">@{profile.username}</div>
          </div>
          
          {profile.bio && <div className="bio">{profile.bio}</div>}
          
          {isCurrentUser && (
            <button onClick={() => setIsEditing(true)}>Edit Profile</button>
          )}
        </div>
      )}
    </div>
  );
};

export default Profile;
```

## Step 5: Creating Posts and Feed Implementation

Now, let's create the components for posting content and displaying a feed:

```typescript
// src/components/CreatePost.tsx
import React, { useState } from 'react';

interface CreatePostProps {
  onPostCreated?: () => void;
}

const CreatePost: React.FC<CreatePostProps> = ({ onPostCreated }) => {
  const [content, setContent] = useState('');
  const [isContentWarning, setIsContentWarning] = useState(false);
  const [contentWarning, setContentWarning] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      setError('Post content cannot be empty');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('content', content);
      
      if (isContentWarning && contentWarning.trim()) {
        formData.append('sensitive', 'true');
        formData.append('contentWarning', contentWarning);
      }
      
      attachments.forEach(file => {
        formData.append('attachments', file);
      });
      
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/posts/create`,
        {
          method: 'POST',
          body: formData,
        }
      );
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create post');
      }
      
      // Reset form
      setContent('');
      setIsContentWarning(false);
      setContentWarning('');
      setAttachments([]);
      
      // Notify parent component
      if (onPostCreated) {
        onPostCreated();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setAttachments(prevFiles => [...prevFiles, ...newFiles]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  return (
    <div className="create-post-container">
      <form onSubmit={handleSubmit}>
        <textarea
          placeholder="What's on your mind?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={loading}
          rows={4}
        />
        
        <div className="content-warning-section">
          <label>
            <input
              type="checkbox"
              checked={isContentWarning}
              onChange={(e) => setIsContentWarning(e.target.checked)}
              disabled={loading}
            />
            Add content warning
          </label>
          
          {isContentWarning && (
            <input
              type="text"
              placeholder="Content warning"
              value={contentWarning}
              onChange={(e) => setContentWarning(e.target.value)}
              disabled={loading}
            />
          )}
        </div>
        
        <div className="attachments-section">
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            disabled={loading}
          />
          
          {attachments.length > 0 && (
            <div className="attachment-preview">
              {attachments.map((file, index) => (
                <div key={index} className="attachment-item">
                  <span>{file.name}</span>
                  <button
                    type="button"
                    onClick={() => removeAttachment(index)}
                    disabled={loading}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {error && <div className="error">{error}</div>}
        
        <button type="submit" disabled={loading || !content.trim()}>
          {loading ? 'Posting...' : 'Post'}
        </button>
      </form>
    </div>
  );
};

export default CreatePost;
```

Now, let's create a feed component:

```typescript
// src/components/Feed.tsx
import React, { useState, useEffect } from 'react';
import PostItem from './PostItem';

interface Post {
  id: string;
  content: string;
  author: {
    username: string;
    displayName?: string;
    avatarUrl?: string;
  };
  createdAt: string;
  sensitive?: boolean;
  contentWarning?: string;
  attachments?: {
    url: string;
    type: string;
    mediaType: string;
  }[];
  likeCount: number;
  replyCount: number;
  repostCount: number;
  liked: boolean;
  reposted: boolean;
}

interface FeedProps {
  type: 'home' | 'local' | 'profile';
  username?: string;
  refreshTrigger?: number;
}

const Feed: React.FC<FeedProps> = ({ type, username, refreshTrigger = 0 }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      setError(null);
      
      try {
        let url = `${import.meta.env.VITE_API_URL}/posts`;
        
        if (type === 'home') {
          url = `${url}/home`;
        } else if (type === 'local') {
          url = `${url}/local`;
        } else if (type === 'profile' && username) {
          url = `${url}/user/${username}`;
        }
        
        url = `${url}?page=${page}&limit=20`;
        
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Failed to fetch posts');
        }
        
        const data = await response.json();
        
        if (page === 1) {
          setPosts(data.posts);
        } else {
          setPosts(prevPosts => [...prevPosts, ...data.posts]);
        }
        
        setHasMore(data.hasMore);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPosts();
  }, [type, username, page, refreshTrigger]);

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      setPage(prevPage => prevPage + 1);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/posts/${postId}/like`,
        { method: 'POST' }
      );
      
      if (!response.ok) {
        throw new Error('Failed to like post');
      }
      
      // Update local state
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === postId
            ? {
                ...post,
                liked: !post.liked,
                likeCount: post.liked
                  ? post.likeCount - 1
                  : post.likeCount + 1,
              }
            : post
        )
      );
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleRepost = async (postId: string) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/posts/${postId}/repost`,
        { method: 'POST' }
      );
      
      if (!response.ok) {
        throw new Error('Failed to repost');
      }
      
      // Update local state
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === postId
            ? {
                ...post,
                reposted: !post.reposted,
                repostCount: post.reposted
                  ? post.repostCount - 1
                  : post.repostCount + 1,
              }
            : post
        )
      );
    } catch (error) {
      console.error('Error reposting:', error);
    }
  };

  if (loading && posts.length === 0) {
    return <div className="loading">Loading posts...</div>;
  }

  if (error && posts.length === 0) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="feed-container">
      {posts.length === 0 ? (
        <div className="no-posts">No posts to display</div>
      ) : (
        <>
          {posts.map(post => (
            <PostItem
              key={post.id}
              post={post}
              onLike={handleLike}
              onRepost={handleRepost}
            />
          ))}
          
          {loading && <div className="loading-more">Loading more posts...</div>}
          
          {hasMore && !loading && (
            <button onClick={handleLoadMore} className="load-more-button">
              Load More
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default Feed;
```

Now, the post item component:

```typescript
// src/components/PostItem.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface Post {
  id: string;
  content: string;
  author: {
    username: string;
    displayName?: string;
    avatarUrl?: string;
  };
  createdAt: string;
  sensitive?: boolean;
  contentWarning?: string;
  attachments?: {
    url: string;
    type: string;
    mediaType: string;
  }[];
  likeCount: number;
  replyCount: number;
  repostCount: number;
  liked: boolean;
  reposted: boolean;
}

interface PostItemProps {
  post: Post;
  onLike: (postId: string) => void;
  onRepost: (postId: string) => void;
}

const PostItem: React.FC<PostItemProps> = ({ post, onLike, onRepost }) => {
  const [revealed, setRevealed] = useState(!post.sensitive);
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  return (
    <div className="post-item">
      <div className="post-header">
        <Link to={`/profile/${post.author.username}`} className="author-link">
          {post.author.avatarUrl && (
            <img
              src={post.author.avatarUrl}
              alt={post.author.displayName || post.author.username}
              className="author-avatar"
            />
          )}
          <div className="author-info">
            <span className="author-name">
              {post.author.displayName || post.author.username}
            </span>
            <span className="author-username">@{post.author.username}</span>
          </div>
        </Link>
        <span className="post-date">{formatDate(post.createdAt)}</span>
      </div>
      
      {post.sensitive && !revealed ? (
        <div className="content-warning">
          <p>{post.contentWarning || 'Sensitive content'}</p>
          <button onClick={() => setRevealed(true)}>Show</button>
        </div>
      ) : (
        <>
          <div className="post-content">{post.content}</div>
          
          {post.attachments && post.attachments.length > 0 && (
            <div className="attachments">
              {post.attachments.map((attachment, index) => (
                <div key={index} className="attachment">
                  {attachment.mediaType.startsWith('image/') ? (
                    <img src={attachment.url} alt="Attachment" />
                  ) : attachment.mediaType.startsWith('video/') ? (
                    <video src={attachment.url} controls />
                  ) : (
                    <a href={attachment.url} target="_blank" rel="noopener noreferrer">
                      View attachment
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
      
      <div className="post-actions">
        <Link to={`/post/${post.id}`} className="action-button reply">
          <span className="action-icon">💬</span>
          <span className="action-count">{post.replyCount}</span>
        </Link>
        
        <button
          className={`action-button repost ${post.reposted ? 'active' : ''}`}
          onClick={() => onRepost(post.id)}
        >
          <span className="action-icon">🔄</span>
          <span className="action-count">{post.repostCount}</span>
        </button>
        
        <button
          className={`action-button like ${post.liked ? 'active' : ''}`}
          onClick={() => onLike(post.id)}
        >
          <span className="action-icon">{post.liked ? '❤️' : '🤍'}</span>
          <span className="action-count">{post.likeCount}</span>
        </button>
      </div>
    </div>
  );
};

export default PostItem;
```

## Step 6: User Discovery Implementation

Let's create a simple user discovery feature:

```typescript
// src/pages/Discover.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Discover: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchTerm.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Handle @username@domain format
      if (searchTerm.includes('@')) {
        const parts = searchTerm.split('@').filter(Boolean);
        
        if (parts.length === 2) {
          // Local user
          navigate(`/profile/${parts[0]}`);
          return;
        } else if (parts.length === 3) {
          // Remote user
          const response = await fetch(
            `${import.meta.env.VITE_API_URL}/federation/resolve`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                username: parts[1],
                domain: parts[2],
              }),
            }
          );
          
          if (!response.ok) {
            throw new Error('Failed to resolve remote user');
          }
          
          const user = await response.json();
          navigate(`/remote-profile/${user.id}`);
          return;
        }
      }
      
      // Search local users
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/users/search?q=${encodeURIComponent(searchTerm)}`
      );
      
      if (!response.ok) {