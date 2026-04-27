import { apiClient } from '@/services/axios';
import type { Connection, CreatePostPayload, GetUserPostsParams, SocialPostApiItem } from '@/types';

export const postApi = {
	getSocialPosts: (): Promise<SocialPostApiItem[]> => {
		return apiClient
			.get('/Post')
			.then((res) => res.data as SocialPostApiItem[]);
	},
	getUserPosts: (params: GetUserPostsParams): Promise<Connection<SocialPostApiItem>> => {
		const { userId, ...queryParams } = params;
		return apiClient
			.get(`/Post/user/${userId}`, { params: queryParams })
			.then((res) => res.data);
	},
	createPost(payload: CreatePostPayload): Promise<SocialPostApiItem> {
		return apiClient.post('/Post', payload).then((res) => res.data);
	},
	updatePost: (id: string, payload: Partial<CreatePostPayload>) => {
		return apiClient.put(`/Post/${id}`, payload).then((res) => res.data);
	},
	deletePost: (id: string) => {
		return apiClient.delete(`/Post/${id}`).then((res) => res.data);
	},
};