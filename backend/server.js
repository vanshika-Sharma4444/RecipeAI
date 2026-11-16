import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import Recipe from './models/Recipe.js';
import { sampleRecipes } from './utils/seedData.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import recipeRoutes from './routes/recipeRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import favouriteRoutes from './routes/favouriteRoutes.js';
import mealPlanRoutes from './routes/mealPlanRoutes.js';
import shoppingListRoutes from './routes/shoppingListRoutes.js';
import nutritionRoutes from './routes/nutritionRoutes.js';

import { notFound, errorHandler } from './middleware/errorMiddleware.js';

// Load environment variables
dotenv.config();

const app = express();

// Middlewares
app.use(
  cors({
    origin: '*',
    credentials: true,
  })
);
// Higher body limit to support base64 food photo uploads
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'RecipeAI Backend API',
    time: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/favourites', favouriteRoutes);
app.use('/api/meal-plans', mealPlanRoutes);
app.use('/api/shopping-list', shoppingListRoutes);
app.use('/api/nutrition', nutritionRoutes);

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Seed initial recipes if collection is empty
const seedDatabaseIfEmpty = async () => {
  try {
    const count = await Recipe.countDocuments();
    if (count === 0) {
      console.log('🌱 Recipe collection is empty. Auto-seeding initial recipes...');
      await Recipe.insertMany(sampleRecipes);
      console.log(`✅ Successfully seeded ${sampleRecipes.length} recipes!`);
    }
  } catch (err) {
    console.error('⚠️ Auto-seed warning:', err.message);
  }
};

// Start Server
const startServer = async () => {
  await connectDB();
  await seedDatabaseIfEmpty();

  app.listen(PORT, () => {
    console.log(`🚀 RecipeAI server running in ${process.env.NODE_ENV || 'development'} mode on http://localhost:${PORT}`);
  });
};

startServer();

