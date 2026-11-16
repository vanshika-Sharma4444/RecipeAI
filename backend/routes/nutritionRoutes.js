import express from 'express';
import {
  analyzeNutrition,
  compareNutrition,
  getNutritionLogs,
  createNutritionLog,
  deleteNutritionLog,
  getDailySummary,
} from '../controllers/nutritionController.js';
import { protect, optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public analysis and comparison routes (optional authentication for logging)
router.post('/analyze', optionalAuth, analyzeNutrition);
router.post('/compare', optionalAuth, compareNutrition);

// Protected daily food diary & summary routes
router.use('/logs', protect);
router.route('/logs')
  .get(getNutritionLogs)
  .post(createNutritionLog);
router.delete('/logs/:id', protect, deleteNutritionLog);

router.get('/summary', protect, getDailySummary);

export default router;

