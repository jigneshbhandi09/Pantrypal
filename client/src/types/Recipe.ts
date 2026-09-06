export interface Ingredient {
  name: string;
  quantity: number;
  unit: string;
}

export interface Recipe {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  ingredients: Ingredient[];
  instructions: string[];
  cuisine?: string;
  dietTags: string[];
  prepTimeMinutes?: number;
  cookTimeMinutes?: number;
  servings: number;
  imageUrl: string | null;
  isAiGenerated: boolean;
  createdBy?: string | null;
  createdAt?: string;
}

export interface RecipeSuggestion {
  recipe: Recipe;
  matchedCount: number;
  matchPercentage: number;
}

