import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Plus,
  X,
  Clock,
  Users,
  ChefHat,
  Flame,
  BookmarkPlus,
  ShoppingCart,
  Heart,
  AlertTriangle,
  Info,
  CheckCircle2,
  UtensilsCrossed,
  Layers,
} from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import './Generator.css';

const popularQuickIngredients = [
  'Tomato',
  'Garlic',
  'Onion',
  'Eggs',
  'Avocado',
  'Paneer',
  'Chicken',
  'Pasta',
  'Rice',
  'Spinach',
  'Cheese',
  'Mushrooms',
];

export const Generator = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { isAuthenticated, user, toggleFavourite, isFavourited } = useAuth();

  // Generator form inputs
  const [ingredients, setIngredients] = useState(() => {
    const fromQuery = searchParams.get('ingredients');
    return fromQuery
      ? fromQuery.split(',').map((i) => i.trim()).filter(Boolean)
      : ['Avocado', 'Sourdough', 'Eggs'];
  });
  const [currentInput, setCurrentInput] = useState('');
  const [mealType, setMealType] = useState('Breakfast');
  const [dietaryPreference, setDietaryPreference] = useState('Vegetarian');
  const [cookingTime, setCookingTime] = useState(25);
  const [difficulty, setDifficulty] = useState('Easy');
  const [instructions, setInstructions] = useState('');

  // Results State
  const [generating, setGenerating] = useState(false);
  const [generatedRecipes, setGeneratedRecipes] = useState([]);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [activeRecipeIndex, setActiveRecipeIndex] = useState(0);
  const [savingRecipe, setSavingRecipe] = useState(false);
  const [savedIds, setSavedIds] = useState({});

  // Add ingredient tag
  const addIngredient = (item) => {
    const trimmed = item.trim();
    if (trimmed && !ingredients.some((i) => i.toLowerCase() === trimmed.toLowerCase())) {
      setIngredients([...ingredients, trimmed]);
    }
    setCurrentInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addIngredient(currentInput);
    }
  };

  const removeIngredient = (tag) => {
    setIngredients(ingredients.filter((i) => i !== tag));
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (ingredients.length === 0) {
      toast.warning('Please add at least one ingredient to generate recipes!');
      return;
    }

    setGenerating(true);
    setGeneratedRecipes([]);

    try {
      const res = await api.post('/ai/generate', {
        ingredients,
        mealType,
        dietaryPreference,
        cookingTime,
        difficulty,
        instructions,
      });

      if (res.data.success) {
        setGeneratedRecipes(res.data.recipes);
        setIsDemoMode(Boolean(res.data.isDemoMode));
        setActiveRecipeIndex(0);

        if (res.data.isDemoMode) {
          toast.info('Crafted demo recipes displayed (Add GEMINI_API_KEY in backend/.env for live AI generation).');
        } else {
          toast.success('3 AI recipe suggestions generated successfully! ✨');
        }
      }
    } catch (err) {
      toast.error(err.message || 'Recipe generation failed. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  // Save generated recipe to database
  const handleSaveRecipe = async (recipe) => {
    try {
      setSavingRecipe(true);
      const res = await api.post('/recipes', {
        ...recipe,
        isAIgenerated: true,
      });

      if (res.data.success) {
        const newId = res.data.recipe._id;
        setSavedIds((prev) => ({ ...prev, [recipe.title]: newId }));
        toast.success(`"${recipe.title}" saved to Recipe Collection!`);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to save recipe.');
    } finally {
      setSavingRecipe(false);
    }
  };

  // Add all ingredients of recipe to shopping list
  const handleAddAllToShoppingList = async (recipe) => {
    if (!isAuthenticated) {
      toast.info('Please log in to save items to your shopping list!');
      return;
    }

    try {
      const res = await api.post('/shopping-list/bulk', {
        ingredients: recipe.ingredients,
        recipeTitle: recipe.title,
      });

      if (res.data.success) {
        toast.success(`Ingredients from "${recipe.title}" added to your Shopping List!`);
      }
    } catch (err) {
      toast.error(err.message || 'Could not add to shopping list.');
    }
  };

  const activeRecipe = generatedRecipes[activeRecipeIndex];

  return (
    <div className="generator-page">
      <div className="container">
        {/* Header */}
        <div className="generator-header">
          <div className="gen-badge">
            <Sparkles size={16} />
            <span>AI Recipe Studio</span>
          </div>
          <h1>Generate Recipes from What You Have</h1>
          <p>
            Tell our AI chef what’s currently in your kitchen. We’ll generate 3 customized recipe
            suggestions with complete step-by-step instructions and nutritional estimates.
          </p>
        </div>

        {/* Demo Mode Notice Banner */}
        {isDemoMode && (
          <div className="demo-banner">
            <Info size={22} className="info-icon" />
            <div>
              <strong>Demonstration Mode Active:</strong> Live Gemini AI recipe generation is ready to
              activate whenever you add your free <code>GEMINI_API_KEY</code> into{' '}
              <code>backend/.env</code>. Showing pre-crafted chef recipes tailored to your criteria.
            </div>
          </div>
        )}

        <div className="generator-layout">
          {/* Form Card */}
          <div className="generator-form-card">
            <form onSubmit={handleGenerate}>
              {/* Ingredients Input Area */}
              <div className="form-group">
                <label className="form-label">
                  Available Ingredients <span className="required-star">*</span>
                </label>
                <div className="tags-input-container">
                  <div className="tags-wrap">
                    {ingredients.map((tag) => (
                      <span key={tag} className="ingredient-tag">
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeIngredient(tag)}
                          aria-label={`Remove ${tag}`}
                        >
                          <X size={13} />
                        </button>
                      </span>
                    ))}
                  </div>

                  <div className="tag-input-row">
                    <input
                      type="text"
                      placeholder="Type ingredient and press Enter (or comma)..."
                      value={currentInput}
                      onChange={(e) => setCurrentInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="tag-text-input"
                    />
                    <button
                      type="button"
                      className="add-tag-btn"
                      onClick={() => addIngredient(currentInput)}
                      disabled={!currentInput.trim()}
                    >
                      <Plus size={16} /> Add
                    </button>
                  </div>
                </div>

                {/* Quick Add Pills */}
                <div className="quick-add-section">
                  <span className="quick-add-label">Quick Add:</span>
                  <div className="quick-pills">
                    {popularQuickIngredients.map((ing) => (
                      <button
                        key={ing}
                        type="button"
                        className={`quick-pill ${
                          ingredients.some((i) => i.toLowerCase() === ing.toLowerCase())
                            ? 'already-added'
                            : ''
                        }`}
                        onClick={() => addIngredient(ing)}
                      >
                        + {ing}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Preferences Row 1: Meal Type & Dietary */}
              <div className="form-grid-2">
                <div className="form-group">
                  <label htmlFor="meal-type" className="form-label">
                    Meal Type
                  </label>
                  <select
                    id="meal-type"
                    value={mealType}
                    onChange={(e) => setMealType(e.target.value)}
                    className="gen-select"
                  >
                    <option value="Breakfast">🍳 Breakfast</option>
                    <option value="Lunch">🥗 Lunch</option>
                    <option value="Dinner">🍲 Dinner</option>
                    <option value="Snacks">🥨 Snacks</option>
                    <option value="Desserts">🍰 Desserts</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="diet-pref" className="form-label">
                    Dietary Preference
                  </label>
                  <select
                    id="diet-pref"
                    value={dietaryPreference}
                    onChange={(e) => setDietaryPreference(e.target.value)}
                    className="gen-select"
                  >
                    <option value="Vegetarian">🌱 Vegetarian</option>
                    <option value="Vegan">🌿 Vegan</option>
                    <option value="Non-Vegetarian">🍗 Non-Vegetarian</option>
                  </select>
                </div>
              </div>

              {/* Preferences Row 2: Cooking Time & Difficulty */}
              <div className="form-grid-2">
                <div className="form-group">
                  <label htmlFor="cook-time" className="form-label">
                    Max Cooking Time: <strong>{cookingTime} mins</strong>
                  </label>
                  <input
                    id="cook-time"
                    type="range"
                    min="10"
                    max="90"
                    step="5"
                    value={cookingTime}
                    onChange={(e) => setCookingTime(Number(e.target.value))}
                    className="gen-slider"
                  />
                  <div className="slider-labels">
                    <span>10 mins</span>
                    <span>45 mins</span>
                    <span>90 mins</span>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="diff-select" className="form-label">
                    Desired Difficulty
                  </label>
                  <select
                    id="diff-select"
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="gen-select"
                  >
                    <option value="Easy">Easy (Beginner friendly)</option>
                    <option value="Medium">Medium (Balanced technique)</option>
                    <option value="Hard">Hard (Chef style)</option>
                  </select>
                </div>
              </div>

              {/* Optional Instructions */}
              <div className="form-group">
                <label htmlFor="instructions" className="form-label">
                  Special Notes / Instructions <span className="optional-tag">(Optional)</span>
                </label>
                <textarea
                  id="instructions"
                  rows={2}
                  placeholder="e.g. Extra spicy, low carb, kid-friendly, no dairy, high protein..."
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  className="gen-textarea"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="btn btn-accent btn-lg w-full gen-submit-btn"
                disabled={generating}
              >
                {generating ? (
                  <>
                    <span className="spinner" />
                    Chef AI is Crafting Recipes...
                  </>
                ) : (
                  <>
                    <Sparkles size={20} />
                    Generate 3 Recipes with AI
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right Pane: Generated Recipes Display */}
          <div className="generator-results-pane">
            {generating ? (
              <div className="generating-loader-card">
                <div className="cooking-pot-animation">🍲</div>
                <h3>Cooking Up AI Recipes...</h3>
                <p>
                  Analyzing ingredient pairings, calculating balanced nutrition, and structuring step-by-step instructions.
                </p>
                <div className="loader-steps">
                  <div className="loader-step active">1. Pairing your available ingredients</div>
                  <div className="loader-step active">2. Checking cooking times & portions</div>
                  <div className="loader-step active">3. Formulating nutritional estimate</div>
                </div>
              </div>
            ) : generatedRecipes.length > 0 ? (
              <div className="results-display">
                {/* 3 Recipe Tabs */}
                <div className="recipe-tabs-bar">
                  {generatedRecipes.map((r, idx) => (
                    <button
                      key={idx}
                      className={`recipe-tab-btn ${activeRecipeIndex === idx ? 'active' : ''}`}
                      onClick={() => setActiveRecipeIndex(idx)}
                    >
                      <span className="tab-num">Option {idx + 1}</span>
                      <span className="tab-title">{r.title}</span>
                    </button>
                  ))}
                </div>

                {/* Active Recipe Card */}
                {activeRecipe && (
                  <div className="active-recipe-view">
                    <div className="view-hero-wrap">
                      <img
                        src={activeRecipe.image}
                        alt={activeRecipe.title}
                        className="view-hero-img"
                      />
                      <div className="view-overlay-meta">
                        <span className="badge badge-accent">
                          <Sparkles size={13} /> {isDemoMode ? 'Demo Recipe' : 'AI Generated'}
                        </span>
                        <span className="badge badge-primary">{activeRecipe.category}</span>
                      </div>
                    </div>

                    <div className="view-content">
                      <div className="view-header-row">
                        <div>
                          <h2 className="view-title">{activeRecipe.title}</h2>
                          <p className="view-desc">{activeRecipe.description}</p>
                        </div>
                      </div>

                      {/* Quick Meta */}
                      <div className="view-metrics-grid">
                        <div className="metric-box">
                          <Clock size={18} className="metric-icon" />
                          <div>
                            <span className="metric-val">{activeRecipe.cookingTime} mins</span>
                            <span className="metric-lbl">Cook Time</span>
                          </div>
                        </div>
                        <div className="metric-box">
                          <Users size={18} className="metric-icon" />
                          <div>
                            <span className="metric-val">{activeRecipe.servings || 2}</span>
                            <span className="metric-lbl">Servings</span>
                          </div>
                        </div>
                        <div className="metric-box">
                          <ChefHat size={18} className="metric-icon" />
                          <div>
                            <span className="metric-val">{activeRecipe.difficulty}</span>
                            <span className="metric-lbl">Difficulty</span>
                          </div>
                        </div>
                        <div className="metric-box">
                          <Flame size={18} className="metric-icon flame" />
                          <div>
                            <span className="metric-val">
                              {activeRecipe.nutrition?.calories || 360} kcal
                            </span>
                            <span className="metric-lbl">Calories</span>
                          </div>
                        </div>
                      </div>

                      {/* Nutrition Bar */}
                      {activeRecipe.nutrition && (
                        <div className="view-nutrition-card">
                          <div className="nutrition-pill">
                            <span>Protein</span>
                            <strong>{activeRecipe.nutrition.protein}g</strong>
                          </div>
                          <div className="nutrition-pill">
                            <span>Carbs</span>
                            <strong>{activeRecipe.nutrition.carbohydrates}g</strong>
                          </div>
                          <div className="nutrition-pill">
                            <span>Fat</span>
                            <strong>{activeRecipe.nutrition.fat}g</strong>
                          </div>
                          <div className="nutrition-pill">
                            <span>Fiber</span>
                            <strong>{activeRecipe.nutrition.fiber}g</strong>
                          </div>
                          <div className="nutrition-pill">
                            <span>Sugar</span>
                            <strong>{activeRecipe.nutrition.sugar}g</strong>
                          </div>
                          <div className="nutrition-pill">
                            <span>Sodium</span>
                            <strong>{activeRecipe.nutrition.sodium}mg</strong>
                          </div>
                        </div>
                      )}

                      {/* Ingredients List */}
                      <div className="recipe-detail-section">
                        <h4 className="detail-heading">
                          <UtensilsCrossed size={18} />
                          Ingredients
                        </h4>
                        <ul className="ingredients-checklist">
                          {activeRecipe.ingredients.map((ing, i) => (
                            <li key={i} className="ingredient-item">
                              <span className="bullet-point" />
                              <span className="ing-name">
                                {typeof ing === 'string' ? ing : ing.name}
                              </span>
                              {typeof ing === 'object' && ing.quantity && (
                                <span className="ing-qty">{ing.quantity}</span>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Step by Step Instructions */}
                      <div className="recipe-detail-section">
                        <h4 className="detail-heading">
                          <Layers size={18} />
                          Cooking Instructions
                        </h4>
                        <ol className="instructions-step-list">
                          {activeRecipe.instructions.map((step, idx) => (
                            <li key={idx} className="step-item">
                              <span className="step-badge">{idx + 1}</span>
                              <p className="step-text">{step}</p>
                            </li>
                          ))}
                        </ol>
                      </div>

                      {/* Action Buttons Row */}
                      <div className="view-actions-bar">
                        <button
                          className="btn btn-primary"
                          onClick={() => handleSaveRecipe(activeRecipe)}
                          disabled={savingRecipe || !!savedIds[activeRecipe.title]}
                        >
                          <BookmarkPlus size={16} />
                          {savedIds[activeRecipe.title] ? 'Saved to Collection ✓' : 'Save to Recipe Collection'}
                        </button>

                        <button
                          className="btn btn-outline"
                          onClick={() => handleAddAllToShoppingList(activeRecipe)}
                        >
                          <ShoppingCart size={16} />
                          Add Ingredients to Grocery List
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="empty-generator-state">
                <div className="empty-icon-wrap">
                  <ChefHat size={40} />
                </div>
                <h3>Your AI Creations Appear Here</h3>
                <p>
                  Add your fridge ingredients on the left and click "Generate 3 Recipes with AI" to
                  receive step-by-step recipes customized to your preferences.
                </p>
                <div className="suggestion-hint">
                  💡 <strong>Tip:</strong> Try adding staples like pasta, garlic, cheese, and olive oil!
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Generator;

