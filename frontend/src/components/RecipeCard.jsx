import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Users, Heart, Sparkles, ChefHat } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './RecipeCard.css';

export const RecipeCard = ({ recipe }) => {
  const { isFavourited, toggleFavourite } = useAuth();
  const favourited = isFavourited(recipe._id);

  const handleFavClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavourite(recipe._id);
  };

  const dietaryClass = `badge-${(recipe.dietaryPreference || 'Vegetarian')
    .toLowerCase()
    .replace(' ', '-')}`;

  return (
    <div className="recipe-card">
      <div className="card-image-wrap">
        <img
          src={recipe.image || 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=800&q=80'}
          alt={recipe.title}
          className="card-image"
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=800&q=80';
          }}
        />

        {recipe.isAIgenerated && (
          <div className="ai-badge">
            <Sparkles size={13} />
            <span>AI Recipe</span>
          </div>
        )}

        <button
          className={`fav-btn ${favourited ? 'is-fav' : ''}`}
          onClick={handleFavClick}
          aria-label={favourited ? 'Remove from favourites' : 'Save to favourites'}
          title={favourited ? 'Remove from favourites' : 'Save to favourites'}
        >
          <Heart size={18} fill={favourited ? '#ea580c' : 'none'} color={favourited ? '#ea580c' : '#ffffff'} />
        </button>

        <div className="category-pill">{recipe.category || 'Dinner'}</div>
      </div>

      <div className="card-body">
        <div className="card-tags">
          <span className={`badge ${dietaryClass}`}>{recipe.dietaryPreference || 'Vegetarian'}</span>
          <span className="badge badge-difficulty">
            <ChefHat size={12} />
            {recipe.difficulty || 'Easy'}
          </span>
        </div>

        <h3 className="card-title">
          <Link to={`/recipes/${recipe._id}`}>{recipe.title}</Link>
        </h3>

        <p className="card-desc">
          {recipe.description && recipe.description.length > 95
            ? `${recipe.description.substring(0, 95)}...`
            : recipe.description}
        </p>

        <div className="card-meta">
          <div className="meta-item" title="Cooking Time">
            <Clock size={15} />
            <span>{recipe.cookingTime} mins</span>
          </div>
          <div className="meta-item" title="Servings">
            <Users size={15} />
            <span>{recipe.servings || 2} servings</span>
          </div>
          {recipe.nutrition?.calories ? (
            <div className="meta-item meta-calories" title="Estimated Calories">
              <span>{recipe.nutrition.calories} kcal</span>
            </div>
          ) : null}
        </div>

        <Link to={`/recipes/${recipe._id}`} className="btn btn-outline btn-sm view-btn">
          View Recipe
        </Link>
      </div>
    </div>
  );
};

export default RecipeCard;

