import { apiClient } from './axios';

export interface LoginPayload {
  username: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  fullName: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  accessToken?: string;
  access?: string;
  refresh?: string;
  message?: string;
}

export const authApi = {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    try {
      const res = await apiClient.post('/api/Auth/login', {
        username: payload.username,
        password: payload.password,
      });
      return res.data;
    } catch (error) {
      throw error;
    }
  },

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    try {
      const res = await apiClient.post('/api/Auth/register', {
        email: payload.email,
        fullName: payload.fullName,
        password: payload.password,
        confirmPassword: payload.confirmPassword,
      });
      return res.data;
    } catch (error) {
      throw error;
    }
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post('/api/Auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
  },

  async getCurrentUser() {
    try {
      const res = await apiClient.get('/api/Auth');
      return res.data;
    } catch (error) {
      throw error;
    }
  },

  async refreshToken(): Promise<string | null> {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) return null;

      const res = await apiClient.post('/api/Auth/refresh-token', {
        refreshToken,
      });

      const newAccessToken = res.data?.accessToken || res.data?.access;
      if (newAccessToken) {
        authApi.setToken(newAccessToken);
        return newAccessToken;
      }
      return null;
    } catch (error) {
      console.error('Refresh token error:', error);
      return null;
    }
  },

  getToken(): string | null {
    return localStorage.getItem('access_token');
  },

  setToken(token: string): void {
    localStorage.setItem('access_token', token);
  },

  setRefreshToken(token: string): void {
    localStorage.setItem('refresh_token', token);
  },
};
