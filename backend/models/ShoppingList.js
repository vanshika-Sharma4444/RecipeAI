import mongoose from 'mongoose';
import { isMongoConnected } from '../config/db.js';
import { MemoryShoppingList } from '../config/memoryDb.js';

const shoppingItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
      type: String,
      default: '',
      trim: true,
    },
    category: {
      type: String,
      default: 'Produce',
      trim: true,
    },
    purchased: {
      type: Boolean,
      default: false,
    },
    recipeTitle: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

const shoppingListSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    items: [shoppingItemSchema],
  },
  {
    timestamps: true,
  }
);

const MongooseShoppingList = mongoose.model('ShoppingList', shoppingListSchema);

const ShoppingList = new Proxy(MongooseShoppingList, {
  get(target, prop) {
    if (!isMongoConnected) {
      return MemoryShoppingList[prop];
    }
    return target[prop];
  },
});

export default ShoppingList;
