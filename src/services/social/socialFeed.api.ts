import { apiClient } from '@/services/axios';
import type { Connection, GetSocialFeedParams, LikePostResponse, SocialPostApiItem } from '@/types';

export const socialFeedApi = {
    getSocialFeed: (params: GetSocialFeedParams): Promise<Connection<SocialPostApiItem>> => {
        return apiClient
            .get<Connection<SocialPostApiItem>>('/Discovery', { params })
            .then((res) => res.data);
    },
    likePost: (postId: string): Promise<LikePostResponse> => {
        return apiClient
            .post<LikePostResponse>(`/posts/${postId}/likes`)
            .then((res) => res.data);
    },
    unlikePost: (postId: string): Promise<LikePostResponse> => {
        return apiClient
            .delete<LikePostResponse>(`/posts/${postId}/likes`)
            .then((res) => res.data);
    },
    getPostById: (postId: string): Promise<SocialPostApiItem> => {
        return apiClient
            .get<SocialPostApiItem>(`/Post/${postId}`)
            .then((res) => res.data);
    },
};