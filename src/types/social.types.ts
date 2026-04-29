import type { TouristAttractionCardItem } from './attraction.types';

export interface CoinBannerProps {
  coinBalance: number;
}

export interface GetSocialFeedParams {
  radiusKm?: number;
  sortBy?: 'trending' | 'latest';
  first?: number;
  after?: string;
}

export interface CreatePostProps {
  onClick: () => void;
  onPhotoClick?: () => void;
  onLocationClick?: () => void;
  onVibeClick?: () => void;
}

export interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialAction?: 'photo' | 'location' | 'vibe' | null;
}

export interface PostMediaPayload {
  url: string;
  objectKey: string;
  mediaType: number;
  width: number;
  height: number;
  fileSizeBytes: number;
  sortOrder: number;
}

export interface LocationMapPickerModalProps {
  isOpen: boolean;
  locations: TouristAttractionCardItem[];
  selectedLocationId: string | null;
  isLoadingLocations: boolean;
  title: string;
  searchHint: string;
  loadingText: string;
  emptyText: string;
  selectButtonText: string;
  onClose: () => void;
  onSelect: (location: TouristAttractionCardItem) => void;
}

export interface SearchLocationSuggestion {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

export interface CreatePostPayload {
  userId?: string;
  content?: string;
  media: PostMediaPayload[];
  taggedProductIds: string[];
  vibeTag: number;
  checkinLocationId?: string;
}

export interface GetUserPostsParams {
  userId: string;
  after?: string;
  first?: number;
  sortBy?: 'newest' | 'oldest';
}

export interface SocialPostApiItem {
  id: string;
  userId: string;
  content?: string;
  media?: PostMediaPayload[];
  mediaUrls?: string[];
  taggedProductIds?: string[];
  vibeTag: number;
  checkinLocationId?: string;
  checkinLocationName?: string;
  aspectRatio?: 'horizontal' | 'vertical' | 'square';
  createdAt: string;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  status: number;
  isLiked?: boolean;
  success?: boolean;
  message?: string;
}

export interface LikePostResponse {
  isLiked: boolean;
  likesCount: number;
  postId: string;
}

export interface PostHeaderProps {
  avatar: string;
  author: string;
  timeAgo: string;
  location?: string;
  vibe: string;
}

export interface PostActionProps {
  likes: number;
  comments: number;
  postId?: string;
  onLike?: (postId: string) => void;
  isLiking?: boolean;
  isLiked?: boolean;
}

export interface SocialPost {
  id: string;
  userId: string;
  author: string;
  avatar: string;
  timeAgo: string;
  location?: string;
  checkinLocationId?: string;
  vibe?: string;
  vibeTag?: number;
  images: string[];
  media?: { url: string; type: 'image' | 'video'; objectKey: string; sortOrder?: number }[];
  aspectRatio?: 'horizontal' | 'vertical' | 'square';
  image?: string;
  caption?: string;
  likes: number;
  comments: number;
  shares: number;
  isLiked?: boolean;
  rewardCoins: number;
  createdAt: string;
}

export interface PostCardProps {
  post: SocialPost;
}

export interface PageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor: string | null;
  endCursor: string | null;
}

export interface Edge<T> {
  node: T;
  cursor: string;
}

export interface Connection<T> {
  edges: Edge<T>[];
  pageInfo: PageInfo;
  totalCount: number;
}