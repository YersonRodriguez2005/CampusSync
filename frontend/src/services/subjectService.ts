import api from './api';

export interface Subject {
  id: string;
  term_id: string;
  name: string;
  target_score: number;
  current_average?: number;
}

export const subjectService = {
  getByTerm: async (termId: string): Promise<Subject[]> => {
    try {
      const response = await api.get(`/subjects/term/${termId}`);
      return response.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      throw error.response?.data?.error || 'Error al obtener materias';
    }
  },

  create: async (subject: Omit<Subject, 'id'>): Promise<Subject> => {
    try {
      const response = await api.post('/subjects', subject);
      return response.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      throw error.response?.data?.error || 'Error al crear la materia';
    }
  },

  update: async (id: string, subject: Partial<Subject>): Promise<Subject> => {
    try {
      const response = await api.put(`/subjects/${id}`, subject);
      return response.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      throw error.response?.data?.error || 'Error al actualizar la materia';
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      await api.delete(`/subjects/${id}`);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      throw error.response?.data?.error || 'Error al eliminar la materia';
    }
  }
};