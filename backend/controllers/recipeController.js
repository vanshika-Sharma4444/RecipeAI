import Recipe from '../models/Recipe.js';

/**
 * @desc    Get all recipes with multi-filter and search
 * @route   GET /api/recipes
 * @access  Public
 */
export const getRecipes = async (req, res, next) => {
  try {
    const { search, category, cookingTime, difficulty, dietaryPreference } = req.query;

    const query = {};

    // Search by title or description
    if (search && search.trim() !== '') {
      query.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
        { 'ingredients.name': { $regex: search.trim(), $options: 'i' } },
      ];
    }

    // Filter by Category
    if (category && category !== 'All') {
      query.category = category;
    }

    // Filter by Difficulty
    if (difficulty && difficulty !== 'All') {
      query.difficulty = difficulty;
    }

    // Filter by Dietary Preference
    if (dietaryPreference && dietaryPreference !== 'All') {
      query.dietaryPreference = dietaryPreference;
    }

    // Filter by Max Cooking Time
    if (cookingTime && !isNaN(Number(cookingTime))) {
      query.cookingTime = { $lte: Number(cookingTime) };
    }

    const recipes = await Recipe.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: recipes.length,
      recipes,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single recipe by ID
 * @route   GET /api/recipes/:id
 * @access  Public
 */
export const getRecipeById = async (req, res, next) => {
  try {
    const recipe = await Recipe.findById(req.params.id).populate('createdBy', 'name email');

    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found with the requested ID.',
      });
    }

    res.status(200).json({
      success: true,
      recipe,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new recipe (custom or save AI generated)
 * @route   POST /api/recipes
 * @access  Private
 */
export const createRecipe = async (req, res, next) => {
  try {
    const {
      title,
      description,
      image,
      ingredients,
      instructions,
      category,
      dietaryPreference,
      cookingTime,
      preparationTime,
      servings,
      difficulty,
      nutrition,
      isAIgenerated,
    } = req.body;

    if (!title || !description || !cookingTime) {
      return res.status(400).json({
        success: false,
        message: 'Recipe title, description, and cooking time are required.',
      });
    }

    const recipe = await Recipe.create({
      title,
      description,
      image: image || undefined,
      ingredients: ingredients || [],
      instructions: instructions || [],
      category: category || 'Dinner',
      dietaryPreference: dietaryPreference || 'Vegetarian',
      cookingTime: Number(cookingTime),
      preparationTime: Number(preparationTime) || 10,
      servings: Number(servings) || 2,
      difficulty: difficulty || 'Easy',
      nutrition: nutrition || {},
      createdBy: req.user ? req.user._id : null,
      isAIgenerated: Boolean(isAIgenerated),
    });

    res.status(201).json({
      success: true,
      message: 'Recipe created successfully!',
      recipe,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update an existing recipe
 * @route   PUT /api/recipes/:id
 * @access  Private
 */
export const updateRecipe = async (req, res, next) => {
  try {
    let recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found.',
      });
    }

    // Check ownership if recipe has a creator
    if (recipe.createdBy && recipe.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to edit this recipe.',
      });
    }

    recipe = await Recipe.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Recipe updated successfully!',
      recipe,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a recipe
 * @route   DELETE /api/recipes/:id
 * @access  Private
 */
export const deleteRecipe = async (req, res, next) => {
  try {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found.',
      });
    }

    if (recipe.createdBy && recipe.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this recipe.',
      });
    }

    await recipe.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Recipe deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

