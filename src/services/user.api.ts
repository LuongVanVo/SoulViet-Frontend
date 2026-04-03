import { apiClient } from './axios';
import axios from 'axios';
import type { UserProfile } from '../types';

export const userApi = {
  async getCurrentUser(): Promise<UserProfile | null> {
    try {
      const res = await apiClient.get('/auth/me');
      return res.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        return null;
      }
      throw error;
    }
  },
};