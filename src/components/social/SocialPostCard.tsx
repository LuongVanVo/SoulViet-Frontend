import { useState, useRef, type ReactNode } from 'react';
import { Coins, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import type { PostCardProps } from '@/types';
import { useAuthStore } from '@/store';
import { SocialPostActions } from './SocialPostActions';
import { SocialPostHeader } from './SocialPostHeader';
import { ShareModal } from './ShareModal';
import { CommentModal } from '@/features/social/components/comments';

export interface SocialPostCardProps extends PostCardProps {
	footer?: ReactNode;
	onEditPost?: (postId: string) => void;
	onDeletePost?: (postId: string) => void;
	onLikePost?: (postId: string) => void;
	isLiking?: boolean;
}

export const SocialPostCard = ({ post, footer, onEditPost, onDeletePost, onLikePost, isLiking }: SocialPostCardProps) => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const location = useLocation();
	const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

	const [currentIndex, setCurrentIndex] = useState(0);
	const scrollRef = useRef<HTMLDivElement>(null);
	const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
	const [isShareModalOpen, setIsShareModalOpen] = useState(false);

	const mediaItems = post.media && post.media.length > 0
		? post.media
		: (post.images && post.images.length > 0
			? post.images.map(url => ({ url, type: 'image' as const }))
			: (post.image ? [{ url: post.image, type: 'image' as const }] : []));

	const aspectRatioClass = post.aspectRatio === 'vertical'
		? 'aspect-[4/5]'
		: (post.aspectRatio === 'horizontal' ? 'aspect-[16/9]' : 'aspect-square');

	const scroll = (direction: 'left' | 'right') => {
		if (scrollRef.current) {
			const { scrollLeft, clientWidth } = scrollRef.current;
			const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
			scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
		}
	};

	const handleScroll = () => {
		if (scrollRef.current) {
			const { scrollLeft, clientWidth } = scrollRef.current;
			const index = Math.round(scrollLeft / clientWidth);
			setCurrentIndex(index);
		}
	};

	const handleCommentClick = () => {
		if (!isLoggedIn) {
			const redirect = encodeURIComponent(`${location.pathname}${location.search}${location.hash}`);
			navigate(`/login?redirect=${redirect}`);
			return;
		}
		setIsCommentModalOpen(true);
	};

	const handleLikeClick = (postId: string) => {
		if (!isLoggedIn) {
			const redirect = encodeURIComponent(`${location.pathname}${location.search}${location.hash}`);
			navigate(`/login?redirect=${redirect}`);
			return;
		}
		onLikePost?.(postId);
	};

	const handleShareClick = () => {
		if (!isLoggedIn) {
			const redirect = encodeURIComponent(`${location.pathname}${location.search}${location.hash}`);
			navigate(`/login?redirect=${redirect}`);
			return;
		}
		setIsShareModalOpen(true);
	};

	return (
		<article className="overflow-hidden rounded-3xl border border-[#ECEEF1] bg-white shadow-[0_10px_25px_-18px_rgba(15,23,42,0.45)]">
			<SocialPostHeader
				avatar={post.avatar}
				author={post.author}
				timeAgo={post.timeAgo}
				location={post.location}
				vibe={post.vibe ?? ''}
				postId={post.id}
				authorId={post.userId}
				onEdit={onEditPost}
				onDelete={onDeletePost}
				isShared={post.type === 'shared-post'}
			/>

			{mediaItems.length > 0 && (
				<div className="relative group overflow-hidden bg-[#F8FAFC] flex items-center justify-center">
					<div
						ref={scrollRef}
						onScroll={handleScroll}
						className={`flex snap-x snap-mandatory overflow-x-auto scrollbar-hide w-full ${aspectRatioClass}`}
					>
						{mediaItems.map((item, idx) => (
							<div key={idx} className="w-full shrink-0 snap-center relative flex items-center justify-center overflow-hidden">
								{item.type === 'video' ? (
									<video
										src={item.url}
										className="h-full w-full object-contain bg-black"
										controls
										playsInline
									/>
								) : (
									<img
										src={item.url}
										alt={`${post.author} - ${idx + 1}`}
										className="h-full w-full object-contain"
										onError={(e) => {
											(e.target as HTMLImageElement).src = 'https://via.placeholder.com/400?text=Image+Not+Found';
										}}
									/>
								)}
							</div>
						))}
					</div>

					{mediaItems.length > 1 && (
						<>
							<button
								onClick={(e) => { e.preventDefault(); scroll('left'); }}
								className={`absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-1.5 shadow-md backdrop-blur-sm transition-all hover:bg-white z-10 hidden md:flex ${currentIndex === 0 ? 'opacity-0 pointer-events-none' : 'opacity-0 group-hover:opacity-100'}`}
							>
								<ChevronLeft className="h-5 w-5 text-gray-800" />
							</button>
							<button
								onClick={(e) => { e.preventDefault(); scroll('right'); }}
								className={`absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-1.5 shadow-md backdrop-blur-sm transition-all hover:bg-white z-10 hidden md:flex ${currentIndex === mediaItems.length - 1 ? 'opacity-0 pointer-events-none' : 'opacity-0 group-hover:opacity-100'}`}
							>
								<ChevronRight className="h-5 w-5 text-gray-800" />
							</button>

							<div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5 px-2 py-1 transition-opacity z-10">
								{mediaItems.map((_, idx) => (
									<div
										key={idx}
										className={`h-1.5 w-1.5 rounded-full transition-all duration-300 shadow-sm ${idx === currentIndex ? 'bg-blue-600 w-3' : 'bg-gray-300'}`}
									/>
								))}
							</div>
						</>
					)}
				</div>
			)}

			{post.caption && (
				<div className="px-4 py-4">
					<p className="text-[15px] leading-6 text-[#334155] break-words whitespace-pre-wrap">{post.caption}</p>
				</div>
			)}

			<SocialPostActions
				likes={post.likes}
				comments={post.comments}
				shares={post.shares}
				postId={post.id}
				onLike={handleLikeClick}
				isLiking={isLiking}
				isLiked={post.isLiked}
				onComment={handleCommentClick}
				onShare={handleShareClick}
			/>

			<div className="px-4 pb-4">
				<div className="flex items-center gap-2 rounded-full border border-[#E9D57A] bg-[#FFFBE6] px-3 py-2 text-sm text-[#4B5563]">
					<Coins className="h-4 w-4 text-[#F3C700]" />
					<span>
						{t('social.feed.post.rewardPrefix')}{' '}
						<strong>{post.rewardCoins} SoulCoins</strong>{' '}
						{t('social.feed.post.rewardSuffix')}
					</span>
				</div>

				{footer ? <div className="pt-3">{footer}</div> : null}
			</div>

			<CommentModal
				isOpen={isCommentModalOpen}
				onClose={() => setIsCommentModalOpen(false)}
				post={post}
			/>

			<ShareModal
				isOpen={isShareModalOpen}
				onClose={() => setIsShareModalOpen(false)}
				postId={post.id}
				postUrl={`${window.location.origin}/posts/${post.id}`}
			/>
		</article>
	);
};