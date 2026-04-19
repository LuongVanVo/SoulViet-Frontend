import { useEffect, useRef, useState } from 'react';
import * as signalR from '@microsoft/signalr';
import { useAuthStore } from '@/store';
import { authApi } from '@/services';

const _backendOrigin = (import.meta.env.VITE_BACKEND_ORIGIN ?? 'http://localhost:5032') as string;
const HUB_URL = `${_backendOrigin.replace(/\/$/, '')}/hubs/notifications`;

export const useSignalR = () => {
    const [connection, setConnection] = useState<signalR.HubConnection | null>(null);
    const connectionRef = useRef<signalR.HubConnection | null>(null);

    const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

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

        newConnection.on('ReceiveNotification', (notification) => {
            console.log('[SignalR] Thông báo mới:', notification);
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
    }, [isLoggedIn]);
    return connection;
};