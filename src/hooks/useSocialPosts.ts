import { useQuery } from '@tanstack/react-query';
import { socialFeedApi } from '@/services';
import { useAuthStore } from '@/store';
import { useVibeTags } from './useVibeTags';
import type { GetSocialFeedParams } from '@/types';
import { mergeLikedStateForUser } from '@/utils/socialLikes';

import { toSocialPost } from '@/utils/socialMapper';

export const useSocialPosts = (params: GetSocialFeedParams = {}) => {
	const currentUser = useAuthStore((state) => state.user);
	const { data: vibeTags = [] } = useVibeTags();
	const vibeTagMap = new Map(vibeTags.map((tag) => [tag.id, tag.name]));
	const requestParams: GetSocialFeedParams = {
		radiusKm: 10,
		sortBy: 'trending',
		first: 10,
		...params,
	};

	const query = useQuery({
		queryKey: ['socialPosts', currentUser?.id, requestParams.radiusKm, requestParams.sortBy, requestParams.first, requestParams.after ?? ''],
		queryFn: () => socialFeedApi.getSocialFeed(requestParams),
		staleTime: 1000 * 60 * 5,
	});

	return {
		...query,
		data: mergeLikedStateForUser(
			query.data?.edges.map((edge) => toSocialPost(edge.node, vibeTagMap, currentUser)) ?? [],
			currentUser?.id,
		),
	};
};