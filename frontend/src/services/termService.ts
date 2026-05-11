import api from './api';

export interface Term {
  id: string;
  name: string;
  is_active: boolean;
  created_at?: string;
}

export const termService = {
  // Obtener todos los semestres del usuario
  getAll: async (): Promise<Term[]> => {
    try {
      const response = await api.get('/terms/');
      return response.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      throw error.response?.data?.error || 'Error al obtener los semestres';
    }
  },

  // Crear un nuevo semestre
  create: async (name: string, is_active: boolean = true): Promise<Term> => {
    try {
      const response = await api.post('/terms/', { name, is_active });
      return response.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      throw error.response?.data?.error || 'Error al crear el semestre';
    }
  },

  // Eliminar un semestre (Borra materias y notas en cascada en la DB)
  delete: async (id: string): Promise<void> => {
    try {
      await api.delete(`/terms/${id}`);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      throw error.response?.data?.error || 'Error al eliminar el semestre';
    }
  }
};