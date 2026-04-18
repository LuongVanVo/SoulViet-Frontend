import { apiClient } from '@/services';
import type { TouristAttractionsSectionData } from '@/types';

export const touristApi = {
  getTouristAttractions(
    params?: { tagId?: string; page?: number; limit?: number }
  ): Promise<TouristAttractionsSectionData> {
    return apiClient
      .get('/tourist-attractions', { params })
      .then((res) => res.data);
  },
};