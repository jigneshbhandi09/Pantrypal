import client from './client';
import type { Recipe, RecipeSuggestion } from '../types/Recipe';

const unwrap = <T>(resData: any): T => {
  return resData && typeof resData === 'object' && 'data' in resData ? resData.data : resData;
};

export const getRecipes = async (params?: { search?: string; cuisine?: string; dietTag?: string }): Promise<Recipe[]> => {
  const res = await client.get('/api/recipes', { params });
  return unwrap<Recipe[]>(res.data) || [];
};

export const getRecipeById = async (id: string): Promise<Recipe> => {
  const res = await client.get(`/api/recipes/${id}`);
  return unwrap<Recipe>(res.data);
};

export const createRecipe = async (recipe: Partial<Recipe>): Promise<Recipe> => {
  const res = await client.post('/api/recipes', recipe);
  return unwrap<Recipe>(res.data);
};

export const getSuggestions = async (): Promise<RecipeSuggestion[]> => {
  const res = await client.get('/api/recipes/suggestions');
  return unwrap<RecipeSuggestion[]>(res.data) || [];
};

export const getAiSuggestions = async (): Promise<Recipe[]> => {
  const res = await client.post('/api/recipes/ai-suggestions');
  return unwrap<Recipe[]>(res.data) || [];
};
