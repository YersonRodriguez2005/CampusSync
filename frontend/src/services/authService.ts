import api from './api';

export const authService = {
  // Nota como agregamos ": string" a los parámetros
  register: async (email: string, password: string) => {
    try {
      const response = await api.post('/users/register', { email, password });
      return response.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      throw error.response?.data?.error || 'Error al conectar con el servidor';
    }
  },
  
  login: async (email: string, password: string) => {
    try {
      const response = await api.post('/users/login', { email, password });
      return response.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      throw error.response?.data?.error || 'Error en el login';
    }
  },

  resetPassword: async (email: string): Promise<void> => {
    try {
      await api.post('/users/forgot-password', { email });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      throw error.response?.data?.error || 'Error al procesar la solicitud';
    }
  },
  
  confirmReset: async (token: string, newPassword: string): Promise<void> => {
    try {
      await api.post(`/users/reset-password/${token}`, { newPassword });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      throw error.response?.data?.error || 'Error al restablecer la contraseña';
    }
  },
};