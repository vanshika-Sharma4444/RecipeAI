import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, Clock, ChefHat, Sparkles, X, RotateCcw } from 'lucide-react';
import api from '../services/api';
import RecipeCard from '../components/RecipeCard';
import { RecipeGridSkeleton } from '../components/SkeletonLoader';
import './Explore.css';

const categories = ['All', 'Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Desserts'];
const cookingTimes = [
  { label: 'Any Time', value: '' },
  { label: 'Under 15 mins', value: '15' },
  { label: 'Under 30 mins', value: '30' },
  { label: 'Under 45 mins', value: '45' },
  { label: 'Under 60 mins', value: '60' },
];
const difficulties = ['All', 'Easy', 'Medium', 'Hard'];
const diets = ['All', 'Vegetarian', 'Vegan', 'Non-Vegetarian'];

export const Explore = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [cookingTime, setCookingTime] = useState(searchParams.get('cookingTime') || '');
  const [difficulty, setDifficulty] = useState(searchParams.get('difficulty') || 'All');
  const [dietaryPreference, setDietaryPreference] = useState(searchParams.get('diet') || 'All');

  // Fetch filtered recipes
  const fetchRecipes = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (category !== 'All') params.category = category;
      if (cookingTime) params.cookingTime = cookingTime;
      if (difficulty !== 'All') params.difficulty = difficulty;
      if (dietaryPreference !== 'All') params.dietaryPreference = dietaryPreference;

      const res = await api.get('/recipes', { params });
      if (res.data.success) {
        setRecipes(res.data.recipes);
      }
    } catch (err) {
      console.error('Failed to load recipes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, [category, cookingTime, difficulty, dietaryPreference]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchRecipes();
  };

  const handleResetFilters = () => {
    setSearch('');
    setCategory('All');
    setCookingTime('');
    setDifficulty('All');
    setDietaryPreference('All');
  };

  const hasActiveFilters =
    search.trim() !== '' ||
    category !== 'All' ||
    cookingTime !== '' ||
    difficulty !== 'All' ||
    dietaryPreference !== 'All';

  return (
    <div className="explore-page">
      <div className="container">
        {/* Explore Header */}
        <div className="explore-header">
          <span className="sub-tag">Recipe Collection</span>
          <h1>Explore Delicious Recipes</h1>
          <p>
            Filter through our curated chef-tested recipes by meal category, prep time, difficulty, or dietary preference.
          </p>
        </div>

        {/* Search Bar */}
        <div className="explore-search-section">
          <form className="explore-search-bar" onSubmit={handleSearchSubmit}>
            <Search size={20} className="search-icon" />
            <input
              type="text"
              placeholder="Search by recipe name or ingredients (e.g. Avocado, Pasta, Salmon)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
            {search && (
              <button
                type="button"
                className="clear-search-btn"
                onClick={() => {
                  setSearch('');
                  fetchRecipes();
                }}
              >
                <X size={16} />
              </button>
            )}
            <button type="submit" className="btn btn-primary search-submit-btn">
              Search
            </button>
          </form>
        </div>

        {/* Category Pills Bar */}
        <div className="category-pills-bar">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`cat-pill ${category === cat ? 'active' : ''}`}
              onClick={() => setCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Multi-Filters Row */}
        <div className="filters-card">
          <div className="filters-group">
            <div className="filter-item">
              <label htmlFor="time-select">
                <Clock size={15} /> Max Cooking Time
              </label>
              <select
                id="time-select"
                value={cookingTime}
                onChange={(e) => setCookingTime(e.target.value)}
                className="filter-select"
              >
                {cookingTimes.map((t) => (
                  <option key={t.label} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-item">
              <label htmlFor="difficulty-select">
                <ChefHat size={15} /> Difficulty
              </label>
              <select
                id="difficulty-select"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="filter-select"
              >
                {difficulties.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-item">
              <label htmlFor="diet-select">
                <Filter size={15} /> Dietary Preference
              </label>
              <select
                id="diet-select"
                value={dietaryPreference}
                onChange={(e) => setDietaryPreference(e.target.value)}
                className="filter-select"
              >
                {diets.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {hasActiveFilters && (
            <button className="btn btn-ghost btn-sm reset-btn" onClick={handleResetFilters}>
              <RotateCcw size={14} />
              Reset All Filters
            </button>
          )}
        </div>

        {/* Results Info */}
        <div className="results-meta-row">
          <span className="results-count">
            Found <strong>{recipes.length}</strong> {recipes.length === 1 ? 'recipe' : 'recipes'}
          </span>
        </div>

        {/* Recipe Grid or Skeleton / Empty State */}
        {loading ? (
          <RecipeGridSkeleton count={6} />
        ) : recipes.length > 0 ? (
          <div className="recipe-grid">
            {recipes.map((recipe) => (
              <RecipeCard key={recipe._id} recipe={recipe} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">
              <Search size={32} />
            </div>
            <h3>No recipes matched your criteria</h3>
            <p>
              Try clearing some filters, searching for a different ingredient, or use our AI Recipe
              Generator to create a custom recipe right now!
            </p>
            <div className="empty-state-actions">
              <button className="btn btn-outline" onClick={handleResetFilters}>
                Clear Filters
              </button>
              <a href="/generator" className="btn btn-accent">
                <Sparkles size={16} /> Generate with AI
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Explore;

