import { apiClient } from '@/services';
import type { VibeTag } from '@/types';

export const vibeApi = {
  getVibeTags(): Promise<VibeTag[]> {
    return apiClient.get('/vibe-tags').then((res) => res.data);
  },
};