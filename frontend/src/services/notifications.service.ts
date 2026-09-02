import { api } from './api';
import { Notification, PaginatedResponse, ApiResponse } from '../types';

export const notificationsService = {
  async getNotifications(params?: { page?: number; limit?: number; isRead?: boolean }): Promise<PaginatedResponse<Notification>> {
    const res = await api.get<PaginatedResponse<Notification>>('/notifications', { params });
    return res.data;
  },

  async getUnreadCount(): Promise<number> {
    const res = await api.get<ApiResponse<{ unreadCount: number }>>('/notifications/unread-count');
    return res.data.data.unreadCount;
  },

  async markAsRead(id: string): Promise<Notification> {
    const res = await api.patch<ApiResponse<Notification>>(`/notifications/${id}/read`);
    return res.data.data;
  },

  async markAllAsRead(): Promise<void> {
    await api.post('/notifications/read-all');
  }
};
