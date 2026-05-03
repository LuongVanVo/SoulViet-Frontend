import { apiClient } from '@/services/axios';
import type { Connection, GetSocialFeedParams, LikePostResponse, SocialPostApiItem, PostLiker } from '@/types';

export const socialFeedApi = {
    getSocialFeed: (params: GetSocialFeedParams): Promise<Connection<SocialPostApiItem>> => {
        return apiClient
            .get<Connection<SocialPostApiItem>>('/Discovery', { params })
            .then((res) => res.data);
    },
    likePost: (postId: string): Promise<LikePostResponse> => {
        return apiClient
            .post<LikePostResponse>(`/Post/${postId}/likes`)
            .then((res) => res.data);
    },
    unlikePost: (postId: string): Promise<LikePostResponse> => {
        return apiClient
            .delete<LikePostResponse>(`/Post/${postId}/likes`)
            .then((res) => res.data);
    },
    getPostById: (postId: string): Promise<SocialPostApiItem> => {
        return apiClient
            .get<SocialPostApiItem>(`/Post/${postId}`)
            .then((res) => res.data);
    },
    getPostLikers: (postId: string, after?: string, first: number = 20): Promise<Connection<PostLiker>> => {
        return apiClient
            .get<Connection<PostLiker>>(`/Post/${postId}/likers`, { params: { after, first } })
            .then((res) => res.data);
    },
};