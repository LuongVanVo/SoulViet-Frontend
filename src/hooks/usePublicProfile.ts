import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { userApi, postApi } from '@/services';
import { useAuthStore } from '@/store';
import { useVibeTags } from './useVibeTags';
import { toSocialPost } from '@/utils/socialMapper';

export const usePublicProfile = (userId: string) => {
    const currentUser = useAuthStore((state) => state.user);
    const normalizedUserId = userId.trim().toLowerCase();
    const normalizedCurrentUserId = currentUser?.id?.trim().toLowerCase();
    const { data: vibeTags = [] } = useVibeTags();
    const vibeTagMap = useMemo(
        () => new Map(vibeTags.map((tag) => [tag.id, tag.name])),
        [vibeTags]
    );

    const profileQuery = useQuery({
        queryKey: ['publicProfile', normalizedUserId],
        queryFn: () => userApi.getUserProfileById(userId),
        enabled: !!userId,
    });

    const postsQuery = useQuery({
        queryKey: ['userPosts', userId],
        queryFn: () => postApi.getUserPosts({ userId, first: 20 }),
        enabled: !!userId,
    });

    const followingQuery = useQuery({
        queryKey: ['followingState', currentUser?.id, normalizedUserId],
        queryFn: () => userApi.getFollowStatus(currentUser?.id || '', userId),
        enabled: !!userId && !!currentUser?.id && normalizedCurrentUserId !== normalizedUserId,
        staleTime: 1000 * 30,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
    });

    const derivedIsFollowing = (followingQuery.data as any)?.isFollowing ?? (followingQuery.data as any)?.IsFollowing;
    const derivedIsFollower = (followingQuery.data as any)?.isFollower ?? (followingQuery.data as any)?.IsFollower;

    const profile = useMemo(() => {
        if (!profileQuery.data) {
            return profileQuery.data;
        }

        return {
            ...profileQuery.data,
            isFollowing: derivedIsFollowing ?? profileQuery.data.isFollowing,
            isFollower: derivedIsFollower ?? profileQuery.data.isFollower,
        };
    }, [derivedIsFollowing, derivedIsFollower, profileQuery.data]);

    const posts = postsQuery.data?.edges.map((edge) => {
        const mappedPost = toSocialPost(edge.node, vibeTagMap, currentUser);
        const mappedUserId = mappedPost.userId?.trim().toLowerCase();
        const isProfileOwnerPost = !mappedUserId || mappedUserId === normalizedUserId;

        if (!isProfileOwnerPost || typeof derivedIsFollowing !== 'boolean') {
            return mappedUserId ? mappedPost : { ...mappedPost, userId };
        }

        return {
            ...mappedPost,
            userId: mappedPost.userId || userId,
            isFollowingAuthor: derivedIsFollowing,
            isFollowerAuthor: derivedIsFollower ?? mappedPost.isFollowerAuthor,
        };
    }) ?? [];

    return {
        profile,
        posts,
        isFollowing: derivedIsFollowing,
        isLoading: profileQuery.isLoading,
        isLoadingProfile: profileQuery.isLoading,
        isLoadingPosts: postsQuery.isLoading,
        isLoadingFollow: followingQuery.isLoading,
        isError: profileQuery.isError || postsQuery.isError || followingQuery.isError,
        refetch: () => {
            profileQuery.refetch();
            postsQuery.refetch();
            followingQuery.refetch();
        }
    };
};
