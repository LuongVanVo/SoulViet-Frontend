import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/axios';
import { useAuthStore } from '@/store';
import type { Connection, SocialPostApiItem } from '@/types';
import { markPostLikedForUser, markPostUnlikedForUser } from '@/utils/socialLikes';

type SocialPostLikeStreamPayload = {
	success?: boolean;
	isLiked?: boolean;
	likesCount?: number;
	postId?: string;
	actorUserId?: string; 
	actorId?: string;
	userId?: string;
};

const updateSocialFeedLikeState = (
	data: Connection<SocialPostApiItem> | undefined,
	postId: string,
	isLiked: boolean | undefined,
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

				const nextIsLiked = typeof isLiked === 'boolean' ? isLiked : edge.node.isLiked;

			return {
				...edge,
				node: {
					...edge.node,
					likesCount,
						...(typeof nextIsLiked === 'boolean' ? { isLiked: nextIsLiked } : {}),
				},
			};
		}),
	};
};

const getSocialPostLikeStreamUrl = (postId: string) => {
	return apiClient.getUri({ url: `/posts/${postId}/likes/stream` });
};

const parseSseEventBlock = (block: string) => {
	const lines = block.split(/\r?\n/);
	let eventName = 'message';
	const dataLines: string[] = [];
	let id: string | undefined;

	for (const line of lines) {
		if (!line || line.startsWith(':')) {
			continue;
		}

		const separatorIndex = line.indexOf(':');
		const field = separatorIndex === -1 ? line : line.slice(0, separatorIndex);
		const value = separatorIndex === -1 ? '' : line.slice(separatorIndex + 1).replace(/^ /, '');

		if (field === 'event') {
			eventName = value;
			continue;
		}

		if (field === 'data') {
			dataLines.push(value);
			continue;
		}

		if (field === 'id') {
			id = value;
		}
	}

	return {
		eventName,
		id,
		data: dataLines.join('\n'),
	};
};

export const useSocialPostLikesStream = (postId?: string) => {
	const queryClient = useQueryClient();
	const currentUser = useAuthStore((state) => state.user);

	useEffect(() => {
		if (!postId) {
			return undefined;
		}

		const abortController = new AbortController();
		let closed = false;

		const connect = async () => {
			try {
				const token = typeof window !== 'undefined' ? window.localStorage.getItem('access_token') : null;
				const response = await fetch(getSocialPostLikeStreamUrl(postId), {
					method: 'GET',
					headers: {
						Accept: 'text/event-stream',
						...(token ? { Authorization: `Bearer ${token}` } : {}),
					},
					signal: abortController.signal,
				});

				if (!response.ok || !response.body) {
					return;
				}

				const reader = response.body.getReader();
				const decoder = new TextDecoder();
				let buffer = '';

				while (!closed) {
					const { done, value } = await reader.read();
					if (done) {
						break;
					}

					buffer += decoder.decode(value, { stream: true });

					const blocks = buffer.split(/\r?\n\r?\n/);
					buffer = blocks.pop() ?? '';

					for (const block of blocks) {
						const trimmedBlock = block.trim();
						if (!trimmedBlock) {
							continue;
						}

						const parsedEvent = parseSseEventBlock(trimmedBlock);
						if (!parsedEvent.data) {
							continue;
						}

						let payload: SocialPostLikeStreamPayload;
						try {
							payload = JSON.parse(parsedEvent.data) as SocialPostLikeStreamPayload;
						} catch {
							continue;
						}

						const resolvedPostId = payload.postId ?? postId;
						const likesCount = payload.likesCount;
						if (!resolvedPostId || typeof likesCount !== 'number') {
							continue;
						}

						const resolvedIsLiked = payload.isLiked;
						const hasExplicitLikeState = typeof resolvedIsLiked === 'boolean';
						if (likesCount === 0 && !hasExplicitLikeState) {
							continue;
						}
						const resolvedActorId = payload.actorUserId ?? payload.actorId ?? payload.userId;

						const applyIsLikedToThisUser =
							hasExplicitLikeState &&
							Boolean(resolvedActorId) &&
							Boolean(currentUser?.id) &&
							resolvedActorId === currentUser?.id;

						if (applyIsLikedToThisUser) {
							if (resolvedIsLiked) {
								markPostLikedForUser(currentUser?.id, resolvedPostId);
							} else {
								markPostUnlikedForUser(currentUser?.id, resolvedPostId);
							}
						}

						const isLikedForCache = applyIsLikedToThisUser ? resolvedIsLiked : undefined;

						// Before applying, read previous cached likes to detect suspicious totals
						const cachedPost = (() => {
							const entries = [
								...queryClient.getQueriesData<Connection<SocialPostApiItem>>({ queryKey: ['socialPosts'] }),
								...queryClient.getQueriesData<any>({ queryKey: ['user-posts'] }),
							];
							for (const [, d] of entries) {
								const dataAny = d as any;
								if (!dataAny) continue;
								if (Array.isArray(dataAny.edges)) {
									const m = dataAny.edges.find((e: any) => e.node?.id === resolvedPostId);
									if (m) return m.node as SocialPostApiItem;
								}
								if (Array.isArray(dataAny.pages)) {
									for (const p of dataAny.pages as any[]) {
										if (!p || !Array.isArray(p.edges)) continue;
										const m = p.edges.find((e: any) => e.node?.id === resolvedPostId);
										if (m) return m.node as SocialPostApiItem;
									}
								}
							}
							return undefined;
						})();

						queryClient.setQueriesData(
							{ queryKey: ['socialPosts'] },
							(data) => updateSocialFeedLikeState(data as Connection<SocialPostApiItem> | undefined, resolvedPostId, isLikedForCache, likesCount),
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
									pages: pages.map((page) => updateSocialFeedLikeState(page, resolvedPostId, isLikedForCache, likesCount)),
								};
							},
						);

						// If server reports isLiked=true but likes count===0 while cache had >0, refetch authoritative data
						const cachedPostLikes = cachedPost ? cachedPost.likesCount : undefined;
							if (likesCount === 0 && resolvedIsLiked && typeof cachedPostLikes === 'number' && cachedPostLikes > 0) {
							queryClient.invalidateQueries({ queryKey: ['socialPosts'] });
						}
					}
				}
			} catch (error) {
				if (!(error instanceof DOMException && error.name === 'AbortError')) {
					console.error('Failed to subscribe to like stream', error);
				}
			}
		};

		void connect();

		return () => {
			closed = true;
			abortController.abort();
		};
	}, [currentUser?.id, postId, queryClient]);
};