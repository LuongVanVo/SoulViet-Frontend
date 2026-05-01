import { useInfiniteQuery } from '@tanstack/react-query';
import { userApi } from '@/services';
import type { FollowListParams } from '@/types';

export const useFollowList = (userId: string, type: 'followers' | 'following', search = '', first = 20) => {
    return useInfiniteQuery({
        queryKey: ['followList', type, userId, search],
        queryFn: async ({ pageParam }: { pageParam?: string }) => {
            const params: FollowListParams = {
                first,
                after: pageParam,
                sortBy: 'newest'
            };

            const response = type === 'followers'
                ? await userApi.getFollowers(userId, params)
                : await userApi.getFollowing(userId, params);

            return response;
        },
        initialPageParam: undefined,
        getNextPageParam: (lastPage) => lastPage.pageInfo.hasNextPage ? lastPage.pageInfo.endCursor : undefined,
        select: (data) => {
            const allNodes = data.pages.flatMap(page => page.edges.map(edge => edge.node));
            if (!search) return allNodes;

            const normalizedSearch = search.toLowerCase().trim();
            return allNodes.filter(node =>
                node.fullName.toLowerCase().includes(normalizedSearch) ||
                node.userId.toLowerCase().includes(normalizedSearch)
            );
        }
    });
};
