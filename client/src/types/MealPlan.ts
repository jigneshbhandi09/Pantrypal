import type { Recipe } from './Recipe';

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface MealPlanSlot {
  _id: string;
  userId: string;
  date: string;
  mealType: MealType;
  recipeId: Recipe;
  createdAt?: string;
}

