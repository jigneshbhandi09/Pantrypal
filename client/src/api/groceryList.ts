import client from './client';
import type { GroceryList } from '../types/GroceryList';

const unwrap = <T>(resData: any): T => {
  return resData && typeof resData === 'object' && 'data' in resData ? resData.data : resData;
};

export const getGroceryList = async (weekOf?: string): Promise<GroceryList> => {
  const res = await client.get('/api/grocerylist', { params: { weekOf } });
  return unwrap<GroceryList>(res.data);
};

export const generateGroceryList = async (weekOf?: string): Promise<GroceryList> => {
  const res = await client.post('/api/grocerylist/generate', { weekOf });
  return unwrap<GroceryList>(res.data);
};

export const updateGroceryListItem = async (
  itemId: string,
  data: { checked?: boolean; name?: string; quantity?: number; unit?: string; weekOf?: string }
): Promise<GroceryList> => {
  const res = await client.put(`/api/grocerylist/items/${itemId}`, data);
  return unwrap<GroceryList>(res.data);
};

export const addGroceryListItem = async (data: {
  name: string;
  quantity: number;
  unit: string;
  weekOf?: string;
}): Promise<GroceryList> => {
  const res = await client.post('/api/grocerylist/items', data);
  return unwrap<GroceryList>(res.data);
};

export const deleteGroceryListItem = async (itemId: string, weekOf?: string): Promise<GroceryList> => {
  const res = await client.delete(`/api/grocerylist/items/${itemId}`, { params: { weekOf } });
  return unwrap<GroceryList>(res.data);
};
