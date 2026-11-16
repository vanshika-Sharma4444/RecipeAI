import express from 'express';
import {
  getFavourites,
  addFavourite,
  removeFavourite,
} from '../controllers/favouriteController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // All favourite routes require authentication

router.get('/', getFavourites);
router.post('/:recipeId', addFavourite);
router.delete('/:recipeId', removeFavourite);

export default router;

