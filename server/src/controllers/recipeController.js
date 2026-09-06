const Recipe = require('../models/Recipe');
const PantryItem = require('../models/PantryItem');
const { generateRecipesFromIngredients } = require('../services/aiService');

// GET /api/recipes — browse/search all recipes (public, no auth needed)
exports.getRecipes = async (req, res) => {
  try {
    const { search, cuisine, dietTag } = req.query;
    const filter = {};

    if (search) filter.$text = { $search: search };
    if (cuisine) filter.cuisine = cuisine;
    if (dietTag) filter.dietTags = dietTag;

    const recipes = await Recipe.find(filter).limit(50);

    res.status(200).json({
      message: 'Recipes fetched successfully',
      data: recipes
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch recipes', error: err.message });
  }
};

// GET /api/recipes/:id — single recipe detail
exports.getRecipeById = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    res.status(200).json({
      message: 'Recipe detail fetched successfully',
      data: recipe
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch recipe', error: err.message });
  }
};

// POST /api/recipes — create a recipe (requires login, tracks who created it)
exports.createRecipe = async (req, res) => {
  try {
    const { title, ingredients, instructions } = req.body;

    if (!title || !ingredients || !instructions) {
      return res.status(400).json({ message: 'title, ingredients, and instructions are required' });
    }

    const slug = title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();

    const recipe = await Recipe.create({
      ...req.body,
      slug,
      createdBy: req.user._id
    });

    res.status(201).json({
      message: 'Recipe created successfully',
      data: recipe
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create recipe', error: err.message });
  }
};

// GET /api/recipes/suggestions — recipes matchable from current pantry
exports.getSuggestions = async (req, res) => {
  try {
    const pantryItems = await PantryItem.find({ userId: req.user._id });
    const pantryNames = pantryItems.map(item => item.name.toLowerCase());

    const recipes = await Recipe.find().limit(100);

    const suggestions = recipes
      .map(recipe => {
        const recipeIngredientNames = (recipe.ingredients || []).map(i => i.name.toLowerCase());
        const matchedCount = recipeIngredientNames.filter(name => pantryNames.includes(name)).length;
        const matchPercentage = Math.round((matchedCount / (recipeIngredientNames.length || 1)) * 100);
        return { recipe, matchedCount, matchPercentage };
      })
      .filter(r => r.matchedCount > 0)
      .sort((a, b) => b.matchPercentage - a.matchPercentage);

    res.status(200).json({
      message: 'Recipe suggestions fetched successfully',
      data: suggestions
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to get suggestions', error: err.message });
  }
};

// POST /api/recipes/ai-suggestions — generate AI recipe suggestions from pantry items
exports.getAiSuggestions = async (req, res) => {
  try {
    const pantryItems = await PantryItem.find({ userId: req.user._id });
    const ingredientNames = pantryItems.map(item => item.name);

    if (ingredientNames.length === 0) {
      return res.status(400).json({ message: 'Your pantry is empty. Add ingredients to generate AI recipes.' });
    }

    const dietaryPreferences = req.user.dietaryPreferences || [];
    const generated = await generateRecipesFromIngredients(ingredientNames, dietaryPreferences);

    const savedRecipes = [];
    for (const raw of generated) {
      const slugBase = (raw.title || 'ai-recipe').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
      const slug = `${slugBase}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      const recipeDoc = await Recipe.create({
        title: raw.title || 'AI Generated Recipe',
        slug,
        description: raw.description || '',
        ingredients: Array.isArray(raw.ingredients) ? raw.ingredients : [],
        instructions: Array.isArray(raw.instructions) ? raw.instructions : [],
        cuisine: raw.cuisine || 'General',
        dietTags: Array.isArray(raw.dietTags) ? raw.dietTags : [],
        prepTimeMinutes: raw.prepTimeMinutes || 15,
        cookTimeMinutes: raw.cookTimeMinutes || 20,
        servings: raw.servings || 2,
        imageUrl: raw.imageUrl || null,
        isAiGenerated: true,
        createdBy: req.user._id
      });
      savedRecipes.push(recipeDoc);
    }

    res.status(200).json({
      message: 'AI recipe suggestions generated successfully',
      data: savedRecipes
    });
  } catch (err) {
    console.error('getAiSuggestions error:', err.message || err);
    if (err.message && err.message.includes('Your pantry is empty')) {
      return res.status(400).json({ message: err.message });
    }
    return res.status(503).json({
      message: "Couldn't generate suggestions right now — please try again in a moment."
    });
  }
};