import { useQuery } from '@tanstack/react-query';
import { homeService } from '@/services/home';

export const useHomeData = () => {
  return useQuery({
    queryKey: ['home-data'],
    queryFn: () => homeService.getHomeData(),
    staleTime: 1000 * 60 * 5
  });
};