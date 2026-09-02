import { api } from './api';
import { Task, TaskStatus, Priority, PaginatedResponse, ApiResponse } from '../types';

export interface TaskFilters {
  page?: number;
  limit?: number;
  search?: string;
  projectId?: string;
  assigneeId?: string;
  status?: string;
  priority?: string;
  overdue?: boolean;
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
  projectId: string;
  assigneeId?: string | null;
  priority?: Priority;
  status?: TaskStatus;
  dueDate?: string | null;
  estimatedHours?: number | null;
}

export const tasksService = {
  async getTasks(params?: TaskFilters): Promise<PaginatedResponse<Task>> {
    const res = await api.get<PaginatedResponse<Task>>('/tasks', { params });
    return res.data;
  },

  async getTask(id: string): Promise<Task> {
    const res = await api.get<ApiResponse<Task>>(`/tasks/${id}`);
    return res.data.data;
  },

  async createTask(data: CreateTaskPayload): Promise<Task> {
    const res = await api.post<ApiResponse<Task>>('/tasks', data);
    return res.data.data;
  },

  async updateTask(id: string, data: Partial<CreateTaskPayload>): Promise<Task> {
    const res = await api.patch<ApiResponse<Task>>(`/tasks/${id}`, data);
    return res.data.data;
  },

  async updateStatus(id: string, status: TaskStatus): Promise<Task> {
    const res = await api.patch<ApiResponse<Task>>(`/tasks/${id}/status`, { status });
    return res.data.data;
  },

  async deleteTask(id: string): Promise<void> {
    await api.delete(`/tasks/${id}`);
  }
};
