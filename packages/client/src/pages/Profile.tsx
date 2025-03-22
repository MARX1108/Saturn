import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/profile.css";

interface ProfileProps {
  isCurrentUser?: boolean;
}

const Profile: React.FC<ProfileProps> = ({ isCurrentUser = false }) => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Form states for editing
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Check if this is the current user's profile
  const effectiveIsCurrentUser =
    isCurrentUser ||
    (currentUser && currentUser.preferredUsername === username);

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // If it's the current user's profile and we're on /my-profile, redirect
        if (isCurrentUser && currentUser) {
          navigate(`/profile/${currentUser.preferredUsername}`);
          return;
        }

        const profileUsername = isCurrentUser
          ? currentUser?.preferredUsername
          : username;

        if (!profileUsername) {
          throw new Error("Username not found");
        }

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/actors/${profileUsername}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch profile");
        }

        const data = await response.json();
        setProfile(data);
        setDisplayName(data.name || "");
        setBio(data.summary || "");

        // Fetch posts (mock data for now)
        setPosts(
          Array(9).fill({
            id: Math.random().toString(36).substring(7),
            imageUrl: `https://picsum.photos/400/400?random=${Math.floor(
              Math.random() * 1000
            )}`,
            likes: Math.floor(Math.random() * 1000),
            comments: Math.floor(Math.random() * 100),
          })
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [username, currentUser, isCurrentUser, navigate]);

  // Handle profile update
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("displayName", displayName);
      formData.append("bio", bio);
      if (avatarFile) {
        formData.append("avatarFile", avatarFile);
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/actors/${
          profile.preferredUsername
        }`,
        {
          method: "PUT",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      const updatedProfile = await response.json();
      setProfile(updatedProfile);
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Handle avatar file change
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setAvatarFile(file);

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setAvatarPreview(null);
    }
  };

  if (loading)
    return <div className="profile-container">Loading profile...</div>;
  if (error)
    return <div className="profile-container error">Error: {error}</div>;
  if (!profile)
    return <div className="profile-container">Profile not found</div>;

  return (
    <div className="profile-container">
      {isEditing && effectiveIsCurrentUser ? (
        <div className="edit-profile-form">
          <h1>Edit Profile</h1>
          <form onSubmit={handleUpdateProfile}>
            <div className="form-group">
              <label>Profile Picture</label>
              <div className="avatar-preview">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Avatar preview"
                    className="avatar"
                  />
                ) : profile.icon ? (
                  <img
                    src={profile.icon.url}
                    alt={profile.name}
                    className="avatar"
                  />
                ) : (
                  <div className="avatar-placeholder">No Image</div>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="file-input"
              />
            </div>

            <div className="form-group">
              <label>Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Display Name"
              />
            </div>

            <div className="form-group">
              <label>Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                placeholder="Write a short bio..."
              />
            </div>

            <div className="button-group">
              <button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save Changes"}
              </button>
              <button type="button" onClick={() => setIsEditing(false)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : (
        <>
          <div className="profile-header">
            <div className="avatar-container">
              {profile.icon ? (
                <img
                  src={profile.icon.url}
                  alt={profile.name}
                  className="avatar"
                />
              ) : (
                <div className="avatar avatar-placeholder">
                  {profile.preferredUsername?.substring(0, 1).toUpperCase()}
                </div>
              )}
            </div>

            <div className="profile-info-container">
              <div className="profile-username">
                {profile.preferredUsername}
                {effectiveIsCurrentUser && (
                  <button
                    className="edit-profile-btn"
                    onClick={() => setIsEditing(true)}
                  >
                    Edit Profile
                  </button>
                )}
              </div>

              <div className="profile-stats">
                <div className="stat-item">
                  <span className="stat-count">{posts.length}</span> posts
                </div>
                <div className="stat-item">
                  <span className="stat-count">0</span> followers
                </div>
                <div className="stat-item">
                  <span className="stat-count">0</span> following
                </div>
              </div>

              <div className="profile-bio">
                <div className="full-name">
                  {profile.name || profile.preferredUsername}
                </div>
                {profile.summary && (
                  <div className="bio">{profile.summary}</div>
                )}
              </div>
            </div>
          </div>

          <div className="story-highlights">
            {Array(5)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="story-item">
                  <div className="story-circle">
                    <img
                      src={`https://picsum.photos/100/100?random=${i}`}
                      alt="Story"
                      className="story-image"
                    />
                  </div>
                  <div className="story-name">Story {i + 1}</div>
                </div>
              ))}
          </div>

          <div className="posts-grid">
            {posts.map((post) => (
              <div key={post.id} className="post-item">
                <img src={post.imageUrl} alt="Post" className="post-image" />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Profile;
