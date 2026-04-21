export interface CoinBannerProps {
	coinBalance: number;
}

export interface CreatePostProps {
	onClick: () => void;
}

export interface CreatePostModalProps {
	isOpen: boolean;
	onClose: () => void;
}

export interface CreatePostPayload {
	userId?: string;
	content: string;
	mediaUrls: string[];
	vibeTag: number;
	checkinLocationId?: string;
}

export interface GetUserPostsParams{
	userId: string;    
    after?: string;   
    first?: number;    
    sortBy?: 'newest' | 'oldest'; 
}

export interface SocialPostApiItem {
    id: string;
    userId: string;
    content: string;
    mediaUrls: string[];
    vibeTag: number; 
    checkinLocationId?: string;
    createdAt: string; 
    likesCount: number;    
    commentsCount: number; 
    sharesCount: number;   
    status: number;      
}

export interface PostHeaderProps {
	avatar: string;
	author: string;
	timeAgo: string;
	location: string;
	vibe: string;
}

export interface PostActionProps {
	likes: number;
	comments: number;
}

export interface SocialPost {
    id: string;
    userId: string;
    author: string;
    avatar: string;
    timeAgo: string; 
    location: string;
    vibe: string;
    vibeTag?: number;
    images: string[]; 
  image?: string;
    caption: string;
    likes: number;
    comments: number;
    shares: number; 
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