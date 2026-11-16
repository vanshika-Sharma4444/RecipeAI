import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Clock,
  Users,
  ChefHat,
  Flame,
  Heart,
  ShoppingCart,
  CalendarDays,
  ArrowLeft,
  Sparkles,
  Check,
  CheckCircle2,
  UtensilsCrossed,
  Layers,
  Activity,
  Share2,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import './RecipeDetails.css';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const mealSlots = ['Breakfast', 'Lunch', 'Dinner'];

export const RecipeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { isAuthenticated, isFavourited, toggleFavourite } = useAuth();

  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkedIngredients, setCheckedIngredients] = useState({});
  const [completedSteps, setCompletedSteps] = useState({});

  // Meal Plan Modal State
  const [showMealPlanModal, setShowMealPlanModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [selectedMealType, setSelectedMealType] = useState('Dinner');
  const [planningMeal, setPlanningMeal] = useState(false);

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const res = await api.get(`/recipes/${id}`);
        if (res.data.success) {
          setRecipe(res.data.recipe);
        }
      } catch (err) {
        toast.error('Recipe not found or error loading recipe.');
        navigate('/explore');
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [id]);

  const toggleIngredientCheck = (idx) => {
    setCheckedIngredients((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const toggleStepCheck = (idx) => {
    setCompletedSteps((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const handleAddToShoppingList = async () => {
    if (!isAuthenticated) {
      toast.info('Please log in to add items to your shopping list!');
      return;
    }

    try {
      const res = await api.post('/shopping-list/bulk', {
        ingredients: recipe.ingredients,
        recipeTitle: recipe.title,
      });

      if (res.data.success) {
        toast.success(`Ingredients from "${recipe.title}" added to your Shopping List! 🛒`);
      }
    } catch (err) {
      toast.error(err.message || 'Could not add ingredients.');
    }
  };

  const handlePlanMeal = async () => {
    if (!isAuthenticated) {
      toast.info('Please log in to add this recipe to your weekly meal plan!');
      return;
    }

    setPlanningMeal(true);
    try {
      const res = await api.post('/meal-plans', {
        day: selectedDay,
        mealType: selectedMealType,
        recipeId: recipe._id,
      });

      if (res.data.success) {
        toast.success(`Added to ${selectedDay} ${selectedMealType}! 📅`);
        setShowMealPlanModal(false);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to add meal plan.');
    } finally {
      setPlanningMeal(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
        <div className="spinner" style={{ width: '40px', height: '40px', borderColor: '#153e2e' }} />
        <p style={{ marginTop: '16px', color: '#576561' }}>Loading recipe deliciousness...</p>
      </div>
    );
  }

  if (!recipe) return null;

  const favourited = isFavourited(recipe._id);
  const dietaryClass = `badge-${(recipe.dietaryPreference || 'Vegetarian')
    .toLowerCase()
    .replace(' ', '-')}`;

  return (
    <div className="recipe-details-page">
      <div className="container">
        {/* Breadcrumb / Back Link */}
        <div className="details-nav-row">
          <Link to="/explore" className="back-link">
            <ArrowLeft size={16} /> Back to Recipes
          </Link>
          <div className="top-action-group">
            <button
              className={`fav-action-btn ${favourited ? 'is-fav' : ''}`}
              onClick={() => toggleFavourite(recipe._id)}
            >
              <Heart size={18} fill={favourited ? '#ea580c' : 'none'} color={favourited ? '#ea580c' : 'currentColor'} />
              {favourited ? 'Saved in Favourites' : 'Add to Favourites'}
            </button>
          </div>
        </div>

        {/* Hero Section */}
        <div className="details-hero">
          <div className="details-hero-image-wrap">
            <img
              src={recipe.image || 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=1200&q=80'}
              alt={recipe.title}
              className="details-hero-image"
            />
            {recipe.isAIgenerated && (
              <div className="details-ai-tag">
                <Sparkles size={14} /> AI Crafted Recipe
              </div>
            )}
          </div>

          <div className="details-header-card">
            <div className="details-badges-row">
              <span className={`badge ${dietaryClass}`}>{recipe.dietaryPreference || 'Vegetarian'}</span>
              <span className="badge badge-primary">{recipe.category}</span>
              <span className="badge badge-accent">
                <ChefHat size={13} /> {recipe.difficulty}
              </span>
            </div>

            <h1 className="details-title">{recipe.title}</h1>
            <p className="details-desc">{recipe.description}</p>

            <div className="details-meta-grid">
              <div className="meta-box">
                <Clock size={20} className="meta-icon" />
                <div>
                  <span className="val">{recipe.preparationTime || 10} mins</span>
                  <span className="lbl">Prep Time</span>
                </div>
              </div>

              <div className="meta-box">
                <Clock size={20} className="meta-icon" />
                <div>
                  <span className="val">{recipe.cookingTime} mins</span>
                  <span className="lbl">Cook Time</span>
                </div>
              </div>

              <div className="meta-box">
                <Users size={20} className="meta-icon" />
                <div>
                  <span className="val">{recipe.servings || 2} People</span>
                  <span className="lbl">Servings</span>
                </div>
              </div>

              <div className="meta-box">
                <Flame size={20} className="meta-icon flame" />
                <div>
                  <span className="val">{recipe.nutrition?.calories || 380} kcal</span>
                  <span className="lbl">Calories / Serving</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="details-primary-actions">
              <button className="btn btn-primary" onClick={handleAddToShoppingList}>
                <ShoppingCart size={18} />
                Add Ingredients to Shopping List
              </button>

              <button className="btn btn-outline" onClick={() => setShowMealPlanModal(true)}>
                <CalendarDays size={18} />
                Add to Weekly Meal Plan
              </button>
            </div>
          </div>
        </div>

        {/* Nutritional Breakdown Bar */}
        {recipe.nutrition && (
          <div className="nutrition-breakdown-card">
            <div className="nutrition-card-header">
              <Activity size={20} className="activity-icon" />
              <div>
                <h3>Estimated Nutrition Breakdown</h3>
                <span>Per serving estimates • Values calculated by RecipeAI</span>
              </div>
            </div>

            <div className="nutrition-grid-values">
              <div className="nutrition-stat">
                <span className="stat-name">Calories</span>
                <span className="stat-val">{recipe.nutrition.calories || 0} kcal</span>
              </div>
              <div className="nutrition-stat">
                <span className="stat-name">Protein</span>
                <span className="stat-val">{recipe.nutrition.protein || 0} g</span>
              </div>
              <div className="nutrition-stat">
                <span className="stat-name">Carbs</span>
                <span className="stat-val">{recipe.nutrition.carbohydrates || 0} g</span>
              </div>
              <div className="nutrition-stat">
                <span className="stat-name">Fat</span>
                <span className="stat-val">{recipe.nutrition.fat || 0} g</span>
              </div>
              <div className="nutrition-stat">
                <span className="stat-name">Sat. Fat</span>
                <span className="stat-val">{recipe.nutrition.saturatedFat || 0} g</span>
              </div>
              <div className="nutrition-stat">
                <span className="stat-name">Sugar</span>
                <span className="stat-val">{recipe.nutrition.sugar || 0} g</span>
              </div>
              <div className="nutrition-stat">
                <span className="stat-name">Fiber</span>
                <span className="stat-val">{recipe.nutrition.fiber || 0} g</span>
              </div>
              <div className="nutrition-stat">
                <span className="stat-name">Sodium</span>
                <span className="stat-val">{recipe.nutrition.sodium || 0} mg</span>
              </div>
            </div>
          </div>
        )}

        {/* Recipe Body: Two Columns (Ingredients vs Step-by-Step Instructions) */}
        <div className="details-body-layout">
          {/* Ingredients Column */}
          <div className="details-col ingredients-col">
            <div className="col-header">
              <UtensilsCrossed size={20} />
              <h2>Ingredients ({recipe.ingredients?.length || 0})</h2>
            </div>
            <p className="col-sub">Click an item to check it off as you prep:</p>

            <ul className="details-ingredients-list">
              {recipe.ingredients?.map((ing, idx) => {
                const name = typeof ing === 'string' ? ing : ing.name;
                const qty = typeof ing === 'object' ? ing.quantity : '';
                const isChecked = checkedIngredients[idx];

                return (
                  <li
                    key={idx}
                    className={`detail-ing-item ${isChecked ? 'is-checked' : ''}`}
                    onClick={() => toggleIngredientCheck(idx)}
                  >
                    <div className={`checkbox-box ${isChecked ? 'checked' : ''}`}>
                      {isChecked && <Check size={14} />}
                    </div>
                    <span className="detail-ing-name">{name}</span>
                    {qty && <span className="detail-ing-qty">{qty}</span>}
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Instructions Column */}
          <div className="details-col instructions-col">
            <div className="col-header">
              <Layers size={20} />
              <h2>Step-by-Step Cooking Instructions</h2>
            </div>
            <p className="col-sub">Follow each step and check off when completed:</p>

            <div className="details-steps-list">
              {recipe.instructions?.map((step, idx) => {
                const isDone = completedSteps[idx];
                return (
                  <div
                    key={idx}
                    className={`detail-step-card ${isDone ? 'is-done' : ''}`}
                    onClick={() => toggleStepCheck(idx)}
                  >
                    <div className="step-badge-circle">
                      {isDone ? <Check size={16} /> : idx + 1}
                    </div>
                    <div className="step-body-content">
                      <span className="step-num-text">Step {idx + 1}</span>
                      <p className="step-instruction-text">{step}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Add To Meal Plan Modal */}
      {showMealPlanModal && (
        <div className="modal-backdrop" onClick={() => setShowMealPlanModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Plan Meal: {recipe.title}</h3>
              <button
                className="modal-close-btn"
                onClick={() => setShowMealPlanModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Select Day of the Week</label>
                <select
                  value={selectedDay}
                  onChange={(e) => setSelectedDay(e.target.value)}
                  className="gen-select"
                >
                  {days.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Select Meal Slot</label>
                <select
                  value={selectedMealType}
                  onChange={(e) => setSelectedMealType(e.target.value)}
                  className="gen-select"
                >
                  {mealSlots.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-ghost"
                onClick={() => setShowMealPlanModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handlePlanMeal}
                disabled={planningMeal}
              >
                {planningMeal ? 'Adding...' : 'Confirm Meal Plan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecipeDetails;

