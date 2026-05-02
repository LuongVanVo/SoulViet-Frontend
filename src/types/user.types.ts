import type { Connection } from './social.types';

export interface UserProfile {
  id: string;
  name: string;
  avatarUrl?: string;
  bio?: string;
  followersCount?: number;
  followingCount?: number;
  postsCount?: number;
  isFollowing?: boolean;
  isFollower?: boolean;
  isLocalPartner?: boolean;
  roles?: string[];
  soulCoinBalance?: number;
}

export interface FollowUserEntry {
  userId: string;
  fullName: string;
  avatarUrl?: string | null;
  isFollowing: boolean;
  isFollower?: boolean;
  success?: boolean;
  message?: string;
}

export interface FollowListParams {
  first?: number;
  after?: string;
  sortBy?: 'newest' | 'oldest';
}

export type FollowListResponse = Connection<FollowUserEntry>;
