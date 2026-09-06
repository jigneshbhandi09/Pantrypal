import client from './client';
import type { PantryItem, CategoryType, UnitType } from '../types/PantryItem';

const unwrap = <T>(resData: any): T => {
  return resData && typeof resData === 'object' && 'data' in resData ? resData.data : resData;
};

export const getPantryItems = async (): Promise<PantryItem[]> => {
  const res = await client.get('/api/pantry');
  return unwrap<PantryItem[]>(res.data) || [];
};

export const getExpiringItems = async (): Promise<PantryItem[]> => {
  const res = await client.get('/api/pantry/expiring');
  return unwrap<PantryItem[]>(res.data) || [];
};

export const addPantryItem = async (data: {
  name: string;
  category: CategoryType;
  quantity: number;
  unit: UnitType;
  expiryDate?: string;
}): Promise<PantryItem> => {
  const res = await client.post('/api/pantry', data);
  return unwrap<PantryItem>(res.data);
};

export const updatePantryItem = async (id: string, data: Partial<PantryItem>): Promise<PantryItem> => {
  const res = await client.put(`/api/pantry/${id}`, data);
  return unwrap<PantryItem>(res.data);
};

export const deletePantryItem = async (id: string): Promise<{ message: string }> => {
  const res = await client.delete(`/api/pantry/${id}`);
  return res.data;
};
