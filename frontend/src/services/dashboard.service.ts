import { api } from './api';
import { DashboardStats, DashboardCharts, TeamWorkloadUser, Task, ApiResponse } from '../types';

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    const res = await api.get<ApiResponse<DashboardStats>>('/dashboard/stats');
    return res.data.data;
  },

  async getCharts(): Promise<DashboardCharts> {
    const res = await api.get<ApiResponse<DashboardCharts>>('/dashboard/charts');
    return res.data.data;
  },

  async getWorkload(): Promise<TeamWorkloadUser[]> {
    const res = await api.get<ApiResponse<TeamWorkloadUser[]>>('/dashboard/workload');
    return res.data.data;
  },

  async getDeadlines(limit = 6): Promise<Task[]> {
    const res = await api.get<ApiResponse<Task[]>>('/dashboard/deadlines', { params: { limit } });
    return res.data.data;
  }
};
