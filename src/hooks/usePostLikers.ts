import { useQuery } from '@tanstack/react-query';
import { socialFeedApi } from '@/services/social';
import type { PostLiker, Connection } from '@/types';

export const usePostLikers = (postId: string, isOpen: boolean = true, first: number = 20) => {
    const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } = useQuery({
        queryKey: ['post-likers', postId, first],
        queryFn: () => socialFeedApi.getPostLikers(postId, undefined, first),
        enabled: !!postId && isOpen,
    });

    const likers = data?.edges.map(edge => edge.node) || [];
    const totalCount = data?.totalCount || 0;

    return {
        likers,
        totalCount,
        isLoading,
        isError,
        pageInfo: data?.pageInfo,
    };
};
