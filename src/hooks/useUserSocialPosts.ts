import { useQuery } from '@tanstack/react-query';
import { apiService } from '@/services/mockData';

export const useUserSocialPosts = (userId?: string) => {
	return useQuery({
		queryKey: ['socialPosts', userId],
		queryFn: () => apiService.getUserSocialPosts(userId ?? ''),
		enabled: Boolean(userId),
		staleTime: 1000 * 60 * 5,
	});
};