import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import ToastContainer from './components/Toast';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import Explore from './pages/Explore';
import Generator from './pages/Generator';
import RecipeDetails from './pages/RecipeDetails';
import Favourites from './pages/Favourites';
import MealPlanner from './pages/MealPlanner';
import ShoppingList from './pages/ShoppingList';
import NutritionAnalyzer from './pages/NutritionAnalyzer';
import Login from './pages/Login';
import Register from './pages/Register';

import './App.css';

export function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          <div className="app-container">
            <ToastContainer />
            <Navbar />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/explore" element={<Explore />} />
                <Route path="/generator" element={<Generator />} />
                <Route path="/recipes/:id" element={<RecipeDetails />} />
                <Route path="/favourites" element={<Favourites />} />
                <Route path="/meal-planner" element={<MealPlanner />} />
                <Route path="/shopping-list" element={<ShoppingList />} />
                <Route path="/nutrition" element={<NutritionAnalyzer />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;

