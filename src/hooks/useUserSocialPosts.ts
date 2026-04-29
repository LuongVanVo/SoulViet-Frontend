import { useInfiniteQuery } from '@tanstack/react-query';
import { postApi } from '@/services';
import { useAuthStore } from '@/store';
import { useVibeTags } from './useVibeTags';
import type { SocialPost } from '@/types';
import { mergeLikedStateForUser } from '@/utils/socialLikes';
import { getPostCheckinLocationId, getPostLocationName } from '@/utils/socialLocation';
import { formatSocialTime } from '@/utils/date';

const PAGE_SIZE = 10;



const extractMediaItems = (post: any): { url: string; type: 'image' | 'video'; objectKey: string; sortOrder?: number }[] => {
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
		userId: userId,
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
};

export const useUserSocialPosts = (userId: string) => {
	const currentUser = useAuthStore((state) => state.user);
	const { data: vibeTags = [] } = useVibeTags();
	const vibeTagMap = new Map(vibeTags.map((tag) => [tag.id, tag.name]));

	const query = useInfiniteQuery({
		queryKey: ['user-posts', userId, currentUser?.id],
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
		mergeLikedStateForUser(
			query.data?.pages.flatMap((page) =>
				page.edges.map((edge) => toSocialPost(edge.node, vibeTagMap, currentUser))
			) ?? [],
			currentUser?.id,
		) ?? [];

	return {
		...query,
		posts,
	};
};
