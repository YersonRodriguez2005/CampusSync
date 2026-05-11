import api from './api';

// Definimos la estructura exacta que nos devuelve el backend
export interface ChartDataPoint {
  name: string;
  promedio: number;
}

export interface DashboardSummary {
  active_subjects: number;
  global_average: number;
  chart_data: ChartDataPoint[];
}

export const dashboardService = {
  // Obtener el resumen global para la pantalla de inicio
  getSummary: async (): Promise<DashboardSummary> => {
    try {
      // Hacemos la petición al endpoint que creamos en el backend
      const response = await api.get('/dashboard/summary');
      return response.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      throw error.response?.data?.error || 'Error al obtener las métricas del dashboard';
    }
  }
};