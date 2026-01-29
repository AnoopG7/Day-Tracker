import api from './api';
import type { ApiResponse } from '../types/api.types';
import type { DashboardData } from '../types/dashboard.types';

/** Dashboard API service */
export const dashboardService = {
  /**
   * Get dashboard data for a specific date
   * @param date - YYYY-MM-DD format (optional, defaults to today on backend)
   */
  async getDashboard(date?: string): Promise<DashboardData> {
    const params = date ? { date } : {};
    const response = await api.get<ApiResponse<DashboardData>>('/dashboard', { params });
    return response.data.data;
  },
};

export default dashboardService;
