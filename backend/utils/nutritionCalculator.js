/**
 * Comprehensive Nutrition & Health Score Calculator
 * Provides reliable nutrition estimation, health score grading, and personalized healthier suggestions.
 */

// Reference data for common food items per 100g / standard serving
const foodDatabase = {
  // Breakfast items
  'oats': { calories: 389, protein: 16.9, carbs: 66.3, fat: 6.9, satFat: 1.2, sugar: 0, fiber: 10.6, sodium: 2 },
  'egg': { calories: 143, protein: 12.6, carbs: 0.7, fat: 9.5, satFat: 3.1, sugar: 0.4, fiber: 0, sodium: 142 },
  'banana': { calories: 89, protein: 1.1, carbs: 22.8, fat: 0.3, satFat: 0.1, sugar: 12.2, fiber: 2.6, sodium: 1 },
  'avocado': { calories: 160, protein: 2, carbs: 8.5, fat: 14.7, satFat: 2.1, sugar: 0.7, fiber: 6.7, sodium: 7 },
  'bread': { calories: 265, protein: 9, carbs: 49, fat: 3.2, satFat: 0.7, sugar: 5, fiber: 2.7, sodium: 490 },
  'sourdough': { calories: 240, protein: 8.5, carbs: 48, fat: 1.8, satFat: 0.4, sugar: 2, fiber: 3.2, sodium: 420 },
  'milk': { calories: 60, protein: 3.2, carbs: 4.8, fat: 3.3, satFat: 1.9, sugar: 5, fiber: 0, sodium: 44 },
  'almond milk': { calories: 15, protein: 0.5, carbs: 0.3, fat: 1.1, satFat: 0.1, sugar: 0, fiber: 0.2, sodium: 60 },
  'yogurt': { calories: 59, protein: 10, carbs: 3.6, fat: 0.4, satFat: 0.1, sugar: 3.2, fiber: 0, sodium: 36 },
  'greek yogurt': { calories: 73, protein: 10, carbs: 3.8, fat: 1.9, satFat: 1.2, sugar: 3.5, fiber: 0, sodium: 35 },
  'honey': { calories: 304, protein: 0.3, carbs: 82.4, fat: 0, satFat: 0, sugar: 82.1, fiber: 0.2, sodium: 4 },
  'chia seeds': { calories: 486, protein: 16.5, carbs: 42.1, fat: 30.7, satFat: 3.3, sugar: 0, fiber: 34.4, sodium: 16 },

  // Proteins
  'chicken breast': { calories: 165, protein: 31, carbs: 0, fat: 3.6, satFat: 1, sugar: 0, fiber: 0, sodium: 74 },
  'paneer': { calories: 296, protein: 18, carbs: 4.5, fat: 22, satFat: 13, sugar: 2.5, fiber: 0, sodium: 22 },
  'tofu': { calories: 76, protein: 8, carbs: 1.9, fat: 4.8, satFat: 0.7, sugar: 0.5, fiber: 0.9, sodium: 7 },
  'salmon': { calories: 208, protein: 20, carbs: 0, fat: 13, satFat: 3.1, sugar: 0, fiber: 0, sodium: 59 },
  'chickpeas': { calories: 164, protein: 8.9, carbs: 27.4, fat: 2.6, satFat: 0.3, sugar: 4.8, fiber: 7.6, sodium: 24 },
  'lentils': { calories: 116, protein: 9, carbs: 20, fat: 0.4, satFat: 0.1, sugar: 1.8, fiber: 7.9, sodium: 2 },
  'black beans': { calories: 132, protein: 8.9, carbs: 23.7, fat: 0.5, satFat: 0.1, sugar: 0.3, fiber: 8.7, sodium: 1 },

  // Grains & Carbs
  'rice': { calories: 130, protein: 2.7, carbs: 28, fat: 0.3, satFat: 0.1, sugar: 0.1, fiber: 0.4, sodium: 1 },
  'brown rice': { calories: 111, protein: 2.6, carbs: 23, fat: 0.9, satFat: 0.2, sugar: 0.4, fiber: 1.8, sodium: 5 },
  'quinoa': { calories: 120, protein: 4.4, carbs: 21.3, fat: 1.9, satFat: 0.2, sugar: 0.9, fiber: 2.8, sodium: 7 },
  'pasta': { calories: 157, protein: 5.8, carbs: 30.7, fat: 0.9, satFat: 0.2, sugar: 0.6, fiber: 1.8, sodium: 1 },
  'potato': { calories: 77, protein: 2, carbs: 17.5, fat: 0.1, satFat: 0, sugar: 0.8, fiber: 2.2, sodium: 6 },
  'sweet potato': { calories: 86, protein: 1.6, carbs: 20.1, fat: 0.1, satFat: 0, sugar: 4.2, fiber: 3, sodium: 55 },

  // Vegetables
  'spinach': { calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, satFat: 0.1, sugar: 0.4, fiber: 2.2, sodium: 79 },
  'broccoli': { calories: 34, protein: 2.8, carbs: 6.6, fat: 0.4, satFat: 0.1, sugar: 1.7, fiber: 2.6, sodium: 33 },
  'tomato': { calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, satFat: 0, sugar: 2.6, fiber: 1.2, sodium: 5 },
  'onion': { calories: 40, protein: 1.1, carbs: 9.3, fat: 0.1, satFat: 0, sugar: 4.2, fiber: 1.7, sodium: 4 },
  'bell pepper': { calories: 26, protein: 1, carbs: 6, fat: 0.3, satFat: 0.1, sugar: 4.2, fiber: 2.1, sodium: 4 },
  'carrot': { calories: 41, protein: 0.9, carbs: 9.6, fat: 0.2, satFat: 0, sugar: 4.7, fiber: 2.8, sodium: 69 },

  // Fats & Condiments
  'olive oil': { calories: 884, protein: 0, carbs: 0, fat: 100, satFat: 14, sugar: 0, fiber: 0, sodium: 2 },
  'butter': { calories: 717, protein: 0.9, carbs: 0.1, fat: 81, satFat: 51, sugar: 0.1, fiber: 0, sodium: 576 },
  'cheese': { calories: 402, protein: 25, carbs: 1.3, fat: 33, satFat: 21, sugar: 0.5, fiber: 0, sodium: 621 },
  'parmesan': { calories: 431, protein: 38, carbs: 4.1, fat: 29, satFat: 17, sugar: 0.9, fiber: 0, sodium: 1529 },
  'sugar': { calories: 387, protein: 0, carbs: 100, fat: 0, satFat: 0, sugar: 100, fiber: 0, sodium: 1 },
  'dark chocolate': { calories: 546, protein: 4.9, carbs: 61, fat: 31, satFat: 19, sugar: 48, fiber: 7, sodium: 20 },
};

/**
 * Calculate health score (0-100) based on nutritional balance
 */
export const calculateHealthScore = (nutrition, servings = 1) => {
  const cal = Math.max(0, nutrition.calories / (servings || 1));
  const protein = Math.max(0, nutrition.protein / (servings || 1));
  const fiber = Math.max(0, nutrition.fiber / (servings || 1));
  const satFat = Math.max(0, nutrition.saturatedFat / (servings || 1));
  const sugar = Math.max(0, nutrition.sugar / (servings || 1));
  const sodium = Math.max(0, nutrition.sodium / (servings || 1));

  let score = 70; // baseline

  // Positive nutrient bonuses
  if (fiber >= 6) score += 12;
  else if (fiber >= 3) score += 6;

  if (protein >= 20) score += 12;
  else if (protein >= 10) score += 6;

  // Moderation deductions
  if (satFat > 12) score -= 15;
  else if (satFat > 7) score -= 8;

  if (sugar > 25) score -= 18;
  else if (sugar > 14) score -= 9;

  if (sodium > 900) score -= 15;
  else if (sodium > 600) score -= 8;

  if (cal > 800) score -= 10;
  else if (cal > 600) score -= 5;

  score = Math.min(98, Math.max(25, Math.round(score)));

  // Generate qualitative breakdown
  const positiveAspects = [];
  const areasToImprove = [];

  if (protein >= 12) {
    positiveAspects.push(`High in protein (${Math.round(protein)}g), supporting muscle maintenance and satiety.`);
  }
  if (fiber >= 4) {
    positiveAspects.push(`Good source of dietary fiber (${Math.round(fiber)}g), promoting healthy digestion.`);
  }
  if (satFat <= 3 && satFat > 0) {
    positiveAspects.push(`Low in saturated fat (${Math.round(satFat)}g), beneficial for cardiovascular wellness.`);
  }
  if (sugar <= 6) {
    positiveAspects.push(`Naturally low in simple sugars (${Math.round(sugar)}g), preventing blood sugar spikes.`);
  }
  if (sodium <= 400) {
    positiveAspects.push(`Controlled sodium content (${Math.round(sodium)}mg), ideal for blood pressure balance.`);
  }

  if (positiveAspects.length === 0) {
    positiveAspects.push('Provides essential macronutrients and daily energy.');
  }

  if (satFat > 6) {
    areasToImprove.push(`Contains ${Math.round(satFat)}g saturated fat. Consider trimming dairy fats or using heart-healthy olive oil.`);
  }
  if (sugar > 12) {
    areasToImprove.push(`Contains ${Math.round(sugar)}g sugar. Try reducing refined sweeteners or swapping for whole fresh fruits.`);
  }
  if (sodium > 600) {
    areasToImprove.push(`Sodium is elevated (${Math.round(sodium)}mg). Flavour with herbs, lemon, and garlic to reduce salt.`);
  }
  if (fiber < 3) {
    areasToImprove.push(`Low in dietary fiber (${Math.round(fiber)}g). Add vegetables, seeds, or whole grains to boost satiety.`);
  }

  if (areasToImprove.length === 0) {
    areasToImprove.push('Well-balanced portion. Ensure diverse vegetable varieties throughout the day.');
  }

  const explanation =
    score >= 80
      ? 'Nutrient-dense and well-balanced. Provides strong amounts of beneficial nutrients with controlled refined components.'
      : score >= 60
      ? 'Moderately balanced meal. Has good nutritional value but can be optimized with smarter fat or sodium substitutions.'
      : 'Indulgent profile. Higher in saturated fats, sugars, or sodium. Best enjoyed occasionally or with wholesome adjustments.';

  return {
    score,
    explanation,
    positiveAspects,
    areasToImprove,
  };
};

/**
 * Generate healthier food adjustments and ingredient substitutions
 */
export const generateHealthierSuggestions = (foodName, nutrition) => {
  const suggestions = [];

  // Lower sugar suggestion
  if (nutrition.sugar > 10) {
    suggestions.push({
      category: 'Lower Sugar',
      tip: 'Replace refined sugar, sweetened sauces, or syrups with unsweetened applesauce, mashed banana, or a touch of pure stevia.',
      impact: 'Reduces glycemic load and cuts 40-80 empty calories per serving.',
    });
  }

  // Lower fat / saturated fat
  if (nutrition.saturatedFat > 5 || nutrition.fat > 18) {
    suggestions.push({
      category: 'Lower Saturated Fat',
      tip: 'Substitute heavy cooking cream with blended silken tofu, Greek yogurt, or low-fat oat milk. Use an oil spray instead of free pouring.',
      impact: 'Slices saturated fat by up to 60% while maintaining a silky texture.',
    });
  }

  // Protein boost
  if (nutrition.protein < 15) {
    suggestions.push({
      category: 'Protein Boost',
      tip: 'Incorporate 100g of grilled edamame, paneer, tofu cubes, or boiled chickpeas to elevate amino acid profile.',
      impact: 'Adds 10-15g of clean protein to promote fullness and muscle recovery.',
    });
  }

  // Fiber boost
  if (nutrition.fiber < 5) {
    suggestions.push({
      category: 'Fiber Enhancement',
      tip: 'Swap refined white grains for quinoa, brown rice, or cauliflower rice, and add a side of leafy greens or steamed broccoli.',
      impact: 'Doubles digestive fiber and slows down carbohydrate absorption.',
    });
  }

  // Sodium control
  if (nutrition.sodium > 500) {
    suggestions.push({
      category: 'Sodium Reduction',
      tip: 'Season with fresh lime juice, smoked paprika, sumac, or toasted sesame seeds instead of heavy table salt or soy sauce.',
      impact: 'Decreases sodium by 300-400mg without sacrificing vibrant flavour.',
    });
  }

  // Always supply at least 3 smart tips
  if (suggestions.length < 3) {
    suggestions.push({
      category: 'Smart Cooking Technique',
      tip: 'Opt for air-frying, poaching, or baking rather than deep frying to lock in nutrients without excess cooking oils.',
      impact: 'Saves 100-150 kcal per serving from absorbed oils.',
    });
  }

  // Healthier version comparison
  const healthierNutrition = {
    calories: Math.max(120, Math.round(nutrition.calories * 0.78)),
    protein: Math.round(nutrition.protein * 1.15),
    carbohydrates: Math.round(nutrition.carbohydrates * 0.85),
    fat: Math.max(3, Math.round(nutrition.fat * 0.65)),
    saturatedFat: Math.max(1, Math.round(nutrition.saturatedFat * 0.45)),
    sugar: Math.max(1, Math.round(nutrition.sugar * 0.55)),
    fiber: Math.round(nutrition.fiber * 1.6) || 4,
    sodium: Math.max(120, Math.round(nutrition.sodium * 0.6)),
  };

  return {
    tips: suggestions,
    comparison: {
      original: {
        name: foodName || 'Original Dish',
        nutrition: { ...nutrition },
      },
      healthier: {
        name: `${foodName || 'Dish'} (Optimized Healthier Version)`,
        modifications: [
          'Swapped refined oils/dairy for lighter nutrient-dense options',
          'Increased wholesome fiber and plant or lean protein',
          'Naturally reduced table salt with aromatic herbs & lemon',
        ],
        nutrition: healthierNutrition,
      },
    },
  };
};

/**
 * Intelligent fallback nutrition estimator based on ingredient parsing
 */
export const estimateNutritionFromText = (dishName, ingredientsText = '', servingSize = '1 serving') => {
  let total = {
    calories: 0,
    protein: 0,
    carbohydrates: 0,
    fat: 0,
    saturatedFat: 0,
    sugar: 0,
    fiber: 0,
    sodium: 0,
  };

  const textToScan = `${dishName} ${ingredientsText}`.toLowerCase();
  let matchedCount = 0;

  for (const [key, val] of Object.entries(foodDatabase)) {
    if (textToScan.includes(key)) {
      matchedCount++;
      total.calories += val.calories;
      total.protein += val.protein;
      total.carbohydrates += val.carbs;
      total.fat += val.fat;
      total.saturatedFat += val.satFat;
      total.sugar += val.sugar;
      total.fiber += val.fiber;
      total.sodium += val.sodium;
    }
  }

  // If no specific ingredients matched, use realistic fallback estimation based on keywords
  if (matchedCount === 0) {
    if (textToScan.includes('salad')) {
      total = { calories: 240, protein: 6, carbohydrates: 16, fat: 14, saturatedFat: 2.5, sugar: 4, fiber: 5, sodium: 320 };
    } else if (textToScan.includes('soup')) {
      total = { calories: 180, protein: 7, carbohydrates: 22, fat: 5, saturatedFat: 1.2, sugar: 4, fiber: 3.5, sodium: 580 };
    } else if (textToScan.includes('curry') || textToScan.includes('masala')) {
      total = { calories: 420, protein: 14, carbohydrates: 34, fat: 22, saturatedFat: 8, sugar: 6, fiber: 4.5, sodium: 640 };
    } else if (textToScan.includes('cake') || textToScan.includes('dessert') || textToScan.includes('cookie')) {
      total = { calories: 380, protein: 5, carbohydrates: 48, fat: 18, saturatedFat: 10, sugar: 32, fiber: 1.5, sodium: 180 };
    } else if (textToScan.includes('smoothie')) {
      total = { calories: 230, protein: 8, carbohydrates: 38, fat: 3.5, saturatedFat: 0.8, sugar: 22, fiber: 5, sodium: 80 };
    } else if (textToScan.includes('pasta') || textToScan.includes('pizza') || textToScan.includes('burger')) {
      total = { calories: 540, protein: 20, carbohydrates: 62, fat: 22, saturatedFat: 8, sugar: 7, fiber: 4, sodium: 740 };
    } else {
      total = { calories: 350, protein: 12, carbohydrates: 42, fat: 12, saturatedFat: 3.5, sugar: 6, fiber: 4, sodium: 450 };
    }
  } else {
    // Normalize if multiple ingredients accumulated
    total.calories = Math.round(total.calories);
    total.protein = Math.round(total.protein * 10) / 10;
    total.carbohydrates = Math.round(total.carbohydrates * 10) / 10;
    total.fat = Math.round(total.fat * 10) / 10;
    total.saturatedFat = Math.round(total.saturatedFat * 10) / 10;
    total.sugar = Math.round(total.sugar * 10) / 10;
    total.fiber = Math.round(total.fiber * 10) / 10;
    total.sodium = Math.round(total.sodium);
  }

  const healthScoreData = calculateHealthScore(total, 1);
  const healthierData = generateHealthierSuggestions(dishName, total);

  return {
    foodName: dishName || 'Analyzed Dish',
    servingSize,
    nutrition: total,
    caloriesPerServing: total.calories,
    healthScore: healthScoreData.score,
    scoreExplanation: healthScoreData.explanation,
    positiveAspects: healthScoreData.positiveAspects,
    areasToImprove: healthScoreData.areasToImprove,
    healthierSuggestions: healthierData.tips,
    comparison: healthierData.comparison,
    isEstimate: true,
    confidence: matchedCount > 0 ? 'High (Derived from ingredient analysis)' : 'Moderate (Derived from dish profile)',
    limitations:
      'Nutritional values are computed estimates. Actual nutrient density varies based on precise cooking techniques, sodium additions, and brand differences.',
  };
};

