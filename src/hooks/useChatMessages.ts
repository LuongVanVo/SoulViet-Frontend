import { useInfiniteQuery } from '@tanstack/react-query';
import { chatApi } from '@/services';

export const useChatMessages = (conversationId: string | null) => {
    const query = useInfiniteQuery({
        queryKey: ['chat-messages', conversationId],
        queryFn: ({ pageParam }) =>
            chatApi.getMessages(conversationId!, pageParam as string | undefined),
        initialPageParam: undefined as string | undefined,
        getNextPageParam: (lastPage: any) => {
            const messages = lastPage?.messages || lastPage?.Messages || lastPage?.items || lastPage?.data;
            if (!messages || !Array.isArray(messages) || messages.length < 30) return undefined;
            return messages[messages.length - 1].id;
        },
        enabled: !!conversationId,
        staleTime: 10000,
    });

    const allMessages = query.data?.pages.flatMap((page: any) => {
        const msgs = page?.messages || page?.Messages || page?.items || page?.data || [];
        return Array.isArray(msgs) ? msgs : [];
    }).reverse() ?? [];
    
    const firstPage: any = query.data?.pages[0];
    const lastReadMessageId = firstPage?.lastReadMessageId || firstPage?.LastReadMessageId;

    return {
        messages: allMessages,
        lastReadMessageId,
        isLoading: query.isLoading,
        isFetchingNextPage: query.isFetchingNextPage,
        hasNextPage: query.hasNextPage,
        fetchNextPage: query.fetchNextPage,
    };
};
