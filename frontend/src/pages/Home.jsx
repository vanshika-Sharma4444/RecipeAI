import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  Clock,
  Flame,
  ChefHat,
  ShieldCheck,
  ShoppingBag,
  Activity,
  Heart,
  Search,
  CheckCircle2,
  UtensilsCrossed,
} from 'lucide-react';
import api from '../services/api';
import RecipeCard from '../components/RecipeCard';
import { RecipeGridSkeleton } from '../components/SkeletonLoader';
import './Home.css';

const categories = [
  { name: 'Breakfast', icon: '🍳', count: '120+ Recipes', img: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=600&q=80' },
  { name: 'Lunch', icon: '🥗', count: '180+ Recipes', img: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80' },
  { name: 'Dinner', icon: '🍲', count: '250+ Recipes', img: 'https://images.unsplash.com/photo-1567608285969-48e4bbe0d399?auto=format&fit=crop&w=900&q=80' },
  { name: 'Snacks', icon: '🥨', count: '90+ Recipes', img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80' },
  { name: 'Desserts', icon: '🍰', count: '110+ Recipes', img: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80' },
];

export const Home = () => {
  const [featuredRecipes, setFeaturedRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quickIngredient, setQuickIngredient] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await api.get('/recipes');
        if (res.data.success) {
          // Take top 6 recipes
          setFeaturedRecipes(res.data.recipes.slice(0, 6));
        }
      } catch (err) {
        console.error('Failed to load featured recipes:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  const handleQuickGenerate = (e) => {
    e.preventDefault();
    if (quickIngredient.trim()) {
      navigate(`/generator?ingredients=${encodeURIComponent(quickIngredient.trim())}`);
    } else {
      navigate('/generator');
    }
  };

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container hero-container">
          <div className="hero-content">
            <div className="hero-badge">
              <Sparkles size={16} />
              <span>Powered by Gemini AI & Nutrient Intelligence</span>
            </div>

            <h1 className="hero-title">
              Discover What You <br />
              <span className="hero-highlight">Can Cook Today</span>
            </h1>

            <p className="hero-description">
              Stop wondering what to make for dinner. Simply tell RecipeAI what ingredients
              you have in your kitchen, and watch our AI chef instantly generate personalized,
              mouth-watering recipes with full nutritional breakdowns.
            </p>

            {/* Quick Ingredient Search Box */}
            <form className="hero-input-card" onSubmit={handleQuickGenerate}>
              <div className="hero-input-wrap">
                <UtensilsCrossed size={20} className="input-icon" />
                <input
                  type="text"
                  placeholder="e.g. avocado, eggs, sourdough, tomato..."
                  value={quickIngredient}
                  onChange={(e) => setQuickIngredient(e.target.value)}
                  className="hero-input"
                />
              </div>
              <button type="submit" className="btn btn-accent btn-lg hero-btn">
                <Sparkles size={18} />
                Generate Recipe
              </button>
            </form>

            <div className="hero-perks">
              <div className="perk-item">
                <CheckCircle2 size={16} className="perk-icon" />
                <span>Zero food waste</span>
              </div>
              <div className="perk-item">
                <CheckCircle2 size={16} className="perk-icon" />
                <span>Instant nutritional analysis</span>
              </div>
              <div className="perk-item">
                <CheckCircle2 size={16} className="perk-icon" />
                <span>Custom dietary filters</span>
              </div>
            </div>
          </div>

          <div className="hero-media">
            <div className="hero-card-stack">
              <img
                src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80"
                alt="Delicious healthy bowl"
                className="hero-image"
              />
              <div className="floating-badge badge-top">
                <Flame size={18} className="flame-icon" />
                <div>
                  <strong>3 AI Suggestions</strong>
                  <span>Ready in under 20 mins</span>
                </div>
              </div>
              <div className="floating-badge badge-bottom">
                <Activity size={18} className="activity-icon" />
                <div>
                  <strong>Health Score: 94/100</strong>
                  <span>High Fiber • Lean Protein</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Categories Section */}
      <section className="categories-section">
        <div className="container">
          <div className="section-header">
            <span className="sub-tag">Explore By Meal</span>
            <h2>Popular Categories</h2>
            <p>From energetic breakfasts to wholesome dinners, find the perfect meal for every time of day.</p>
          </div>

          <div className="categories-grid">
            {categories.map((cat) => (
              <Link
                to={`/explore?category=${cat.name}`}
                key={cat.name}
                className="category-card"
              >
                <div className="cat-img-wrap">
                  <img src={cat.img} alt={cat.name} className="cat-img" />
                  <div className="cat-icon-badge">{cat.icon}</div>
                </div>
                <div className="cat-info">
                  <h3 className="cat-title">{cat.name}</h3>
                  <span className="cat-count">{cat.count}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Recipes Section */}
      <section className="featured-section">
        <div className="container">
          <div className="featured-header-row">
            <div>
              <span className="sub-tag">Chef's Picks</span>
              <h2>Featured Recipes</h2>
              <p>Hand-crafted, tested, and loved by our home cooking community.</p>
            </div>
            <Link to="/explore" className="btn btn-outline view-all-btn">
              View All Recipes
              <ArrowRight size={16} />
            </Link>
          </div>

          {loading ? (
            <RecipeGridSkeleton count={6} />
          ) : (
            <div className="recipe-grid">
              {featuredRecipes.map((recipe) => (
                <RecipeCard key={recipe._id} recipe={recipe} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section">
        <div className="container">
          <div className="section-header">
            <span className="sub-tag">Effortless Cooking</span>
            <h2>How RecipeAI Works</h2>
            <p>Three straightforward steps to transform raw ingredients into restaurant-quality meals.</p>
          </div>

          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">01</div>
              <div className="step-icon-wrap">
                <UtensilsCrossed size={28} />
              </div>
              <h3 className="step-title">Enter Available Ingredients</h3>
              <p className="step-desc">
                Type what you currently have in your fridge or pantry. Set dietary preferences like
                Vegetarian, Vegan, or Non-Veg.
              </p>
            </div>

            <div className="step-card step-card-featured">
              <div className="step-number">02</div>
              <div className="step-icon-wrap step-icon-accent">
                <Sparkles size={28} />
              </div>
              <h3 className="step-title">AI Generates 3 Curated Recipes</h3>
              <p className="step-desc">
                Our Gemini AI engine crafts 3 distinct step-by-step recipes complete with precise quantities,
                cooking times, and nutritional estimates.
              </p>
            </div>

            <div className="step-card">
              <div className="step-number">03</div>
              <div className="step-icon-wrap">
                <Activity size={28} />
              </div>
              <h3 className="step-title">Plan, Cook & Analyze</h3>
              <p className="step-desc">
                Save dishes to your weekly planner, add missing items to your shopping list,
                or analyze detailed calorie and macronutrient health scores.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Nutrition Analyzer Banner Feature */}
      <section className="nutrition-feature-section">
        <div className="container">
          <div className="nutrition-feature-banner">
            <div className="nutrition-feature-text">
              <span className="badge badge-accent">NEW FEATURE MODULE</span>
              <h2>AI Nutrition & Food Health Analyzer</h2>
              <p>
                Upload a food photo or enter any dish ingredients to receive instant macronutrient
                breakdowns (calories, protein, fats, sugar, sodium), a calibrated Health Score (0-100),
                and personalized healthier substitution recommendations.
              </p>
              <div className="feature-checklist">
                <div className="feature-check-item">
                  <CheckCircle2 size={18} />
                  <span>Gemini Vision Food Image Recognition</span>
                </div>
                <div className="feature-check-item">
                  <CheckCircle2 size={18} />
                  <span>Objective Health Score & Explanations</span>
                </div>
                <div className="feature-check-item">
                  <CheckCircle2 size={18} />
                  <span>Side-by-Side Food Comparison Tool</span>
                </div>
                <div className="feature-check-item">
                  <CheckCircle2 size={18} />
                  <span>Daily Food Diary with RDA Progress Tracking</span>
                </div>
              </div>
              <Link to="/nutrition" className="btn btn-primary btn-lg">
                <Activity size={18} />
                Try Nutrition Analyzer Now
              </Link>
            </div>
            <div className="nutrition-feature-visual">
              <div className="health-score-preview-card">
                <div className="preview-score-circle">
                  <span className="score-num">88</span>
                  <span className="score-label">Health Score</span>
                </div>
                <div className="preview-macros">
                  <div className="macro-row">
                    <span>Protein</span>
                    <strong>28g</strong>
                  </div>
                  <div className="macro-bar"><div className="bar-fill" style={{ width: '85%' }} /></div>
                  <div className="macro-row">
                    <span>Fiber</span>
                    <strong>8.5g</strong>
                  </div>
                  <div className="macro-bar"><div className="bar-fill fill-green" style={{ width: '70%' }} /></div>
                  <div className="macro-row">
                    <span>Added Sugar</span>
                    <strong>2.0g (Low)</strong>
                  </div>
                  <div className="macro-bar"><div className="bar-fill fill-accent" style={{ width: '20%' }} /></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="benefits-section">
        <div className="container">
          <div className="section-header">
            <span className="sub-tag">Why Choose RecipeAI</span>
            <h2>Designed for Healthier, Smarter Living</h2>
            <p>Built with modern technology to make home cooking joyful, affordable, and stress-free.</p>
          </div>

          <div className="benefits-grid">
            <div className="benefit-item">
              <div className="benefit-icon">🌿</div>
              <h3>Reduce Food Waste</h3>
              <p>Turn miscellaneous pantry items and leftover vegetables into gourmet meals instead of discarding them.</p>
            </div>
            <div className="benefit-item">
              <div className="benefit-icon">⚡</div>
              <h3>Save Time & Energy</h3>
              <p>No more scrolling through endless recipe blogs. Get direct, structured instructions in seconds.</p>
            </div>
            <div className="benefit-item">
              <div className="benefit-icon">🥗</div>
              <h3>Eat Healthier</h3>
              <p>Transparent nutritional breakdowns ensure you know exactly what nutrients fuel your body.</p>
            </div>
            <div className="benefit-item">
              <div className="benefit-icon">📅</div>
              <h3>Weekly Organization</h3>
              <p>Plan your whole week of breakfasts, lunches, and dinners, and generate organized grocery lists.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-card">
            <h2>Ready to Transform Your Cooking?</h2>
            <p>Join thousands of home cooks and food lovers creating culinary magic with RecipeAI.</p>
            <div className="cta-actions">
              <Link to="/generator" className="btn btn-accent btn-lg">
                <Sparkles size={18} />
                Generate Recipes Free
              </Link>
              <Link to="/explore" className="btn btn-outline btn-lg cta-btn-outline">
                Browse Recipes
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

