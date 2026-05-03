import { useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSignalRStore } from '@/store/signalr.store';
import type { ChatMessage } from '@/types/chat.types';

export const useChatSignalR = () => {
    const connection = useSignalRStore(state => state.connection);
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!connection || connection.state !== 'Connected') return;

        let heartbeatInterval: any;

        const startHeartbeat = () => {
            connection.invoke('Heartbeat').catch(() => {});
            heartbeatInterval = setInterval(() => {
                if (connection.state === 'Connected') {
                    connection.invoke('Heartbeat').catch(() => {});
                }
            }, 30000);
        };

        startHeartbeat();

        const handleMessageSent = (message: ChatMessage) => {
            queryClient.setQueryData(['chat-messages', message.conversationId], (old: any) => {
                if (!old || !old.pages) return old;
                
                const newPages = old.pages.map((page: any, index: number) => {
                    if (index === 0) {
                        const existingMessages = page.messages || page.Messages || page.items || page.data || [];
                        const filtered = existingMessages.filter((m: ChatMessage) => m.clientTempId !== message.clientTempId);
                        return {
                            ...page,
                            messages: [message, ...filtered]
                        };
                    }
                    return page;
                });
                return { ...old, pages: newPages };
            });

            queryClient.invalidateQueries({ queryKey: ['conversations'] });
        };

        const handleReadReceipt = (receipt: any) => {
            queryClient.setQueryData(['chat-read-receipt', receipt.conversationId], receipt);
            queryClient.invalidateQueries({ queryKey: ['conversations'] });
        };

        const handleTypingIndicator = (indicator: any) => {
            queryClient.setQueryData(['chat-typing', indicator.conversationId], indicator);
        };

        connection.on('MessageSent', handleMessageSent);
        connection.on('ReadReceipt', handleReadReceipt);
        connection.on('TypingIndicator', handleTypingIndicator);

        return () => {
            clearInterval(heartbeatInterval);
            connection.off('MessageSent', handleMessageSent);
            connection.off('ReadReceipt', handleReadReceipt);
            connection.off('TypingIndicator', handleTypingIndicator);
        };
    }, [connection, queryClient]);

    const getOrCreateConversation = useCallback(async (targetUserId: string): Promise<string | null> => {
        if (!connection || connection.state !== 'Connected') return null;
        try {
            return await connection.invoke('GetOrCreateConversation', targetUserId);
        } catch (e) {
            return null;
        }
    }, [connection]);

    const sendMessage = useCallback(async (
        convoId: string, 
        content: string | null, 
        clientTempId: string, 
        type: number = 0, 
        mediaUrl: string | null = null
    ) => {
        if (!connection || connection.state !== 'Connected') return;
        await connection.invoke('SendMessage', convoId, content, clientTempId, type, mediaUrl);
    }, [connection]);

    const markAsRead = useCallback(async (convoId: string, lastReadMessageId: string) => {
        if (!connection || connection.state !== 'Connected') return;
        await connection.invoke('MarkAsRead', convoId, lastReadMessageId);
    }, [connection]);

    const startTyping = useCallback(async (convoId: string, targetUserId: string) => {
        if (!connection || connection.state !== 'Connected') return;
        await connection.invoke('StartTyping', convoId, targetUserId);
    }, [connection]);

    const stopTyping = useCallback(async (convoId: string, targetUserId: string) => {
        if (!connection || connection.state !== 'Connected') return;
        await connection.invoke('StopTyping', convoId, targetUserId);
    }, [connection]);

    return {
        getOrCreateConversation,
        sendMessage,
        markAsRead,
        startTyping,
        stopTyping
    };
};
