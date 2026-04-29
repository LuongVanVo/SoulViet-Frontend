import { apiClient } from '@/services/axios';
import type { 
    CommentConnection, 
    CreateCommentPayload, 
    PostComment, 
    UpdateCommentPayload 
} from '@/types';

export const commentApi = {
    getPostComments: (postId: string, params?: any): Promise<CommentConnection> => {
        return apiClient
            .get<CommentConnection>(`/PostComment/post/${postId}`, { params })
            .then((res) => res.data);
    },
    createComment: (payload: CreateCommentPayload): Promise<PostComment> => {
        console.log('[API] Creating comment with payload:', payload);
        return apiClient
            .post<PostComment>('/PostComment', payload)
            .then((res) => {
                console.log('[API] Create comment response:', res.data);
                return res.data;
            });
    },
    updateComment: (id: string, payload: UpdateCommentPayload): Promise<PostComment> => {
        return apiClient
            .put<PostComment>(`/PostComment/${id}`, payload)
            .then((res) => res.data);
    },
    deleteComment: (id: string): Promise<void> => {
        return apiClient
            .delete(`/PostComment/${id}`)
            .then((res) => res.data);
    },
    getCommentReplies: (commentId: string, params?: any): Promise<CommentConnection> => {
        return apiClient
            .get<CommentConnection>(`/comments/${commentId}/replies`, { params })
            .then((res) => res.data);
    },
    getCommentStreamUrl: (postId: string): string => {
        const baseUrl = apiClient.defaults.baseURL || '';
        const url = `/PostComment/stream`;
        const token = localStorage.getItem('access_token');
        
        let fullUrl = baseUrl.startsWith('http') 
            ? `${baseUrl}${url}` 
            : `${window.location.origin}${baseUrl}${url}`;
            
        fullUrl += `?postId=${postId}`;
        if (token) {
            fullUrl += `&token=${token}`;
        }
        
        return fullUrl;
    },
};
