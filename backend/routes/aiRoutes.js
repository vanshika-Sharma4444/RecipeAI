import express from 'express';
import { generateRecipes } from '../controllers/aiController.js';
import { optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/generate', optionalAuth, generateRecipes);

export default router;

