import axios from 'axios';

const apiBaseUrl = import.meta.env.VITE_API_URL !== undefined && import.meta.env.VITE_API_URL !== ''
  ? import.meta.env.VITE_API_URL
  : (import.meta.env.MODE === 'production' ? '' : 'http://localhost:5000');

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  baseURL: import.meta.env.VITE_API_URL !== undefined
    ? import.meta.env.VITE_API_URL
    : (import.meta.env.MODE === 'production' ? '' : 'http://localhost:5000'),
  baseURL: apiBaseUrl,
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default client;

