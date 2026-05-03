export interface Conversation {
    id: string;
    targetUserId: string;
    targetUserName: string;
    targetUserAvatar?: string;
    lastMessageAt?: string;
    lastMessageContent?: string;
    unreadCount: number;
}

export interface ChatMessage {
    id: string;
    conversationId: string;
    senderId: string;
    type: number;
    content?: string;
    mediaUrl?: string;
    clientTempId?: string;
    createdAt: string;
}

export interface GetMessagesResponse {
    messages: ChatMessage[];
    lastReadMessageId?: string;
}
