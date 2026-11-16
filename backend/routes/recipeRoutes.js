import express from 'express';
import {
  getRecipes,
  getRecipeById,
  createRecipe,
  updateRecipe,
  deleteRecipe,
} from '../controllers/recipeController.js';
import { protect, optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(optionalAuth, getRecipes)
  .post(protect, createRecipe);

router.route('/:id')
  .get(optionalAuth, getRecipeById)
  .put(protect, updateRecipe)
  .delete(protect, deleteRecipe);

export default router;

