import { api } from './api';
import { User, PaginatedResponse, ApiResponse } from '../types';

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  role: 'ADMIN' | 'MANAGER' | 'MEMBER';
  avatarUrl?: string;
}

export const usersService = {
  async getUsers(params?: { page?: number; limit?: number; search?: string; role?: string }): Promise<PaginatedResponse<User>> {
    const res = await api.get<PaginatedResponse<User>>('/users', { params });
    return res.data;
  },

  async getUser(id: string): Promise<User> {
    const res = await api.get<ApiResponse<User>>(`/users/${id}`);
    return res.data.data;
  },

  async createUser(data: CreateUserPayload): Promise<User> {
    const res = await api.post<ApiResponse<User>>('/users', data);
    return res.data.data;
  },

  async updateUser(id: string, data: Partial<CreateUserPayload & { isActive: boolean }>): Promise<User> {
    const res = await api.patch<ApiResponse<User>>(`/users/${id}`, data);
    return res.data.data;
  }
};
