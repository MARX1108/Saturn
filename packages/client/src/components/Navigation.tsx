import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/navigation.css";

const Navigation: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
    }
  };

  return (
    <nav className="nav-container">
      <div className="nav-content">
        <div className="nav-logo">
          <Link to="/">Saturn</Link>
        </div>

        {isAuthenticated && (
          <form className="nav-search" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </form>
        )}

        <div className="nav-links">
          {isAuthenticated ? (
            <>
              <Link to="/" className="nav-icon-link">
                <i className="nav-icon home-icon"></i>
              </Link>
              <Link to="/explore" className="nav-icon-link">
                <i className="nav-icon explore-icon"></i>
              </Link>
              <Link to="/messages" className="nav-icon-link">
                <i className="nav-icon message-icon"></i>
              </Link>
              <Link to="/notifications" className="nav-icon-link">
                <i className="nav-icon notification-icon"></i>
              </Link>
              <Link
                to={`/profile/${user?.preferredUsername}`}
                className="nav-icon-link profile-link"
              >
                {user?.icon ? (
                  <img
                    src={user.icon.url}
                    alt={user.name || user.preferredUsername}
                    className="nav-profile-img"
                  />
                ) : (
                  <div className="nav-profile-placeholder">
                    {user?.preferredUsername.substring(0, 1).toUpperCase()}
                  </div>
                )}
              </Link>
              <button onClick={handleLogout} className="nav-logout-btn">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-btn login-btn">
                Log In
              </Link>
              <Link to="/register" className="nav-btn signup-btn">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
