import { useQuery } from '@tanstack/react-query';
import { userApi, postApi } from '@/services';
import { useAuthStore } from '@/store';
import { useVibeTags } from './useVibeTags';
import { toSocialPost } from '@/utils/socialMapper';

export const usePublicProfile = (userId: string) => {
    const currentUser = useAuthStore((state) => state.user);
    const { data: vibeTags = [] } = useVibeTags();
    const vibeTagMap = new Map(vibeTags.map((tag) => [tag.id, tag.name]));

    const profileQuery = useQuery({
        queryKey: ['publicProfile', userId],
        queryFn: () => userApi.getUserProfileById(userId),
        enabled: !!userId,
    });

    const postsQuery = useQuery({
        queryKey: ['userPosts', userId],
        queryFn: () => postApi.getUserPosts({ userId, first: 20 }),
        enabled: !!userId,
    });

    const posts = postsQuery.data?.edges.map((edge) => toSocialPost(edge.node, vibeTagMap, currentUser)) ?? [];

    return {
        profile: profileQuery.data,
        posts,
        isLoading: profileQuery.isLoading || postsQuery.isLoading,
        isError: profileQuery.isError || postsQuery.isError,
        refetch: () => {
            profileQuery.refetch();
            postsQuery.refetch();
        }
    };
};
