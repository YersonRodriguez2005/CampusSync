import axios from 'axios';
import { useAuthStore } from '../store/authStore'; // Importamos tu store

const api = axios.create({
  // Asegúrate de que esta URL base coincida con tu backend.
  // Según tu error, estás usando /api en lugar de /api/v1
  baseURL: 'https://campussync-aruy.onrender.com/api', 
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  // Extraemos el token directamente desde la memoria de Zustand
  const token = useAuthStore.getState().token;
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;