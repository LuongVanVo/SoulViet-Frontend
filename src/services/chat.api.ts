import apiClient from './api';
import type { Conversation, GetMessagesResponse } from '@/types/chat.types';

export const chatApi = {
    getConversations: async (): Promise<Conversation[]> => {
        const res = await apiClient.get<Conversation[]>('/conversations');
        return res.data;
    },

    getMessages: async (conversationId: string, before?: string, limit: number = 30): Promise<GetMessagesResponse> => {
        const params = new URLSearchParams();
        if (before) params.append('before', before);
        params.append('limit', limit.toString());

        const res = await apiClient.get<GetMessagesResponse>(`/conversations/${conversationId}/messages?${params.toString()}`);
        return res.data;
    },

    deleteMessage: async (messageId: string): Promise<void> => {
        await apiClient.delete(`/messages/${messageId}`);
    }
};
