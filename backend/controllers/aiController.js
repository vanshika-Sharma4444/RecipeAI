import { generateRecipesWithAI } from '../utils/geminiClient.js';

/**
 * @desc    Generate recipes using AI (Gemini) or graceful demo mode
 * @route   POST /api/ai/generate
 * @access  Public (or Private)
 */
export const generateRecipes = async (req, res, next) => {
  try {
    const {
      ingredients,
      mealType,
      dietaryPreference,
      cookingTime,
      difficulty,
      instructions,
    } = req.body;

    let parsedIngredients = [];
    if (Array.isArray(ingredients)) {
      parsedIngredients = ingredients;
    } else if (typeof ingredients === 'string') {
      parsedIngredients = ingredients
        .split(',')
        .map((i) => i.trim())
        .filter(Boolean);
    }

    if (parsedIngredients.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least one ingredient to generate recipes.',
      });
    }

    const { recipes, isDemoMode } = await generateRecipesWithAI({
      ingredients: parsedIngredients,
      mealType: mealType || 'Dinner',
      dietaryPreference: dietaryPreference || 'Vegetarian',
      cookingTime: Number(cookingTime) || 30,
      difficulty: difficulty || 'Easy',
      instructions: instructions || '',
    });

    res.status(200).json({
      success: true,
      count: recipes.length,
      isDemoMode,
      message: isDemoMode
        ? 'Demo Mode: Live AI generation requires a valid GEMINI_API_KEY in backend/.env. Displaying crafted demo recipes.'
        : '3 AI recipe suggestions generated successfully!',
      recipes,
    });
  } catch (error) {
    next(error);
  }
};

