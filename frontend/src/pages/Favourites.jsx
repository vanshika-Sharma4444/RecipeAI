import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Compass, Sparkles, ChefHat } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import RecipeCard from '../components/RecipeCard';
import { RecipeGridSkeleton } from '../components/SkeletonLoader';
import './Favourites.css';

export const Favourites = () => {
  const { isAuthenticated, user } = useAuth();
  const [favouriteRecipes, setFavouriteRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFavourites = async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await api.get('/favourites');
      if (res.data.success) {
        setFavouriteRecipes(res.data.favourites || []);
      }
    } catch (err) {
      console.error('Failed to load favourites:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavourites();
  }, [isAuthenticated, user?.favourites]);

  if (!isAuthenticated) {
    return (
      <div className="favourites-page">
        <div className="container">
          <div className="empty-state">
            <div className="empty-state-icon">
              <Heart size={32} />
            </div>
            <h2>Save Your Favorite Recipes</h2>
            <p>Please log in or create an account to save, organize, and access your favorite recipes anytime.</p>
            <div className="empty-state-actions">
              <Link to="/login" className="btn btn-primary">
                Log In
              </Link>
              <Link to="/register" className="btn btn-outline">
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="favourites-page">
      <div className="container">
        <div className="favourites-header">
          <div className="fav-badge">
            <Heart size={16} fill="#ea580c" color="#ea580c" />
            <span>Personal Cookbook</span>
          </div>
          <h1>My Saved Favourites</h1>
          <p>Your personalized culinary collection. Revisit, cook, and plan your most loved meals.</p>
        </div>

        {loading ? (
          <RecipeGridSkeleton count={3} />
        ) : favouriteRecipes.length > 0 ? (
          <div className="recipe-grid">
            {favouriteRecipes.map((recipe) => (
              <RecipeCard key={recipe._id} recipe={recipe} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">
              <Heart size={32} />
            </div>
            <h3>Your cookbook is currently empty</h3>
            <p>
              When you find a dish you love on the Explore page or generate a new masterpiece with AI,
              click the heart icon to save it here!
            </p>
            <div className="empty-state-actions">
              <Link to="/explore" className="btn btn-primary">
                <Compass size={16} /> Explore Recipes
              </Link>
              <Link to="/generator" className="btn btn-accent">
                <Sparkles size={16} /> Generate with AI
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Favourites;

