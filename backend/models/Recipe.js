import mongoose from 'mongoose';
import { isMongoConnected } from '../config/db.js';
import { MemoryRecipe } from '../config/memoryDb.js';

const ingredientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    quantity: { type: String, default: '' },
  },
  { _id: false }
);

const nutritionSchema = new mongoose.Schema(
  {
    calories: { type: Number, default: 0 },
    protein: { type: Number, default: 0 },
    carbohydrates: { type: Number, default: 0 },
    fat: { type: Number, default: 0 },
    saturatedFat: { type: Number, default: 0 },
    sugar: { type: Number, default: 0 },
    fiber: { type: Number, default: 0 },
    sodium: { type: Number, default: 0 },
  },
  { _id: false }
);

const recipeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Recipe title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Recipe description is required'],
      trim: true,
    },
    image: {
      type: String,
      default: 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=800&q=80',
    },
    ingredients: [ingredientSchema],
    instructions: [{ type: String, required: true }],
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Desserts'],
      default: 'Dinner',
    },
    dietaryPreference: {
      type: String,
      enum: ['Vegetarian', 'Vegan', 'Non-Vegetarian'],
      default: 'Vegetarian',
    },
    cookingTime: {
      type: Number,
      required: [true, 'Cooking time is required'],
      min: 1,
    },
    preparationTime: {
      type: Number,
      default: 15,
      min: 0,
    },
    servings: {
      type: Number,
      default: 2,
      min: 1,
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      default: 'Easy',
    },
    nutrition: {
      type: nutritionSchema,
      default: () => ({}),
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    isAIgenerated: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

recipeSchema.index({ title: 'text', description: 'text' });

const MongooseRecipe = mongoose.model('Recipe', recipeSchema);

// Proxy to seamlessly support both Real MongoDB and In-Memory mode
const Recipe = new Proxy(MongooseRecipe, {
  get(target, prop) {
    if (!isMongoConnected) {
      return MemoryRecipe[prop];
    }
    return target[prop];
  },
});

export default Recipe;
