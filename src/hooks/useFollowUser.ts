import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { userApi } from '@/services';
import { useAuthStore } from '@/store';
import type { UserProfile } from '@/types';

export const useFollowUser = (userId: string, initialStatus?: { isFollowing?: boolean, isFollower?: boolean }) => {
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((state) => state.user);
  const normalizedUserId = userId.trim().toLowerCase();
  const normalizedCurrentUserId = currentUser?.id?.trim().toLowerCase();

  const cachedProfile = queryClient.getQueryData<UserProfile>(['publicProfile', normalizedUserId]);

  const followingQuery = useQuery({
    queryKey: ['followingState', currentUser?.id, normalizedUserId],
    queryFn: () => userApi.getFollowStatus(currentUser?.id || '', userId),
    enabled: !!userId && !!currentUser?.id && normalizedCurrentUserId !== normalizedUserId,
    staleTime: 1000 * 30,
  });

  const isFollowing =
    (followingQuery.data as any)?.isFollowing ??
    (followingQuery.data as any)?.IsFollowing ??
    (cachedProfile as any)?.isFollowing ??
    (cachedProfile as any)?.IsFollowing ??
    initialStatus?.isFollowing ??
    false;

  const isFollower =
    (followingQuery.data as any)?.isFollower ??
    (followingQuery.data as any)?.IsFollower ??
    (cachedProfile as any)?.isFollower ??
    (cachedProfile as any)?.IsFollower ??
    initialStatus?.isFollower ??
    false;

  const followMutation = useMutation({
    mutationFn: () => userApi.followUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['followingState', currentUser?.id, normalizedUserId] });
      queryClient.invalidateQueries({ queryKey: ['publicProfile', normalizedUserId] });
      if (currentUser?.id) {
        queryClient.invalidateQueries({ queryKey: ['publicProfile', currentUser.id.toLowerCase()] });
      }
      queryClient.invalidateQueries({ queryKey: ['followList'] });
      queryClient.invalidateQueries({ queryKey: ['socialPosts'] });
    }
  });

  const unfollowMutation = useMutation({
    mutationFn: () => userApi.unfollowUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['followingState', currentUser?.id, normalizedUserId] });
      queryClient.invalidateQueries({ queryKey: ['publicProfile', normalizedUserId] });
      if (currentUser?.id) {
        queryClient.invalidateQueries({ queryKey: ['publicProfile', currentUser.id.toLowerCase()] });
      }
      queryClient.invalidateQueries({ queryKey: ['followList'] });
      queryClient.invalidateQueries({ queryKey: ['socialPosts'] });
    }
  });

  const removeFollowerMutation = useMutation({
    mutationFn: () => userApi.removeFollower(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['followingState', currentUser?.id, normalizedUserId] });
      queryClient.invalidateQueries({ queryKey: ['publicProfile', normalizedUserId] });
      if (currentUser?.id) {
        queryClient.invalidateQueries({ queryKey: ['publicProfile', currentUser.id.toLowerCase()] });
      }
      queryClient.invalidateQueries({ queryKey: ['followList'] });
      queryClient.invalidateQueries({ queryKey: ['socialPosts'] });
    }
  });

  const followUser = async () => {
    if (followMutation.isPending) return;
    return followMutation.mutateAsync();
  };

  const unfollowUser = async () => {
    if (unfollowMutation.isPending) return;
    return unfollowMutation.mutateAsync();
  };

  const removeFollower = async () => {
    if (removeFollowerMutation.isPending) return;
    return removeFollowerMutation.mutateAsync();
  };

  return {
    isFollowing,
    isFollower,
    isPending: followMutation.isPending || unfollowMutation.isPending || removeFollowerMutation.isPending,
    isLoading: followMutation.isPending || unfollowMutation.isPending || removeFollowerMutation.isPending,
    followUser,
    unfollowUser,
    removeFollower
  };
};