import { useInfiniteQuery } from '@tanstack/react-query';
import i18n from '@/config/i18n';
import { postApi } from '@/services';
import { useVibeTags } from './useVibeTags';
import type { SocialPost } from '@/types';

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

const extractMediaItems = (post: any): { url: string; type: 'image' | 'video'; objectKey: string }[] => {
	const media = post.media || post.Media;
	if (media && media.length > 0) {
		return media.map((item: any) => {
			const url = item.url || item.Url || item.publicUrl || item.PublicUrl;
			const type = (item.mediaType === 2 || item.MediaType === 2) ? 'video' : 'image';
			const objectKey = item.objectKey || item.ObjectKey || '';
			return { url, type, objectKey };
		}).filter((item: any) => Boolean(item.url));
	}

	const mediaUrls = post.mediaUrls || post.MediaUrls || [];
	return mediaUrls.map((url: string) => ({ url, type: 'image', objectKey: '' }));
};

const toSocialPost = (post: any, vibeTags: Map<number, string> = new Map()): SocialPost => {
	const vibeTag = post.vibeTag ?? post.VibeTag;
	const likesCount = post.likesCount ?? post.LikesCount ?? 0;
	return {
		id: post.id || post.Id,
		userId: post.userId || post.UserId,
		author: `User ${(post.userId || post.UserId || '').slice(0, 8)}`,
		avatar: `https://api.dicebear.com/8.x/initials/svg?seed=${post.userId || post.UserId}`,
		timeAgo: formatTimeAgo(post.createdAt || post.CreatedAt),
		location: post.checkinLocationName || post.CheckinLocationName,
		checkinLocationId: post.checkinLocationId || post.CheckinLocationId,
		vibe: vibeTag > 0 ? (vibeTags.get(vibeTag) ?? `Vibe #${vibeTag}`) : undefined,
		vibeTag: vibeTag,
		images: [], // Kept for type safety
		media: extractMediaItems(post),
		aspectRatio: post.aspectRatio || post.AspectRatio || 'square',
		caption: post.content ?? post.Content,
		likes: likesCount,
		comments: post.commentsCount ?? post.CommentsCount ?? 0,
		shares: post.sharesCount ?? post.SharesCount ?? 0,
		rewardCoins: Math.max(1, likesCount),
		createdAt: post.createdAt || post.CreatedAt,
	};
};

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
