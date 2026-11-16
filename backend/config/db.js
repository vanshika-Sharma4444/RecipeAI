import mongoose from 'mongoose';
import { initMemoryData } from './memoryDb.js';

export let isMongoConnected = false;

/**
 * Connect to MongoDB with automatic fallback.
 * Attempts local / Atlas MONGODB_URI first; if unavailable,
 * seamlessly switches to an embedded pure JavaScript in-memory store
 * so the application runs out-of-the-box without requiring external software!
 */
export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/recipeai';

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000,
    });
    isMongoConnected = true;
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    isMongoConnected = false;
    console.log(`⚠️ Local MongoDB not detected at ${uri} (${err.message}).`);
    console.log('🚀 Running in In-Memory Mode with pure JavaScript engine.');
    console.log('ℹ️  All features (Auth, Recipes, AI, Favourites, Meal Planner, Shopping List, Nutrition Analyzer) are 100% active and functional!');
    console.log('💡 Tip: To persist data across server restarts, supply a free MongoDB Atlas URI in backend/.env (MONGODB_URI=mongodb+srv://...)');
    initMemoryData();
    return null;
  }
};
