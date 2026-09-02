import { api, setAccessToken } from './api';
import { User, ApiResponse } from '../types';

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role?: 'ADMIN' | 'MANAGER' | 'MEMBER';
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export const authService = {
  async register(data: RegisterPayload): Promise<AuthResponse> {
    const res = await api.post<ApiResponse<AuthResponse>>('/auth/register', data);
    setAccessToken(res.data.data.accessToken);
    return res.data.data;
  },

  async login(data: LoginPayload): Promise<AuthResponse> {
    const res = await api.post<ApiResponse<AuthResponse>>('/auth/login', data);
    setAccessToken(res.data.data.accessToken);
    return res.data.data;
  },

  async getCurrentUser(): Promise<User> {
    const res = await api.get<ApiResponse<User>>('/auth/me');
    return res.data.data;
  },

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } finally {
      setAccessToken(null);
    }
  }
};
