import mongoose from 'mongoose';
import { isMongoConnected } from '../config/db.js';
import { MemoryMealPlan } from '../config/memoryDb.js';

const mealPlanSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    day: {
      type: String,
      required: true,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    },
    mealType: {
      type: String,
      required: true,
      enum: ['Breakfast', 'Lunch', 'Dinner'],
    },
    recipe: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Recipe',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

mealPlanSchema.index({ user: 1, day: 1, mealType: 1, recipe: 1 }, { unique: true });

const MongooseMealPlan = mongoose.model('MealPlan', mealPlanSchema);

const MealPlan = new Proxy(MongooseMealPlan, {
  get(target, prop) {
    if (!isMongoConnected) {
      return MemoryMealPlan[prop];
    }
    return target[prop];
  },
});

export default MealPlan;
