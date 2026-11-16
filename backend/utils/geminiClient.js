import { estimateNutritionFromText, calculateHealthScore, generateHealthierSuggestions } from './nutritionCalculator.js';

/**
 * Clean and extract JSON from Gemini text response
 */
const cleanJsonResponse = (text) => {
  if (!text) return null;
  let cleaned = text.trim();
  // Strip markdown code fences if Gemini wraps with ```json ... ```
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  try {
    return JSON.parse(cleaned);
  } catch (err) {
    console.error('Failed to parse Gemini JSON output:', err.message);
    // Try to extract first JSON array or object
    const match = cleaned.match(/(\[[\s\S]*\]|\{[\s\S]*\})/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {
        return null;
      }
    }
    return null;
  }
};

/**
 * Call Gemini API using native fetch
 */
const callGeminiAPI = async (prompt, systemInstruction = '', inlineData = null) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '' || apiKey.includes('your_gemini_api_key')) {
    return null;
  }

  // Support 2.5-flash with fallback to 1.5-flash
  const models = ['gemini-2.5-flash', 'gemini-1.5-flash'];

  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      const contentsParts = [];
      if (inlineData) {
        contentsParts.push({
          inlineData: {
            mimeType: inlineData.mimeType || 'image/jpeg',
            data: inlineData.data,
          },
        });
      }
      contentsParts.push({ text: prompt });

      const requestBody = {
        contents: [{ role: 'user', parts: contentsParts }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2500,
          responseMimeType: 'application/json',
        },
      };

      if (systemInstruction) {
        requestBody.systemInstruction = {
          parts: [{ text: systemInstruction }],
        };
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.warn(`Gemini model ${model} request failed (${response.status}):`, errorText);
        continue; // Try next model
      }

      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        const parsed = cleanJsonResponse(text);
        if (parsed) return parsed;
      }
    } catch (err) {
      console.warn(`Error invoking Gemini model ${model}:`, err.message);
    }
  }

  return null;
};

/**
 * Curated Demo Recipes Fallback
 */
const getDemoRecipes = ({ ingredients = [], mealType = 'Dinner', dietaryPreference = 'Vegetarian' }) => {
  const primaryIng = ingredients[0] || 'Seasonal Vegetables';
  return [
    {
      title: `Artisan ${primaryIng} & Herb Skillet`,
      description: `A fragrant, golden sautéed ${primaryIng} dish bursting with garlic, Mediterranean herbs, and fresh citrus zest.`,
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=80',
      ingredients: [
        { name: primaryIng, quantity: '2 cups (chopped)' },
        { name: 'Olive Oil', quantity: '2 tbsp' },
        { name: 'Garlic Cloves', quantity: '3 (minced)' },
        { name: 'Lemon Juice', quantity: '1 tbsp' },
        { name: 'Fresh Rosemary or Thyme', quantity: '1 sprig' },
        { name: 'Sea Salt & Crushed Black Pepper', quantity: 'To taste' },
      ],
      instructions: [
        `Wash, prep, and dice the ${primaryIng} into even bite-sized pieces.`,
        'Heat extra virgin olive oil in a skillet over medium flame until glistening.',
        'Add minced garlic and herbs, sautéing for 60 seconds until fragrant.',
        `Toss in the ${primaryIng} and cook for 8-10 minutes, stirring occasionally until tender-crisp.`,
        'Finish with a squeeze of fresh lemon juice, sea salt, and fresh pepper before plating.',
      ],
      preparationTime: 10,
      cookingTime: 15,
      servings: 2,
      difficulty: 'Easy',
      category: mealType || 'Dinner',
      dietaryPreference: dietaryPreference || 'Vegetarian',
      nutrition: {
        calories: 280,
        protein: 7,
        carbohydrates: 24,
        fat: 16,
        saturatedFat: 2.2,
        sugar: 4,
        fiber: 5,
        sodium: 290,
      },
      isAIgenerated: true,
      isDemoMode: true,
    },
    {
      title: `Warm ${primaryIng} & Spiced Grain Bowl`,
      description: `Comforting, nutrient-dense bowl combining caramelized ${primaryIng} with wholesome grains, roasted seeds, and a zesty drizzle.`,
      image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=900&q=80',
      ingredients: [
        { name: primaryIng, quantity: '1.5 cups' },
        { name: 'Cooked Quinoa or Brown Rice', quantity: '1 cup' },
        { name: 'Toasted Pumpkin or Sesame Seeds', quantity: '2 tbsp' },
        { name: 'Tahini or Greek Yogurt Dressing', quantity: '2 tbsp' },
        { name: 'Smoked Paprika', quantity: '1/2 tsp' },
      ],
      instructions: [
        `Season ${primaryIng} with smoked paprika and lightly roast or sear until caramelized.`,
        'Warm the cooked grains and fluff gently with a fork.',
        'Spoon grains into serving bowls and arrange warm vegetables on top.',
        'Garnish with crunchy toasted seeds and generously drizzle dressing over the bowl.',
      ],
      preparationTime: 12,
      cookingTime: 20,
      servings: 2,
      difficulty: 'Easy',
      category: mealType || 'Lunch',
      dietaryPreference: dietaryPreference || 'Vegetarian',
      nutrition: {
        calories: 390,
        protein: 13,
        carbohydrates: 52,
        fat: 14,
        saturatedFat: 1.8,
        sugar: 5,
        fiber: 7,
        sodium: 340,
      },
      isAIgenerated: true,
      isDemoMode: true,
    },
    {
      title: `Creamy ${primaryIng} Simmered Stew`,
      description: `A rich, comforting one-pot meal where ${primaryIng} melts into a savory coconut or tomato broth infused with mild spices.`,
      image: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=80',
      ingredients: [
        { name: primaryIng, quantity: '2 cups' },
        { name: 'Coconut Milk or Vegetable Stock', quantity: '1.5 cups' },
        { name: 'Yellow Onion', quantity: '1 (chopped)' },
        { name: 'Ground Cumin & Turmeric', quantity: '1/2 tsp each' },
        { name: 'Fresh Cilantro or Parsley', quantity: 'For garnish' },
      ],
      instructions: [
        'Sauté chopped onion in a pot until translucent and sweet.',
        'Add ground cumin and turmeric, stirring for 30 seconds to awaken spices.',
        `Pour in coconut milk or broth and add ${primaryIng}.`,
        'Simmer uncovered for 15-18 minutes until flavors meld and broth thickens.',
        'Taste, season with salt, and serve hot garnished with fresh herbs.',
      ],
      preparationTime: 10,
      cookingTime: 25,
      servings: 3,
      difficulty: 'Medium',
      category: mealType || 'Dinner',
      dietaryPreference: dietaryPreference || 'Vegetarian',
      nutrition: {
        calories: 340,
        protein: 8,
        carbohydrates: 31,
        fat: 20,
        saturatedFat: 11,
        sugar: 6,
        fiber: 5,
        sodium: 410,
      },
      isAIgenerated: true,
      isDemoMode: true,
    },
  ];
};

/**
 * Generate 3 recipes with Gemini API (or Demo Mode fallback)
 */
export const generateRecipesWithAI = async ({
  ingredients = [],
  mealType = 'Dinner',
  dietaryPreference = 'Vegetarian',
  cookingTime = 30,
  difficulty = 'Easy',
  instructions = '',
}) => {
  const systemInstruction = `You are an expert chef and culinary AI assistant.
Your goal is to suggest 3 distinct, creative, and delicious recipes based on user inputs.
You MUST output ONLY a valid JSON array of 3 recipe objects.
No markdown wrappers, no conversational text.
Each recipe object MUST have this exact schema:
{
  "title": "Recipe Title",
  "description": "Short appetizing description (2 sentences)",
  "image": "https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=800&q=80",
  "ingredients": [
    { "name": "Ingredient name", "quantity": "amount" }
  ],
  "instructions": [
    "Step 1 description",
    "Step 2 description"
  ],
  "preparationTime": 15,
  "cookingTime": 25,
  "servings": 2,
  "difficulty": "Easy",
  "category": "Dinner",
  "dietaryPreference": "Vegetarian",
  "nutrition": {
    "calories": 420,
    "protein": 18,
    "carbohydrates": 45,
    "fat": 16,
    "saturatedFat": 3.5,
    "sugar": 5,
    "fiber": 6,
    "sodium": 420
  }
}`;

  const prompt = `Generate 3 delicious recipe suggestions using these preferences:
- Available Ingredients: ${ingredients.join(', ') || 'Any common pantry items'}
- Meal Type: ${mealType}
- Dietary Preference: ${dietaryPreference}
- Maximum Cooking Time: ${cookingTime} minutes
- Desired Difficulty: ${difficulty}
- Special Notes / Instructions: ${instructions || 'None'}

Return ONLY the JSON array containing the 3 recipe objects.`;

  const aiResult = await callGeminiAPI(prompt, systemInstruction);

  if (aiResult && Array.isArray(aiResult) && aiResult.length > 0) {
    // Validate and normalize recipes
    const sanitized = aiResult.slice(0, 3).map((r, idx) => ({
      title: r.title || `AI Recipe ${idx + 1}`,
      description: r.description || 'A delicious recipe crafted by RecipeAI.',
      image:
        r.image ||
        'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=80',
      ingredients: Array.isArray(r.ingredients)
        ? r.ingredients.map((ing) =>
            typeof ing === 'string' ? { name: ing, quantity: '' } : ing
          )
        : [{ name: 'Mixed fresh ingredients', quantity: 'As needed' }],
      instructions: Array.isArray(r.instructions)
        ? r.instructions
        : ['Prepare ingredients and cook to desired doneness.'],
      preparationTime: Number(r.preparationTime) || 15,
      cookingTime: Number(r.cookingTime) || Number(cookingTime) || 25,
      servings: Number(r.servings) || 2,
      difficulty: ['Easy', 'Medium', 'Hard'].includes(r.difficulty)
        ? r.difficulty
        : 'Easy',
      category: mealType || 'Dinner',
      dietaryPreference: dietaryPreference || 'Vegetarian',
      nutrition: {
        calories: Number(r.nutrition?.calories) || 380,
        protein: Number(r.nutrition?.protein) || 15,
        carbohydrates: Number(r.nutrition?.carbohydrates) || 45,
        fat: Number(r.nutrition?.fat) || 14,
        saturatedFat: Number(r.nutrition?.saturatedFat) || 3,
        sugar: Number(r.nutrition?.sugar) || 5,
        fiber: Number(r.nutrition?.fiber) || 5,
        sodium: Number(r.nutrition?.sodium) || 420,
      },
      isAIgenerated: true,
      isDemoMode: false,
    }));

    return { recipes: sanitized, isDemoMode: false };
  }

  // Graceful Demo Mode fallback
  console.log('Using pre-crafted demo recipes (Gemini key not configured or unreachable).');
  const demo = getDemoRecipes({ ingredients, mealType, dietaryPreference });
  return { recipes: demo, isDemoMode: true };
};

/**
 * Analyze Food with Gemini Vision / Text (or smart fallback)
 */
export const analyzeFoodWithAI = async ({
  foodName = '',
  ingredients = '',
  servingSize = '1 serving',
  imageBase64 = null,
  mimeType = 'image/jpeg',
}) => {
  const prompt = `Analyze the nutritional profile and health characteristics of this food:
- Dish/Food: ${foodName || 'Food in image'}
- Stated Ingredients: ${ingredients || 'Standard preparation'}
- Serving Size: ${servingSize}

Provide a comprehensive nutritional assessment in STRICT JSON format with this exact structure:
{
  "identifiedFood": "Name of food",
  "servingSize": "${servingSize}",
  "confidence": "High / Moderate",
  "nutrition": {
    "calories": 350,
    "protein": 15,
    "carbohydrates": 42,
    "fat": 12,
    "saturatedFat": 3.5,
    "sugar": 5,
    "fiber": 6,
    "sodium": 420
  },
  "healthScore": 78,
  "scoreExplanation": "Objective balanced explanation of the score.",
  "positiveAspects": [
    "Positive nutritional aspect 1",
    "Positive nutritional aspect 2"
  ],
  "areasToImprove": [
    "Aspect that could be improved 1"
  ],
  "healthierSuggestions": [
    {
      "category": "Lower Sugar / Fat / Protein Boost / etc.",
      "tip": "Actionable swap or technique",
      "impact": "Nutritional benefit"
    }
  ],
  "healthierVersion": {
    "name": "Healthier alternative version",
    "modifications": ["Modification 1", "Modification 2"],
    "nutrition": {
      "calories": 280,
      "protein": 18,
      "carbohydrates": 35,
      "fat": 6,
      "saturatedFat": 1.5,
      "sugar": 2,
      "fiber": 8,
      "sodium": 280
    }
  },
  "limitations": "Photographs and estimates cannot guarantee exact sodium, hidden cooking oils, or portion weight."
}`;

  let inlineData = null;
  if (imageBase64) {
    inlineData = {
      mimeType,
      data: imageBase64.replace(/^data:image\/[a-z]+;base64,/, ''),
    };
  }

  const aiResult = await callGeminiAPI(
    prompt,
    'You are a professional registered dietitian and nutritional scientist. Return ONLY valid JSON.',
    inlineData
  );

  if (aiResult && aiResult.nutrition) {
    return {
      foodName: aiResult.identifiedFood || foodName || 'Analyzed Dish',
      servingSize: aiResult.servingSize || servingSize,
      nutrition: {
        calories: Number(aiResult.nutrition.calories) || 0,
        protein: Number(aiResult.nutrition.protein) || 0,
        carbohydrates: Number(aiResult.nutrition.carbohydrates) || 0,
        fat: Number(aiResult.nutrition.fat) || 0,
        saturatedFat: Number(aiResult.nutrition.saturatedFat) || 0,
        sugar: Number(aiResult.nutrition.sugar) || 0,
        fiber: Number(aiResult.nutrition.fiber) || 0,
        sodium: Number(aiResult.nutrition.sodium) || 0,
      },
      caloriesPerServing: Number(aiResult.nutrition.calories) || 0,
      healthScore: Number(aiResult.healthScore) || 75,
      scoreExplanation:
        aiResult.scoreExplanation ||
        'Nutritional balance based on ingredient and macronutrient ratios.',
      positiveAspects: Array.isArray(aiResult.positiveAspects)
        ? aiResult.positiveAspects
        : ['Contains essential dietary nutrients.'],
      areasToImprove: Array.isArray(aiResult.areasToImprove)
        ? aiResult.areasToImprove
        : ['Optimize sodium or saturated fat portions.'],
      healthierSuggestions: Array.isArray(aiResult.healthierSuggestions)
        ? aiResult.healthierSuggestions
        : [],
      comparison: {
        original: {
          name: aiResult.identifiedFood || foodName || 'Original Dish',
          nutrition: aiResult.nutrition,
        },
        healthier: aiResult.healthierVersion || {
          name: `${foodName || 'Dish'} (Nutrient-Optimized)`,
          modifications: ['Reduced saturated oils', 'Increased dietary fiber'],
          nutrition: {
            ...aiResult.nutrition,
            calories: Math.round((aiResult.nutrition.calories || 300) * 0.8),
          },
        },
      },
      confidence: aiResult.confidence || 'High (AI Model Analysis)',
      limitations:
        aiResult.limitations ||
        'Nutritional values are computed estimates. Photo and ingredient estimates cannot guarantee precise sodium or hidden oils.',
      isEstimate: true,
      isDemoMode: false,
    };
  }

  // Fallback to local rule-based calculator
  return {
    ...estimateNutritionFromText(foodName, ingredients, servingSize),
    isDemoMode: true,
  };
};

