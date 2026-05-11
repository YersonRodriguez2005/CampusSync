import axios from 'axios';
import { useAuthStore } from '../store/authStore'; 

const api = axios.create({
  baseURL: 'https://campussync-aruy.onrender.com/api', 
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  // Le decimos explícitamente a TypeScript la estructura esperada del estado
  const state = useAuthStore.getState() as { token: string | null };
  const token = state.token;
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;