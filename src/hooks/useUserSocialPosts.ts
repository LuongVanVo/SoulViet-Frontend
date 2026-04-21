import { useInfiniteQuery } from '@tanstack/react-query';
import i18n from '@/config/i18n';
import { postApi } from '@/services';
import { useVibeTags } from './useVibeTags';
import type { SocialPost, SocialPostApiItem } from '@/types';

const PAGE_SIZE = 10;

const formatTimeAgo = (createdAt: string) => {
	const createdTime = new Date(createdAt).getTime();
	if (Number.isNaN(createdTime)) {
		return createdAt;
	}

	const diffInSeconds = Math.max(0, Math.floor((Date.now() - createdTime) / 1000));
	if (diffInSeconds < 60) return i18n.t('profile.user.posts.timeAgo.justNow');

	const diffInMinutes = Math.floor(diffInSeconds / 60);
	if (diffInMinutes < 60) return i18n.t('profile.user.posts.timeAgo.minutesAgo', { count: diffInMinutes });

	const diffInHours = Math.floor(diffInMinutes / 60);
	if (diffInHours < 24) return i18n.t('profile.user.posts.timeAgo.hoursAgo', { count: diffInHours });

	const diffInDays = Math.floor(diffInHours / 24);
	return i18n.t('profile.user.posts.timeAgo.daysAgo', { count: diffInDays });
};

const toSocialPost = (post: SocialPostApiItem, vibeTags: Map<number, string> = new Map()): SocialPost => ({
	id: post.id,
	userId: post.userId,
	author: `User ${post.userId.slice(0, 8)}`,
	avatar: `https://api.dicebear.com/8.x/initials/svg?seed=${post.userId}`,
	timeAgo: formatTimeAgo(post.createdAt),
	location: 'Viet Nam',
	vibe: vibeTags.get(post.vibeTag) ?? `Vibe #${post.vibeTag}`,
	vibeTag: post.vibeTag,
	images: post.mediaUrls,
	caption: post.content,
	likes: post.likesCount,
	comments: post.commentsCount,
	shares: post.sharesCount,
	rewardCoins: Math.max(1, post.likesCount),
	createdAt: post.createdAt,
});

export const useUserSocialPosts = (userId: string) => {
	const { data: vibeTags = [] } = useVibeTags();
	const vibeTagMap = new Map(vibeTags.map((tag) => [tag.id, tag.name]));

	const query = useInfiniteQuery({
		queryKey: ['user-posts', userId],
		queryFn: ({ pageParam }) =>
			postApi.getUserPosts({
				userId,
				after: pageParam,
				first: PAGE_SIZE,
			}),
		initialPageParam: undefined as string | undefined,
		getNextPageParam: (lastPage) =>
			lastPage.pageInfo.hasNextPage ? (lastPage.pageInfo.endCursor ?? undefined) : undefined,
		enabled: Boolean(userId),
	});

	const posts =
		query.data?.pages.flatMap((page) =>
			page.edges.map((edge) => toSocialPost(edge.node, vibeTagMap))
		) ?? [];

	return {
		...query,
		posts,
	};
};
