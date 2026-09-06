const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function generateRecipesFromIngredients(ingredientNames, dietaryPreferences = []) {
  if (!ingredientNames || ingredientNames.length === 0) {
    throw new Error('Your pantry is empty. Add ingredients to generate AI recipes.');
  }

  const prompt = `You are a helpful master chef AI. Given these pantry ingredients: ${ingredientNames.join(', ')}.
Dietary preferences to respect: ${dietaryPreferences.join(', ') || 'none'}.
Suggest 3 distinct recipes with creative titles that primarily use these ingredients.
Respond ONLY with valid JSON array, no markdown formatting, in this exact shape:
[{"title": "string", "description": "string", "ingredients": [{"name": "string", "quantity": number, "unit": "string"}], "instructions": ["string"], "prepTimeMinutes": number, "cookTimeMinutes": number, "servings": number, "cuisine": "string"}]`;

  const response = await ai.models.generateContent({
    model: 'gemini-3.6-flash',
    contents: prompt,
  });

  const cleaned = (response.text || '').replace(/```json|```/g, '').trim();
  const recipes = JSON.parse(cleaned);

  if (!Array.isArray(recipes)) {
    throw new Error('Unexpected response format from AI');
  }

  const recipesWithImages = await Promise.all(
    recipes.map(async (recipe) => ({
      ...recipe,
      imageUrl: await generateRecipeImage(recipe.title, recipe.cuisine)
    }))
  );

  return recipesWithImages;
}

async function generateRecipeImage(title, cuisine) {
  const prompt = `professional food photography, ${title}, ${cuisine || ''} cuisine, appetizing, top-down shot, natural lighting`;
  const encodedPrompt = encodeURIComponent(prompt);
  return `https://image.pollinations.ai/prompt/${encodedPrompt}?width=800&height=600&nologo=true`;
}

module.exports = { generateRecipesFromIngredients };
