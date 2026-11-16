import express from 'express';
import {
  getMealPlans,
  createMealPlan,
  deleteMealPlan,
} from '../controllers/mealPlanController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // All meal-planner routes require authentication

router.route('/')
  .get(getMealPlans)
  .post(createMealPlan);

router.delete('/:id', deleteMealPlan);

export default router;

