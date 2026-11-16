import User from '../models/User.js';
import Recipe from '../models/Recipe.js';

/**
 * @desc    Get current user's saved favourite recipes
 * @route   GET /api/favourites
 * @access  Private
 */
export const getFavourites = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('favourites');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    res.status(200).json({
      success: true,
      count: user.favourites.length,
      favourites: user.favourites,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add a recipe to user favourites
 * @route   POST /api/favourites/:recipeId
 * @access  Private
 */
export const addFavourite = async (req, res, next) => {
  try {
    const { recipeId } = req.params;

    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found.',
      });
    }

    const user = await User.findById(req.user._id);

    // Check if already favourited
    const isAlreadyFav = user.favourites.some(
      (id) => id.toString() === recipeId.toString()
    );

    if (isAlreadyFav) {
      return res.status(400).json({
        success: false,
        message: 'This recipe is already in your favourites.',
      });
    }

    user.favourites.push(recipeId);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Recipe added to your favourites!',
      favourites: user.favourites,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Remove a recipe from user favourites
 * @route   DELETE /api/favourites/:recipeId
 * @access  Private
 */
export const removeFavourite = async (req, res, next) => {
  try {
    const { recipeId } = req.params;

    const user = await User.findById(req.user._id);

    user.favourites = user.favourites.filter(
      (id) => id.toString() !== recipeId.toString()
    );

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Recipe removed from your favourites.',
      favourites: user.favourites,
    });
  } catch (error) {
    next(error);
  }
};

