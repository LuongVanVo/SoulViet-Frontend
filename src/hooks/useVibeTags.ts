import { useQuery } from '@tanstack/react-query';
import { apiService } from '@/services/mockData';
import type { VibeTag } from '@/types';


export const useVibeTags = () => {
    return useQuery<VibeTag[]>({
        queryKey: ['vibeTags'],
        queryFn: apiService.getVibeTags,
        staleTime: 1000 * 60 * 5,
    });
};