import type { SocialPost } from '@/types';
import { getPostCheckinLocationId, getPostLocationName } from '@/utils/socialLocation';
import { formatSocialTime } from '@/utils/date';

export const extractMediaItems = (post: any): { url: string; type: 'image' | 'video'; objectKey: string; sortOrder?: number }[] => {
	const media = post.media || post.Media;
	if (media && media.length > 0) {
		const sortedMedia = [...media].sort(
			(a, b) => (a.sortOrder ?? a.SortOrder ?? 0) - (b.sortOrder ?? b.SortOrder ?? 0)
		);
		return sortedMedia
			.map((item: any) => {
				const url = item.url || item.Url || item.publicUrl || item.PublicUrl;
				const type = (item.mediaType === 2 || item.MediaType === 2 ? 'video' : 'image') as 'image' | 'video';
				const objectKey = item.objectKey || item.ObjectKey || '';
				const sortOrder = item.sortOrder ?? item.SortOrder;
				return { url, type, objectKey, sortOrder };
			})
			.filter((item: any) => Boolean(item.url));
	}

	const mediaUrls = post.mediaUrls || post.MediaUrls || [];
	return mediaUrls.map((url: string) => ({ url, type: 'image', objectKey: '' }));
};

export const toSocialPost = (
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
	const socialPost: SocialPost = {
		id: post.id || post.Id,
		userId,
		author: post.author || post.Author || authorName,
		avatar: post.avatar || post.Avatar || avatarUrl,
		timeAgo: formatSocialTime(post.createdAt || post.CreatedAt),
		location: getPostLocationName(post),
		checkinLocationId: getPostCheckinLocationId(post),
		vibe: vibeTag > 0 ? (vibeTags.get(vibeTag) ?? `Vibe #${vibeTag}`) : undefined,
		vibeTag: vibeTag,
		images: [],
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

	if (post.type === 'shared-post' || post.Type === 'shared-post' || post.originalPost || post.OriginalPost) {
		socialPost.type = 'shared-post';
		const originalPostData = post.originalPost || post.OriginalPost;
		if (originalPostData) {
			socialPost.originalPost = toSocialPost(originalPostData, vibeTags, currentUser);
		}

		socialPost.sharedByUser = post.sharedByUser || post.SharedByUser || {
			id: userId,
			name: authorName,
			avatar: avatarUrl
		};
		socialPost.sharedAt = socialPost.timeAgo;
	} else {
		socialPost.type = 'post';
	}

	return socialPost;
};
