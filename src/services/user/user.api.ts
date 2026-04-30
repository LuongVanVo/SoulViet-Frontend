import { apiClient } from '@/services/axios';
import type { UserProfile } from '@/types';
import { authApi } from '@/services';
import axios from 'axios';

function mapToProfile(data: Record<string, unknown>): UserProfile {
  const id = String(data.id ?? data.userId ?? data.email ?? 'user');
  const name = String(data.name ?? data.fullName ?? data.email ?? 'User');
  const avatarUrl = typeof data.avatarUrl === 'string' ? data.avatarUrl : undefined;
  const bio = typeof data.bio === 'string' ? data.bio : undefined;
  const followersCount = typeof data.followersCount === 'number' ? data.followersCount : 0;
  const followingCount = typeof data.followingCount === 'number' ? data.followingCount : 0;
  const postsCount = typeof data.postsCount === 'number' ? data.postsCount : 0;

  return { id, name, avatarUrl, bio, followersCount, followingCount, postsCount };
}

export const userApi = {
  async getCurrentUser(): Promise<UserProfile | null> {
    try {
      const data = (await authApi.getCurrentUser()) as unknown;
      if (!data || typeof data !== 'object') {
        return null;
      }

      return mapToProfile(data as Record<string, unknown>);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        return null;
      }
      throw error;
    }
  },

  async getUserProfileById(userId: string): Promise<UserProfile> {
    const res = await apiClient.get<UserProfile>(`/User/${userId}/profile`);
    return mapToProfile(res.data as unknown as Record<string, unknown>);
  },
};