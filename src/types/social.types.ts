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

export interface SocialPostApiItem {
	id: string;
	userId: string;
	content: string;
	mediaUrls: string[];
	vibeTag?: number;
	checkinLocationId?: string;
	createdAt?: string;
	updatedAt?: string;
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
	userId?: string;
	author: string;
	avatar: string;
	timeAgo: string;
	location: string;
	vibe: string;
	image: string;
	caption: string;
	likes: number;
	comments: number;
	rewardCoins: number;
}

export interface PostCardProps {
	post: SocialPost;
}