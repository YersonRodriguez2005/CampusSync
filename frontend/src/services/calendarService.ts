import api from './api';

// Definimos la interfaz basada en el JOIN que hicimos en el backend
export interface CalendarEvent {
  id: string;
  title: string;
  due_date: string;
  weight_percentage: number;
  score: number | null;
  subject_name: string;
  term_name: string;
}

export const calendarService = {
  // Solo necesitamos GET. Las creaciones/eliminaciones las maneja evaluationService.
  getEvents: async (): Promise<CalendarEvent[]> => {
    try {
      const response = await api.get('/calendar/events');
      return response.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      throw error.response?.data?.error || 'Error al cargar los eventos del calendario';
    }
  }
};