import { apiClient } from '@/services/axios';
import type { FollowListParams, FollowListResponse, FollowUserResponse, UserProfile } from '@/types';
import { authApi } from '@/services';
import axios from 'axios';

function mapToProfile(data: Record<string, unknown>): UserProfile {
  const id = String(data.id ?? data.Id ?? data.userId ?? data.UserId ?? data.email ?? 'user');
  const name = String(data.name ?? data.Name ?? data.fullName ?? data.FullName ?? data.email ?? 'User');
  const avatarUrl = (data.avatarUrl ?? data.AvatarUrl) as string | undefined;
  const bio = (data.bio ?? data.Bio) as string | undefined;
  const followersCount = Number(data.followersCount ?? data.FollowersCount ?? 0);
  const followingCount = Number(data.followingCount ?? data.FollowingCount ?? 0);
  const postsCount = Number(data.postsCount ?? data.PostsCount ?? 0);
  const isFollowing = (data.isFollowing ?? data.IsFollowing) as boolean | undefined;
  const isFollower = (data.isFollower ?? data.IsFollower) as boolean | undefined;

  return { id, name, avatarUrl, bio, followersCount, followingCount, postsCount, isFollowing, isFollower };
}

function mapToFollowResponse(data: any): FollowUserResponse {
  return {
    isFollowing: data.isFollowing ?? data.IsFollowing ?? false,
    isFollower: data.isFollower ?? data.IsFollower ?? false,
    userId: data.userId ?? data.UserId ?? '',
    fullName: data.fullName ?? data.FullName ?? '',
    success: data.success ?? data.Success ?? false,
    message: data.message ?? data.Message ?? '',
  };
}

export const userApi = {
  async getCurrentUser(): Promise<UserProfile | null> {
    try {
      const data = (await authApi.getCurrentUser()) as unknown;
      if (!data || typeof data !== 'object') {
        return null;
      }

      return mapToProfile(data as Record<string, unknown>);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        return null;
      }
      throw error;
    }
  },

  async getUserProfileById(userId: string): Promise<UserProfile> {
    const res = await apiClient.get<UserProfile>(`/User/${userId}/profile`);
    return mapToProfile(res.data as unknown as Record<string, unknown>);
  },

  async followUser(followingId: string): Promise<FollowUserResponse> {
    const res = await apiClient.post<any>(`/Follower/${followingId}`);
    return mapToFollowResponse(res.data);
  },

  async unfollowUser(followingId: string): Promise<FollowUserResponse> {
    const res = await apiClient.delete<any>(`/Follower/${followingId}`);
    return mapToFollowResponse(res.data);
  },

  async getFollowers(userId: string, params: FollowListParams = {}): Promise<FollowListResponse> {
    const res = await apiClient.get<FollowListResponse>(`/Follower/${userId}/followers`, {
      params,
    });
    return res.data;
  },

  async getFollowing(userId: string, params: FollowListParams = {}): Promise<FollowListResponse> {
    const res = await apiClient.get<FollowListResponse>(`/Follower/${userId}/following`, {
      params,
    });
    return res.data;
  },

  async getFollowStatus(followerId: string, followingId: string): Promise<FollowUserResponse> {
    const res = await apiClient.get<any>(`/Follower/${followingId}/status`, {
      params: { followerId },
    });
    return mapToFollowResponse(res.data);
  },

  async removeFollower(followerId: string): Promise<FollowUserResponse> {
    const res = await apiClient.delete<any>(`/Follower/${followerId}/remove`);
    return mapToFollowResponse(res.data);
  },
};