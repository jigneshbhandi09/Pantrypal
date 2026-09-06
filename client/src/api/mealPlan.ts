import client from './client';
import type { MealPlanSlot, MealType } from '../types/MealPlan';

const unwrap = <T>(resData: any): T => {
  return resData && typeof resData === 'object' && 'data' in resData ? resData.data : resData;
};

export const getMealPlan = async (week?: string): Promise<MealPlanSlot[]> => {
  const res = await client.get('/api/mealplan', { params: { week } });
  return unwrap<MealPlanSlot[]>(res.data) || [];
};

export const saveMealPlanSlot = async (data: {
  date: string;
  mealType: MealType;
  recipeId: string;
}): Promise<MealPlanSlot> => {
  const res = await client.post('/api/mealplan', data);
  return unwrap<MealPlanSlot>(res.data);
};

export const deleteMealPlanSlot = async (id: string): Promise<{ message: string }> => {
  const res = await client.delete(`/api/mealplan/${id}`);
  return res.data;
};
