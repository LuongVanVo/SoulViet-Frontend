import { useMutation, useQueryClient } from '@tanstack/react-query';
import { socialFeedApi } from '@/services';
import { useAuthStore } from '@/store';
import type { Connection, SocialPostApiItem } from '@/types';
import { isPostLikedForUser, markPostLikedForUser, markPostUnlikedForUser } from '@/utils/socialLikes';

const updateSocialFeedLikeState = (
	data: Connection<SocialPostApiItem> | undefined,
	postId: string,
	isLiked: boolean,
	likesCount: number,
) => {
	if (!data) {
		return data;
	}

	return {
		...data,
		edges: data.edges.map((edge) => {
			if (edge.node.id !== postId) {
				return edge;
			}

			return {
				...edge,
				node: {
					...edge.node,
					likesCount,
					isLiked,
				},
			};
		}),
	};
};

export const useSocialPostActions = () => {
	const queryClient = useQueryClient();
	const currentUser = useAuthStore((state) => state.user);

	const updateSocialFeedLikeCollections = (response: { postId: string; isLiked: boolean; likesCount: number }) => {
		queryClient.setQueriesData(
			{ queryKey: ['socialPosts'] },
			(data) => updateSocialFeedLikeState(data as Connection<SocialPostApiItem> | undefined, response.postId, response.isLiked, response.likesCount),
		);
		queryClient.setQueriesData(
			{ queryKey: ['user-posts'] },
			(data) => {
				if (!data) return data;
				const dataAny = data as any;
				const pages = (dataAny.pages as Array<Connection<SocialPostApiItem>> | undefined) ?? undefined;
				if (!pages) return data;

				return {
					...data,
					pages: pages.map((page) => updateSocialFeedLikeState(page, response.postId, response.isLiked, response.likesCount)),
				};
			},
		);
	};

	const findCachedPost = (postId: string) => {
		const cachedCollections = [
			...queryClient.getQueriesData<Connection<SocialPostApiItem>>({ queryKey: ['socialPosts'] }),
			...queryClient.getQueriesData<any>({ queryKey: ['user-posts'] }),
		];

		for (const [, data] of cachedCollections) {
			const dataAny = data as any;
			if (!dataAny) {
				continue;
			}

			if (Array.isArray(dataAny.edges)) {
				const matchedEdge = dataAny.edges.find((edge: any) => edge.node?.id === postId);
				if (matchedEdge) {
					return matchedEdge.node;
				}
			}

			if (Array.isArray(dataAny.pages)) {
				for (const page of dataAny.pages as any[]) {
					if (!page || !Array.isArray(page.edges)) {
						continue;
					}

					const matchedEdge = page.edges.find((edge: any) => edge.node?.id === postId);
					if (matchedEdge) {
						return matchedEdge.node;
					}
				}
			}
		}

		return undefined;
	};

	const likeMutation = useMutation({
		mutationFn: async (postId: string) => {
			const currentPost = findCachedPost(postId);
			const isCurrentlyLiked = currentPost?.isLiked ?? isPostLikedForUser(currentUser?.id, postId);
			return isCurrentlyLiked ? socialFeedApi.unlikePost(postId) : socialFeedApi.likePost(postId);
		},
		onSuccess: async (response) => {
			const prevPost = findCachedPost(response.postId);
			const prevLikes = prevPost ? prevPost.likesCount : undefined;

			if (response.isLiked) {
				markPostLikedForUser(currentUser?.id, response.postId);
			} else {
				markPostUnlikedForUser(currentUser?.id, response.postId);
			}

			updateSocialFeedLikeCollections(response);

			if (response.likesCount === 0 && response.isLiked && typeof prevLikes === 'number' && prevLikes > 0) {
				queryClient.invalidateQueries({ queryKey: ['socialPosts'] });
			}
		},
	});

	const likePost = async (postId: string) => {
		await likeMutation.mutateAsync(postId);
	};

	return {
		likePost,
		isLiking: likeMutation.isPending,
	};
};