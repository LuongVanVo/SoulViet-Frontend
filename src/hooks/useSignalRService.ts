import { useEffect, useRef, useState, createElement } from 'react';
import * as signalR from '@microsoft/signalr';
import { useAuthStore, useNotificationStore } from '@/store';
import { authApi, notificationApi } from '@/services';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { type Notification } from '@/types';
import { useTranslation } from 'react-i18next';
import { NotificationToast } from '@/features/notification/NotificationToast';

const _backendOrigin = (import.meta.env.VITE_BACKEND_ORIGIN ?? 'http://localhost:5032') as string;
const HUB_URL = `${_backendOrigin.replace(/\/$/, '')}/hubs/notifications`;

export const useSignalR = () => {
    const [connection, setConnection] = useState<signalR.HubConnection | null>(null);
    const connectionRef = useRef<signalR.HubConnection | null>(null);
    const navigate = useNavigate();

    const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
    const user = useAuthStore((state) => state.user);
    const addNotification = useNotificationStore((state) => state.addNotification);
    const setUnreadCount = useNotificationStore((state) => state.setUnreadCount);

    const { t } = useTranslation();

    useEffect(() => {
        if (isLoggedIn) {
            notificationApi.getUnreadCount().then(setUnreadCount).catch(console.error);
        }
    }, [isLoggedIn, setUnreadCount]);

    useEffect(() => {
        if (connectionRef.current) {
            connectionRef.current.stop();
            connectionRef.current = null;
            setConnection(null);
        }

        const token = authApi.getToken();
        if (!token) return;

        const newConnection = new signalR.HubConnectionBuilder()
            .withUrl(HUB_URL, {
                accessTokenFactory: () => token,
            })
            .withAutomaticReconnect()
            .configureLogging(signalR.LogLevel.Information)
            .build();

        newConnection.on('ReceiveNotification', (notification: Notification) => {
            console.log('[SignalR] Thông báo mới:', notification);

            if (user && notification.actorId === user.id) {
                console.log('[SignalR] Bỏ qua thông báo từ chính mình');
                return;
            }

            const displayTitle = notification.title || (notification.actorName && notification.actorName !== 'Anonymous' ? notification.actorName : t('notifications.newNotification'));
            let displayContent = notification.message || notification.content || '';
            const isShare = String(notification.type).toLowerCase().includes('share');
            if (isShare && displayContent.includes(':')) {
                displayContent = displayContent.split(':')[0].trim();
            }

            const targetId = notification.targetId || notification.postId || '';

            addNotification({
                ...notification,
                title: displayTitle,
                content: displayContent,
                targetId: targetId
            });

            toast((toastProps) =>
                createElement(NotificationToast, {
                    notification,
                    displayTitle,
                    displayContent,
                    targetId,
                    navigate,
                    onMarkAsRead: (id) => {
                        notificationApi.markAsRead(id).catch(console.error);
                        useNotificationStore.getState().markAsRead(id);
                    },
                    toastId: toastProps.id
                }),
                {
                    duration: 3000,
                    position: 'top-right',
                    style: {
                        marginTop: '40px',
                    }
                }
            );
        });

        newConnection
            .start()
            .then(() => {
                console.log('SignalR Connected! ConnectionId:', newConnection.connectionId);
                connectionRef.current = newConnection;
                setConnection(newConnection);
            })
            .catch((e) => {
                console.error('SignalR Connection Error:', e);
            });

        return () => {
            newConnection.stop();
            connectionRef.current = null;
        };
    }, [isLoggedIn, user, addNotification, navigate, t, setUnreadCount]);

    return connection;
};
