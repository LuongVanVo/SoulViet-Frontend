import { create } from 'zustand';
import type { Notification } from '@/types';

export interface NotificationState {
    notifications: Notification[];
    unreadCount: number;
    
    setNotifications: (notifications: Notification[]) => void;
    addNotification: (notification: Notification) => void;
    setUnreadCount: (count: number) => void;
    markAsRead: (notificationId: string) => void;
    markAllAsRead: () => void;
    clearNotifications: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
    notifications: [],
    unreadCount: 0,

    setNotifications: (notifications) => set({ 
        notifications,
        unreadCount: notifications.filter(n => !n.isRead).length 
    }),

    addNotification: (notification) => set((state) => ({
        notifications: [notification, ...state.notifications],
        unreadCount: state.unreadCount + (notification.isRead ? 0 : 1)
    })),

    setUnreadCount: (unreadCount) => set({ unreadCount }),

    markAsRead: (notificationId) => set((state) => ({
        notifications: state.notifications.map((n) =>
            n.id === notificationId ? { ...n, isRead: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1)
    })),

    markAllAsRead: () => set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        unreadCount: 0
    })),

    clearNotifications: () => set({ notifications: [], unreadCount: 0 })
}));
