import { apiClient } from '@/services';

export interface LoginPayload {
  email: string;
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
  token?: string;
  refreshToken?: string;
  refresh?: string;
  message?: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  email: string;
  token: string;
  password: string;
  confirmPassword: string;
}

export interface CurrentUserResponse {
  id?: string;
  userId?: string;
  name?: string;
  fullName?: string;
  email?: string;
  avatarUrl?: string;
  soulCoinBalance?: number;
  SoulCoinBalance?: number;
}

export const authApi = {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    try {
      const res = await apiClient.post('/Auth/login', {
        email: payload.email,
        password: payload.password,
      });
      return res.data;
    } catch (error) {
      throw error;
    }
  },

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    try {
      const res = await apiClient.post('/Auth/register', {
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
      await apiClient.post('/Auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      authApi.clearTokens();
    }
  },

  async getCurrentUser(): Promise<CurrentUserResponse> {
    try {
      const res = await apiClient.get('/Auth');
      return res.data;
    } catch (error) {
      throw error;
    }
  },

  async confirmEmail(token: string, email?: string): Promise<AuthResponse> {
    const params = new URLSearchParams({ token });
    if (email) {
      params.set('email', email);
    }

    const res = await apiClient.get(`/Auth/confirm-email?${params.toString()}`);
    return res.data;
  },

  async forgotPassword(payload: ForgotPasswordPayload): Promise<AuthResponse> {
    const res = await apiClient.post('/Auth/forgot-password', payload);
    return res.data;
  },

  async resetPassword(payload: ResetPasswordPayload): Promise<AuthResponse> {
    const res = await apiClient.post('/Auth/reset-password', payload);
    return res.data;
  },

  async refreshToken(): Promise<string | null> {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      const body = refreshToken ? { refreshToken } : {};
      const res = await apiClient.post('/Auth/refresh-token', body);

      const newAccessToken = res.data?.accessToken || res.data?.access || res.data?.token;
      if (newAccessToken) {
        authApi.setToken(newAccessToken);

        const newRefreshToken = res.data?.refreshToken || res.data?.refresh;
        if (newRefreshToken) {
          authApi.setRefreshToken(newRefreshToken);
        }

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

  clearTokens(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },
};
