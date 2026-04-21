import { useQuery } from '@tanstack/react-query';
import { apiService } from '@/services/mockData';
import { useVibeTags } from './useVibeTags';
import type { SocialPost } from '@/types';

const mapVibeTag = (post: SocialPost, vibeTags: Map<number, string> = new Map()): SocialPost => ({
	...post,
	vibe: post.vibeTag ? vibeTags.get(post.vibeTag) ?? post.vibe : post.vibe,
});

export const useSocialPosts = () => {
	const { data: vibeTags = [] } = useVibeTags();
	const vibeTagMap = new Map(vibeTags.map((tag) => [tag.id, tag.name]));

	const query = useQuery({
		queryKey: ['socialPosts'],
		queryFn: apiService.getSocialPosts,
		staleTime: 1000 * 60 * 5,
	});

	return {
		...query,
		data: query.data?.map((post) => mapVibeTag(post, vibeTagMap)) ?? [],
	};
};