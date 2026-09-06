import client from './client';
import type { User } from '../types/User';

const unwrap = <T>(resData: any): T => {
  return resData && typeof resData === 'object' && 'data' in resData ? resData.data : resData;
};

export const getProfile = async (): Promise<User> => {
  const res = await client.get('/api/user/profile');
  return unwrap<User>(res.data);
};

export const updateProfile = async (data: {
  name?: string;
  dietaryPreferences?: string[];
  allergies?: string[];
  avatarUrl?: string | null;
}): Promise<User> => {
  const res = await client.put('/api/user/profile', data);
  return unwrap<User>(res.data);
};
