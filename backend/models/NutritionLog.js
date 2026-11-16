import mongoose from 'mongoose';
import { isMongoConnected } from '../config/db.js';
import { MemoryNutritionLog } from '../config/memoryDb.js';

const nutritionLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    foodName: {
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
      type: String,
      default: '1 serving',
      trim: true,
    },
    servingSize: {
      type: String,
      default: 'Standard portion',
      trim: true,
    },
    mealType: {
      type: String,
      required: true,
      enum: ['Breakfast', 'Lunch', 'Dinner', 'Snacks'],
      default: 'Lunch',
    },
    calories: { type: Number, default: 0 },
    protein: { type: Number, default: 0 },
    carbohydrates: { type: Number, default: 0 },
    fat: { type: Number, default: 0 },
    saturatedFat: { type: Number, default: 0 },
    sugar: { type: Number, default: 0 },
    fiber: { type: Number, default: 0 },
    sodium: { type: Number, default: 0 },
    healthScore: {
      type: Number,
      default: 75,
      min: 0,
      max: 100,
    },
    analysisDate: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

const MongooseNutritionLog = mongoose.model('NutritionLog', nutritionLogSchema);

const NutritionLog = new Proxy(MongooseNutritionLog, {
  get(target, prop) {
    if (!isMongoConnected) {
      return MemoryNutritionLog[prop];
    }
    return target[prop];
  },
});

export default NutritionLog;
