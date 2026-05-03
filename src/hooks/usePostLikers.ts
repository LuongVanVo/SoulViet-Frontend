import { useInfiniteQuery } from '@tanstack/react-query';
import { socialFeedApi } from '@/services/social';

export const usePostLikers = (postId: string, isOpen: boolean = true, first: number = 20) => {
    const query = useInfiniteQuery({
        queryKey: ['post-likers', postId, first],
        queryFn: ({ pageParam }) => socialFeedApi.getPostLikers(postId, pageParam as string | undefined, first),
        initialPageParam: undefined as string | undefined,
        getNextPageParam: (lastPage) => lastPage.pageInfo.hasNextPage ? lastPage.pageInfo.endCursor : undefined,
        enabled: !!postId && isOpen,
    });

    const likers = query.data?.pages.flatMap(page => page.edges.map(edge => edge.node)) || [];
    const totalCount = query.data?.pages[0]?.totalCount || 0;

    return {
        likers,
        totalCount,
        isLoading: query.isLoading,
        isError: query.isError,
        fetchNextPage: query.fetchNextPage,
        hasNextPage: query.hasNextPage,
        isFetchingNextPage: query.isFetchingNextPage,
    };
};
