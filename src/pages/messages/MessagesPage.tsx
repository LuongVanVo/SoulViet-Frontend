import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Send, Image, Loader2, MessageCircle, User as UserIcon, PenSquare } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { useAuthStore } from '@/store';
import { useChatConversations } from '@/hooks/useChatConversations';
import { useChatMessages } from '@/hooks/useChatMessages';
import { useChatSignalR } from '@/hooks/useChatSignalR';
import { useFollowList } from '@/hooks/useFollowList';
import { useSignalRStore } from '@/store/signalr.store';
import { useQueryClient } from '@tanstack/react-query';
import { compressImageToWebP } from '@/utils/imageCompress';
import type { ChatMessage, Conversation } from '@/types/chat.types';
import { cn } from '@/utils/cn';
import { Skeleton } from '@/components/ui/Skeleton';

const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return formatTime(dateStr);
    if (days === 1) return 'Hôm qua';
    if (days < 7) return `${days} ngày trước`;
    return date.toLocaleDateString('vi-VN');
};

interface ConversationItemProps {
    convo: Conversation;
    isActive: boolean;
    currentUserId: string;
    onClick: () => void;
}

const ConversationItem = ({ convo, isActive, onClick }: ConversationItemProps) => (
    <button
        onClick={onClick}
        className={cn(
            'flex w-full items-center gap-3 rounded-2xl px-3 py-3 transition-all text-left',
            isActive ? 'bg-[#3B6363]/10' : 'hover:bg-gray-50'
        )}
    >
        <div className="relative shrink-0">
            <div className="h-12 w-12 overflow-hidden rounded-full bg-gray-100 ring-2 ring-white">
                {convo.targetUserAvatar ? (
                    <img
                        src={convo.targetUserAvatar}
                        alt={convo.targetUserName}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y';
                        }}
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-gray-400">
                        <UserIcon className="h-6 w-6" />
                    </div>
                )}
            </div>
            {convo.unreadCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#3B6363] text-[10px] font-bold text-white px-1">
                    {convo.unreadCount > 99 ? '99+' : convo.unreadCount}
                </span>
            )}
        </div>
        <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
                <p className={cn('truncate text-sm', convo.unreadCount > 0 ? 'font-bold text-gray-900' : 'font-medium text-gray-800')}>
                    {convo.targetUserName}
                </p>
                {convo.lastMessageAt && (
                    <span className="ml-2 shrink-0 text-[11px] text-gray-400">
                        {formatDate(convo.lastMessageAt)}
                    </span>
                )}
            </div>
            {convo.lastMessageContent && (
                <p className={cn('truncate text-xs mt-0.5', convo.unreadCount > 0 ? 'font-semibold text-gray-700' : 'text-gray-500')}>
                    {convo.lastMessageContent}
                </p>
            )}
        </div>
    </button>
);

interface MessageBubbleProps {
    message: ChatMessage;
    isMine: boolean;
    isLastRead: boolean;
    targetUserAvatar?: string;
}

const MessageBubble = ({ message, isMine, isLastRead, targetUserAvatar }: MessageBubbleProps) => (
    <div className={cn('flex items-end gap-2 px-4', isMine ? 'justify-end' : 'justify-start')}>
        {!isMine && (
            <div className="h-7 w-7 shrink-0 overflow-hidden rounded-full bg-gray-200 mb-1">
                {targetUserAvatar ? (
                    <img src={targetUserAvatar} alt="" className="h-full w-full object-cover" />
                ) : (
                    <div className="flex h-full w-full items-center justify-center">
                        <UserIcon className="h-4 w-4 text-gray-400" />
                    </div>
                )}
            </div>
        )}
        <div className={cn('flex flex-col gap-1 max-w-[70%]', isMine ? 'items-end' : 'items-start')}>
            {message.type === 1 && message.mediaUrl ? (
                <div className={cn('overflow-hidden rounded-2xl', isMine ? 'rounded-br-sm' : 'rounded-bl-sm')}>
                    <img
                        src={message.mediaUrl}
                        alt="Image"
                        className="max-h-64 max-w-xs object-cover cursor-pointer"
                        onClick={() => window.open(message.mediaUrl!, '_blank')}
                    />
                </div>
            ) : (
                <div className={cn(
                    'rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
                    isMine
                        ? 'bg-[#3B6363] text-white rounded-br-sm'
                        : 'bg-gray-100 text-gray-900 rounded-bl-sm'
                )}>
                    {message.content}
                </div>
            )}
            <span className="text-[10px] text-gray-400 px-1">{formatTime(message.createdAt)}</span>
            {isMine && isLastRead && (
                <div className="flex items-center gap-1 px-1">
                    <span className="text-[10px] text-gray-400">Đã xem</span>
                </div>
            )}
        </div>
    </div>
);

interface ChatBoxProps {
    conversationId: string;
    targetUserId: string;
    targetUserName: string;
    targetUserAvatar?: string;
    onBack: () => void;
    isMobile: boolean;
}

const ChatBox = ({ conversationId, targetUserId, targetUserName, targetUserAvatar, onBack, isMobile }: ChatBoxProps) => {
    const { t } = useTranslation();
    const currentUser = useAuthStore(state => state.user);
    const { messages, lastReadMessageId, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } = useChatMessages(conversationId);
    const { sendMessage, markAsRead, startTyping, stopTyping } = useChatSignalR();
    const queryClient = useQueryClient();
    const [text, setText] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [typingTimeout, setTypingTimeout] = useState<any>(null);
    const [remoteTyping, setRemoteTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages.length]);

    useEffect(() => {
        if (conversationId && messages.length > 0) {
            const lastMsg = messages[messages.length - 1];
            if (lastMsg && lastMsg.senderId !== currentUser?.id) {
                markAsRead(conversationId, lastMsg.id);
            }
        }
    }, [messages, conversationId, currentUser?.id, markAsRead]);

    useEffect(() => {
        const typing = queryClient.getQueryData<any>(['chat-typing', conversationId]);
        if (typing && typing.userId !== currentUser?.id) {
            setRemoteTyping(typing.isTyping);
        }
    }, [queryClient, conversationId, currentUser?.id]);

    const handleScroll = useCallback(() => {
        const container = scrollContainerRef.current;
        if (!container) return;
        if (container.scrollTop < 100 && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setText(e.target.value);
        if (typingTimeout) clearTimeout(typingTimeout);
        startTyping(conversationId, targetUserId);
        const timeout = setTimeout(() => {
            stopTyping(conversationId, targetUserId);
        }, 2000);
        setTypingTimeout(timeout);
    };

    const handleSendText = async () => {
        const trimmed = text.trim();
        if (!trimmed || isSending) return;

        const clientTempId = uuidv4();
        const optimistic: ChatMessage = {
            id: clientTempId,
            conversationId,
            senderId: currentUser!.id,
            type: 0,
            content: trimmed,
            clientTempId,
            createdAt: new Date().toISOString(),
        };

        queryClient.setQueryData(['chat-messages', conversationId], (old: any) => {
            if (!old || !old.pages) return old;
            const newPages = [...old.pages];
            const firstPage = newPages[0] || {};
            const existingMessages = firstPage.messages || firstPage.Messages || firstPage.items || firstPage.data || [];
            
            newPages[0] = {
                ...firstPage,
                messages: [optimistic, ...existingMessages],
            };
            return { ...old, pages: newPages };
        });

        setText('');
        setIsSending(true);
        try {
            await sendMessage(conversationId, trimmed, clientTempId, 0, null);
        } finally {
            setIsSending(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendText();
        }
    };

    const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !currentUser) return;
        setIsUploadingImage(true);
        try {
            const compressed = await compressImageToWebP(file);
            const formData = new FormData();
            formData.append('file', compressed);
            formData.append('folder', 'chat-media');
            const token = localStorage.getItem('access_token');
            const res = await fetch('/api/Media/upload', {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });
            const json = await res.json();
            const mediaUrl: string = json.data ?? json.url ?? '';
            if (!mediaUrl) throw new Error('Upload failed');
            const clientTempId = uuidv4();
            const optimistic: ChatMessage = {
                id: clientTempId,
                conversationId,
                senderId: currentUser.id,
                type: 1,
                mediaUrl,
                clientTempId,
                createdAt: new Date().toISOString(),
            };
            queryClient.setQueryData(['chat-messages', conversationId], (old: any) => {
                if (!old || !old.pages) return old;
                const newPages = [...old.pages];
                const firstPage = newPages[0] || {};
                const existingMessages = firstPage.messages || firstPage.Messages || firstPage.items || firstPage.data || [];
                
                newPages[0] = {
                    ...firstPage,
                    messages: [optimistic, ...existingMessages],
                };
                return { ...old, pages: newPages };
            });
            await sendMessage(conversationId, null, clientTempId, 1, mediaUrl);
        } finally {
            setIsUploadingImage(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <div className="flex h-full flex-col bg-white">
            <div className="flex items-center gap-3 border-b border-gray-200 px-4 py-3">
                {isMobile && (
                    <button onClick={onBack} className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
                        <ArrowLeft className="h-5 w-5 text-gray-700" />
                    </button>
                )}
                <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-gray-100">
                    {targetUserAvatar ? (
                        <img src={targetUserAvatar} alt={targetUserName} className="h-full w-full object-cover" />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center">
                            <UserIcon className="h-5 w-5 text-gray-400" />
                        </div>
                    )}
                </div>
                <div>
                    <p className="font-bold text-gray-900 text-sm">{targetUserName}</p>
                    {remoteTyping && (
                        <p className="text-xs text-[#3B6363]">{t('chat.typing', { defaultValue: 'Đang gõ...' })}</p>
                    )}
                </div>
            </div>

            <div
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto py-4 space-y-3 scrollbar-hide pb-28 lg:pb-4"
            >
                {isFetchingNextPage && (
                    <div className="flex justify-center py-2">
                        <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                    </div>
                )}
                {isLoading ? (
                    <div className="space-y-4 px-4">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className={cn('flex', i % 2 === 0 ? 'justify-end' : 'justify-start')}>
                                <Skeleton className={cn('h-10 rounded-2xl', i % 2 === 0 ? 'w-48' : 'w-40')} />
                            </div>
                        ))}
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full py-20 text-center px-8">
                        <div className="h-16 w-16 rounded-full bg-[#3B6363]/10 flex items-center justify-center mb-4">
                            <MessageCircle className="h-8 w-8 text-[#3B6363]" />
                        </div>
                        <p className="text-gray-500 text-sm">{t('chat.startConversation', { defaultValue: 'Hãy bắt đầu cuộc trò chuyện!' })}</p>
                    </div>
                ) : (
                    messages.map((msg) => (
                        <MessageBubble
                            key={msg.id}
                            message={msg}
                            isMine={msg.senderId === currentUser?.id}
                            isLastRead={msg.id === lastReadMessageId}
                            targetUserAvatar={targetUserAvatar}
                        />
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="fixed bottom-[84px] left-0 right-0 z-20 border-t border-gray-200 bg-white/95 px-4 pb-6 pt-3 backdrop-blur-md md:static md:bottom-auto md:bg-white md:pb-3 md:backdrop-blur-none">
                <div className="flex items-center gap-2">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageSelect}
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploadingImage}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-[#3B6363] transition-all disabled:opacity-50"
                    >
                        {isUploadingImage ? <Loader2 className="h-5 w-5 animate-spin" /> : <Image className="h-5 w-5" />}
                    </button>
                    <input
                        type="text"
                        value={text}
                        onChange={handleTextChange}
                        onKeyDown={handleKeyDown}
                        placeholder={t('chat.inputPlaceholder', { defaultValue: 'Nhập tin nhắn...' })}
                        className="flex-1 rounded-full bg-gray-100 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#3B6363]/20 transition-all"
                    />
                    <button
                        onClick={handleSendText}
                        disabled={!text.trim() || isSending}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#3B6363] text-white shadow-sm transition-all hover:bg-[#2F4F4F] active:scale-95 disabled:opacity-40"
                    >
                        {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </button>
                </div>
            </div>
        </div>
    );
};

export const MessagesPage: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const currentUser = useAuthStore(state => state.user);
    const { conversations, isLoading: isLoadingConvos } = useChatConversations();
    const { getOrCreateConversation } = useChatSignalR();
    const followingQuery = useFollowList(currentUser?.id ?? '', 'following', '', 20);
    const suggestedUsers = (followingQuery.data as any) ?? [];

    const activeConvoId = searchParams.get('c');
    const pendingUserId = searchParams.get('user');
    const pendingUserName = searchParams.get('userName') ?? '';
    const pendingUserAvatar = searchParams.get('userAvatar') ?? undefined;
    const [activeConvo, setActiveConvo] = useState<Conversation | null>(null);
    const [isMobileView, setIsMobileView] = useState(false);
    const [search, setSearch] = useState('');
    const [startingChat, setStartingChat] = useState<string | null>(null);
    const [isResolvingPending, setIsResolvingPending] = useState(false);

    useEffect(() => {
        const handleResize = () => setIsMobileView(window.innerWidth < 768);
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (activeConvoId && conversations.length > 0) {
            const found = conversations.find(c => c.id === activeConvoId);
            if (found) setActiveConvo(found);
        }
    }, [activeConvoId, conversations]);

    useEffect(() => {
        if (!currentUser) {
            navigate('/login?redirect=/messages');
        }
    }, [currentUser, navigate]);

    const connection = useSignalRStore((state: any) => state.connection);

    useEffect(() => {
        if (!pendingUserId || !connection || connection.state !== 'Connected') return;
        setIsResolvingPending(true);
        getOrCreateConversation(pendingUserId).then((convoId) => {
            if (convoId) {
                const synthetic: Conversation = {
                    id: convoId,
                    targetUserId: pendingUserId,
                    targetUserName: pendingUserName,
                    targetUserAvatar: pendingUserAvatar,
                    unreadCount: 0,
                };
                setActiveConvo(synthetic);
                setSearchParams({ c: convoId });
            }
        }).finally(() => setIsResolvingPending(false));
    }, [pendingUserId, connection]);

    const handleSelectConvo = (convo: Conversation) => {
        setActiveConvo(convo);
        setSearchParams({ c: convo.id });
    };

    const handleBack = () => {
        setActiveConvo(null);
        setSearchParams({});
    };

    const handleStartChatWithUser = async (userId: string, userName: string, userAvatar?: string) => {
        setStartingChat(userId);
        try {
            const convoId = await getOrCreateConversation(userId);
            if (convoId) {
                const synthetic: Conversation = {
                    id: convoId,
                    targetUserId: userId,
                    targetUserName: userName,
                    targetUserAvatar: userAvatar,
                    unreadCount: 0,
                };
                setActiveConvo(synthetic);
                setSearchParams({ c: convoId });
            }
        } finally {
            setStartingChat(null);
        }
    };

    const filteredConvos = conversations.filter(c =>
        c.targetUserName.toLowerCase().includes(search.toLowerCase())
    );

    const conversationUserIds = new Set(conversations.map(c => c.targetUserId));
    const filteredSuggestions = suggestedUsers
        .filter((u: any) => !conversationUserIds.has(u.userId) && (u.fullName ?? '').toLowerCase().includes(search.toLowerCase()))
        .slice(0, 5);

    const showList = !isMobileView || !activeConvo;
    const showChat = !isMobileView || !!activeConvo;

    return (
        <div className="relative mx-auto flex h-[calc(100dvh-56px-84px)] w-full max-w-5xl overflow-hidden bg-white z-10 md:h-[calc(100dvh-64px-84px)] lg:h-[calc(100dvh-64px)] lg:rounded-b-2xl lg:border lg:border-gray-200 lg:shadow-sm">
            {isResolvingPending && (
                <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
                    <Loader2 className="h-8 w-8 animate-spin text-[#3B6363]" />
                    <p className="mt-3 text-sm text-gray-500">{t('chat.opening', { defaultValue: 'Đang mở hội thoại...' })}</p>
                </div>
            )}
            {showList && (
                <aside className={cn(
                    'flex flex-col border-r border-gray-200 bg-white',
                    isMobileView ? 'w-full' : 'w-80 shrink-0'
                )}>
                    <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-200">
                        <button
                            onClick={() => navigate('/social')}
                            className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                        >
                            <ArrowLeft className="h-5 w-5 text-gray-700" />
                        </button>
                        <h1 className="text-lg font-bold text-gray-900">
                            {t('chat.title', { defaultValue: 'Tin nhắn' })}
                        </h1>
                    </div>

                    <div className="px-4 py-3">
                        <input
                            type="text"
                            placeholder={t('common.search', { defaultValue: 'Tìm kiếm' })}
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full rounded-xl bg-gray-100 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#3B6363]/20 transition-all"
                        />
                    </div>

                    <div className="flex-1 overflow-y-auto px-3 pb-28 lg:pb-4 scrollbar-hide">
                        {isLoadingConvos ? (
                            <div className="space-y-2 pt-1">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="flex items-center gap-3 px-3 py-3">
                                        <Skeleton className="h-12 w-12 shrink-0 rounded-full" />
                                        <div className="flex-1 space-y-2">
                                            <Skeleton className="h-4 w-3/4" />
                                            <Skeleton className="h-3 w-1/2" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <>
                                {filteredConvos.map(convo => (
                                    <ConversationItem
                                        key={convo.id}
                                        convo={convo}
                                        isActive={activeConvo?.id === convo.id}
                                        currentUserId={currentUser?.id ?? ''}
                                        onClick={() => handleSelectConvo(convo)}
                                    />
                                ))}

                                {filteredSuggestions.length > 0 && (
                                    <div className="mt-4">
                                        <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                                            {t('chat.suggested', { defaultValue: 'Gợi ý' })}
                                        </p>
                                        {filteredSuggestions.map((u: any) => (
                                            <button
                                                key={u.userId}
                                                onClick={() => handleStartChatWithUser(u.userId, u.fullName, u.avatarUrl)}
                                                disabled={startingChat === u.userId}
                                                className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 transition-all hover:bg-gray-50 disabled:opacity-60"
                                            >
                                                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-gray-100">
                                                    {u.avatarUrl ? (
                                                        <img src={u.avatarUrl} alt={u.fullName} className="h-full w-full object-cover" />
                                                    ) : (
                                                        <div className="flex h-full w-full items-center justify-center text-gray-400">
                                                            <UserIcon className="h-6 w-6" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0 text-left">
                                                    <p className="truncate text-sm font-medium text-gray-800">{u.fullName}</p>
                                                    <p className="text-xs text-gray-400">{t('chat.startChat', { defaultValue: 'Bắt đầu trò chuyện' })}</p>
                                                </div>
                                                {startingChat === u.userId ? (
                                                    <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                                                ) : (
                                                    <PenSquare className="h-4 w-4 text-gray-300" />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {filteredConvos.length === 0 && filteredSuggestions.length === 0 && (
                                    <div className="flex flex-col items-center justify-center py-16 text-center">
                                        <div className="h-14 w-14 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                                            <MessageCircle className="h-7 w-7 text-gray-400" />
                                        </div>
                                        <p className="text-sm text-gray-500">
                                            {search
                                                ? t('common.noResults', { defaultValue: 'Không tìm thấy kết quả' })
                                                : t('chat.noConversations', { defaultValue: 'Chưa có cuộc trò chuyện nào' })
                                            }
                                        </p>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </aside>
            )}

            {showChat && (
                <main className="flex-1 overflow-hidden">
                    {activeConvo ? (
                        <ChatBox
                            conversationId={activeConvo.id}
                            targetUserId={activeConvo.targetUserId}
                            targetUserName={activeConvo.targetUserName}
                            targetUserAvatar={activeConvo.targetUserAvatar}
                            onBack={handleBack}
                            isMobile={isMobileView}
                        />
                    ) : (
                        <div className="flex h-full flex-col items-center justify-center text-center px-8">
                            <div className="h-20 w-20 rounded-full bg-[#3B6363]/10 flex items-center justify-center mb-5">
                                <MessageCircle className="h-10 w-10 text-[#3B6363]" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 mb-2">
                                {t('chat.selectConversation', { defaultValue: 'Chọn một cuộc trò chuyện' })}
                            </h2>
                            <p className="text-sm text-gray-500 max-w-xs mb-8">
                                {t('chat.selectConversationDesc', { defaultValue: 'Chọn một người để bắt đầu nhắn tin' })}
                            </p>
                            {suggestedUsers.length > 0 && (
                                <div className="w-full max-w-sm">
                                    <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                                        {t('chat.suggested', { defaultValue: 'Gợi ý' })}
                                    </p>
                                    <div className="flex flex-wrap justify-center gap-4">
                                        {suggestedUsers.slice(0, 6).map((u: any) => (
                                            <button
                                                key={u.userId}
                                                onClick={() => handleStartChatWithUser(u.userId, u.fullName, u.avatarUrl)}
                                                disabled={startingChat === u.userId}
                                                className="flex flex-col items-center gap-2 transition-opacity hover:opacity-70 disabled:opacity-50"
                                            >
                                                <div className="relative h-14 w-14 overflow-hidden rounded-full bg-gray-100 ring-2 ring-[#3B6363]/20">
                                                    {u.avatarUrl ? (
                                                        <img src={u.avatarUrl} alt={u.fullName} className="h-full w-full object-cover" />
                                                    ) : (
                                                        <div className="flex h-full w-full items-center justify-center text-gray-400">
                                                            <UserIcon className="h-7 w-7" />
                                                        </div>
                                                    )}
                                                    {startingChat === u.userId && (
                                                        <div className="absolute inset-0 flex items-center justify-center bg-white/70">
                                                            <Loader2 className="h-4 w-4 animate-spin text-[#3B6363]" />
                                                        </div>
                                                    )}
                                                </div>
                                                <span className="max-w-[64px] truncate text-[11px] text-gray-600">{u.fullName}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </main>
            )}
        </div>
    );
};
