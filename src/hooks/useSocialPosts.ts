import { useQuery } from '@tanstack/react-query';
import { postApi } from '@/services';
import { useVibeTags } from './useVibeTags';
import type { SocialPost } from '@/types';

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
		author: post.author || `User ${(post.userId || post.UserId || '').slice(0, 8)}`,
		avatar: post.avatar || `https://api.dicebear.com/8.x/initials/svg?seed=${post.userId || post.UserId}`,
		timeAgo: post.createdAt || post.CreatedAt, // useSocialPosts might use a different time format
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

export const useSocialPosts = () => {
	const { data: vibeTags = [] } = useVibeTags();
	const vibeTagMap = new Map(vibeTags.map((tag) => [tag.id, tag.name]));

	const query = useQuery({
		queryKey: ['socialPosts'],
		queryFn: () => postApi.getSocialPosts(),
		staleTime: 1000 * 60 * 5,
	});

	return {
		...query,
		data: query.data?.map((post) => toSocialPost(post, vibeTagMap)) ?? [],
	};
};