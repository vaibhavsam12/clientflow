import { api } from './api';
import { Client, ClientContact, PaginatedResponse, ApiResponse } from '../types';

export interface ClientFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateClientPayload {
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  status?: string;
  notes?: string;
}

export interface CreateContactPayload {
  name: string;
  email: string;
  phone?: string;
  title?: string;
  isPrimary?: boolean;
}

export const clientsService = {
  async getClients(params?: ClientFilters): Promise<PaginatedResponse<Client>> {
    const res = await api.get<PaginatedResponse<Client>>('/clients', { params });
    return res.data;
  },

  async getClient(id: string): Promise<Client> {
    const res = await api.get<ApiResponse<Client>>(`/clients/${id}`);
    return res.data.data;
  },

  async createClient(data: CreateClientPayload): Promise<Client> {
    const res = await api.post<ApiResponse<Client>>('/clients', data);
    return res.data.data;
  },

  async updateClient(id: string, data: Partial<CreateClientPayload>): Promise<Client> {
    const res = await api.patch<ApiResponse<Client>>(`/clients/${id}`, data);
    return res.data.data;
  },

  async archiveClient(id: string): Promise<Client> {
    const res = await api.delete<ApiResponse<Client>>(`/clients/${id}`);
    return res.data.data;
  },

  async addContact(clientId: string, data: CreateContactPayload): Promise<ClientContact> {
    const res = await api.post<ApiResponse<ClientContact>>(`/clients/${clientId}/contacts`, data);
    return res.data.data;
  },

  async deleteContact(clientId: string, contactId: string): Promise<void> {
    await api.delete(`/clients/${clientId}/contacts/${contactId}`);
  }
};
