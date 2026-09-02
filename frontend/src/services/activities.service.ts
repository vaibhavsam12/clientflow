import { api } from './api';
import { ActivityLog, PaginatedResponse } from '../types';

export const activitiesService = {
  async getActivities(params?: {
    page?: number;
    limit?: number;
    entityType?: string;
    entityId?: string;
    clientId?: string;
    projectId?: string;
  }): Promise<PaginatedResponse<ActivityLog>> {
    const res = await api.get<PaginatedResponse<ActivityLog>>('/activities', { params });
    return res.data;
  }
};
