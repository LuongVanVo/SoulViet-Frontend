import { apiClient } from '@/services';
import type { TouristAttractionsSectionData } from '@/types';

export const touristApi = {
  async getTouristAttractions(
    params?: { tagId?: string; page?: number; limit?: number }
  ): Promise<TouristAttractionsSectionData> {
    try {
      const res = await apiClient.get('/tourist-attractions', { params });
      return res.data;
    } catch {
      try {
        const res = await apiClient.get('/TouristAttractions', { params });
        return res.data;
      } catch {
        return { items: [] };
      }
    }
  },
};