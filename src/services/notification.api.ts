import { apiClient } from '@/services/axios';
import type { Notification } from '@/types';

export const notificationApi = {
    getNotifications: (page: number = 1, limit: number = 20): Promise<Notification[]> => {
        return apiClient
            .get('/notifications', { params: { page, limit } })
            .then((res) => res.data);
    },
    markAsRead: (id: string): Promise<void> => {
        return apiClient.put(`/notifications/${id}/read`).then((res) => res.data);
    },
    markAllAsRead: (): Promise<void> => {
        return apiClient.put('/notifications/read-all').then((res) => res.data);
    },
    getUnreadCount: (): Promise<number> => {
        return apiClient.get('/notifications/unread-count').then((res) => res.data);
    }
};
