import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarDays,
  Plus,
  Trash2,
  Clock,
  Sparkles,
  ChefHat,
  ChevronRight,
  UtensilsCrossed,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import './MealPlanner.css';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const mealTypes = ['Breakfast', 'Lunch', 'Dinner'];

export const MealPlanner = () => {
  const { isAuthenticated } = useAuth();
  const toast = useToast();

  const [mealPlans, setMealPlans] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State for adding a meal
  const [modalOpen, setModalOpen] = useState(false);
  const [targetDay, setTargetDay] = useState('Monday');
  const [targetMealType, setTargetMealType] = useState('Breakfast');
  const [selectedRecipeId, setSelectedRecipeId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [plansRes, recipesRes] = await Promise.all([
        api.get('/meal-plans'),
        api.get('/recipes'),
      ]);

      if (plansRes.data.success) {
        setMealPlans(plansRes.data.mealPlans || []);
      }
      if (recipesRes.data.success) {
        setRecipes(recipesRes.data.recipes || []);
        if (recipesRes.data.recipes?.length > 0) {
          setSelectedRecipeId(recipesRes.data.recipes[0]._id);
        }
      }
    } catch (err) {
      console.error('Failed to load meal plans:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [isAuthenticated]);

  const openAddModal = (day, mealType) => {
    setTargetDay(day);
    setTargetMealType(mealType);
    setModalOpen(true);
  };

  const handleAddMeal = async (e) => {
    e.preventDefault();
    if (!selectedRecipeId) {
      toast.warning('Please select a recipe to assign.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/meal-plans', {
        day: targetDay,
        mealType: targetMealType,
        recipeId: selectedRecipeId,
      });

      if (res.data.success) {
        toast.success(`Assigned to ${targetDay} ${targetMealType}! 📅`);
        setModalOpen(false);
        fetchData();
      }
    } catch (err) {
      toast.error(err.message || 'Could not plan meal.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteMeal = async (planId) => {
    try {
      const res = await api.delete(`/meal-plans/${planId}`);
      if (res.data.success) {
        setMealPlans((prev) => prev.filter((p) => p._id !== planId));
        toast.info('Meal removed from plan.');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to remove meal.');
    }
  };

  // Find assigned meal for a day and meal slot
  const getMealForSlot = (day, type) => {
    return mealPlans.find((p) => p.day === day && p.mealType === type);
  };

  if (!isAuthenticated) {
    return (
      <div className="meal-planner-page">
        <div className="container">
          <div className="empty-state">
            <div className="empty-state-icon">
              <CalendarDays size={32} />
            </div>
            <h2>Weekly Meal Planner</h2>
            <p>
              Plan your breakfasts, lunches, and dinners for every day of the week. Please log in or
              create an account to access your personal meal schedule.
            </p>
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
    <div className="meal-planner-page">
      <div className="container">
        {/* Header */}
        <div className="planner-header">
          <div className="planner-badge">
            <CalendarDays size={16} />
            <span>Smart Schedule</span>
          </div>
          <h1>Weekly Meal Planner</h1>
          <p>
            Organize your nutrition and meals from Monday to Sunday. Add recipes to specific slots,
            maintain consistency, and streamline your cooking routine.
          </p>
        </div>

        {/* Weekly Grid */}
        <div className="weekly-calendar-grid">
          {days.map((day) => (
            <div key={day} className="day-column">
              <div className="day-header">
                <h3>{day}</h3>
              </div>

              <div className="day-slots">
                {mealTypes.map((type) => {
                  const plan = getMealForSlot(day, type);
                  const recipe = plan?.recipe;

                  return (
                    <div key={type} className="meal-slot-card">
                      <div className="slot-type-label">{type}</div>

                      {recipe ? (
                        <div className="assigned-recipe">
                          <img
                            src={recipe.image || 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=400&q=80'}
                            alt={recipe.title}
                            className="assigned-img"
                          />
                          <div className="assigned-info">
                            <h4 className="assigned-title">
                              <Link to={`/recipes/${recipe._id}`}>{recipe.title}</Link>
                            </h4>
                            <div className="assigned-meta">
                              <span className="assigned-time">
                                <Clock size={12} /> {recipe.cookingTime || 20}m
                              </span>
                              {recipe.nutrition?.calories ? (
                                <span className="assigned-cal">{recipe.nutrition.calories} kcal</span>
                              ) : null}
                            </div>
                          </div>
                          <button
                            className="remove-slot-btn"
                            onClick={() => handleDeleteMeal(plan._id)}
                            title="Remove meal"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ) : (
                        <button
                          className="add-to-slot-btn"
                          onClick={() => openAddModal(day, type)}
                        >
                          <Plus size={16} />
                          <span>Add {type}</span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Meal Plan Modal */}
      {modalOpen && (
        <div className="modal-backdrop" onClick={() => setModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Plan Meal: {targetDay} {targetMealType}</h3>
              <button className="modal-close-btn" onClick={() => setModalOpen(false)}>
                ✕
              </button>
            </div>

            <form onSubmit={handleAddMeal}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Select a Recipe</label>
                  <select
                    value={selectedRecipeId}
                    onChange={(e) => setSelectedRecipeId(e.target.value)}
                    className="gen-select"
                  >
                    {recipes.map((r) => (
                      <option key={r._id} value={r._id}>
                        {r.title} ({r.category} • {r.cookingTime} mins)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? 'Assigning...' : 'Assign Recipe'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MealPlanner;

