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
					likes: likesCount,
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
			(data: any) => updateSocialFeedLikeState(data as Connection<SocialPostApiItem> | undefined, response.postId, response.isLiked, response.likesCount),
		);
		queryClient.setQueriesData(
			{ queryKey: ['post', response.postId] },
			(data: SocialPostApiItem | undefined) => {
				if (!data) return data;
				return {
					...data,
					likesCount: response.likesCount,
					isLiked: response.isLiked,
				};
			}
		);
		queryClient.setQueriesData(
			{ queryKey: ['user-posts'] },
			(data: any) => {
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
			...queryClient.getQueriesData<Connection<SocialPostApiItem>>({ queryKey: ['socialPosts', currentUser?.id] }),
			...queryClient.getQueriesData<any>({ queryKey: ['user-posts', currentUser?.id] }),
			...queryClient.getQueriesData<any>({ queryKey: ['user-posts'] }),
			...queryClient.getQueriesData<any>({ queryKey: ['my-social-posts'] }),
		];

		for (const [queryKey, data] of cachedCollections) {
			const dataAny = data as any;
			if (!dataAny) continue;

			let foundNode = null;
			if (Array.isArray(dataAny.edges)) {
				const matchedEdge = dataAny.edges.find((edge: any) => edge.node?.id === postId);
				if (matchedEdge) foundNode = matchedEdge.node;
			} else if (Array.isArray(dataAny.pages)) {
				for (const page of dataAny.pages as any[]) {
					if (!page || !Array.isArray(page.edges)) continue;
					const matchedEdge = page.edges.find((edge: any) => edge.node?.id === postId);
					if (matchedEdge) {
						foundNode = matchedEdge.node;
						break;
					}
				}
			}

			if (foundNode) {
				console.log(`[Cache] Found post ${postId} in query:`, queryKey, {
					likes: foundNode.likesCount ?? foundNode.likes,
					isLiked: foundNode.isLiked
				});
				return foundNode;
			}
		}

		return undefined;
	};

	const likeMutation = useMutation({
		mutationFn: async ({ postId, isCurrentlyLiked }: { postId: string; isCurrentlyLiked: boolean }) => {
			const token = localStorage.getItem('access_token');
			if (!currentUser && !token) throw new Error('Not authenticated');

			console.log('[Like] Decided Action:', isCurrentlyLiked ? 'UNLIKE (DELETE)' : 'LIKE (POST)');
			return isCurrentlyLiked ? socialFeedApi.unlikePost(postId) : socialFeedApi.likePost(postId);
		},
		onMutate: async ({ postId, isCurrentlyLiked }) => {
			if (!currentUser) return;

			await queryClient.cancelQueries({ queryKey: ['socialPosts'] });
			await queryClient.cancelQueries({ queryKey: ['user-posts'] });

			const currentPost = findCachedPost(postId);
			const totalLikes = currentPost?.likesCount ?? currentPost?.likes ?? 0;

			const newLikesCount = isCurrentlyLiked
				? Math.max(0, totalLikes - 1)
				: totalLikes + 1;

			console.log('[Like] Optimistic Update:', { postId, isLiked: !isCurrentlyLiked, newLikesCount });

			updateSocialFeedLikeCollections({
				postId,
				isLiked: !isCurrentlyLiked,
				likesCount: newLikesCount
			});

			return { prevPost: currentPost };
		},
		onError: (err, variables, context) => {
			console.error('[Like] Mutation Error:', err);
			if (context?.prevPost) {
				updateSocialFeedLikeCollections({
					postId: variables.postId,
					isLiked: context.prevPost.isLiked,
					likesCount: context.prevPost.likesCount ?? context.prevPost.likes
				});
			}
		},
		onSuccess: (response) => {
			console.log('[Like] Server Success:', response);
			if (response.isLiked) {
				markPostLikedForUser(currentUser?.id, response.postId);
			} else {
				markPostUnlikedForUser(currentUser?.id, response.postId);
			}

			updateSocialFeedLikeCollections(response);
		},
	});

	const likePost = async (postId: string) => {
		const token = localStorage.getItem('access_token');
		console.log('[Like] Auth Check:', {
			hasUserInStore: !!currentUser,
			userId: currentUser?.id,
			hasTokenInStorage: !!token
		});

		if (!currentUser && !token) {
			console.warn('[Like] Aborted: No user and no token found.');
			return;
		}

		const currentPost = findCachedPost(postId);
		const totalLikes = currentPost?.likesCount ?? currentPost?.likes ?? 0;
		const isCurrentlyLiked = totalLikes > 0
			? (currentPost?.isLiked ?? isPostLikedForUser(currentUser?.id || 'unknown', postId) ?? false)
			: false;

		console.log('[Like] Triggering mutation...', { postId, isCurrentlyLiked });
		await likeMutation.mutateAsync({ postId, isCurrentlyLiked });
	};

	return {
		likePost,
		isLiking: likeMutation.isPending,
	};
};