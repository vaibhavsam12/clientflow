import { api } from './api';
import { Project, ProjectMember, PaginatedResponse, ApiResponse } from '../types';

export interface ProjectFilters {
  page?: number;
  limit?: number;
  search?: string;
  clientId?: string;
  status?: string;
  priority?: string;
}

export interface CreateProjectPayload {
  name: string;
  description?: string;
  clientId: string;
  status?: string;
  priority?: string;
  startDate?: string | null;
  targetEndDate?: string | null;
  budget?: number | null;
  memberIds?: string[];
}

export const projectsService = {
  async getProjects(params?: ProjectFilters): Promise<PaginatedResponse<Project>> {
    const res = await api.get<PaginatedResponse<Project>>('/projects', { params });
    return res.data;
  },

  async getProject(id: string): Promise<Project> {
    const res = await api.get<ApiResponse<Project>>(`/projects/${id}`);
    return res.data.data;
  },

  async createProject(data: CreateProjectPayload): Promise<Project> {
    const res = await api.post<ApiResponse<Project>>('/projects', data);
    return res.data.data;
  },

  async updateProject(id: string, data: Partial<CreateProjectPayload>): Promise<Project> {
    const res = await api.patch<ApiResponse<Project>>(`/projects/${id}`, data);
    return res.data.data;
  },

  async archiveProject(id: string): Promise<Project> {
    const res = await api.delete<ApiResponse<Project>>(`/projects/${id}`);
    return res.data.data;
  },

  async addMember(projectId: string, userId: string, role: string): Promise<ProjectMember> {
    const res = await api.post<ApiResponse<ProjectMember>>(`/projects/${projectId}/members`, { userId, role });
    return res.data.data;
  },

  async removeMember(projectId: string, userId: string): Promise<void> {
    await api.delete(`/projects/${projectId}/members/${userId}`);
  }
};
