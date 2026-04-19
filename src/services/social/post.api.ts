import { apiClient } from '@/services/axios';
import type { CreatePostPayload, SocialPostApiItem } from '@/types';

export const postApi = {
	createPost(payload: CreatePostPayload): Promise<SocialPostApiItem> {
		return apiClient.post('/Post', payload).then((res) => res.data);
	},
};