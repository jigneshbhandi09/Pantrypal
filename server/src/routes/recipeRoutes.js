const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const {
  getRecipes,
  getRecipeById,
  createRecipe,
  getSuggestions,
  getAiSuggestions
} = require('../controllers/recipeController');

;router.get('/', getRecipes);                          // public — anyone can browse
router.get('/suggestions', protect, getSuggestions);  // needs login — needs to know whose pantry
router.post('/ai-suggestions', protect, getAiSuggestions); // needs login — generate AI recipes
router.get('/:id', getRecipeById);                     // public
router.post('/', protect, createRecipe);               // needs login — tracks who created it

module.exports = router;