import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Compass,
  CalendarDays,
  ShoppingCart,
  Heart,
  Activity,
  User,
  LogOut,
  Menu,
  X,
  ChefHat,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/');
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className="navbar-header">
      <div className="container navbar-container">
        {/* Brand Logo */}
        <Link to="/" className="navbar-brand" onClick={closeMobileMenu}>
          <div className="brand-icon-wrap">
            <ChefHat size={24} className="brand-icon" />
          </div>
          <div className="brand-text-wrap">
            <span className="brand-title">Recipe<span className="brand-ai">AI</span></span>
            <span className="brand-tagline">Smart Cooking</span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="desktop-nav">
          <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} end>
            Home
          </NavLink>
          <NavLink to="/explore" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <Compass size={16} />
            Explore
          </NavLink>
          <NavLink to="/generator" className={({ isActive }) => `nav-link nav-highlight ${isActive ? 'active' : ''}`}>
            <Sparkles size={16} />
            AI Generator
          </NavLink>
          <NavLink to="/nutrition" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <Activity size={16} />
            Nutrition
          </NavLink>
          <NavLink to="/meal-planner" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <CalendarDays size={16} />
            Meal Planner
          </NavLink>
          <NavLink to="/shopping-list" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <ShoppingCart size={16} />
            Shopping List
          </NavLink>
        </nav>

        {/* Desktop Auth Section */}
        <div className="navbar-actions">
          {isAuthenticated ? (
            <div className="user-menu">
              <Link to="/favourites" className="nav-icon-btn" title="Saved Favourites">
                <Heart size={19} />
                {user.favourites && user.favourites.length > 0 && (
                  <span className="fav-count-pill">{user.favourites.length}</span>
                )}
              </Link>

              <div className="user-profile-badge">
                <div className="user-avatar">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="user-name">{user.name.split(' ')[0]}</span>
              </div>

              <button className="btn btn-ghost btn-sm logout-btn" onClick={handleLogout} title="Sign Out">
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn btn-ghost btn-sm">
                Log In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Get Started
              </Link>
            </div>
          )}

          {/* Mobile Menu Hamburger Toggle */}
          <button
            className="mobile-toggle-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-nav-drawer">
          <nav className="mobile-nav-links">
            <NavLink to="/" onClick={closeMobileMenu} className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`} end>
              Home
            </NavLink>
            <NavLink to="/explore" onClick={closeMobileMenu} className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}>
              <Compass size={18} />
              Explore Recipes
            </NavLink>
            <NavLink to="/generator" onClick={closeMobileMenu} className={({ isActive }) => `mobile-nav-link mobile-highlight ${isActive ? 'active' : ''}`}>
              <Sparkles size={18} />
              AI Recipe Generator
            </NavLink>
            <NavLink to="/nutrition" onClick={closeMobileMenu} className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}>
              <Activity size={18} />
              Nutrition & Health Analyzer
            </NavLink>
            <NavLink to="/meal-planner" onClick={closeMobileMenu} className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}>
              <CalendarDays size={18} />
              Weekly Meal Planner
            </NavLink>
            <NavLink to="/shopping-list" onClick={closeMobileMenu} className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}>
              <ShoppingCart size={18} />
              Shopping List
            </NavLink>
            {isAuthenticated && (
              <NavLink to="/favourites" onClick={closeMobileMenu} className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}>
                <Heart size={18} />
                My Favourites ({user.favourites?.length || 0})
              </NavLink>
            )}
          </nav>

          <div className="mobile-auth-section">
            {isAuthenticated ? (
              <div className="mobile-user-box">
                <div className="mobile-user-info">
                  <div className="user-avatar">{user.name.charAt(0).toUpperCase()}</div>
                  <div>
                    <div className="user-name-full">{user.name}</div>
                    <div className="user-email-text">{user.email}</div>
                  </div>
                </div>
                <button className="btn btn-outline btn-sm w-full" onClick={handleLogout}>
                  <LogOut size={16} /> Logout
                </button>
              </div>
            ) : (
              <div className="mobile-guest-box">
                <Link to="/login" onClick={closeMobileMenu} className="btn btn-outline btn-sm w-full">
                  Log In
                </Link>
                <Link to="/register" onClick={closeMobileMenu} className="btn btn-primary btn-sm w-full">
                  Create Free Account
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;

