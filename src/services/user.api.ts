import axios from 'axios';
import type { UserProfile } from '../types';
import { authApi } from './auth.api';

function mapCurrentUserToProfile(data: Record<string, unknown>): UserProfile {
  const id = String(data.id ?? data.userId ?? data.email ?? 'user');
  const name = String(data.name ?? data.fullName ?? data.email ?? 'User');
  const avatarUrl = typeof data.avatarUrl === 'string' ? data.avatarUrl : undefined;

  return { id, name, avatarUrl };
}

export const userApi = {
  async getCurrentUser(): Promise<UserProfile | null> {
    try {
      const data = (await authApi.getCurrentUser()) as unknown;
      if (!data || typeof data !== 'object') {
        return null;
      }

      return mapCurrentUserToProfile(data as Record<string, unknown>);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        return null;
      }
      throw error;
    }
  },
};