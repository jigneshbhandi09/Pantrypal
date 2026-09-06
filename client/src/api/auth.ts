import client from './client';
import type { User } from '../types/User';

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export const signup = async (name: string, email: string, password: string): Promise<AuthResponse> => {
  const res = await client.post('/api/auth/signup', { name, email, password });
  return res.data;
};

export const login = async (email: string, password: string): Promise<AuthResponse> => {
  const res = await client.post('/api/auth/login', { email, password });
  return res.data;
};

