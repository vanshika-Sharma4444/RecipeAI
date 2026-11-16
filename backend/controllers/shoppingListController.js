import ShoppingList from '../models/ShoppingList.js';

/**
 * Helper to ensure a ShoppingList exists for the user
 */
const getOrCreateList = async (userId) => {
  let list = await ShoppingList.findOne({ user: userId });
  if (!list) {
    list = await ShoppingList.create({ user: userId, items: [] });
  }
  return list;
};

/**
 * @desc    Get user's shopping list
 * @route   GET /api/shopping-list
 * @access  Private
 */
export const getShoppingList = async (req, res, next) => {
  try {
    const list = await getOrCreateList(req.user._id);
    res.status(200).json({
      success: true,
      count: list.items.length,
      items: list.items,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add single item to shopping list
 * @route   POST /api/shopping-list
 * @access  Private
 */
export const addItem = async (req, res, next) => {
  try {
    const { name, quantity, category, recipeTitle } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Item name is required.',
      });
    }

    const list = await getOrCreateList(req.user._id);

    list.items.push({
      name: name.trim(),
      quantity: quantity || '',
      category: category || 'Pantry',
      recipeTitle: recipeTitle || '',
      purchased: false,
    });

    await list.save();

    res.status(201).json({
      success: true,
      message: 'Item added to shopping list!',
      items: list.items,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add multiple ingredients to shopping list (e.g. from recipe)
 * @route   POST /api/shopping-list/bulk
 * @access  Private
 */
export const addBulkItems = async (req, res, next) => {
  try {
    const { ingredients, recipeTitle } = req.body;

    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Ingredients array is required.',
      });
    }

    const list = await getOrCreateList(req.user._id);

    ingredients.forEach((ing) => {
      const name = typeof ing === 'string' ? ing : ing.name;
      const quantity = typeof ing === 'object' ? ing.quantity : '';
      if (name && name.trim()) {
        list.items.push({
          name: name.trim(),
          quantity: quantity || '',
          category: 'Recipe Ingredients',
          recipeTitle: recipeTitle || '',
          purchased: false,
        });
      }
    });

    await list.save();

    res.status(201).json({
      success: true,
      message: `${ingredients.length} ingredients added to shopping list!`,
      items: list.items,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Toggle purchased status of an item
 * @route   PUT /api/shopping-list/:id
 * @access  Private
 */
export const toggleItem = async (req, res, next) => {
  try {
    const list = await getOrCreateList(req.user._id);
    const item = list.items.id(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in shopping list.',
      });
    }

    item.purchased = !item.purchased;
    await list.save();

    res.status(200).json({
      success: true,
      message: `Item marked as ${item.purchased ? 'purchased' : 'pending'}.`,
      item,
      items: list.items,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete item from shopping list
 * @route   DELETE /api/shopping-list/:id
 * @access  Private
 */
export const deleteItem = async (req, res, next) => {
  try {
    const list = await getOrCreateList(req.user._id);
    const item = list.items.id(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in shopping list.',
      });
    }

    item.deleteOne();
    await list.save();

    res.status(200).json({
      success: true,
      message: 'Item removed from shopping list.',
      items: list.items,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Clear all purchased items or entire list
 * @route   DELETE /api/shopping-list
 * @access  Private
 */
export const clearItems = async (req, res, next) => {
  try {
    const { purchasedOnly } = req.query;
    const list = await getOrCreateList(req.user._id);

    if (purchasedOnly === 'true') {
      list.items = list.items.filter((item) => !item.purchased);
    } else {
      list.items = [];
    }

    await list.save();

    res.status(200).json({
      success: true,
      message:
        purchasedOnly === 'true'
          ? 'Completed items cleared from shopping list.'
          : 'Shopping list cleared completely.',
      items: list.items,
    });
  } catch (error) {
    next(error);
  }
};

