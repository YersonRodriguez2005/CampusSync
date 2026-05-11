import api from './api';

export interface Evaluation {
  id: string;
  subject_id: string;
  title: string;
  weight_percentage: number;
  score: number | null;
  due_date?: string;
}

export interface EvaluationResponse {
  evaluation: Evaluation;
  subject_metrics: {
    total_weight_assigned: number;
    evaluated_weight: number;
    current_accumulated_score: string;
  };
}

export const evaluationService = {
  getBySubject: async (subjectId: string): Promise<Evaluation[]> => {
    try {
      const response = await api.get(`/evaluations/subject/${subjectId}`);
      return response.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      throw error.response?.data?.error || 'Error al obtener las notas';
    }
  },

  create: async (data: Omit<Evaluation, 'id'>): Promise<EvaluationResponse> => {
    try {
      const response = await api.post('/evaluations', data);
      return response.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      throw error.response?.data?.error || 'Error al registrar la nota';
    }
  },

  update: async (id: string, data: Partial<Evaluation>): Promise<EvaluationResponse> => {
    try {
      const response = await api.put(`/evaluations/${id}`, data);
      return response.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      throw error.response?.data?.error || 'Error al actualizar la nota';
    }
  },

  delete: async (id: string): Promise<{ message: string; subject_metrics: EvaluationResponse['subject_metrics'] }> => {
    try {
      const response = await api.delete(`/evaluations/${id}`);
      return response.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      throw error.response?.data?.error || 'Error al eliminar la nota';
    }
  }
};