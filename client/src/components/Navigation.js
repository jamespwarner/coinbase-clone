import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navigation = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/secure" className="navbar-brand">
          Coinbase
        </Link>
      </div>

      <div className="navbar-nav">
        <Link to="/secure" className="nav-link">Buy & Sell</Link>
        <Link to="/secure" className="nav-link">Explore</Link>
        <Link to="/secure" className="nav-link">Learn</Link>
        <Link to="/secure" className="nav-link">Individuals</Link>
        <Link to="/secure" className="nav-link">Businesses</Link>
      </div>

      <div className="nav-buttons">
        {isAuthenticated ? (
          <>
            <span className="nav-link">
              Welcome, {user?.firstName}
            </span>
            <Link to="/dashboard" className="btn btn-outline">
              Dashboard
            </Link>
            <button onClick={handleLogout} className="btn btn-primary">
              Sign Out
            </button>
          </>
        ) : (
          <>
            <Link to="/secure/signin" className="btn btn-outline">
              Sign In
            </Link>
            <Link to="/secure/signup" className="btn btn-primary">
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navigation;