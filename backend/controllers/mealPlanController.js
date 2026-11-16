import MealPlan from '../models/MealPlan.js';
import Recipe from '../models/Recipe.js';

/**
 * @desc    Get user's weekly meal plans
 * @route   GET /api/meal-plans
 * @access  Private
 */
export const getMealPlans = async (req, res, next) => {
  try {
    const mealPlans = await MealPlan.find({ user: req.user._id })
      .populate('recipe')
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      count: mealPlans.length,
      mealPlans,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add or replace a meal in the weekly plan
 * @route   POST /api/meal-plans
 * @access  Private
 */
export const createMealPlan = async (req, res, next) => {
  try {
    const { day, mealType, recipeId } = req.body;

    if (!day || !mealType || !recipeId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide day, mealType, and recipeId.',
      });
    }

    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found.',
      });
    }

    // Check if a meal is already assigned to this exact slot; if so, replace it
    let mealPlan = await MealPlan.findOne({
      user: req.user._id,
      day,
      mealType,
    });

    if (mealPlan) {
      mealPlan.recipe = recipeId;
      await mealPlan.save();
    } else {
      mealPlan = await MealPlan.create({
        user: req.user._id,
        day,
        mealType,
        recipe: recipeId,
      });
    }

    const populated = await MealPlan.findById(mealPlan._id).populate('recipe');

    res.status(201).json({
      success: true,
      message: `Recipe planned for ${day} ${mealType}!`,
      mealPlan: populated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Remove a meal from the weekly plan
 * @route   DELETE /api/meal-plans/:id
 * @access  Private
 */
export const deleteMealPlan = async (req, res, next) => {
  try {
    const mealPlan = await MealPlan.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!mealPlan) {
      return res.status(404).json({
        success: false,
        message: 'Meal plan item not found or unauthorized.',
      });
    }

    await mealPlan.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Meal plan item removed successfully.',
    });
  } catch (error) {
    next(error);
  }
};

