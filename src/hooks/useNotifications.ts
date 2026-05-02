import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationApi } from '@/services';
import { useNotificationStore } from '@/store';
import { useEffect, useMemo } from 'react';

export const useNotifications = () => {
    const queryClient = useQueryClient();
    const storeNotifications = useNotificationStore((state) => state.notifications);
    const unreadCount = useNotificationStore((state) => state.unreadCount);
    const setNotifications = useNotificationStore((state) => state.setNotifications);
    const setUnreadCount = useNotificationStore((state) => state.setUnreadCount);

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        refetch
    } = useInfiniteQuery({
        queryKey: ['notifications'],
        queryFn: ({ pageParam = 1 }) => notificationApi.getNotifications(pageParam as number, 20),
        initialPageParam: 1,
        getNextPageParam: (lastPage, allPages) => {
            return lastPage.length === 20 ? allPages.length + 1 : undefined;
        },
    });

    const apiNotifications = useMemo(() => data?.pages.flat() ?? [], [data]);

    useEffect(() => {
        if (apiNotifications.length > 0) {
            setNotifications(apiNotifications);
        }
    }, [apiNotifications, setNotifications]);

    useEffect(() => {
        notificationApi.getUnreadCount().then(setUnreadCount);
    }, [setUnreadCount]);

    const markAsReadMutation = useMutation({
        mutationFn: notificationApi.markAsRead,
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            useNotificationStore.getState().markAsRead(id);
        },
    });

    const markAllAsReadMutation = useMutation({
        mutationFn: notificationApi.markAllAsRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            useNotificationStore.getState().markAllAsRead();
        },
    });

    return {
        notifications: storeNotifications,
        unreadCount,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        refetch,
        markAsRead: markAsReadMutation.mutate,
        markAllAsRead: markAllAsReadMutation.mutate,
    };
};
