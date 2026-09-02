import { api } from './api';
import { Document, PaginatedResponse, ApiResponse } from '../types';

export const documentsService = {
  async getDocuments(params?: { page?: number; limit?: number; clientId?: string; projectId?: string; search?: string }): Promise<PaginatedResponse<Document>> {
    const res = await api.get<PaginatedResponse<Document>>('/documents', { params });
    return res.data;
  },

  async upload(formData: FormData): Promise<Document> {
    const res = await api.post<ApiResponse<Document>>('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data.data;
  },

  async deleteDocument(id: string): Promise<void> {
    await api.delete(`/documents/${id}`);
  },

  getDownloadUrl(id: string): string {
    return `/api/documents/${id}/download`;
  }
};
