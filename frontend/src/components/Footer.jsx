import React from 'react';
import { Link } from 'react-router-dom';
import { ChefHat, Heart, Sparkles, Activity, ShieldCheck, Github } from 'lucide-react';
import './Footer.css';

export const Footer = () => {
  return (
    <footer className="footer-wrap">
      <div className="container footer-container">
        <div className="footer-top">
          {/* Brand Info */}
          <div className="footer-col footer-brand-col">
            <Link to="/" className="footer-brand">
              <div className="brand-icon-wrap">
                <ChefHat size={22} />
              </div>
              <span className="brand-title">Recipe<span className="brand-ai">AI</span></span>
            </Link>
            <p className="footer-tagline">
              Your intelligent culinary companion. Transform pantry ingredients into chef-crafted
              delicacies and analyze food health with AI precision.
            </p>
            <div className="tech-stack-badge">
              <span>MERN Stack + Gemini AI</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-col">
            <h4 className="footer-heading">Platform</h4>
            <ul className="footer-links">
              <li><Link to="/explore">Explore Recipes</Link></li>
              <li><Link to="/generator">AI Recipe Generator</Link></li>
              <li><Link to="/nutrition">Nutrition & Health Analyzer</Link></li>
              <li><Link to="/meal-planner">Weekly Meal Planner</Link></li>
              <li><Link to="/shopping-list">Smart Grocery List</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div className="footer-col">
            <h4 className="footer-heading">Categories</h4>
            <ul className="footer-links">
              <li><Link to="/explore?category=Breakfast">Breakfast Specials</Link></li>
              <li><Link to="/explore?category=Lunch">Nutrient-Rich Lunches</Link></li>
              <li><Link to="/explore?category=Dinner">Gourmet Dinners</Link></li>
              <li><Link to="/explore?category=Snacks">Crispy & Healthy Snacks</Link></li>
              <li><Link to="/explore?category=Desserts">Decadent Desserts</Link></li>
            </ul>
          </div>

          {/* Health & Safety Disclaimer */}
          <div className="footer-col footer-disclaimer-col">
            <h4 className="footer-heading">
              <ShieldCheck size={18} />
              Health & Safety
            </h4>
            <p className="footer-disclaimer">
              Nutritional values and AI analyses provided are estimates for dietary awareness and
              culinary inspiration. They do not constitute medical advice or clinical dietary prescriptions.
            </p>
            <div className="security-note">
              <span>🔒 Secure Backend AI Proxy • Zero Key Exposure</span>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="copyright-text">
            &copy; {new Date().getFullYear()} <strong>RecipeAI</strong>. Built with passion for final-year Computer Science engineering.
          </p>
          <div className="footer-badges">
            <span className="footer-pill">
              <Sparkles size={13} /> Gemini 2.5 AI
            </span>
            <span className="footer-pill">
              <Activity size={13} /> RDA Health Score
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

