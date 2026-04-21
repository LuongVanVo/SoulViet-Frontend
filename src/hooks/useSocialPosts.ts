import { useQuery } from '@tanstack/react-query';
import { apiService } from '@/services/mockData';

export const useSocialPosts = () => {
	return useQuery({
		queryKey: ['socialPosts'],
		queryFn: apiService.getSocialPosts,
		staleTime: 1000 * 60 * 5,
	});
};