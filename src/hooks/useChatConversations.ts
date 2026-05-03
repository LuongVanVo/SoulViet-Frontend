import { useQuery } from '@tanstack/react-query';
import { chatApi } from '@/services';
import { useAuthStore } from '@/store';

export const useChatConversations = () => {
    const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ['conversations'],
        queryFn: () => chatApi.getConversations(),
        enabled: !!isLoggedIn,
        refetchInterval: 60000,
        staleTime: 30000,
    });

    return {
        conversations: data ?? [],
        isLoading: isLoading && !!isLoggedIn,
        isError,
        refetch,
    };
};
