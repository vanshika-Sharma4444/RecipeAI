import NutritionLog from '../models/NutritionLog.js';
import { analyzeFoodWithAI } from '../utils/geminiClient.js';
import { calculateHealthScore } from '../utils/nutritionCalculator.js';

/**
 * @desc    Analyze food nutritional profile, health score, and healthier alternatives
 * @route   POST /api/nutrition/analyze
 * @access  Public (or Private)
 */
export const analyzeNutrition = async (req, res, next) => {
  try {
    const { foodName, ingredients, servingSize, imageBase64, mimeType } = req.body;

    if (!foodName && !imageBase64) {
      return res.status(400).json({
        success: false,
        message: 'Please provide either a dish name / ingredients or upload a food image.',
      });
    }

    const result = await analyzeFoodWithAI({
      foodName: foodName || '',
      ingredients: ingredients || '',
      servingSize: servingSize || '1 standard serving',
      imageBase64: imageBase64 || null,
      mimeType: mimeType || 'image/jpeg',
    });

    res.status(200).json({
      success: true,
      analysis: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Compare two food items side-by-side
 * @route   POST /api/nutrition/compare
 * @access  Public
 */
export const compareNutrition = async (req, res, next) => {
  try {
    const { food1, food2 } = req.body;

    if (!food1?.name || !food2?.name) {
      return res.status(400).json({
        success: false,
        message: 'Please provide names for both food items to compare.',
      });
    }

    const [item1, item2] = await Promise.all([
      analyzeFoodWithAI({
        foodName: food1.name,
        ingredients: food1.ingredients || '',
        servingSize: food1.servingSize || '1 serving',
      }),
      analyzeFoodWithAI({
        foodName: food2.name,
        ingredients: food2.ingredients || '',
        servingSize: food2.servingSize || '1 serving',
      }),
    ]);

    // Calculate delta differences (item1 vs item2)
    const differences = {
      caloriesDiff: item1.nutrition.calories - item2.nutrition.calories,
      proteinDiff: (item1.nutrition.protein - item2.nutrition.protein).toFixed(1),
      carbsDiff: (item1.nutrition.carbohydrates - item2.nutrition.carbohydrates).toFixed(1),
      fatDiff: (item1.nutrition.fat - item2.nutrition.fat).toFixed(1),
      sugarDiff: (item1.nutrition.sugar - item2.nutrition.sugar).toFixed(1),
      fiberDiff: (item1.nutrition.fiber - item2.nutrition.fiber).toFixed(1),
      sodiumDiff: item1.nutrition.sodium - item2.nutrition.sodium,
      healthScoreDiff: item1.healthScore - item2.healthScore,
    };

    res.status(200).json({
      success: true,
      comparison: {
        item1,
        item2,
        differences,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user's daily food logs (diary)
 * @route   GET /api/nutrition/logs
 * @access  Private
 */
export const getNutritionLogs = async (req, res, next) => {
  try {
    const { date } = req.query;

    const query = { user: req.user._id };

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      query.analysisDate = { $gte: startOfDay, $lte: endOfDay };
    }

    const logs = await NutritionLog.find(query).sort({ analysisDate: -1 });

    res.status(200).json({
      success: true,
      count: logs.length,
      logs,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add a meal entry to the daily food diary
 * @route   POST /api/nutrition/logs
 * @access  Private
 */
export const createNutritionLog = async (req, res, next) => {
  try {
    const {
      foodName,
      quantity,
      servingSize,
      mealType,
      calories,
      protein,
      carbohydrates,
      fat,
      saturatedFat,
      sugar,
      fiber,
      sodium,
    } = req.body;

    if (!foodName || !mealType) {
      return res.status(400).json({
        success: false,
        message: 'Food name and meal type (Breakfast, Lunch, Dinner, Snacks) are required.',
      });
    }

    const nutritionData = {
      calories: Number(calories) || 0,
      protein: Number(protein) || 0,
      carbohydrates: Number(carbohydrates) || 0,
      fat: Number(fat) || 0,
      saturatedFat: Number(saturatedFat) || 0,
      sugar: Number(sugar) || 0,
      fiber: Number(fiber) || 0,
      sodium: Number(sodium) || 0,
    };

    const healthScoreResult = calculateHealthScore(nutritionData, 1);

    const log = await NutritionLog.create({
      user: req.user._id,
      foodName,
      quantity: quantity || '1 serving',
      servingSize: servingSize || '1 portion',
      mealType,
      ...nutritionData,
      healthScore: healthScoreResult.score,
    });

    res.status(201).json({
      success: true,
      message: 'Meal successfully logged to your daily nutrition diary!',
      log,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a food entry from the diary
 * @route   DELETE /api/nutrition/logs/:id
 * @access  Private
 */
export const deleteNutritionLog = async (req, res, next) => {
  try {
    const log = await NutritionLog.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!log) {
      return res.status(404).json({
        success: false,
        message: 'Nutrition log entry not found or unauthorized.',
      });
    }

    await log.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Meal log removed successfully.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get daily nutrition summary and RDA progress
 * @route   GET /api/nutrition/summary
 * @access  Private
 */
export const getDailySummary = async (req, res, next) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const logs = await NutritionLog.find({
      user: req.user._id,
      analysisDate: { $gte: todayStart, $lte: todayEnd },
    });

    // Recommended Daily Allowance standard targets
    const targets = {
      calories: 2000,
      protein: 60, // grams
      carbohydrates: 250, // grams
      fat: 65, // grams
      sugar: 30, // grams max
      fiber: 28, // grams
      sodium: 2300, // mg max
    };

    const totals = logs.reduce(
      (acc, curr) => ({
        calories: acc.calories + (curr.calories || 0),
        protein: acc.protein + (curr.protein || 0),
        carbohydrates: acc.carbohydrates + (curr.carbohydrates || 0),
        fat: acc.fat + (curr.fat || 0),
        saturatedFat: acc.saturatedFat + (curr.saturatedFat || 0),
        sugar: acc.sugar + (curr.sugar || 0),
        fiber: acc.fiber + (curr.fiber || 0),
        sodium: acc.sodium + (curr.sodium || 0),
      }),
      {
        calories: 0,
        protein: 0,
        carbohydrates: 0,
        fat: 0,
        saturatedFat: 0,
        sugar: 0,
        fiber: 0,
        sodium: 0,
      }
    );

    // Round values
    Object.keys(totals).forEach((k) => {
      totals[k] = Math.round(totals[k] * 10) / 10;
    });

    // Calculate percentage of target achieved
    const percentages = {
      calories: Math.min(100, Math.round((totals.calories / targets.calories) * 100)),
      protein: Math.min(100, Math.round((totals.protein / targets.protein) * 100)),
      carbohydrates: Math.min(100, Math.round((totals.carbohydrates / targets.carbohydrates) * 100)),
      fat: Math.min(100, Math.round((totals.fat / targets.fat) * 100)),
      sugar: Math.min(100, Math.round((totals.sugar / targets.sugar) * 100)),
      fiber: Math.min(100, Math.round((totals.fiber / targets.fiber) * 100)),
      sodium: Math.min(100, Math.round((totals.sodium / targets.sodium) * 100)),
    };

    res.status(200).json({
      success: true,
      totals,
      targets,
      percentages,
      logsCount: logs.length,
    });
  } catch (error) {
    next(error);
  }
};

