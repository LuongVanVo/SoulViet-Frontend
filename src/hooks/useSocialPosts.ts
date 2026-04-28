import { useQuery } from '@tanstack/react-query';
import i18n from '@/config/i18n';
import { socialFeedApi } from '@/services';
import { useAuthStore } from '@/store';
import { useVibeTags } from './useVibeTags';
import type { GetSocialFeedParams, SocialPost } from '@/types';
import { mergeLikedStateForUser } from '@/utils/socialLikes';

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

const toSocialPost = (
	post: any,
	vibeTags: Map<number, string> = new Map(),
	currentUser?: { id: string; name: string; avatarUrl?: string } | null,
): SocialPost => {
	const vibeTag = post.vibeTag ?? post.VibeTag;
	const likesCount = post.likesCount ?? 0;
	const userId = post.userId || post.UserId;
	const authorName =
		post.authorName ||
		post.AuthorName ||
		post.displayName ||
		post.DisplayName ||
		post.name ||
		post.Name ||
		(currentUser?.id && currentUser.id === userId ? currentUser.name : undefined) ||
		`User ${(userId || '').slice(0, 8)}`;
	const avatarUrl =
		post.avatarUrl ||
		post.AvatarUrl ||
		(currentUser?.id && currentUser.id === userId ? currentUser.avatarUrl : undefined) ||
		`https://api.dicebear.com/8.x/initials/svg?seed=${userId}`;
	return {
		id: post.id || post.Id,
		userId,
		author: post.author || post.Author || authorName,
		avatar: post.avatar || post.Avatar || avatarUrl,
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
		isLiked: post.isLiked ?? post.IsLiked ?? false,
		rewardCoins: Math.max(1, likesCount),
		createdAt: post.createdAt || post.CreatedAt,
	};
};

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
		queryKey: ['socialPosts', requestParams.radiusKm, requestParams.sortBy, requestParams.first, requestParams.after ?? ''],
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