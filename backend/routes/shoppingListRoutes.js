import express from 'express';
import {
  getShoppingList,
  addItem,
  addBulkItems,
  toggleItem,
  deleteItem,
  clearItems,
} from '../controllers/shoppingListController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // All shopping-list routes require authentication

router.route('/')
  .get(getShoppingList)
  .post(addItem)
  .delete(clearItems);

router.post('/bulk', addBulkItems);

router.route('/:id')
  .put(toggleItem)
  .delete(deleteItem);

export default router;

